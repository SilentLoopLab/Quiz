import { AUTH_STORAGE_KEY } from "../store/authStore";

interface PersistedAuthState {
    state?: {
        token?: string | null;
    };
}

export function getStoredAuthToken(): string | null {
    if (typeof window === "undefined") {
        return null;
    }

    const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY);

    if (!rawValue) {
        return null;
    }

    try {
        const parsedValue = JSON.parse(rawValue) as PersistedAuthState;
        return parsedValue.state?.token ?? null;
    } catch {
        return null;
    }
}
