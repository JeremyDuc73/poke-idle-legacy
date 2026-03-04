# Configuration API - Important ⚠️

## Règle simple

**`apiBase` ne contient JAMAIS `/api` à la fin**
**Les paths dans le code ont TOUJOURS `/api/` au début**

## Configuration par environnement

### Développement (local)
```bash
# .env ou docker-compose.yml
NUXT_PUBLIC_API_BASE=http://localhost:3333
```

### Production
```bash
# .env.production ou docker-compose.prod.yml
NUXT_PUBLIC_API_BASE=https://poke-idle.jeremyduc.dev

# OU si sous-domaine API séparé
NUXT_PUBLIC_API_BASE=https://api.poke-idle.jeremyduc.dev
```

## Exemples d'appels

```typescript
// Dans le code client
const api = useApi()
await api.post('/api/auth/login', { email, password })

// Résultat en DEV
// → http://localhost:3333 + /api/auth/login
// → http://localhost:3333/api/auth/login ✅

// Résultat en PROD
// → https://poke-idle.jeremyduc.dev + /api/auth/login
// → https://poke-idle.jeremyduc.dev/api/auth/login ✅
```

## Si tu as une erreur

### `Cannot POST:/api/api/auth/login` (double /api)
➡️ **Cause**: `apiBase` se termine par `/api`
➡️ **Solution**: Retirer `/api` de la variable d'environnement

### `Cannot POST:/auth/login` (pas de /api)
➡️ **Cause**: Le path dans le code n'a pas `/api/` au début
➡️ **Solution**: Ajouter `/api/` au début du path

## Fichiers à vérifier si problème

1. `.env` (local uniquement)
2. `client/nuxt.config.ts` (valeur par défaut)
3. `docker-compose.yml` (dev)
4. `docker-compose.prod.yml` (prod)
