/* Cotes & Routes : recherche par mots-clés dans l'actualité.
   Tous les mots doivent être présents (dans le titre ou le nom du journal), sans tenir compte des accents, majuscules,
   tirets ou apostrophes ; la recherche porte par défaut sur toute l'archive. Les guillemets cherchent une expression exacte,
   un mot précédé de « - » est exclu. Quand la case de recherche est vide, l'affichage habituel de la rubrique reprend. */
(function () {
  "use strict";
  var $ = function (i) { return document.getElementById(i); };
  var cache = {}, idx = null, jeton = 0;
  function norm(s) {
    return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
  }
  function getJSON(u) {
    if (!cache[u]) cache[u] = fetch(u).then(function (r) { if (!r.ok) throw r.status; return r.json(); }).catch(function (e) { delete cache[u]; throw e; });
    return cache[u];
  }
  function index() { return idx || (idx = getJSON("data/news/index.json").catch(function () { idx = null; return { months: {} }; })); }
  function analyse(q) {
    var phr = [], inc = [], exc = [];
    q = q.replace(/"([^"]+)"/g, function (_, p) { var n = norm(p); if (n) phr.push(" " + n + " "); return " "; });
    q.split(/\s+/).forEach(function (w) {
      if (!w) return;
      var neg = w.charAt(0) === "-" && w.length > 1, n = norm(neg ? w.slice(1) : w);
      if (!n) return;
      n.split(" ").forEach(function (m) { (neg ? exc : inc).push(m); });
    });
    return { phr: phr, inc: inc, exc: exc };
  }
  function correspond(a, x) {
    var t = " " + norm(x.t + " " + x.s) + " ", mots = t.split(" ");
    var debut = function (m) { for (var i = 0; i < mots.length; i++) if (mots[i].indexOf(m) === 0) return true; return false; };
    for (var i = 0; i < a.phr.length; i++) if (t.indexOf(a.phr[i]) < 0) return false;
    for (i = 0; i < a.inc.length; i++) if (!debut(a.inc[i])) return false;
    for (i = 0; i < a.exc.length; i++) if (debut(a.exc[i])) return false;
    return true;
  }
  function surligne(titre, a) {
    var h = esc(titre), mots = a.inc.slice();
    a.phr.forEach(function (p) { mots = mots.concat(p.trim().split(" ")); });
    if (!mots.length) return h;
    var src = titre;
    // on repère les positions dans le titre normalisé lettre par lettre (même longueur après suppression des accents)
    var plat = src.normalize("NFD").replace(/[̀-ͯ]/g, "");
    if (plat.length !== src.length) return h;
    var bas = plat.toLowerCase(), marque = new Array(src.length + 1).join("0").split("");
    mots.forEach(function (m) {
      var re = new RegExp("(^|[^a-z0-9])(" + m.replace(/[^a-z0-9]/g, "") + "[a-z0-9]*)", "g"), r;
      while ((r = re.exec(bas))) { for (var k = r.index + r[1].length; k < r.index + r[0].length; k++) marque[k] = "1"; if (re.lastIndex === r.index) re.lastIndex++; }
    });
    var out = "", dans = false;
    for (var i = 0; i < src.length; i++) {
      if (marque[i] === "1" && !dans) { out += "<mark>"; dans = true; }
      if (marque[i] !== "1" && dans) { out += "</mark>"; dans = false; }
      out += esc(src.charAt(i));
    }
    return out + (dans ? "</mark>" : "");
  }
  function jour(d) {
    try { return new Date(d.slice(0, 10) + "T12:00:00Z").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }); }
    catch (e) { return d.slice(0, 10); }
  }
  function moisVoulus(i) {
    var tous = Object.keys(i.months || {}).sort().reverse(), sel = $("nwMonth"), all = $("nwAll");
    if (all && all.checked) return tous;
    var v = sel && sel.value;
    return v && tous.indexOf(v) >= 0 ? [v] : tous;
  }
  var dernier = { cle: "", plus: false, jeton: -1 };
  function chercher(plus) {
    var q = ($("nwQ").value || "").trim(), liste = $("nwList");
    var a = analyse(q), src = $("nwSrc") ? $("nwSrc").value : "", max = 500;
    if (!a.phr.length && !a.inc.length && !a.exc.length) return;
    var cle = [q, src, $("nwMonth") ? $("nwMonth").value : "", $("nwAll") && $("nwAll").checked].join("|");
    // même recherche déjà lancée (événement en double) : on ne recommence pas, et l'on garde « mois plus anciens » si demandé
    if (cle === dernier.cle && dernier.jeton === jeton && (!plus || dernier.plus)) return;
    var n = ++jeton;
    dernier = { cle: cle, plus: !!plus, jeton: n };
    liste.innerHTML = '<p class="note">Recherche en cours…</p>';
    index().then(function (i) {
      var mois = moisVoulus(i), k = 0, vus = {}, res = [];
      // on parcourt les mois du plus récent au plus ancien, trois par trois, et l'on s'arrête dès qu'il y a assez de résultats
      function lot() {
        if (n !== jeton) return;
        var part = mois.slice(k, k + 3);
        return Promise.all(part.map(function (m) { return getJSON("data/news/" + m + ".json").then(function (d) { return d.items || []; }).catch(function () { return []; }); }))
          .then(function (lots) {
            if (n !== jeton) return;
            lots.forEach(function (l) { l.forEach(function (x) { if (!vus[x.u] && (!src || x.s === src) && correspond(a, x)) { vus[x.u] = 1; res.push(x); } }); });
            k += part.length;
            var reste = mois.length - k;
            afficher(res, reste, mois, k);
            if (reste > 0 && (plus || res.length < max)) return lot();
          });
      }
      return lot();
    }).catch(function () { if (n === jeton) liste.innerHTML = '<p class="note">Recherche impossible pour le moment.</p>'; });
    function afficher(res, reste, mois, k) {
      res.sort(function (p, q2) { return p.d < q2.d ? 1 : p.d > q2.d ? -1 : 0; });
      var dernier = mois[k - 1] || "", h = '<p class="note">' + res.length.toLocaleString("fr-FR") + " article" + (res.length > 1 ? "s" : "") + " pour « " + esc(q) + " »" +
        (mois.length === 1 ? " en " + esc(mois[0]) : reste > 0 ? " (recherche faite jusqu’au mois " + esc(dernier) + ")" : " dans toute l’archive") +
        (res.length > max ? " ; affichage des " + max + " plus récents, ajoutez un mot pour préciser." : ".") +
        ' <span style="opacity:.75">Astuces : tous les mots doivent figurer ; "entre guillemets" pour une expression exacte ; -mot pour exclure.</span></p>';
      if (!res.length && !reste) h += '<p class="note">Aucun article ne correspond. Essayez un autre mot ou cochez « Chercher dans toute l’archive ».</p>';
      var cur = "";
      res.slice(0, max).forEach(function (x) {
        var j = x.d.slice(0, 10);
        if (j !== cur) { if (cur) h += "</div>"; h += '<div class="group" style="margin-top:22px"><h3>' + esc(jour(x.d)) + "</h3>"; cur = j; }
        h += '<div class="pair" data-lk="1"><b><a href="' + esc(x.u) + '" target="_blank" rel="noopener">' + surligne(x.t, a) + '</a></b><span class="cty">' + esc(x.s) + " · " + esc(x.d.slice(11, 16)) + " UTC</span></div>";
      });
      if (cur) h += "</div>";
      if (reste > 0 && res.length >= max) h += '<p><button type="button" id="nwPlus">Chercher aussi dans les mois plus anciens</button></p>';
      liste.innerHTML = h;
    }
  }
  var minuteur = null;
  function intercepte(ev) {
    var t = ev.target, id = t && t.id;
    if (["nwQ", "nwSrc", "nwAll", "nwMonth"].indexOf(id) < 0) return;
    var q = ($("nwQ") && $("nwQ").value || "").trim();
    if (!q) { jeton++; dernier.cle = ""; return; } // case vide : l'affichage habituel reprend
    ev.stopImmediatePropagation();
    clearTimeout(minuteur);
    minuteur = setTimeout(chercher, id === "nwQ" ? 250 : 0);
  }
  window.addEventListener("click", function (e) {
    if (e.target && e.target.id === "nwPlus") { e.preventDefault(); e.stopImmediatePropagation(); chercher(true); }
  }, true);
  ["input", "change", "keyup", "search"].forEach(function (t) { document.addEventListener(t, intercepte, true); });
  function prepare() {
    var all = $("nwAll"), q = $("nwQ"), lead = document.querySelector('section[data-view="actu"] .lead');
    if (all && !all.dataset.v32) { all.dataset.v32 = "1"; all.checked = true; }
    if (q) q.placeholder = "Mots-clés : Dole Nice, Air France grève, \"A321XLR\"…";
    if (lead && !lead.dataset.v32) {
      lead.dataset.v32 = "1";
      lead.textContent = "Les dernières nouvelles des compagnies, constructeurs et aéroports. Un robot relève toutes les heures les titres de la presse spécialisée française et internationale et, grâce à Google Actualités, ceux de toute la presse francophone, nationale et régionale ; chaque titre renvoie vers l’article d’origine. Rien n’est effacé : l’archive s’allonge mois après mois. Recherche par mots-clés dans toute l’archive.";
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", prepare); else prepare();
  window.addEventListener("hashchange", function () { setTimeout(prepare, 50); });
})();
