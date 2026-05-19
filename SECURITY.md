# Politique de sécurité

POP traite des données citoyennes sensibles : identifiants, géographie, opinions politiques, votes. La sécurité de l'app n'est pas une fonctionnalité, c'est une condition d'existence du projet.

## Versions supportées

| Version | Support |
| ------- | ------- |
| `main` (latest) | ✅ |
| Anciennes branches | ❌ |

Tant que le projet est en V1, seule la branche `main` reçoit les correctifs de sécurité.

## Signaler une vulnérabilité

**Ne pas ouvrir d'issue publique** pour une faille de sécurité.

Envoie un email à **leandrosierra1@gmail.com** avec :

- Une description claire du problème
- Les étapes pour le reproduire (ou un POC si tu l'as)
- L'impact estimé (vol de token, exfil de données, élévation de privilèges, etc.)
- Ta version / commit / plateforme (iOS/Android/web)

### Engagements

- **Accusé de réception** sous **72h ouvrées**
- **Première évaluation** sous **7 jours**
- **Correctif déployé** dans un délai proportionnel à la gravité :
  - Critique (RCE in-app, vol de token, ouverture distante de webview malicieuse) : **<7 jours**
  - Élevée (auth bypass, exfil de SecureStore) : **<14 jours**
  - Moyenne (XSS dans la version web, deeplink détourné) : **<30 jours**
  - Faible : prochaine release planifiée

### Divulgation responsable

On suit le principe de **divulgation coordonnée** : tu nous laisses le temps de patcher avant publication. En retour, tu seras crédité·e dans le `CHANGELOG.md` et le commit de correctif (sauf si tu préfères l'anonymat).

Pas de programme de bug bounty financier à ce stade (projet open source bénévole), mais notre reconnaissance publique et un remerciement franc.

## Zone d'attention particulière

Si tu fouilles le client, ces surfaces méritent une attention spéciale :

- **Stockage des tokens** : `expo-secure-store` — vérifie qu'aucun token ne se balade en `AsyncStorage` ou en mémoire trop longtemps
- **Deeplinks** : `scheme: "pop"` configuré dans `app.json` — toute route accessible via deeplink doit valider ses params
- **WebView** : si on en intègre, vérifie l'origine et le JS bridge
- **OAuth flows** : nonce, state, PKCE — `expo-auth-session`
- **Build web** : pas de secret dans le bundle JS (les `EXPO_PUBLIC_*` sont publics par design — vérifie qu'aucun secret n'a glissé)
- **Permissions natives** : géolocalisation, notifications — minimum vital

## En dehors du scope

- Vulnérabilités sur des forks tiers (signale-les à leurs mainteneurs)
- Bugs fonctionnels sans impact sécurité (passe par une issue classique)
- Vulns de l'OS sous-jacent (iOS / Android / navigateur) — passe-les en upstream

Merci de protéger le projet — et les citoyens qui l'utiliseront.
