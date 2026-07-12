# Configuration Inngest

Inngest exécute les tâches **après un paiement validé** de façon asynchrone (avec retries) :

1. Marquer le paiement payé en base
2. Confirmer la réservation **ou** débloquer la formation
3. Envoyer les emails de confirmation

Sans Inngest, tout cela se fait **en synchrone** dans le webhook (fallback automatique).

---

## Fichiers concernés

| Fichier | Rôle |
|---------|------|
| `src/inngest/client.ts` | Client Inngest (`id: coach-site`) |
| `src/inngest/functions/payment-fulfillment.ts` | Job `fulfill-verified-payment` |
| `src/app/api/inngest/route.ts` | Endpoint serveur (`GET`, `POST`, `PUT`) |
| `src/lib/payments/fulfillment-queue.ts` | Enqueue ou fallback sync |

Événement déclenché : `payment/verified`  
Webhooks qui enqueue : PayZone, Stripe, retour PayZone.

---

## Mode 1 — Local sans Inngest (défaut)

**Variables :** laissez `INNGEST_EVENT_KEY` vide dans `.env.local`.

```bash
npm run dev
```

Le fulfillment s’exécute **dans le webhook** tout de suite. Pratique pour le dev, pas de terminal supplémentaire.

---

## Mode 2 — Local avec Inngest Dev Server

Pour tester l’async + retries + dashboard Inngest en local :

### Étape 1 — Compte Inngest

1. [inngest.com](https://www.inngest.com) → créer un compte
2. Créer une app (ex. `asmae-coaching`)
3. **Manage → Keys** : copier **Event Key** et **Signing Key**

### Étape 2 — Variables locales

Dans `.env.local` :

```env
INNGEST_EVENT_KEY=inngest_...
INNGEST_SIGNING_KEY=signkey-...
```

### Étape 3 — Deux terminaux

```bash
# Terminal 1
npm run dev

# Terminal 2
npm run inngest:dev
```

`inngest:dev` pointe vers `http://localhost:3000/api/inngest`.

### Étape 4 — Vérifier

1. Ouvrir le dashboard Inngest (lien affiché par la CLI, souvent `http://localhost:8288`)
2. Vous devez voir la fonction **`fulfill-verified-payment`**
3. Simuler un paiement test → l’événement `payment/verified` apparaît dans l’onglet **Runs**

---

## Mode 3 — Production (Vercel)

### Option A — Intégration Vercel (recommandée)

1. [Inngest Dashboard](https://app.inngest.com) → **Apps** → **Create app**
2. Choisir **Vercel** comme plateforme
3. Connecter le repo GitHub / projet Vercel `ASMAE-Coaching`
4. Inngest configure automatiquement :
   - URL de sync : `https://votre-domaine.fr/api/inngest`
   - Variables `INNGEST_EVENT_KEY` et `INNGEST_SIGNING_KEY` sur Vercel
5. **Redeploy** le projet Vercel

### Option B — Configuration manuelle

1. Créer l’app sur Inngest
2. **App URL** : `https://votre-domaine.fr/api/inngest`
3. Copier Event Key + Signing Key
4. **Vercel → Settings → Environment Variables** (Production) :

```env
INNGEST_EVENT_KEY=inngest_...
INNGEST_SIGNING_KEY=signkey-...
```

5. Redeploy

### Vérification prod

1. Inngest Dashboard → **Apps** → votre app → **Functions**
2. Fonction `fulfill-verified-payment` doit être **Synced**
3. Après un paiement test réel/sandbox : onglet **Runs** → statut **Completed**

---

## Comportement selon les variables

| `INNGEST_EVENT_KEY` | Comportement |
|---------------------|--------------|
| Vide | Fulfillment **synchrone** dans le webhook |
| Renseignée | Événement envoyé à Inngest → job async avec **4 retries** |

Le code :

```ts
// src/lib/payments/fulfillment-queue.ts
if (isInngestEnabled()) {
  await inngest.send({ name: "payment/verified", ... });
} else {
  await fulfillVerifiedPayment(verified); // sync
}
```

---

## Dépannage

| Problème | Solution |
|----------|----------|
| Fonction absente du dashboard | Vérifier que `/api/inngest` répond (200) après deploy |
| Runs en échec | Vercel → Logs → filtrer `inngest` ou `fulfillment` |
| Rien ne part en local | `INNGEST_EVENT_KEY` vide = mode sync (normal) |
| `inngest:dev` ne connecte pas | `npm run dev` doit tourner sur le port 3000 |
| Double traitement | L’ID d’événement `payment-fulfillment-{paymentId}` évite les doublons |

---

## Variables `.env`

```env
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
```

Voir aussi [`.env.example`](../.env.example) et [`a-regler-avant-production.md`](./a-regler-avant-production.md).
