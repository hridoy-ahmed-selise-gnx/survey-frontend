import { create } from "zustand";
import type { UserInfo } from "@/types/auth";

interface AuthState {
  readonly user: UserInfo | null;
  readonly isAuthenticated: boolean;
  readonly setAuth: (user: UserInfo, accessToken: string, refreshToken: string) => void;
  readonly logout: () => void;
  readonly hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
    localStorage.setItem("user", JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    set({ user: null, isAuthenticated: false });
  },

  hydrate: () => {
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("access_token");
    if (userStr && token) {
      try {
        const user = JSON.parse(userStr) as UserInfo;
        set({ user, isAuthenticated: true });
      } catch {
        set({ user: null, isAuthenticated: false });
      }
    }
  },
}));
