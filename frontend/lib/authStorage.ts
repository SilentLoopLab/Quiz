export const AUTH_STORAGE_KEY = "quizz-auth-storage";
export const AUTH_TOKEN_SYNC_EVENT = "quizz-auth-token-sync";

interface PersistedAuthState {
    state?: {
        token?: string | null;
    };
    version?: number;
}

function readPersistedAuthState(): PersistedAuthState | null {
    if (typeof window === "undefined") {
        return null;
    }

    const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY);

    if (!rawValue) {
        return null;
    }

    try {
        return JSON.parse(rawValue) as PersistedAuthState;
    } catch {
        return null;
    }
}

function notifyAuthTokenSync() {
    if (typeof window === "undefined") {
        return;
    }

    window.dispatchEvent(new Event(AUTH_TOKEN_SYNC_EVENT));
}

export function getStoredAuthToken(): string | null {
    return readPersistedAuthState()?.state?.token ?? null;
}

export function setStoredAuthToken(token: string | null) {
    if (typeof window === "undefined") {
        return;
    }

    const persistedAuthState = readPersistedAuthState();
    const nextPersistedAuthState: PersistedAuthState = {
        ...persistedAuthState,
        state: {
            ...persistedAuthState?.state,
            token,
        },
    };

    window.localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify(nextPersistedAuthState),
    );
    notifyAuthTokenSync();
}

export function clearStoredAuthToken() {
    setStoredAuthToken(null);
}
