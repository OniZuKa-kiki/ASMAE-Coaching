# Feuille de route — Améliorations UX (retour externe)

**Source :** revue indépendante du site + parcours utilisateur (juillet 2026)  
**Note globale reçue :** UX 9.5 · UI 9 · Architecture 10 · Parcours 10 · Évolutivité 10

Ce document classe les idées par **déjà en place**, **quick wins** et **évolutions majeures**, pour prioriser sans tout faire d’un coup.

---

## ✅ Déjà en place (ne pas refaire)

| Domaine | État actuel |
|---------|-------------|
| Séparation site public / client / admin | ✅ |
| Parcours réservation (service → date → **questionnaire** → paiement → succès) | ✅ |
| Espace client : جلساتي، دوراتي، أهدافي، يومياتي، مكتبتي، المدفوعات، مساري، المفضلة | ✅ |
| Admin : clients, réservations, paiements, contenus, témoignages, paramètres | ✅ |
| Pages légales (mentions, CGU, CGV, confidentialité, cookies) | ✅ |
| Bannière cookies + footer légal | ✅ |
| FAQ sur l’accueil | ✅ |
| Filtres / recherche sur podcasts, blog, cours (catalogue public) | ✅ |
| Recherche globale (header + `/search` + dashboard) avec suggestions | ✅ |
| Stats admin connectées à la BDD | ✅ |
| Skeleton loaders + barre de progression navigation | ✅ |
| Terminologie جلسة (pas استشارة), ton féminin client | ✅ |
| Carrousel témoignages accueil (glisser + auto-play + indicateurs) | ✅ |

---

## 🟢 Quick wins (1–3 jours chacun)

### 1. Renommer « مواردي » ✅
**Fait :** « مكتبتي » dans la navigation, les pages dashboard et les textes associés.

### 2. Barres de progression objectifs ✅
**Fait :** composant `ProgressBar` partagé, badge « مكتمل » et barre visuelle sur `/dashboard/goals`.

### 3. Progression formations ✅
Sur `/dashboard/courses` : pourcentage + barre + « آخر درس » + bouton « متابعة » vers مكتبتي.  
**Données :** `LessonCompletion` + extension `getUserEnrollments`.

### 4. Widget « Aujourd’hui » admin ✅
Bloc en haut de `/admin` :
- séances du jour
- nouvelles clientes (24h)
- paiements du jour
- revenu du jour  
**Fait :** `getAdminTodayOverview` + `AdminTodayOverview` sur la page admin.

### 5. Questionnaire court avant réservation ✅
Entre étape date et paiement : motif (stress, confiance, couple, travail, autre).  
**Stockage :** champ `notes` sur `Booking`.  
**Fait :** étape 3 du formulaire, API checkout, affichage admin الحجوزات.

### 6. Bouton « + ملاحظة جديدة » journal ✅
CTA « ملاحظة جديدة » + sélecteur humeur (😊 😐 😔) sur `/dashboard/journal` et page d’édition.  
**Stockage :** champ `mood` existant (`happy` / `neutral` / `low`).

---

## 🟡 Évolutions moyennes (1–2 semaines)

### 7. Check-in humeur dashboard client ✅
« كيف تشعرين اليوم؟ » + emojis sur `/dashboard` — visible dans widget admin « اليوم » (جلسات + مزاج العميلات).  
**Modèle :** `MoodCheckIn` (userId, checkInDate, mood, note).

### 8. Calendrier dans « جلساتي » ✅
Vue mois RTL + détail du jour sélectionné + listes القادمة / السجل sur `/dashboard/bookings`.

### 9. Télécharger facture PDF ✅
Bouton « تحميل الفاتورة » sur `/dashboard/payments` et `/admin/payments` (paiements PAID).  
**Tech :** facture HTML RTL (Cairo embarqué) + PDF serveur (Puppeteer/Chromium).

### 10. Reprise podcast (« Continuer l’écoute ») ✅
**Modèle :** `PodcastProgress` (userId, podcastId, positionSec).  
**UI :** barre de progression + section « تابعي الاستماع » sur `/dashboard/podcasts` et lecteur audio.

