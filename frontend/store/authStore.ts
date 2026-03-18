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
    UpdateProfileDto,
    User,
} from "../types/auth.types";

export const AUTH_STORAGE_KEY = "quizz-auth-storage";

interface AuthStore extends AuthState {
    login: (payload: LoginDto) => Promise<AuthResponse>;
    loginWithGoogle: (token: string) => Promise<AuthResponse>;
    register: (payload: RegisterDto) => Promise<AuthResponse>;
    logout: () => void;
    getMe: () => Promise<User | null>;
    updateProfile: (payload: UpdateProfileDto) => Promise<User>;
    setHasHydrated: (value: boolean) => void;
}

const initialAuthState = {
    user: null,
    token: null,
    isAuth: false,
    isLoading: false,
};

const initialState: AuthState = {
    ...initialAuthState,
    hasHydrated: false,
};

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            ...initialState,

            setHasHydrated: (value) => {
                set({ hasHydrated: value });
            },

            login: async (payload) => {
                set({ isLoading: true });

                try {
                    const authData = await authService.login(payload);

                    set({
                        user: authData.user,
                        token: authData.token,
                        isAuth: true,
                        isLoading: false,
                        hasHydrated: true,
                    });

                    return authData;
                } catch (error) {
                    const { message } = getApiErrorDetails(error);

                    set({
                        isLoading: false,
                        hasHydrated: true,
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
                        hasHydrated: true,
                    });

                    return authData;
                } catch (error) {
                    const { message } = getApiErrorDetails(error);

                    set({
                        isLoading: false,
                        hasHydrated: true,
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
                        hasHydrated: true,
                    });

                    return authData;
                } catch (error) {
                    const { message } = getApiErrorDetails(error);

                    set({
                        isLoading: false,
                        hasHydrated: true,
                    });

                    throw new Error(message);
                }
            },

            logout: () => {
                set({
                    ...initialAuthState,
                    hasHydrated: true,
                });
            },

            getMe: async () => {
                const { token } = get();

                if (!token) {
                    set({
                        ...initialAuthState,
                        hasHydrated: true,
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
                        hasHydrated: true,
                    });

                    return user;
                } catch {
                    set({
                        ...initialAuthState,
                        hasHydrated: true,
                    });

                    return null;
                }
            },

            updateProfile: async (payload) => {
                const { token } = get();

                if (!token) {
                    throw new Error("Unauthorized");
                }

                set({ isLoading: true });

                try {
                    const user = await authService.updateProfile(
                        token,
                        payload,
                    );

                    set({
                        user,
                        isAuth: true,
                        isLoading: false,
                        hasHydrated: true,
                    });

                    return user;
                } catch (error) {
                    const { message } = getApiErrorDetails(error);

                    set({
                        isLoading: false,
                        hasHydrated: true,
                    });

                    throw new Error(message);
                }
            },
        }),
        {
            name: AUTH_STORAGE_KEY,
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                token: state.token,
            }),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        },
    ),
);
