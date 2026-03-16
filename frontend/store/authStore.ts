"use client";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { authService } from "../services/auth.service";
import { getApiErrorDetails } from "../services/api";
import type {
    AuthResponse,
    AuthState,
    LoginDto,
    RegisterDto,
    User,
} from "../types/auth.types";

const AUTH_STORAGE_KEY = "quizz-auth-storage";

interface AuthStore extends AuthState {
    login: (payload: LoginDto) => Promise<AuthResponse>;
    loginWithGoogle: (token: string) => Promise<AuthResponse>;
    register: (payload: RegisterDto) => Promise<AuthResponse>;
    logout: () => void;
    getMe: () => Promise<User | null>;
}

const initialState: AuthState = {
    user: null,
    token: null,
    isAuth: false,
    isLoading: false,
};

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            ...initialState,

            login: async (payload) => {
                set({ isLoading: true });

                try {
                    const authData = await authService.login(payload);

                    set({
                        user: authData.user,
                        token: authData.token,
                        isAuth: true,
                        isLoading: false,
                    });

                    return authData;
                } catch (error) {
                    const { message } = getApiErrorDetails(error);

                    set({
                        isLoading: false,
                    });

                    throw new Error(message);
                }
            },

            loginWithGoogle: async (token) => {
                set({ isLoading: true });

                try {
                    const authData = await authService.loginWithGoogle(token);

                    set({
                        user: authData.user,
                        token: authData.token,
                        isAuth: true,
                        isLoading: false,
                    });

                    return authData;
                } catch (error) {
                    const { message } = getApiErrorDetails(error);

                    set({
                        isLoading: false,
                    });

                    throw new Error(message);
                }
            },

            register: async (payload) => {
                set({ isLoading: true });

                try {
                    const authData = await authService.register(payload);

                    set({
                        user: authData.user,
                        token: authData.token,
                        isAuth: true,
                        isLoading: false,
                    });

                    return authData;
                } catch (error) {
                    const { message } = getApiErrorDetails(error);

                    set({
                        isLoading: false,
                    });

                    throw new Error(message);
                }
            },

            logout: () => {
                set(initialState);
            },

            getMe: async () => {
                const { token } = get();

                if (!token) {
                    set({
                        user: null,
                        isAuth: false,
                        isLoading: false,
                    });

                    return null;
                }

                set({ isLoading: true });

                try {
                    const user = await authService.getMe(token);

                    set({
                        user,
                        isAuth: true,
                        isLoading: false,
                    });

                    return user;
                } catch {
                    set({
                        ...initialState,
                    });

                    return null;
                }
            },
        }),
        {
            name: AUTH_STORAGE_KEY,
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                token: state.token,
            }),
        },
    ),
);
