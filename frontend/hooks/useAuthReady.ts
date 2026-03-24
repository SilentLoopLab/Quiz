"use client";

import { useAuthStore } from "../store/authStore";

export function useAuthReady() {
    const hasHydrated = useAuthStore((state) => state.hasHydrated);
    const token = useAuthStore((state) => state.token);
    const user = useAuthStore((state) => state.user);
    const isLoading = useAuthStore((state) => state.isLoading);

    return hasHydrated && Boolean(token) && Boolean(user) && !isLoading;
}
