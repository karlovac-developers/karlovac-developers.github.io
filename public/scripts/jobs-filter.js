/* Job wall filter: shows postings of one kind. Uses its own data-jobs-*
   attributes so blog-filter.js never binds to it. Without this script,
   every posting shows and the filter stays hidden. */
(function () {
  var bar = document.querySelector('[data-jobs-filter-bar]');
  var list = document.querySelector('[data-jobs-list]');
  var count = document.querySelector('[data-jobs-count]');
  if (!bar || !list) return;
  var buttons = bar.querySelectorAll('[data-jobs-filter]');
  var cards = list.querySelectorAll('[data-jobs-kind]');
  bar.hidden = false;

  function apply(kind) {
    var shown = 0;
    cards.forEach(function (card) {
      var match = kind === 'all' || card.getAttribute('data-jobs-kind') === kind;
      card.hidden = !match;
      if (match) shown++;
    });
    buttons.forEach(function (b) {
      var on = b.getAttribute('data-jobs-filter') === kind;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    if (count) {
      count.textContent = shown === 1
        ? count.getAttribute('data-count-one')
        : count.getAttribute('data-count-many').replace('{n}', String(shown));
    }
  }

  buttons.forEach(function (b) {
    b.addEventListener('click', function () { apply(b.getAttribute('data-jobs-filter')); });
  });
})();
