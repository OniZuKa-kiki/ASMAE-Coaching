# Emails auth Clerk (ASMAE)

Emails personnalisés (logo, RTL arabe) via **Resend**, déclenchés par le webhook `email.created`.

## Variables

```env
CLERK_WEBHOOK_SIGNING_SECRET=whsec_...
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=ASMAE Coaching <noreply@votre-domaine.fr>
CLERK_CUSTOM_AUTH_EMAILS=auto
```

| `CLERK_CUSTOM_AUTH_EMAILS` | Comportement |
|----------------------------|--------------|
| `auto` | Resend si Clerk n’a pas déjà livré l’email |
| `never` | Clerk uniquement (pratique sans domaine Resend) |

## Webhook

1. Clerk → Webhooks → Add endpoint
2. URL : `https://votre-domaine.fr/api/webhooks/clerk`
3. Événement : `email.created`
4. Signing secret → `CLERK_WEBHOOK_SIGNING_SECRET`

> Utiliser le secret de l’instance **Production** Clerk, pas Development.

## Prod vs dev

- **Dev** : `onboarding@resend.dev` — emails limités aux adresses autorisées Resend
- **Prod** : domaine vérifié sur Resend + *Delivered by Clerk OFF* sur les templates ASMAE

## Échecs webhook (40 %)

Causes fréquentes : `RESEND_API_KEY` manquant, secret webhook incorrect, domaine Resend non vérifié.  
Après correction → **Replay** un message dans Clerk.

Voir aussi [`a-regler-avant-production.md`](./a-regler-avant-production.md).
