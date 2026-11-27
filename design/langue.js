/* Bouton FR / EN (demandé par Pablo le 27/11/2026). Le site est écrit en français ; la version anglaise est une
   traduction automatique de la page entière, faite par Google Traduction (gratuit, aucune donnée en plus sur le site).
   Sur la version traduite, le bouton ramène à la version française d'origine. Même fichier pour les deux sites. */
(function () {
  'use strict';
  var h = location.hostname, traduit = /\.translate\.goog$/.test(h);
  function versAnglais() {
    // pablopacaut17-sudo.github.io → pablopacaut17--sudo-github-io.translate.goog (règle de Google Traduction)
    var hote = h.replace(/-/g, '--').replace(/\./g, '-') + '.translate.goog';
    var q = location.search ? location.search.slice(1) + '&' : '';
    return 'https://' + hote + location.pathname + '?' + q + '_x_tr_sl=fr&_x_tr_tl=en&_x_tr_hl=en&_x_tr_pto=wapp' + location.hash;
  }
  function versFrancais() {
    var hote = h.replace(/\.translate\.goog$/, '').replace(/--/g, '\u0000').replace(/-/g, '.').replace(/\u0000/g, '-');
    var q = location.search.slice(1).split('&').filter(function (x) { return x && !/^_x_tr_/.test(x); }).join('&');
    return 'https://' + hote + location.pathname + (q ? '?' + q : '') + location.hash;
  }
  function bouton() {
    if (document.getElementById('langue-btn')) return;
    var b = document.createElement('a');
    b.id = 'langue-btn';
    b.href = traduit ? versFrancais() : versAnglais();
    b.setAttribute('aria-label', traduit ? 'Version française' : 'English version (automatic translation)');
    b.title = traduit ? 'Version française d’origine' : 'English (automatic translation by Google Translate)';
    b.innerHTML = traduit ? '<b>FR</b>' : '<span>FR</span><b>EN</b>';
    b.style.cssText = 'display:inline-flex;align-items:center;gap:4px;min-height:34px;padding:0 10px;border-radius:999px;border:1px solid currentColor;'
      + 'font:700 .8rem system-ui,sans-serif;text-decoration:none;color:inherit;opacity:.9;white-space:nowrap;margin-left:6px';
    var s = b.querySelector('span'); if (s) s.style.opacity = '.45';
    if (!traduit) b.addEventListener('click', function () { b.href = versAnglais(); });  // garde la page et la rubrique en cours
    var ancre = document.querySelector('#theme-btn, header #themeBtn, header .theme, #v26Burger');
    if (ancre && ancre.parentNode) ancre.parentNode.insertBefore(b, ancre);
    else { b.style.cssText += ';position:fixed;top:10px;right:10px;z-index:3000;background:#fff;color:#12313B'; document.body.appendChild(b); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(bouton, 400); }); else setTimeout(bouton, 400);
})();
