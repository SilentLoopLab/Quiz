import type { StoreApi } from "zustand";
import type {
    QuizDraft,
    QuizEditorMode,
    QuizQuestionDraft,
} from "../../types/quiz.types";

export interface QuizBuilderState {
    draft: QuizDraft;
    hasHydrated: boolean;
    isSettingsSaved: boolean;
    mode: QuizEditorMode;
    editingQuizId: string | null;
    questions: QuizQuestionDraft[];
}

export interface QuizBuilderStoreActions {
    setDraftField: <Field extends keyof QuizDraft>(
        field: Field,
        value: QuizDraft[Field],
    ) => void;
    saveSettingsDraft: (draft: QuizDraft) => void;
    setQuestions: (questions: QuizQuestionDraft[]) => void;
    startEditSession: (options: {
        draft: QuizDraft;
        questions: QuizQuestionDraft[];
        quizId: string;
    }) => void;
    startCreateSession: () => void;
    resetDraft: () => void;
    setHasHydrated: (value: boolean) => void;
}

export type QuizBuilderStore = QuizBuilderState & QuizBuilderStoreActions;

export type QuizBuilderStoreSet = StoreApi<QuizBuilderStore>["setState"];
