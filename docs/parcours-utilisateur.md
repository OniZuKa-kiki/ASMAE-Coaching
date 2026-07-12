# Parcours utilisateur — ASMAE Coaching

Document de référence interne décrivant les parcours du site, les URLs et l’accès aux pages légales.

**Dernière mise à jour :** juillet 2026

---

## 1. Vue d’ensemble

| Zone | URL de base | Public cible |
|------|-------------|--------------|
| Site public | `/` | Visiteuses, prospects |
| Réservation & paiement | `/booking` | Clientes |
| Espace client (مساحتي) | `/dashboard` | Clientes connectées |
| Administration | `/admin` | Asmae / équipe |
| Authentification | `/sign-in`, `/sign-up` | Toutes |

**Langue de l’interface :** arabe (RTL), ton féminin pour le public client.

**Terminologie clé :**

| Éviter | Utiliser |
|--------|----------|
| استشارة | جلسة |
| احجز استشارة | احجزي جلسة |
| نظرة عامة (client) | الرئيسية / لوحة التحكم |
| الكوبونات | القسائم |

---

## 2. Site public

### Navigation principale (header)

| Libellé | URL |
|---------|-----|
| الرئيسية | `/` |
| الكوتشينغ | `/services` |
| الدورات | `/courses` |
| تواصل | `/contact` |

### Menu « Plus »

| Libellé | URL |
|---------|-----|
| من أنا | `/about` |
| احجز جلسة | `/booking` |
| البودكاست | `/podcasts` |
| المدونة | `/blog` |
| آراء العميلات | `/testimonials` |

### Pages accessibles (sans compte)

| Page | URL | Rôle |
|------|-----|------|
| Accueil | `/` | Hero, problèmes, méthode, FAQ, témoignages, CTA |
| À propos | `/about` | Histoire, valeurs, approche |
| Services | `/services` | Liste des offres de coaching |
| Détail service | `/services/[slug]` | Fiche service + CTA réservation |
| Réservation | `/booking` | Parcours en 3 étapes (voir §4) |
| Formations | `/courses` | Catalogue avec recherche / tri |
| Détail formation | `/courses/[slug]` | Programme + achat |
| Podcasts | `/podcasts` | Gratuit + حصري, filtres |
| Détail podcast | `/podcasts/[slug]` | Écoute ou contenu verrouillé |
| Blog | `/blog` | Articles avec filtres |
| Article | `/blog/[slug]` | Contenu article |
| Témoignages | `/testimonials` | Avis clientes |
| Contact | `/contact` | Formulaire + coordonnées |

### FAQ

- Intégrée à l’**accueil** (section الأسئلة الشائعة).
- Pas de page `/faq` dédiée.

---

## 3. Pages légales

### Accès depuis le site

1. **Pied de page** (toutes les pages publiques) — liens en bas à droite.
2. **Bannière cookies** — lien vers la politique cookies (première visite).
3. **Page paiement annulé** (`/booking/cancel`) — liens CGV + confidentialité.

> Le footer **n’apparaît pas** sur `/dashboard`, `/admin`, `/sign-in`, `/sign-up`.

### URLs

| Page | URL | Contenu |
|------|-----|---------|
| Mentions légales | `/mentions-legales` | Éditeur, hébergeur, propriété intellectuelle |
| CGU | `/cgu` | Règles d’utilisation du site |
| CGV | `/cgv` | Vente, paiement, annulation, remboursement |
| Confidentialité | `/confidentialite` | RGPD, données, droits |
| Cookies | `/politique-cookies` | Types de cookies, gestion |

**À compléter avant lancement :** adresse, SIRET, hébergeur, téléphone (placeholders dans `src/lib/legal-content.ts`).

---

## 4. Parcours réservation & paiement (جلسة)

```
Accueil / Services / Service détail
        ↓
   /booking
   ┌─────────────────────────────────────┐
   │ 1. الخدمة — Choix du service       │
   │ 2. الموعد — Date & créneau         │
   │ 3. الدفع — Récap + paiement        │
   └─────────────────────────────────────┘
        ↓
   PayZone ou Stripe (checkout externe)
        ↓
   ┌──────────────┬──────────────────────┐
   │ Succès       │ Annulation / échec    │
   │ /booking/    │ /booking/cancel       │
   │ success      │                       │
   └──────────────┴──────────────────────┘
        ↓
   Email de confirmation (Resend)
        ↓
   Lien visio (Zoom / Meet — admin)
        ↓
   Jour J — consultation
```

### Points importants (conformité PayZone)

- Prix affiché avant le bouton **ادفعي**.
- CGV et confidentialité accessibles depuis le footer.
- Politique d’annulation : **24 h** avant la séance (détaillée dans les CGV).
- Page succès : lien vers **جلساتي** (`/dashboard/bookings`).

### Parcours achat formation

```
/courses → /courses/[slug] → Checkout Stripe/PayZone
        ↓
   Succès : accès dans /dashboard/courses
   Annulé : /booking/cancel?from=course&slug=...
```

---

## 5. Authentification

