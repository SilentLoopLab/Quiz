"use client";

import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";

export function useAuthSessionBootstrap() {
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const getMe = useAuthStore((state) => state.getMe);

  useEffect(() => {
    if (!hasHydrated || !token || user) {
      return;
    }

    void getMe();
  }, [getMe, hasHydrated, token, user]);
}
