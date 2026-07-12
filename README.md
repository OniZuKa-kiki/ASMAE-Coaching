# ASMAE Coaching — Plateforme de coaching de vie

Site premium bilingue (**arabe RTL** / **français**) pour coach de vie : réservation en ligne, paiements, formations, podcasts, blog, espace client et administration.

**Production :** [Vercel](https://vercel.com) · **Base :** [Neon PostgreSQL](https://neon.tech) · **Auth :** [Clerk](https://clerk.com)

---

## Stack technique

| Domaine | Technologie |
|---------|-------------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Langage | TypeScript |
| UI | Tailwind CSS v4, composants custom (style shadcn) |
| Animations | Framer Motion |
| i18n | next-intl (ar / fr, cookie `NEXT_LOCALE`) |
| Base de données | PostgreSQL (Neon) |
| ORM | Prisma |
| Auth | Clerk (rôles client / admin via metadata) |
| Paiements | **PayZone** (principal, Maroc) + Stripe (optionnel) |
| Emails | Resend + templates Clerk personnalisés (webhook) |
| Jobs async | Inngest (fulfillment post-paiement) |
| Monitoring | Sentry |
| PDF factures | Puppeteer |
| Déploiement | Vercel (ISR 1 h, cron rappels) |

---

## Fonctionnalités

### Site public
- Accueil, à propos, services, témoignages (carrousel)
- Réservation en 4 étapes : service → date → questionnaire → paiement
- Formations, podcasts, blog (catalogues filtrables + favoris)
- Recherche globale `/search`
- Contact (formulaire + Turnstile optionnel)
- Pages légales (CGU, CGV, confidentialité, cookies, mentions légales)
- Bandeau consentement cookies

### Espace client (`/dashboard`)
- Vue d’ensemble, parcours **مساري** (`/dashboard/journey`)
- Notifications, favoris, recherche
- Séances (calendrier), formations, podcasts (reprise d’écoute)
- Objectifs, journal, check-in humeur quotidien
- Bibliothèque ressources, paiements + **factures PDF**
- Avis post-séance

### Administration (`/admin` ou chemin personnalisé)
- Tableau de bord (aujourd’hui, stats, analytics)
- Clients, réservations, services, formations, podcasts, blog
- Témoignages (publication, import avis séance)
- Paiements, coupons
- Paramètres : disponibilités, visio (Zoom/Meet), questionnaires, emails, langues, analytics recherche

---

## Démarrage rapide

### Prérequis
- Node.js 20+
- Compte [Clerk](https://clerk.com), [Neon](https://neon.tech), [Resend](https://resend.com)
- PayZone (prod) ou mode test local

### Installation

```bash
git clone <repo-url>
cd COACH_SITE
npm install
cp .env.example .env.local
```

Remplissez `.env.local` (voir [`.env.example`](.env.example) et [`docs/deploiement-vercel.md`](docs/deploiement-vercel.md)).

### Base de données

```bash
npm run db:generate
npm run db:push
npm run db:seed          # contenu démo (services, cours, blog…)
npm run db:seed-demo-users   # comptes Clerk + données client (optionnel)
```

### Développement

```bash
npm run dev              # http://localhost:3000
npm run inngest:dev      # jobs async (terminal séparé, optionnel)
npm run db:studio        # Prisma Studio
```

---

## Scripts npm

| Script | Description |
|--------|-------------|
| `dev` | Serveur dev (webpack) |
| `dev:turbo` | Serveur dev (Turbopack — déconseillé, bugs Clerk) |
| `build` | `prisma generate` + build production (webpack) |
| `start` | Serveur production |
| `lint` | ESLint |
| `db:push` | Sync schéma Prisma → Neon |
| `db:seed` | Seed contenu |
| `db:seed-demo-users` | Comptes démo Clerk + données test |
| `inngest:dev` | Worker Inngest local |

---

## Configuration Clerk (admin)

Dans **Clerk Dashboard → Users → Public metadata** :

```json
{ "role": "admin" }
```

Et dans **Sessions → Customize session token**, inclure le claim `metadata` pour que le middleware lise le rôle.

Comptes démo : [`docs/comptes-demo.md`](docs/comptes-demo.md)

Emails auth personnalisés : [`docs/clerk-emails-setup.md`](docs/clerk-emails-setup.md)

---

## Paiements

| Provider | Usage | Variables |
|----------|-------|-----------|
| **PayZone** | Défaut (`PAYMENT_DEFAULT_PROVIDER=payzone`) | `PAYZONE_*`, `EUR_TO_MAD_RATE` |
| **Stripe** | Optionnel (international) | `STRIPE_*` |

Webhooks : `/api/webhooks/payzone`, `/api/webhooks/stripe`  
Retour PayZone : `/api/payments/payzone/return`

Sans clés Inngest, le fulfillment post-paiement reste **synchrone** (fallback dev).

---

## Internationalisation

- Locales : `ar` (défaut, RTL), `fr` (LTR)
- Pas de préfixe URL (`/fr/…`) — cookie `NEXT_LOCALE`
- Fichiers : `messages/ar.json`, `messages/fr.json`, `messages/legal-*.json`, `messages/admin-pages-*.json`
- Activation/désactivation par langue : admin → Paramètres → Langues

---

## Design system

| Token | Valeur |
|-------|--------|
| Primaire (sage) | `#6B7C6A` |
| Accent (or) | `#B89A5E` |
| Fond | `#F7F4EE` |
| Cartes | `#FCFAF8` |
| Police | Cairo (titres + corps) |

Utilitaires globaux : `section-padding`, `page-title`, `PageHero`, `ContentSection`, `PanelPageHeader` — voir `src/app/globals.css`.

---

## Structure du projet

```
src/
├── app/                 # Pages App Router + API routes
├── components/          # UI (home, dashboard, admin, layout…)
├── i18n/                # Config next-intl
├── inngest/             # Jobs async (fulfillment paiement)
├── lib/                 # Logique métier, DB, paiements, emails…
├── instrumentation.ts   # Sentry server
└── middleware.ts        # Clerk, rate-limit, locale, admin path
prisma/
├── schema.prisma
├── seed.ts
└── seed-demo-users.ts
messages/                # Traductions ar / fr
docs/                    # Documentation projet
```

---

## Déploiement

Guide complet : [`docs/deploiement-vercel.md`](docs/deploiement-vercel.md)

Checklist rapide :
1. Variables d’env sur Vercel (Clerk live, Neon pooler, PayZone, Resend, Sentry, Inngest)
2. Webhooks Clerk / PayZone / Stripe → URL production
3. `CRON_SECRET` pour rappels séances (`vercel.json`)
4. `NEXT_PUBLIC_ADMIN_PATH` personnalisé en production (recommandé)

---

## Documentation

| Fichier | Contenu |
|---------|---------|
| [`docs/a-regler-avant-production.md`](docs/a-regler-avant-production.md) | **Checklist** avant lancement client |
| [`docs/inngest-setup.md`](docs/inngest-setup.md) | Configuration Inngest |
| [`docs/guide-du-site.md`](docs/guide-du-site.md) | Guide fonctionnel complet |
| [`docs/deploiement-vercel.md`](docs/deploiement-vercel.md) | Déploiement & env prod |
| [`docs/comptes-demo.md`](docs/comptes-demo.md) | Comptes de test |
| [`docs/clerk-emails-setup.md`](docs/clerk-emails-setup.md) | Emails auth ASMAE |
| [`docs/feuille-de-route-scalabilite.md`](docs/feuille-de-route-scalabilite.md) | Scalabilité & perf |

---

## Licence

Projet privé — ASMAE Coaching. Tous droits réservés.
