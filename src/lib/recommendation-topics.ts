export type RecommendationTopic =
  | "stress"
  | "confidence"
  | "couple"
  | "career"
  | "wellbeing"
  | "change";

export const RECOMMENDATION_TOPICS: RecommendationTopic[] = [
  "stress",
  "confidence",
  "couple",
  "career",
  "wellbeing",
  "change",
];

export type JournalMoodId = "happy" | "neutral" | "low";

export const COURSE_TOPIC_MAP: Record<string, RecommendationTopic[]> = {
  "confiance-en-soi": ["confidence"],
  "gestion-stress": ["stress", "wellbeing"],
  "objectifs-vie": ["career", "wellbeing", "change"],
};

export const PODCAST_TOPIC_MAP: Record<string, RecommendationTopic[]> = {
  "meditation-matin": ["stress", "wellbeing"],
  "premiers-pas": ["change", "wellbeing"],
  "affirmation-soi": ["confidence"],
  "relations-saines": ["couple", "wellbeing"],
};

export const SERVICE_TOPIC_MAP: Record<string, RecommendationTopic[]> = {
  individuel: ["wellbeing"],
  couple: ["couple"],
  carriere: ["career"],
  "bien-etre": ["wellbeing", "stress"],
};

export const MOOD_TOPIC_WEIGHTS: Record<
  JournalMoodId,
  Partial<Record<RecommendationTopic, number>>
> = {
  happy: { confidence: 3, change: 2, career: 2, wellbeing: 1 },
  neutral: { wellbeing: 2, career: 2, change: 1.5, confidence: 1 },
  low: { stress: 4, wellbeing: 3, couple: 1.5, confidence: 1 },
};

const TOPIC_KEYWORDS: Record<RecommendationTopic, string[]> = {
  stress: [
    "توتر",
    "ضغط",
    "قلق",
    "stress",
    "anxiété",
    "anxieux",
    "anxieuse",
    "tension",
    "gestion-stress",
    "gestion du stress",
  ],
  confidence: [
    "ثقة",
    "تقدير",
    "confiance",
    "estime",
    "assurance",
    "confiance-en-soi",
  ],
  couple: [
    "زوج",
    "علاق",
    "أزواج",
    "couple",
    "relation",
    "relations",
    "mariage",
    "partenaire",
    "relations-saines",
  ],
  career: [
    "عمل",
    "مهن",
    "وظيف",
    "مهني",
    "carrière",
    "travail",
    "profession",
    "objectif",
    "objectifs",
    "هدف",
    "أهداف",
  ],
  wellbeing: [
    "توازن",
    "رفاه",
    "هدوء",
    "تأمل",
    "bien-être",
    "bien-etre",
    "équilibre",
    "sérénité",
    "calme",
    "meditation",
    "méditation",
  ],
  change: [
    "تغيير",
    "خطوة",
    "خطوات",
    "chang",
    "évolution",
    "transformation",
    "commencer",
    "premiers-pas",
  ],
};

export type ContentTopicMeta = {
  title?: string;
  description?: string;
};

function inferTopicsFromContent(
  slug: string,
  slugMap: Record<string, RecommendationTopic[]>,
  meta?: ContentTopicMeta
): RecommendationTopic[] {
  const text = `${meta?.title ?? ""} ${meta?.description ?? ""} ${slug.replace(/-/g, " ")}`;
  const fromText = extractTopicsFromText(text);
  if (fromText.length > 0) return fromText;

  return slugMap[slug] ?? ["wellbeing"];
}

export function getCourseTopics(
  slug: string,
  storedTopics: string[] = [],
  meta?: ContentTopicMeta
): RecommendationTopic[] {
  const fromDb = parseRecommendationTopics(storedTopics);
  if (fromDb.length > 0) return fromDb;
  return inferTopicsFromContent(slug, COURSE_TOPIC_MAP, meta);
}

export function getPodcastTopics(
  slug: string,
  storedTopics: string[] = [],
  meta?: ContentTopicMeta
): RecommendationTopic[] {
  const fromDb = parseRecommendationTopics(storedTopics);
  if (fromDb.length > 0) return fromDb;
  return inferTopicsFromContent(slug, PODCAST_TOPIC_MAP, meta);
}

/** Déduit les thèmes à enregistrer quand l'admin n'en a pas choisi. */
export function inferCourseTopicsForSave(
  slug: string,
  title: string,
  description: string
): RecommendationTopic[] {
  return inferTopicsFromContent(slug, COURSE_TOPIC_MAP, { title, description });
}

export function inferPodcastTopicsForSave(
  slug: string,
  title: string,
  description: string
): RecommendationTopic[] {
  return inferTopicsFromContent(slug, PODCAST_TOPIC_MAP, { title, description });
}

export function parseRecommendationTopics(
  values: string[]
): RecommendationTopic[] {
  const allowed = new Set<RecommendationTopic>(RECOMMENDATION_TOPICS);
  return values.filter((value): value is RecommendationTopic =>
    allowed.has(value as RecommendationTopic)
  );
}

export function getServiceTopics(slug: string): RecommendationTopic[] {
  return SERVICE_TOPIC_MAP[slug] ?? ["wellbeing"];
}

export function extractTopicsFromText(text: string): RecommendationTopic[] {
  const normalized = text.toLowerCase();
  const found = new Set<RecommendationTopic>();

  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS) as [
    RecommendationTopic,
    string[],
  ][]) {
    if (keywords.some((keyword) => normalized.includes(keyword.toLowerCase()))) {
      found.add(topic);
    }
  }

  return [...found];
}

export function addTopicWeights(
  weights: Partial<Record<RecommendationTopic, number>>,
  topics: RecommendationTopic[],
  amount: number
) {
  for (const topic of topics) {
    weights[topic] = (weights[topic] ?? 0) + amount;
  }
}

export function normalizeMoodId(value: string | null | undefined): JournalMoodId | null {
  if (value === "happy" || value === "neutral" || value === "low") {
    return value;
  }
  return null;
}

export function getTopTopic(
  weights: Partial<Record<RecommendationTopic, number>>
): RecommendationTopic | null {
  const entries = Object.entries(weights).filter(([, value]) => (value ?? 0) > 0) as [
    RecommendationTopic,
    number,
  ][];
  if (entries.length === 0) return null;
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}
