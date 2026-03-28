import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { ApiResponse, PagedRequest } from "@/types/api";
import type {
  SurveyDto,
  SurveyDetailDto,
  CreateSurveyRequest,
  CreateQuestionRequest,
  QuestionDto,
} from "@/types/survey";

export function useSurveys(params: PagedRequest = {}) {
  return useQuery({
    queryKey: ["surveys", params],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<SurveyDto[]>>("/surveys", {
        params: { page: params.page ?? 1, limit: params.limit ?? 20, search: params.search },
      });
      return data;
    },
  });
}

export function useSurvey(id: string) {
  return useQuery({
    queryKey: ["surveys", id],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<SurveyDetailDto>>(`/surveys/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateSurvey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: CreateSurveyRequest) => {
      const { data } = await apiClient.post<ApiResponse<SurveyDto>>("/surveys", request);
      if (!data.success) throw new Error(data.error ?? "Failed to create survey");
      return data.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["surveys"] });
    },
  });
}

export function usePublishSurvey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post<ApiResponse<SurveyDto>>(`/surveys/${id}/publish`);
      if (!data.success) throw new Error(data.error ?? "Failed to publish survey");
      return data.data!;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["surveys"] });
      queryClient.invalidateQueries({ queryKey: ["surveys", id] });
    },
  });
}

export function useCloseSurvey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post<ApiResponse<SurveyDto>>(`/surveys/${id}/close`);
      if (!data.success) throw new Error(data.error ?? "Failed to close survey");
      return data.data!;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["surveys"] });
      queryClient.invalidateQueries({ queryKey: ["surveys", id] });
    },
  });
}

export function useDeleteSurvey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete<ApiResponse<boolean>>(`/surveys/${id}`);
      if (!data.success) throw new Error(data.error ?? "Failed to delete survey");
      return data.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["surveys"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useCreateQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: CreateQuestionRequest) => {
      const { data } = await apiClient.post<ApiResponse<QuestionDto>>(
        `/surveys/${request.surveyId}/questions`,
        request
      );
      if (!data.success) throw new Error(data.error ?? "Failed to create question");
      return data.data!;
    },
    onSuccess: (_, request) => {
      queryClient.invalidateQueries({ queryKey: ["surveys", request.surveyId] });
    },
  });
}
