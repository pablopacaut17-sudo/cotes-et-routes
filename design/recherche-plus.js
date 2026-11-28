/* Cotes & Routes : recherche tolérante aux fautes dans la base des accidents.
   Quand la recherche ne trouve pas de réponse à une question sur un accident (« crash Tamanrasset »), ce module
   cherche dans l'index data/accidents-index.json.gz (accidents d'au moins 2 morts) en acceptant les fautes
   d'orthographe et les variantes (Tamanrasset / Tamanrassett), puis affiche les accidents correspondants. */
(function () {
  var MOTS_ACCIDENT = /crash|accident|catastrophe|ecras|drame|tragedie|disparu|disparition|abattu|attentat|incident|enquete|cause|mort|victime|bilan/;
  var VIDES = { crash: 1, accident: 1, catastrophe: 1, cause: 1, causes: 1, avion: 1, aerien: 1, aerienne: 1, vol: 1, mort: 1, morts: 1, bilan: 1, quelle: 1, quel: 1,
    pourquoi: 1, comment: 1, ecrase: 1, ecrasement: 1, enquete: 1, victimes: 1, victime: 1, incident: 1, drame: 1, tragedie: 1, annee: 1, combien: 1, raison: 1, apres: 1, avant: 1 };
  var index = null, chargement = null;
  function norm(t) { return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim(); }
  // « Rui'an », « Xi'an » : l'apostrophe au milieu d'un nom de lieu est collée (« ruian »), sinon les deux morceaux sont trop courts pour être cherchés
  function normA(t) { return norm(String(t || '').replace(/([A-Za-zÀ-ÿ]{3,})['’]([A-Za-zÀ-ÿ]{1,3})\b/g, '$1$2')); }
  function E(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function dist(a, b) {  // distance d'édition (fautes de frappe), arrêtée tôt au-delà de 2
    if (Math.abs(a.length - b.length) > 2) return 9;
    var p = [], i, j;
    for (j = 0; j <= b.length; j++) p[j] = j;
    for (i = 1; i <= a.length; i++) {
      var c = [i], m = i;
      for (j = 1; j <= b.length; j++) { c[j] = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); if (c[j] < m) m = c[j]; }
      if (m > 2) return 9;
      p = c;
    }
    return p[b.length];
  }
  function distT(a, b) {  // comme dist, mais deux lettres inversées ne comptent que pour une faute (« boieng » → « boeing »)
    var d = [], i, j;
    for (i = 0; i <= a.length; i++) { d[i] = [i]; }
    for (j = 0; j <= b.length; j++) d[0][j] = j;
    for (i = 1; i <= a.length; i++) for (j = 1; j <= b.length; j++) {
      var c = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + c);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
    return d[a.length][b.length];
  }
  function proche(w, x) { return w === x || (w.length >= 5 && x.length >= 5 && (x.indexOf(w) === 0 || w.indexOf(x) === 0 || dist(w, x) <= (w.length >= 8 ? 2 : 1))); }
  function lire(url) {
    return fetch(url).then(function (r) { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
      .then(function (b) { return new Response(new Blob([b]).stream().pipeThrough(new DecompressionStream('gzip'))).json(); });
  }
  function charger() {
    if (index) return Promise.resolve(index);
    if (!chargement) chargement = lire('data/accidents-index.json.gz').then(function (d) {
      index = d.accidents.map(function (a) { return { a: a, mots: normA(a[1] + ' ' + a[4] + ' ' + a[2]).split(' ').filter(function (w) { return w.length >= 4; }) }; });
      return index;
    });
    return chargement;
  }
  function chercher(q) {
    var qn = normA(q);
    if (!MOTS_ACCIDENT.test(qn)) return Promise.resolve(null);
    var mots = qn.split(' ').filter(function (w) { return w.length >= 4 && !VIDES[w] && !/^\d+$/.test(w); });
    var annee = (qn.match(/\b(19[2-9]\d|20[0-4]\d)\b/) || [])[1];
    if (!mots.length) return Promise.resolve(null);
    return charger().then(function (L) {
      var res = [];
      L.forEach(function (e) {
        if (annee && e.a[0].slice(0, 4) !== annee) return;
        var s = 0;
        mots.forEach(function (w) { if (e.mots.some(function (x) { return proche(w, x); })) s++; });
        if (s) res.push([s, e.a]);
      });
      res.sort(function (x, y) { return y[0] - x[0] || y[1][5] - x[1][5]; });
      var meilleur = res.length ? res[0][0] : 0;
      return res.filter(function (r) { return r[0] === meilleur; }).slice(0, 5).map(function (r) { return r[1]; });
    });
  }
  function carte(liste) {
    return '<div class="sheet rp-acc" style="grid-template-columns:1fr;margin-top:10px"><div><p class="note">Réponse · base des accidents</p>'
      + liste.map(function (a) {
        var d = a[0].slice(8, 10) + '/' + a[0].slice(5, 7) + '/' + a[0].slice(0, 4);
        if (a[1] && a[1] === a[1].toLowerCase()) a[1] = a[1].charAt(0).toUpperCase() + a[1].slice(1);  // « aéroport de Bahir Dar » → « Aéroport de Bahir Dar »
        return '<h3 style="font-size:1.15rem;margin-top:.8rem">' + E(a[4] || 'Exploitant inconnu') + ' · ' + E(d) + '</h3>'
          + '<p><b>' + a[5] + ' morts</b>' + [(a[2] ? E(a[2]) + (a[3] ? ' (' + E(a[3]) + ')' : '') : ''), E(a[1]) + (a[6] ? ', ' + E(a[6]) : '')].filter(Boolean).map(function (x) { return ' · ' + x; }).join('') + '</p>'
          + (a[8] ? '<p>Cause relevée : ' + E(a[8]) + '</p>' : '<p class="note">Cause non renseignée dans la base : utilisez « Demander à l’IA » pour le déroulement et la cause retenue par l’enquête.</p>');
      }).join('') + '<p class="note">Source : base des accidents de Cotes &amp; Routes (' + E(liste[0][9] || 'NTSB') + '). La recherche tolère les fautes d’orthographe.</p></div></div>';
  }

  /* Grandes fiches encyclopédiques (data/fiches.json) : affichées en tête quand la question nomme le sujet
     (« Airbus en 50 lignes », « histoire du 747 »). La fiche la plus précise l'emporte (« Boeing 737 » → 737). */
  var fiches = null, fchg = null;
  function chargerFiches() {
    if (fiches) return Promise.resolve(fiches);
    if (!fchg) fchg = fetch('data/fiches.json').then(function (r) { return r.json(); }).then(function (d) { fiches = d.fiches; return fiches; });
    return fchg;
  }
  /* Des milliers d'autres fiches (avions, compagnies, aéroports, constructeurs, accidents), tirées de Wikipédia par le
     robot .github/workflows/fiches-wikipedia.yml : index data/fiches-index.json.gz, textes dans data/fiches-wp/fNN.json */
  var VIDES_F = { de: 1, du: 1, des: 1, la: 1, le: 1, les: 1, l: 1, d: 1, et: 1, en: 1, a: 1 };
  // Mots courants qui sont aussi le nom d'une fiche (« L'Avion », compagnie disparue) : jamais retenus seuls
  var COMMUNS = {};
  'avion avions ligne lignes vols aeroport aeroports compagnie compagnies piste pistes ciel histoire nombre distance temps monde voyage voyages passagers passager retard retards meteo accident crash prix billet billets bagage bagages escale direct cargo pilote pilotes equipage hublot aile ailes moteur moteurs'.split(' ').forEach(function (w) { COMMUNS[w] = 1; });
  /* Fautes de frappe sur les noms (« boieng 777 », « Airbis A350 », « Embrear ») : chaque mot inconnu de 5 lettres ou plus
     est remplacé par le mot le plus proche du vocabulaire des fiches (même première lettre, une faute, deux au-delà de 8 lettres). */
  var vocab = null;
  function corriger(q, L) {
    if (!vocab) {
      vocab = {};  // nombre de fiches où chaque mot apparaît ; seules les marques fréquentes (Boeing, Airbus, Embraer…) servent de correction
      L.forEach(function (x) { var vu = {}; [x[0]].concat(x[1] || []).forEach(function (n) { norm(n).split(' ').forEach(function (w) { if (w.length >= 5 && !/\d/.test(w) && !vu[w]) { vu[w] = 1; vocab[w] = (vocab[w] || 0) + 1; } }); }); });
      (fiches || []).forEach(function (f) { f.mots.forEach(function (m) { norm(m).split(' ').forEach(function (w) { if (w.length >= 5) vocab[w] = (vocab[w] || 0) + 3; }); }); });
    }
    var V = Object.keys(vocab).filter(function (w) { return vocab[w] >= 3; });
    return norm(q).split(' ').map(function (w) {
      if (w.length < 6 || vocab[w] || /\d/.test(w) || COMMUNS[w]) return w;
      var best = null, bd = 9;
      V.forEach(function (x) { if (x[0] !== w[0] || Math.abs(x.length - w.length) > 2) return; var d = distT(w, x); if (d < bd) { bd = d; best = x; } });
      return best && bd <= (w.length >= 8 ? 2 : 1) ? best : w;
    }).join(' ');
  }
  var idxWp = null, idxChg = null;
  function chargerIndexWp() {
    if (idxWp) return Promise.resolve(idxWp);
    if (!idxChg) idxChg = lire('data/fiches-index.json.gz').then(function (d) { idxWp = d.fiches || []; return idxWp; }).catch(function () { idxWp = []; return idxWp; });
    return idxChg;
  }
  function trouverWp(q) {
    var qn = ' ' + norm(q) + ' ', codes = {};
    (q.match(/\b[A-Z0-9]{3,4}\b/g) || []).forEach(function (c) { codes[c] = 1; });  // codes OACI/IATA tapés en majuscules (CDG, AFR, LFPG)
    return chargerIndexWp().then(function (L) {
      var best = null, lg = 0, nb = -1;
      qn = ' ' + corriger(q, L) + ' ';
      L.forEach(function (x) {
        var noms = [x[0]].concat(x[1] || []), score = 0;
        noms.forEach(function (n) {
          var mots = norm(n).split(' ').filter(function (m) { return m && !VIDES_F[m]; });
          if (!mots.length || (mots.length === 1 && (mots[0].length < 5 || COMMUNS[mots[0]]))) return;
          if (mots.every(function (m) { return qn.indexOf(' ' + m + ' ') >= 0; })) score = Math.max(score, mots.join(' ').length);
        });
        (x[2] || []).forEach(function (c) { if (codes[c] && c.length >= 3) score = Math.max(score, 3); });
        if (score > lg || (score === lg && score && x[6] > nb)) { best = x; lg = score; nb = x[6] || 0; }
      });
      if (!best) return null;
      return fetch('data/fiches-wp/' + best[3] + '.json').then(function (r) { return r.json(); }).then(function (b) {
        var f = b[best[5]];
        if (!f || !f.x) return null;
        return { titre: f.t, texte: f.x, wp: f.wp || f.t, maj: f.d, cat: best[4], score: lg, img: f.img };
      });
    });
  }
  // Pour la palette « Chercher partout » (design/site-v5.js) : index des grandes fiches et carte d'une fiche
  window.CR_RECH = {
    index: function () { return chargerIndexWp(); },
    cartePour: function (x) {
      return fetch('data/fiches-wp/' + x[3] + '.json').then(function (r) { return r.json(); }).then(function (b) {
        var f = b[x[5]];
        return f && f.x ? carteFiche({ titre: f.t, texte: f.x, wp: f.wp || f.t, maj: f.d, cat: x[4], img: f.img }) : '';
      });
    },
    lancer: function (q) {
      var i = ['gq3', 'gq2', 'gq'].map(function (x) { return document.getElementById(x); }).filter(function (x) { return x && x.offsetParent; })[0] || document.getElementById('gq2');
      if (!i) return;
      i.value = q; i.dispatchEvent(new Event('input', { bubbles: true }));
      i.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }));
    }
  };
  function trouverFiche(q) {
    var qn = ' ' + norm(q) + ' ';
    return chargerFiches().then(function (L) {
      var best = null, lg = 0;
      if (idxWp) qn = ' ' + corriger(q, idxWp) + ' ';
      L.forEach(function (f) { f.mots.forEach(function (m) { var mn = norm(m); if (qn.indexOf(' ' + mn + ' ') >= 0 && mn.length > lg) { lg = mn.length; best = f; } }); });
      return trouverWp(q).catch(function () { return null; }).then(function (w) {
        // la fiche vérifiée à la main l'emporte, sauf si celle de Wikipédia est nettement plus précise (« Airbus A330 » plutôt que « Airbus »)
        return best && !(w && w.score > lg + 2) ? best : (w || best);
      });
    });
  }
  function md(t) {
    var h = '', liste = false;
    t.split('\n').forEach(function (l) {
      var x = E(l).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
      if (/^- /.test(l)) { if (!liste) { h += '<ul>'; liste = true; } h += '<li>' + x.slice(2) + '</li>'; }
      else { if (liste) { h += '</ul>'; liste = false; } if (l.trim()) h += '<p>' + x + '</p>'; }
    });
    return h + (liste ? '</ul>' : '');
  }

  /* Distance et durée de vol entre deux villes ou deux aéroports (« durée de vol Paris Tokyo », « distance CDG JFK »),
     calculées sur l'orthodromie à partir de la base des aéroports (data/airports.json) */
  var EXO = { londres: 'london', pekin: 'beijing', moscou: 'moscow', 'le caire': 'cairo', varsovie: 'warsaw', vienne: 'vienna', lisbonne: 'lisbon', venise: 'venice',
    bruxelles: 'brussels', geneve: 'geneva', copenhague: 'copenhagen', athenes: 'athens', alger: 'algiers', 'le cap': 'cape town', bombay: 'mumbai', singapour: 'singapore',
    seoul: 'seoul', montreal: 'montreal', quebec: 'quebec', 'la havane': 'havana', dubai: 'dubai', hanoi: 'hanoi', francfort: 'frankfurt', barcelone: 'barcelona',
    seville: 'seville', edimbourg: 'edinburgh', noumea: 'noumea', 'sao paulo': 'sao paulo', bogota: 'bogota', cologne: 'cologne', munich: 'munich', florence: 'florence',
    naples: 'naples', milan: 'milan', 'new york': 'new york', 'la nouvelle orleans': 'new orleans', 'nouvelle delhi': 'new delhi', delhi: 'delhi', taipei: 'taipei', 'tel aviv': 'tel aviv' };
  var apts = null, aptChg = null;
  function chargerApts() {
    if (apts) return Promise.resolve(apts);
    if (!aptChg) aptChg = fetch('data/airports.json').then(function (r) { return r.json(); }).then(function (d) { apts = d.airports || []; return apts; });
    return aptChg;
  }
  function lieuxCites(q) {
    var res = [], vus = {};
    (q.match(/\b[A-Z]{3,4}\b/g) || []).forEach(function (c) {
      var a = apts.filter(function (x) { return x[0] === c || x[1] === c; })[0];
      if (a && !vus[a[1]]) { vus[a[1]] = 1; res.push({ nom: a[3] + ' (' + (a[0] || a[1]) + ')', a: a, pos: q.indexOf(c) }); }
    });
    var qn = ' ' + norm(q) + ' ';
    Object.keys(EXO).forEach(function (fr) { var i = qn.indexOf(' ' + fr + ' '); if (i >= 0) qn = qn.slice(0, i) + ' ' + EXO[fr] + ' ' + qn.slice(i + fr.length + 2); });
    var villes = indexVilles().principal;
    var mots = qn.trim().split(' ');
    for (var i = 0; i < mots.length && res.length < 2; i++) {
      for (var l = Math.min(4, mots.length - i); l >= 1; l--) {
        var g = mots.slice(i, i + l).join(' ');
        if (g.length < 4 && l === 1) continue;
        var a = villes[g];
        if (a && !vus[a[1]]) {
          var fr = Object.keys(EXO).filter(function (k) { return EXO[k] === g; })[0];
          vus[a[1]] = 1; var base = String(a[3]).split(/[(,\/]/)[0].trim();
          res.push({ nom: fr && norm(base) !== norm(fr) ? fr.replace(/(^| )\S/g, function (c) { return c.toUpperCase(); }) : base, a: a, pos: i, ville: g }); i += l - 1; break;
        }
      }
    }
    return res.slice(0, 2);
  }
  var IV = null;
  function poids(a) { return (a[10] || 0) * 1e6 + (a[11] || []).reduce(function (s, p) { return s + (p[1] || 0); }, 0); }
  function indexVilles() {  // ville → aéroport principal, et tous les aéroports de cette ville (même pays)
    if (IV) return IV;
    var principal = {}, tous = {};
    apts.forEach(function (a) {
      if (!a[3] || !(a[10] >= 1)) return;
      [norm(a[3]), norm(String(a[3]).split(/[(,\/]/)[0])].forEach(function (v, i) {
        if (!v || (i && v === norm(a[3]))) return;
        if (!principal[v] || poids(principal[v]) < poids(a)) principal[v] = a;
        (tous[v] = tous[v] || []).push(a);
      });
    });
    Object.keys(tous).forEach(function (v) { var p = principal[v]; tous[v] = tous[v].filter(function (a) { return a[4] === p[4] && a[0]; }); });
    IV = { principal: principal, tous: tous };
    return IV;
  }
  function carteDistance(q) {
    if (!/(distance|duree de vol|temps de vol|combien de temps|combien d heures|km entre|kilometres|heures de vol|long le vol|dure le vol)/.test(' ' + norm(q) + ' ')) return Promise.resolve(null);
    return chargerApts().then(function () {
      var L = lieuxCites(q);
      if (L.length < 2) return null;
      var a = L[0].a, b = L[1].a, R = Math.PI / 180;
      var x = Math.sin((b[7] - a[7]) * R / 2), y = Math.sin((b[8] - a[8]) * R / 2);
      var km = 2 * 6371 * Math.asin(Math.sqrt(x * x + Math.cos(a[7] * R) * Math.cos(b[7] * R) * y * y));
      var h = km / 820 + 0.5, hh = Math.floor(h), mm = Math.round((h - hh) * 12) * 5; if (mm === 60) { hh++; mm = 0; }
      return '<div class="sheet rp-dist" style="grid-template-columns:1fr;margin-top:10px"><div><p class="note">Calcul · base des aéroports</p>'
        + '<h3 style="font-size:1.3rem">' + E(L[0].nom) + ' → ' + E(L[1].nom) + '</h3>'
        + '<p>Distance orthodromique (la plus courte, celle que suivent à peu près les avions) : <b>' + Math.round(km).toLocaleString('fr-FR') + ' km</b>, soit ' + Math.round(km / 1.852).toLocaleString('fr-FR') + ' milles nautiques.</p>'
        + '<p>Durée d’un vol direct : environ <b>' + hh + ' h ' + String(mm).padStart(2, '0') + '</b> (estimation à 820 km/h de croisière plus 30 minutes pour le décollage et l’approche). La durée réelle varie avec les vents : vers l’est, le courant-jet raccourcit souvent le vol ; vers l’ouest, il l’allonge. Des contournements d’espaces aériens fermés peuvent aussi l’allonger.</p>'
        + '<p class="note">Aéroports retenus : ' + E(a[2]) + ' (' + E(a[0] || a[1]) + ') et ' + E(b[2]) + ' (' + E(b[0] || b[1]) + ').</p></div></div>';
    }).catch(function () { return null; });
  }
  /* Avions observés sur une ligne (« quel avion sur la ligne Paris Montréal », « vols entre CDG et JFK ») : totaux par ligne
     des vols relevés par ADSB.lol (data/vols/lignes/AAAA-MM.json, recopiés par lignes-vols.yml), tous aéroports des deux villes. */
  var NOMS_T = { B738: 'Boeing 737-800', B737: 'Boeing 737-700', B739: 'Boeing 737-900', B38M: 'Boeing 737 MAX 8', B39M: 'Boeing 737 MAX 9', B734: 'Boeing 737-400', B733: 'Boeing 737-300',
    A318: 'Airbus A318', A319: 'Airbus A319', A320: 'Airbus A320', A321: 'Airbus A321', A19N: 'Airbus A319neo', A20N: 'Airbus A320neo', A21N: 'Airbus A321neo', BCS1: 'Airbus A220-100', BCS3: 'Airbus A220-300',
    A332: 'Airbus A330-200', A333: 'Airbus A330-300', A338: 'Airbus A330-800neo', A339: 'Airbus A330-900neo', A359: 'Airbus A350-900', A35K: 'Airbus A350-1000', A388: 'Airbus A380', A306: 'Airbus A300-600',
    B752: 'Boeing 757-200', B753: 'Boeing 757-300', B762: 'Boeing 767-200', B763: 'Boeing 767-300', B764: 'Boeing 767-400', B772: 'Boeing 777-200', B77L: 'Boeing 777-200LR / 777F', B773: 'Boeing 777-300', B77W: 'Boeing 777-300ER',
    B788: 'Boeing 787-8', B789: 'Boeing 787-9', B78X: 'Boeing 787-10', B744: 'Boeing 747-400', B748: 'Boeing 747-8', B712: 'Boeing 717', MD11: 'McDonnell Douglas MD-11',
    E170: 'Embraer 170', E75L: 'Embraer 175', E75S: 'Embraer 175', E190: 'Embraer 190', E195: 'Embraer 195', E290: 'Embraer 190-E2', E295: 'Embraer 195-E2', E145: 'Embraer ERJ 145', E45X: 'Embraer ERJ 145XR', E135: 'Embraer ERJ 135',
    CRJ2: 'Bombardier CRJ200', CRJ7: 'Bombardier CRJ700', CRJ9: 'Bombardier CRJ900', CRJX: 'Bombardier CRJ1000', DH8A: 'Dash 8-100', DH8C: 'Dash 8-300', DH8D: 'Dash 8-400 (Q400)',
    AT45: 'ATR 42-500', AT46: 'ATR 42-600', AT75: 'ATR 72-500', AT76: 'ATR 72-600', SF34: 'Saab 340', PC12: 'Pilatus PC-12', C208: 'Cessna 208 Caravan',
    GLEX: 'Bombardier Global Express', GL7T: 'Bombardier Global 7500', CL35: 'Bombardier Challenger 350', CL60: 'Bombardier Challenger 600', F2TH: 'Dassault Falcon 2000', F900: 'Dassault Falcon 900', FA7X: 'Dassault Falcon 7X', FA8X: 'Dassault Falcon 8X', GLF6: 'Gulfstream G650', C56X: 'Cessna Citation Excel', E55P: 'Embraer Phenom 300', PC24: 'Pilatus PC-24' };
  var lignesV = null, lignesChg = null;
  function chargerLignes() {
    if (lignesV) return Promise.resolve(lignesV);
    if (!lignesChg) {
      var d = new Date(), m1 = d.toISOString().slice(0, 7); d.setDate(0); var m0 = d.toISOString().slice(0, 7);
      lignesChg = Promise.all([m0, m1].map(function (m) { return fetch('data/vols/lignes/' + m + '.json').then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }); }))
        .then(function (L) {
          var t = { lignes: {}, jours: [] };
          L.forEach(function (x) {
            if (!x || !x.lignes) return;
            t.jours = t.jours.concat(x.jours || []);
            Object.keys(x.lignes).forEach(function (k) {
              var a = x.lignes[k], b = t.lignes[k] || (t.lignes[k] = { n: 0, types: {} });
              b.n += a.n || 0; Object.keys(a.types || {}).forEach(function (ty) { b.types[ty] = (b.types[ty] || 0) + a.types[ty]; });
            });
          });
          lignesV = t; return t;
        });
    }
    return lignesChg;
  }
  function aeroportsDe(lieu) {
    var v = lieu.ville && indexVilles().tous[lieu.ville];
    return v && v.length ? v : [lieu.a];
  }
  function carteLignes(q) {
    var qn = ' ' + norm(q) + ' ';
    if (!/ (avion|avions|appareil|appareils|type|types|modele|modeles|vols entre|vol entre|ligne|liaison|combien de vols|nombre de vols) /.test(qn)) return Promise.resolve(null);
    if (/(distance|duree de vol|temps de vol|combien de temps|km entre|kilometres)/.test(qn)) return Promise.resolve(null);
    return chargerApts().then(function () {
      var L = lieuxCites(q);
      if (L.length < 2 || L[0].a[1] === L[1].a[1]) return null;
      var A = aeroportsDe(L[0]), B = aeroportsDe(L[1]);
      return chargerLignes().then(function (T) {
        var nj = T.jours.length; if (!nj) return null;
        var aller = 0, retour = 0, types = {}, paires = [];
        A.forEach(function (a) {
          B.forEach(function (b) {
            [[a, b, 1], [b, a, 0]].forEach(function (s) {
              var x = T.lignes[s[0][0] + '-' + s[1][0]]; if (!x || !x.n) return;
              if (s[2]) aller += x.n; else retour += x.n;
              if (s[2]) paires.push([s[0][0] + ' → ' + s[1][0], x.n]);
              Object.keys(x.types).forEach(function (t) { types[t] = (types[t] || 0) + x.types[t]; });
            });
          });
        });
        if (!aller && !retour) return null;
        var tot = 0; Object.keys(types).forEach(function (t) { tot += types[t]; });
        var tri = Object.keys(types).sort(function (x, y) { return types[y] - types[x]; }).slice(0, 6);
        var j = function (n) { return (n / nj).toLocaleString('fr-FR', { maximumFractionDigits: 1 }); };
        paires.sort(function (x, y) { return y[1] - x[1]; });
        return '<div class="sheet rp-lignes" style="grid-template-columns:1fr;margin-top:10px"><div><p class="note">Vols observés · ADSB.lol</p>'
          + '<h3 style="font-size:1.25rem">' + E(L[0].nom) + ' ⇄ ' + E(L[1].nom) + ' : les avions de la ligne</h3>'
          + '<p>Avions les plus souvent observés sur cette ligne (les deux sens) :</p><ul>'
          + tri.map(function (t) { return '<li><b>' + E(NOMS_T[t] || t) + '</b>' + (NOMS_T[t] ? ' (' + E(t) + ')' : '') + ' : ' + Math.round(types[t] / tot * 100) + ' % des vols</li>'; }).join('') + '</ul>'
          + '<p>Vols relevés : <b>' + aller + '</b> dans le sens ' + E(L[0].nom) + ' → ' + E(L[1].nom) + ' et <b>' + retour + '</b> au retour, sur ' + nj + ' jour' + (nj > 1 ? 's' : '')
          + ' (≈ ' + j(aller) + ' et ' + j(retour) + ' par jour)' + (paires.length > 1 ? ' ; par aéroport : ' + paires.map(function (p) { return E(p[0]) + ' ' + p[1]; }).join(', ') : '') + '.</p>'
          + '<p class="note">Source : relevés ADS-B du réseau ADSB.lol (licence ODbL), vols dont le départ et l’arrivée ont été reconnus, aviation d’affaires comprise. '
          + 'Une partie des vols n’est pas reconnue : le nombre réel de vols est souvent plus élevé.</p></div></div>';
      });
    }).catch(function () { return null; });
  }
  /* Questions-réponses vérifiées (data/faq/) : proposées quand la recherche n'a donné que la réponse générale
     sur la sécurité (« accident du vol Rio Paris 2009 ») et qu'aucun accident de la base ne correspond. */
  var faqChg = null;
  function jetonsFaq(t) {
    var o = {}; norm(t).split(' ').forEach(function (w) { if (w.length > 1 && !VIDES_FAQ[w]) o[w.length > 3 ? w.replace(/[sx]$/, '') : w] = 1; }); return o;
  }
  var VIDES_FAQ = {};
  'le la les l un une des de du d et ou a au aux en dans sur sous pour par avec sans est sont c ce cet cette ces qu que qui quoi quel quelle quels quelles comment pourquoi combien quand il elle ils on se sa son ses leur leurs plus moins tres y ne pas s passe lors'.split(' ').forEach(function (w) { VIDES_FAQ[w] = 1; });
  function chercherFaq(q) {
    if (!faqChg) faqChg = Promise.all([fetch('data/faq/index.json').then(function (r) { return r.json(); }), fetch('data/faq/verifiees.json').then(function (r) { return r.json(); }).catch(function () { return {}; })]);
    return faqChg.then(function (x) {
      var I = x[0], V = x[1] || {}, a = jetonsFaq(q), na = Object.keys(a).length; if (!na) return null;
      var best = null, bs = 0;
      I.questions.forEach(function (e) {
        if ((V.rejetees || {})[e[0]]) return;
        var b = jetonsFaq(e[1]), nb = Object.keys(b).length, u = 0; for (var w in a) if (b[w]) u++;
        var sc = u / na * 0.7 + u / Math.max(1, nb) * 0.3;
        if (u >= Math.min(2, na) && sc > bs) { bs = sc; best = e; }
      });
      if (!best || bs < 0.55) return null;
      return fetch('data/faq/' + ('000' + Math.floor(best[0] / (I.taille || 500))).slice(-4) + '.json').then(function (r) { return r.json(); }).then(function (f) {
        var r = f.reponses[String(best[0])]; if (!r) return null;
        var ok = !!(V.verifiees || {})[best[0]];
        return '<div class="sheet rp-faq" style="grid-template-columns:1fr;margin-top:10px"><div><p class="note">' + (ok ? 'Réponse vérifiée · ' : 'Réponse · ') + 'Questions-réponses Cotes &amp; Routes</p>'
          + '<h3 style="font-size:1.2rem">' + E(best[1]) + '</h3>' + md((V.corrigees || {})[best[0]] || r[0]) + '</div></div>';
      });
    }).catch(function () { return null; });
  }
  function photoFiche(f) {
    var im = f.img; if (!im || !im.u) return '';
    var cr = [im.a, im.l].filter(Boolean).join(' · ') || 'Wikimedia Commons';
    return '<figure style="margin:6px 0 12px"><img src="' + E(im.u) + '" alt="' + E(f.titre) + '" loading="lazy" decoding="async" style="width:100%;max-height:340px;object-fit:cover;border-radius:12px">'
      + '<figcaption class="note">Photo : <a href="https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(im.f || '') + '" target="_blank" rel="noopener">' + E(cr) + '</a></figcaption></figure>';
  }
  var CATS_F = { avion: 'Avion', compagnie: 'Compagnie aérienne', aeroport: 'Aéroport', constructeur: 'Constructeur', accident: 'Accident' };
  function carteFiche(f) {
    if (f.wp) {
      var u = 'https://fr.wikipedia.org/wiki/' + encodeURIComponent(f.wp.replace(/ /g, '_'));
      return '<div class="sheet rp-fiche" style="grid-template-columns:1fr;margin-top:10px"><div><p class="note">Fiche encyclopédique · ' + E(CATS_F[f.cat] || '') + '</p>'
        + '<h3 style="font-size:1.3rem">' + E(f.titre) + '</h3>' + photoFiche(f) + md(f.texte)
        + '<p class="note">Texte de l’article <a href="' + u + '" target="_blank" rel="noopener">« ' + E(f.wp) + ' » de Wikipédia</a> (licence CC BY-SA 4.0), relu le ' + E(String(f.maj).split('-').reverse().join('/')) + '.</p></div></div>';
    }
    return '<div class="sheet rp-fiche" style="grid-template-columns:1fr;margin-top:10px"><div><p class="note">Fiche encyclopédique · vérifiée</p>'
      + '<h3 style="font-size:1.3rem">' + E(f.titre) + '</h3>' + md(f.texte)
      + '<p class="note">Sources : ' + E(f.sources.join(', ')) + ' · mise à jour le ' + E(f.maj) + '.</p></div></div>';
  }
  var derniere = '', derniereF = '', derniereD = '', ficheQ = null;
  /* « Où était F-GSQA hier ? » : vols d'un avion (par immatriculation) dans l'archive ADSB.lol des derniers jours
     (dépôt cotes-et-routes-vols, même origine que le site). Deux journées au plus sont lues (≈ 2,5 Mo chacune). */
  var VOLS = '../cotes-et-routes-vols/', volsIdx = null, volsJours = {};
  function immatDe(q) {
    var m = String(q).toUpperCase().match(/\b(N[1-9][0-9]{0,4}[A-Z]{0,2}|[A-Z]{1,2}-[A-Z0-9]{2,5}|[A-Z]{2}-[0-9]{3,5})\b/);
    if (!m) return null;
    var r = m[1];
    if (/^N\d/.test(r) && !/ (immat|immatricul|avion|ou etait|vols? de|trajets?|registre) /.test(' ' + norm(q) + ' ') && norm(q).split(' ').length > 1) return null;
    return r;
  }
  function jourVols(j) {
    if (!volsJours[j]) volsJours[j] = lire(VOLS + 'jours/' + j + '.json.gz').catch(function () { return null; });
    return volsJours[j];
  }
  function carteImmat(q) {
    var im = immatDe(q); if (!im) return Promise.resolve(null);
    var cle = im.replace(/-/g, '');
    if (!volsIdx) volsIdx = fetch(VOLS + 'index.json').then(function (r) { return r.ok ? r.json() : { jours: [] }; }).catch(function () { return { jours: [] }; });
    return Promise.all([volsIdx, chargerApts()]).then(function (x) {
      var jours = (x[0].jours || []).slice(-2).reverse(); if (!jours.length) return null;
      return Promise.all(jours.map(jourVols)).then(function (D) {
        var vols = [], type = '';
        D.forEach(function (d, k) {
          if (!d) return;
          var c = d.champs, iI = c.indexOf('immatriculation');
          d.vols.forEach(function (v) { if (String(v[iI] || '').replace(/-/g, '').toUpperCase() === cle) { vols.push([jours[k], v, c]); type = type || v[c.indexOf('type')]; } });
        });
        if (!vols.length) return '<div class="sheet rp-immat" style="grid-template-columns:1fr;margin-top:10px"><div><p class="note">Vols observés · ADSB.lol</p><p>Aucun vol de <b>' + E(im) + '</b> n’a été capté le ' + jours.map(function (j) { return j.split('-').reverse().join('/'); }).join(' ni le ') + ' par le réseau d’antennes ADSB.lol (l’avion n’a peut-être pas volé, ou hors de portée des antennes).</p></div></div>';
        var nomA = function (c) { if (!c) return 'lieu inconnu'; var a = (apts || []).filter(function (z) { return z[0] === c || z[1] === c; })[0]; return a ? String(a[3]).split(/[(,\/]/)[0].trim() + ' (' + c + ')' : c; };
        vols.sort(function (a, b) { return (b[0] + b[1][4]).localeCompare(a[0] + a[1][4]); });
        return '<div class="sheet rp-immat" style="grid-template-columns:1fr;margin-top:10px"><div><p class="note">Vols observés · ADSB.lol</p>'
          + '<h3 style="font-size:1.2rem">' + E(im) + (type ? ' · ' + E(NOMS_T[type] || type) : '') + ' : ses derniers vols</h3><ul>'
          + vols.slice(0, 12).map(function (w) {
            var v = w[1], c = w[2], g = function (n) { return v[c.indexOf(n)]; };
            return '<li><b>' + E(w[0].split('-').reverse().join('/')) + ', ' + E(g('debut_utc')) + '–' + E(g('fin_utc')) + ' UTC</b> : ' + E(nomA(g('depart'))) + ' → ' + E(nomA(g('arrivee')))
              + (g('indicatif') ? ' · vol ' + E(g('indicatif')) : '') + (g('distance_km') ? ' · ' + Number(g('distance_km')).toLocaleString('fr-FR') + ' km' : '') + '</li>';
          }).join('') + '</ul><p class="note">Données ADSB.lol (ODbL), captées par des antennes bénévoles : un départ ou une arrivée hors de leur portée apparaît comme « lieu inconnu ». Heures en temps universel (Paris = UTC + 1 h en hiver).</p></div></div>';
      });
    });
  }
  /* Horaires constatés et spotting d'un aéroport (« horaires CDG », « départs de Nice », « spotting Roissy », « quand voir un A380 à CDG ») :
     fichier aeroports/<CODE>.json de l'archive des vols (dépôt cotes-et-routes-vols). Ce ne sont pas les horaires officiels. */
  var MOTS_APT = / (horaire|horaires|depart|departs|arrivee|arrivees|decollage|decollages|atterrissage|atterrissages|spotting|spotter|spotters|tableau|quand voir|ou voir|mouvements|vols du jour|vols d hier|programme) /;
  var SURNOMS_APT = { 'roissy': 'CDG', 'charles de gaulle': 'CDG', 'orly': 'ORY', 'lyon': 'LYS', 'saint exupery': 'LYS', 'marignane': 'MRS', 'blagnac': 'TLS', 'merignac': 'BOD',
    'beauvais': 'BVA', 'zaventem': 'BRU', 'heathrow': 'LHR', 'gatwick': 'LGW', 'stansted': 'STN', 'luton': 'LTN', 'schiphol': 'AMS', 'barajas': 'MAD', 'el prat': 'BCN', 'fiumicino': 'FCO',
    'malpensa': 'MXP', 'linate': 'LIN', 'cointrin': 'GVA', 'kloten': 'ZRH', 'tegel': 'BER', 'brandebourg': 'BER', 'mirabel': 'YMX', 'trudeau': 'YUL', 'kennedy': 'JFK', 'jfk': 'JFK',
    'la guardia': 'LGA', 'laguardia': 'LGA', 'newark': 'EWR', 'o hare': 'ORD', 'narita': 'NRT', 'haneda': 'HND', 'changi': 'SIN', 'dubai': 'DXB', 'doha': 'DOH', 'mulhouse': 'MLH',
    'bale': 'BSL', 'entzheim': 'SXB', 'nantes atlantique': 'NTE', 'lesquin': 'LIL', 'montpellier': 'MPL', 'bordeaux': 'BOD', 'toulouse': 'TLS', 'marseille': 'MRS', 'nice': 'NCE' };
  function heureLoc(hm, tz) {
    try { var d = new Date(); d.setUTCHours(+hm.slice(0, 2), +hm.slice(3, 5), 0, 0); return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: tz || 'UTC' }); } catch (e) { return hm; }
  }
  function carteAeroport(q) {
    var qn = ' ' + norm(q) + ' ';
    if (!MOTS_APT.test(qn) || / (vers|entre) /.test(qn) && !/spott/.test(qn)) return Promise.resolve(null);
    return chargerApts().then(function () {
      var L = lieuxCites(q), codes = [];
      // ordre : surnom connu (« Roissy », « Orly », « Lyon »), puis ville citée, puis mots du nom de l'aéroport
      var al = Object.keys(SURNOMS_APT).filter(function (k) { return qn.indexOf(' ' + k + ' ') >= 0; })[0];
      if (al) codes.push(SURNOMS_APT[al]);
      if (L.length) aeroportsDe(L[0]).forEach(function (a) { codes.push(a[0] || a[1]); });
      var mots = qn.trim().split(' ').filter(function (w) { return w.length >= 4 && !MOTS_APT.test(' ' + w + ' ') && !/^(hier|aujourd|demain|aeroport|airport|pour|avec|quels|quel|quelle|vols|les|des)/.test(w); });
      (apts || []).filter(function (a) { var n = ' ' + norm(a[2]) + ' '; return a[0] && a[10] >= 2 && mots.some(function (w) { return n.indexOf(' ' + w + ' ') >= 0; }); })
        .sort(function (a, b) { return b[10] - a[10]; }).slice(0, 3).forEach(function (a) { codes.push(a[0]); });
      codes = codes.filter(function (c, i) { return c && codes.indexOf(c) === i; }).slice(0, 6);
      if (!codes.length) return null;
      var essai = function (i) {
        if (i >= codes.length) return Promise.resolve(null);
        return fetch(VOLS + 'aeroports/' + codes[i] + '.json').then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; })
          .then(function (d) { return d && d.mouvements ? d : essai(i + 1); });
      };
      return essai(0).then(function (d) {
        if (!d) return null;
        var tz = d.tz || 'UTC', nomA = function (c) { var a = (apts || []).filter(function (z) { return z[0] === c || z[1] === c; })[0]; return a ? String(a[3]).split(/[(,\/]/)[0].trim() + ' (' + c + ')' : (c || '?'); };
        var nT = function (t) { return NOMS_T[t] || t || ''; };
        var table = function (rows, sens, habit) {
          if (!rows.length) return '<p>Aucun vol constaté pour l’instant.</p>';
          return '<div style="overflow-x:auto"><table class="rp-tab" style="width:100%;border-collapse:collapse;font-size:.92rem"><thead><tr><th style="text-align:left">Heure</th><th style="text-align:left">Vol</th><th style="text-align:left">' + (sens === 'D' ? 'Destination' : 'Provenance') + '</th><th style="text-align:left">Avion</th>' + (habit ? '<th>Vu</th>' : '') + '</tr></thead><tbody>'
            + rows.map(function (r, k) {
              return '<tr' + (k >= 40 ? ' class="rp-plus" hidden' : '') + ' style="border-top:1px solid rgba(127,140,160,.25)"><td><b>' + heureLoc(r[0], tz) + '</b></td><td>' + E(r[1]) + '</td><td>' + E(nomA(r[2])) + '</td><td>' + E(nT(habit ? r[4] : r[3])) + (habit ? '' : (r[4] ? ' · ' + E(r[4]) : '')) + '</td>' + (habit ? '<td style="text-align:center">' + r[3] + ' j</td>' : '') + '</tr>';
            }).join('') + '</tbody></table></div>' + (rows.length > 40 ? '<button type="button" class="rp-voir" style="margin-top:8px">Voir les ' + rows.length + ' vols</button>' : '');
        };
        var JS = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'];
        var cren = Object.keys(d.creneaux || {}).sort(function (a, b) { return d.creneaux[b].n - d.creneaux[a].n; }).slice(0, 12).map(function (t) {
          var k = d.creneaux[t], hm = k.heures.indexOf(Math.max.apply(null, k.heures)), jm = k.jours.map(function (n, i) { return [n, i]; }).filter(function (x) { return x[0]; }).sort(function (a, b) { return b[0] - a[0]; }).slice(0, 3);
          var h = heureLoc((hm < 10 ? '0' : '') + hm + ':00', tz);
          return '<li><b>' + E(nT(t)) + '</b> : ' + k.n + ' passage' + (k.n > 1 ? 's' : '') + ', surtout vers ' + h.slice(0, 2) + ' h' + (jm.length ? ' (' + jm.map(function (x) { return JS[x[1]]; }).join(', ') + ')' : '') + '</li>';
        });
        var rares = (d.rares || []).slice(0, 15).map(function (r) {
          return '<li>' + E(r[0].split('-').reverse().join('/')) + ', ' + heureLoc(r[1], tz) + ' : <b>' + E(nT(r[2])) + '</b>' + (r[3] ? ' ' + E(r[3]) : '') + (r[4] ? ' (vol ' + E(r[4]) + ')' : '') + ', ' + (r[5] === 'D' ? 'vers ' : 'depuis ') + E(nomA(r[6])) + '</li>';
        });
        var spotting = /spott|quand voir|ou voir/.test(qn);
        var onglets = [['dep', 'Départs habituels'], ['arr', 'Arrivées habituelles'], ['hier', 'Hier'], ['spot', 'Spotting']];
        var actif = spotting ? 'spot' : / (arrivee|arrivees|atterrissage|atterrissages) /.test(qn) ? 'arr' : / (hier|vols du jour) /.test(qn) ? 'hier' : 'dep';
        var pans = {
          dep: table(d.departs, 'D', 1), arr: table(d.arrivees, 'A', 1),
          hier: '<h4>Départs du ' + E(d.maj.split('-').reverse().join('/')) + '</h4>' + table(d.hier_departs, 'D', 0) + '<h4>Arrivées</h4>' + table(d.hier_arrivees, 'A', 0),
          spot: '<h4>Gros porteurs et avions remarquables : quand les voir</h4>' + (cren.length ? '<ul>' + cren.join('') + '</ul>' : '<p>Aucun gros porteur constaté sur la période.</p>')
            + '<h4>Visiteurs rares cette semaine</h4>' + (rares.length ? '<ul>' + rares.join('') + '</ul>' : '<p>Il faut au moins une semaine d’archive pour repérer les visiteurs rares.</p>')
            + '<h4>Types les plus fréquents</h4><p>' + Object.keys(d.types).filter(Boolean).slice(0, 12).map(function (t) { return E(nT(t)) + ' (' + d.types[t] + ')'; }).join(' · ') + '</p>'
        };
        var id = 'rpa' + Math.random().toString(36).slice(2, 7);
        return '<div class="sheet rp-apt" id="' + id + '" style="grid-template-columns:minmax(0,1fr);margin-top:10px;max-width:100%;min-width:0"><div><p class="note">Vols constatés · ADSB.lol</p>'
          + '<h3 style="font-size:1.2rem">' + E(d.nom) + ' (' + E(d.code) + ')</h3>'
          + '<p class="note">' + d.mouvements.toLocaleString('fr-FR') + ' mouvements captés du ' + E(d.periode[0].split('-').reverse().join('/')) + ' au ' + E(d.periode[1].split('-').reverse().join('/')) + ' (' + d.jours + ' jour' + (d.jours > 1 ? 's' : '') + '). Heures locales' + (d.tz ? ' (' + E(d.tz) + ')' : ' (UTC)') + '. Ce ne sont pas les horaires officiels des compagnies : ce sont les vols réellement observés ; un vol « habituel » a été vu plusieurs jours, à l’heure médiane de décollage ou d’atterrissage.</p>'
          + '<div class="rp-ong" style="display:flex;flex-wrap:wrap;gap:6px;margin:8px 0">' + onglets.map(function (o) { return '<button type="button" data-o="' + o[0] + '"' + (o[0] === actif ? ' aria-pressed="true" style="font-weight:700"' : '') + '>' + o[1] + '</button>'; }).join('') + '</div>'
          + onglets.map(function (o) { return '<div data-p="' + o[0] + '"' + (o[0] === actif ? '' : ' hidden') + '>' + pans[o[0]] + '</div>'; }).join('')
          + '</div></div>';
      });
    });
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.rp-apt [data-o], .rp-apt .rp-voir'); if (!b) return;
    var box = b.closest('.rp-apt');
    if (b.classList.contains('rp-voir')) { b.parentNode.querySelectorAll('.rp-plus').forEach(function (r) { r.hidden = false; }); b.remove(); return; }
    box.querySelectorAll('[data-o]').forEach(function (x) { var on = x === b; x.setAttribute('aria-pressed', on); x.style.fontWeight = on ? '700' : ''; });
    box.querySelectorAll('[data-p]').forEach(function (p) { p.hidden = p.getAttribute('data-p') !== b.getAttribute('data-o'); });
  });
  /* Lignes d'une compagnie (« lignes d'Air France », « destinations easyJet depuis Nice », « réseau de Transavia ») :
     compagnies/<OACI>.json de l'archive des vols (vols observés, pas le programme officiel). */
  var cpIdx = null, CP_CARTES = {}, lfChg = null;
  function chargerLeaflet() {
    if (!document.getElementById('rp-lf-css')) { var st = document.createElement('style'); st.id = 'rp-lf-css'; st.textContent = '.sheet .leaflet-container svg,.sheet .leaflet-container img{width:auto;max-width:none;height:auto}'; document.head.appendChild(st); }  // « .sheet svg {width:100%} » écrasait la couche des lignes
    if (!document.querySelector('link[href*="leaflet"]')) { var c0 = document.createElement('link'); c0.rel = 'stylesheet'; c0.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(c0); }
    if (window.L && window.L.map) return Promise.resolve(window.L);
    if (!lfChg) lfChg = new Promise(function (ok, ko) {
      var c = document.createElement('link'); c.rel = 'stylesheet'; c.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(c);
      var j = document.createElement('script'); j.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; j.onload = function () { ok(window.L); }; j.onerror = ko; document.head.appendChild(j);
    });
    return lfChg;
  }
  function arc(a, b) {  // grand cercle approché (20 points), coupé au passage de l'antiméridien
    var r = Math.PI / 180, la1 = a[0] * r, lo1 = a[1] * r, la2 = b[0] * r, lo2 = b[1] * r;
    var d = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin((la1 - la2) / 2), 2) + Math.cos(la1) * Math.cos(la2) * Math.pow(Math.sin((lo1 - lo2) / 2), 2)));
    if (d < 1e-6) return [[a, b]];
    var pts = [];
    for (var i = 0; i <= 20; i++) {
      var f = i / 20, A = Math.sin((1 - f) * d) / Math.sin(d), B = Math.sin(f * d) / Math.sin(d);
      var x = A * Math.cos(la1) * Math.cos(lo1) + B * Math.cos(la2) * Math.cos(lo2), y = A * Math.cos(la1) * Math.sin(lo1) + B * Math.cos(la2) * Math.sin(lo2), z = A * Math.sin(la1) + B * Math.sin(la2);
      pts.push([Math.atan2(z, Math.sqrt(x * x + y * y)) / r, Math.atan2(y, x) / r]);
    }
    var segs = [[pts[0]]];
    for (var k = 1; k < pts.length; k++) { if (Math.abs(pts[k][1] - pts[k - 1][1]) > 180) segs.push([]); segs[segs.length - 1].push(pts[k]); }
    return segs;
  }
  function dessinerCarte(id) {
    var el = document.getElementById(id), D = CP_CARTES[id]; if (!el || !D || el.dataset.ok) return;
    el.hidden = false; el.dataset.ok = '1';
    chargerLeaflet().then(function (L) {
      var m = L.map(el, { scrollWheelZoom: false, worldCopyJump: true });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 12, attribution: '© OpenStreetMap' }).addTo(m);
      var pos = function (c) { var a = (apts || []).filter(function (z) { return z[0] === c || z[1] === c; })[0]; return a && a[7] != null ? [a[7], a[8], String(a[3]).split(/[(,\/]/)[0].trim()] : null; };
      var vus = {}, poids = {}, pts = [], dests = {}, dep = {}, arr = {};
      D.routes.forEach(function (r) {
        (dests[r[0]] = dests[r[0]] || {})[r[1]] = 1; (dests[r[1]] = dests[r[1]] || {})[r[0]] = 1;
        dep[r[0]] = (dep[r[0]] || 0) + r[2]; arr[r[1]] = (arr[r[1]] || 0) + r[2];
      });
      var routes = D.filtre && D.filtre.length ? D.routes.filter(function (r) { return D.filtre.indexOf(r[0]) >= 0; }) : D.routes;
      var parJour = function (n) { var v = n / D.jours; return v >= 10 ? Math.round(v) : v.toLocaleString('fr-FR', { maximumFractionDigits: 1 }); };
      routes.forEach(function (r) {
        var k = [r[0], r[1]].sort().join('-'); poids[r[0]] = (poids[r[0]] || 0) + r[2]; poids[r[1]] = (poids[r[1]] || 0) + r[2];
        if (vus[k]) return; vus[k] = 1;
        var a = pos(r[0]), b = pos(r[1]); if (!a || !b) return;
        arc(a, b).forEach(function (sg) { L.polyline(sg, { color: '#0E6E8C', weight: 1.2, opacity: .55 }).addTo(m); });
      });
      Object.keys(poids).forEach(function (c) {
        var p = pos(c); if (!p) return; pts.push([p[0], p[1]]);
        L.circleMarker([p[0], p[1]], { radius: Math.min(9, 2.5 + Math.sqrt(poids[c]) / 2), color: '#12313B', weight: 1, fillColor: '#F2B705', fillOpacity: .9 })
          .bindTooltip(p[2] + ' (' + c + ')')
          .bindPopup('<b>' + E(p[2]) + ' (' + c + ')</b><br>' + E(D.nom) + ' : <b>' + Object.keys(dests[c] || {}).length + '</b> destination' + (Object.keys(dests[c] || {}).length > 1 ? 's' : '') + ' depuis cet aéroport<br>'
            + '<b>' + parJour(dep[c] || 0) + '</b> départ' + ((dep[c] || 0) / D.jours >= 2 ? 's' : '') + ' et <b>' + parJour(arr[c] || 0) + '</b> arrivée' + ((arr[c] || 0) / D.jours >= 2 ? 's' : '') + ' par jour en moyenne'
            + '<br><span style="opacity:.7;font-size:.85em">Vols constatés sur ' + D.jours + ' jour' + (D.jours > 1 ? 's' : '') + '</span>').addTo(m);
      });
      if (pts.length) m.fitBounds(pts, { padding: [20, 20], maxZoom: 6 }); else m.setView([30, 10], 2);
    }).catch(function () { el.innerHTML = '<p class="note" style="padding:12px">La carte n’a pas pu se charger (connexion).</p>'; });
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.rp-cpcarte'); if (!b) return;
    dessinerCarte(b.getAttribute('data-c')); b.remove();
  });
  function carteCompagnie(q) {
    var qn = ' ' + norm(q) + ' ';
    if (!/ (ligne|lignes|destination|destinations|reseau|routes|route|dessert|desservies|desservis|vole|volent) /.test(qn)) return Promise.resolve(null);
    if (!cpIdx) cpIdx = fetch(VOLS + 'compagnies/index.json').then(function (r) { return r.ok ? r.json() : { compagnies: {} }; }).catch(function () { return { compagnies: {} }; });
    return Promise.all([cpIdx, chargerApts()]).then(function (x) {
      var C = x[0].compagnies || {}, best = null, lg = 0;
      Object.keys(C).forEach(function (k) {
        var n = norm(C[k][0] || ''); if (n.length < 3) return;
        var court = n.replace(/ (airlines|airways|air lines|aviation|compagnie)$/, ''), un = n.split(' ')[0];
        if (un.length >= 6 && qn.indexOf(' ' + un + ' ') >= 0 && lg <= un.length && (!best || lg < un.length || C[k][2] > C[best][2])) { best = k; lg = un.length; }  // « Transavia » → Transavia France ou Holland (la plus active)
        [n, court].forEach(function (m) { if (m.length >= 4 && qn.indexOf(' ' + m + ' ') >= 0 && (m.length > lg || m.length === lg && C[k][2] > C[best][2])) { best = k; lg = m.length; } });
        if (C[k][1] && new RegExp('\\b' + C[k][1] + '\\b').test(q) && lg < 2) { best = k; lg = 2; }
      });
      if (!best) return null;
      return fetch(VOLS + 'compagnies/' + best + '.json').then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
        if (!d) return null;
        var nomA = function (c) { var a = (apts || []).filter(function (z) { return z[0] === c || z[1] === c; })[0]; return a ? String(a[3]).split(/[(,\/]/)[0].trim() + ' (' + c + ')' : c; };
        var L = lieuxCites(q.replace(new RegExp(d.nom, 'i'), '')), codes = L.length ? aeroportsDe(L[0]).map(function (a) { return a[0] || a[1]; }) : [];
        var R = d.routes.filter(function (r) { return !codes.length || codes.indexOf(r[0]) >= 0; });
        var tri = Object.keys(d.types).slice(0, 6).map(function (t) { return E(NOMS_T[t] || t); }).join(', ');
        var idc = 'cpm' + Math.random().toString(36).slice(2, 8);
        CP_CARTES[idc] = { routes: d.routes.slice(0, 1500), nom: d.nom || d.code, jours: d.jours || 1, filtre: codes };
        var auto = / (carte|cartes|plan|map) /.test(qn);
        return '<div class="sheet rp-cp" style="grid-template-columns:minmax(0,1fr);margin-top:10px"><div><p class="note">Vols constatés · ADSB.lol</p>'
          + '<h3 style="font-size:1.2rem">' + E(d.nom || d.code) + (d.iata ? ' (' + E(d.iata) + ')' : '') + ' : ' + (codes.length ? 'lignes au départ de ' + E(L[0].nom) : 'ses lignes') + '</h3>'
          + (R.length ? '<button type="button" class="rp-cpcarte" data-c="' + idc + '"' + (auto ? ' data-auto="1"' : '') + ' style="margin:4px 0 8px">Voir la carte des destinations</button><div id="' + idc + '" style="height:340px;border-radius:12px;margin-bottom:10px" hidden></div>' : '')
          + '<p>' + d.vols.toLocaleString('fr-FR') + ' vols et ' + d.avions + ' avions différents captés du ' + E(d.periode[0].split('-').reverse().join('/')) + ' au ' + E(d.periode[1].split('-').reverse().join('/')) + '. Avions les plus utilisés : ' + tri + '.</p>'
          + (R.length ? '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:.92rem"><thead><tr><th style="text-align:left">Ligne</th><th>Vols</th><th>Jours</th></tr></thead><tbody>'
            + R.slice(0, 60).map(function (r) { return '<tr style="border-top:1px solid rgba(127,140,160,.25)"><td>' + E(nomA(r[0])) + ' → ' + E(nomA(r[1])) + '</td><td style="text-align:center">' + r[2] + '</td><td style="text-align:center">' + r[3] + '</td></tr>'; }).join('')
            + '</tbody></table></div>' + (R.length > 60 ? '<p class="note">… et ' + (R.length - 60) + ' autres lignes.</p>' : '') : '<p>Aucune ligne constatée' + (codes.length ? ' au départ de cet aéroport' : '') + ' pour l’instant.</p>')
          + '<p class="note">Lignes réellement volées (départ et arrivée captés par les antennes ADSB.lol), pas le programme officiel ; noms des compagnies : OpenFlights (ODbL).</p></div></div>';
      });
    });
  }
  function verifier() {
    var ans = document.getElementById('gAns'); if (!ans) return;
    var q = ''; ['gq', 'gq2', 'gq3'].forEach(function (id) { var x = document.getElementById(id); if (x && x.value.trim().length > q.length) q = x.value.trim(); });
    if (q && q !== derniereD) {
      derniereD = q;
      carteDistance(q).then(function (h) { if (h && q === derniereD && !ans.querySelector('.rp-dist')) ans.insertAdjacentHTML('afterbegin', h); });
      carteCompagnie(q).then(function (h) {
        if (!h || q !== derniereD || ans.querySelector('.rp-cp')) return;
        var g = document.getElementById('gRes'); if (g && /Aucun résultat/.test(g.textContent)) g.innerHTML = '';
        ans.insertAdjacentHTML('afterbegin', h);
        var ba = ans.querySelector('.rp-cp [data-auto]'); if (ba) ba.click();
      }).catch(function () {});
      carteAeroport(q).then(function (h) {
        if (!h || q !== derniereD || ans.querySelector('.rp-apt')) return;
        var g = document.getElementById('gRes'); if (g && /Aucun résultat/.test(g.textContent)) g.innerHTML = '';
        ans.insertAdjacentHTML('afterbegin', h);
      }).catch(function () {});
      carteImmat(q).then(function (h) {
        if (!h || q !== derniereD || ans.querySelector('.rp-immat')) return;
        var g = document.getElementById('gRes'); if (g && /Aucun résultat/.test(g.textContent)) g.innerHTML = '';
        ans.insertAdjacentHTML('afterbegin', h);
      }).catch(function () {});
      carteLignes(q).then(function (h) {
        if (!h || q !== derniereD || ans.querySelector('.rp-lignes')) return;
        ans.insertAdjacentHTML(/ (avion|avions|appareil|appareils|type|types|modele|modeles) /.test(' ' + norm(q) + ' ') ? 'afterbegin' : 'beforeend', h);
      });
    }
    if (q && q !== derniereF) {
      derniereF = q; ficheQ = null;
      trouverFiche(q).then(function (f) { if (q !== derniereF) return; ficheQ = f; if (f && !ans.querySelector('.rp-fiche')) ans.insertAdjacentHTML('afterbegin', carteFiche(f)); }).catch(function () {});
    } else if (ficheQ && !ans.querySelector('.rp-fiche')) ans.insertAdjacentHTML('afterbegin', carteFiche(ficheQ));
    if (!q || q === derniere || ans.querySelector('.rp-acc')) return;
    var generique = /L’avion est-il sûr/.test(ans.textContent);  // réponse générale sur la sécurité : un accident précis est peut-être demandé (« accident Buga 1995 »)
    var dejaFiche = ans.querySelector('.rp-fiche');
    // Question précise sur un accident (« accident aéroport de Bahir Dar 1988 ») : on cherche dans la base des accidents même si la
    // recherche a déjà affiché autre chose (la fiche de l'aéroport, un autre grand accident…) ; la carte de l'accident passe devant.
    var precise = MOTS_ACCIDENT.test(norm(q)) && /\b(19[2-9]\d|20[0-4]\d)\b/.test(q);
    if (!precise && ans.textContent.trim() && !generique && !(dejaFiche && ans.textContent.trim() === dejaFiche.textContent.trim())
        && !/Aucun résultat/.test((document.getElementById('gRes') || {}).textContent || '')) return;  // la recherche a déjà répondu
    derniere = q;
    chercher(q).then(function (liste) {
      if ((!liste || !liste.length) && generique) {  // pas d'accident trouvé : peut-être une question-réponse vérifiée (« vol Rio Paris »)
        return chercherFaq(q).then(function (h) {
          if (!h || q !== derniere || ans.querySelector('.rp-faq') || !/L’avion est-il sûr/.test(ans.textContent)) return;
          Array.prototype.slice.call(ans.children).forEach(function (el) { if (!/rp-(fiche|dist|lignes)/.test(el.className)) el.remove(); });
          ans.insertAdjacentHTML('afterbegin', h);
        });
      }
      if (!liste || !liste.length || ans.querySelector('.rp-acc')) return;
      if (generique && /L’avion est-il sûr/.test(ans.textContent)) {  // l'accident précis remplace la réponse générale
        Array.prototype.slice.call(ans.children).forEach(function (el) { if (!el.classList.contains('rp-fiche')) el.remove(); });
      }
      ans.insertAdjacentHTML('afterbegin', carte(liste));
    }).catch(function () {});
  }
  function demarrer() {
    var res = document.getElementById('gRes');
    if (!res) return;
    var mo = new MutationObserver(function () { setTimeout(verifier, 50); });
    mo.observe(res, { childList: true, subtree: true, characterData: true });
    var a = document.getElementById('gAns'); if (a) mo.observe(a, { childList: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer); else demarrer();
})();
