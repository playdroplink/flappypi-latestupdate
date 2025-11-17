# Flappy Pi

**Flappy Pi** est un jeu addictif de style Flappy Bird avec des niveaux infinis, entièrement intégré à l'écosystème Pi Network. Les joueurs peuvent se connecter avec Pi, effectuer des achats en jeu avec des pièces Pi, participer à un classement en temps réel et gagner des récompenses hebdomadaires de Pi.

---

## Fonctionnalités

- Gameplay de défilement latéral infini avec des tuyaux générés procéduralement
- Contrôles fluides par tap/clic avec difficulté croissante
- Skins d'oiseau personnalisables achetables via des paiements Pi
- Connexion Pi Network et intégration de portefeuille
- Classement en temps réel avec les 10 meilleurs scores de joueurs
- Récompenses hebdomadaires de tokens Pi pour les gagnants du classement
- Publicités récompensées pour les réanimations et petites bonifications Pi
- Design responsive pour ordinateurs de bureau et appareils mobiles
- Écran de démarrage et logo de marque par mrwain organization

---

## Démo

> _[Insérer le lien vers la démo hébergée ou les captures d'écran ici]_

---

## Installation et Configuration

### Prérequis

- Node.js (v14 ou supérieur)
- npm ou yarn
- Identifiants développeur Pi Network
- Firebase ou votre configuration backend préférée

### Cloner le Répertoire

```bash
git clone https://github.com/yourusername/flappy-pi.git
cd flappy-pi
```

### Installer les Dépendances

```bash
npm install
```

### Configurer les Variables d'Environnement

Créer un fichier `.env` à la racine avec :

```env
PI_APP_ID=votre_pi_app_id
DATABASE_URL=votre_chaine_de_connexion_base_de_donnees
PI_WALLET_ADDRESS=votre_adresse_portefeuille_pi
```

### Exécuter Localement

```bash
npm run start
```

---

## Utilisation

* Connectez-vous avec votre compte Pi Network
* Jouez en tapant ou cliquant pour faire battre l'oiseau
* Achetez des skins d'oiseau, des réanimations et des multiplicateurs dans la boutique en utilisant des pièces Pi
* Vérifiez votre rang dans le classement après chaque partie
* Regardez des publicités récompensées pour gagner des vies supplémentaires ou des bonifications Pi
* Les meilleurs joueurs hebdomadaires reçoivent automatiquement des récompenses Pi

---

## Structure des Dossiers

```
flappy-pi/
├── index.html
├── styles.css
├── game.js
├── shop.js
├── leaderboard.js
├── ads.js
├── pi-sdk.js
├── assets/
│   ├── bird.png
│   ├── bird-skin-red.png
│   ├── pipe.png
│   └── logo.png
├── backend/
│   ├── server.js
│   └── database.js
├── README.md
└── package.json
```

---

## Déploiement

Consultez [deployment_guide.md](docs/deployment_guide.md) pour des instructions détaillées sur le déploiement du frontend et backend.

---

## Contribution

Les contributions sont les bienvenues ! Veuillez forker le répertoire et créer une pull request avec vos améliorations.

---

## Licence

Licence MIT © Juin 2025 Flappy Pi

---

## Contact

Pour le support ou les demandes de renseignements, contactez :
**Flappy Pi**
Email : [support@flappypi.fun](mailto:support@flappypi.fun) ou [flappypi.fun@gmail.com](mailto:flappypi.fun@gmail.com)
Site web : [https://www.flappypi.fun](https://www.flappypi.fun) (flappy.pi bientôt disponible)

---

Profitez de voler avec Flappy Pi ! 🐦🚀 