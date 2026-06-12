# Guide pratique — du PC à la présentation

Ce guide te conduit pas à pas : installer le projet sur ton PC avec VS Code,
lancer les deux versions, publier sur GitHub, remettre le travail au professeur,
et faire jouer d'autres étudiants en ligne.

> **À retenir avant tout**
> - **Version 1 (locale)** = deux joueurs sur le **même écran** (pas de réseau).
>   Partager son lien permet à chacun de jouer seul, les deux camps. Ce n'est
>   donc PAS du jeu à distance.
> - **Version 2 (distante)** = le **vrai multijoueur** (Ajax + PHP). C'est
>   celle-ci qu'on héberge pour faire jouer deux étudiants éloignés.
> - **PHP ne tourne pas sur GitHub Pages.** GitHub Pages = fichiers statiques
>   seulement → parfait pour la Version 1, **impossible** pour la Version 2.

---

## 1. Installer le projet sur ton PC (VS Code)

1. Décompresse `songo-tp.zip` quelque part (ex. `Documents\songo-tp`).
2. Ouvre **VS Code** → menu **Fichier > Ouvrir le dossier…** → choisis `songo-tp`.
3. (Recommandé) Installe l'extension **Live Server** (par Ritwick Dey) :
   onglet Extensions (Ctrl+Shift+X) → cherche « Live Server » → Installer.

---

## 2. Lancer les deux versions en local

### Version 1 — aucune installation
- Dans VS Code, ouvre `version1-local/index.html`, clic droit →
  **Open with Live Server** (ou double-clic sur le fichier dans l'explorateur
  Windows). Le jeu s'ouvre dans le navigateur. C'est tout.

### Version 2 — nécessite PHP (XAMPP)
VS Code seul **n'exécute pas** PHP. Il faut un serveur PHP : **XAMPP**.

