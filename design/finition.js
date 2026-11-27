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

  /* Icônes dessinées (même trait partout) à la place des émojis dans les menus, le panneau des rubriques et la barre du bas */
  var IC = {
    actu: '<path d="M4 5h13v14H6a2 2 0 0 1-2-2zM17 9h3v8a2 2 0 0 1-2 2M8 9h5M8 13h5M8 17h3"/>',
    avions: '<path fill="currentColor" stroke="none" d="M12 2c.8 0 1.5.9 1.5 2.2V9l7.5 4.5V16l-7.5-2.2v4.4l2 1.5V21L12 20l-3.5 1v-1.3l2-1.5v-4.4L3 16v-2.5L10.5 9V4.2C10.5 2.9 11.2 2 12 2z"/>',
    aeroports: '<path d="M9 21V11h6v10M6.5 11h11L16 6H8zM12 6V3M4 21h16"/>',
    compagnies: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="7.5" r="1.4"/>',
    trafic: '<path d="M5 20v-7M11 20V5M17 20v-9M3 20h18"/>',
    decouvrir: '<path d="M2 9l10-5 10 5-10 5zM6 11.2V16c3 2.2 9 2.2 12 0v-4.8"/>',
    securite: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
    site: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.4"/>',
    autres: '<path d="M12 5v14M5 12h14"/>',
    accueil: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
    spotting: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    chercher: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>'
  };
  function svg(k) { return '<svg class="fin-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (IC[k] || IC.autres) + '</svg>'; }
  var EMO = /^\s*(?:\p{Extended_Pictographic}|\p{Regional_Indicator})(?:️|‍|\p{Extended_Pictographic})*\s*/u;
  function remplacer(el, k) {
    if (!el || el.dataset.finIc) return;
    var n = el.firstChild;
    if (n && n.nodeType === 3 && EMO.test(n.nodeValue)) { n.nodeValue = n.nodeValue.replace(EMO, ''); el.insertAdjacentHTML('afterbegin', svg(k) + ' '); el.dataset.finIc = 1; }
  }
  function icones() {
    document.querySelectorAll('header nav.v19 > .v19-b').forEach(function (b) { remplacer(b, b.dataset.g || 'autres'); var p = document.getElementById(b.getAttribute('aria-controls')); if (p) remplacer(p.querySelector('h4'), b.dataset.g || 'autres'); });
    var TAB = { '#accueil': 'accueil', '#avions': 'avions', 'spotting/': 'spotting', '#annuaire': 'aeroports', '#recherche': 'chercher' };
    document.querySelectorAll('.cr-tab a').forEach(function (a) { var k = TAB[a.getAttribute('href')], b = a.querySelector('b'); if (k && b && !b.dataset.finIc) { b.innerHTML = svg(k); b.dataset.finIc = 1; } });
    var FAM = {}; (window.CR_FAM || []).forEach(function (f) { FAM[f[2]] = f[0]; });
    document.querySelectorAll('#v26Panneau h3').forEach(function (h) { var t = (h.textContent || '').replace(EMO, '').trim(); var k = FAM[t]; if (k) { var i = h.querySelector('i'); var txt = [].slice.call(h.childNodes).filter(function (x) { return x.nodeType === 3 && EMO.test(x.nodeValue); })[0]; if (txt && !h.dataset.finIc) { txt.nodeValue = txt.nodeValue.replace(EMO, ''); (i || h.firstChild).insertAdjacentHTML(i ? 'afterend' : 'beforebegin', svg(k) + ' '); h.dataset.finIc = 1; } } });
  }

  /* Encart vers l'autre site, en pied de page */
  function voisin() {
    var f = document.querySelector('footer .wrap') || document.querySelector('footer');
    if (!f || document.getElementById('fin-voisin')) return;
    f.insertAdjacentHTML('afterbegin', '<a id="fin-voisin" href="https://pablopacaut17-sudo.github.io/dix-mille-escales/" style="display:flex;gap:14px;align-items:center;margin:0 0 18px;padding:14px 16px;border-radius:16px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.05);text-decoration:none;color:inherit">'
      + '<svg viewBox="0 0 64 64" width="44" height="44" aria-hidden="true" style="flex:none"><rect width="64" height="64" rx="14" fill="#12313B"/><g fill="none" stroke="#EEF3F1" stroke-width="3.2"><circle cx="32" cy="32" r="19"/><path d="M13 32h38M32 13c6 6.1 6 31.9 0 38M32 13c-6 6.1-6 31.9 0 38" stroke-width="2.4"/></g><circle cx="40" cy="22" r="5.4" fill="#F2B705"/></svg>'
      + '<span><b style="display:block;font-size:1.02rem">Découvrez aussi Dix Mille Escales</b><span style="opacity:.8;font-size:.9rem">Le guide de voyage de toutes les villes du monde : que voir, climat, formalités, budget.</span></span></a>');
  }
  function init() {
    accueil();
    voisin();
    icones(); setTimeout(icones, 1500); setTimeout(icones, 4000);
    var bg = document.getElementById('v26Burger'); if (bg && window.innerWidth <= 400) bg.textContent = '☰ Menu';
    var pb = document.querySelector('header .cr-palbtn span'); if (pb) pb.textContent = ' Chercher un avion, une compagnie, un aéroport…';
    var tb = document.getElementById('themeBtn'); if (tb) tb.title = 'Jour / nuit';
    document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('#v26Burger')) setTimeout(function () { reglages(); icones(); }, 60); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 300); }); else setTimeout(init, 300);
})();
