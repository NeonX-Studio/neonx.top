(() => {
  const cards = document.querySelectorAll('[data-project-card]');
  const filter = document.querySelector('[data-project-filter]');
  if (!filter || !cards.length) return;
  filter.addEventListener('change', () => {
    const value = filter.value;
    cards.forEach((card) => { card.hidden = value !== 'all' && card.dataset.projectStatus !== value; });
  });
})();
