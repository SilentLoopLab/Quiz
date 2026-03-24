import { createQuizDraft } from "../../lib/quizBuilder";
import type {
    QuizBuilderStoreActions,
    QuizBuilderStoreSet,
} from "./types";

export function createQuizBuilderActions(
    set: QuizBuilderStoreSet,
): QuizBuilderStoreActions {
    const setDraftField: QuizBuilderStoreActions["setDraftField"] = (
        field,
        value,
    ) => {
        set((state) => ({
            draft: {
                ...state.draft,
                [field]: value,
            },
            isSettingsSaved: false,
        }));
    };

    return {
        setDraftField,
        saveSettingsDraft: (draft) => {
            set((state) => ({
                ...state,
                draft,
                isSettingsSaved: true,
            }));
        },
        setQuestions: (questions) => {
            set((state) => ({
                ...state,
                questions,
            }));
        },
        startEditSession: ({ draft, questions, quizId }) => {
            set((state) => ({
                ...state,
                draft,
                isSettingsSaved: true,
                mode: "edit",
                editingQuizId: quizId,
                questions,
            }));
        },
        startCreateSession: () => {
            set((state) => ({
                ...state,
                mode: "create",
                editingQuizId: null,
                questions: [],
            }));
        },
        resetDraft: () => {
            set({
                draft: createQuizDraft(),
                isSettingsSaved: false,
                mode: "create",
                editingQuizId: null,
                questions: [],
            });
        },
        setHasHydrated: (value) => {
            set({
                hasHydrated: value,
            });
        },
    };
}