| Action | URL | Remarque |
|--------|-----|----------|
| Connexion | `/sign-in` | Clerk |
| Inscription | `/sign-up` | Clerk |
| Mot de passe oublié | Flux Clerk | Depuis `/sign-in` |
| Vérification email | Flux Clerk | Après inscription |
| 2FA admin | Gate admin | Si `ADMIN_REQUIRE_2FA=true` |

Après connexion, le menu compte (Clerk) propose :

- **مساحتي** → `/dashboard`
- **لوحة الإدارة** → `/admin` (admins uniquement)

---

## 6. Espace client — مساحتي (`/dashboard`)

### Menu latéral

| Libellé | URL | Contenu |
|---------|-----|---------|
| الرئيسية | `/dashboard` | Stats, prochaines جلسات, CTA احجزي |
| جلساتي | `/dashboard/bookings` | À venir + historique |
| دوراتي | `/dashboard/courses` | Formations achetées |
| البودكاست | `/dashboard/podcasts` | Épisodes + filtres |
| أهدافي | `/dashboard/goals` | Objectifs de coaching |
| يومياتي | `/dashboard/journal` | Journal privé |
| مكتبتي | `/dashboard/resources` | Vidéos & PDF des cours |
| المدفوعات | `/dashboard/payments` | Historique paiements |
| الإعدادات | `/dashboard/settings` | Questionnaire pré-séance |

### Parcours type — nouvelle cliente

```
1. Découverte site public
2. /sign-up — création compte
3. /booking — première réservation
4. Paiement → /booking/success
5. /dashboard — vue d’ensemble
6. /dashboard/settings — questionnaire (recommandé avant 1ère séance)
7. /dashboard/bookings — lien visio le jour J
```

### Profil

- Pas de page `/dashboard/profil` dédiée.
- Nom, email, photo : menu compte Clerk (coin du header).

---

## 7. Administration — لوحة الإدارة (`/admin`)

### Menu

| Libellé | URL |
|---------|-----|
| لوحة التحكم | `/admin` |
| العملاء | `/admin/users` |
| الحجوزات | `/admin/bookings` |
| الدورات | `/admin/courses` |
| البودكاست | `/admin/podcasts` |
| المدونة | `/admin/blog` |
| المدفوعات | `/admin/payments` |
| القسائم | `/admin/coupons` |
| الإعدادات | `/admin/settings` |

### Sous-pages paramètres

| Page | URL |
|------|-----|
| Index | `/admin/settings` |
| Disponibilités | `/admin/settings/availability` |
| Visio | `/admin/settings/visio` |
| Communication | `/admin/settings/communication` |
| Emails | `/admin/settings/emails` |
| Questionnaires | `/admin/settings/intake-forms` |

### Parcours type — Asmae au quotidien

```
1. /admin — indicateurs (clients, réservations mois, revenus, conversion)
2. /admin/bookings — confirmer / gérer les séances
3. /admin/users — voir clientes & questionnaire
4. /admin/payments — suivre les paiements
5. /admin/settings/availability — ajuster les créneaux
```

**Lien sortie :** عرض الموقع (ouvre le site public dans un nouvel onglet).

---

## 8. États de chargement (UX)

| Élément | Comportement |
|---------|--------------|
| Barre de progression | En haut à chaque changement de page |
| Skeleton admin | `/admin/*` pendant chargement serveur |
| Skeleton client | `/dashboard/*` |
| Skeleton catalogue | `/podcasts`, `/blog`, `/courses` |
| Stats admin | Skeleton des 4 cartes via Suspense |

---

## 9. Checklist démo PayZone

Avant d’envoyer le lien à PayZone, vérifier :

- [ ] Prix visibles sur `/services` et `/booking`
- [ ] Bouton paiement explicite (ادفعي)
- [ ] `/cgv` accessible depuis le footer
- [ ] `/confidentialite` accessible
- [ ] `/mentions-legales` complétées (plus de placeholders)
- [ ] Parcours réservation de bout en bout testable
- [ ] `/booking/success` et `/booking/cancel` fonctionnels
- [ ] Bannière cookies visible sur première visite
- [ ] Aucun contenu interdit / trompeur

---

## 10. Fichiers code associés

| Sujet | Fichier(s) |
|-------|------------|
| Navigation publique | `src/lib/constants.ts` |
| Nav client | `src/lib/dashboard-nav.ts` |
| Nav admin | `src/lib/admin-nav.ts` |
| Textes légaux | `src/lib/legal-content.ts` |
| Réservation | `src/app/booking/`, `src/components/booking/` |
| Paiement | `src/lib/payments/`, `src/app/api/booking/checkout/` |
| Stats admin | `src/lib/admin-stats.ts` |

---

## 11. URLs locales (développement)

```
http://localhost:3000/
http://localhost:3000/booking
http://localhost:3000/dashboard
http://localhost:3000/admin
http://localhost:3000/mentions-legales
http://localhost:3000/cgu
http://localhost:3000/cgv
http://localhost:3000/confidentialite
http://localhost:3000/politique-cookies
```

> Le chemin admin peut être personnalisé via `NEXT_PUBLIC_ADMIN_PATH` (voir `src/lib/admin-path.ts`).