### 11. Avis post-séance ✅
Après `COMPLETED` : formulaire ⭐ → table `BookingReview` → import admin vers témoignages.  
**Lien :** `Testimonial.sourceReviewId` + modération `/admin/testimonials`.

### 12. Catégories ressources ✅
Filtrer par : تمارين، تنزيلات، صوتيات، fichiers — tags sur leçons via `resource-categories.ts` + filtres مكتبتي.

---

## 🔴 Évolutions majeures (roadmap produit)

### 13. Centre de notifications 🔔 ✅
Séances demain, paiement confirmé, nouveau contenu.  
**Modèle :** `Notification` + badge header client + page `/dashboard/notifications`.

### 14. Favoris ✅
Podcasts, articles, formations → `Favorite` (userId, resourceType, resourceId) + `/dashboard/favorites`.

### 15. Recherche globale 🔍 ✅
Barre header : recherche unifiée stress → articles + podcasts + formations.  
**Tech :** agrégation Prisma + suggestions live (`/api/search/suggest`) + analytics `SearchQueryStat`.

### 16. « Mon parcours » — différenciateur ✅
Frise chronologique dérivée des tables existantes.  
**Page :** `/dashboard/journey` (« مساري »).

### 17. Admin contenu & insights ✅
- **Analytics recherche :** `/admin/settings/search-insights`
- **Témoignages CRUD :** `/admin/testimonials` (publier, importer avis séances)
- **Services CRUD :** `/admin/services` (titres, tarifs, durées)

---

## 🟣 Polish récent (juillet 2026)

| Item | État |
|------|------|
| Carrousel `/testimonials` (si > 3 avis) | ✅ |
| Navigation clavier suggestions recherche | ✅ |
| Rate-limit `/api/search/suggest` | ✅ |
| Indicateurs carrousel sync avec les avis | ✅ |

---

## Priorisation recommandée (ordre suggéré)

| Priorité | Feature | Statut |
|----------|---------|--------|
| P0 | Questionnaire pré-réservation | ✅ |
| P0 | Widget admin « Aujourd’hui » | ✅ |
| P1 | Progression cours + objectifs | ✅ |
| P1 | Check-in humeur | ✅ |
| P1 | Facture PDF | ✅ |
| P2 | Calendrier séances | ✅ |
| P2 | Avis post-séance | ✅ |
| P2 | Reprise podcast | ✅ |
| P3 | Notifications | ✅ |
| P3 | Mon parcours (timeline) | ✅ |
| P3 | Favoris + recherche globale | ✅ |
| P3 | Admin services + témoignages | ✅ |

---

## Points d’attention

1. **Ton féminin** : toutes les nouvelles chaînes client en arabe féminin (كيف تشعرين، احجزي، etc.).
2. **Terminologie** : garder **جلسة** partout côté cliente ; admin peut garder **حجوزات**.
3. **PayZone** : factures PDF + CGV + annulation 24h déjà dans `/cgv` — à valider juridiquement.
4. **Ne pas surcharger l’admin** : le feedback loue la simplicité actuelle ; ajouter par blocs, pas tout d’un coup.
5. **Humeur dashboard** : viser la **cliente** (« Bonjour [Prénom] »), pas « Bonjour Asmae » — Asmae est la coach.

---

## Lien avec la doc existante

- Parcours actuel : `docs/parcours-utilisateur.md`
- Guide complet : `docs/guide-du-site.md`
- Textes légaux : `src/lib/legal-content.ts`
- Navigation client : `src/lib/dashboard-nav.ts`

---

## Prochaines évolutions possibles (non urgent)

- Paiement PayZone en production (clés live + tests réels)
- ~~Emails transactionnels avancés (rappels J-1 séance)~~ ✅ — cron `/api/cron/booking-reminders` + `CRON_SECRET` + admin emails
- ~~Statistiques admin plus détaillées~~ ✅ — section « تحليلات متقدمة » sur `/admin`
- PWA / notifications push navigateur
- Multilingue (FR/AR) si expansion hors marché arabe
