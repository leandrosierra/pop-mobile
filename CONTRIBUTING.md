# Contribuer à POP — Mobile & Web

Merci d'envisager de contribuer ! POP est un projet citoyen avant d'être un projet technique : toute aide est précieuse, qu'elle soit en code, en design, en traduction ou en test utilisateur.

## Avant de commencer

1. **Lis le [Code de conduite](CODE_OF_CONDUCT.md).** On y est tenu·e·s, sans exception.
2. **Cherche dans les [issues existantes](https://github.com/leandrosierra/pop-mobile/issues)** — peut-être que ton idée est déjà discutée.
3. **Ouvre une issue avant un gros chantier.** Discuter une approche en amont évite de rejeter une PR fleuve après coup.

## Workflow

```
1. Fork → 2. Branche feature → 3. Code + tests → 4. Typecheck/e2e → 5. PR
```

### 1. Fork & clone

```bash
git clone https://github.com/<ton-handle>/pop-mobile.git
cd pop-mobile
git remote add upstream https://github.com/leandrosierra/pop-mobile.git
npm install
```

### 2. Branche

Pas de commits directs sur `main`. Une branche par feature/fix :

```bash
git checkout -b feature/carte-circonscriptions
# ou
git checkout -b fix/login-oauth-android
```

### 3. Code

- **TypeScript strict** — pas de `any` qui traîne, on tape tout.
- **Expo Router file-based** — un fichier dans `app/` = une route. Garde la structure : `(auth)/`, `(app)/`, `admin/`, `setup/`, `question/`.
- **TanStack Query** pour tous les appels API — pas de `fetch` direct sans wrapper React Query.
- **Zustand** pour l'état client persistant léger (préférences, session). Le state local d'un écran reste en `useState`.
- **Zod** pour valider les payloads avant de les passer aux composants.
- **i18n via i18next** — tout texte UI passe par `t('key')`. Les nouvelles clés vont dans les ressources de chaque langue.
- **Aucun secret dans le code** — seules les `EXPO_PUBLIC_*` (lues depuis `.env.local`) sont autorisées, et elles finissent dans le bundle JS donc **ne mets jamais de vrai secret dedans**.

### 4. Tests & vérifs

```bash
npm run typecheck   # tsc --noEmit
npm run test:e2e    # Playwright sur la version web
```

Le typecheck doit passer. Les tests e2e couvrent le smoke (login + nav) — ajoute un cas si tu touches un flow critique.

### 5. Commit

Messages clairs, présent de l'indicatif, ≤72 caractères :

```
feat(civic): ajoute filtre par circonscription
fix(auth): corrige redirection après login Google
docs(readme): clarifie le setup OAuth
```

Types : `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.

### 6. PR

- Titre clair, description du **pourquoi**
- Lien vers l'issue (`Closes #42`)
- Captures d'écran ou GIF si UI modifiée — montre les **3 plateformes** si pertinent (iOS, Android, web)
- Checklist :
  - [ ] `npm run typecheck` passe
  - [ ] `npm run test:e2e` passe (sur la cible web)
  - [ ] Pas de secret en dur
  - [ ] Strings traduites (au moins FR + EN)
  - [ ] Tests visuels iOS / Android / web faits si UI changée

## Setup dev rapide

```bash
# 1. Clone et installe
git clone https://github.com/<ton-handle>/pop-mobile.git
cd pop-mobile
npm install

# 2. Configure le backend cible
cp .env.example .env.local
# édite .env.local si ton backend tourne ailleurs que localhost:8080

# 3. Lance (le plus rapide pour tester)
npm run web

# Pour tester en natif (téléphone réel)
npm run start
# Puis scanne le QR avec Expo Go (iOS App Store / Play Store)
```

## Sujets ouverts au contributif

Ces sujets sont labelés ["good first issue"](https://github.com/leandrosierra/pop-mobile/labels/good%20first%20issue) ou ["help wanted"](https://github.com/leandrosierra/pop-mobile/labels/help%20wanted) :

- 🌍 Traductions (DE, IT, ES, PT…) — les fichiers de ressources sont dans `src/i18n/`
- 🌙 Mode sombre — un thème complet
- ♿ Accessibilité — audit WCAG AA, `accessibilityLabel`, ordre tab
- 📊 Carte interactive des votes par circonscription (web : `react-leaflet`, mobile : `react-native-maps`)
- 🔔 Notifications push — `expo-notifications`
- 🧪 Étendre la suite e2e Playwright

## Questions ?

Ouvre une [Discussion](https://github.com/leandrosierra/pop-mobile/discussions) GitHub — c'est l'endroit pour les questions ouvertes, contrairement aux issues qui ciblent un bug/feature précis.

Merci pour ton temps. Une démocratie meilleure se construit aussi en commits.
