# ASMAE Coaching — Plateforme de coaching de vie

Site premium pour coach de vie avec réservation, paiement, formations, podcasts, blog et espaces client/administrateur.

## Stack technique

| Domaine | Technologie |
|---------|-------------|
| Framework | Next.js 16 (App Router) |
| Langage | TypeScript |
| Style | Tailwind CSS v4 |
| Composants | shadcn-style (custom) |
| Animations | Framer Motion |
| Base de données | PostgreSQL (Supabase) |
| ORM | Prisma |
| Auth | Clerk |
| Paiement | Stripe |
| Emails | Resend |
| Déploiement | Vercel |

## Fonctionnalités

### Site vitrine
- Accueil (hero orienté client, problèmes, méthode, témoignages, stats, FAQ)
- À propos (histoire, mission, valeurs)
- Services de coaching (individuel, couple, carrière, bien-être)
- Réservation en 4 étapes (service → date → paiement → confirmation)
- Podcasts (gratuits & premium)
- Formations en ligne
- Blog SEO
- Témoignages
- Contact (formulaire, WhatsApp, Instagram, email)

### Espace client (`/dashboard`)
- Consultations à venir & historique
- Formations achetées
- Objectifs & suivi
- Journal personnel
- Ressources & podcasts
- Paiements & factures

### Administration (`/admin`)
- Gestion clients, réservations, formations
- Podcasts, blog, coupons
- Statistiques & revenus
- Paramètres (disponibilités, Zoom, emails)

## Démarrage rapide

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env.local
```

Remplissez les clés pour :
- **Clerk** — [clerk.com](https://clerk.com) (authentification)
- **Supabase** — [supabase.com](https://supabase.com) (base PostgreSQL)
- **Stripe** — [stripe.com](https://stripe.com) (paiements)
- **Resend** — [resend.com](https://resend.com) (emails)

### 3. Initialiser la base de données

```bash
npm run db:generate
npm run db:push
```

### 4. Lancer le serveur de développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

## Configuration Clerk (admin)

Pour donner le rôle admin à votre mère, ajoutez dans les métadonnées publiques Clerk :

```json
{ "role": "admin" }
```

## Palette de couleurs

| Usage | Couleur | Hex |
|-------|---------|-----|
| Primaire | Sage Green | `#6B7C6A` |
| Accent | Champagne Gold | `#B89A5E` |
| Fond | Warm Ivory | `#F7F4EE` |
| Cartes | Soft Ivory | `#FCFBF8` |
| Titres | Charcoal | `#2E2E2E` |
| Texte | Warm Gray | `#555555` |

## Typographie

- **Titres** : Cormorant Garamond
- **Texte** : Manrope

## Prochaines étapes

1. Connecter Stripe Checkout pour les réservations et formations
2. Intégrer l'API Zoom pour les liens automatiques
3. Migrer le contenu statique vers la base de données (Prisma)
4. Ajouter le questionnaire pré-séance (IntakeForm)
5. Implémenter les rappels email automatiques (Resend)
6. Déployer sur Vercel

## Structure du projet

```
src/
├── app/              # Pages (App Router)
├── components/       # Composants UI & layout
├── lib/              # Utilitaires, constantes, DB, Stripe, email
prisma/
└── schema.prisma     # Schéma de base de données
```
