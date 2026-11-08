# Cotes & Routes — mise en ligne automatique

Ce dossier contient tout le site. Une fois installé sur GitHub (gratuit), il est en ligne en permanence et son annuaire des aéroports se met à jour **tout seul chaque lundi**. Vous n’aurez plus rien à faire après l’installation.

## Installation (une seule fois, environ 10 minutes, possible sur téléphone)

1. Créez un compte gratuit sur https://github.com (« Sign up »).
2. Appuyez sur **+** puis **New repository**. Nom : `cotes-et-routes`. Cochez **Public**, puis **Create repository**.
3. Appuyez sur **uploading an existing file**, choisissez le fichier `index.html`, puis **Commit changes**.
4. Appuyez sur **Add file > Create new file**. Comme nom, tapez exactement `.github/workflows/mise-a-jour.yml` (les « / » créent les dossiers). Collez dans la zone de texte tout le contenu du fichier `mise-a-jour.yml`, puis **Commit changes**.
5. Allez dans **Settings > Pages**. Sous « Branch », choisissez **main** et **/ (root)**, puis **Save**.
6. Allez dans l’onglet **Actions**, acceptez l’activation si on vous la demande, ouvrez « Mise à jour automatique des aéroports » et appuyez sur **Run workflow**.

Deux minutes plus tard, le site est en ligne à l’adresse `https://VOTRE-PSEUDO.github.io/cotes-et-routes/`, avec l’annuaire des aéroports.

## Ce qui se met à jour automatiquement

- L’**annuaire mondial des aéroports** (plus de 3 000 aéroports à vols réguliers : codes, pistes, altitude, coordonnées) et les points de la carte, à partir de la base ouverte OurAirports, chaque lundi.

## Ce qui ne peut pas se mettre à jour automatiquement

Les classements annuels (ACI, IATA, OAG, Eurocontrol, DGAC, sécurité, livraisons Airbus et Boeing) sont publiés une fois par an dans des communiqués et des rapports, parfois payants, qu’aucun programme ne peut lire de façon fiable. Ils sont mis à jour en demandant à Claude ; le calendrier des publications figure dans la rubrique « Sources » du site.

## Bon à savoir

- Si le site ne reçoit aucune modification pendant 60 jours, GitHub suspend les tâches programmées. Ici, les données OurAirports changent presque chaque semaine, donc le robot enregistre régulièrement des changements et reste actif. En cas de suspension, GitHub envoie un e-mail : il suffit de cliquer sur le bouton pour réactiver.
- Si la source de données renvoie un fichier anormal (moins de 1 000 aéroports), le robot annule la mise à jour et garde les données précédentes : le site ne peut pas être cassé par une mauvaise mise à jour.

## Activer les vols observés (OpenSky), facultatif

1. Créez un compte gratuit sur https://opensky-network.org, puis dans votre compte créez un « API client » : vous obtenez un identifiant (client_id) et un secret (client_secret).
2. Sur GitHub : **Settings > Secrets and variables > Actions > New repository secret**. Créez `OPENSKY_CLIENT_ID` puis `OPENSKY_CLIENT_SECRET` avec ces deux valeurs.
3. Créez le fichier `.github/workflows/opensky.yml` (Add file > Create new file) et collez-y le contenu fourni.
4. Onglet **Actions > Vols observés (OpenSky) > Run workflow**. Ensuite le robot tourne seul chaque jour et conserve 14 jours d’historique.

Sans ces secrets, le robot ne fait rien et ne provoque aucune erreur.

## Activer les chiffres annuels (facultatif, payant)

1. Créez un compte sur https://console.anthropic.com, ajoutez un moyen de paiement et quelques euros de crédit.
2. Dans les réglages de la Console, vérifiez que la recherche web (web search) est autorisée pour votre organisation.
3. Créez une clé d'API (« API Keys > Create Key »).
4. Sur GitHub : Settings > Secrets and variables > Actions > New repository secret, nom `ANTHROPIC_API_KEY`, valeur : la clé.
5. Créez `.github/workflows/annuel.yml` avec le contenu fourni, puis lancez « Chiffres annuels » dans Actions.
Le robot tourne ensuite le 3 de chaque mois.

## Archive permanente sur Hugging Face (gratuit)

1. Créez un compte sur https://huggingface.co.
2. Dans Settings > Access Tokens, créez un jeton de type « Write ».
3. Sur GitHub : Settings > Secrets and variables > Actions > New repository secret, nom `HF_TOKEN`, valeur : le jeton.
4. Créez `.github/workflows/archive.yml` avec le contenu fourni, puis lancez « Archivage permanent (Hugging Face) ».
Le robot crée lui-même le jeu de données public `votre-pseudo/cotes-et-routes-archive` et y dépose chaque jour toutes les archives.
