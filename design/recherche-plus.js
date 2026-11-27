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
  function proche(w, x) { return w === x || (w.length >= 5 && x.length >= 5 && (x.indexOf(w) === 0 || w.indexOf(x) === 0 || dist(w, x) <= (w.length >= 8 ? 2 : 1))); }
  function lire(url) {
    return fetch(url).then(function (r) { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
      .then(function (b) { return new Response(new Blob([b]).stream().pipeThrough(new DecompressionStream('gzip'))).json(); });
  }
  function charger() {
    if (index) return Promise.resolve(index);
    if (!chargement) chargement = lire('data/accidents-index.json.gz').then(function (d) {
      index = d.accidents.map(function (a) { return { a: a, mots: norm(a[1] + ' ' + a[4] + ' ' + a[2]).split(' ').filter(function (w) { return w.length >= 4; }) }; });
      return index;
    });
    return chargement;
  }
  function chercher(q) {
    var qn = norm(q);
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
        return '<h3 style="font-size:1.15rem;margin-top:.8rem">' + E(a[4] || 'Exploitant inconnu') + ' · ' + E(d) + '</h3>'
          + '<p><b>' + a[5] + ' morts</b> · ' + E(a[2]) + (a[3] ? ' (' + E(a[3]) + ')' : '') + ' · ' + E(a[1]) + (a[6] ? ', ' + E(a[6]) : '') + '</p>'
          + (a[8] ? '<p>Cause relevée : ' + E(a[8]) + '</p>' : '<p class="note">Cause non renseignée dans la base : utilisez « Demander à l’IA » pour le déroulement et la cause retenue par l’enquête.</p>');
      }).join('') + '<p class="note">Source : base des accidents de Cotes &amp; Routes (' + E(liste[0][9] || 'NTSB') + '). La recherche tolère les fautes d’orthographe.</p></div></div>';
  }
  var derniere = '';
  function verifier() {
    var ans = document.getElementById('gAns'); if (!ans) return;
    var q = ''; ['gq', 'gq2', 'gq3'].forEach(function (id) { var x = document.getElementById(id); if (x && x.value.trim().length > q.length) q = x.value.trim(); });
    if (!q || q === derniere || ans.querySelector('.rp-acc')) return;
    if (ans.textContent.trim() && !/Aucun résultat/.test((document.getElementById('gRes') || {}).textContent || '')) return;  // la recherche a déjà répondu
    derniere = q;
    chercher(q).then(function (liste) {
      if (liste && liste.length && !ans.querySelector('.rp-acc')) ans.insertAdjacentHTML('afterbegin', carte(liste));
    }).catch(function () {});
  }
  function demarrer() {
    var res = document.getElementById('gRes');
    if (!res) return;
    new MutationObserver(function () { setTimeout(verifier, 50); }).observe(res, { childList: true, subtree: true, characterData: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer); else demarrer();
})();