1. Télécharge et installe **XAMPP** (https://www.apachefriends.org).
2. Copie le dossier `version2-distante` dans le dossier web de XAMPP :
   `C:\xampp\htdocs\` → tu obtiens `C:\xampp\htdocs\version2-distante\`.
3. Ouvre le **XAMPP Control Panel** et clique **Start** sur **Apache**.
4. Dans le navigateur : `http://localhost/version2-distante/`.
5. Pour t'auto-tester sur une seule machine : ouvre **deux onglets**
   (ou un onglet + une fenêtre privée). Dans le premier, **Créer** une partie
   (tu obtiens un code) ; dans le second, **Rejoindre** avec ce code.

> ⚠️ N'ouvre PAS la Version 2 avec Live Server : le PHP ne s'exécuterait pas.
> Elle doit toujours passer par Apache (`http://localhost/...`).

---

## 3. Publier sur GitHub

### Option simple (interface VS Code)
1. Onglet **Source Control** (Ctrl+Shift+G) → **Initialize Repository**.
2. Saisis un message (ex. « Premier dépôt ») → **Commit**.
3. Clique **Publish Branch** → choisis **public** → connecte ton compte GitHub.
   VS Code crée le dépôt et envoie le code.

### Option ligne de commande (équivalent)
```bash
cd songo-tp
git init
git add .
git commit -m "Le Songo — versions locale et distante"
git branch -M main
# crée d'abord un dépôt vide nommé "songo-tp" sur github.com, puis :
git remote add origin https://github.com/TON-COMPTE/songo-tp.git
git push -u origin main
```

> Conseil : ajoute un fichier `.gitignore` contenant `node_modules/` si jamais
> tu réinstalles des outils. Le projet livré n'en a pas besoin.

---

## 4. Mettre la Version 1 en ligne gratuitement (GitHub Pages)

La Version 1 est 100 % statique : GitHub peut l'héberger gratuitement.

1. Sur la page du dépôt GitHub → **Settings > Pages**.
2. **Source** : Branch `main`, dossier `/ (root)` → **Save**.
3. Au bout d'une minute, tu obtiens une adresse du type
   `https://TON-COMPTE.github.io/songo-tp/version1-local/`.
4. Ce lien est **permanent** : tu peux le donner au prof et aux étudiants.
   (Rappel : chacun y joue les deux camps, ce n'est pas du duel à distance.)

---

## 5. Faire jouer d'autres étudiants — la Version 2 en ligne

Pour un **vrai duel** entre deux étudiants, il faut que la Version 2 (PHP)
soit accessible publiquement. Trois manières, de la plus simple à la plus durable.

### Option A — Même réseau (le plus simple, idéal en classe)
Si les deux joueurs sont sur le **même Wi-Fi** (ou ton partage de connexion
téléphone) :
1. Lance Apache (XAMPP) sur ton PC.
2. Trouve l'adresse IP de ton PC : ouvre l'invite de commandes, tape
   `ipconfig`, lis la ligne **Adresse IPv4** (ex. `192.168.1.10`).
3. L'autre joueur ouvre `http://192.168.1.10/version2-distante/`.
4. Toi tu crées la partie, lui rejoint avec le code. Aucun internet requis :
   parfait pour la présentation en salle.

### Option B — Lien public temporaire (ngrok)
Pour inviter quelqu'un **hors de ton réseau**, sans rien héberger, tu exposes
ton XAMPP via un tunnel.
1. Crée un compte gratuit sur https://ngrok.com et installe ngrok.
2. Récupère ton *authtoken* sur le tableau de bord, puis configure-le :
   ```bash
   ngrok config add-authtoken TON_TOKEN
   ```
3. Apache démarré (port 80), lance :
   ```bash
   ngrok http 80
   ```
4. ngrok affiche une adresse publique `https://xxxx.ngrok-free.app`. Donne à
   tes camarades : `https://xxxx.ngrok-free.app/version2-distante/`.
5. Limites : le lien change à chaque redémarrage, et ton PC doit rester allumé.
   Idéal pour une démo ponctuelle, pas pour un lien permanent.

### Option C — Hébergement public gratuit (le plus durable) : InfinityFree
Pour un **lien stable** que n'importe qui peut ouvrir, même PC éteint.
InfinityFree est gratuit et supporte PHP 8.3 + écriture de fichiers (vérifié 2026).
1. Crée un compte sur https://infinityfree.com et un site (tu obtiens un
   sous-domaine gratuit, ex. `tonsongo.infinityfreeapp.com`).
2. Récupère les identifiants **FTP** dans le panneau (host, user, mot de passe).
3. Avec **FileZilla** (gratuit), connecte-toi en FTP et dépose le **contenu**
   de `version2-distante/` dans le dossier `htdocs` du serveur.
4. Vérifie que le dossier `games/` existe et est accessible en écriture
   (via le gestionnaire de fichiers du panneau, droits 755 ou 777 si besoin).
5. Partage le lien `https://tonsongo.infinityfreeapp.com/`. Deux étudiants
   l'ouvrent, l'un crée, l'autre rejoint, ils jouent en duel.

> Si InfinityFree te bride, **Byet.host** (même société) est l'alternative.
> Évite 000webhost : fermé depuis fin 2024.

---

## 6. Comment remettre le travail au professeur

Tu as trois supports possibles ; le mieux est de **combiner** :

1. **Le dépôt GitHub (lien)** — le plus professionnel : montre le code organisé,
   l'historique, et le rapport. Donne l'URL `https://github.com/TON-COMPTE/songo-tp`.
2. **L'archive `songo-tp.zip`** — en pièce jointe, comme sécurité (si le prof
   préfère un fichier ou n'a pas internet).
3. **Des liens jouables** — pour qu'il teste sans rien installer :
   - Version 1 : ton lien **GitHub Pages**.
   - Version 2 : ton lien **InfinityFree** (ou ngrok pendant la démo).

Le **RAPPORT.docx** est à remettre dans tous les cas (dépôt + pièce jointe).
Pense à compléter ton nom et celui du prof sur la page de garde, et à mettre à
jour le sommaire dans Word (clic droit sur le sommaire → « Mettre à jour les champs »).

---

## 7. Déroulé conseillé pour la présentation (13 h)

1. **Présente le jeu en 2 phrases** : un jeu de semailles, but = 40 graines sur 70.
2. **Montre la Version 1** (lien GitHub Pages ou local) : joue 3-4 coups, fais une
   prise, explique que les cases vertes sont les coups autorisés.
3. **Explique l'architecture** : un seul **moteur** (engine.js) pour les deux
   versions ; la V1 ajoute l'affichage, la V2 ajoute le réseau.
4. **Montre la Version 2 en duel** : sur deux écrans (ton PC + le téléphone/PC
   d'un camarade via le même Wi-Fi, Option A). Crée une partie, fais rejoindre,
   joue un coup et montre qu'il apparaît tout seul sur l'autre écran (Ajax + polling).
5. **Cite un point technique fort** : « les deux joueurs sèment dans le même sens ;
   je l'ai découvert grâce à un test de symétrie qui échouait ». Ça montre une
   vraie démarche d'ingénieur.
6. **Conclus sur le rapport** et propose les liens.

---

## 8. Récapitulatif des liens à préparer

| Quoi | Où | Sert à |
|---|---|---|
| Code + rapport | `github.com/TON-COMPTE/songo-tp` | Remise officielle |
| Version 1 jouable | `…github.io/songo-tp/version1-local/` | Test instantané (même écran) |
| Version 2 en duel | `…infinityfreeapp.com/` ou ngrok | Inviter des étudiants à jouer |
| Archive de secours | `songo-tp.zip` | Pièce jointe |
