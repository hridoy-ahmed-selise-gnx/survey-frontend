import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import type { SurveyDetailDto } from "@/types/survey";
import type { SubmitResponseRequest, ResponseDto } from "@/types/public-survey";

export function usePublicSurvey(code: string) {
  return useQuery({
    queryKey: ["public-survey", code],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<SurveyDetailDto>>(
        `/public/surveys/${code}`
      );
      return data;
    },
    enabled: !!code,
    retry: false,
  });
}

export function useSubmitPublicResponse(surveyId: string) {
  return useMutation({
    mutationFn: async (request: SubmitResponseRequest) => {
      const { data } = await apiClient.post<ApiResponse<ResponseDto>>(
        `/surveys/${surveyId}/responses`,
        request
      );
      if (!data.success) throw new Error(data.error ?? "Failed to submit response");
      return data.data!;
    },
  });
}
