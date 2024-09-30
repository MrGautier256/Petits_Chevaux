# Spécifications Complètes du Projet : Jeu de Petits Chevaux en Ligne

## Introduction

Le projet consiste à développer une application web permettant de jouer en ligne au **Jeu de Petits Chevaux**, un jeu de société traditionnel français similaire à **Ludo** ou **Parcheesi**. L'application doit permettre à plusieurs joueurs de participer à une partie en temps réel, avec une interface conviviale et une logique de jeu conforme aux règles officielles.

## Objectifs du Projet

- **Créer une plateforme multijoueur en temps réel** pour le Jeu de Petits Chevaux.
- **Permettre aux joueurs de créer et de rejoindre des salles** de jeu.
- **Implémenter la logique complète du jeu**, y compris les règles spécifiques, les déplacements des pions, les captures, etc.
- **Fournir une interface utilisateur intuitive** et agréable pour une expérience de jeu optimale.
- **Assurer la synchronisation en temps réel** des actions entre les joueurs via une communication serveur-client efficace.

## Technologies à Utiliser

- **Node.js** : Pour le développement du serveur backend.
- **Express.js** : Framework web pour Node.js, pour gérer les routes et les requêtes HTTP.
- **Socket.IO** : Pour la communication en temps réel entre le serveur et les clients (joueurs), permettant la synchronisation des actions de jeu.
- **HTML/CSS** : Pour la structure et le style des pages web.
- **JavaScript** : Pour la logique côté client, l'interaction avec l'interface utilisateur et la communication avec le serveur.
- **Optionnel** : Bibliothèques ou frameworks CSS comme **Bootstrap** pour une mise en page réactive et esthétiquement agréable.

## Fonctionnalités Attendues

### 1. Accueil et Navigation

- **Page d'accueil** avec les options pour :
  - **Créer une nouvelle salle** de jeu.
  - **Rejoindre une salle existante** en utilisant un code de salle.
- **Formulaire d'entrée du nom du joueur** lors de la création ou de la jointure d'une salle.

### 2. Création et Gestion des Salles

- **Génération d'un code de salle unique** pour chaque nouvelle salle créée.
- **Stockage des informations de la salle** sur le serveur, y compris la liste des joueurs, l'état de la partie, etc.
- **Limitation du nombre de joueurs** par salle (par exemple, 2 à 4 joueurs).
- **Gestion des rôles** :
  - **Créateur de la salle** : Joueur qui a créé la salle, avec des privilèges supplémentaires (par exemple, démarrer la partie).
  - **Joueurs invités** : Joueurs qui rejoignent une salle existante.

### 3. Lobby de la Salle

- **Affichage de la liste des joueurs** présents dans la salle.
- **Indication du code de la salle** pour le partage avec d'autres joueurs.
- **Bouton pour démarrer la partie**, accessible uniquement au créateur de la salle.
- **Mise à jour en temps réel** de la liste des joueurs lorsque de nouveaux joueurs rejoignent la salle.

### 4. Logique du Jeu

- **Implémentation complète des règles du Jeu de Petits Chevaux** :
  - Chaque joueur possède un ensemble de pions (chevaux) de couleur unique.
  - Les pions commencent dans l'écurie (zone de départ).
  - Un 6 est nécessaire pour sortir un pion de l'écurie.
  - Les joueurs lancent un dé à tour de rôle pour déterminer le nombre de cases à avancer.
  - Les pions se déplacent sur le plateau dans le sens horaire.
  - Si un pion atterrit sur une case occupée par un pion adverse, le pion adverse retourne à son écurie.
  - Un joueur doit faire le tour complet du plateau et entrer dans sa zone d'arrivée pour gagner.
  - Le premier joueur à amener tous ses pions dans sa zone d'arrivée remporte la partie.

- **Gestion des tours** :
  - Indication claire du joueur dont c'est le tour.
  - Si un joueur obtient un 6, il rejoue.
- **Déplacement des pions** :
  - Interface pour sélectionner le pion à déplacer parmi les options possibles.
  - Calcul des mouvements possibles en fonction du résultat du dé et de la position des pions.
- **Gestion des captures** :
  - Retour des pions capturés à l'écurie.
  - Notification aux joueurs lorsqu'un pion est capturé.

### 5. Interface Utilisateur

- **Plateau de jeu visuel** :
  - Représentation graphique du plateau avec les cases.
  - Affichage des pions sur le plateau avec des couleurs distinctes pour chaque joueur.
- **Indicateurs visuels** :
  - Indication du joueur actuel.
  - Mise en évidence des pions sélectionnables.
- **Historique des actions** (optionnel) :
  - Journal des événements récents (lancements de dé, déplacements, captures, etc.).
