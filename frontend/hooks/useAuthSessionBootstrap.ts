"use client";

import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";

export function useAuthSessionBootstrap() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const getMe = useAuthStore((state) => state.getMe);

  useEffect(() => {
    if (!token || user) {
      return;
    }

    void getMe();
  }, [getMe, token, user]);
}
