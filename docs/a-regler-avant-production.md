# À régler avant la production client

État actuel : le site tourne sur **`asmae-coaching.vercel.app`** en mode **développement** (Clerk dev, tests). C’est suffisant pour développer et faire des démos. Ce document liste ce qu’il reste à faire pour un **lancement réel**.

---

## Priorité 1 — Bloquant pour des vrais clients

### Domaine personnalisé + Clerk Production

- [ ] Acheter un domaine (ex. `asmae-coaching.fr`)
- [ ] L’ajouter dans **Vercel → Settings → Domains** (DNS chez le registrar)
- [ ] Créer l’instance **Production** dans Clerk (impossible avec `*.vercel.app`)
- [ ] Configurer les **enregistrements DNS** demandés par Clerk (Domains)
- [ ] Remplacer sur Vercel Production :
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` → `pk_live_...`
  - `CLERK_SECRET_KEY` → `sk_live_...`
- [ ] Mettre `NEXT_PUBLIC_APP_URL=https://votre-domaine.fr`
- [ ] Reconfigurer OAuth (Google, etc.) avec les clés **production** si utilisé

> Tant que c’est en `pk_test_`, le warning console *"development keys"* est normal et les quotas Clerk dev s’appliquent.

### Base de données Neon

- [ ] `DATABASE_URL` sur Vercel = URL **pooler** (`-pooler` dans l’hôte)
- [ ] `DIRECT_URL` pour migrations locales uniquement
- [ ] Vérifier que Neon n’est pas en pause (erreur `Can't reach database server`)

### Emails (Resend + webhook Clerk)

- [ ] Vérifier le domaine sur [resend.com](https://resend.com)
- [ ] `RESEND_API_KEY` + `RESEND_FROM_EMAIL` avec **votre domaine** (pas `onboarding@resend.dev`)
- [ ] Webhook Clerk **instance Production** → `https://votre-domaine.fr/api/webhooks/clerk`
- [ ] `CLERK_WEBHOOK_SIGNING_SECRET` = secret de **cet** endpoint (pas celui de dev)
- [ ] `CLERK_CUSTOM_AUTH_EMAILS=auto`
- [ ] Dans Clerk prod : désactiver *Delivered by Clerk* sur les templates personnalisés
- [ ] Tester : **Replay** un message failed → statut **Succeeded**

### Paiements réels

- [ ] **PayZone** : identifiants production + webhooks vers l’URL prod
- [ ] **Stripe** (si utilisé) : `sk_live_`, `pk_live_`, webhook live
- [ ] Vérifier fulfillment (réservation confirmée, cours débloqué, emails)

### Inngest (jobs post-paiement)

- [ ] Configurer Inngest cloud + clés sur Vercel (voir [`inngest-setup.md`](./inngest-setup.md))
- [ ] Sans Inngest : fulfillment **synchrone** (OK en dev, moins robuste en prod)

---

## Priorité 2 — Recommandé avant ouverture publique

### Sécurité & admin

- [ ] `NEXT_PUBLIC_ADMIN_PATH` personnalisé (pas `/admin`)
- [ ] `CRON_SECRET` pour les rappels email (`vercel.json`)
- [ ] `ADMIN_REQUIRE_2FA=true` quand Clerk MFA / Pro est activé

### Monitoring

- [ ] `NEXT_PUBLIC_SENTRY_DSN` sur Vercel
- [ ] Ne pas mettre `SENTRY_ENABLE_DEV=1` en production
- [ ] Optionnel : `SENTRY_AUTH_TOKEN` pour les source maps au build

### Build & déploiement

- [ ] Build Vercel : `next build --webpack` (déjà dans `package.json`)
- [ ] Pousser les derniers correctifs (CSP, webhooks, Clerk aliases)
- [ ] Vérifier que le déploiement passe sans erreur Turbopack/Clerk

### Contenu & légal

- [ ] Remplacer le contenu démo (seed) par le contenu réel ASMAE
- [ ] Relecture pages légales (CGU, CGV, confidentialité, cookies)
- [ ] Coordonnées contact à jour (`COACH_EMAIL`, paramètres admin)

---

## Priorité 3 — Plus tard (scalabilité)

Voir [`feuille-de-route-scalabilite.md`](./feuille-de-route-scalabilite.md).

| Phase | Statut | Exemples |
|-------|--------|----------|
| **1** | En place | Inngest, ISR 1 h, index SQL, Sentry |
| **2** | À planifier | Redis cache, audit N+1, CDN assets |
| **3** | Évolution | Réplicas lecture, stockage S3, abonnements |

---

## Ce qui fonctionne déjà en mode dev (vercel.app + pk_test_)

- Navigation, i18n ar/fr, dashboard, admin
- Auth Clerk (comptes test)
- Réservations, contenus, favoris, recommandations
- Paiements **test** (Stripe test / PayZone sandbox)
- Développement local (`npm run dev`)

## Ce qui ne fonctionne pas ou reste limité en dev

| Élément | Limitation |
|---------|------------|
| Clerk `pk_test_` sur URL publique | Quotas dev, warning console |
| Pas de domaine custom | Pas d’instance Clerk Production |
| Resend sans domaine vérifié | Emails custom limités / webhook en échec |
| Stripe `sk_test_` | Pas de vrais encaissements |
| Inngest sans clés | Fulfillment synchrone uniquement |
| URL `*.vercel.app` | Peu professionnel pour clients finaux |

---

## Checklist rapide Vercel (copier-coller)

```env
# App
NEXT_PUBLIC_APP_URL=https://votre-domaine.fr

# Clerk PRODUCTION
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SIGNING_SECRET=whsec_...
CLERK_CUSTOM_AUTH_EMAILS=auto

# Neon
DATABASE_URL=postgresql://...@...-pooler.../neondb?sslmode=require

# Resend
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=ASMAE Coaching <noreply@votre-domaine.fr>

# Paiements
PAYZONE_ORIGINATOR_ID=...
PAYZONE_PASSWORD=...
# STRIPE_SECRET_KEY=sk_live_...  (si Stripe)

# Inngest
INNGEST_EVENT_KEY=...
INNGEST_SIGNING_KEY=...

# Sécurité
NEXT_PUBLIC_ADMIN_PATH=/votre-chemin-secret
CRON_SECRET=...
NEXT_PUBLIC_SENTRY_DSN=...
```

Dernière mise à jour : juillet 2026.
