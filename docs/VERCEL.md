# Déploiement sur Vercel — ASMAE Coaching

Le dépôt est déjà sur GitHub (`ASMAE-Coaching`). Ce guide couvre uniquement la mise en ligne sur Vercel.

## Prérequis

1. Compte [Vercel](https://vercel.com) (connexion avec le même compte que GitHub)
2. Base PostgreSQL cloud : [Neon](https://neon.tech) (gratuit) ou [Supabase](https://supabase.com)
3. Clés **production** Clerk (`pk_live_` / `sk_live_`)
4. Clé [Resend](https://resend.com) pour les emails

---

## Étape 1 — Lier le projet sur Vercel

1. Allez sur [vercel.com/new](https://vercel.com/new)
2. **Import Git Repository** → sélectionnez `ASMAE-Coaching`
3. Vercel détecte **Next.js** automatiquement
4. **Root Directory** : laissez vide (racine du repo)
5. **Build Command** : `npm run build` (défaut — inclut `prisma generate`)
6. **Install Command** : `npm install` (défaut)
7. Ne cliquez pas encore sur Deploy — configurez d’abord la base de données

---

## Étape 2 — Base de données (Neon)

Votre PostgreSQL local ne fonctionne pas sur Vercel. Il faut une base cloud.

1. Créez un projet sur [neon.tech](https://neon.tech)
2. Copiez l’URL **Connection pooling** (pas la directe) → ce sera `DATABASE_URL`
3. Depuis votre PC, initialisez le schéma sur cette base :

```powershell
cd c:\Users\Saad\Desktop\Programming\COACH_SITE
# Si "running scripts is disabled" : utilisez npm.cmd au lieu de npm
npm.cmd run db:push
npm.cmd run db:seed
```

Les URLs Neon sont déjà dans `.env.local` (`DATABASE_URL` = pooled, `DIRECT_URL` = direct).

Sur **Vercel**, ajoutez les deux variables :
- `DATABASE_URL` → URL **Connection pooling**
- `DIRECT_URL` → URL **directe** (sans `-pooler` dans le host)

Le seed remplit services, blog, témoignages en arabe.

---

## Étape 3 — Variables d’environnement sur Vercel

Vercel → **Project → Settings → Environment Variables**

Copiez toutes les variables de `.env.example` avec les **valeurs production**. Cochez **Production**, **Preview** et **Development**.

### Obligatoires pour le premier déploiement

| Variable | Valeur |
|----------|--------|
| `DATABASE_URL` | URL Neon **pooled** + `?sslmode=require` |
| `DIRECT_URL` | URL Neon **directe** (même mot de passe, sans `-pooler`) |
| `NEXT_PUBLIC_APP_URL` | `https://VOTRE-PROJET.vercel.app` (voir après 1er deploy) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_...` |
| `CLERK_SECRET_KEY` | `sk_live_...` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/dashboard` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/dashboard` |
| `RESEND_API_KEY` | Clé Resend |
| `RESEND_FROM_EMAIL` | `ASMAE Coaching <contact@votredomaine.com>` |
| `COACH_EMAIL` | Email de la coach |
| `ZOOM_STATIC_MEETING_URL` | Lien Zoom/Meet réel |

### Paiements (quand disponibles)

| Variable | Usage |
|----------|--------|
| `PAYMENT_DEFAULT_PROVIDER` | `payzone` |
| `PAYZONE_ORIGINATOR_ID` | Compte PayZone |
| `PAYZONE_PASSWORD` | Compte PayZone |
| `EUR_TO_MAD_RATE` | `10.85` |
| `STRIPE_SECRET_KEY` | Optionnel — cartes internationales |
| `STRIPE_WEBHOOK_SECRET` | Après config webhook Stripe |

---

## Étape 4 — Premier déploiement

1. **Deploy** (ou laissez Vercel déployer au push sur `main`)
2. Notez l’URL : `https://asmae-coaching-xxx.vercel.app`
3. Retournez dans **Environment Variables** → mettez à jour `NEXT_PUBLIC_APP_URL` avec cette URL exacte
4. **Deployments → Redeploy** (pour que l’app connaisse sa propre URL)

---

## Étape 5 — Clerk (domaine autorisé)

Dans [dashboard.clerk.com](https://dashboard.clerk.com) :

1. **Configure → Domains** → ajoutez votre URL Vercel (`*.vercel.app` ou domaine custom)
2. Utilisez les clés **Production** (`pk_live_` / `sk_live_`) dans Vercel, pas les clés test
3. **Paths** : sign-in `/sign-in`, sign-up `/sign-up` (déjà configurés)

Test : ouvrez `/sign-in` sur le site Vercel et connectez-vous.

---

## Étape 6 — Domaine personnalisé (optionnel)

Vercel → **Project → Settings → Domains** :

1. Ajoutez `asmae-coaching.fr` (ou votre domaine)
2. Suivez les instructions DNS (A/CNAME chez votre registrar)
3. Mettez à jour `NEXT_PUBLIC_APP_URL` + domaine Clerk
4. Redéployez

---

## Webhooks paiement (après mise en ligne)

| Service | URL |
|---------|-----|
| Stripe | `https://VOTRE-DOMAINE.vercel.app/api/webhooks/stripe` |
| PayZone | URL de retour : `https://VOTRE-DOMAINE.vercel.app/api/payments/payzone/return` |

---

## Déploiement via CLI (alternative)

Si vous préférez ne pas passer par le dashboard :

```powershell
npx vercel login
npx vercel link
npx vercel env pull .env.vercel.local
npx vercel --prod
```

Les variables doivent quand même être définies sur Vercel (dashboard ou `vercel env add`).

---

## Déploiements automatiques

Chaque **push sur `main`** déclenche un nouveau déploiement production sur Vercel (si le repo est lié). Les pull requests créent des **preview deployments**.

---

## Dépannage

| Problème | Solution |
|----------|----------|
| Build échoue « Prisma Client » | `postinstall` et `build` lancent déjà `prisma generate` |
| `Can't reach database` | URL Neon avec `?sslmode=require`, utiliser l’URL **pooled** |
| Clerk : boucle de redirection | Domaine Vercel ajouté dans Clerk + clés `live` |
| Pages dashboard en 500 | `DATABASE_URL` manquante ou schéma non poussé (`db:push`) |
| Emails ne partent pas | `RESEND_API_KEY` + domaine vérifié chez Resend |
| Paiement indisponible | Normal tant que PayZone/Stripe ne sont pas configurés |

---

## Checklist finale

- [ ] Neon créé, `db:push` + `db:seed` exécutés
- [ ] Projet importé sur Vercel depuis `ASMAE-Coaching`
- [ ] Toutes les variables obligatoires renseignées
- [ ] `NEXT_PUBLIC_APP_URL` = URL Vercel réelle
- [ ] Domaine ajouté dans Clerk
- [ ] Test connexion + page d’accueil + réservation
- [ ] Rôle admin Clerk : `{ "role": "admin" }` sur le compte de la coach