- **Notifications et messages** :
  - Affichage des messages d'erreur ou d'information (par exemple, "Ce n'est pas votre tour", "Vous devez obtenir un 6 pour sortir un pion", etc.).

### 6. Communication en Temps Réel

- **Synchronisation des actions** entre les joueurs via Socket.IO.
- **Mises à jour instantanées** du plateau de jeu pour tous les joueurs lors des déplacements.
- **Gestion des événements** :
  - Connexion et déconnexion des joueurs.
  - Début et fin de partie.

### 7. Gestion des Erreurs et Robustesse

- **Validation des actions du joueur** :
  - Vérifier que c'est bien le tour du joueur.
  - Vérifier que les mouvements sont valides.
- **Gestion des déconnexions** :
  - Gérer les cas où un joueur se déconnecte en cours de partie.
  - Option pour les joueurs restants de continuer la partie ou de la terminer.
- **Messages d'erreur clairs** pour informer les joueurs en cas de problème.

## Architecture et Organisation du Code

### Côté Serveur

- **Fichier principal `server.js`** :
  - Configuration du serveur Express et Socket.IO.
  - Gestion des routes (le cas échéant).
  - Gestion des événements Socket.IO :
    - Création de salle.
    - Jointure de salle.
    - Lancement du dé.
    - Déplacement des pions.
    - Mise à jour des états de jeu.
- **Structure des données** :
  - Objets pour représenter les salles, les joueurs, l'état du jeu, etc.
  - Gestion des identifiants uniques pour les joueurs (`playerId`) et les salles (`roomCode`).

## Exigences Techniques

- **Compatibilité Navigateur** :
  - L'application doit être compatible avec les navigateurs modernes (Chrome, Firefox, Edge, Safari).
- **Responsive Design** :
  - L'interface doit être utilisable sur différents dispositifs (ordinateurs de bureau, tablettes, mobiles).
- **Performances** :
  - Optimiser le code pour assurer une expérience fluide, même avec plusieurs joueurs connectés.
- **Sécurité** :
  - Valider toutes les entrées utilisateur pour prévenir les injections de code ou les attaques XSS.
  - Gérer les sessions de manière sécurisée.

## Instructions pour le Développement

- **Initialiser un projet Node.js** avec `npm init` et installer les dépendances nécessaires (`express`, `socket.io`).
- **Organiser le code** en respectant les bonnes pratiques de développement, avec des commentaires clairs et une structure de dossiers cohérente.
- **Utiliser Git pour le contrôle de version** :
  - Commits réguliers avec des messages explicites.
  - Branches pour les nouvelles fonctionnalités ou les corrections de bugs.


## Étapes de Réalisation

1. **Mise en place du serveur** :
   - Configuration de Express.js et Socket.IO.
   - Création des routes pour servir les fichiers statiques.
2. **Création des pages HTML et de l'interface de base**.
3. **Implémentation de la création et de la jointure des salles** :
   - Génération de codes de salle.
   - Stockage des salles et des joueurs sur le serveur.
4. **Développement du lobby** :
   - Affichage de la liste des joueurs.
   - Gestion du démarrage de la partie.
5. **Implémentation de la logique du jeu** :
   - Règles du Jeu de Petits Chevaux.
   - Gestion des tours et des actions des joueurs.
6. **Développement de l'interface de jeu** :
   - Affichage du plateau et des pions.
   - Interaction avec les éléments de l'interface.
7. **Communication en temps réel avec Socket.IO** :
   - Synchronisation des actions et des états du jeu.
   - Gestion des événements (lancement du dé, déplacement, captures).
8. **Tests et débogage** :
   - Vérification du bon fonctionnement de toutes les fonctionnalités.
   - Correction des bugs et optimisation du code.
9. **Améliorations et fonctionnalités supplémentaires** (optionnel) :
   - Ajout d'un système de chat pour les joueurs.
   - Animations pour les déplacements des pions.
   - Personnalisation des avatars ou des pions.

## Livrables

- **Code source complet** de l'application, organisé et commenté.
- **Documentation** :
  - Instructions pour installer et exécuter l'application en local.
  - Description de l'architecture et des principales fonctions.
- **Fichiers de configuration** (par exemple, `package.json`).
- **Scripts d'automatisation** (le cas échéant) pour lancer le serveur ou les tâches de développement.

## Conclusion

Ce projet vise à créer une application web complète pour le Jeu de Petits Chevaux, permettant aux joueurs de profiter d'une expérience de jeu conviviale et immersive en ligne. En suivant ces spécifications détaillées, le développeur pourra concevoir une application robuste, performante et agréable à utiliser.