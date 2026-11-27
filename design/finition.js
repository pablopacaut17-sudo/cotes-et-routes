/* Finition (27/11/2026) : la recherche passe avant le compteur sur l'accueil, avec des exemples en un geste ;
   sur téléphone, les réglages (thème, taille du texte, mode nuit) passent dans le panneau « Rubriques ». */
(function () {
  'use strict';
  function $(s, r) { return (r || document).querySelector(s); }
  function lancer(q) {
    var i = ['gq3', 'gq2', 'gq'].map(function (x) { return document.getElementById(x); }).filter(function (x) { return x && x.offsetParent; })[0] || document.getElementById('gq3');
    if (!i) return;
    i.value = q; i.focus();
    i.dispatchEvent(new Event('input', { bubbles: true }));
    i.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }));
    if (i.form && i.form.requestSubmit) try { i.form.requestSubmit(); } catch (e) {}
  }
  function accueil() {
    var hero = $('.hero'), bs = hero && $('.bigsearch', hero), board = hero && $('.board', hero);
    if (!bs || !board || bs.dataset.fin) return;
    bs.dataset.fin = 1;
    var note = bs.nextElementSibling;
    board.parentNode.insertBefore(bs, board);
    var ex = document.createElement('div');
    ex.className = 'fin-ex'; ex.setAttribute('aria-label', 'Exemples de questions');
    ['Durée de vol Paris Tokyo', 'Airbus A350', 'Air France', 'Aéroport de Nice', 'Vol Rio-Paris', 'A380 ou 747 ?'].forEach(function (q) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = q;
      b.onclick = function () { lancer(q); };
      ex.appendChild(b);
    });
    board.parentNode.insertBefore(ex, board);
    if (note && note.classList.contains('note')) note.style.display = 'none';
  }
  function reglages() {
    var p = document.getElementById('v26Panneau');
    if (!p || p.querySelector('.fin-reglages')) return;
    var row = document.createElement('div'); row.className = 'fin-reglages';
    row.innerHTML = '<b>Affichage</b>';
    [['v26Th', '🎨 Thème'], ['v26Am', 'A− Texte'], ['v26Ap', 'A+ Texte'], ['themeBtn', '🌓 Jour / nuit']].forEach(function (x) {
      var o = document.getElementById(x[0]); if (!o) return;
      var b = document.createElement('button'); b.type = 'button'; b.textContent = x[1];
      b.onclick = function () { o.click(); };
      row.appendChild(b);
    });
    var c = document.querySelector('header .hcount');
    if (c) { var a = document.createElement('a'); a.href = '#compteur'; a.style.marginLeft = 'auto'; var n = document.getElementById('hcN'); a.textContent = ((n && n.textContent) || '').trim() + ' données'; a.onclick = function () { var x = p.querySelector('.x button'); if (x) x.click(); }; row.appendChild(a); }
    var x = p.querySelector('.x');
    if (x && x.nextSibling) x.parentNode.insertBefore(row, x.nextSibling); else p.insertBefore(row, p.firstChild);
  }
  function init() {
    accueil();
    document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('#v26Burger')) setTimeout(reglages, 60); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 300); }); else setTimeout(init, 300);
})();
