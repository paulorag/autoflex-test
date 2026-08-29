import api from "./api";
import type { AuthResponse, AuthUser, LoginRequest, RegisterRequest } from "../types";

export const authService = {
    async login(data: LoginRequest): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>("/auth/login", data);
        const { token, id, username, name, role } = response.data;
        localStorage.setItem("autoflex_token", token);
        localStorage.setItem(
            "autoflex_user",
            JSON.stringify({ id, username, name, role })
        );
        window.dispatchEvent(new Event("autoflex_auth_change"));
        return response.data;
    },

    async register(data: RegisterRequest): Promise<AuthUser> {
        const response = await api.post<AuthUser>("/auth/register", data);
        return response.data;
    },

    async getCurrentUser(): Promise<AuthUser> {
        const response = await api.get<AuthUser>("/auth/me");
        return response.data;
    },

    getStoredUser(): AuthUser | null {
        const userStr = localStorage.getItem("autoflex_user");
        if (!userStr) return null;
        try {
            return JSON.parse(userStr) as AuthUser;
        } catch {
            return null;
        }
    },

    getStoredToken(): string | null {
        return localStorage.getItem("autoflex_token");
    },

    logout(): void {
        localStorage.removeItem("autoflex_token");
        localStorage.removeItem("autoflex_user");
        window.dispatchEvent(new Event("autoflex_auth_change"));
    }
};
