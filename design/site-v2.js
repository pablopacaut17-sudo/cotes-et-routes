/* Cotes & Routes – couche d’interface v2 : barre d’onglets mobile, retour en haut, menu qui suit la rubrique */
(function () {
  'use strict';
  var tab = document.createElement('nav');
  tab.className = 'cr-tab'; tab.setAttribute('aria-label', 'Raccourcis');
  tab.innerHTML = '<a href="#accueil"><b>🏠</b>Accueil</a><a href="#avions"><b>✈️</b>Avions</a>' +
    '<a href="spotting/"><b>📡</b>Spotting</a><a href="#annuaire"><b>🛫</b>Aéroports</a><a href="#recherche"><b>🔎</b>Chercher</a>';
  document.body.appendChild(tab);
  var haut = document.createElement('button');
  haut.className = 'cr-haut'; haut.setAttribute('aria-label', 'Revenir en haut'); haut.textContent = '↑';
  haut.onclick = function () { window.scrollTo({ top: 0, behavior: 'smooth' }); };
  document.body.appendChild(haut);
  window.addEventListener('scroll', function () { haut.classList.toggle('vis', window.scrollY > 700); }, { passive: true });
  function suivre() {
    var v = (location.hash || '#accueil');
    tab.querySelectorAll('a').forEach(function (a) { if (a.getAttribute('href') === v) a.setAttribute('aria-current', 'page'); else if (a.getAttribute('href') !== 'spotting/') a.removeAttribute('aria-current'); });
    var act = document.querySelector('header nav a[aria-current="page"]');
    if (act && act.scrollIntoView) try { act.scrollIntoView({ block: 'nearest', inline: 'center' }); } catch (e) {}
  }
  window.addEventListener('hashchange', suivre); window.addEventListener('popstate', suivre);
  document.addEventListener('click', function (e) { if (e.target.closest('a[href^="#"]')) setTimeout(suivre, 30); });
  setTimeout(suivre, 300);
})();
