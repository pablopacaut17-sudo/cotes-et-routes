/* Cotes & Routes – v36 : réponse détaillée à toute question sur un accident ou un crash (barre de recherche).
   Quand la recherche parle d'un accident (crash, catastrophe, disparition, vol AF447…), le site affiche
   une fiche complète :
   - l'article de Wikipédia en français correspondant (résumé, déroulement, enquête, causes, conséquences),
   - une fiche « en bref » tirée de Wikidata (date, lieu, appareil, exploitant, morts, survivants, cause),
   - les dossiers officiels de la base des accidents du site (NTSB, AAIB, TSB) le même jour,
   - et, si Wikipédia ne connaît pas l'événement, les accidents de la base qui correspondent aux mots tapés.
   Aucune IA : uniquement des sources ouvertes (Wikipédia CC BY-SA, Wikidata CC0, enquêteurs officiels).
   Aviation militaire et drones exclus. */
(function () {
  "use strict";
  var $ = function (i) { return document.getElementById(i); };
  function norm(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim(); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var MOTS_ACC = /\b(crash|crashe|accident|accidents|catastrophe|ecrase|ecrasee|ecrasement|incident|drame|tragedie|disparition|disparu|disparue|abime|amerrissage|amerri|collision|explosion|attentat|detournement|detourne|abattu|naufrage|sortie de piste|victimes|morts|survivants|boite noire|boites noires|bea|ntsb|enquete)\b/;
  var VOL = /\b(vol|flight)\s+([a-z]{0,3}\s?\d{1,4})\b|\b([a-z]{2}|[a-z]\d|\d[a-z])\s?(\d{2,4})\b/;
  var MILITAIRE = /\b(militaire|armee de l air|armee de terre|air force|marine nationale|navy|luftwaffe|chasseur|bombardier strategique|drone|guerre mondiale|bataille)\b/;
  var VIDES = "que qu quoi qui quel quelle quels quelles est ce c s il elle ils passe passee passes lors du de la le les l un une des d pourquoi comment combien quand ou raconte raconte moi explique expliquez explication details detail detaille detaillee savoir sur a au aux en et y t on m peux pouvez tu vous dis dites moi ca cela cet cette ces son sa ses leur leurs je j veux voudrais aimerais tout tous toute toutes histoire avion appareil aerien aerienne infos info information informations question reponse cause causes raison raisons s est arrive eu lieu fait".split(" ");
  var WP = "https://fr.wikipedia.org/w/api.php?format=json&origin=*&";
  var WD = "https://www.wikidata.org/w/api.php?format=json&origin=*&";
  var GARDER = /contexte|vol|deroulement|chronologie|accident|crash|catastrophe|enquete|cause|rapport|conclusion|consequence|suite|victime|passager|equipage|appareil|avion|aeronef|recommandation|bilan|recherche|epave|boite|secours|proces|meteo|disparition|collision|detournement|explication|hypothese/;
  var JETER = /note|reference|voir aussi|lien|bibliographie|culture|media|film|documentaire|televis|litterature|galerie|annexe|source/;
  var cache = {}, dernier = "", minuteur = null, jeton = 0;

  function getJSON(u) {
    if (cache[u]) return Promise.resolve(cache[u]);
    return fetch(u).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (j) { cache[u] = j; return j; });
  }
  function concerneAccident(q) { var n = norm(q); return MOTS_ACC.test(n) || /\b(vol|flight)\s+[a-z]{0,3}\s?\d{1,4}\b/.test(n) || /\b(mh370|mh17|af447|af 447|4u9525|9525|et302|jt610|ps752|pk8303|ms804)\b/.test(n); }
  function nettoyer(q) {
    var n = norm(q).split(" ").filter(function (w) { return w && VIDES.indexOf(w) < 0; });
    return n.join(" ");
  }
  function sansMotsAcc(s) { return s.split(" ").filter(function (w) { return !MOTS_ACC.test(w); }).join(" "); }

  // ---------- Wikipédia : trouver l'article ----------
  function score(r, mots) {
    var t = norm(r.title), sn = norm(String(r.snippet || "").replace(/<[^>]+>/g, "")), s = 0;
    if (/^(vol|accident|catastrophe|crash|collision|disparition|attentat|ecrasement|incendie|detournement|explosion)\b/.test(t)) s += 4;
    if (MOTS_ACC.test(sn) || /\bvol\b/.test(sn)) s += 1;
    if (/aerien|avion|aeroport|helicoptere|appareil|boeing|airbus|douglas|tupolev|ilyouchine|antonov|dirigeable|zeppelin/.test(t + " " + sn)) s += 2;
    mots.forEach(function (m) { if (m.length > 1 && t.indexOf(m) >= 0) s += 1; });
    if (MILITAIRE.test(t)) s -= 10;
    return s;
  }
  function chercherArticle(q) {
    var c = nettoyer(q), base = sansMotsAcc(c), mots = base.split(" ");
    var essais = [base + " accident aérien", c, base + " vol"].filter(function (x, i, a) { return x.trim() && a.indexOf(x) === i; });
    var i = 0;
    function suivant() {
      if (i >= essais.length) return Promise.resolve(null);
      var e = essais[i++];
      return getJSON(WP + "action=query&list=search&srlimit=10&srnamespace=0&srsearch=" + encodeURIComponent(e)).then(function (j) {
        var L = ((j.query || {}).search || []).map(function (r) { return { r: r, s: score(r, mots) }; }).filter(function (x) { return x.s >= 5; });
        L.sort(function (a, b) { return b.s - a.s; });
        return L.length ? L[0].r.title : suivant();
      }).catch(function () { return suivant(); });
    }
    return suivant();
  }
  function article(titre) {
    return getJSON(WP + "action=query&prop=extracts|pageprops|info&inprop=url&explaintext=1&exsectionformat=wiki&redirects=1&titles=" + encodeURIComponent(titre)).then(function (j) {
      var p = j.query && j.query.pages, k = p && Object.keys(p)[0];
      return k && p[k].extract ? p[k] : null;
    });
  }
  function decouper(txt) {
    var parts = String(txt).split(/\n(={2,4}) *([^=\n]+?) *\1\n/), intro = parts[0], S = [];
    for (var i = 1; i < parts.length; i += 3) S.push({ niv: parts[i].length, titre: parts[i + 1], texte: (parts[i + 2] || "").trim() });
    return { intro: intro.trim(), sections: S };
  }
  function paragraphes(t, max) {
    t = String(t || "").trim();
    var coupe = false;
    if (t.length > max) { t = t.slice(0, max); t = t.slice(0, Math.max(t.lastIndexOf(". "), max * 0.6) + 1); coupe = true; }
    return t.split(/\n+/).filter(Boolean).map(function (x) { return "<p>" + esc(x) + "</p>"; }).join("") + (coupe ? '<p class="note">…</p>' : "");
  }

  // ---------- Wikidata : fiche en bref ----------
  var PROPS = [["P585", "Date"], ["P276", "Lieu"], ["P17", "Pays"], ["P121", "Appareil"], ["P137", "Exploitant"], ["P1120", "Morts"], ["P1561", "Survivants"], ["P1339", "Blessés"], ["P828", "Cause"], ["P3999", "Date de fin"]];
  function fiche(qid) {
    if (!qid) return Promise.resolve(null);
    return getJSON(WD + "action=wbgetentities&props=claims&ids=" + qid).then(function (j) {
      var e = j.entities && j.entities[qid], C = (e && e.claims) || {}, ids = [], F = [];
      PROPS.forEach(function (p) {
        (C[p[0]] || []).slice(0, 3).forEach(function (c) {
          var v = c.mainsnak && c.mainsnak.datavalue && c.mainsnak.datavalue.value;
          if (v == null) return;
          if (v.id) { ids.push(v.id); F.push([p[1], { id: v.id }]); }
          else if (v.time) F.push([p[1], v.time.replace(/^\+/, "").slice(0, 10)]);
          else if (v.amount) F.push([p[1], String(+v.amount)]);
        });
      });
      if (!ids.length) return F;
      return getJSON(WD + "action=wbgetentities&props=labels&languages=fr|en&ids=" + ids.slice(0, 45).join("|")).then(function (k) {
        return F.map(function (f) {
          if (f[1] && f[1].id) { var en = k.entities && k.entities[f[1].id], l = en && en.labels; f[1] = (l && ((l.fr || l.en || {}).value)) || f[1].id; }
          return f;
        });
      }).catch(function () { return F.filter(function (f) { return !f[1].id; }); });
    }).catch(function () { return null; });
  }
  function dateFr(d) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d || ""), M = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
    if (!m) return d;
    if (m[2] === "00") return m[1];
    return (m[3] === "00" ? "" : (+m[3] === 1 ? "1er" : +m[3]) + " ") + M[+m[2] - 1] + " " + m[1];
  }

  // ---------- Base du site (NTSB, AAIB, TSB, Wikidata) ----------
  function annee(a) { return getJSON("data/accidents/" + a + ".json").then(function (j) { return j.items || []; }).catch(function () { return []; }); }
  function memeJour(iso, F, texte) {
    var a = iso.slice(0, 4), d0 = new Date(iso + "T12:00:00Z").getTime();
    var cles = [], morts = 0;
    (F || []).forEach(function (f) {
      if (f[0] === "Exploitant" || f[0] === "Appareil") norm(f[1]).split(" ").forEach(function (m) { if (m.length > 3 && !/airbus|boeing|airlines|lines|air|aviation|compagnie/.test(m)) cles.push(m); });
      if (f[0] === "Morts") morts = +f[1] || 0;
    });
    var immats = (String(texte || "").match(/\b([A-Z]{1,2}-[A-Z0-9]{3,5}|N\d{1,5}[A-Z]{0,2})\b/g) || []).map(function (m) { return m.replace(/[^A-Z0-9]/g, ""); });
    return annee(a).then(function (L) {
      return L.filter(function (x) {
        var d = new Date(x[0] + "T12:00:00Z").getTime(); if (Math.abs(d - d0) > 86400000) return false;
        var c = norm(x.join(" ")), im = String(x[4] || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
        return (im && immats.indexOf(im) >= 0) || (morts > 0 && x[6] === morts) || cles.some(function (m) { return (" " + c + " ").indexOf(" " + m + " ") >= 0; });
      }).slice(0, 12);
    });
  }
  function rechercheBase(q) {
    var n = nettoyer(q), mots = sansMotsAcc(n).split(" ").filter(function (m) { return m.length > 1; });
    var ans = (n.match(/\b(19[0-9]{2}|20[0-9]{2})\b/g) || []);
    return getJSON("data/accidents/index.json").then(function (I) {
      var dispo = Object.keys(I.annees || {}).sort();
      var aCharger = ans.length ? ans.filter(function (a) { return dispo.indexOf(a) >= 0; }) : dispo.slice(-8);
      mots = mots.filter(function (m) { return ans.indexOf(m) < 0; });
      if (!mots.length && !ans.length) return [];
      return Promise.all(aCharger.map(annee)).then(function (T) {
        var R = [];
        T.forEach(function (L) { L.forEach(function (x) { var c = norm(x.join(" ")); if (mots.every(function (m) { return c.indexOf(m) >= 0; })) R.push(x); }); });
        R.sort(function (a, b) { return (b[6] || 0) - (a[6] || 0) || (b[0] > a[0] ? 1 : -1); });
        return R.slice(0, 25);
      });
    }).catch(function () { return []; });
  }
  function ligneBase(x) {
    var lien = /^https?:/.test(x[10]) ? ' · <a href="' + esc(x[10]) + '" target="_blank" rel="noopener">source</a>' : (x[10] ? " · dossier " + esc(x[9]) + " n° " + esc(x[10]) : " · " + esc(x[9]));
    return '<li><b>' + esc(dateFr(x[0])) + "</b> – " + esc([x[3], x[4], x[5]].filter(Boolean).join(", ")) + (x[2] || x[1] ? " – " + esc([x[2], x[1]].filter(Boolean).join(", ")) : "") +
      (x[6] ? " – <b>" + esc(x[6]) + " mort" + (x[6] > 1 ? "s" : "") + "</b>" : "") + (x[7] ? " – " + esc(x[7]) : "") +
      (x[8] && x[8].length > 2 ? '<br><span class="note">' + esc(x[8]) + "</span>" : "") + '<span class="note">' + lien + "</span></li>";
  }

  // ---------- Affichage ----------
  function boite() {
    var b = $("v36acc");
    if (!b) {
      var ans = $("gAns"); if (!ans) return null;
      b = document.createElement("div"); b.id = "v36acc"; b.style.marginTop = "12px";
      ans.insertAdjacentElement("afterend", b);
    }
    return b;
  }
  function repondre(q) {
    var b = boite(); if (!b) return;
    if (!q || q.length < 4 || !concerneAccident(q)) { b.innerHTML = ""; return; }
    var moi = ++jeton;
    b.innerHTML = '<div class="group"><p class="note">✈️ Recherche de l’accident dans Wikipédia, Wikidata et la base des enquêtes…</p></div>';
    chercherArticle(q).then(function (titre) { return titre ? article(titre) : null; }).then(function (p) {
      if (moi !== jeton) return;
      if (!p || MILITAIRE.test(norm(p.title + " " + String(p.extract).slice(0, 300)))) return sansArticle(q, moi);
      var D = decouper(p.extract), qid = p.pageprops && p.pageprops.wikibase_item;
      var secs = D.sections.filter(function (s) { var t = norm(s.titre); return s.texte.length > 80 && !JETER.test(t) && (GARDER.test(t) || s.niv === 2); }).slice(0, 9);
      var h = '<div class="group" id="v36fiche"><h2>✈️ ' + esc(p.title) + '</h2><div id="v36bref"></div>' + paragraphes(D.intro, 2500) +
        secs.map(function (s) { return '<details' + (GARDER.test(norm(s.titre)) ? " open" : "") + '><summary><b>' + esc(s.titre) + '</b></summary>' + paragraphes(s.texte, 2200) + "</details>"; }).join("") +
        '<div id="v36off"></div><p class="note">Source : <a href="' + esc(p.fullurl || ("https://fr.wikipedia.org/wiki/" + encodeURIComponent(p.title))) + '" target="_blank" rel="noopener">article Wikipédia « ' + esc(p.title) + ' »</a> (CC BY-SA 4.0), Wikidata (CC0) et base des accidents de Cotes & Routes (NTSB, AAIB, TSB).</p></div>';
      b.innerHTML = h;
      fiche(qid).then(function (F) {
        if (moi !== jeton || !F || !F.length) return;
        var vus = {}, lignes = [], dt = null;
        F.forEach(function (f) { var k = f[0]; if (k === "Date" && !dt) dt = f[1]; var v = /^\d{4}-\d{2}-\d{2}$/.test(f[1]) ? dateFr(f[1]) : f[1]; vus[k] = vus[k] ? vus[k] + ", " + v : v; });
        Object.keys(vus).forEach(function (k) { lignes.push('<div><span class="note">' + esc(k) + "</span><br><b>" + esc(vus[k]) + "</b></div>"); });
        var z = $("v36bref"); if (z) z.innerHTML = '<div class="sheet" style="grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;margin:8px 0 12px">' + lignes.join("") + "</div>";
        if (dt && /^\d{4}-\d{2}-\d{2}$/.test(dt) && dt.slice(5, 7) !== "00") memeJour(dt, F, p.extract).then(function (L) {
          var o = $("v36off"); if (moi !== jeton || !o || !L.length) return;
          o.innerHTML = '<h3>📁 Dossiers officiels le même jour (base du site)</h3><ul>' + L.map(ligneBase).join("") + "</ul>";
        });
      });
    }).catch(function () { if (moi === jeton) sansArticle(q, moi); });
  }
  function sansArticle(q, moi) {
    var b = boite();
    rechercheBase(q).then(function (R) {
      if (moi !== jeton) return;
      b.innerHTML = R.length ? '<div class="group"><h2>📁 Accidents correspondants dans la base</h2><p class="note">' + R.length + " résultat" + (R.length > 1 ? "s" : "") +
        " (NTSB, AAIB, TSB, Wikidata). Précisez l’année, l’exploitant, l’immatriculation ou le lieu pour affiner.</p><ul>" + R.map(ligneBase).join("") + "</ul></div>"
        : '<div class="group"><p class="note">Aucun article ni dossier trouvé pour cet accident. Essayez avec le numéro du vol (ex. « vol AF447 »), la compagnie et l’année, ou le lieu.</p></div>';
    });
  }
  function surveiller() {
    var i = $("gq2"); if (!i) return;
    var v = i.value.trim();
    if (v === dernier) return;
    dernier = v;
    clearTimeout(minuteur);
    minuteur = setTimeout(function () { try { repondre(v); } catch (e) { } }, 700);
  }
  setInterval(surveiller, 500);
  window.v36repondre = repondre;
})();
