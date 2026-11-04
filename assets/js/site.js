(() => {
  const pages = Array.from(document.querySelectorAll('[data-page]'));
  const pageIds = new Set(pages.map((page) => page.id));
  const navLinks = document.querySelectorAll('.nav a');

  function showPage(focusHeading = false) {
    if (!pages.length) return;
    const requested = location.hash.slice(1);
    const current = pageIds.has(requested) ? requested : 'home';
    pages.forEach((page) => { page.hidden = page.id !== current; });
    navLinks.forEach((link) => {
      if (link.getAttribute('href') === `#${current}`) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    const activePage = document.getElementById(current);
    const heading = activePage?.querySelector('h1');
    if (heading) {
      document.title = current === 'home'
        ? 'NeonX Studio | Shape the Future of AI and Games'
        : `${heading.textContent.replace(/\s+/g, '')} | NeonX Studio`;
      if (focusHeading) heading.focus({ preventScroll: true });
    }
    window.dispatchEvent(new CustomEvent('neonx:route', { detail: { current } }));
    window.scrollTo(0, 0);
  }

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const id = link.getAttribute('href').slice(1);
    if (!pageIds.has(id)) return;
    event.preventDefault();
    if (location.hash !== `#${id}`) history.pushState(null, '', `#${id}`);
    showPage(true);
  });

  window.addEventListener('popstate', () => showPage(true));
  window.addEventListener('hashchange', () => showPage(true));
  document.documentElement.classList.add('js-ready');
  showPage();
})();
