# Guide linguistique — ASMAE Coaching

Ce document fixe les règles de ton et de terminologie pour le site bilingue arabe / français.

## Langues

| Zone | Langues | Notes |
|------|---------|-------|
| Site public | AR (défaut) + FR | Sélecteur dans le header, cookie `NEXT_LOCALE` |
| Dashboard client | AR + FR | Même mécanisme |
| Admin coach | AR uniquement | Impératifs féminins autorisés (اطلعي، راجعي…) |
| Contenu DB | AR | Titres services, articles, formations — contenu coach |
| E-mails transactionnels | AR + FR | Selon `User.preferredLocale` |

## Ton arabe (neutre)

**À utiliser** — formes neutres ou inclusives sans féminin forcé :

- حجز جلسة (pas احجزي)
- كيف تشعر اليوم؟ (pas تشعرين)
- يمكنك / أنت مسؤول عن…

**Admin coach** — impératif féminin OK pour parler à la coach :

- اطلعي على الحجوزات
- راجعي الإعدادات

## Terminologie clé

| Concept | Arabe | Français |
|---------|-------|----------|
| Séance de coaching | جلسة | Séance |
| Réserver | حجز جلسة | Réserver une séance |
| Formation en ligne | دورة / formation | Formation |
| Espace personnel | مساحتي | Mon espace |
| Coaching | كوتشينغ | Coaching |

## Fichiers i18n

- `messages/ar.json`, `messages/fr.json` — UI principale
- `messages/legal-ar.json`, `messages/legal-fr.json` — pages légales
- `src/i18n/request.ts` — chargement locale + fusion legal
- `src/lib/email-copy.ts` — e-mails transactionnels
- `src/lib/notification-copy.ts` — notifications dashboard

## SEO

- hreflang : même URL, variante FR via `?lang=fr` (middleware pose le cookie)
- `localeAlternates()` dans `src/lib/seo.ts`

## Persistance locale

- Cookie `NEXT_LOCALE` pour l’affichage
- `User.preferredLocale` en base pour e-mails webhooks / rappels cron
- Synchronisation cookie → DB à chaque `getOrCreateUser()`

## Contenu à ne pas traduire automatiquement

- Textes des services, blog, podcasts, formations (contenu éditorial coach)
- Interface admin (reste en arabe)

## Checklist avant publication FR

1. Basculer le sélecteur FR sur chaque page publique clé
2. Vérifier RTL/LTR (layout, formulaires, e-mails)
3. Tester un parcours : inscription → réservation → e-mail de confirmation
4. Vérifier pages légales et bannière cookies
