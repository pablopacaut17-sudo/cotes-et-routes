/* Cotes & Routes – design v5 : recherche partout, lexique géant, centaines de graphiques en plus, finitions */
(function () {
  'use strict';
  var $ = function (i) { return document.getElementById(i); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function norm(s) { return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function fr(n, d) { return Number(n).toLocaleString('fr-FR', { maximumFractionDigits: d || 0 }); }
  function getJ(u) { return fetch(u).then(function (r) { if (!r.ok) throw 0; return r.json(); }); }
  function getT(u) { return fetch(u).then(function (r) { if (!r.ok) throw 0; return r.text(); }); }
  var hasAV = function () { try { return Array.isArray(AV); } catch (e) { return false; } };
  var hasGL = function () { try { return Array.isArray(GL); } catch (e) { return false; } };
  var alx = function (k) { try { return ALX[k]; } catch (e) { return null; } };
  var pays = (function () { try { var d = new Intl.DisplayNames(['fr'], { type: 'region' }); return function (c) { try { return d.of(c) || c; } catch (e) { return c; } }; } catch (e) { return function (c) { return c; }; } })();
  function aller(v) { try { go(v); } catch (e) { location.hash = '#' + v; } }

  /* ---------- barre de progression de lecture ---------- */
  var pb = document.createElement('div'); pb.className = 'cr-prog'; document.body.appendChild(pb);
  window.addEventListener('scroll', function () { var h = document.documentElement.scrollHeight - innerHeight; pb.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, scrollY / h) : 0) + ')'; }, { passive: true });

  /* ---------- lexique : 273 termes en plus, lettres, compteur ---------- */
  var lexP = null;
  function lexique() {
    if (!lexP) lexP = getT('design/lexique.txt').then(function (t) {
      if (!hasGL()) return;
      var vu = {}; GL.forEach(function (g) { vu[norm(g[0])] = 1; });
      t.split('\n').forEach(function (l) { var i = l.indexOf('|'); if (i > 0) { var k = l.slice(0, i).trim(); if (!vu[norm(k)]) { vu[norm(k)] = 1; GL.push([k, l.slice(i + 1).trim()]); } } });
      GL.sort(function (a, b) { return norm(a[0]).localeCompare(norm(b[0])); });
    }).catch(function () {});
    return lexP;
  }
  var lettre = '';
  function rendreLex() {
    var box = $('glossary'), q = $('lxQ'); if (!box || !q || !hasGL()) return;
    var mots = norm(q.value).split(/\s+/).filter(Boolean);
    var r = GL.filter(function (g) { var t = norm(g[0] + ' ' + g[1]); return (!lettre || norm(g[0]).charAt(0) === lettre) && mots.every(function (m) { return t.indexOf(m) >= 0; }); });
    box.innerHTML = r.length ? r.map(function (g) { return '<div><b>' + esc(g[0]) + '</b><br>' + esc(g[1]) + '</div>'; }).join('') : '<div>Aucun terme ne correspond. Effacez la recherche.</div>';
    var c = $('crLxN'); if (c) c.innerHTML = '<b>' + fr(r.length) + '</b> terme' + (r.length > 1 ? 's' : '') + (r.length < GL.length ? ' sur ' + fr(GL.length) : ' dans le lexique');
  }
  function vueLexique() {
    var q = $('lxQ'); if (!q || q.dataset.v5) return; q.dataset.v5 = 1;
    lexique().then(function () {
      if (!hasGL()) return;
      var L = {}; GL.forEach(function (g) { L[norm(g[0]).charAt(0).toUpperCase()] = 1; });
      var bar = document.createElement('div'); bar.className = 'cr-lettres';
      bar.innerHTML = '<span id="crLxN"></span><button class="on" data-l="">Tout</button>' + Object.keys(L).filter(function (x) { return /[A-Z0-9]/.test(x); }).sort().map(function (x) { return '<button data-l="' + x.toLowerCase() + '">' + x + '</button>'; }).join('');
      q.closest('.controls').after(bar);
      bar.onclick = function (e) { var b = e.target.closest('button'); if (!b) return; lettre = b.dataset.l; bar.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); }); rendreLex(); };
      q.addEventListener('input', function () { setTimeout(rendreLex, 0); });
      rendreLex();
    });
  }

  /* ---------- accueil : « Le saviez-vous ? » ---------- */
  function saviez() {
    if ($('crSav') || !hasGL()) return;
    var ref = $('crStrip') || document.querySelector('section[data-view="accueil"] .toc'); if (!ref) return;
    var d = document.createElement('div'); d.className = 'cr-sav'; d.id = 'crSav';
    d.innerHTML = '<span class="cr-savt">💡 Le saviez-vous ?</span><div id="crSavX"></div><button type="button" class="cr-savn" aria-label="Autre information">↻</button>';
    ref.parentNode.insertBefore(d, ref.id === 'crStrip' ? ref.nextSibling : ref);
    function faits() {
      var f = GL.map(function (g) { return '<b>' + esc(g[0]) + '</b> : ' + esc(g[1]); });
      if (hasAV()) AV.forEach(function (a) { if (a.rg && a.max) f.push('Le <b>' + esc(avL(a)) + '</b> emporte jusqu’à ' + fr(a.max) + ' passagers et franchit ' + fr(a.rg) + ' km' + (a.eis ? ' ; mise en service : ' + esc(a.eis) : '') + '.'); });
      return f;
    }
    var F = faits(), t;
    function suivant() { var x = $('crSavX'); if (!x) return; x.classList.remove('in'); void x.offsetWidth; x.innerHTML = F[Math.floor(Math.random() * F.length)]; x.classList.add('in'); }
    d.querySelector('.cr-savn').onclick = function () { clearInterval(t); suivant(); t = setInterval(suivant, 9000); };
    lexique().then(function () { F = faits(); suivant(); t = setInterval(suivant, 9000); });
  }

  /* ---------- recherche partout (Ctrl+K ou /) ---------- */
  var AP = null, apP = null;
  function aeroports() { if (!apP) apP = getJ('data/airports.json').then(function (j) { AP = j.airports || []; }).catch(function () { AP = []; }); return apP; }
  var pal = null, sel = 0, res = [];
  var FWP = null;
  function palette() {
    if (!FWP && window.CR_RECH) window.CR_RECH.index().then(function (l) { FWP = l || []; if (pal && !pal.hidden && pal.querySelector('input').value) chercher(); });
    if (pal) { pal.hidden = false; pal.querySelector('input').focus(); return; }
    pal = document.createElement('div'); pal.className = 'cr-pal'; pal.setAttribute('role', 'dialog'); pal.setAttribute('aria-label', 'Chercher partout');
    pal.innerHTML = '<div class="cr-palb"><div class="cr-palh"><span>🔎</span><input type="search" placeholder="Avion, compagnie, aéroport, terme, rubrique…" aria-label="Chercher partout"><button type="button" aria-label="Fermer">Échap</button></div><div class="cr-palr"></div><div class="cr-pald" hidden></div><p class="cr-palf">↑ ↓ pour choisir · Entrée pour ouvrir · Ctrl+K ou / pour revenir ici</p></div>';
    document.body.appendChild(pal);
    var inp = pal.querySelector('input');
    pal.onclick = function (e) { if (e.target === pal || e.target.closest('.cr-palh button')) fermer(); var r = e.target.closest('.cr-pr'); if (r) ouvrir(res[+r.dataset.i]); };
    inp.oninput = chercher;
    inp.onkeydown = function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(0, Math.min(res.length - 1, sel + (e.key === 'ArrowDown' ? 1 : -1))); marquer(); }
      else if (e.key === 'Enter' && res[sel]) ouvrir(res[sel]);
    };
    aeroports().then(function () { if (inp.value) chercher(); });
    lexique(); inp.focus(); chercher();
  }
  function fermer() { if (pal) pal.hidden = true; }
  function marquer() { pal.querySelectorAll('.cr-pr').forEach(function (r, i) { r.classList.toggle('sel', i === sel); if (i === sel && r.scrollIntoView) r.scrollIntoView({ block: 'nearest' }); }); }
  function chercher() {
    var q = norm(pal.querySelector('input').value).trim(), mots = q.split(/\s+/).filter(Boolean), out = [];
    pal.querySelector('.cr-pald').hidden = true;
    var ok = function (t) { t = norm(t); return mots.every(function (m) { return t.indexOf(m) >= 0; }); };
    var add = function (g, ic, t, s, f, max) { var n = out.filter(function (x) { return x.g === g; }).length; if (n < (max || 6)) out.push({ g: g, ic: ic, t: t, s: s, f: f }); };
    document.querySelectorAll('section[data-view]').forEach(function (s) { var h = s.querySelector('h2'); if (!h) return; var t = h.textContent.trim(); if (!q || ok(t + ' ' + s.dataset.view)) add('Rubriques', '📂', t, '#' + s.dataset.view, function () { aller(s.dataset.view); }, q ? 6 : 40); });
    if (q) {
      if (hasAV()) AV.forEach(function (a) { if (ok(a.n + ' ' + a.c + ' ' + a.id + ' ' + (a.cat || '') + ' ' + (a.eng || ''))) add('Avions', '✈️', avL(a), (a.cat || '') + (a.max ? ' · ' + a.max + ' places' : '') + (a.rg ? ' · ' + fr(a.rg) + ' km' : ''), function () { aller('avions'); setTimeout(function () { try { openSheet(a.id); var s = $('avSheet'); if (s) s.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {} }, 120); }); });
      try { Object.keys(ALX).forEach(function (k) { var x = ALX[k]; if (ok(k + ' ' + x.join(' '))) add('Compagnies', '🏷️', x[0], k + (x[1] ? ' / ' + x[1] : '') + ' · ' + x[3], function () { detail('<h3>' + esc(x[0]) + '</h3><dl><dt>Code OACI</dt><dd>' + k + '</dd><dt>Code IATA</dt><dd>' + (esc(x[1]) || '—') + '</dd><dt>Indicatif radio</dt><dd>' + (esc(x[2]) || '—') + '</dd><dt>Pays</dt><dd>' + esc(x[3]) + '</dd></dl>'); }); }); } catch (e) {}
      (AP || []).forEach(function (a) { if (ok(a[0] + ' ' + a[1] + ' ' + a[2] + ' ' + a[3] + ' ' + pays(a[4]))) add('Aéroports', '🛫', a[2], (a[0] || '') + ' / ' + a[1] + ' · ' + a[3] + ', ' + pays(a[4]), function () { detailAp(a); }); });
      if (hasGL()) GL.forEach(function (g) { if (ok(g[0] + ' ' + g[1])) add('Lexique', '📖', g[0], g[1].slice(0, 90) + (g[1].length > 90 ? '…' : ''), function () { detail('<h3>' + esc(g[0]) + '</h3><p>' + esc(g[1]) + '</p><button class="cr-btn" type="button" id="crPalLx">Ouvrir le lexique</button>'); $('crPalLx').onclick = function () { fermer(); aller('lexique'); setTimeout(function () { var i = $('lxQ'); if (i) { i.value = g[0]; i.dispatchEvent(new Event('input')); } }, 150); }; }); });
      // Grandes fiches (des milliers, tirées de Wikipédia : compagnies, aéroports, avions, constructeurs, accidents)
      if (window.CR_RECH && FWP) { var CF = { avion: '✈️', compagnie: '🏷️', aeroport: '🛫', constructeur: '🏭', accident: '🕯️' };
        FWP.forEach(function (x) { if (ok(x[0] + ' ' + (x[1] || []).join(' ') + ' ' + (x[2] || []).join(' '))) add('Grandes fiches', CF[x[4]] || '📘', x[0], 'Fiche de 30 à 45 lignes (Wikipédia)', function () { detail('<p class="note">Chargement de la fiche…</p>'); window.CR_RECH.cartePour(x).then(function (h) { detail(h || '<p class="note">Fiche indisponible.</p>'); }); }); }); }
      if (window.CR_CHAPITRES) window.CR_CHAPITRES.forEach(function (c) { c.fiches.forEach(function (f) { if (ok(f.t + ' ' + f.x)) add('Comment vole un avion', '🎓', f.t, c.titre, function () { fermer(); aller('comprendre'); setTimeout(function () { var i = $('crCpQ'); if (i) { i.value = f.t; i.dispatchEvent(new Event('input')); } }, 400); }); }); });
    }
    if (q.length >= 3 && window.CR_RECH) { var qq = pal.querySelector('input').value.trim(); out.push({ g: 'Toute l’encyclopédie', ic: '💬', t: 'Poser la question : « ' + qq + ' »', s: 'Recherche complète, fiches, accidents, distances, et l’IA si besoin', f: function () { fermer(); aller('recherche'); setTimeout(function () { window.CR_RECH.lancer(qq); }, 250); } }); }
    res = out; sel = 0; var g0 = '';
    pal.querySelector('.cr-palr').innerHTML = out.length ? out.map(function (r, i) { var h = r.g !== g0 ? '<div class="cr-pg">' + r.g + '</div>' : ''; g0 = r.g; return h + '<button type="button" class="cr-pr' + (i ? '' : ' sel') + '" data-i="' + i + '"><span>' + r.ic + '</span><span><b>' + esc(r.t) + '</b><small>' + esc(r.s) + '</small></span></button>'; }).join('') : '<p class="note">Aucun résultat' + (AP ? '' : ' (aéroports en cours de chargement…)') + '.</p>';
  }
  function ouvrir(r) { if (!r) return; var d = pal.querySelector('.cr-pald'); d.hidden = true; r.f(); if (d.hidden) fermer(); }
  function detail(h) { var d = pal.querySelector('.cr-pald'); d.innerHTML = '<button type="button" class="cr-palx">← Résultats</button>' + h; d.hidden = false; d.querySelector('.cr-palx').onclick = function () { d.hidden = true; }; d.scrollIntoView({ block: 'nearest' }); }
  function detailAp(a) {
    var p = (a[11] || []).slice().sort(function (x, y) { return (y[1] || 0) - (x[1] || 0); });
    detail('<h3>' + esc(a[2]) + '</h3><dl><dt>Ville</dt><dd>' + esc(a[3]) + ', ' + esc(pays(a[4])) + '</dd><dt>Codes</dt><dd>' + (a[0] || '—') + ' (IATA) · ' + a[1] + ' (OACI)</dd><dt>Altitude</dt><dd>' + fr(a[9] || 0) + ' m</dd><dt>Taille</dt><dd>' + ['Petit', 'Moyen', 'Grand'][a[10]] + ' aéroport</dd><dt>Pistes</dt><dd>' + (p.length ? p.map(function (x) { return esc(x[0]) + (x[1] ? ' : ' + fr(x[1]) + ' m' : ''); }).join('<br>') : '—') + '</dd><dt>Fréquences</dt><dd>' + ((a[12] || []).slice(0, 6).map(function (f) { return esc(f[0]) + ' ' + f[1]; }).join(' · ') || '—') + '</dd></dl>' +
      '<p><a href="https://www.openstreetmap.org/?mlat=' + a[7] + '&mlon=' + a[8] + '#map=13/' + a[7] + '/' + a[8] + '" target="_blank" rel="noopener">Voir sur la carte ↗</a>' + (a[13] ? ' · <a href="https://en.wikipedia.org/wiki/' + encodeURIComponent(a[13]) + '" target="_blank" rel="noopener">Wikipédia ↗</a>' : '') + '</p>');
  }
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); palette(); }
    else if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || '')) { e.preventDefault(); palette(); }
    else if (e.key === 'Escape') fermer();
  });
  var bt = document.createElement('button'); bt.type = 'button'; bt.className = 'cr-palbtn'; bt.innerHTML = '🔎<span> Chercher partout</span>'; bt.setAttribute('aria-label', 'Chercher partout'); bt.onclick = palette;
  var th = document.querySelector('header .theme, header button'); if (th) th.parentNode.insertBefore(bt, th); else document.body.appendChild(bt);

  /* ---------- encore des centaines de graphiques ---------- */
  var chP = null, fait = false, PAL = ['#FFC72C', '#1B6FD1', '#E36BB7', '#2E9D62', '#F2853A', '#7A5AE0', '#22A7B5', '#C2187A', '#B5C334', '#5B6B7A', '#E0B04A', '#8C9AA8'];
  function chart() { if (window.Chart) return Promise.resolve(); if (!chP) chP = new Promise(function (ok, ko) { var s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.js'; s.onload = ok; s.onerror = ko; document.head.appendChild(s); }); return chP; }
  function G(cv, o) {
    var dark = document.documentElement.dataset.theme === 'dark' || (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme:dark)').matches);
    Chart.defaults.color = dark ? '#9AABBB' : '#4C6075'; Chart.defaults.borderColor = dark ? '#263A4C' : '#D5DEE6'; Chart.defaults.font.family = 'Overpass, Arial, sans-serif';
    var d = o.data, tot = o.type === 'scatter' ? 1 : d.reduce(function (a, b) { return a + b; }, 0), u = o.u || '', pct = o.pct !== false && o.type !== 'line' && o.type !== 'scatter';
    var ds = o.type === 'scatter' ? [{ data: d, backgroundColor: 'rgba(27,111,209,.65)', pointRadius: 4 }] : [{ data: d, backgroundColor: o.type === 'doughnut' ? PAL : (o.col || PAL[o.h ? 1 : 0]), borderColor: PAL[0], borderWidth: o.type === 'line' ? 3 : 0, fill: false, tension: .3, borderRadius: o.type === 'bar' ? 5 : 0 }];
    return new Chart(cv, { type: o.type, data: { labels: o.labels, datasets: ds },
      options: { responsive: true, maintainAspectRatio: false, indexAxis: o.h ? 'y' : 'x', animation: { duration: 400 },
        plugins: { legend: { display: o.type === 'doughnut', position: 'bottom', labels: { boxWidth: 10, padding: 6, font: { size: 10 }, generateLabels: function (c) { return Chart.overrides.doughnut.plugins.legend.labels.generateLabels(c).map(function (l, i) { l.text = o.labels[i] + ' ' + fr(d[i] / tot * 100, 1) + ' %'; return l; }); } } },
          tooltip: { callbacks: { label: function (c) { if (o.type === 'scatter') return ' ' + (o.pts[c.dataIndex] || '') + ' : ' + fr(c.parsed.x) + ' ' + o.ux + ', ' + fr(c.parsed.y) + ' ' + o.uy; var v = typeof c.parsed === 'object' ? (o.h ? c.parsed.x : c.parsed.y) : c.parsed; return ' ' + fr(v, 1) + u + (pct ? ' (' + fr(v / tot * 100, 1) + ' %)' : ''); } } } },
        scales: o.type === 'doughnut' ? {} : o.type === 'scatter' ? { x: { title: { display: true, text: o.ux } }, y: { title: { display: true, text: o.uy } } } : { x: { grid: { display: !!o.h } }, y: { grid: { display: !o.h }, ticks: { autoSkip: o.type === 'line', font: { size: 10 } } } } } });
  }
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); e.target._go(); } }); }, { rootMargin: '400px' }) : null;
  function mini(box, titre, sous, o, grand) {
    var d = document.createElement('div'); d.className = 'cr-mini' + (grand ? ' cr-big' : ''); d.dataset.q = norm(titre + ' ' + sous);
    d.innerHTML = '<h4>' + esc(titre) + '</h4><small>' + esc(sous) + '</small><div class="cr-mcv"><canvas></canvas></div>';
    d._go = function () { chart().then(function () { G(d.querySelector('canvas'), typeof o === 'function' ? o() : o); }); };
    box.appendChild(d); if (io) io.observe(d); else d._go(); n++;
  }
  function grp(sec, id, titre, texte) {
    var g = document.createElement('div'); g.className = 'cr-mass';
    g.innerHTML = '<h3 class="cr-mh">' + titre + '</h3><p class="note">' + texte + '</p><input type="search" class="cr-mq" placeholder="Filtrer ces graphiques…"><div class="cr-mgrid" id="' + id + '"></div>';
    sec.appendChild(g);
    g.querySelector('.cr-mq').oninput = function () { var q = norm(this.value).trim(); g.querySelectorAll('.cr-mini').forEach(function (m) { m.hidden = q && m.dataset.q.indexOf(q) < 0; }); };
    return g;
  }
  function titreG(g, t) { g.querySelector('.cr-mh').innerHTML = t; }
  function cle(o, k) { return Object.keys(o).sort(function (a, b) { return o[b] - o[a]; }).slice(0, k); }
  var n = 0;
  function compter() { var c = $('crMassN'), t = document.querySelectorAll('section[data-view="graphiques"] .cr-mini').length + 9; if (c && t > 9) c.innerHTML = '<b>' + fr(t) + '</b> graphiques au total sur cette page, tous calculés à partir des données du site et mis à jour par les robots. Ils se dessinent au fur et à mesure que vous faites défiler.'; }
  function plus() {
    var sec = document.querySelector('section[data-view="graphiques"]'); if (fait || !sec) return; fait = true;
    if (!$('crMassN')) { var c = document.createElement('div'); c.className = 'cr-mcount'; c.id = 'crMassN'; sec.appendChild(c); }
    var g0 = grp(sec, 'crP0', '🌍 Vue d’ensemble', 'Les grandes tendances de la base : avions, aéroports du monde, âge des flottes et sources de données.'), b0 = g0.querySelector('.cr-mgrid');
    if (hasAV()) {
      var cat = {}, cons = {}, dec = {};
      AV.forEach(function (a) { cat[a.cat] = (cat[a.cat] || 0) + 1; cons[a.c] = (cons[a.c] || 0) + 1; var y = parseInt(String(a.eis || '').match(/\d{4}/), 10); if (y) { var k = Math.floor(y / 10) * 10 + 's'; dec[k] = (dec[k] || 0) + 1; } });
      var kc = cle(cat, 10), kk = cle(cons, 10), kd = Object.keys(dec).sort();
      mini(b0, 'Les modèles par catégorie', AV.length + ' modèles de la base Avions', { type: 'doughnut', labels: kc, data: kc.map(function (k) { return cat[k]; }) });
      mini(b0, 'Les modèles par constructeur', 'Les 10 premiers', { type: 'bar', h: 1, labels: kk, data: kk.map(function (k) { return cons[k]; }) });
      mini(b0, 'Mises en service par décennie', 'Nombre de modèles', { type: 'bar', labels: kd, data: kd.map(function (k) { return dec[k]; }), col: PAL[2] });
      var sc = AV.filter(function (a) { return a.rg && a.mtow; });
      mini(b0, 'Rayon d’action et masse au décollage', sc.length + ' modèles : plus un avion est lourd, plus il va loin', function () { return { type: 'scatter', data: sc.map(function (a) { return { x: a.mtow, y: a.rg }; }), pts: sc.map(avL), ux: 't', uy: 'km' }; }, 1);
      [['max', 'Les plus grandes capacités', ' places', PAL[0]], ['rg', 'Les plus grands rayons d’action', ' km', PAL[1]], ['mtow', 'Les plus lourds au décollage', ' t', PAL[3]], ['E', 'Les plus grandes envergures', ' m', PAL[5]]].forEach(function (r) {
        var t = AV.filter(function (a) { return a[r[0]]; }).sort(function (a, b) { return b[r[0]] - a[r[0]]; }).slice(0, 12);
        mini(b0, r[1], 'Top 12 de la base Avions', { type: 'bar', h: 1, labels: t.map(avL), data: t.map(function (a) { return a[r[0]]; }), u: r[2], pct: false, col: r[3] });
      });
    }
    getJ('data/counter.json').then(function (c) {
      var s = c.sources || {}, k = cle(s, 9), au = Object.keys(s).reduce(function (a, x) { return k.indexOf(x) < 0 ? a + s[x] : a; }, 0), h = c.history || {}, hk = Object.keys(h).sort();
      mini(b0, 'D’où viennent les ' + fr(c.total) + ' données', 'Répartition par source', { type: 'doughnut', labels: k.concat(['Autres']), data: k.map(function (x) { return s[x]; }).concat([au]) });
      if (hk.length > 1) mini(b0, 'La base grandit chaque jour', 'Nombre total de données', { type: 'line', labels: hk, data: hk.map(function (x) { return h[x]; }), pct: false });
    }).catch(function () {});
    var noms = function (k) { var x = alx(k); return x ? x[0] : k; };
    getJ('data/fleetage.json').then(function (f) {
      var O = f.operators || {}, T = f.types || {};
      var oo = Object.keys(O).filter(function (k) { return O[k].n >= 10; }).sort(function (a, b) { return O[b].n - O[a].n; });
      var vieux = oo.slice().sort(function (a, b) { return O[b].moy - O[a].moy; }).slice(0, 15);
      mini(b0, 'Les flottes les plus anciennes', 'Âge moyen en années (registre FAA)', { type: 'bar', h: 1, labels: vieux.map(noms), data: vieux.map(function (k) { return O[k].moy; }), u: ' ans', pct: false, col: PAL[4] });
      var g1 = grp(sec, 'crP1', '', 'Âge des appareils de chaque compagnie : le plus jeune, la médiane, la moyenne et le plus ancien. Source : ' + esc(f.source || 'registre FAA') + '.'), b1 = g1.querySelector('.cr-mgrid');
      var age = function (x) { return { type: 'bar', labels: ['Plus jeune', 'Médiane', 'Moyenne', 'Plus ancien'], data: [x.min, x.med, x.moy, x.max], u: ' ans', pct: false, col: [PAL[3], PAL[1], PAL[0], PAL[4]] }; };
      oo.forEach(function (k) { var x = O[k]; mini(b1, noms(k) + ' (' + k + ')', fr(x.n) + ' appareils · ' + fr(x.plus20 / x.n * 100) + ' % ont plus de 20 ans', age(x)); });
      titreG(g1, '⏳ L’âge de la flotte de chaque compagnie (' + oo.length + ' graphiques)');
      var tt = Object.keys(T).filter(function (k) { return T[k].n >= 10; }).sort(function (a, b) { return T[b].n - T[a].n; });
      var g2 = grp(sec, 'crP2', '⌛ L’âge de chaque modèle d’avion (' + tt.length + ' graphiques)', 'Âge des appareils immatriculés, par code type OACI.'), b2 = g2.querySelector('.cr-mgrid');
      tt.forEach(function (k) { var x = T[k]; mini(b2, k, fr(x.n) + ' appareils · ' + fr(x.plus20 / x.n * 100) + ' % ont plus de 20 ans', age(x)); });
      compter();
    }).catch(function () {});
    aeroports().then(function () {
      if (!AP.length) return;
      var P = {}, C = {}, rev = {}, lg = { '< 1 000 m': 0, '1 000–1 999 m': 0, '2 000–2 999 m': 0, '3 000–3 999 m': 0, '≥ 4 000 m': 0 }, CN = { EU: 'Europe', NA: 'Amérique du Nord', SA: 'Amérique du Sud', AS: 'Asie', AF: 'Afrique', OC: 'Océanie', AN: 'Antarctique' };
      AP.forEach(function (a) { var p = P[a[4]] || (P[a[4]] = []); p.push(a); C[a[5]] = (C[a[5]] || 0) + 1; var m = 0; (a[11] || []).forEach(function (r) { if (r[1] > m) m = r[1]; var v = String(r[3] || 'inconnu').toLowerCase().slice(0, 3); v = { asp: 'Asphalte', con: 'Béton', gra: 'Herbe/gravier', grv: 'Herbe/gravier', tur: 'Herbe/gravier', dir: 'Terre', unk: 'Inconnu' }[v] || 'Autre'; rev[v] = (rev[v] || 0) + 1; }); a._m = m;
        if (m) lg[m < 1000 ? '< 1 000 m' : m < 2000 ? '1 000–1 999 m' : m < 3000 ? '2 000–2 999 m' : m < 4000 ? '3 000–3 999 m' : '≥ 4 000 m']++; });
      var kc = cle(C, 7), kp = Object.keys(P).sort(function (a, b) { return P[b].length - P[a].length; }), kr = cle(rev, 7), hi = AP.slice().sort(function (a, b) { return (b[9] || 0) - (a[9] || 0); }).slice(0, 12);
      mini(b0, 'Les aéroports par continent', fr(AP.length) + ' aéroports à vols réguliers', { type: 'doughnut', labels: kc.map(function (k) { return CN[k] || k; }), data: kc.map(function (k) { return C[k]; }) });
      mini(b0, 'Les pays qui ont le plus d’aéroports', 'Top 15', { type: 'bar', h: 1, labels: kp.slice(0, 15).map(pays), data: kp.slice(0, 15).map(function (k) { return P[k].length; }), col: PAL[6] });
      mini(b0, 'Longueur de la plus longue piste', 'Nombre d’aéroports', { type: 'bar', labels: Object.keys(lg), data: Object.keys(lg).map(function (k) { return lg[k]; }), col: PAL[5] });
      mini(b0, 'Revêtement des pistes', 'Toutes les pistes', { type: 'doughnut', labels: kr, data: kr.map(function (k) { return rev[k]; }) });
      mini(b0, 'Les aéroports les plus hauts', 'Altitude en mètres', { type: 'bar', h: 1, labels: hi.map(function (a) { return a[3] + ' ' + (a[0] || a[1]); }), data: hi.map(function (a) { return a[9]; }), u: ' m', pct: false, col: PAL[7] });
      var pp = kp.filter(function (k) { return P[k].length >= 8; });
      var g3 = grp(sec, 'crP3', '🗺️ Les aéroports de chaque pays (' + pp.length * 2 + ' graphiques)', 'Pour chaque pays : la répartition des aéroports par taille, et ses pistes les plus longues. Source : OurAirports (domaine public).'), b3 = g3.querySelector('.cr-mgrid');
      pp.forEach(function (k) {
        var L = P[k], tl = [0, 0, 0]; L.forEach(function (a) { tl[a[10]]++; });
        mini(b3, pays(k), fr(L.length) + ' aéroports · taille', { type: 'doughnut', labels: ['Grands', 'Moyens', 'Petits'], data: [tl[2], tl[1], tl[0]] });
        var t = L.filter(function (a) { return a._m; }).sort(function (a, b) { return b._m - a._m; }).slice(0, 8);
        mini(b3, pays(k) + ' : pistes les plus longues', 'En mètres', { type: 'bar', h: 1, labels: t.map(function (a) { return a[3] + ' ' + (a[0] || a[1]); }), data: t.map(function (a) { return a._m; }), u: ' m', pct: false, col: PAL[1] });
      });
      compter();
    });
    setTimeout(compter, 2500); setTimeout(compter, 8000);
  }

  /* ---------- aiguillage ---------- */
  function vue() { return (location.hash || '#accueil').slice(1) || 'accueil'; }
  function quand() { var v = vue(); if (v === 'accueil') saviez(); if (v === 'lexique') vueLexique(); if (v === 'graphiques') plus(); }
  window.addEventListener('hashchange', quand); window.addEventListener('popstate', quand);
  document.addEventListener('click', function (e) { if (e.target.closest('a[href^="#"]')) setTimeout(quand, 60); });
  setTimeout(quand, 450);
})();
