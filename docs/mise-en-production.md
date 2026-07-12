# Mise en production — ASMAE Coaching

Guide des coûts, outils, hébergement et stack technique pour rendre le site public.

> **Dernière mise à jour :** juillet 2026 — les tarifs des services tiers peuvent changer ; vérifiez sur les sites officiels avant de souscrire.

---

## Stack technique complet

### Frontend & application

| Couche | Technologie | Rôle |
|--------|-------------|------|
| Framework | **Next.js 16** (App Router, Turbopack) | Pages, API routes, SSR/SSG |
| UI | **React 19** + **TypeScript** | Interface utilisateur typée |
| Styles | **Tailwind CSS v4** + PostCSS | Design responsive, RTL (arabe) |
| Composants | shadcn-style custom (`class-variance-authority`, `clsx`, `tailwind-merge`) | Boutons, cartes, formulaires |
| Animations | **Framer Motion** | Transitions et micro-interactions |
| Icônes | **Lucide React** | Iconographie |
| Formulaires | **React Hook Form** + **@hookform/resolvers** | Validation côté client |
| Validation | **Zod** | Schémas API et server actions |
| Notifications | **Sonner** | Toasts après actions (succès / erreur) |
| Dates | **date-fns** | Formatage et calculs de dates |

### Backend & données

| Couche | Technologie | Rôle |
|--------|-------------|------|
| Base de données | **PostgreSQL** (hébergée sur **Neon**) | Utilisateurs, réservations, paiements, blog, cours, etc. |
| ORM | **Prisma 6** | Modèles, requêtes, migrations (`db push`, seed) |
| API | Routes Next.js (`/api/*`) | Contact, réservation, checkout, webhooks |

### Authentification & sécurité

| Couche | Technologie | Rôle |
|--------|-------------|------|
| Auth | **Clerk** (`@clerk/nextjs`) | Inscription, connexion, sessions, rôles (`admin` / `client`) |
| Localisation Clerk | `@clerk/localizations` | UI auth en arabe |
| Middleware | `src/middleware.ts` | Protection dashboard/admin, rate limit, chemin admin personnalisé |
| En-têtes HTTP | `next.config.ts` | CSP, HSTS, X-Frame-Options, etc. |
| Rate limiting | In-memory (`src/lib/rate-limit.ts`) | Limitation des requêtes API sensibles |
| Captcha (optionnel) | **Cloudflare Turnstile** | Formulaire de contact |
| 2FA admin (optionnel) | Clerk MFA + `ADMIN_REQUIRE_2FA` | Réservé aux admins (plan Clerk Pro) |
| Chemin admin masqué | `NEXT_PUBLIC_ADMIN_PATH` | URL non évidente pour `/admin` en production |

### Paiements

| Couche | Technologie | Rôle |
|--------|-------------|------|
| Principal (Maroc) | **PayZone** | Cartes CMI, Visa/Mastercard marocaines |
| Optionnel (international) | **Stripe** | Paiements carte hors Maroc / diaspora |
| Webhooks | `/api/webhooks/payzone`, `/api/webhooks/stripe` | Confirmation automatique des paiements |

### Emails & communication

| Couche | Technologie | Rôle |
|--------|-------------|------|
| Envoi transactionnel | **Resend** | Confirmations réservation, contact, notifications coach |
| Visioconférence | **Zoom** (lien fixe ou API) ou **Google Meet** | Séances à distance |
| Contact site | Formulaire + WhatsApp / Instagram (liens) | Canal direct hors email |

### Déploiement & outils dev

| Couche | Technologie | Rôle |
|--------|-------------|------|
| Hébergement recommandé | **Vercel** | Build Next.js, CDN, HTTPS, variables d'environnement |
| Runtime | Node.js (via Vercel) | Exécution serveur |
| Lint | ESLint + `eslint-config-next` | Qualité du code |
| Seed | `tsx` + `prisma/seed.ts` | Données de démo / contenu initial |

