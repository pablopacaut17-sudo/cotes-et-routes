/* Cotes & Routes – design v4 : rubrique « Comment vole un avion » (schémas + 188 fiches + quiz) et accueil en photo */
(function () {
  'use strict';
  var $ = function (i) { return document.getElementById(i); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function norm(s) { return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  var LS = { get: function (k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } }, set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };

  /* ---------- accueil : grande photo derrière le titre ---------- */
  function heroPhoto() {
    var h = document.querySelector('section[data-view="accueil"] .hero'); if (!h || h.querySelector('.cr-herobg')) return;
    var d = document.createElement('div'); d.className = 'cr-herobg'; d.id = 'crHeroBg';
    d.setAttribute('data-wiki', 'Airbus A380|Airbus A350'); h.prepend(d); h.classList.add('cr-hero');
  }

  /* ---------- schémas ---------- */
  var AV = '<path d="M60 92 C60 84 72 80 120 80 L330 80 C360 80 380 84 392 92 C380 100 360 104 330 104 L120 104 C72 104 60 100 60 92Z" class="fus"/><path d="M190 92 L250 40 L272 40 L240 92Z" class="wing"/><path d="M190 92 L250 144 L272 144 L240 92Z" class="wing o"/><path d="M78 88 L62 54 L76 54 L104 86Z" class="wing"/>';
  var SCH = {
    forces: { t: 'Les quatre forces en vol', svg: '<svg viewBox="0 0 460 190" class="cr-svg">' + AV.replace(/M190 92 L250 144[^"]*"/, 'M0 0"') +
      '<g class="fl"><line x1="225" y1="78" x2="225" y2="14" class="up"/><text x="232" y="22">PORTANCE</text><line x1="225" y1="106" x2="225" y2="176" class="dn"/><text x="232" y="174">POIDS</text>' +
      '<line x1="394" y1="92" x2="452" y2="92" class="fw"/><text x="392" y="80">POUSSÉE</text><line x1="58" y1="92" x2="6" y2="92" class="bk"/><text x="6" y="80">TRAÎNÉE</text></g></svg>',
      n: 'En croisière stabilisée : portance = poids et poussée = traînée. Pour monter, la portance l’emporte ; pour accélérer, la poussée l’emporte.' },
    aile: { t: 'Pourquoi l’aile porte', svg: '<svg viewBox="0 0 460 200" class="cr-svg"><g class="flow"><path d="M0 70 C120 70 150 40 250 46 C330 50 380 72 460 80"/><path d="M0 95 C120 95 150 72 250 76 C330 80 380 96 460 104"/><path d="M0 150 C120 150 170 150 250 140 C330 132 380 126 460 128"/><path d="M0 175 C120 175 170 175 250 166 C330 158 380 152 460 154"/></g>' +
      '<path d="M120 120 C130 92 200 82 270 92 C320 100 360 112 400 126 C350 128 300 130 250 132 C190 134 140 134 120 120Z" class="prof"/>' +
      '<text x="220" y="70" class="lo">− dépression (extrados)</text><text x="200" y="158" class="hi">+ surpression (intrados)</text>' +
      '<line x1="260" y1="98" x2="260" y2="20" class="up"/><text x="268" y="26" class="lab">PORTANCE</text><line x1="40" y1="128" x2="110" y2="120" class="rw"/><text x="10" y="146" class="lab2">vent relatif</text></svg>',
      n: 'L’aile dévie l’air vers le bas : l’air pousse l’aile vers le haut (Newton). La dépression sur l’extrados fournit la plus grande part de la portance (Bernoulli décrit le même phénomène).' },
    axes: { t: 'Les trois axes et les gouvernes', svg: '<svg viewBox="0 0 460 230" class="cr-svg"><path d="M230 14 C238 14 242 30 242 50 L242 92 L420 140 L420 156 L242 128 L242 186 L282 206 L282 218 L230 210 L178 218 L178 206 L218 186 L218 128 L40 156 L40 140 L218 92 L218 50 C218 30 222 14 230 14Z" class="top"/>' +
      '<rect x="370" y="140" width="40" height="10" class="cs" transform="rotate(16 390 145)"/><rect x="50" y="140" width="40" height="10" class="cs" transform="rotate(-16 70 145)"/><rect x="186" y="204" width="88" height="8" class="cs2"/><rect x="227" y="190" width="6" height="26" class="cs3"/>' +
      '<text x="352" y="178" class="lab">ailerons → ROULIS</text><text x="250" y="226" class="lab">profondeur → TANGAGE</text><text x="10" y="226" class="lab">direction → LACET</text>' +
      '<path d="M120 40 a40 14 0 1 0 1 0" class="ax"/><text x="10" y="30" class="lab2">roulis : axe longitudinal</text></svg>',
      n: 'Ailerons (roulis), gouverne de profondeur (tangage) et gouverne de direction (lacet). On vire en inclinant l’avion : la portance inclinée courbe la trajectoire.' },
    moteur: { t: 'Le turbofan en coupe', svg: '<svg viewBox="0 0 520 230" class="cr-svg"><path d="M30 40 L400 52 L470 90 L470 140 L400 178 L30 190 Z" class="nac"/>' +
      '<rect x="42" y="50" width="16" height="130" rx="4" class="fan"/><path d="M90 86 L160 92 L160 138 L90 144Z" class="lpc"/><path d="M160 92 L250 98 L250 132 L160 138Z" class="hpc"/>' +
      '<rect x="250" y="96" width="50" height="38" class="cc"/><path d="M300 98 L330 96 L330 134 L300 132Z" class="hpt"/><path d="M330 96 L400 90 L400 140 L330 134Z" class="lpt"/>' +
      '<line x1="40" y1="115" x2="420" y2="115" class="sh"/><g class="flow2"><path d="M0 70 L470 80"/><path d="M0 160 L470 150"/></g><g class="flow3"><path d="M0 115 L250 115"/></g><g class="flow4"><path d="M300 115 L520 115"/></g>' +
      '<g class="lab"><text x="30" y="30">Soufflante</text><text x="98" y="210">Compresseurs BP / HP</text><text x="246" y="88">Chambre</text><text x="300" y="210">Turbines HP / BP</text><text x="400" y="30">Flux froid (≈ 80 % de la poussée)</text><text x="430" y="205">Tuyère</text></g></svg>',
      n: 'L’air est aspiré par la soufflante. La plus grande partie contourne le cœur (flux froid). Le reste est comprimé, brûlé avec le kérosène, puis détendu dans les turbines qui entraînent soufflante et compresseurs.' },
    phases: { t: 'Les étapes d’un vol', svg: '<svg viewBox="0 0 520 200" class="cr-svg"><path d="M10 180 L70 180 L150 60 L370 40 L450 150 L500 180" class="prof2"/>' +
      '<g class="lab"><text x="8" y="196">Roulage</text><text x="66" y="160">Décollage</text><text x="90" y="100">Montée</text><text x="210" y="34">Croisière ≈ 11 000 m</text><text x="390" y="80">Descente</text><text x="420" y="136">Approche</text><text x="440" y="196">Atterrissage</text></g>' +
      '<g class="dots"><circle cx="70" cy="180" r="4"/><circle cx="150" cy="60" r="4"/><circle cx="370" cy="40" r="4"/><circle cx="450" cy="150" r="4"/></g></svg>',
      n: 'Montée en une vingtaine de minutes, croisière vers Mach 0,8, descente entamée environ 150 à 200 km avant l’arrivée, approche stabilisée et atterrissage.' }
  };
  var SCH_CHAP = { bases: ['forces', 'aile'], commandes: ['axes'], reacteur: ['moteur'], phases: ['phases'] };
  function schema(k) { var s = SCH[k]; return '<figure class="cr-sch"><figcaption><b>' + s.t + '</b></figcaption>' + s.svg + '<p class="note">' + s.n + '</p></figure>'; }

  /* ---------- rubrique Comprendre ---------- */
  var charge = null, fait = false;
  function chargerFiches() {
    if (window.CR_CHAPITRES && window.CR_CHAPITRES.length) return Promise.resolve();
    if (charge) return charge;
    var f = ['fiches1', 'fiches2', 'fiches3', 'fiches4', 'fiches5'];
    charge = f.reduce(function (p, n) { return p.then(function () { return new Promise(function (ok) { var s = document.createElement('script'); s.src = 'spotting/' + n + '.js'; s.onload = ok; s.onerror = ok; document.head.appendChild(s); }); }); }, Promise.resolve());
    return charge;
  }
  function comprendre() {
    if (fait || !$('crCp')) return; fait = true;
    $('crCpSch').innerHTML = ['forces', 'aile', 'axes', 'moteur', 'phases'].map(schema).join('');
    chargerFiches().then(function () {
      var C = window.CR_CHAPITRES || [], tout = [], lues = LS.get('cr_comprendre_lues', {}), score = LS.get('cr_comprendre_score', { b: 0, n: 0 });
      C.forEach(function (c) { c.fiches.forEach(function (f, i) { f.id = c.id + '-' + i; f.chap = c; tout.push(f); }); });
      if (!tout.length) { $('crCpListe').innerHTML = '<p class="note">Fiches indisponibles pour le moment.</p>'; return; }
      $('crCpNav').innerHTML = C.map(function (c) { return '<button class="chip" data-c="' + c.id + '">' + c.icone + ' ' + esc(c.titre) + '</button>'; }).join('');
      function progres() {
        var n = tout.filter(function (f) { return lues[f.id]; }).length;
        $('crCpProg').innerHTML = '<div class="cr-pb"><i style="width:' + (n / tout.length * 100) + '%"></i></div><span>' + n + ' fiche' + (n > 1 ? 's' : '') + ' lue' + (n > 1 ? 's' : '') + ' sur ' + tout.length + ' (' + Math.round(n / tout.length * 100) + ' %)' + (score.n ? ' · quiz : ' + score.b + '/' + score.n + ' (' + Math.round(score.b / score.n * 100) + ' %)' : '') + '</span>';
      }
      function afficher() {
        var q = norm($('crCpQ').value.trim()), mots = q ? q.split(/\s+/) : [], html = '';
        C.forEach(function (c) {
          var fs = c.fiches.filter(function (f) { var t = norm(f.t + ' ' + f.x + ' ' + (f.c || '')); return mots.every(function (m) { return t.indexOf(m) >= 0; }); });
          if (!fs.length) return;
          var nl = c.fiches.filter(function (f) { return lues[f.id]; }).length;
          html += '<div class="cr-chap' + (mots.length ? ' ouvert' : '') + '" id="crc-' + c.id + '"><h3><span>' + c.icone + ' ' + esc(c.titre) + '</span><small>' + (mots.length ? fs.length + ' résultat(s)' : nl + '/' + c.fiches.length + ' · ' + Math.round(nl / c.fiches.length * 100) + ' %') + '</small></h3><div class="cr-corps">' +
            (!mots.length && SCH_CHAP[c.id] ? SCH_CHAP[c.id].map(schema).join('') : '') +
            fs.map(function (f) { return '<div class="cr-fi"><h4><span>' + esc(f.t) + '</span><button class="cr-lu' + (lues[f.id] ? ' ok' : '') + '" data-id="' + f.id + '">' + (lues[f.id] ? '✓ lue' : 'marquer lue') + '</button></h4><p>' + esc(f.x) + '</p>' + (f.c ? '<span class="cr-chf">' + esc(f.c) + '</span>' : '') + '</div>'; }).join('') + '</div></div>';
        });
        $('crCpListe').innerHTML = html || '<p class="note">Aucune fiche ne correspond.</p>';
        progres();
      }
      $('crCpListe').onclick = function (e) {
        var l = e.target.closest('.cr-lu'); if (l) { lues[l.dataset.id] = !lues[l.dataset.id]; LS.set('cr_comprendre_lues', lues); afficher(); return; }
        var h = e.target.closest('.cr-chap>h3'); if (h) h.parentNode.classList.toggle('ouvert');
      };
      $('crCpNav').onclick = function (e) { var b = e.target.closest('.chip'); if (!b) return; $('crCpQ').value = ''; afficher(); var c = $('crc-' + b.dataset.c); if (c) { c.classList.add('ouvert'); c.scrollIntoView({ behavior: 'smooth', block: 'start' }); } };
      $('crCpQ').oninput = afficher;
      var qs = tout.filter(function (f) { return f.q; });
      $('crCpQuizBtn').onclick = function poser() {
        var f = qs[Math.floor(Math.random() * qs.length)], z = $('crCpQuiz'), ord = f.q.r.map(function (r, i) { return i; }).sort(function () { return Math.random() - .5; }), rep = false;
        z.hidden = false;
        z.innerHTML = '<b>' + esc(f.q.q) + '</b>' + ord.map(function (i) { return '<button class="cr-rep" data-i="' + i + '">' + esc(f.q.r[i]) + '</button>'; }).join('') + '<div class="cr-expl"></div>';
        z.querySelectorAll('.cr-rep').forEach(function (b) { b.onclick = function () {
          if (rep) return; rep = true; var bon = +b.dataset.i === f.q.b; score.n++; if (bon) score.b++; LS.set('cr_comprendre_score', score);
          z.querySelectorAll('.cr-rep').forEach(function (x) { if (+x.dataset.i === f.q.b) x.classList.add('bon'); }); if (!bon) b.classList.add('faux');
          z.querySelector('.cr-expl').innerHTML = '<p>' + (bon ? '✅ Bonne réponse. ' : '❌ Raté. ') + esc(f.x) + '</p><button class="cr-next">Question suivante →</button>';
          z.querySelector('.cr-next').onclick = poser; progres(); }; });
        z.scrollIntoView({ behavior: 'smooth', block: 'center' });
      };
      $('crCpHasard').onclick = function () { var f = tout[Math.floor(Math.random() * tout.length)]; $('crCpQ').value = f.t; afficher(); };
      afficher();
    });
  }


  /* ---------- graphiques en masse : un graphique par compagnie, par modèle et par aéroport ---------- */
  var massFait = false, chartP4 = null;
  function chart4() {
    if (window.Chart) return Promise.resolve();
    if (!chartP4) chartP4 = new Promise(function (ok, ko) { var s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.js'; s.onload = ok; s.onerror = ko; document.head.appendChild(s); });
    return chartP4;
  }
  function getJ(u) { return fetch(u).then(function (r) { if (!r.ok) throw 0; return r.json(); }); }
  var PAL = ['#FFC72C', '#1B6FD1', '#E36BB7', '#2E9D62', '#F2853A', '#7A5AE0', '#22A7B5', '#C2187A', '#B5C334', '#5B6B7A', '#E0B04A', '#8C9AA8'];
  function fr(n, d) { return Number(n).toLocaleString('fr-FR', { maximumFractionDigits: d || 0 }); }
  function dessiner(cv, type, labels, data, h) {
    var dark = document.documentElement.dataset.theme === 'dark' || (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme:dark)').matches);
    Chart.defaults.color = dark ? '#9AABBB' : '#4C6075'; Chart.defaults.borderColor = dark ? '#263A4C' : '#D5DEE6'; Chart.defaults.font.family = 'Overpass, Arial, sans-serif';
    var tot = data.reduce(function (a, b) { return a + b; }, 0);
    return new Chart(cv, { type: type, data: { labels: labels, datasets: [{ data: data, backgroundColor: type === 'doughnut' ? PAL : PAL[h ? 1 : 0], borderWidth: 0, borderRadius: type === 'bar' ? 5 : 0 }] },
      options: { responsive: true, maintainAspectRatio: false, indexAxis: h ? 'y' : 'x', animation: { duration: 400 },
        plugins: { legend: { display: type === 'doughnut', position: 'bottom', labels: { boxWidth: 10, padding: 6, font: { size: 10 }, generateLabels: function (c) { return Chart.overrides.doughnut.plugins.legend.labels.generateLabels(c).map(function (l, i) { l.text = labels[i] + ' ' + fr(data[i] / tot * 100, 1) + ' %'; return l; }); } } },
          tooltip: { callbacks: { label: function (c) { var v = typeof c.parsed === 'object' ? (h ? c.parsed.x : c.parsed.y) : c.parsed; return ' ' + fr(v) + ' (' + fr(v / tot * 100, 1) + ' %)'; } } } },
        scales: type === 'doughnut' ? {} : { x: { grid: { display: !!h } }, y: { grid: { display: !h }, ticks: { autoSkip: false, font: { size: 10 } } } } } });
  }
  var ioC = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { ioC.unobserve(e.target); e.target._go(); } }); }, { rootMargin: '400px' }) : null;
  function petit(box, titre, sous, fn) {
    var d = document.createElement('div'); d.className = 'cr-mini'; d.dataset.q = (titre + ' ' + sous).toLowerCase();
    d.innerHTML = '<h4>' + esc(titre) + '</h4><small>' + esc(sous) + '</small><div class="cr-mcv"><canvas></canvas></div>';
    d._go = function () { chart4().then(function () { fn(d.querySelector('canvas')); }); };
    box.appendChild(d); if (ioC) ioC.observe(d); else d._go();
  }
  function top(o, n) { return Object.keys(o).sort(function (a, b) { return o[b] - o[a]; }).slice(0, n); }
  function groupe(sec, id, titre, texte) {
    var g = document.createElement('div'); g.className = 'cr-mass';
    g.innerHTML = '<h3 class="cr-mh">' + titre + '</h3><p class="note">' + texte + '</p><input type="search" class="cr-mq" placeholder="Filtrer ces graphiques…"><div class="cr-mgrid" id="' + id + '"></div>';
    sec.appendChild(g);
    g.querySelector('.cr-mq').oninput = function () { var q = this.value.toLowerCase().trim(); g.querySelectorAll('.cr-mini').forEach(function (m) { m.hidden = q && m.dataset.q.indexOf(q) < 0; }); };
    return $(id);
  }
  function massGraph() {
    var sec = document.querySelector('section[data-view="graphiques"]'); if (massFait || !sec) return; massFait = true;
    var tete = document.createElement('div'); tete.className = 'cr-mcount'; tete.id = 'crMassN'; sec.appendChild(tete);
    var nom = function (k) { try { if (typeof ALX !== 'undefined' && ALX[k]) return ALX[k][0]; } catch (e) {} return k; };
    Promise.all([getJ('data/fleet.json'), getJ('data/types-all.json').catch(function () { return {}; }), getJ('data/opensky.json').catch(function () { return {}; })]).then(function (r) {
      var f = r[0], T = (r[1] && r[1].types) || {}, O = r[2] || {}, n = 0;
      var tn = function (c) { var t = T[c] && T[c][0]; return t ? t[0].charAt(0) + t[0].slice(1).toLowerCase() + ' ' + t[1] : (f.models && f.models[c]) || c; };
      var ops = Object.keys(f.operators || {}).filter(function (k) { return f.operators[k] >= 20 && f.operator_types[k]; }).sort(function (a, b) { return f.operators[b] - f.operators[a]; });
      var b1 = groupe(sec, 'crM1', '✈️ La flotte de chaque compagnie (' + ops.length + ' graphiques)', 'Composition de la flotte par type d’avion, en pourcentage. Source : registre des appareils (OpenSky).');
      ops.forEach(function (k) { var o = f.operator_types[k], t = top(o, 8), autres = Object.keys(o).reduce(function (a, x) { return t.indexOf(x) < 0 ? a + o[x] : a; }, 0);
        petit(b1, nom(k) + ' (' + k + ')', fr(f.operators[k]) + ' appareils', function (cv) { dessiner(cv, 'doughnut', t.map(tn).concat(autres ? ['Autres'] : []), t.map(function (x) { return o[x]; }).concat(autres ? [autres] : [])); }); n++; });
      var tys = Object.keys(f.types || {}).filter(function (k) { return f.types[k] >= 20 && f.type_operators[k]; }).sort(function (a, b) { return f.types[b] - f.types[a]; });
      var b2 = groupe(sec, 'crM2', '🛩️ Qui exploite chaque modèle (' + tys.length + ' graphiques)', 'Les compagnies qui possèdent le plus d’appareils de chaque type, avec leur part en pourcentage.');
      tys.forEach(function (k) { var o = f.type_operators[k], t = top(o, 8);
        petit(b2, tn(k) + ' (' + k + ')', fr(f.types[k]) + ' appareils', function (cv) { dessiner(cv, 'bar', t.map(nom), t.map(function (x) { return o[x]; }), 1); }); n++; });
      var D = O.days || {}, ap = {};
      Object.keys(D).forEach(function (d) { var j = D[d]; Object.keys(j).forEach(function (a) { var x = ap[a] || (ap[a] = { dep: 0, dest: {} }); x.dep += j[a].dep || 0; var de = j[a].dest || {}; Object.keys(de).forEach(function (z) { if (z !== a) x.dest[z] = (x.dest[z] || 0) + de[z]; }); }); });
      var aps = Object.keys(ap).filter(function (a) { return Object.keys(ap[a].dest).length >= 3; }).sort(function (a, b) { return ap[b].dep - ap[a].dep; });
      var NA = {}; var b3 = groupe(sec, 'crM3', '🛫 Destinations depuis chaque aéroport (' + aps.length + ' graphiques)', 'Vols observés par OpenSky sur les ' + Object.keys(D).length + ' derniers jours, par destination (codes OACI).');
      getJ('data/airports.json').then(function (j) { (j.airports || []).forEach(function (x) { if (x[1]) NA[x[1]] = x[3] || x[2]; }); }).catch(function () {}).then(function () {
        aps.forEach(function (a) { var t = top(ap[a].dest, 8);
          petit(b3, (NA[a] || a) + ' (' + a + ')', fr(ap[a].dep) + ' départs observés', function (cv) { dessiner(cv, 'bar', t.map(function (z) { return (NA[z] || z) + ' ' + z; }), t.map(function (z) { return ap[a].dest[z]; }), 1); }); n++; });
        $('crMassN').innerHTML = '<b>' + fr(n + 9) + '</b> graphiques au total sur cette page, tous calculés à partir des données du site et mis à jour par les robots. Ils se dessinent au fur et à mesure que vous faites défiler.';
      });
    }).catch(function () { tete.textContent = 'Données indisponibles pour le moment.'; });
  }

  function vue() { return (location.hash || '#accueil').slice(1) || 'accueil'; }
  function quand() { var v = vue(); if (v === 'accueil') heroPhoto(); if (v === 'comprendre') comprendre(); if (v === 'graphiques') massGraph(); }
  window.addEventListener('hashchange', quand); window.addEventListener('popstate', quand);
  document.addEventListener('click', function (e) { if (e.target.closest('a[href^="#"]')) setTimeout(quand, 40); });
  setTimeout(quand, 350);
})();
