// Refresh the static copy. Requires playwright; CHROME_PATH optionally selects Chrome.
const { chromium } = require('playwright');
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await page.goto('https://cvmax.cn/', { waitUntil: 'domcontentloaded' });
    await page.getByText('直达Offer!', { exact: true }).waitFor();
    await page.locator('img[src*="homepage1"]').waitFor({ state: 'attached' });
    const cache = new Map();
    const sources = [];
    await fs.mkdir(path.join(root, 'assets', 'reference'), { recursive: true });
    async function asset(url) {
      if (!/^https?:/.test(url)) return url;
      if (cache.has(url)) return cache.get(url);
      const pending = (async () => {
        const response = await page.request.get(url, { timeout: 30000 });
        if (!response.ok()) {
          if (/\.(woff2?|ttf|otf)(\?|$)/i.test(url)) { console.warn(`Unavailable source font: ${url}; retaining original fallback.`); return url; }
          throw new Error(`Asset ${response.status()}: ${url}`);
        }
        const type = response.headers()['content-type'] || '';
        const ext = path.extname(new URL(url).pathname) || (type.includes('svg') ? '.svg' : '.bin');
        const name = crypto.createHash('sha256').update(url).digest('hex').slice(0, 16) + ext;
        let data = await response.body();
        if (type.includes('css') || ext === '.css') data = Buffer.from(await css(data.toString(), url));
        await fs.writeFile(path.join(root, 'assets', 'reference', name), data);
        sources.push({ file: `assets/reference/${name}`, url });
        return `assets/reference/${name}`;
      })();
      cache.set(url, pending);
      return pending;
    }
    async function css(text, base) {
      for (const match of [...text.matchAll(/url\(\s*(["']?)(.*?)\1\s*\)/g)]) {
        if (!match[2] || /^(data:|#)/.test(match[2])) continue;
        const local = await asset(new URL(match[2], base).href);
        text = text.replace(match[0], /^https?:/.test(local) ? 'local("Arial")' : `url("${path.basename(local)}")`);
      }
      return text;
    }
    const state = await page.evaluate(() => ({
      css: [...document.querySelectorAll('link[rel="stylesheet"]')].map(e => e.href),
      images: [...document.images].map(e => e.currentSrc || e.src),
      backgrounds: [...document.querySelectorAll('[style]')].flatMap(e => [...e.style.cssText.matchAll(/url\(["']?(.*?)["']?\)/g)].map(m => new URL(m[1], location.href).href)),
      icons: [...document.querySelectorAll('link[rel*="icon"]')].map(e => e.href)
    }));
    for (const url of [...new Set([...state.css, ...state.images, ...state.backgrounds, ...state.icons])]) await asset(url);
    const mappings = Object.fromEntries(await Promise.all([...cache].map(async ([url, pending]) => [url, await pending])));
    const html = await page.evaluate(mappings => {
      const clone = document.documentElement.cloneNode(true);
      clone.querySelectorAll('script,link[rel="modulepreload"],link[rel="preload"],base').forEach(e => e.remove());
      // Retain the rendered homepage; remove live application scripts and analytics.
      clone.querySelectorAll('*').forEach(e => {
        for (const attribute of [...e.attributes]) if (attribute.name.startsWith('on')) e.removeAttribute(attribute.name);
        for (const name of ['src', 'href', 'poster']) {
          const raw = e.getAttribute(name);
          if (!raw || raw.startsWith('#') || raw.startsWith('data:')) continue;
          const absolute = new URL(raw, location.href).href;
          if (mappings[absolute]) e.setAttribute(name, mappings[absolute]);
          else if (name === 'src') e.setAttribute(name, absolute);
        }
        if (e.tagName === 'IMG') { e.removeAttribute('srcset'); e.loading = 'eager'; }
        if (e.hasAttribute('style')) {
          let style = e.getAttribute('style');
          for (const [url, local] of Object.entries(mappings)) style = style.split(url).join(local);
          e.setAttribute('style', style);
        }
      });
      clone.querySelectorAll('meta[name="google-site-verification"],meta[name="baidu-site-verification"]').forEach(e => e.remove());
      clone.querySelector('link[rel="canonical"]')?.setAttribute('href', 'https://hypercurvature.com/');
      const filing = clone.querySelector('a[href*="beian.miit.gov.cn"]');
      if (filing) filing.textContent = '京ICP备2023015572号-2';
      const script = document.createElement('script');
      script.src = 'mock.js'; script.defer = true;
      clone.querySelector('body').append(script);
      return '<!doctype html>\n' + clone.outerHTML;
    }, mappings);
    await fs.writeFile(path.join(root, 'index.html'), html.split('\n').map(line => line.trimEnd()).join('\n') + '\n');
    await fs.writeFile(path.join(root, 'assets', 'sources.json'), JSON.stringify({ source: 'https://cvmax.cn/', capturedAt: new Date().toISOString(), assets: sources }, null, 2) + '\n');
    console.log(`Captured original homepage with ${sources.length} local assets.`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