### Fonctionnalités métier (modules)

- **Site vitrine** : accueil, à propos, services, blog, podcasts, formations, témoignages, contact, pages légales
- **Réservation** : choix service → créneau → paiement → confirmation
- **Espace client** (`/dashboard`) : réservations, cours, objectifs, journal, ressources, paiements
- **Administration** (`/admin` ou chemin personnalisé) : clients, réservations, cours, blog, podcasts, coupons, disponibilités, emails, visio

---

## Architecture de déploiement (recommandée)

```
[Utilisateur]
     │
     ▼
[Nom de domaine]  ← registrar (OVH, Namecheap, Cloudflare, etc.)
     │
     ▼
[Vercel]          ← héberge l'app Next.js (HTTPS inclus)
     │
     ├── [Neon]           PostgreSQL
     ├── [Clerk]          Authentification
     ├── [Resend]         Emails sortants
     ├── [PayZone]        Paiements Maroc
     ├── [Stripe]         Paiements (optionnel)
     ├── [Zoom / Meet]    Visioconférence
     └── [Turnstile]      Anti-spam contact (optionnel, gratuit)
```

---

## Coûts estimés pour la mise en ligne

### Scénario A — Lancement minimal (budget serré)

Objectif : site en ligne avec les fonctions essentielles, trafic faible au départ.

| Service | Coût mensuel | Coût annuel | Notes |
|---------|--------------|-------------|-------|
| **Vercel** (Hobby) | **0 €** | **0 €** | Gratuit ; suffisant pour démarrer. Limites bande passante / builds. |
| **Neon** (Free) | **0 €** | **0 €** | PostgreSQL gratuit (quota stockage / compute). |
| **Clerk** (Free) | **0 €** | **0 €** | Jusqu’à ~10 000 MAU. Pas de MFA (2FA) sur le plan gratuit. |
| **Resend** (Free) | **0 €** | **0 €** | ~3 000 emails/mois. Domaine à vérifier pour envoyer depuis `@votredomaine.ma`. |
| **Cloudflare Turnstile** | **0 €** | **0 €** | Captcha gratuit (optionnel). |
| **Nom de domaine** `.ma` ou `.fr` | — | **~80–150 MAD** (~8–15 €) | `.ma` via ANRT/registrar local ; `.fr` ~10 €/an. |
| **Email domaine** (voir section ci-dessous) | **0–5 €** | **0–60 €** | Redirection gratuite possible ; boîte pro payante si besoin. |
| **PayZone** | Variable | Variable | Frais d’adhésion commerçant + % par transaction (négocier avec PayZone). |
| **Stripe** (optionnel) | Variable | Variable | ~1,5 % + frais carte par transaction (hors Maroc). |
| **Zoom** (lien fixe) | **0 €** | **0 €** | Plan gratuit suffit pour un lien de réunion réutilisable. |

**Total fixe minimal : ~0 €/mois + nom de domaine (~10 €/an)**

---

### Scénario B — Production confortable (recommandé)

Objectif : site pro, emails `@asmae-coaching.ma`, admin sécurisé, marge de croissance.

| Service | Coût mensuel | Coût annuel | Notes |
|---------|--------------|-------------|-------|
| **Vercel** (Pro) | **~20 $** (~18 €) | **~216 $** | Plus de bande passante, analytics, équipe. |
| **Neon** (Launch) | **~5–19 $** | **~60–228 $** | Plus de stockage et branches DB si besoin. |
| **Clerk** (Free ou Pro) | **0–25 $** | **0–300 $** | **Pro (~25 $/mois)** si vous voulez MFA/2FA admin. |
| **Resend** (Pro si volume) | **0–20 $** | **0–240 $** | Free souvent suffisant au début. |
| **Nom de domaine** | — | **~10–15 €** | Renouvellement annuel. |
| **Google Workspace** ou **Zoho Mail** | **~6–12 €** | **~72–144 €** | `contact@`, `asmae@` sur votre domaine. |
| **PayZone** | % transactions | — | Compte marchand obligatoire pour encaisser. |
| **Zoom Pro** (optionnel) | **~14 €** | **~168 €** | Réunions > 40 min, plus de participants. |

