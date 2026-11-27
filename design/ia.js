/* Cotes & Routes : bouton « Demander à l'IA » sous la recherche. La question part vers le relais IA de Pablo
   (Cloudflare), qui interroge Claude ; la clé d'API n'est jamais dans le site. Vide = bouton masqué. */
(function () {
  var IA_URL = 'https://relais-ia.pablopacaut17.workers.dev';
  if (!IA_URL) return;
  function E(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function mise(t) {
    var out = '', liste = false;
    E(t).split(/\n+/).forEach(function (l) {
      l = l.trim(); if (!l) return;
      l = l.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
      if (/^[-•]\s+/.test(l)) { if (!liste) { out += '<ul>'; liste = true; } out += '<li>' + l.replace(/^[-•]\s+/, '') + '</li>'; }
      else { if (liste) { out += '</ul>'; liste = false; } out += /^#+\s/.test(l) ? '<h4>' + l.replace(/^#+\s/, '') + '</h4>' : '<p>' + l + '</p>'; }
    });
    return out + (liste ? '</ul>' : '');
  }
  function question() { var i = document.getElementById('gq2') || document.getElementById('gq'); var v = ''; ['gq', 'gq2', 'gq3'].forEach(function (id) { var x = document.getElementById(id); if (x && x.value.trim().length > v.length) v = x.value.trim(); }); return v; }
  function placer() {
    var res = document.getElementById('gRes'), ans = document.getElementById('gAns');
    if (!res || document.getElementById('iaZone')) return;
    var z = document.createElement('div'); z.id = 'iaZone'; z.style.margin = '14px 0';
    z.innerHTML = '<button type="button" class="tout-voir" id="iaBtn" style="cursor:pointer">✨ Demander à l’IA</button><div id="iaRep"></div>';
    res.parentNode.insertBefore(z, res);
    document.getElementById('iaBtn').addEventListener('click', function () {
      var q = question(), r = document.getElementById('iaRep');
      if (q.length < 3) { r.innerHTML = '<p class="note">Tapez d’abord votre question dans la recherche.</p>'; return; }
      r.innerHTML = '<p class="note">L’IA rédige sa réponse…</p>';
      var ctx = ans ? ans.innerText.slice(0, 4000) : '';
      fetch(IA_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ site: 'cotes-et-routes', question: q, contexte: ctx }) })
        .then(function (x) { return x.json(); })
        .then(function (d) {
          r.innerHTML = d.reponse ? '<div class="sheet" style="grid-template-columns:1fr;margin-top:10px"><div><p class="note">Réponse de l’IA (Claude)</p>' + mise(d.reponse)
            + '<p class="note">Réponse rédigée automatiquement par une intelligence artificielle : elle peut contenir des erreurs. Vérifiez les points importants auprès de sources officielles.</p></div></div>'
            : '<p class="note">' + E(d.erreur || 'Pas de réponse.') + '</p>';
        }).catch(function () { r.innerHTML = '<p class="note">L’IA est injoignable pour le moment. Réessayez dans un instant.</p>'; });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', placer); else placer();
})();
