// Palette registry: official Tetris brand colors (brandpalettes.com).
// CSS holds the actual values (see global.css); this file only maps
// palette ids -> piece-color arrays for canvas/confetti/divider scripts,
// applies the saved choice early, and powers the switcher menu.
(function () {
  const PIECES = {
    royal: ['#A855F7', '#C084FC', '#01EDFA', '#53DA3F', '#FFC82E'],
    neon: ['#FD3F59', '#FFC82E', '#53DA3F', '#01EDFA', '#DD0AB2'],
    midnight: ['#485DC5', '#0077D3', '#01EDFA', '#78256F', '#39892F'],
    sunset: ['#FD3F59', '#FE4819', '#FF910C', '#FFC82E', '#FEFB34'],
  };
  const ORDER = ['royal', 'neon', 'midnight', 'sunset'];
  const LABELS = { royal: 'Royal', neon: 'Neon', midnight: 'Midnight', sunset: 'Sunset' };

  function current() {
    try {
      const v = localStorage.getItem('zan-palette');
      if (v && PIECES[v]) return v;
    } catch {}
    return 'royal';
  }
  function apply(id) {
    if (!PIECES[id]) id = 'royal';
    document.documentElement.dataset.pal = id;
    try { localStorage.setItem('zan-palette', id); } catch {}
    document.dispatchEvent(new CustomEvent('zan:pal', { detail: id }));
  }
  window.ZAN = {
    palettes: PIECES,
    order: ORDER,
    labels: LABELS,
    current,
    apply,
    pieces() { return PIECES[current()] || PIECES.royal; },
  };
  // early apply (script loads in <head>): no flash of wrong palette
  document.documentElement.dataset.pal = current();
})();
