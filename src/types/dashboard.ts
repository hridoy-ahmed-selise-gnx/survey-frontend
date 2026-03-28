export interface DashboardStatsDto {
  readonly totalSurveys: number;
  readonly activeSurveys: number;
  readonly totalResponses: number;
  readonly completedResponses: number;
  readonly completionRate: number;
  readonly totalParticipants: number;
  readonly statusBreakdown: readonly SurveyStatusBreakdown[];
  readonly recentActivity: readonly RecentActivityDto[];
}

export interface SurveyStatusBreakdown {
  readonly status: string;
  readonly count: number;
}

export interface RecentActivityDto {
  readonly surveyId: string;
  readonly surveyTitle: string;
  readonly uniqueCode: string;
  readonly status: string;
  readonly responseCount: number;
  readonly questionCount: number;
  readonly createdAt: string;
  readonly publishedAt: string | null;
}

export interface SurveyAnalyticsDto {
  readonly surveyId: string;
  readonly title: string;
  readonly status: string;
  readonly totalResponses: number;
  readonly completedResponses: number;
  readonly abandonedResponses: number;
  readonly completionRate: number;
  readonly averageTimeMs: number | null;
  readonly responsesByDate: readonly ResponsesByDateDto[];
  readonly responsesBySource: readonly ResponsesBySourceDto[];
  readonly questionAnalytics: readonly QuestionAnalyticsDto[];
}

export interface ResponsesByDateDto {
  readonly date: string;
  readonly count: number;
}

export interface ResponsesBySourceDto {
  readonly source: string;
  readonly count: number;
}

export interface QuestionAnalyticsDto {
  readonly questionId: string;
  readonly title: string;
  readonly type: string;
  readonly totalAnswers: number;
  readonly averageTimeMs: number | null;
  readonly optionDistribution: readonly OptionDistributionDto[];
}

export interface OptionDistributionDto {
  readonly label: string;
  readonly count: number;
  readonly percentage: number;
}
