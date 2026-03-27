export interface LoginRequest {
  readonly email: string;
  readonly password: string;
}

export interface LoginResponse {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresAt: string;
  readonly user: UserInfo;
}

export interface UserInfo {
  readonly id: string;
  readonly email: string;
  readonly fullName: string;
  readonly roles: readonly string[];
}

export type UserStatus = "Active" | "Inactive" | "Locked" | "PendingApproval";

export interface UserDto {
  readonly id: string;
  readonly employeeId: string;
  readonly email: string;
  readonly fullName: string;
  readonly status: UserStatus;
  readonly lastLoginAt: string | null;
  readonly roles: readonly string[];
  readonly createdAt: string;
}

export type SystemRole = "Administrator" | "SurveyCreator" | "Viewer";
