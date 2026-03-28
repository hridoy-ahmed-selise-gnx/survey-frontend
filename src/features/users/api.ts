import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { ApiResponse, PagedRequest } from "@/types/api";
import type { UserDto, UserStatus } from "@/types/auth";

export function useUsers(params: PagedRequest = {}) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<UserDto[]>>("/users", {
        params: { page: params.page ?? 1, limit: params.limit ?? 20, search: params.search },
      });
      return data;
    },
  });
}

interface CreateUserRequest {
  readonly employeeId: string;
  readonly email: string;
  readonly fullName: string;
  readonly password: string;
  readonly roleIds: readonly string[];
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: CreateUserRequest) => {
      const { data } = await apiClient.post<ApiResponse<UserDto>>("/users", request);
      if (!data.success) throw new Error(data.error ?? "Failed to create user");
      return data.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: UserStatus }) => {
      const { data } = await apiClient.patch<ApiResponse<UserDto>>(
        `/users/${userId}/status`,
        { userId, status }
      );
      if (!data.success) throw new Error(data.error ?? "Failed to update user status");
      return data.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
