export type RecommendationSource = "DASHBOARD" | "COURSES" | "PODCASTS";

export type RecommendationEntityType = "COURSE" | "PODCAST";

export type RecordRecommendationClickPayload = {
  entityType: RecommendationEntityType;
  entityId: string;
  source: RecommendationSource;
  reasonKey?: string;
};
