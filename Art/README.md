# ArtLens — Explorez les plus grands musées du monde

**Projet Framework Web — L3 Informatique**
**Enzo NM & Issam B — 2026**

---

## 1. Objectif du projet

ArtLens est une application web développée avec Vue 3 qui agrège les collections de trois grands musées mondiaux en un seul endroit : le **Met Museum**, **Harvard Art Museums** et **Europeana**.

L'application permet à tout utilisateur de :
- rechercher des œuvres d'art par mot-clé parmi des milliers d'entrées,
- explorer librement une galerie générée automatiquement,
- filtrer les résultats par source, époque et type d'œuvre,
- consulter le détail complet d'une œuvre (description, dimensions, contexte, droits…),
- sauvegarder des favoris, avec synchronisation sur tous ses appareils s'il est connecté,
- créer un compte et se connecter via Firebase Auth.

---

## 2. Fonctionnalités principales

### Agrégation multi-sources
- Interrogation simultanée de trois APIs publiques : Met Museum, Harvard Art Museums, Europeana.
- Chargement progressif : les résultats s'affichent au fur et à mesure que chaque API répond, sans attendre la plus lente.
- Normalisation des données : chaque source retourne des formats différents, tous ramenés à un objet uniforme dans l'application.

### Recherche et exploration
- Barre de recherche avec effacement rapide.
- Tags de suggestion cliquables (Portrait, Paysage, Sculpture, Impressionnisme…).
- Galerie de navigation avec jusqu'à 600 œuvres pré-chargées à partir de 28 termes thématiques.
- Pagination (24 œuvres par page) avec navigation intelligente (ellipsis).

### Filtres
- **Source** : Met Museum / Harvard Art / Europeana / Toutes.
- **Époque** : Antiquité / Médiéval / Moderne / Contemporain (détection automatique depuis la date).
- **Type** : Peinture / Sculpture / Photographie / Gravure / Dessin (détection par mots-clés dans le champ medium).

### Page de détail
- Affichage complet : titre, artiste, dates, médium, dimensions, contexte culturel, acquisition, localisation, droits.
- Galerie d'images supplémentaires avec lightbox.
- Bouton favori avec redirection vers la connexion si non authentifié.
- Liens directs vers la page de l'œuvre sur le site du musée d'origine.

### Authentification et compte utilisateur
- Inscription, connexion, déconnexion via Firebase Auth.
- Page profil avec statistiques de session (recherches, œuvres vues, sources explorées).
- Favoris synchronisés sur Firestore pour les utilisateurs connectés.
- Favoris en localStorage pour les visiteurs non connectés.

### Performance
- Cache en mémoire (TTL 5 min) pour les requêtes Met Museum.
- Guard de navigation : redirection automatique vers `/profile` si déjà connecté et tentative d'accès à `/login` ou `/register`.

---

## 3. Stack technique

| Couche | Technologie |
|---|---|
| Framework | Vue 3 (Composition API, `<script setup>`) |
| Build | Vite |
| État global | Pinia |
| Routing | Vue Router |
| Auth & BDD | Firebase (Authentication + Firestore) |
| Requêtes HTTP | Axios |
| Style | CSS custom (variables, scoped) |

---

## 4. Qui a fait quoi

### Enzo (Enzonm7)

- Initialisation du projet (structure, dépendances, Vite, Vue Router, Pinia).
- `NavBar.vue` : structure, menu hamburger mobile, badge favoris.
- `HomeView.vue` : section héro, grille de cartes à retournement (flip 3D), intégration des œuvres vedettes.
- `ExploreView.vue` : mise en place initiale, tags de suggestion, gestion des filtres.
- `SearchInput.vue` et `FilterPanel.vue` : composants de recherche et de filtrage.
- Palette de couleurs Renaissance dans `base.css` et styles globaux dans `main.css`.
- Intégration initiale de l'API Met Museum (recherche + détail).
- Gestion des routes et récupération des œuvres vedettes dans le store.
- Refactoring de la gestion des œuvres en page d'accueil.
- Migration du backend vers Firebase (Auth + Firestore).
- Redirection vers `/login` lors d'un ajout aux favoris sans être connecté (`ArtworkCard`, `ArtworkDetailView`).
- Correction de bugs API et amélioration du chargement des résultats.

### Issam (Kizame12 / Issam59200)

- Services d'agrégation API : `metMuseum.js`, `harvard.js`, `europeana.js`, `artAggregator.js`.
- Normalisation des réponses des trois APIs en un format uniforme.
- `ArtworkCard.vue` et `LoadingIcon.vue` : composants réutilisables.
- `ArtworkDetailView.vue` : page de détail complète avec lightbox et fusion des données.
- `NotFoundView.vue` : page 404.
- Backend PHP initial pour la gestion des comptes (remplacé ensuite par Firebase).
- `LoginView.vue`, `RegisterView.vue` : pages d'authentification.
- `ProfileView.vue` et `NavBar.vue` : intégration des informations de compte, mise à jour du router.
- `stores/Users.js` : connexion du store utilisateur à l'API de comptes puis à Firebase.
- `authService.js` : couche d'abstraction Firebase (Auth + Firestore).
- Cache TTL 5 min pour les recherches et détails Met Museum.
- Pagination, cap Explorer (600 œuvres), nouveaux termes de chargement.
- Amélioration des services API : validation des IDs, gestion des erreurs.
- Documentation complète du code (commentaires dans tous les fichiers).

---

## 5. Organisation

Nous avons travaillé en parallèle sur des modules distincts avec des commits réguliers sur la branche `main`.

