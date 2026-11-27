/* Choix de la langue (demandé par Pablo le 27/11/2026). Les sites sont écrits en français ; les autres langues sont des
   traductions automatiques de la page entière par Google Traduction (gratuit, aucune donnée en plus sur le site).
   Le menu propose d'abord la langue du navigateur et les langues les plus courantes, puis toutes les langues de Google
   Traduction, avec une case pour chercher. Sur une page traduite, « Français (original) » ramène à la version d'origine.
   Même fichier pour les deux sites. */
(function () {
  'use strict';
  // Langues de Google Traduction (codes acceptés par translate.goog)
  var CODES = ('af ak am ar as ay az be bg bho bm bn bs ca ceb ckb co cs cy da de doi dv ee el en eo es et eu fa fi fil fr fy ga gd gl gn gom gu ha haw he hi hmn hr ht hu hy id ig ilo is it ja jv ka kk km kn ko kri ku ky la lb lg ln lo lt lus lv mai mg mi mk ml mn mni-Mtei mr ms mt my ne nl no nso ny om or pa pl ps pt qu ro ru rw sa sd si sk sl sm sn so sq sr st su sv sw ta te tg th ti tk tl tr ts tt ug uk ur uz vi xh yi yo zh-CN zh-TW zu ' +
    'ab ace ach alz ba ban bbc bci bew bik br bts btx bua chm cnh crh cv din dov dz fj ff gaa hil hrx iba kek ktu lg li lij lmo ltg luo mak mam mfe min new nr nus oc pag pam pap rn rom sah scn shn ss szl tet tiv tn to tum ty udm ve vec war wo yua yue zap').split(' ');
  var COURANTES = ['en', 'es', 'de', 'it', 'pt', 'nl', 'ar', 'zh-CN', 'ja', 'ru', 'tr', 'hi', 'ko', 'pl', 'uk', 'ro', 'el', 'sv', 'vi', 'id'];
  var h = location.hostname, traduit = /\.translate\.goog$/.test(h);
  var nomsFr, nomsLocaux = {};
  try { nomsFr = new Intl.DisplayNames(['fr'], { type: 'language' }); } catch (e) { nomsFr = null; }
  function nom(c) {
    var n = c;
    try { n = nomsFr ? nomsFr.of(c) : c; } catch (e) {}
    try { if (!nomsLocaux[c]) nomsLocaux[c] = new Intl.DisplayNames([c], { type: 'language' }).of(c); } catch (e) { nomsLocaux[c] = ''; }
    var l = nomsLocaux[c];
    n = n.charAt(0).toUpperCase() + n.slice(1);
    return l && l.toLowerCase() !== n.toLowerCase() ? n + ' · ' + l : n;
  }
  function original() {
    var hote = traduit ? h.replace(/\.translate\.goog$/, '').replace(/--/g, '\u0000').replace(/-/g, '.').replace(/\u0000/g, '-') : h;
    var q = location.search.slice(1).split('&').filter(function (x) { return x && !/^_x_tr_/.test(x); }).join('&');
    return { hote: hote, q: q };
  }
  function url(lang) {
    var o = original();
    if (lang === 'fr') return 'https://' + o.hote + location.pathname + (o.q ? '?' + o.q : '') + location.hash;
    // pablopacaut17-sudo.github.io → pablopacaut17--sudo-github-io.translate.goog (règle de Google Traduction)
    var hote = o.hote.replace(/-/g, '--').replace(/\./g, '-') + '.translate.goog';
    return 'https://' + hote + location.pathname + '?' + (o.q ? o.q + '&' : '') + '_x_tr_sl=fr&_x_tr_tl=' + encodeURIComponent(lang) + '&_x_tr_hl=' + encodeURIComponent(lang) + '&_x_tr_pto=wapp' + location.hash;
  }
  var actuelle = (location.search.match(/_x_tr_tl=([^&]+)/) || [])[1] || 'fr';
  function nav() {
    var l = (navigator.languages || [navigator.language || '']).map(function (x) { return x; });
    for (var i = 0; i < l.length; i++) {
      var c = CODES.indexOf(l[i]) > -1 ? l[i] : l[i].split('-')[0];
      if (c && c !== 'fr' && CODES.indexOf(c) > -1) return c;
    }
    return null;
  }
  var panneau = null;
  function ouvrir(btn) {
    if (panneau) { panneau.remove(); panneau = null; return; }
    var n = nav(), haut = (n ? [n] : []).concat(COURANTES.filter(function (c) { return c !== n; }));
    var reste = CODES.filter(function (c) { return haut.indexOf(c) < 0 && c !== 'fr'; }).sort(function (a, b) { return nom(a).localeCompare(nom(b), 'fr'); });
    function ligne(c, lib) {
      return '<a href="' + url(c) + '" data-n="' + (lib || nom(c)).toLowerCase() + '" style="display:block;padding:8px 10px;border-radius:8px;text-decoration:none;color:inherit' + (c === actuelle ? ';font-weight:700;background:rgba(127,127,127,.15)' : '') + '">' + (lib || nom(c)) + '</a>';
    }
    panneau = document.createElement('div');
    panneau.setAttribute('role', 'dialog'); panneau.setAttribute('aria-label', 'Choisir la langue');
    panneau.style.cssText = 'position:fixed;z-index:6000;top:64px;right:10px;width:min(330px,calc(100vw - 20px));max-height:75vh;overflow:auto;background:#fff;color:#16202a;border-radius:16px;box-shadow:0 18px 40px rgba(0,0,0,.28);padding:10px;font:15px/1.35 system-ui,sans-serif';
    panneau.innerHTML = '<div style="display:flex;gap:8px;align-items:center;margin-bottom:6px"><input type="search" placeholder="Chercher une langue…" aria-label="Chercher une langue" style="flex:1;padding:9px 10px;border:1px solid #ccd5dd;border-radius:10px;font:inherit"><button type="button" aria-label="Fermer" style="border:0;background:#16202a;color:#fff;border-radius:10px;padding:8px 11px;font:700 14px system-ui">✕</button></div>'
      + '<p style="margin:6px 4px;font-size:12px;color:#5b6b7a">Traduction automatique par Google Traduction. Le site est rédigé en français.</p>'
      + ligne('fr', 'Français (version originale)')
      + '<div style="height:1px;background:#e3e9ee;margin:6px 0"></div>' + haut.map(function (c) { return ligne(c); }).join('')
      + '<div style="height:1px;background:#e3e9ee;margin:6px 0"></div>' + reste.map(function (c) { return ligne(c); }).join('');
    document.body.appendChild(panneau);
    var inp = panneau.querySelector('input');
    inp.addEventListener('input', function () {
      var t = inp.value.trim().toLowerCase();
      panneau.querySelectorAll('a[data-n]').forEach(function (a) { a.style.display = !t || a.dataset.n.indexOf(t) > -1 ? 'block' : 'none'; });
    });
    panneau.querySelector('button').onclick = function () { panneau.remove(); panneau = null; btn.focus(); };
    setTimeout(function () { if (window.innerWidth > 760) inp.focus(); }, 30);
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && panneau) { panneau.remove(); panneau = null; } });
  document.addEventListener('click', function (e) { if (panneau && !panneau.contains(e.target) && !(e.target.closest && e.target.closest('#langue-btn'))) { panneau.remove(); panneau = null; } });
  function bouton() {
    if (document.getElementById('langue-btn')) return;
    var b = document.createElement('button');
    b.type = 'button'; b.id = 'langue-btn';
    b.setAttribute('aria-label', 'Langue : ' + (actuelle === 'fr' ? 'français' : nom(actuelle)) + '. Choisir une autre langue');
    b.title = 'Langue (traduction automatique)';
    b.innerHTML = '🌐 <b>' + (actuelle === 'fr' ? 'FR' : actuelle.split('-')[0].toUpperCase()) + '</b>';
    b.style.cssText = 'display:inline-flex;align-items:center;gap:4px;min-height:34px;padding:0 10px;border-radius:999px;border:1px solid currentColor;background:none;cursor:pointer;'
      + 'font:700 .8rem system-ui,sans-serif;color:inherit;opacity:.9;white-space:nowrap;margin-left:6px';
    b.addEventListener('click', function () { ouvrir(b); });
    var ancre = document.querySelector('#theme-btn, header #themeBtn, header .theme, #v26Burger');
    if (ancre && ancre.parentNode) ancre.parentNode.insertBefore(b, ancre);
    else { b.style.cssText += ';position:fixed;top:10px;right:10px;z-index:3000;background:#fff;color:#12313B'; document.body.appendChild(b); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(bouton, 400); }); else setTimeout(bouton, 400);
})();
