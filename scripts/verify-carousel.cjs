// Run after starting the local server. Requires playwright.
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  try {
    const page = await browser.newPage();
    await page.goto(process.env.PREVIEW_URL || 'http://127.0.0.1:8080/');
    for (const width of [1192, 1440, 1920]) {
      await page.setViewportSize({ width, height: 1000 });
      const state = await page.locator('.job-carousel-swiper').evaluate(slider => {
        const viewport = slider.getBoundingClientRect();
        const visible = [...slider.querySelectorAll('.swiper-slide')].filter(slide => {
          const bounds = slide.getBoundingClientRect();
          return bounds.left >= viewport.left - 1 && bounds.right <= viewport.right + 1;
        });
        return { pages: visible.length, cards: visible.flatMap(slide => [...slide.firstElementChild.children].map(card => card.getBoundingClientRect().width)) };
      });
      assert.equal(state.pages, 1, `One visible page at ${width}px`);
      assert.equal(state.cards.length, 3, `Three visible cards at ${width}px`);
      assert.ok(state.cards.every(value => value >= 300), `Readable card widths at ${width}px`);
    }
    const wrapper = page.locator('.job-carousel-swiper .swiper-wrapper');
    const before = await wrapper.getAttribute('style');
    await page.locator('.swiper-pagination-bullet-custom').nth(1).click();
    assert.notEqual(await wrapper.getAttribute('style'), before, 'Pagination moves the page');
    console.log('Job carousel: three readable cards per page; resizing and pagination passed.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
