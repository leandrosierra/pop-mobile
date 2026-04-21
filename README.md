# POP Mobile

Application mobile POP reworkee en React Native, Expo et TypeScript.

## Demarrage

```bash
npm install
npm run start
```

L'API cible par defaut est `http://localhost:8080`.
Pour changer d'API localement :

```bash
EXPO_PUBLIC_POP_API_ORIGIN=http://localhost:8080 npm run start
```

## Stack

- Expo SDK 55
- React Native + TypeScript
- Expo Router
- TanStack Query
- Zustand
- Zod
- i18next + expo-localization
