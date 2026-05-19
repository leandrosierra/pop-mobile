<div align="center">

# POP — Mobile & Web

**Propose. Débats. Vote. Change la loi.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Expo](https://img.shields.io/badge/Expo-55-000020.svg)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.83-61DAFB.svg)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6.svg)](https://www.typescriptlang.org/)

[Backend API](https://github.com/leandrosierra/pop-backend) · [Démo web](https://pop.leandro-sierra.com)

</div>

---

## Le projet

Tous les cinq ans, on glisse un bulletin. Entre les deux ? Silence. **POP renverse l'équation.**

POP est une plateforme de **démocratie semi-directe** où chaque citoyen peut **proposer une mesure**, en **débattre**, **lancer un référendum**, et **voter** sur les propositions des autres — directement depuis son téléphone. L'objectif n'est pas une pétition de plus. C'est un outil de délibération continue, conçu pour passer de l'indignation Twitter à la décision argumentée.

Ce dépôt contient le **client mobile et web** : application Expo React Native qui tourne sur iOS, Android **et** dans le navigateur. L'API REST associée vit dans [`pop-backend`](https://github.com/leandrosierra/pop-backend).

## Pourquoi c'est open source

Une plateforme qui prétend rendre la voix aux citoyens **doit être vérifiable par eux**. Le code est ouvert pour :

- **Auditer** : comment l'app envoie ton vote, où elle te géolocalise (ou pas), ce qu'elle stocke localement
- **Forker** : monter une instance pour un collectif, une commune, une associationÉ
- **Contribuer** : la démocratie n'appartient à personne — ce code non plus
- **Apprendre** : si POP inspire un projet voisin, tant mieux

License : **MIT**. Utilise, modifie, redistribue. La seule chose qu'on demande : ne prétends pas l'avoir écrit.

## Capture d'écran

> *(à venir — l'app vit ici : [`pop.leandro-sierra.com`](https://pop.leandro-sierra.com))*

L'expérience tient en 5 écrans clefs :

- **Home** — flux des questions ouvertes selon ta géographie et tes intérêts
- **Question** — détail, arguments pour/contre, ton vote
- **Create Question** — propose ta mesure en 3 étapes
- **Civic** — carte de l'activité citoyenne par circonscription
- **Settings** — préférences, géographie, intérêts, déconnexion

## Stack

- **Expo SDK 55** — build iOS / Android / Web depuis une seule base
- **React 19 + React Native 0.83** — UI universelle
- **TypeScript 5.9** — typage strict bout en bout
- **Expo Router** — file-based routing avec groupes `(app)` / `(auth)` / `admin/` / `setup/`
- **TanStack Query 5** — fetching et cache API
- **Zustand 5** — état client léger
- **Zod 4** — validation des payloads
- **i18next + expo-localization** — FR, EN, DE, IT
- **expo-secure-store** — token JWT chiffré côté device
- **OAuth natifs** — Google · Apple · Facebook · Instagram (via `expo-auth-session`)
- **Playwright** — tests end-to-end (`e2e/app-smoke.spec.mjs`)

## Démarrage rapide

### Prérequis

- **Node.js 20+** et **npm**
- Une instance backend qui tourne (voir [`pop-backend`](https://github.com/leandrosierra/pop-backend) — par défaut `http://localhost:8080`)
- *(optionnel)* Expo Go sur ton téléphone pour tester en natif

### 1. Cloner et installer

```bash
git clone https://github.com/leandrosierra/pop-mobile.git
cd pop-mobile
npm install
```

### 2. Configurer l'API cible

```bash
cp .env.example .env.local
# Édite .env.local : pointe vers ton backend
# EXPO_PUBLIC_POP_API_ORIGIN=http://localhost:8080
```

Les variables OAuth (`EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID`, etc.) ne sont nécessaires que si tu veux activer le login social — l'auth email/password fonctionne sans.

### 3. Lancer

```bash
npm run web        # navigateur (le plus rapide pour tester)
npm run android    # nécessite Android Studio ou Expo Go
npm run ios        # nécessite Xcode ou Expo Go
```

### 4. Tests

```bash
npm run typecheck  # vérifie les types TS
npm run test:e2e   # tests Playwright (l'app doit tourner sur web)
```

## Déploiement

### Web (statique)

```bash
npx expo export -p web
# bundle prêt dans dist/, à servir avec n'importe quel hébergement statique
```

Le `Dockerfile` à la racine fait l'export web et l'embarque dans une image nginx, prête pour [Coolify](https://coolify.io/) ou tout hôte Docker. C'est ce qui tourne sur `pop.leandro-sierra.com`.

### Mobile (iOS / Android)

Build via [Expo Application Services (EAS)](https://expo.dev/eas) :

```bash
npx eas build --platform ios
npx eas build --platform android
```

Le keystore Android (`pop-upload-keystore.jks`) **n'est pas versionné** — gère-le via EAS Credentials ou un coffre local sécurisé.

## Roadmap

V1 (actuel) couvre l'essentiel : auth, parcours d'inscription avec géographie + intérêts, propositions, votes, page civique, admin. La feuille de route co-construite avec [Guillaume Andrieux](https://github.com/) court jusqu'à V14 :

- 🗺️ Carte interactive votes/débats par circonscription
- 🤝 Délégation thématique (Liquid Democracy)
- 🔔 Notifications push (Expo Notifications)
- 📊 Statistiques publiques de participation
- 🇨🇭 Adaptation Suisse (Pétition CH) — politique fédéraliste
- 🌍 i18n complet et traductions communautaires
- ♿ Accessibilité (WCAG AA)
- 🌙 Mode sombre

## Contribuer

Tout le monde est bienvenu : citoyen, dev, designer, traducteur, juriste. Lis [CONTRIBUTING.md](CONTRIBUTING.md) pour le workflow et [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) pour le contrat moral.

Tu trouves un bug ? Tu as une idée ? Ouvre une [issue](https://github.com/leandrosierra/pop-mobile/issues) — il y a des templates pour t'aider.

## Sécurité

Une vulnérabilité ? Merci de **ne pas l'ouvrir en issue publique** — lis [SECURITY.md](SECURITY.md) pour la procédure de divulgation responsable.

## Licence

[MIT](LICENSE) © Léandro Sierra & contributeurs.

---

<div align="center">

*« La liberté, c'est de pouvoir choisir ses chaînes. »* — Jean-Paul Sartre  
*Le choix devrait être quotidien.*

</div>
