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
  function verifier() {
    var ans = document.getElementById('gAns'); if (!ans) return;
    var q = ''; ['gq', 'gq2', 'gq3'].forEach(function (id) { var x = document.getElementById(id); if (x && x.value.trim().length > q.length) q = x.value.trim(); });
    if (q && q !== derniereD) {
      derniereD = q;
      carteDistance(q).then(function (h) { if (h && q === derniereD && !ans.querySelector('.rp-dist')) ans.insertAdjacentHTML('afterbegin', h); });
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
