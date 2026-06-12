# Le Songo — Travaux pratiques

Implémentation web du jeu africain **Le Songo** (famille de l'awalé / mancala),
en deux versions, avec un **moteur de jeu commun** écrit une seule fois.

```
songo-tp/
├── engine.js                  ← MOTEUR DE JEU (les règles), partagé
├── version1-local/            ← VERSION 1 : 2 joueurs sur le même écran
│   ├── index.html
│   ├── style.css
│   ├── local.js               ← contrôleur d'interface
│   └── engine.js              ← copie du moteur
├── version2-distante/         ← VERSION 2 : 2 joueurs distants (Ajax + PHP)
│   ├── index.html
│   ├── style.css
│   ├── remote.js              ← contrôleur réseau (Ajax, polling)
│   ├── api.php                ← serveur « plateau partagé »
│   ├── engine.js              ← copie du moteur
│   ├── games/                 ← stockage des parties (écriture requise)
│   └── README.md              ← lancement détaillé sous XAMPP
├── tests/
│   └── test-engine.js         ← tests automatisés du moteur (node)
└── RAPPORT.docx               ← rapport académique (les 2 versions)
```

## Démarrage rapide

**Version 1 (locale)** — aucune installation :
> ouvrir `version1-local/index.html` dans un navigateur.

**Version 2 (distante)** — nécessite PHP (XAMPP/WAMP) :
> voir `version2-distante/README.md`.

## L'idée centrale

Les **règles** du Songo sont regroupées dans `engine.js`, qui ne touche ni à
l'affichage ni au réseau. On les apprend et on les vérifie **une seule fois** ;
chaque version n'ajoute que ce qui la distingue :

- la **version locale** ajoute l'affichage (`local.js`) ;
- la **version distante** ajoute la communication (`remote.js` + `api.php`).

## Vérifier le moteur (facultatif)

Avec Node.js installé :

```bash
cd songo-tp
node tests/test-engine.js
```

Les tests couvrent la prise simple, la prise à la chaîne, la case protégée,
la solidarité, les interdits et la victoire à 40 graines.

## Ouvrir le rapport

`RAPPORT.docx` : à l'ouverture dans Word, faire un clic droit sur le sommaire
puis « Mettre à jour les champs » pour afficher la pagination.
