# Déploiement sur Vercel — ASMAE Coaching

## Prérequis

1. Compte [Vercel](https://vercel.com)
2. Compte [GitHub](https://github.com) (recommandé)
3. Base PostgreSQL cloud : [Neon](https://neon.tech) (gratuit) ou [Supabase](https://supabase.com)
4. Clés **production** Clerk (`pk_live_` / `sk_live_`)

---

## Étape 1 — Base de données (Neon)

1. Créez un projet sur [neon.tech](https://neon.tech)
2. Copiez l’URL **Connection pooling** → ce sera `DATABASE_URL`
3. Sur votre PC, poussez le schéma :

```bash
# Remplacez par votre URL Neon
set DATABASE_URL=postgresql://...
npm run db:push
npm run db:seed
```

---

## Étape 2 — Pousser le code sur GitHub

Le projet doit être dans son **propre dépôt** (pas mélangé avec d’autres sites).

```bash
cd c:\Users\Saad\Desktop\Programming\COACH_SITE
git init
git add .
git commit -m "Initial commit — ASMAE Coaching"
```

Sur GitHub : **New repository** → `asmae-coaching` (sans README).

```bash
git remote add origin https://github.com/VOTRE_USER/asmae-coaching.git
git branch -M main
git push -u origin main
```

---

## Étape 3 — Importer sur Vercel

1. [vercel.com/new](https://vercel.com/new)
2. **Import Git Repository** → choisissez `asmae-coaching`
3. Framework : **Next.js** (détecté automatiquement)
4. **Root Directory** : laissez vide (racine du repo)
5. **Build Command** : `npm run build` (défaut)
6. **Install Command** : `npm install` (défaut)

---

## Étape 4 — Variables d’environnement

Dans Vercel → **Project → Settings → Environment Variables**, ajoutez tout le contenu de `.env.example` avec les **vraies valeurs production** :

| Variable | Important |
|----------|-----------|
| `DATABASE_URL` | URL Neon (pooled) |
| `NEXT_PUBLIC_APP_URL` | `https://votre-projet.vercel.app` (après 1er deploy) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clé **live** Clerk |
| `CLERK_SECRET_KEY` | Secret **live** Clerk |
| `RESEND_API_KEY` | Clé Resend |
| `ZOOM_STATIC_MEETING_URL` | Lien visio réel |

Cochez **Production**, **Preview** et **Development**.

---

## Étape 5 — Clerk (domaine autorisé)

Dans [Clerk Dashboard](https://dashboard.clerk.com) :

1. **Domains** → ajoutez `votre-projet.vercel.app`
2. Passez en clés **Production** si ce n’est pas déjà fait
3. Webhooks (optionnel plus tard)

---

## Étape 6 — Redéployer

Après avoir ajouté les variables :

1. Vercel → **Deployments** → **Redeploy**
2. Mettez à jour `NEXT_PUBLIC_APP_URL` avec l’URL finale
3. Redéployez une dernière fois

---

## Webhooks paiement (après mise en ligne)

| Service | URL à configurer |
|---------|------------------|
| Stripe | `https://votre-domaine.vercel.app/api/webhooks/stripe` |
| PayZone | URL de retour selon leur doc |

---

## Déploiement via CLI (alternative)

```bash
npx vercel login
npx vercel link
npx vercel env pull .env.vercel.local
npx vercel --prod
```

---

## Dépannage

| Erreur | Solution |
|--------|----------|
| Prisma Client not generated | `postinstall` + `build` incluent déjà `prisma generate` |
| DB connection failed | Vérifiez `?sslmode=require` sur Neon |
| Clerk redirect loop | Domaine Vercel ajouté dans Clerk |
| 500 sur pages dashboard | `DATABASE_URL` manquante ou incorrecte |
