# Comptes démo

## Seed des utilisateurs test

```bash
npm run db:seed-demo-users
```

Nécessite `CLERK_SECRET_KEY` (dev) et `DATABASE_URL` dans `.env.local`.

## Rôle admin

Dans Clerk → Users → Public metadata :

```json
{ "role": "admin" }
```

Et **Sessions → Customize session token** : inclure le claim `metadata`.

## Contenu démo

```bash
npm run db:seed
```

Services, cours, blog, podcasts, témoignages de démonstration.

> Ne pas utiliser en production client — remplacer par le contenu réel ASMAE.






export const demoUserAccounts: DemoUserAccount[] = [
  {
    key: "admin",
    email: "saadsaidi0207@gmail.com",
    password: "AsmaeDemo2026!",
    // ...
  },
  {
    key: "cliente",
    email: "mariosaadsaidi22@gmail.com",
    password: "ClienteDemo2026!",
    // ...
  },
  {
    key: "cliente-nouvelle",
    email: "chawarmamks@gmail.com",
    password: "ClienteDemo2026!",
    // ...
  },
];
