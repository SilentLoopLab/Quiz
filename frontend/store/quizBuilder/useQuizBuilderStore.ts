"use client";

import { create } from "zustand";
import {
    createJSONStorage,
    persist,
    type PersistOptions,
} from "zustand/middleware";
import { QUIZ_BUILDER_STORAGE_KEY } from "../../lib/quizBuilder";
import { createQuizBuilderActions } from "./actions";
import { initialState } from "./state";
import type { QuizBuilderStore } from "./types";

type PersistedQuizBuilderStore = Pick<QuizBuilderStore, "draft">;

const quizBuilderPersistOptions: PersistOptions<
    QuizBuilderStore,
    PersistedQuizBuilderStore
> = {
    name: QUIZ_BUILDER_STORAGE_KEY,
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({
        draft: state.draft,
    }),
    onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
    },
};

export const useQuizBuilderStore = create<QuizBuilderStore>()(
    persist(
        (set) => ({
            ...initialState,
            ...createQuizBuilderActions(set),
        }),
        quizBuilderPersistOptions,
    ),
);