- **Début du projet (février – début mars)** : Enzo met en place la structure, les composants de base et l'intégration Met Museum. Issam ajoute les services pour Harvard et Europeana, les stores Pinia et les premiers composants réutilisables.
- **Développement des fonctionnalités (mi-mars)** : Enzo développe l'interface (HomeView, ExploreView, NavBar, filtres). Issam construit ArtworkDetailView, le système d'authentification (PHP puis Firebase) et les pages de compte.
- **Finalisation (fin mars)** : migration complète vers Firebase, correction de bugs, améliorations de performance (cache, pagination, chargement progressif), documentation du code.

---

## 6. Difficultés rencontrées et solutions apportées

### 1) Hétérogénéité des APIs musées
**Problème** : les trois APIs retournent des structures de données très différentes (champs nommés différemment, types d'ID différents, champs multilingues pour Europeana).

**Solution** : une fonction `normalize` dédiée par API transforme chaque réponse en un objet uniforme. L'agrégateur (`artAggregator.js`) expose une interface unique au reste de l'application.

### 2) Lenteur de l'API Met Museum
**Problème** : l'API Met ne retourne que les IDs lors d'une recherche. Il faut ensuite faire une requête par objet pour obtenir les détails, ce qui peut représenter des dizaines de requêtes.

**Solution** : les requêtes de détail sont lancées en parallèle (`Promise.all`). Un cache en mémoire avec TTL de 5 minutes évite de refaire les mêmes requêtes pendant la session.

### 3) Chargement progressif des résultats
**Problème** : attendre que les trois APIs répondent avant d'afficher quoi que ce soit donne l'impression que l'application est bloquée.

**Solution** : `searchAll` utilise un callback `onPartialResult` appelé dès qu'une API répond. L'interface se met à jour progressivement sans attendre la plus lente.

### 4) Champs multilingues Europeana
**Problème** : les métadonnées Europeana (titre, auteur, date…) sont stockées dans des objets multilingues `{ "en": ["valeur"], "fr": ["valeur"] }` avec des préfixes parasites dans les noms de créateurs.

**Solution** : les helpers `dcFirst` et `dcAll` parcourent les langues dans un ordre de priorité. `cleanCreator` supprime les préfixes de langue avec une regex.

### 5) Migration backend PHP → Firebase
**Problème** : le backend PHP initial pour la gestion des comptes nécessitait un serveur séparé, compliquant le déploiement.

**Solution** : migration complète vers Firebase Auth (authentification) et Firestore (favoris, statistiques). L'application est désormais entièrement statique et déployable sans backend.

### 6) Réactivité Vue 3 avec un Set
**Problème** : Vue 3 ne détecte pas les mutations internes d'un `Set` (`.add()`, `.delete()`). Les cartes retournables de la page d'accueil ne se mettaient pas à jour.

**Solution** : à chaque toggle, on crée un nouveau `Set` à partir de l'existant et on réassigne la référence, ce qui déclenche la réactivité.

### 7) Session Firebase et premier rendu
**Problème** : Firebase restaure la session de manière asynchrone via IndexedDB. Sans précaution, la NavBar affichait "non connecté" pendant un instant même si l'utilisateur avait une session active.

**Solution** : dans `main.js`, on attend que `userStore.init()` soit résolu avant de monter l'application (`app.mount`).

---

## 7. Installation et lancement

### Prérequis

- Node.js (v18+)
- npm

### Variables d'environnement

Créer un fichier `.env` à la racine du dossier `Art/` :

```
VITE_HARVARD_API_KEY=votre_clé_harvard
VITE_EUROPEANA_API_KEY=votre_clé_europeana
```

> Les clés Harvard et Europeana sont gratuites et disponibles sur leurs portails développeurs respectifs. L'API Met Museum ne nécessite pas de clé.

### Installation

```bash
cd Art
npm install
```

### Lancer en développement

```bash
npm run dev
```

L'application est disponible sur `http://localhost:5173`.

### Build de production

```bash
npm run build
```

---

## 8. Structure du projet

```
Art/
├── src/
│   ├── assets/           # CSS global (variables, boutons, utilitaires)
│   ├── components/       # Composants réutilisables
│   │   ├── ArtworkCard.vue
│   │   ├── FilterPanel.vue
│   │   ├── LoadingIcon.vue
│   │   ├── NavBar.vue
│   │   └── SearchInput.vue
│   ├── services/         # Appels aux APIs externes et Firebase
│   │   ├── artAggregator.js   # Point d'entrée unique multi-sources
│   │   ├── metMuseum.js
│   │   ├── harvard.js
│   │   ├── europeana.js
│   │   └── authService.js     # Abstraction Firebase Auth + Firestore
│   ├── stores/           # État global (Pinia)
│   │   ├── Artwork.js         # Œuvres, recherche, filtres, pagination
│   │   └── Users.js           # Session, favoris, statistiques
│   ├── router/           # Définition des routes
│   ├── views/            # Pages de l'application
│   │   ├── HomeView.vue
│   │   ├── ExploreView.vue
│   │   ├── ArtworkDetailView.vue
│   │   ├── ProfileView.vue
│   │   ├── LoginView.vue
│   │   ├── RegisterView.vue
│   │   └── NotFoundView.vue
│   ├── firebase.js       # Initialisation Firebase
│   ├── App.vue           # Composant racine
│   └── main.js           # Point d'entrée
└── index.html
```

---

## 9. Routes

| URL | Page |
|---|---|
| `/` | Accueil — héro + galerie vedettes |
| `/explore` | Galerie complète avec recherche et filtres |
| `/artwork/:source/:id` | Détail d'une œuvre |
| `/profile` | Profil utilisateur et favoris |
| `/login` | Connexion |
| `/register` | Inscription |
| `/*` | Page 404 |
