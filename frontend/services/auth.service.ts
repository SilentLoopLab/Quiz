import {
    api,
    withAuthRequest,
    withSkippedAuthRefresh,
} from "./api";
import type {
    AuthResponse,
    LoginDto,
    RegisterDto,
    UpdateProfileDto,
    User,
} from "../types/auth.types";

type MeResponse = User | { user: User };

function normalizeMeResponse(data: MeResponse): User {
    if ("user" in data) {
        return data.user;
    }

    return data;
}

export const authService = {
    async register(payload: RegisterDto): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>(
            "/api/auth/register",
            payload,
        );
        return response.data;
    },

    async login(payload: LoginDto): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>(
            "/api/auth/login",
            payload,
        );
        return response.data;
    },

    async loginWithGoogle(code: string): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>("/api/auth/google", {
            code,
        });
        return response.data;
    },

    async getMe(): Promise<User> {
        const response = await api.get<MeResponse>(
            "/api/auth/me",
            withAuthRequest(),
        );

        return normalizeMeResponse(response.data);
    },

    async updateProfile(payload: UpdateProfileDto): Promise<User> {
        const response = await api.patch<MeResponse>(
            "/api/auth/me",
            payload,
            withAuthRequest(),
        );

        return normalizeMeResponse(response.data);
    },

    async logout(): Promise<{ message: string }> {
        const response = await api.post<{ message: string }>(
            "/api/auth/logout",
            undefined,
            withSkippedAuthRefresh(),
        );

        return response.data;
    },
};
