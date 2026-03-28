import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import type { DashboardStatsDto, SurveyAnalyticsDto } from "@/types/dashboard";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<DashboardStatsDto>>(
        "/dashboard/stats"
      );
      return data;
    },
  });
}

export function useSurveyAnalytics(surveyId: string) {
  return useQuery({
    queryKey: ["dashboard", "analytics", surveyId],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<SurveyAnalyticsDto>>(
        `/dashboard/surveys/${surveyId}/analytics`
      );
      return data;
    },
    enabled: !!surveyId,
  });
}
