/* Cotes & Routes : tableaux de référence ajoutés à trois rubriques (v34).
   - Compagnies de légende disparues : chronologie de 47 compagnies (pays, années, fin, ce qui a suivi).
   - Accidents et enquêtes qui ont changé l'aviation : 33 accidents et ce qu'ils ont changé.
   - Aéroports remarquables : 36 aéroports (code OACI, pays, particularité).
   Chaque tableau a un champ de recherche (sans accents ni majuscules). Données rédigées par Cotes & Routes
   d'après les rapports d'enquête et des sources encyclopédiques ouvertes. Aviation militaire exclue. */
(function () {
  "use strict";
  function norm(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim(); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  var T = {
    "compagnies-disparues": {
      titre: "🗂️ Chronologie des compagnies disparues",
      note: "Les compagnies aériennes qui ont cessé leurs vols ou ont été absorbées, de la plus ancienne disparition à la plus récente.",
      cols: ["Compagnie", "Pays", "Années", "Fin", "Ce qui a suivi"],
      tri: 2,
      L: [
        ["Aéropostale", "France", "1918-1933", "liquidation (1931), reprise", "intégrée à Air France à sa création en 1933 (née des Lignes Latécoère)"],
        ["BOAC", "Royaume-Uni", "1939-1974", "fusion", "fusion avec BEA pour former British Airways"],
        ["BEA", "Royaume-Uni", "1946-1974", "fusion", "fusion avec BOAC pour former British Airways"],
        ["National Airlines", "États-Unis", "1934-1980", "rachat", "absorbée par Pan Am"],
        ["Braniff International", "États-Unis", "1928-1982", "faillite", "arrêt des vols en mai 1982"],
        ["Laker Airways", "Royaume-Uni", "1966-1982", "faillite", "pionnière du vol transatlantique à bas prix (Skytrain)"],
        ["People Express", "États-Unis", "1981-1987", "rachat", "absorbée par Continental Airlines"],
        ["Western Airlines", "États-Unis", "1925-1987", "rachat", "absorbée par Delta Air Lines"],
        ["British Caledonian", "Royaume-Uni", "1970-1988", "rachat", "absorbée par British Airways"],
        ["Piedmont Airlines", "États-Unis", "1948-1989", "rachat", "absorbée par USAir"],
        ["Eastern Air Lines", "États-Unis", "1926-1991", "faillite", "arrêt des vols en janvier 1991"],
        ["Pan Am", "États-Unis", "1927-1991", "faillite", "arrêt des vols le 4 décembre 1991 ; lignes vendues à Delta et United"],
        ["Interflug", "Allemagne de l’Est", "1958-1991", "dissolution", "disparue après la réunification allemande"],
        ["UTA", "France", "1963-1992", "rachat", "absorbée par Air France (rachat en 1990)"],
        ["Dan-Air", "Royaume-Uni", "1953-1992", "rachat", "reprise par British Airways"],
        ["Air Inter", "France", "1954-1997", "fusion", "devenue Air France Europe puis fondue dans Air France en 1997"],
        ["Canadian Airlines", "Canada", "1987-2001", "rachat", "intégrée à Air Canada"],
        ["TWA", "États-Unis", "1930-2001", "rachat", "rachetée par American Airlines"],
        ["AOM French Airlines", "France", "1992-2001", "fusion", "fusionnée avec Air Liberté, devenue Air Lib"],
        ["Sabena", "Belgique", "1923-2001", "faillite", "remplacée par SN Brussels Airlines, devenue Brussels Airlines"],
        ["Swissair", "Suisse", "1931-2002", "faillite", "remplacée par Swiss, issue de Crossair"],
        ["Crossair", "Suisse", "1975-2002", "transformation", "devenue Swiss International Air Lines"],
        ["Ansett Australia", "Australie", "1935-2002", "faillite", "arrêt définitif des vols en mars 2002"],
        ["Air Afrique", "Afrique de l’Ouest et centrale", "1961-2002", "liquidation", "compagnie commune à une dizaine d’États africains"],
        ["Air Lib", "France", "2001-2003", "liquidation", "arrêt des vols en février 2003"],
        ["Air Littoral", "France", "1972-2004", "liquidation", "arrêt des vols en février 2004"],
        ["Japan Air System", "Japon", "1971-2004", "fusion", "fusionnée avec Japan Airlines"],
        ["Varig", "Brésil", "1927-2006", "faillite", "activité reprise par Gol"],
        ["Olympic Airways", "Grèce", "1957-2009", "liquidation", "remplacée par Olympic Air, rachetée ensuite par Aegean"],
        ["Northwest Airlines", "États-Unis", "1926-2010", "fusion", "fusionnée avec Delta Air Lines"],
        ["Mexicana", "Mexique", "1921-2010", "faillite", "arrêt des vols en août 2010"],
        ["Continental Airlines", "États-Unis", "1934-2012", "fusion", "fusionnée avec United Airlines"],
        ["Malév", "Hongrie", "1946-2012", "faillite", "arrêt des vols le 3 février 2012"],
        ["Spanair", "Espagne", "1986-2012", "faillite", "arrêt des vols en janvier 2012"],
        ["Kingfisher Airlines", "Inde", "2005-2012", "faillite", "arrêt des vols en octobre 2012"],
        ["AirTran Airways", "États-Unis", "1993-2014", "rachat", "intégrée à Southwest Airlines"],
        ["US Airways", "États-Unis", "1937-2015", "fusion", "fusionnée avec American Airlines"],
        ["Air Berlin", "Allemagne", "1978-2017", "faillite", "arrêt des vols en octobre 2017"],
        ["Monarch Airlines", "Royaume-Uni", "1968-2017", "faillite", "arrêt des vols en octobre 2017"],
        ["Virgin America", "États-Unis", "2007-2018", "rachat", "intégrée à Alaska Airlines"],
        ["Wow Air", "Islande", "2011-2019", "faillite", "arrêt des vols en mars 2019"],
        ["Jet Airways", "Inde", "1993-2019", "faillite", "arrêt des vols en avril 2019"],
        ["Aigle Azur", "France", "1946-2019", "liquidation", "arrêt des vols en septembre 2019"],
        ["Thomas Cook Airlines", "Royaume-Uni", "1999-2019", "faillite", "arrêt des vols le 23 septembre 2019"],
        ["XL Airways France", "France", "1995-2019", "liquidation", "arrêt des vols en octobre 2019"],
        ["Alitalia", "Italie", "1946-2021", "liquidation", "remplacée par ITA Airways"],
        ["Go First", "Inde", "2005-2023", "faillite", "arrêt des vols en mai 2023"]
      ]
    },
    "accidents-marquants": {
      titre: "📋 Les accidents et ce qu’ils ont changé",
      note: "Chaque grande enquête a conduit à des règles, des équipements ou des formations qui protègent aujourd’hui tous les passagers.",
      cols: ["Date", "Vol / lieu", "Morts", "Cause principale", "Ce qui a changé"],
      tri: 0,
      L: [
        ["1954-01-10", "BOAC 781, Comet, au large de l’île d’Elbe", "35", "rupture du fuselage par fatigue du métal", "essais de fatigue en cuve, conception « tolérante aux dommages »"],
        ["1956-06-30", "TWA 2 et United 718, Grand Canyon", "128", "collision en vol hors contrôle radar", "création de la FAA en 1958 et contrôle radar en route"],
        ["1972-12-29", "Eastern 401, Everglades", "101", "équipage absorbé par une ampoule de train", "naissance de la gestion des ressources de l’équipage (CRM)"],
        ["1974-03-03", "Turkish Airlines 981, Ermenonville", "346", "porte de soute mal verrouillée sur DC-10", "nouveaux verrouillages et planchers résistant à la décompression"],
        ["1977-03-27", "KLM 4805 et Pan Am 1736, Tenerife", "583", "décollage sans autorisation dans le brouillard", "phraséologie normalisée et CRM généralisé"],
        ["1978-09-25", "PSA 182, San Diego", "144", "collision avec un Cessna en approche", "zones de contrôle renforcées autour des grands aéroports"],
        ["1979-05-25", "American 191, Chicago", "273", "moteur arraché après un entretien non conforme", "procédures de dépose des moteurs revues"],
        ["1982-01-13", "Air Florida 90, Washington", "78", "givrage et antigivrage moteur non activé", "règles de dégivrage et délais de protection"],
        ["1983-06-02", "Air Canada 797, Cincinnati", "23", "incendie dans les toilettes", "détecteurs de fumée en cabine, balisage lumineux au sol"],
        ["1983-07-23", "Air Canada 143, « planeur de Gimli »", "0", "panne sèche après une erreur de conversion d’unités", "contrôles du carburant embarqué renforcés"],
        ["1985-08-02", "Delta 191, Dallas-Fort Worth", "137", "microrafale en approche", "détecteurs de cisaillement de vent à bord et au sol"],
        ["1985-08-12", "Japan Airlines 123, mont Osutaka", "520", "réparation défectueuse de la cloison arrière", "contrôle des réparations structurales"],
        ["1985-08-22", "British Airtours 28M, Manchester", "55", "incendie moteur au décollage", "accès élargi aux issues d’ailes, sièges moins inflammables"],
        ["1986-08-31", "Aeroméxico 498, Cerritos", "82", "collision avec un avion léger", "TCAS rendu obligatoire aux États-Unis"],
        ["1988-04-28", "Aloha 243, Hawaï", "1", "arrachement du toit : fatigue et corrosion", "programme de surveillance des avions vieillissants"],
        ["1989-07-19", "United 232, Sioux City", "112", "disque de soufflante fissuré (défaut du titane)", "contrôles par ultrasons des pièces tournantes"],
        ["1990-01-25", "Avianca 52, New York", "73", "panne sèche, urgence mal exprimée", "phraséologie « MAYDAY FUEL »"],
        ["1992-01-20", "Air Inter 148, mont Sainte-Odile", "87", "descente trop rapide en approche", "avertisseur de proximité du sol (GPWS) obligatoire en France"],
        ["1994-09-08", "USAir 427, Pittsburgh", "132", "gouverne de direction inversée sur 737", "servocommande de direction redessinée"],
        ["1996-07-17", "TWA 800, Long Island", "230", "explosion du réservoir central", "réduction de l’inflammabilité des réservoirs (inertage)"],
        ["1996-11-12", "Collision de Charkhi Dadri, Inde", "349", "collision en vol, erreur d’altitude", "TCAS obligatoire en Inde, exigences d’anglais"],
        ["1998-09-02", "Swissair 111, Halifax", "229", "incendie de câblage, isolant inflammable", "remplacement des isolants thermo-acoustiques"],
        ["2000-01-31", "Alaska 261, Californie", "88", "vérin de stabilisateur mal lubrifié", "intervalles de graissage et d’inspection revus"],
        ["2000-07-25", "Concorde AF4590, Gonesse", "113", "pneu éclaté par une lamelle métallique", "réservoirs doublés de Kevlar, nouveaux pneus"],
        ["2001-08-24", "Air Transat 236, Açores", "0", "fuite de carburant, plané de 19 minutes", "procédures de fuite carburant, contrôle des pièces montées"],
        ["2001-10-08", "Collision de Linate, Milan", "118", "collision au sol par brouillard", "plan européen contre les incursions de piste, radar sol"],
        ["2002-07-01", "Collision d’Überlingen", "71", "ordres contradictoires TCAS et contrôle", "priorité absolue aux avis de résolution du TCAS"],
        ["2005-08-14", "Helios 522, Grèce", "121", "pressurisation laissée en mode manuel", "alarmes et vérifications de pressurisation revues"],
        ["2009-02-12", "Colgan 3407, Buffalo", "50", "décrochage, fatigue de l’équipage", "1 500 heures exigées des copilotes aux États-Unis"],
        ["2009-06-01", "Air France 447, Atlantique", "228", "sondes Pitot givrées, décrochage", "entraînement aux positions inhabituelles (UPRT), balises plus durables"],
        ["2014-03-08", "Malaysia Airlines 370, océan Indien", "239", "disparition inexpliquée", "suivi des avions toutes les 15 minutes, balises de détresse autonomes"],
        ["2015-03-24", "Germanwings 9525, Alpes", "150", "acte délibéré du copilote", "suivi médical et soutien psychologique des pilotes renforcés"],
        ["2019-03-10", "Ethiopian 302 (après Lion Air 610)", "157", "système MCAS du 737 MAX", "immobilisation mondiale du 737 MAX et réforme de la certification"]
      ]
    },
    "aeroports-remarquables": {
      titre: "📍 Aéroports remarquables : le tableau",
      note: "Records, pistes extrêmes, architecture et histoire. Code OACI entre parenthèses.",
      cols: ["Aéroport", "Pays", "Catégorie", "Particularité"],
      tri: 2,
      L: [
        ["Courchevel (LFLJ)", "France", "piste extrême", "piste de 537 m en pente d’environ 18 %, réservée aux pilotes qualifiés"],
        ["Lukla Tenzing-Hillary (VNLK)", "Népal", "piste extrême", "piste d’environ 530 m en pente, à plus de 2 800 m d’altitude, porte de l’Everest"],
        ["Saint-Barthélemy (TFFJ)", "France (Antilles)", "piste extrême", "piste courte précédée d’une descente au ras du col de la Tourmente"],
        ["Saba (TNCS)", "Pays-Bas (Caraïbes)", "piste extrême", "environ 400 m, l’une des plus courtes pistes commerciales du monde"],
        ["Paro (VQPR)", "Bhoutan", "piste extrême", "approche entre les montagnes, seuls quelques pilotes y sont habilités"],
        ["Princess Juliana (TNCM)", "Saint-Martin (partie néerlandaise)", "spectaculaire", "avions au ras de Maho Beach"],
        ["Gibraltar (LXGB)", "Royaume-Uni", "spectaculaire", "piste longtemps traversée par l’avenue principale (tunnel routier ouvert en 2023)"],
        ["Barra (EGPR)", "Royaume-Uni (Écosse)", "spectaculaire", "atterrissage sur la plage, horaires réglés sur les marées"],
        ["Madère Funchal (LPMA)", "Portugal", "spectaculaire", "piste prolongée sur pilotis au-dessus de la mer, vents difficiles"],
        ["Innsbruck (LOWI)", "Autriche", "spectaculaire", "approche dans une vallée alpine encaissée"],
        ["Daocheng Yading (ZUDC)", "Chine", "record", "le plus haut aéroport civil du monde, 4 411 m"],
        ["Qamdo Bamda (ZUBD)", "Chine", "record", "piste publique la plus longue, 5 500 m, à plus de 4 300 m d’altitude"],
        ["El Alto, La Paz (SLLP)", "Bolivie", "record", "grand aéroport international à plus de 4 000 m"],
        ["Amsterdam-Schiphol (EHAM)", "Pays-Bas", "record", "aménagé sur un ancien lac, environ 3 m sous le niveau de la mer"],
        ["Atlanta Hartsfield-Jackson (KATL)", "États-Unis", "record", "aéroport le plus fréquenté du monde (plus de 100 millions de passagers par an)"],
        ["Dubaï (OMDB)", "Émirats arabes unis", "record", "premier aéroport du monde pour les passagers internationaux"],
        ["Dammam Roi-Fahd (OEDF)", "Arabie saoudite", "record", "le plus vaste en superficie (environ 776 km²)"],
        ["Denver (KDEN)", "États-Unis", "record", "six pistes et la plus longue piste publique des États-Unis (4 877 m)"],
        ["Longyearbyen (ENSB)", "Norvège (Svalbard)", "record", "aéroport à vols réguliers parmi les plus septentrionaux du monde"],
        ["College Park (KCGS)", "États-Unis", "historique", "en service depuis 1909, le plus ancien aéroport en activité continue"],
        ["Paris-Le Bourget (LFPB)", "France", "historique", "arrivée de Lindbergh en 1927, Salon international depuis 1953"],
        ["Berlin-Tempelhof (EDDI)", "Allemagne", "historique", "aérogare monumentale des années 1930, fermé en 2008, devenu un parc"],
        ["Hong Kong Kai Tak (VHHX)", "Chine (Hong Kong)", "historique", "virage serré au-dessus des immeubles, fermé en 1998"],
        ["Toulouse-Blagnac (LFBO)", "France", "historique", "berceau du Concorde, de l’A380 et des chaînes Airbus"],
        ["Bâle-Mulhouse EuroAirport (LFSB)", "France / Suisse", "insolite", "aéroport binational franco-suisse, situé en France"],
        ["Genève (LSGG)", "Suisse", "insolite", "possède un secteur français relié directement à la France"],
        ["Bar Yehuda, mer Morte (LLMZ)", "Israël", "insolite", "piste la plus basse du monde, environ 380 m sous le niveau de la mer"],
        ["Hong Kong Chek Lap Kok (VHHH)", "Chine (Hong Kong)", "architecture", "bâti sur une île artificielle, ouvert en 1998 (Norman Foster)"],
        ["Kansai (RJBB)", "Japon", "architecture", "première île artificielle aéroportuaire (1994), terminal de Renzo Piano"],
        ["Nice-Côte d’Azur (LFMN)", "France", "architecture", "pistes gagnées sur la mer"],
        ["Paris-Charles-de-Gaulle (LFPG)", "France", "architecture", "Terminal 1 circulaire de Paul Andreu (1974)"],
        ["New York JFK (KJFK)", "États-Unis", "architecture", "TWA Flight Center d’Eero Saarinen (1962), devenu hôtel"],
        ["Washington-Dulles (KIAD)", "États-Unis", "architecture", "terminal à toit suspendu d’Eero Saarinen (1962)"],
        ["Djeddah Roi-Abdulaziz (OEJN)", "Arabie saoudite", "architecture", "terminal du Hadj sous de grandes toiles tendues"],
        ["Singapour Changi (WSSS)", "Singapour", "architecture", "Jewel et sa cascade intérieure d’environ 40 m (2019)"],
        ["Pékin-Daxing (ZBAD)", "Chine", "architecture", "terminal en étoile de Zaha Hadid, ouvert en 2019"]
      ]
    }
  };

  function construire(v) {
    var c = T[v], sec = document.querySelector('section[data-view="' + v + '"]');
    if (!sec || document.getElementById("v34-" + v)) return;
    var d = document.createElement("div");
    d.id = "v34-" + v; d.className = "group"; d.style.marginTop = "24px";
    d.innerHTML = '<h2>' + esc(c.titre) + '</h2><p class="note">' + esc(c.note) + '</p>' +
      '<div class="controls"><input type="search" placeholder="Rechercher dans le tableau…" aria-label="Rechercher dans le tableau"></div>' +
      '<p class="note v34n"></p><div style="overflow-x:auto"><table class="v34t" style="width:100%;border-collapse:collapse;font-size:.9em">' +
      '<thead><tr>' + c.cols.map(function (h) { return '<th style="text-align:left;padding:6px;border-bottom:2px solid currentColor">' + esc(h) + '</th>'; }).join("") +
      '</tr></thead><tbody></tbody></table></div><p class="note">Tableau rédigé par Cotes & Routes d’après les rapports d’enquête et des sources encyclopédiques ouvertes.</p>';
    var vue = sec.querySelector(".ey-vue");
    if (vue && vue.parentNode === sec) vue.insertAdjacentElement("afterend", d); else sec.appendChild(d);
    var L = c.L.slice().sort(function (a, b) { return String(a[c.tri]).localeCompare(String(b[c.tri]), "fr"); });
    var cle = L.map(function (r) { return norm(r.join(" ")); });
    var q = d.querySelector("input"), tb = d.querySelector("tbody"), n = d.querySelector(".v34n");
    function rendre() {
      var mots = norm(q.value).split(" ").filter(Boolean), h = [], k = 0;
      L.forEach(function (r, i) {
        if (mots.every(function (m) { return cle[i].indexOf(m) >= 0; })) {
          k++;
          h.push('<tr>' + r.map(function (x) { return '<td style="padding:6px;border-bottom:1px solid rgba(128,128,128,.3);vertical-align:top">' + esc(x) + '</td>'; }).join("") + '</tr>');
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
