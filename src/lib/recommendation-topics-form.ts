import {
  inferCourseTopicsForSave,
  inferPodcastTopicsForSave,
  parseRecommendationTopics,
  RECOMMENDATION_TOPICS,
  type RecommendationTopic,
} from "@/lib/recommendation-topics";
import {
  resolveCourseTopicsWithLlm,
  resolvePodcastTopicsWithLlm,
} from "@/lib/recommendation-llm";

export function parseRecommendationTopicsFromForm(
  formData: FormData
): RecommendationTopic[] {
  const values = formData.getAll("topics").map((value) => String(value));
  return parseRecommendationTopics(values);
}

export async function resolveCourseTopicsForSave(
  slug: string,
  title: string,
  description: string,
  manualTopics: RecommendationTopic[]
): Promise<RecommendationTopic[]> {
  return resolveCourseTopicsWithLlm(slug, title, description, manualTopics);
}

export async function resolvePodcastTopicsForSave(
  slug: string,
  title: string,
  description: string,
  manualTopics: RecommendationTopic[]
): Promise<RecommendationTopic[]> {
  return resolvePodcastTopicsWithLlm(slug, title, description, manualTopics);
}

/** Résolution synchrone (mots-clés) — utilisée si besoin sans LLM. */
export function resolveCourseTopicsFallback(
  slug: string,
  title: string,
  description: string,
  manualTopics: RecommendationTopic[]
): RecommendationTopic[] {
  if (manualTopics.length > 0) return manualTopics;
  return inferCourseTopicsForSave(slug, title, description);
}

export function resolvePodcastTopicsFallback(
  slug: string,
  title: string,
  description: string,
  manualTopics: RecommendationTopic[]
): RecommendationTopic[] {
  if (manualTopics.length > 0) return manualTopics;
  return inferPodcastTopicsForSave(slug, title, description);
}

export function serializeRecommendationTopics(
  topics: RecommendationTopic[]
): string {
  return topics.join(", ");
}

export function formatRecommendationTopicLabels(
  topicIds: string[],
  options: { id: string; label: string }[]
): string {
  const labels = new Map(options.map((option) => [option.id, option.label]));
  return topicIds.map((id) => labels.get(id) ?? id).join(" · ");
}

export { RECOMMENDATION_TOPICS };
