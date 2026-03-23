"use client";

import { create } from "zustand";
import {
    createJSONStorage,
    persist,
    type PersistOptions,
} from "zustand/middleware";
import { AUTH_STORAGE_KEY } from "../../lib/authStorage";
import { createAuthActions } from "./actions";
import { initialState } from "./state";
import type { AuthStore } from "./types";

type PersistedAuthStore = Pick<AuthStore, "token">;

const authPersistOptions: PersistOptions<AuthStore, PersistedAuthStore> = {
    name: AUTH_STORAGE_KEY,
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({
        token: state.token,
    }),
    onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
    },
};

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            ...initialState,
            ...createAuthActions(set, get),
        }),
        authPersistOptions,
    ),
);
