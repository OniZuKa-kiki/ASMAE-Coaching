import "server-only";

import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import {
  inferCourseTopicsForSave,
  inferPodcastTopicsForSave,
  parseRecommendationTopics,
  RECOMMENDATION_TOPICS,
  type RecommendationTopic,
} from "@/lib/recommendation-topics";

const DEFAULT_GEMINI_MODEL = "gemini-3-flash-preview";

const geminiTopicsSchema = z.object({
  topics: z
    .array(
      z.enum([
        "stress",
        "confidence",
        "couple",
        "career",
        "wellbeing",
        "change",
      ])
    )
    .min(1)
    .max(3),
});

export type GeminiContentKind = "course" | "podcast";

export type GeminiTopicInput = {
  slug: string;
  title: string;
  description: string;
  contentKind: GeminiContentKind;
};

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

export function isGeminiTopicsEnabled() {
  if (process.env.USE_LLM_TOPICS === "false") return false;
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

function getGeminiModel() {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
}

function buildTopicPrompt(input: GeminiTopicInput) {
  const allowed = RECOMMENDATION_TOPICS.join(", ");
  const contentLabel = input.contentKind === "course" ? "formation" : "podcast";

  return `Tu es un classificateur de contenu pour une plateforme de coaching de vie (public arabe et français).

Analyse ce ${contentLabel} et choisis entre 1 et 3 thèmes parmi cette liste EXCLUSIVE :
${allowed}

Règles :
- Réponds UNIQUEMENT en JSON valide, sans markdown.
- Format exact : {"topics":["theme1","theme2"]}
- Utilise seulement les identifiants anglais de la liste.
- Base-toi sur le sens global (titre, description, slug), pas sur des mots isolés hors contexte.

Slug : ${input.slug}
Titre : ${input.title}
Description : ${input.description}`;
}

function extractJsonObject(text: string): string | null {
  const trimmed = text.trim();
  if (trimmed.startsWith("{")) return trimmed;

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return trimmed.slice(start, end + 1);
  }

  return null;
}

export async function inferTopicsWithGemini(
  input: GeminiTopicInput
): Promise<RecommendationTopic[] | null> {
  if (!isGeminiTopicsEnabled()) return null;

  const client = getGeminiClient();
  if (!client) return null;

  try {
    const response = await client.models.generateContent({
      model: getGeminiModel(),
      contents: buildTopicPrompt(input),
      config: {
        temperature: 0.2,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
      },
    });

    const rawText = response.text?.trim();
    if (!rawText) return null;

    const jsonText = extractJsonObject(rawText);
    if (!jsonText) return null;

    const parsed = geminiTopicsSchema.safeParse(JSON.parse(jsonText));
    if (!parsed.success) return null;

    return parseRecommendationTopics(parsed.data.topics);
  } catch (error) {
    console.error("[recommendation-llm] Gemini topic inference failed:", error);
    return null;
  }
}

export async function resolveCourseTopicsWithLlm(
  slug: string,
  title: string,
  description: string,
  manualTopics: RecommendationTopic[]
): Promise<RecommendationTopic[]> {
  if (manualTopics.length > 0) return manualTopics;

  const llmTopics = await inferTopicsWithGemini({
    slug,
    title,
    description,
    contentKind: "course",
  });
  if (llmTopics && llmTopics.length > 0) return llmTopics;

  return inferCourseTopicsForSave(slug, title, description);
}

export async function resolvePodcastTopicsWithLlm(
  slug: string,
  title: string,
  description: string,
  manualTopics: RecommendationTopic[]
): Promise<RecommendationTopic[]> {
  if (manualTopics.length > 0) return manualTopics;

  const llmTopics = await inferTopicsWithGemini({
    slug,
    title,
    description,
    contentKind: "podcast",
  });
  if (llmTopics && llmTopics.length > 0) return llmTopics;

  return inferPodcastTopicsForSave(slug, title, description);
}
