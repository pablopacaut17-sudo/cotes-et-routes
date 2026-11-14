/* Cotes & Routes – design v3 : pourcentages dans les jauges, rubrique Graphiques, rubrique Photos, bandeaux photo */
(function () {
  'use strict';
  var $ = function (i) { return document.getElementById(i); };
  var CSS = getComputedStyle(document.documentElement);
  function couleurs() {
    var dark = document.documentElement.dataset.theme === 'dark' || (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme:dark)').matches);
    return { ink: dark ? '#E3EAF0' : '#0E2235', muted: dark ? '#9AABBB' : '#4C6075', line: dark ? '#263A4C' : '#D5DEE6',
      pal: ['#FFC72C', '#1B6FD1', '#E36BB7', '#2E9D62', '#F2853A', '#7A5AE0', '#22A7B5', '#C2187A', '#8C9AA8', '#B5C334', '#5B6B7A', '#E0B04A'] };
  }
  function nombre(t) { var m = String(t).replace(/ | |\s/g, '').replace(',', '.').match(/-?\d+(\.\d+)?/); return m ? parseFloat(m[0]) : NaN; }
  function fr(n, d) { return Number(n).toLocaleString('fr-FR', { maximumFractionDigits: d == null ? 0 : d }); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- 1. pourcentages dans toutes les jauges colorées ---------- */
  function jauges() {
    document.querySelectorAll('.bars').forEach(function (b) {
      var rows = b.querySelectorAll('.brow'); if (!rows.length) return;
      var sig = rows.length + ':' + b.textContent.length; if (b.dataset.pct === sig) return;
      var vals = [].map.call(rows, function (r) { var v = r.querySelector('.v'); return v ? nombre(v.textContent) : NaN; });
      var txt = [].map.call(rows, function (r) { var v = r.querySelector('.v'); return v ? v.textContent : ''; });
      var ok = vals.every(function (v) { return !isNaN(v) && v >= 0; }) && txt.every(function (t) { return !/\d,\d|%|\/|ans?\b|km|m\b/.test(t); });
      var tot = vals.reduce(function (a, v) { return a + (isNaN(v) ? 0 : v); }, 0);
      [].forEach.call(rows, function (r, i) {
        var t = r.querySelector('.btrack'), f = r.querySelector('.bfill'); if (!t || !f) return;
        var old = t.querySelector('.cr-pct'); if (old) old.remove();
        var p = ok && tot > 0 ? vals[i] / tot * 100 : parseFloat(f.style.width);
        if (isNaN(p)) return;
        var s = document.createElement('span'); s.className = 'cr-pct';
        s.textContent = (p < 1 && p > 0 ? '< 1' : fr(p, p < 10 ? 1 : 0)) + ' %';
        if (parseFloat(f.style.width) < 22) s.classList.add('out');
        t.appendChild(s);
      });
      b.dataset.pct = sig;
      if (!b.nextElementSibling || !b.nextElementSibling.classList.contains('cr-pctnote')) {
        var n = document.createElement('p'); n.className = 'note cr-pctnote';
        n.textContent = ok ? 'Pourcentages : part de chaque ligne dans le total affiché.' : 'Pourcentages : valeur rapportée à la plus grande.';
        b.after(n);
      }
    });
  }
  var tj; new MutationObserver(function () { clearTimeout(tj); tj = setTimeout(jauges, 120); }).observe(document.body, { childList: true, subtree: true });
  setTimeout(jauges, 500);

  /* ---------- 2. photos : chargement paresseux via le système photo du site (data-wiki) ---------- */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { var el = e.target; io.unobserve(el); if (el.dataset.w) el.setAttribute('data-wiki', el.dataset.w); } });
  }, { rootMargin: '300px' }) : null;
  function photoSlot(id, titres) {
    var d = document.createElement('div'); d.id = id; d.className = 'cr-ph'; d.dataset.w = titres.filter(Boolean).join('|');
    if (io) io.observe(d); else d.setAttribute('data-wiki', d.dataset.w);
    return d;
  }
  function titresAvion(a) {
    var l = typeof avL === 'function' ? avL(a) : (a.c + ' ' + a.n);
    return [l, l.replace(/[- ][A-Za-z0-9]+$/, ''), String(a.c).split(' ')[0] + ' ' + String(a.n).split(/[- ]/)[0]];
  }
  function ouvrirAvion(id) { try { go('avions'); setTimeout(function () { openSheet(id); }, 120); } catch (e) { location.hash = '#avions'; } }

  /* rubrique Photos */
  var photosFaites = false, catPh = 'Tous';
  function photos() {
    var box = $('crPhotos'); if (!box || typeof AV === 'undefined') return;
    if (!photosFaites) {
      photosFaites = true;
      var cs = ['Tous'].concat(Array.from(new Set(AV.map(function (a) { return a.cat; }))));
      $('crPhChips').innerHTML = cs.map(function (c) { return '<button class="chip" data-c="' + esc(c) + '" aria-pressed="' + (c === catPh) + '">' + esc(c) + '</button>'; }).join('');
      $('crPhChips').onclick = function (e) { var b = e.target.closest('.chip'); if (!b) return; catPh = b.dataset.c;
        [].forEach.call(this.children, function (x) { x.setAttribute('aria-pressed', x === b); }); filtrer(); };
      $('crPhQ').oninput = filtrer;
      AV.forEach(function (a) {
        var c = document.createElement('article'); c.className = 'cr-card'; c.dataset.cat = a.cat;
        c.dataset.q = (a.n + ' ' + a.c + ' ' + a.cat).toLowerCase();
        c.appendChild(photoSlot('crp-' + a.id, titresAvion(a)));
        var info = document.createElement('div'); info.className = 'cr-ci';
        info.innerHTML = '<b>' + esc(typeof avL === 'function' ? avL(a) : a.n) + '</b><span>' + esc(a.cat) + (a.eis ? ' · ' + esc(String(a.eis).split(' ')[0]) : '') + '</span>' +
          '<div class="cr-kv">' + (a.max ? '<i>💺 ' + fr(a.max) + '</i>' : '') + (a.rg ? '<i>🧭 ' + fr(a.rg) + ' km</i>' : '') + (a.E ? '<i>↔ ' + fr(a.E, 1) + ' m</i>' : '') + '</div>';
        c.appendChild(info);
        c.onclick = function () { ouvrirAvion(a.id); };
        box.appendChild(c);
      });
    }
    filtrer();
  }
  function filtrer() {
    var q = ($('crPhQ').value || '').toLowerCase().trim(), n = 0;
    document.querySelectorAll('#crPhotos .cr-card').forEach(function (c) {
      var ok = (catPh === 'Tous' || c.dataset.cat === catPh) && (!q || c.dataset.q.indexOf(q) >= 0);
      c.hidden = !ok; if (ok) n++;
    });
    $('crPhCount').textContent = n + ' avion' + (n > 1 ? 's' : '') + ' · photos libres de droits (Wikimedia Commons)';
  }

  /* bandeau d’accueil : galerie défilante */
  var STRIP = ['a380', 'a350-900', 'b787-9', 'b747-8', 'concorde', 'a320neo', 'b777-300er', 'beluga', 'a220-300', 'atr72-600', 'b737max8', 'an225'];
  function galerieAccueil() {
    var s = $('crStrip'); if (!s || typeof AV === 'undefined' || s.dataset.ok) return; s.dataset.ok = 1;
    var liste = AV.filter(function (a) { return STRIP.some(function (k) { return a.id.indexOf(k) === 0; }); }).slice(0, 12);
    if (liste.length < 6) liste = AV.filter(function (a) { return a.cat === 'Gros porteur'; }).slice(0, 12);
    liste.forEach(function (a) {
      var c = document.createElement('a'); c.href = '#avions'; c.className = 'cr-sc';
      c.appendChild(photoSlot('crs-' + a.id, titresAvion(a)));
      var t = document.createElement('b'); t.textContent = typeof avL === 'function' ? avL(a) : a.n; c.appendChild(t);
      c.onclick = function (e) { e.preventDefault(); e.stopPropagation(); ouvrirAvion(a.id); };
      s.appendChild(c);
    });
  }

  /* bandeaux photo en tête de rubrique */
  var BAN = { avions: 'Airbus A350|Airbus A350 XWB', catalogue: 'Boeing 747', aeroports: 'Paris Charles de Gaulle Airport', annuaire: 'Hong Kong International Airport',
    base: 'Airfield', compagnies: 'Air France', constructeurs: 'Airbus|Toulouse–Blagnac Airport', moteurs: 'General Electric GE9X|Turbofan', cargo: 'Airbus Beluga',
    records: 'Antonov An-225 Mriya', histoire: 'Wright Flyer', environnement: 'Contrail', securite: 'Air traffic control', tourisme: 'Malé', trafic: 'Heathrow Airport',
    lignes: 'Great-circle navigation', ailes: 'Wingtip device', fournisseurs: 'Rolls-Royce Trent XWB', europe: 'Frankfurt Airport', france: 'Paris Orly Airport', pays: 'Dubai International Airport' };
  function bandeau(v) {
    var sec = document.querySelector('section[data-view="' + v + '"]'); if (!sec || !BAN[v] || sec.querySelector('.cr-ban')) return;
    var b = photoSlot('crban-' + v, BAN[v].split('|')); b.classList.add('cr-ban');
    var h = sec.querySelector('h2'); if (h) h.after(b); else sec.prepend(b);
  }

  /* ---------- 3. rubrique Graphiques (Chart.js, chargé à la demande) ---------- */
  var chartP = null, graphFait = false;
  function chartJs() {
    if (window.Chart) return Promise.resolve();
    if (!chartP) chartP = new Promise(function (ok, ko) { var s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.js'; s.onload = ok; s.onerror = ko; document.head.appendChild(s); });
    return chartP;
  }
  function lire(u) { return fetch(u).then(function (r) { if (!r.ok) throw 0; return r.json(); }); }
  function carte(id, titre, note) {
    var d = document.createElement('div'); d.className = 'cr-chart';
    d.innerHTML = '<h3>' + titre + '</h3><div class="cr-cv"><canvas id="' + id + '"></canvas></div><p class="note">' + note + '</p>';
    $('crGraphs').appendChild(d); return $(id);
  }
  function nomCie(k) { try { if (typeof ALX !== 'undefined' && ALX[k]) return ALX[k][0]; } catch (e) {} return k; }
  function pctLabels(labels, data) {
    var t = data.reduce(function (a, b) { return a + b; }, 0);
    return labels.map(function (l, i) { return l + ' — ' + fr(data[i] / t * 100, 1) + ' %'; });
  }
  function base(type, el, labels, data, opt) {
    var C = couleurs(); opt = opt || {};
    Chart.defaults.color = C.muted; Chart.defaults.font.family = 'Overpass, Arial, sans-serif'; Chart.defaults.borderColor = C.line;
    return new Chart(el, { type: type, data: { labels: labels, datasets: [{ data: data, label: opt.label || '', backgroundColor: opt.bg || (type === 'doughnut' ? C.pal : C.pal[0]),
      borderColor: type === 'line' ? C.pal[0] : (type === 'doughnut' ? 'transparent' : C.pal[0]), borderWidth: type === 'line' ? 3 : 0, borderRadius: type === 'bar' ? 6 : 0,
      fill: type === 'line' ? { target: 'origin', above: 'rgba(255,199,44,.18)' } : false, tension: .3, pointRadius: type === 'line' ? 3 : 0 }] },
      options: Object.assign({ responsive: true, maintainAspectRatio: false, indexAxis: opt.h ? 'y' : 'x',
        plugins: { legend: { display: type === 'doughnut', position: 'bottom', labels: { boxWidth: 12, padding: 10 } },
          tooltip: { callbacks: { label: function (c) { var v = c.parsed && typeof c.parsed === 'object' ? (opt.h ? c.parsed.x : c.parsed.y) : c.parsed;
            var t = c.dataset.data.reduce(function (a, b) { return a + b; }, 0); return ' ' + fr(v, opt.dec) + (opt.u || '') + (opt.pct ? ' (' + fr(v / t * 100, 1) + ' %)' : ''); } } } },
        scales: type === 'doughnut' ? {} : { x: { grid: { display: !opt.h ? false : true } }, y: { grid: { display: opt.h ? false : true }, ticks: { autoSkip: false } } } }, opt.options || {}) });
  }
  function graphiques() {
    if (graphFait || !$('crGraphs')) return; graphFait = true;
    $('crGraphStatus').textContent = 'Chargement des graphiques…';
    chartJs().then(function () {
      $('crGraphStatus').textContent = 'Graphiques calculés en direct à partir des fichiers de données du site (mis à jour par les robots).';
      if (typeof AV !== 'undefined') {
        var cats = {}; AV.forEach(function (a) { cats[a.cat] = (cats[a.cat] || 0) + 1; });
        var k = Object.keys(cats).sort(function (a, b) { return cats[b] - cats[a]; });
        base('doughnut', carte('crG1', 'Les ' + AV.length + ' modèles du catalogue, par catégorie', 'Part de chaque catégorie dans la base de données avions.'), pctLabels(k, k.map(function (x) { return cats[x]; })), k.map(function (x) { return cats[x]; }), { pct: 1 });
        var pts = AV.filter(function (a) { return a.rg && a.max && a.cat !== 'Hélicoptère'; });
        var el = carte('crG2', 'Autonomie et capacité : où se place chaque avion', 'Chaque point est un modèle : autonomie (km) en abscisse, sièges en ordonnée. Touchez un point pour son nom.');
        var C = couleurs();
        new Chart(el, { type: 'scatter', data: { datasets: [{ data: pts.map(function (a) { return { x: a.rg, y: a.max, n: a.c + ' ' + a.n }; }), backgroundColor: 'rgba(27,111,209,.55)', pointRadius: 4, pointHoverRadius: 7 }] },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (c) { return c.raw.n + ' : ' + fr(c.raw.x) + ' km, ' + fr(c.raw.y) + ' sièges'; } } } },
            scales: { x: { title: { display: true, text: 'Autonomie (km)', color: C.muted } }, y: { title: { display: true, text: 'Sièges', color: C.muted } } } } });
      }
      lire('data/counter.json').then(function (j) {
        var h = j.history || {}, ks = Object.keys(h).sort();
        if (ks.length > 1) base('line', carte('crG3', 'La base Cotes & Routes grandit chaque jour', 'Nombre total de données dans l’encyclopédie, recompté toutes les 6 heures.'), ks.map(function (d) { return d.slice(8, 10) + '/' + d.slice(5, 7); }), ks.map(function (d) { return h[d]; }), { label: 'données' });
        var s = j.sources || {}, sk = Object.keys(s).sort(function (a, b) { return s[b] - s[a]; }), top = sk.slice(0, 7), autres = sk.slice(7).reduce(function (a, k) { return a + s[k]; }, 0);
        var lab = top.concat(autres ? ['Autres'] : []), dat = top.map(function (k) { return s[k]; }).concat(autres ? [autres] : []);
        base('doughnut', carte('crG4', 'D’où viennent les ' + fr(j.total) + ' données', 'Répartition par source, en pourcentage du total.'), pctLabels(lab, dat), dat, { pct: 1 });
      }).catch(function () {});
      Promise.all([lire('data/fleet.json'), lire('data/types-all.json').catch(function () { return {}; })]).then(function (r) {
        var f = r[0], T = (r[1] && r[1].types) || {}, ty = f.types || {}, k = Object.keys(ty).sort(function (a, b) { return ty[b] - ty[a]; }).slice(0, 12);
        var nom = function (c) { var t = T[c] && T[c][0]; return t ? (t[0].charAt(0) + t[0].slice(1).toLowerCase() + ' ' + t[1]) : (f.models && f.models[c]) || c; };
        base('bar', carte('crG5', 'Les modèles les plus nombreux dans le registre', 'Nombre d’appareils par type dans le registre des appareils (OpenSky).'), k.map(nom), k.map(function (c) { return ty[c]; }), { h: 1, label: 'appareils' }).canvas.parentNode.style.height = '420px';
        var op = f.operators || {}, ok = Object.keys(op).sort(function (a, b) { return op[b] - op[a]; }).slice(0, 12);
        base('bar', carte('crG6', 'Les plus grandes flottes', 'Nombre d’appareils par compagnie dans le registre.'), ok.map(nomCie), ok.map(function (c) { return op[c]; }), { h: 1, bg: couleurs().pal[1], label: 'appareils' }).canvas.parentNode.style.height = '420px';
      }).catch(function () {});
      lire('data/opensky.json').then(function (j) {
        var a = (j.airborne || []).slice(-1)[0]; if (!a) return; var c = a.countries || {}, k = Object.keys(c).sort(function (x, y) { return c[y] - c[x]; }).slice(0, 10);
        base('bar', carte('crG7', 'Avions en vol au même instant, par pays d’immatriculation', 'Photographie du ' + new Date(a.time * 1000).toLocaleString('fr-FR') + ' : ' + fr(a.total) + ' avions en vol captés par OpenSky.'), k, k.map(function (x) { return c[x]; }), { bg: couleurs().pal[2], label: 'avions', pct: 1 });
      }).catch(function () {});
      lire('data/fleetage.json').then(function (j) {
        var o = j.operators || {}, k = Object.keys(o).filter(function (x) { return o[x].n >= 100; }).sort(function (a, b) { return o[b].moy - o[a].moy; }).slice(0, 12);
        base('bar', carte('crG8', 'Âge moyen des flottes (compagnies de plus de 100 avions)', 'En années, d’après le registre de la FAA croisé avec OpenSky.'), k.map(nomCie), k.map(function (x) { return o[x].moy; }), { h: 1, bg: couleurs().pal[4], u: ' ans', dec: 1, label: 'âge moyen' }).canvas.parentNode.style.height = '400px';
      }).catch(function () {});
      lire('data/flights/index.json').then(function (j) {
        var d = j.days || {}, k = Object.keys(d).sort();
        base('bar', carte('crG9', 'Vols observés par jour dans l’archive', 'Nombre de vols enregistrés chaque jour par le robot OpenSky.'), k.map(function (x) { return x.slice(8, 10) + '/' + x.slice(5, 7); }), k.map(function (x) { return d[x]; }), { bg: couleurs().pal[3], label: 'vols' });
      }).catch(function () {});
    }).catch(function () { $('crGraphStatus').textContent = 'Les graphiques ont besoin d’une connexion internet (bibliothèque Chart.js).'; graphFait = false; });
  }

  /* ---------- routage : on agit à l’ouverture de chaque rubrique ---------- */
  function vue() { var v = (location.hash || '#accueil').slice(1); return v || 'accueil'; }
  function quandVue() {
    var v = vue();
    if (v === 'accueil') galerieAccueil();
    if (v === 'photos') photos();
    if (v === 'graphiques') graphiques();
    bandeau(v);
  }
  window.addEventListener('hashchange', quandVue); window.addEventListener('popstate', quandVue);
  document.addEventListener('click', function (e) { if (e.target.closest('a[href^="#"]')) setTimeout(quandVue, 40); });
  setTimeout(quandVue, 400);
})();
