# Le Songo — Version distante (Ajax + PHP)

Deux joueurs, deux écrans. La communication passe par **Ajax** vers un petit
serveur **PHP** (`api.php`) qui sert de « plateau partagé » : il stocke l'état
de la partie dans `games/<code>.json` et le tient à jour pour les deux clients.
Les **règles** sont calculées côté navigateur par `engine.js` (le même moteur
que la version locale).

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | La page : salon de connexion puis plateau |
| `style.css` | Présentation (plateau de bois, salon) |
| `remote.js` | Contrôleur réseau : appels Ajax, polling, affichage |
| `engine.js` | Moteur de jeu commun (règles) |
| `api.php` | Serveur « plateau partagé » (créer / rejoindre / état / jouer) |
| `games/` | Dossier de stockage des parties (doit être **accessible en écriture**) |

## Lancer la partie (XAMPP ou WAMP)

1. Installer **XAMPP** (ou WAMP) et démarrer **Apache**.
2. Copier le dossier `version2-distante` dans le répertoire web :
   - XAMPP : `C:\xampp\htdocs\`
   - WAMP : `C:\wamp64\www\`
3. **Joueur 1** : ouvrir `http://localhost/version2-distante/`, choisir son camp
   et cliquer **Créer**. Un **code de partie** s'affiche (ex. `A1B2C`).
4. **Joueur 2** (autre poste du même réseau) : ouvrir
   `http://ADRESSE-IP-DU-SERVEUR/version2-distante/`
   (par exemple `http://192.168.1.10/version2-distante/`), saisir le code et
   cliquer **Rejoindre**.
5. Jouer ! Chaque joueur ne contrôle que son camp, et seulement à son tour.
   Le coup adverse apparaît tout seul (le client interroge le serveur ~1,5 s).

> Pour trouver l'adresse IP du serveur sous Windows : ouvrir l'invite de
> commandes et taper `ipconfig` (ligne « Adresse IPv4 »).

## Comment ça marche (résumé)

```
Joueur 1 (SUD)                  Serveur PHP (api.php)              Joueur 2 (NORD)
   | clic case                       | games/CODE.json                  |
   |-- POST jouer (nouvel état) ----->| vérifie : tour ? version ?       |
   |                                  |          70 graines ?            |
   |<------------- ok, version+1 -----| enregistre l'état                |
   |                                  |<---- GET etat (polling) ---------|
   |                                  |----- état + "changed" ---------->| redessine
```

Le serveur **ne rejoue pas** la partie : il fait confiance au client mais
vérifie systématiquement que c'est bien son tour, que sa version est à jour et
que les 70 graines sont conservées. (Choix de conception détaillé dans le rapport.)

## Dépannage

- *« Problème de connexion au serveur »* : Apache n'est pas démarré, ou l'URL
  ne pointe pas sur le bon dossier.
- *Parties non sauvegardées* : vérifier que `games/` est accessible en écriture.
- Les deux joueurs doivent ouvrir **la même** partie (même code).
