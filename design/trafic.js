/* Cotes & Routes : « Le trafic mondial heure par heure ».
   Affiche, sur une carte du monde, tous les avions en vol à une heure donnée, d'après l'archive horaire
   data/trafic/ (robot « Archive du trafic mondial », source OpenSky Network). Ajouté à la rubrique « anim ». */
(function () {
  function lire(url) {
    return fetch(url).then(function (r) { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); }).then(function (b) {
      var o = new Uint8Array(b);
      if (o[0] === 0x1f && o[1] === 0x8b) return new Response(new Blob([b]).stream().pipeThrough(new DecompressionStream('gzip'))).json();
      return JSON.parse(new TextDecoder().decode(o));
    });
  }
  function nb(n) { return new Intl.NumberFormat('fr-FR').format(n); }
  function jourFr(d) { try { return new Date(d + 'T12:00:00Z').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return d; } }
  function installer() {
    var sec = document.querySelector('section[data-view="anim"]');
    if (!sec || document.getElementById('trfZone')) return;
    var z = document.createElement('div');
    z.id = 'trfZone';
    z.style.marginTop = '2.2rem';
    z.innerHTML = '<h2>Le trafic mondial heure par heure</h2>'
      + '<p class="lead">Chaque point est un avion en vol à l’heure choisie (heure universelle, UTC). Une photographie complète du ciel est archivée chaque heure.</p>'
      + '<div class="eco-bar"><select id="trfJ" aria-label="Jour"></select><select id="trfH" aria-label="Heure (UTC)"></select>'
      + '<button class="cr-btn j" id="trfLire" type="button">▶ Lecture</button></div>'
      + '<p class="note" id="trfInfo">Chargement de l’archive…</p>'
      + '<canvas id="trfC" width="1600" height="800" style="width:100%;height:auto;background:#0b1a24;border-radius:8px" aria-label="Carte des avions en vol"></canvas>'
      + '<p class="note">Couleur selon l’altitude : <span style="color:#7fd3ff">● moins de 3 000 m</span> · <span style="color:#ffd166">● 3 000 à 9 000 m</span> · <span style="color:#ff6b6b">● plus de 9 000 m</span>. '
      + 'Source : OpenSky Network, photographies du robot « Avions du monde en direct ». Couverture inégale selon les régions (récepteurs au sol).</p>';
    sec.appendChild(z);
    var J = document.getElementById('trfJ'), H = document.getElementById('trfH'), info = document.getElementById('trfInfo'), cv = document.getElementById('trfC'), ctx = cv.getContext('2d');
    var index = null, cache = {}, minuterie = null;
    function dessiner(d) {
      ctx.fillStyle = '#0b1a24'; ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.strokeStyle = 'rgba(255,255,255,.07)'; ctx.lineWidth = 1;
      for (var lo = -180; lo <= 180; lo += 30) { var x = (lo + 180) / 360 * cv.width; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, cv.height); ctx.stroke(); }
      for (var la = -60; la <= 60; la += 30) { var y = (90 - la) / 180 * cv.height; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cv.width, y); ctx.stroke(); }
      var n = 0;
      (d.avions || []).forEach(function (a) {
        var lat = a[2], lon = a[3], alt = a[4];
        if (lat == null || lon == null) return;
        ctx.fillStyle = alt == null ? '#9fb3c8' : alt < 3000 ? '#7fd3ff' : alt < 9000 ? '#ffd166' : '#ff6b6b';
        ctx.fillRect((lon + 180) / 360 * cv.width, (90 - lat) / 180 * cv.height, 2, 2);
        n++;
      });
      info.textContent = nb(n) + ' avions en vol le ' + jourFr(d.date) + ' à ' + d.heure + ' h (UTC).';
    }
    function charger() {
      var j = J.value, h = H.value;
      if (!j || !h) return;
      var cle = j + '/' + h;
      info.textContent = 'Chargement…';
      (cache[cle] ? Promise.resolve(cache[cle]) : lire('data/trafic/' + cle + '.json.gz').then(function (d) { cache[cle] = d; return d; }))
        .then(dessiner).catch(function () { info.textContent = 'Cette heure n’est pas disponible.'; });
    }
    function heures() {
      var hs = (index.jours[J.value] || []);
      H.innerHTML = hs.map(function (h) { return '<option value="' + h + '">' + h + ' h UTC</option>'; }).join('');
      H.value = hs[hs.length - 1] || '';
      charger();
    }
    J.addEventListener('change', heures);
    H.addEventListener('change', charger);
    document.getElementById('trfLire').addEventListener('click', function () {
      var b = this;
      if (minuterie) { clearInterval(minuterie); minuterie = null; b.textContent = '▶ Lecture'; return; }
      b.textContent = '⏸ Pause';
      var hs = index.jours[J.value] || [], i = Math.max(0, hs.indexOf(H.value));
      minuterie = setInterval(function () {
        i = (i + 1) % hs.length;
        H.value = hs[i]; charger();
      }, 1500);
    });
    lire('data/trafic/index.json').then(function (d) {
      index = d;
      var js = Object.keys(d.jours || {}).sort().reverse();
      if (!js.length) { info.textContent = 'L’archive démarre : les premières heures arrivent bientôt.'; return; }
      J.innerHTML = js.map(function (j) { return '<option value="' + j + '">' + jourFr(j) + ' (' + d.jours[j].length + ' h)</option>'; }).join('');
      heures();
    }).catch(function () { info.textContent = 'L’archive démarre : les premières heures arrivent bientôt.'; });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installer); else installer();
})();
