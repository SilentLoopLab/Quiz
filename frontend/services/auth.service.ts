import { api } from "./api";
import type {
  AuthResponse,
  LoginDto,
  RegisterDto,
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
    const response = await api.post<AuthResponse>("/api/auth/register", payload);
    return response.data;
  },

  async login(payload: LoginDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/api/auth/login", payload);
    return response.data;
  },

  async loginWithGoogle(code: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/api/auth/google", { code });
    return response.data;
  },

  async getMe(token: string): Promise<User> {
    const response = await api.get<MeResponse>("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return normalizeMeResponse(response.data);
  },
};
