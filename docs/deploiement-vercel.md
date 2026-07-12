# Déploiement Vercel

## Prérequis

- Repo GitHub connecté à Vercel
- Comptes : Clerk, Neon, Resend, (PayZone / Stripe), (Inngest), (Sentry)

## Build

Le projet utilise **webpack** en production (`npm run build` → `next build --webpack`) pour compatibilité Clerk middleware.

## Variables d’environnement

Liste complète : [`.env.example`](../.env.example)  
Checklist avant lancement : [`a-regler-avant-production.md`](./a-regler-avant-production.md)

### Minimum pour un deploy qui build

```env
DATABASE_URL=...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
NEXT_PUBLIC_APP_URL=https://asmae-coaching.vercel.app
```

### Production client (domaine custom)

Voir la checklist Priorité 1 dans [`a-regler-avant-production.md`](./a-regler-avant-production.md).

## Webhooks à configurer (URLs prod)

| Service | URL |
|---------|-----|
| Clerk | `https://votre-domaine.fr/api/webhooks/clerk` |
| PayZone | `https://votre-domaine.fr/api/webhooks/payzone` |
| Stripe | `https://votre-domaine.fr/api/webhooks/stripe` |
| Inngest | Sync auto via intégration ou `/api/inngest` |

## Cron (rappels séances J-1)

Défini dans `vercel.json`. Nécessite `CRON_SECRET` sur Vercel.

## Après deploy

1. Tester `/` et `/sign-in`
2. Clerk webhook → Replay un message
3. Paiement test → vérifier fulfillment (Inngest Runs ou logs Vercel)
4. Sentry → aucune erreur critique

## Inngest

Guide détaillé : [`inngest-setup.md`](./inngest-setup.md)
