/* Cotes & Routes : base mondiale des accidents et incidents (rubrique Accidents).
   Données : data/accidents/AAAA.json (NTSB, Wikidata, AAIB, TSB, CENIPA), un fichier par année.
   Recherche par mots-clés (tous les mots doivent figurer, sans accents ni majuscules), filtre « mortels », filtre par source.
   Les années sont lues de la plus récente à la plus ancienne et la recherche s'arrête dès qu'il y a assez de résultats. */
(function () {
  "use strict";
  var $ = function (i) { return document.getElementById(i); };
  var cache = {}, idx = null, jeton = 0, MAX = 300;
  function norm(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim(); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function getJSON(u) {
    if (!cache[u]) cache[u] = fetch(u).then(function (r) { if (!r.ok) throw r.status; return r.json(); }).catch(function (e) { delete cache[u]; throw e; });
    return cache[u];
  }
  function index() { return idx || (idx = getJSON("data/accidents/index.json").catch(function () { idx = null; return null; })); }
  function jour(d) {
    try { return new Date(d + "T12:00:00Z").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }); } catch (e) { return d; }
  }
  function construire() {
    var sec = document.querySelector('section[data-view="accidents"]');
    if (!sec || $("abBase")) return;
    var d = document.createElement("div");
    d.id = "abBase"; d.className = "group"; d.style.marginTop = "28px";
    d.innerHTML = '<h2>🌍 Base mondiale : tous les accidents et incidents <small>sources officielles ouvertes</small></h2>' +
      '<p class="note" id="abStatus">Chargement de la base…</p>' +
      '<div class="controls"><input type="search" id="abQ" placeholder="Mots-clés : A320, Air France, Toulouse, F-GKXA, Cessna 172, 1999…" aria-label="Rechercher dans la base des accidents">' +
      '<select id="abGrav" aria-label="Gravité"><option value="">Tous les événements</option><option value="m">Accidents mortels seulement</option></select>' +
      '<select id="abSrc" aria-label="Source"><option value="">Toutes les sources</option></select></div><div id="abList"></div>';
    sec.appendChild(d);
    index().then(function (i) {
      if (!i) { $("abStatus").textContent = "La base mondiale sera disponible après le premier passage du robot « Accidents »."; return; }
      var an = Object.keys(i.annees).sort();
      $("abStatus").textContent = i.total.toLocaleString("fr-FR") + " accidents et incidents de " + an[0] + " à " + an[an.length - 1] + " (" +
        Object.keys(i.sources).map(function (s) { return s + " : " + i.sources[s].toLocaleString("fr-FR"); }).join(", ") + "). Mise à jour : " + i.maj + ". Aviation militaire et drones exclus.";
      var sel = $("abSrc");
      Object.keys(i.sources).forEach(function (s) { var o = document.createElement("option"); o.value = s; o.textContent = s; sel.appendChild(o); });
      chercher(false);
    });
    ["input", "change", "search"].forEach(function (t) {
      d.addEventListener(t, function (e) { if (/^ab(Q|Grav|Src)$/.test(e.target.id)) { clearTimeout(d._t); d._t = setTimeout(function () { chercher(false); }, e.target.id === "abQ" ? 250 : 0); } });
    });
    d.addEventListener("click", function (e) { if (e.target && e.target.id === "abPlus") chercher(true); });
  }
  function chercher(plus) {
    var q = norm($("abQ").value), mots = q ? q.split(" ") : [], mortels = $("abGrav").value === "m", src = $("abSrc").value, n = ++jeton, liste = $("abList");
    index().then(function (i) {
      if (!i || n !== jeton) return;
      var annees = Object.keys(i.annees).sort().reverse(), k = 0, res = [], max = q || mortels || src ? MAX : 100;
      liste.innerHTML = '<p class="note">Recherche en cours…</p>';
      function lot() {
        if (n !== jeton) return;
        var part = annees.slice(k, k + 3);
        return Promise.all(part.map(function (a) { return getJSON("data/accidents/" + a + ".json").then(function (d) { return d.items || []; }).catch(function () { return []; }); })).then(function (lots) {
          if (n !== jeton) return;
          lots.forEach(function (L) {
            L.forEach(function (x) {
              if (mortels && !(x[6] > 0 || /mortel/.test(x[7]))) return;
              if (src && x[9] !== src) return;
              if (mots.length) {
                var t = " " + norm(x.slice(0, 10).join(" ")) + " ";
                for (var m = 0; m < mots.length; m++) if (t.indexOf(" " + mots[m]) < 0) return;
              }
              res.push(x);
            });
          });
          k += part.length;
          var reste = annees.length - k;
          afficher(res, reste, annees[k - 1], max, q);
          if (reste > 0 && (plus || res.length < max)) return lot();
        });
      }
      return lot();
    });
  }
  function afficher(res, reste, dernier, max, q) {
    res.sort(function (a, b) { return a[0] < b[0] ? 1 : a[0] > b[0] ? -1 : 0; });
    var h = '<p class="note">' + res.length.toLocaleString("fr-FR") + " événement" + (res.length > 1 ? "s" : "") +
      (reste > 0 ? " (recherche faite jusqu’en " + esc(dernier) + ")" : " dans toute la base") + (res.length > max ? " ; affichage des " + max + " plus récents." : ".") + "</p>";
    res.slice(0, max).forEach(function (x) {
      var titre = [x[3], x[4]].filter(Boolean).join(" · ") || "Appareil non précisé";
      var lieu = [x[2], x[1]].filter(Boolean).join(", ");
      var lien = /^https?:/.test(x[10]) ? ' <a href="' + esc(x[10]) + '" target="_blank" rel="noopener">source</a>' : (x[10] ? " · dossier " + esc(x[9]) + " n° " + esc(x[10]) : "");
      h += '<div class="pair"><b>' + esc(jour(x[0])) + " — " + esc(titre) + '</b><span class="cty">' + esc(lieu) + (x[5] ? " · " + esc(x[5]) : "") +
        (x[6] > 0 ? " · <b>" + x[6] + " mort" + (x[6] > 1 ? "s" : "") + "</b>" : "") + (x[7] ? " · " + esc(x[7]) : "") + " · " + esc(x[9]) + lien + "</span>" +
        (x[8] ? '<span style="display:block;opacity:.85;font-size:.92em">' + esc(x[8]) + "</span>" : "") + "</div>";
    });
    if (reste > 0 && res.length >= max) h += '<p><button type="button" id="abPlus">Chercher aussi dans les années plus anciennes</button></p>';
    $("abList").innerHTML = h;
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", construire); else construire();
  window.addEventListener("hashchange", function () { setTimeout(construire, 50); });
})();
