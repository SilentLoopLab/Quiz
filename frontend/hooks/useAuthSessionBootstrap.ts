"use client";

import { useEffect } from "react";
import { AUTH_TOKEN_SYNC_EVENT } from "../lib/authStorage";
import { useAuthStore } from "../store/authStore";

export function useAuthSessionBootstrap() {
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const getMe = useAuthStore((state) => state.getMe);
  const syncTokenFromStorage = useAuthStore((state) => state.syncTokenFromStorage);

  useEffect(() => {
    function handleTokenSync() {
      syncTokenFromStorage();
    }

    window.addEventListener(AUTH_TOKEN_SYNC_EVENT, handleTokenSync);
    window.addEventListener("storage", handleTokenSync);

    return () => {
      window.removeEventListener(AUTH_TOKEN_SYNC_EVENT, handleTokenSync);
      window.removeEventListener("storage", handleTokenSync);
    };
  }, [syncTokenFromStorage]);

  useEffect(() => {
    if (!hasHydrated || !token || user) {
      return;
    }

    void getMe();
  }, [getMe, hasHydrated, token, user]);
}
