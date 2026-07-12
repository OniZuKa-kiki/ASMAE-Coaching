# Guide du site ASMAE Coaching

## Public

| Zone | Pages |
|------|-------|
| Accueil | `/` — hero, méthode, témoignages, FAQ |
| Services | `/services`, `/services/[slug]` |
| Réservation | `/booking` — 4 étapes + paiement |
| Contenus | `/courses`, `/podcasts`, `/blog`, `/testimonials` |
| Recherche | `/search` |
| Légal | `/cgu`, `/cgv`, `/confidentialite`, `/politique-cookies`, `/mentions-legales` |
| Contact | `/contact` |

## Client (`/dashboard`)

Vue d’ensemble, séances, formations, podcasts, objectifs, journal, humeur, bibliothèque, paiements/factures, favoris, notifications, parcours (`/dashboard/journey`).

**Suggestions personnalisées** : humeur, objectifs, journal, favoris, thèmes LLM (Gemini optionnel).

## Admin (`NEXT_PUBLIC_ADMIN_PATH`)

Clients, réservations, contenus, paiements, coupons, paramètres (dispo, visio, emails, langues).

## Paiements

PayZone (défaut Maroc) + Stripe optionnel. Fulfillment via Inngest ou synchrone.

## i18n

Arabe (RTL, défaut) et français — cookie `NEXT_LOCALE`, pas de préfixe URL.

---

Déploiement : [`deploiement-vercel.md`](./deploiement-vercel.md)  
Avant prod : [`a-regler-avant-production.md`](./a-regler-avant-production.md)