**Total fixe estimé : ~25–50 €/mois** (hors commissions paiement)

---

### Frais variables (à prévoir dans le business model)

| Poste | Ordre de grandeur |
|-------|-------------------|
| **PayZone** | Frais commerçant + commission par paiement (typ. quelques % — contrat marchand) |
| **Stripe** | ~1,5 % + 0,25 € (Europe) par transaction réussie |
| **Resend** | Dépassement du quota gratuit → forfait supérieur |
| **Clerk** | Au-delà de 10 000 utilisateurs actifs/mois → plan payant |

---

## Où héberger quoi ?

| Besoin | Service recommandé | Alternative |
|--------|-------------------|-------------|
| **Application Next.js** | [Vercel](https://vercel.com) | Netlify, Railway, VPS (plus technique) |
| **Base PostgreSQL** | [Neon](https://neon.tech) | Supabase, Railway, PlanetScale (MySQL) |
| **Authentification** | [Clerk](https://clerk.com) | Better Auth, Auth.js (self-hosted) |
| **Emails transactionnels** | [Resend](https://resend.com) | SendGrid, Brevo, Amazon SES |
| **Paiements Maroc** | [PayZone](https://www.payzone.ma) | CMI direct (intégration plus lourde) |
| **Paiements international** | [Stripe](https://stripe.com) | PayPal (non intégré actuellement) |
| **DNS / CDN / protection** | [Cloudflare](https://cloudflare.com) (gratuit) | DNS du registrar (OVH, etc.) |
| **Captcha** | [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) | reCAPTCHA (Google) |
| **Visioconférence** | Zoom ou Google Meet | Whereby, Jitsi |

---

## Nom de domaine

### Où acheter ?

| Extension | Où | Prix indicatif |
|-----------|-----|----------------|
| **`.ma`** (Maroc) | Registrars agréés ANRT (ex. [Genious](https://www.genious.ma), Maroc Telecom partenaires) | ~80–150 MAD/an |
| **`.fr`** | OVH, Gandi, Cloudflare | ~8–12 €/an |
| **`.com`** | Namecheap, Cloudflare, Google Domains | ~10–15 $/an |

### Configuration

1. Acheter le domaine (ex. `asmae-coaching.ma`).
2. Pointer les DNS vers **Vercel** (enregistrements `A` / `CNAME` indiqués dans le dashboard Vercel).
3. Ajouter le domaine dans **Clerk** (domaines autorisés pour l’auth en production).
4. Vérifier le domaine dans **Resend** (pour envoyer depuis `contact@asmae-coaching.ma`).

---

## Email avec domaine personnalisé

Deux besoins distincts :

### 1. Emails **envoyés par le site** (automatiques)

→ **Resend** (déjà intégré)

- Créer un compte [resend.com](https://resend.com)
- Ajouter votre domaine → Resend fournit des enregistrements **DKIM**, **SPF**, **DMARC** à mettre dans le DNS
- Variable : `RESEND_FROM_EMAIL=ASMAE Coaching <contact@votredomaine.ma>`
- Variable : `COACH_EMAIL=asmae@votredomaine.ma` (destinataire des formulaires contact)

**Coût :** gratuit jusqu’à ~3 000 emails/mois.

### 2. Boîte mail **pour lire / répondre** (usage humain)

Le site n’héberge pas une boîte mail ; il faut un fournisseur email :

| Solution | Coût | Usage |
|----------|------|-------|
| **[Cloudflare Email Routing](https://developers.cloudflare.com/email-routing/)** | **Gratuit** | Redirige `contact@` → Gmail perso. Pas de boîte « pro » complète. |
| **[Zoho Mail](https://www.zoho.com/mail/)** (plan gratuit limité) | **0 €** | 1–5 boîtes sur domaine custom (offre gratuite parfois limitée). |
| **[Google Workspace](https://workspace.google.com)** | **~6 €/utilisateur/mois** | Gmail pro `@votredomaine`, calendrier, Drive. |
| **[Microsoft 365](https://www.microsoft.com/microsoft-365)** | **~5–10 €/mois** | Outlook pro sur domaine custom. |
| **OVH Email Pro** | **~1–2 €/mois** | Boîte simple si domaine chez OVH. |

**Recommandation démarrage :** Cloudflare Email Routing (gratuit) + Resend pour l’envoi automatique.  
**Recommandation pro :** Google Workspace ou Zoho pour `asmae@` et `contact@`.

---

## Checklist avant mise en ligne

### Comptes & clés

- [ ] Compte **Vercel** + repo GitHub connecté
- [ ] Projet **Neon** production (`DATABASE_URL` pooler + `DIRECT_URL`)
- [ ] **Clerk** : clés `pk_live_` / `sk_live_`, domaine prod autorisé
- [ ] **Resend** : domaine vérifié, `RESEND_API_KEY`
- [ ] **PayZone** : compte marchand, `PAYZONE_ORIGINATOR_ID`, `PAYZONE_PASSWORD`
- [ ] **Stripe** (si diaspora) : clés live + webhook
- [ ] **Zoom** : `ZOOM_STATIC_MEETING_URL` ou credentials API
- [ ] **Turnstile** (optionnel) : clés site + secret

### Variables d'environnement Vercel

Copier depuis `.env.example` / `.env.local` en remplaçant les valeurs de test :

```env
NEXT_PUBLIC_APP_URL=https://votredomaine.ma
NEXT_PUBLIC_ADMIN_PATH=/console-votre-chemin-secret
ADMIN_REQUIRE_2FA=false
# ... toutes les autres variables
```

### Sécurité production

- [ ] Chemin admin **non évident** (`NEXT_PUBLIC_ADMIN_PATH`)
- [ ] Rôle `admin` dans les métadonnées Clerk du compte coach uniquement
- [ ] Ne jamais commiter `.env.local`
- [ ] Webhooks PayZone/Stripe pointant vers `https://votredomaine.ma/api/webhooks/...`
- [ ] `npm run build` OK en local avant deploy

### Légal (Maroc / France selon cible)

- [ ] Mentions légales à jour (`/mentions-legales`)
- [ ] Politique de confidentialité (`/confidentialite`)
- [ ] CGV / conditions de vente (formations, séances)
- [ ] Consentement cookies si analytics ajoutés plus tard

---

## Récapitulatif budget annuel (ordre de grandeur)

| Profil | Coût fixe/an | + transactions |
|--------|--------------|----------------|
| **Minimal** (tout gratuit + domaine) | **~10–20 €** | Commissions PayZone |
| **Confort** (Vercel Pro + email pro) | **~300–600 €** | Commissions PayZone / Stripe |
| **Avec 2FA admin** (Clerk Pro) | **+~300 €/an** | — |

---

## Liens utiles

| Service | Dashboard |
|---------|-----------|
| Vercel | https://vercel.com/dashboard |
| Neon | https://console.neon.tech |
| Clerk | https://dashboard.clerk.com |
| Resend | https://resend.com/domains |
| PayZone | https://www.payzone.ma |
| Stripe | https://dashboard.stripe.com |
| Cloudflare | https://dash.cloudflare.com |

---

## Fichiers de référence dans le projet

| Fichier | Contenu |
|---------|---------|
| `.env.example` | Liste complète des variables d'environnement |
| `prisma/schema.prisma` | Modèle de données |
| `src/middleware.ts` | Sécurité routes & rate limit |
| `next.config.ts` | En-têtes de sécurité (CSP, HSTS) |
| `README.md` | Démarrage développement local |
