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
    chercher: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    livre: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 21V5M8 7h7"/>',
    question: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17v.4"/>',
    balance: '<path d="M12 4v16M7 20h10M5 7h14M5 7l-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z"/>',
    batiment: '<path d="M4 21V8l8-5 8 5v13M9 21v-5h6v5M8 10h1M15 10h1M8 13h1M15 13h1M2 21h20"/>',
    partager: '<path d="M12 15V3M7.5 7.5L12 3l4.5 4.5M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>',
    carte: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
    lieu: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    radar: '<path d="M4.9 19.1a10 10 0 0 1 0-14.2M19.1 4.9a10 10 0 0 1 0 14.2M8.5 15.5a5 5 0 0 1 0-7M15.5 8.5a5 5 0 0 1 0 7"/><circle cx="12" cy="12" r="1.5"/>',
    horloge: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/>',
    trophee: '<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4a3 3 0 0 0 4 4M16 6h4a3 3 0 0 1-4 4M12 13v4M8 21h8M9 17h6v4H9z"/>',
    etoile: '<path d="M12 3l2.7 5.6 6.1.8-4.4 4.3 1 6.1L12 17l-5.4 2.8 1-6.1-4.4-4.3 6.1-.8z"/>',
    video: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M10 9l5 3-5 3z"/>',
    nouveau: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18"/>',
    meteo: '<path d="M7 18a4 4 0 0 1-.5-8A6 6 0 0 1 18 9a4.5 4.5 0 0 1-.5 9z"/>',
    reglages: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9L7 7M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
    courrier: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    helico: '<path d="M3 4h18M12 4v4M5 12a5 4 0 0 1 5-4h4a3 3 0 0 1 3 3v2H8a3 3 0 0 1-3-1zM17 11h4M8 16l-1 3h10M12 16v3"/>',
    argent: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5A4 4 0 1 0 15.5 15.5M7 11h6M7 13.5h6"/>',
    personne: '<circle cx="12" cy="7.5" r="3.5"/><path d="M5 21a7 7 0 0 1 14 0"/>',
    valise: '<rect x="4" y="7" width="16" height="13" rx="2"/><path d="M9 7V4h6v3M9 11v5M15 11v5"/>',
    ballon: '<path d="M12 15c-3.5-1-6-4-6-7.5a6 6 0 0 1 12 0c0 3.5-2.5 6.5-6 7.5zM10 17h4l-.5 3h-3z"/>',
    bougie: '<path d="M9 21V10h6v11M7 21h10M12 10V8M12 3c1.3 1.3 1.3 3 0 4-1.3-1-1.3-2.7 0-4z"/>',
    danger: '<path d="M12 3l10 18H2zM12 10v5M12 18v.4"/>',
    calendrier: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    boucle: '<path d="M17 2l3 3-3 3M3 11V9a4 4 0 0 1 4-4h13M7 22l-3-3 3-3M21 13v2a4 4 0 0 1-4 4H4"/>',
    regle: '<path d="M3 17L17 3l4 4L7 21zM7 13l2 2M10 10l2 2M13 7l2 2"/>',
    mobile: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
    boite: '<path d="M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10"/>',
    idee: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
    lien: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    palette: '<path d="M12 3a9 9 0 0 0 0 18c1.4 0 2-1 1.5-2.2-.5-1.3.4-2.8 2-2.8H18a3 3 0 0 0 3-3c0-5.5-4-10-9-10z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>'
  };
  /* Correspondance émoji -> icône dessinée, pour tout le reste du site (listes de rubriques, cartes, boutons) */
  var EMAP = {};
  [['livre', '📖📚📒📘📜📑📋🗂️🗃️📁'], ['question', '❓'], ['balance', '⚖️🆚'], ['batiment', '🏭🏢🏗️🏛️🏟️'], ['partager', '📤'], ['lien', '🔗'],
   ['carte', '🗺️'], ['globe', '🌍🌐🌎🌏'], ['lieu', '📍🧭'], ['avions', '✈️🛫🛬🛩️🪽🚀🐋'], ['radar', '📡🛰️📻'], ['site', 'ℹ️'], ['idee', '💡'],
   ['horloge', '⏱️🕰️🕒🕑⏳⌛'], ['trophee', '🏆🏅🎖️🎯'], ['etoile', '⭐'], ['trafic', '📊📈📉'], ['video', '🎬'], ['nouveau', '🆕✨'],
   ['chercher', '🔎🔍👀👁️🔬'], ['meteo', '🌦️⛈️☀️🌱'], ['actu', '📰'], ['reglages', '⚙️🔧🧪🩺🤖⌨️🧬🧠'], ['decouvrir', '🎓'], ['courrier', '✉️'],
   ['helico', '🚁'], ['argent', '💶⛽'], ['personne', '🧑‍🚀👩‍✈️🧑‍✈️🪪'], ['valise', '🧳🏖️🏜️'], ['ballon', '🪂🎈🎪'], ['bougie', '🕯️'],
   ['danger', '⚠️🚨'], ['securite', '🛡️'], ['spotting', '📸📷'], ['calendrier', '📅🗓️📆'], ['boucle', '🔁🎲'], ['regle', '📐🔤'], ['mobile', '📲📴'],
   ['boite', '📦'], ['compagnies', '🏷️'], ['trafic', '🔥'], ['palette', '🎨'], ['accueil', '🏠']].forEach(function (g) {
    (g[1].match(/(?:\p{Extended_Pictographic})(?:\uFE0F|\u200D\p{Extended_Pictographic}\uFE0F?)*/gu) || []).forEach(function (e) { EMAP[e.replace(/\uFE0F/g, '')] = g[0]; });
  });
  var EMG = /(?:\p{Extended_Pictographic})(?:\uFE0F|\u200D\p{Extended_Pictographic}\uFE0F?)*/gu;
  function partout(racine) {
    var tw = document.createTreeWalker(racine || document.body, NodeFilter.SHOW_TEXT, { acceptNode: function (n) {
      var p = n.parentElement; if (!p || p.closest('script,style,option,textarea,input,select,svg,[contenteditable],#langue-menu,.no-ic')) return NodeFilter.FILTER_REJECT;
      EMG.lastIndex = 0; return EMG.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP; } });
    var L = [], n; while ((n = tw.nextNode())) L.push(n);
    L.forEach(function (n) {
      var t = n.nodeValue, html = '', i = 0, m, ok = false; EMG.lastIndex = 0;
      while ((m = EMG.exec(t))) { var k = EMAP[m[0].replace(/\uFE0F/g, '')]; if (!k) continue; ok = true;
        html += esc(t.slice(i, m.index)) + svg(k); i = m.index + m[0].length; }
      if (!ok) return;
      html += esc(t.slice(i)); var sp = document.createElement('span'); sp.className = 'fin-icw'; sp.innerHTML = html;
      var p = n.parentNode; while (sp.firstChild) p.insertBefore(sp.firstChild, n); p.removeChild(n);
    });
  }
  function esc(x) { return x.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  var attente = null;
  function surveiller() {
    try { new MutationObserver(function () { if (attente) return; attente = setTimeout(function () { attente = null; partout(); }, 350); }).observe(document.body, { childList: true, subtree: true, characterData: true }); } catch (e) {}
  }
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

  /* Liens entre les deux sites :
     - adresse directe d'un aéroport (#aeroport=CDG, utilisée par Dix Mille Escales) : ouvre la fiche de l'aéroport ;
     - sur la fiche d'un aéroport : « Visiter <ville> sur Dix Mille Escales » (ville la plus proche, liste fabriquée par l'autre site). */
  var DME = 'https://pablopacaut17-sudo.github.io/dix-mille-escales/', liensDME = null;
  function lienDirect() {
    var m = /^#aeroport[=\/](?:c=)?([A-Za-z0-9]{3,4})$/.exec(location.hash || '');
    if (!m) return;
    var code = m[1].toUpperCase();
    try { history.replaceState(null, '', '#aeroport'); } catch (e) {}
    if (location.hash !== '#aeroport') location.hash = '#aeroport'; else window.dispatchEvent(new HashChangeEvent('hashchange'));
    var essais = 0, t = setInterval(function () {
      var a = document.getElementById('apA'), g = document.getElementById('apGo');
      if (a && g && (++essais > 3)) { clearInterval(t); a.value = code; a.dispatchEvent(new Event('change', { bubbles: true })); g.click(); }
      else if (essais > 60) clearInterval(t);
      else if (!a || !g) essais++;
    }, 250);
  }
  function versDME() {
    var r = document.getElementById('apRes'); if (!r) return;
    var h = r.querySelector('h3'); if (!h || r.querySelector('.fin-dme')) return;
    var code = String((document.getElementById('apA') || {}).value || '').trim().toUpperCase();
    var m = /\b([A-Z]{3})\b/.exec(code + ' ' + (h.textContent || ''));
    if (!m) return;
    (liensDME || (liensDME = fetch(DME + 'liens-aeroports.json').then(function (x) { return x.ok ? x.json() : {}; }).catch(function () { return {}; }))).then(function (L) {
      var v = L[m[1]]; if (!v || r.querySelector('.fin-dme')) return;
      h.insertAdjacentHTML('afterend', '<a class="fin-dme" href="' + DME + 'villes/' + encodeURIComponent(v[0]) + '/">' + svg('globe') + ' Visiter ' + esc(v[1]) + ' sur Dix Mille Escales : que voir, climat, budget</a>');
    });
  }

  /* Nouvelles lignes et lignes arrêtées (robot du dépôt des vols : dernière semaine contre les 60 jours d'avant) */
  function nouvellesLignes() {
    var sec = document.querySelector('section[data-view="lignesobs"]');
    if (!sec || document.getElementById('fin-nl') || !/lignesobs/.test(location.hash)) return;
    var box = document.createElement('div'); box.id = 'fin-nl'; box.className = 'fin-nl';
    var h2 = sec.querySelector('h2'), bloc = h2; while (bloc && bloc.parentNode !== sec) bloc = bloc.parentNode; if (bloc) bloc.insertAdjacentElement('afterend', box); else sec.insertBefore(box, sec.firstChild);
    Promise.all([fetch('data/vols/nouvelles-lignes.json').then(function (r) { return r.ok ? r.json() : null; }), fetch('data/airports.json').then(function (r) { return r.json(); }).catch(function () { return {}; })]).then(function (x) {
      var d = x[0], A = {}; ((x[1] || {}).airports || []).forEach(function (a) { A[a[0]] = a[3] || a[2]; });
      if (!d) { box.remove(); return; }
      function nom(c) { return esc((A[c] || c) + ' (' + c + ')'); }
      function li(l, n) { return '<li><b>' + nom(l.depart) + ' → ' + nom(l.arrivee) + '</b><span>' + n + (l.compagnies.length ? ' · ' + esc(l.compagnies.join(', ')) : '') + '</span></li>'; }
      var t = '<h3>' + svg('nouveau') + ' Nouvelles lignes de la semaine</h3>';
      if (!d.pret) {
        var f = new Date((d.periode_avant[0] || d.periode_recente[0] || '') + 'T12:00:00Z'); if (isNaN(f)) f = new Date(); f.setDate(f.getDate() + 28);
        t += '<p>Le robot compare chaque jour la dernière semaine de vols observés aux 60 jours d’avant. Il lui faut 4 semaines d’historique : premiers résultats vers le ' + f.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) + ' (' + d.jours_observes + ' jour(s) enregistré(s) pour l’instant).</p>';
      } else {
        t += d.nouvelles.length ? '<ul>' + d.nouvelles.slice(0, 15).map(function (l) { return li(l, l.vols + ' vol(s) en ' + l.jours + ' jours'); }).join('') + '</ul>' : '<p>Aucune nouvelle ligne repérée cette semaine.</p>';
        t += '<h3>' + svg('danger') + ' Lignes qui ne sont plus volées</h3>';
        t += d.arretees.length ? '<ul>' + d.arretees.slice(0, 10).map(function (l) { return li(l, 'plus aucun vol depuis 10 jours'); }).join('') + '</ul>' : '<p>Aucune ligne régulière interrompue.</p>';
        t += '<p class="fin-nl-n">Vols de compagnies observés par le réseau ADSB.lol (ODbL), du ' + esc(d.periode_avant[0]) + ' au ' + esc(d.maj) + '. Une ligne n’est signalée que si les deux aéroports sont bien couverts par les antennes.</p>';
      }
      box.innerHTML = t;
    }).catch(function () { box.remove(); });
  }
  function init() {
    accueil();
    voisin();
    icones(); setTimeout(icones, 1500); setTimeout(icones, 4000);
    partout(); surveiller();
    lienDirect(); window.addEventListener('hashchange', lienDirect); setInterval(versDME, 1200); setInterval(nouvellesLignes, 1500);
    var bg = document.getElementById('v26Burger'); if (bg && window.innerWidth <= 400) bg.textContent = '☰ Menu';
    var pb = document.querySelector('header .cr-palbtn span'); if (pb) pb.textContent = ' Chercher un avion, une compagnie, un aéroport…';
    var tb = document.getElementById('themeBtn'); if (tb) tb.title = 'Jour / nuit';
    document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('#v26Burger')) setTimeout(function () { reglages(); icones(); }, 60); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 300); }); else setTimeout(init, 300);
})();
