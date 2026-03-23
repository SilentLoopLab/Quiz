import { getStoredAuthToken } from "../../lib/authStorage";
import { getApiErrorDetails } from "../../services/api";
import { authService } from "../../services/auth.service";
import {
    getAuthenticatedState,
    getAuthenticatedUserState,
    getHydratedLoggedOutState,
} from "./state";
import { normalizePremiumUser } from "../../lib/premium";
import type { AuthStoreActions, AuthStoreGet, AuthStoreSet } from "./types";

function getSessionToken(get: AuthStoreGet): string | null {
    return get().token ?? getStoredAuthToken();
}

function throwActionError(set: AuthStoreSet, error: unknown): never {
    const { message } = getApiErrorDetails(error);

    set({
        isLoading: false,
        hasHydrated: true,
    });

    throw new Error(message);
}

async function authenticate(
    set: AuthStoreSet,
    execute: () => ReturnType<typeof authService.login>,
) {
    set({ isLoading: true });

    try {
        const authData = await execute();
        set(getAuthenticatedState(authData));

        return authData;
    } catch (error) {
        return throwActionError(set, error);
    }
}

export function createAuthActions(
    set: AuthStoreSet,
    get: AuthStoreGet,
): AuthStoreActions {
    return {
        setCurrentUser: (user) => {
            const token = getSessionToken(get);

            if (!token) {
                set({
                    user: normalizePremiumUser(user),
                    isAuth: true,
                    isLoading: false,
                    hasHydrated: true,
                });

                return;
            }

            set(getAuthenticatedUserState(user, token));
        },

        setHasHydrated: (value) => {
            set({ hasHydrated: value });
        },

        syncTokenFromStorage: () => {
            const storedToken = getStoredAuthToken();

            if (!storedToken) {
                set(getHydratedLoggedOutState());
                return;
            }

            const { hasHydrated, token } = get();

            if (token === storedToken && hasHydrated) {
                return;
            }

            set({
                token: storedToken,
                isAuth: true,
                hasHydrated: true,
            });
        },

        login: async (payload) =>
            authenticate(set, () => authService.login(payload)),

        loginWithGoogle: async (token) =>
            authenticate(set, () => authService.loginWithGoogle(token)),

        register: async (payload) =>
            authenticate(set, () => authService.register(payload)),

        logout: async () => {
            set({ isLoading: true });

            try {
                await authService.logout();
            } catch {
                // Local logout should still complete even if the server is unavailable.
            } finally {
                set(getHydratedLoggedOutState());
            }
        },

        getMe: async () => {
            const token = getSessionToken(get);

            if (!token) {
                set(getHydratedLoggedOutState());
                return null;
            }

            set({ isLoading: true });

            try {
                const user = await authService.getMe();

                set(
                    getAuthenticatedUserState(
                        user,
                        getStoredAuthToken() ?? token,
                    ),
                );

                return user;
            } catch {
                set(getHydratedLoggedOutState());
                return null;
            }
        },

        updateProfile: async (payload) => {
            const token = getSessionToken(get);

            if (!token) {
                throw new Error("Unauthorized");
            }

            set({ isLoading: true });

            try {
                const user = await authService.updateProfile(payload);

                set(
                    getAuthenticatedUserState(
                        user,
                        getStoredAuthToken() ?? token,
                    ),
                );

                return user;
            } catch (error) {
                return throwActionError(set, error);
            }
        },
    };
}
