// Local interactions only. No login, payments, uploads or cvmax API requests.
(() => {
  const notice = () => window.alert('这是首页静态 mock，暂未接入后台服务。');
  const carousels = [];
  document.querySelectorAll('.slick-slider').forEach(slider => {
    const track = slider.querySelector('.slick-track');
    const list = slider.querySelector('.slick-list');
    const slides = [...track.children];
    const originals = slides.filter(e => !e.classList.contains('slick-cloned'));
    let index = 0;
    const before = slides.indexOf(originals[0]);
    function show() {
      const count = innerWidth < 768 ? 1 : innerWidth < 1024 ? 2 : 3;
      const width = list.clientWidth / count;
      slides.forEach(e => {
        e.style.width = `${width}px`;
        const card = e.querySelector('.semi-card');
        if (card) card.style.width = `${Math.max(0, width - 14)}px`;
      });
      track.style.width = `${slides.length * width}px`;
      track.style.transform = `translate3d(-${(before + index) * width}px,0,0)`;
      slider.querySelectorAll('.slick-dots li').forEach((e, i) => e.classList.toggle('slick-active', i === index));
    }
    slider.querySelector('.slick-prev')?.addEventListener('click', () => { index = (index + originals.length - 1) % originals.length; show(); });
    slider.querySelector('.slick-next')?.addEventListener('click', () => { index = (index + 1) % originals.length; show(); });
    slider.querySelectorAll('.slick-dots button').forEach((e, i) => e.addEventListener('click', () => { index = i; show(); }));
    carousels.push(show);
    show();
  });
  document.querySelectorAll('.job-carousel-swiper').forEach(slider => {
    const track = slider.querySelector('.swiper-wrapper');
    const slides = [...track.children];
    const bullets = [...slider.querySelectorAll('.swiper-pagination-bullet-custom')];
    let index = 0;
    function show() {
      const count = innerWidth < 768 ? 1 : innerWidth < 1024 ? 2 : 3;
      const width = (slider.clientWidth - (count - 1) * 24) / count;
      slides.forEach(e => { e.style.width = `${width}px`; e.style.marginRight = '24px'; });
      track.style.transform = `translate3d(-${index * (width + 24)}px,0,0)`;
      bullets.forEach((e, i) => e.classList.toggle('swiper-pagination-bullet-active-custom', i === index));
    }
    bullets.forEach((e, i) => e.addEventListener('click', () => { index = Math.min(i, slides.length - 1); show(); }));
    slider.parentElement.querySelector('.swiper-button-prev-custom')?.addEventListener('click', () => { index = Math.max(0, index - 1); show(); });
    slider.parentElement.querySelector('.swiper-button-next-custom')?.addEventListener('click', () => { index = Math.min(slides.length - 1, index + 1); show(); });
    carousels.push(show);
    show();
  });
  window.addEventListener('resize', () => carousels.forEach(show => show()));
  // Retain the source page's visible controls without navigating to another site.
  document.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (link) {
      const url = new URL(link.getAttribute('href') || '#', location.href);
      if (url.pathname === '/autotest' || url.hostname === 'cvmax.cn') { event.preventDefault(); notice(); }
      return;
    }
    const button = event.target.closest('button');
    if (!button || button.closest('.slick-slider') || /swiper-button/.test(button.className)) return;
    if (button.textContent.trim() === '网申插件') {
      document.querySelector('.ah-section')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    event.preventDefault(); event.stopPropagation(); notice();
  }, true);
  document.querySelectorAll('input[type="file"]').forEach(e => e.disabled = true);
})();
