"use client";

import { create } from "zustand";
import {
    createJSONStorage,
    persist,
    type PersistOptions,
} from "zustand/middleware";
import { QUIZ_BUILDER_STORAGE_KEY } from "../../lib/quizBuilder";
import { createQuizBuilderActions } from "./actions";
import {
    hydratePersistedDraft,
    hydratePersistedQuestions,
    serializeQuestionDrafts,
} from "./persistence";
import { initialState } from "./state";
import type { QuizBuilderStore } from "./types";

type PersistedQuizBuilderStore = Pick<
    QuizBuilderStore,
    "draft" | "editingQuizId" | "isSettingsSaved" | "mode" | "questions"
>;

const quizBuilderPersistOptions: PersistOptions<
    QuizBuilderStore,
    PersistedQuizBuilderStore
> = {
    name: QUIZ_BUILDER_STORAGE_KEY,
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({
        draft: hydratePersistedDraft(state.draft),
        editingQuizId: state.editingQuizId,
        isSettingsSaved: state.isSettingsSaved,
        mode: state.mode,
        questions: serializeQuestionDrafts(state.questions),
    }),
    merge: (persistedState, currentState) => {
        const persistedQuizBuilderState =
            (persistedState as Partial<PersistedQuizBuilderStore> | undefined) ??
            {};

        return {
            ...currentState,
            draft: hydratePersistedDraft(persistedQuizBuilderState.draft),
            editingQuizId: persistedQuizBuilderState.editingQuizId ?? null,
            isSettingsSaved:
                persistedQuizBuilderState.isSettingsSaved ??
                currentState.isSettingsSaved,
            mode: persistedQuizBuilderState.mode ?? currentState.mode,
            questions: hydratePersistedQuestions(
                persistedQuizBuilderState.questions,
            ),
        };
    },
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
