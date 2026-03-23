import type { StoreApi } from "zustand";
import type { QuizDraft } from "../../types/quiz.types";

export interface QuizBuilderState {
    draft: QuizDraft;
    hasHydrated: boolean;
}

export interface QuizBuilderStoreActions {
    setDraftField: <Field extends keyof QuizDraft>(
        field: Field,
        value: QuizDraft[Field],
    ) => void;
    resetDraft: () => void;
    setHasHydrated: (value: boolean) => void;
}

export type QuizBuilderStore = QuizBuilderState & QuizBuilderStoreActions;

export type QuizBuilderStoreSet = StoreApi<QuizBuilderStore>["setState"];
