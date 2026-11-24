/* Cotes & Routes : tableaux de référence ajoutés à trois rubriques (v35).
   - Pionniers : chronologie de 44 exploits des pionniers de l'aviation civile (1853-2016).
   - Ballons et dirigeables : chronologie de 29 dates, de 1783 à nos jours.
   - Musées : 28 musées de l'aviation à visiter, en France et dans le monde.
   Chaque tableau a un champ de recherche (sans accents ni majuscules). Données rédigées par Cotes & Routes
   d'après des sources encyclopédiques ouvertes. Aviation militaire exclue. */
(function () {
  "use strict";
  function norm(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim(); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
  function date(s) {
    var m = String(s).split("-");
    if (m.length < 3) return m.length === 2 ? MOIS[+m[1] - 1] + " " + m[0] : m[0];
    return (+m[2] === 1 ? "1er" : +m[2]) + " " + MOIS[+m[1] - 1] + " " + m[0];
  }

  var T = {
    "pionniers": {
      titre: "🗓️ Chronologie des pionniers",
      note: "Les exploits qui ont fait naître l’aviation civile, du premier planeur habité au tour du monde solaire.",
      cols: ["Date", "Pionnier", "Pays", "Exploit"], dates: true,
      L: [
        ["1853", "George Cayley", "Royaume-Uni", "Son planeur emporte un homme, son cocher, au-dessus d’un vallon à Brompton : premier vol plané habité."],
        ["1890-10-09", "Clément Ader", "France", "L’Éole quitte le sol par ses propres moyens sur une cinquantaine de mètres à Armainvilliers."],
        ["1896-08-09", "Otto Lilienthal", "Allemagne", "Après environ 2 000 vols planés qui ont fondé l’étude du vol, il meurt des suites d’une chute."],
        ["1903-12-17", "Orville et Wilbur Wright", "États-Unis", "Premier vol motorisé et contrôlé à Kitty Hawk : 12 s et 37 m, puis 59 s et 260 m le même jour."],
        ["1906-11-12", "Alberto Santos-Dumont", "Brésil / France", "Le 14-bis parcourt 220 m à Bagatelle : premier vol d’avion homologué en Europe."],
        ["1907-11-13", "Paul Cornu", "France", "Près de Lisieux, son hélicoptère soulève son pilote de quelques dizaines de centimètres pendant une vingtaine de secondes."],
        ["1908-01-13", "Henri Farman", "France", "Premier kilomètre en circuit fermé, à Issy-les-Moulineaux (prix Deutsch-Archdeacon)."],
        ["1908-08-08", "Wilbur Wright", "États-Unis", "Démonstrations au Mans : les Européens découvrent un avion qui vire avec aisance."],
        ["1909-07-25", "Louis Blériot", "France", "Première traversée de la Manche en avion, de Calais à Douvres, en 37 minutes sur le Blériot XI."],
        ["1910-03-08", "Raymonde de Laroche", "France", "Première femme titulaire d’un brevet de pilote (n° 36 de l’Aéro-Club de France)."],
        ["1910-03-28", "Henri Fabre", "France", "Premier hydravion à décoller de l’eau, sur l’étang de Berre, à Martigues."],
        ["1910-09-23", "Geo Chávez", "Pérou", "Première traversée des Alpes par le col du Simplon ; mortellement blessé à l’atterrissage à Domodossola."],
        ["1911-02-18", "Henri Pequet", "France", "Premier transport officiel de courrier par avion, à Allahabad, en Inde."],
        ["1912-04-16", "Harriet Quimby", "États-Unis", "Première femme à traverser la Manche en avion."],
        ["1913-09-23", "Roland Garros", "France", "Première traversée de la Méditerranée, de Fréjus à Bizerte, en 7 h 53."],
        ["1914-01-01", "Tony Jannus", "États-Unis", "Première ligne aérienne régulière en avion, entre St. Petersburg et Tampa (Floride)."],
        ["1918-12-25", "Pierre-Georges Latécoère", "France", "Premier vol Toulouse–Barcelone : début des lignes qui deviendront l’Aéropostale."],
        ["1919-06-14", "John Alcock et Arthur Brown", "Royaume-Uni", "Première traversée de l’Atlantique sans escale, de Terre-Neuve à l’Irlande, en 16 heures environ."],
        ["1919-08-25", "Aircraft Transport and Travel", "Royaume-Uni", "Premier service international quotidien de passagers, entre Londres et Paris."],
        ["1921-04-01", "Adrienne Bolland", "France", "Première femme à franchir la cordillère des Andes en avion."],
        ["1921-06-15", "Bessie Coleman", "États-Unis", "Première femme afro-américaine brevetée pilote, en France, faute d’école qui l’accepte chez elle."],
        ["1923-01-09", "Juan de la Cierva", "Espagne", "Premier vol de l’autogire, ancêtre de l’hélicoptère, près de Madrid."],
        ["1927-05-08", "Charles Nungesser et François Coli", "France", "Partis du Bourget vers New York sur l’Oiseau blanc, ils disparaissent au-dessus de l’Atlantique."],
        ["1927-05-20", "Charles Lindbergh", "États-Unis", "Premier vol seul et sans escale New York–Paris, en 33 h 30, sur le Spirit of St. Louis."],
        ["1928-05-31", "Charles Kingsford Smith et Charles Ulm", "Australie", "Première traversée du Pacifique, de la Californie à l’Australie, sur le Southern Cross."],
        ["1930-05-12", "Jean Mermoz", "France", "Première traversée commerciale de l’Atlantique Sud en hydravion, avec du courrier, de Saint-Louis du Sénégal à Natal."],
        ["1930-05-24", "Amy Johnson", "Royaume-Uni", "Première femme à relier seule l’Angleterre à l’Australie, en 19 jours."],
        ["1930-06-13", "Henri Guillaumet", "France", "Accidenté dans les Andes en hiver, il marche plusieurs jours avant d’être sauvé."],
        ["1930-09-01", "Dieudonné Costes et Maurice Bellonte", "France", "Premier Paris–New York sans escale, contre les vents dominants, en 37 heures environ."],
        ["1932-05-20", "Amelia Earhart", "États-Unis", "Première femme à traverser seule l’Atlantique ; elle disparaît dans le Pacifique en 1937."],
        ["1933-07-22", "Wiley Post", "États-Unis", "Premier tour du monde en solitaire, en 7 jours et 19 heures environ."],
        ["1936-06-26", "Henrich Focke", "Allemagne", "Premier vol du Focke-Wulf Fw 61, premier hélicoptère vraiment pilotable."],
        ["1936-10-16", "Jean Batten", "Nouvelle-Zélande", "Premier vol en solitaire de l’Angleterre à la Nouvelle-Zélande."],
        ["1936-12-30", "Maryse Bastié", "France", "Traversée de l’Atlantique Sud en solitaire, de Dakar à Natal, en 12 heures environ."],
        ["1939-08-27", "Hans von Ohain et Erich Warsitz", "Allemagne", "Premier vol d’un avion à réaction, le Heinkel He 178."],
        ["1939-09-14", "Igor Sikorsky", "États-Unis", "Premier vol du VS-300, qui fixe la formule moderne de l’hélicoptère avec rotor de queue."],
        ["1949-07-27", "John Cunningham", "Royaume-Uni", "Premier vol du de Havilland Comet, premier avion de ligne à réaction."],
        ["1955-03-12", "Jean Boulet", "France", "Premier vol de l’Alouette II, premier hélicoptère à turbine produit en série."],
        ["1969-02-09", "Jack Waddell", "États-Unis", "Premier vol du Boeing 747, premier gros-porteur."],
        ["1969-03-02", "André Turcat", "France", "Premier vol du Concorde à Toulouse."],
        ["1972-06-21", "Jean Boulet", "France", "Record d’altitude en hélicoptère, 12 442 m, sur un Lama ; toujours inégalé."],
        ["1986-12-23", "Dick Rutan et Jeana Yeager", "États-Unis", "Le Voyager achève le premier tour du monde sans escale ni ravitaillement : 9 jours, environ 40 000 km."],
        ["2005-05-14", "Didier Delsalle", "France", "Premier atterrissage d’un hélicoptère au sommet de l’Everest, sur un Écureuil."],
        ["2016-07-26", "Bertrand Piccard et André Borschberg", "Suisse", "Solar Impulse 2 achève le premier tour du monde en avion solaire, sans carburant."]
      ]
    },
    "ballons": {
      titre: "🗓️ Chronologie des ballons et dirigeables",
      note: "Des premières montgolfières aux tours du monde en ballon : les dates qui ont marqué le vol plus léger que l’air.",
      cols: ["Date", "Événement", "Lieu", "Pourquoi c’est marquant"], dates: true,
      L: [
        ["1783-06-04", "Première montgolfière publique", "Annonay", "Les frères Montgolfier font s’élever un ballon d’air chaud devant les états du Vivarais."],
        ["1783-09-19", "Un mouton, un canard et un coq", "Versailles", "Premiers passagers d’un ballon, devant Louis XVI : ils reviennent sains et saufs."],
        ["1783-11-21", "Pilâtre de Rozier et le marquis d’Arlandes", "Paris", "Premier vol humain libre, en montgolfière, du château de la Muette à la Butte-aux-Cailles."],
        ["1783-12-01", "Jacques Charles et Nicolas Robert", "Paris", "Premier vol en ballon à hydrogène, des Tuileries à Nesles-la-Vallée."],
        ["1785-01-07", "Jean-Pierre Blanchard et John Jeffries", "Douvres–Guînes", "Première traversée de la Manche par la voie des airs."],
        ["1785-06-15", "Pilâtre de Rozier", "Wimereux", "Son ballon mixte air chaud-hydrogène s’enflamme : premières victimes de l’histoire aérienne."],
        ["1797-10-22", "André-Jacques Garnerin", "Paris, parc Monceau", "Premier saut en parachute depuis un ballon."],
        ["1852-09-24", "Henri Giffard", "Paris–Élancourt", "Premier dirigeable motorisé, mû par une machine à vapeur, sur environ 27 km."],
        ["1870-09-23", "Ballons du siège de Paris", "Paris", "Début d’une série d’environ 66 ballons qui emportent courrier et passagers hors de la capitale assiégée."],
        ["1884-08-09", "Dirigeable La France", "Chalais-Meudon", "Charles Renard et Arthur Krebs bouclent le premier circuit fermé en dirigeable, à moteur électrique."],
        ["1900-07-02", "LZ 1", "Lac de Constance", "Premier vol d’un dirigeable rigide du comte Ferdinand von Zeppelin."],
        ["1901-10-19", "Alberto Santos-Dumont", "Paris", "Son dirigeable n° 6 contourne la tour Eiffel : prix Deutsch de la Meurthe."],
        ["1906-09-30", "Première coupe Gordon Bennett", "Paris, Tuileries", "La plus ancienne course aéronautique, toujours disputée en ballon à gaz."],
        ["1909-11-16", "Fondation de la DELAG", "Francfort", "Première compagnie aérienne au monde, en dirigeables Zeppelin."],
        ["1926-05-12", "Dirigeable Norge", "Pôle Nord", "Amundsen, Ellsworth et Nobile survolent le pôle Nord, du Spitzberg à l’Alaska."],
        ["1929-08-29", "Graf Zeppelin", "Lakehurst", "Fin du premier tour du monde d’un aéronef avec passagers, en 21 jours environ."],
        ["1931-05-27", "Auguste Piccard", "Augsbourg", "Premier homme dans la stratosphère, à environ 15 800 m, dans une nacelle pressurisée."],
        ["1936-05-06", "Hindenburg", "Atlantique Nord", "Le plus grand aéronef jamais construit (245 m) ouvre ses liaisons transatlantiques de passagers."],
        ["1937-05-06", "Incendie du Hindenburg", "Lakehurst", "36 morts : la catastrophe met fin au transport de passagers en dirigeable à hydrogène."],
        ["1960-10-22", "Ed Yost", "Nebraska", "Premier vol de la montgolfière moderne, chauffée au propane, avec enveloppe en nylon."],
        ["1978-08-17", "Double Eagle II", "Miserey (Eure)", "Première traversée de l’Atlantique en ballon (à gaz), par trois Américains."],
        ["1987-07-03", "Richard Branson et Per Lindstrand", "Irlande du Nord", "Première traversée de l’Atlantique en montgolfière."],
        ["1997-09-18", "Zeppelin NT", "Friedrichshafen", "Premier vol du dirigeable moderne à hélium, utilisé pour des vols touristiques."],
        ["1999-03-21", "Breitling Orbiter 3", "Égypte", "Bertrand Piccard et Brian Jones achèvent le premier tour du monde en ballon sans escale, en 19 jours."],
        ["2002-07-03", "Steve Fossett", "Australie", "Premier tour du monde en ballon en solitaire, sur le Spirit of Freedom."],
        ["2005-11-26", "Vijaypat Singhania", "Bombay", "Record d’altitude en montgolfière : environ 21 000 m."],
        ["2012-10-14", "Felix Baumgartner", "Nouveau-Mexique", "Saut en parachute depuis un ballon stratosphérique à environ 39 km d’altitude."],
        ["2015-01-31", "Two Eagles", "Pacifique", "Record de distance en ballon à gaz : environ 10 700 km, du Japon au Mexique."],
        ["2016-07-23", "Fiodor Konioukhov", "Australie", "Tour du monde en ballon en solitaire le plus rapide, en 11 jours environ."]
      ]
    },
    "musees": {
      titre: "🏛️ Musées de l’aviation à visiter",
      note: "Une sélection de musées où voir des avions civils, des pionniers et des moteurs, en France puis dans le monde.",
      cols: ["Musée", "Lieu", "Pays", "À voir"],
      L: [
        ["Musée de l’Air et de l’Espace", "Le Bourget (93)", "France", "Deux Concorde dont le prototype 001, un Boeing 747 visitable, la Grande Galerie des pionniers, fusées Ariane, planétarium."],
        ["Aeroscopia", "Blagnac (31)", "France", "Deux Concorde, un A380, un Super Guppy, une Caravelle ; visites des chaînes Airbus."],
        ["L’Envol des Pionniers", "Toulouse-Montaudran (31)", "France", "L’épopée des Lignes Latécoère et de l’Aéropostale, sur leur piste historique."],
        ["Cité de l’espace", "Toulouse (31)", "France", "Fusée Ariane 5 grandeur nature, station Mir, planétarium."],
        ["Musée des Arts et Métiers", "Paris (75)", "France", "L’Avion III de Clément Ader et le Blériot XI de la traversée de la Manche."],
        ["Musée Safran", "Réau (77)", "France", "L’histoire des moteurs d’avion et d’hélicoptère, des Gnome rotatifs aux réacteurs modernes."],
        ["Espace Air Passion", "Marcé, aéroport d’Angers (49)", "France", "Avions anciens et planeurs restaurés par des bénévoles, ateliers de restauration."],
        ["Musée volant Salis", "Cerny–La Ferté-Alais (91)", "France", "Avions anciens en état de vol ; meeting « Le Temps des Hélices » au printemps."],
        ["Musée de l’Hydraviation", "Biscarrosse (40)", "France", "L’histoire des hydravions, près de l’ancienne base des grands hydravions transatlantiques Latécoère."],
        ["Musée de l’Aviation", "Saint-Victoret (13)", "France", "Collection de l’association Ailes Anciennes Provence, près de l’aéroport de Marseille."],
        ["Musée de l’Aviation du Mas Palégry", "Perpignan (66)", "France", "Avions et moteurs anciens dans un domaine agricole."],
        ["MAPICA", "La Baule-Escoublac (44)", "France", "Musée de l’aéronautique de la presqu’île Côte d’Amour, aviation locale et avions anciens."],
        ["Musée de l’Épopée de l’Industrie et de l’Aéronautique", "Albert (80)", "France", "L’histoire industrielle de l’aéronautique dans la Somme, voisine de l’usine Airbus de Méaulte."],
        ["Musée Clément Ader", "Muret (31)", "France", "Souvenirs du pionnier né à Muret et des grandes figures de la ville."],
        ["Musée des Papeteries Canson et Montgolfier", "Davézieux, près d’Annonay (07)", "France", "Le berceau des frères Montgolfier et de la première montgolfière."],
        ["Steven F. Udvar-Hazy Center", "Chantilly, près de Washington", "États-Unis", "Concorde d’Air France, navette spatiale Discovery, Boeing 707 prototype « Dash 80 »."],
        ["National Air and Space Museum", "Washington", "États-Unis", "Le Wright Flyer de 1903 et le Spirit of St. Louis de Lindbergh."],
        ["Museum of Flight", "Seattle", "États-Unis", "Le premier Boeing 747, un Concorde de British Airways, la « Red Barn », berceau de Boeing."],
        ["Pima Air & Space Museum", "Tucson", "États-Unis", "Plus de 350 aéronefs en plein air, dont de nombreux avions de ligne."],
        ["Hiller Aviation Museum", "San Carlos, Californie", "États-Unis", "Histoire de l’hélicoptère et de l’aviation de la côte Ouest."],
        ["Musée de l’aviation et de l’espace du Canada", "Ottawa", "Canada", "Brousse, hydravions et pionniers de l’aviation canadienne."],
        ["Technik Museum Sinsheim", "Sinsheim", "Allemagne", "Le seul lieu où l’on voit côte à côte un Concorde et un Tupolev Tu-144, perchés sur le toit."],
        ["Deutsches Museum", "Munich", "Allemagne", "L’un des plus grands musées techniques du monde, avec une annexe aéronautique à Oberschleissheim ; planeurs de Lilienthal."],
        ["Science Museum", "Londres", "Royaume-Uni", "Le Vickers Vimy d’Alcock et Brown, premier vol transatlantique sans escale."],
        ["Brooklands Museum", "Weybridge", "Royaume-Uni", "Berceau de l’aviation britannique, Concorde et avions de ligne Vickers."],
        ["Aviodrome", "Lelystad", "Pays-Bas", "Histoire de KLM et de Fokker, Boeing 747 de KLM."],
        ["Musée suisse des transports", "Lucerne", "Suisse", "Grande halle de l’aviation et de l’espace, avions de Swissair."],
        ["Volandia", "Près de Milan-Malpensa", "Italie", "Dans les anciens ateliers Caproni : hélicoptères Agusta et avions italiens."]
      ]
    }
  };

  function construire(v) {
    var c = T[v], sec = document.querySelector('section[data-view="' + v + '"]');
    if (!sec || document.getElementById("v35-" + v)) return;
    var d = document.createElement("div");
    d.id = "v35-" + v; d.className = "group"; d.style.marginTop = "24px";
    d.innerHTML = '<h2>' + esc(c.titre) + '</h2><p class="note">' + esc(c.note) + '</p>' +
      '<div class="controls"><input type="search" placeholder="Rechercher dans le tableau…" aria-label="Rechercher dans le tableau"></div>' +
      '<p class="note v35n"></p><div style="overflow-x:auto"><table class="v35t" style="width:100%;border-collapse:collapse;font-size:.9em">' +
      '<thead><tr>' + c.cols.map(function (h) { return '<th style="text-align:left;padding:6px;border-bottom:2px solid currentColor">' + esc(h) + '</th>'; }).join("") +
      '</tr></thead><tbody></tbody></table></div><p class="note">Tableau rédigé par Cotes & Routes d’après des sources encyclopédiques ouvertes.</p>';
    var vue = sec.querySelector(".ey-vue");
    if (vue && vue.parentNode === sec) vue.insertAdjacentElement("afterend", d); else sec.appendChild(d);
    var L = c.L.slice();
    if (!c.dates && c.tri != null) L.sort(function (a, b) { return String(a[c.tri]).localeCompare(String(b[c.tri]), "fr") || String(a[0]).localeCompare(String(b[0]), "fr"); });
    var aff = L.map(function (r) { return c.dates ? [date(r[0])].concat(r.slice(1)) : r; });
    var cle = aff.map(function (r, i) { return norm(r.join(" ") + " " + L[i][0]); });
    var q = d.querySelector("input"), tb = d.querySelector("tbody"), n = d.querySelector(".v35n");
    function rendre() {
      var mots = norm(q.value).split(" ").filter(Boolean), h = [], k = 0;
      aff.forEach(function (r, i) {
        if (mots.every(function (m) { return cle[i].indexOf(m) >= 0; })) {
          k++;
          h.push('<tr>' + r.map(function (x, j) { return '<td style="padding:6px;border-bottom:1px solid rgba(128,128,128,.3);vertical-align:top' + (j === 0 && c.dates ? ';white-space:nowrap' : '') + '">' + esc(x) + '</td>'; }).join("") + '</tr>');
        }
      });
      tb.innerHTML = h.join("") || '<tr><td colspan="' + c.cols.length + '" style="padding:6px">Aucun résultat.</td></tr>';
      n.textContent = k + " sur " + L.length + " affichés";
    }
    q.addEventListener("input", rendre);
    rendre();
  }
  function tout() { Object.keys(T).forEach(function (v) { try { construire(v); } catch (e) { } }); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", tout); else tout();
  window.addEventListener("hashchange", function () { setTimeout(tout, 300); });
})();
