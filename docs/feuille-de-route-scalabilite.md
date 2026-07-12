# Feuille de route scalabilité

## Phase 1 — En place

- **Inngest** : fulfillment post-paiement async + retries
- **ISR** : `unstable_cache` pages publiques (revalidate 1 h)
- **Index SQL** : Prisma `@@index` sur requêtes fréquentes
- **Sentry** : monitoring erreurs

## Phase 2 — Recommandé (charge modérée)

- [ ] Cache Redis (sessions, rate-limit distribué)
- [ ] Audit requêtes N+1 (dashboard, admin)
- [ ] CDN assets statiques / images
- [ ] Connection pooling Neon optimisé

## Phase 3 — Évolution majeure

- [ ] Read replicas PostgreSQL
- [ ] Stockage fichiers S3 (PDF, audio podcasts)
- [ ] Abonnements / paiements récurrents
- [ ] File d’attente email hors request HTTP

Configuration Inngest : [`inngest-setup.md`](./inngest-setup.md)
