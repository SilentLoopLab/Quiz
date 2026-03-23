import type { AuthResponse, AuthState, User } from "../../types/auth.types";
import { normalizePremiumUser } from "../../lib/premium";

type BaseAuthState = Pick<
    AuthState,
    "user" | "token" | "isAuth" | "isLoading"
>;

export const initialAuthState: BaseAuthState = {
    user: null,
    token: null,
    isAuth: false,
    isLoading: false,
};

export const initialState: AuthState = {
    ...initialAuthState,
    hasHydrated: false,
};

export function getHydratedLoggedOutState(): AuthState {
    return {
        ...initialAuthState,
        hasHydrated: true,
    };
}

export function getAuthenticatedState(authData: AuthResponse): AuthState {
    return {
        user: normalizePremiumUser(authData.user),
        token: authData.token,
        isAuth: true,
        isLoading: false,
        hasHydrated: true,
    };
}

export function getAuthenticatedUserState(
    user: User,
    token: string,
): AuthState {
    return {
        user: normalizePremiumUser(user),
        token,
        isAuth: true,
        isLoading: false,
        hasHydrated: true,
    };
}
