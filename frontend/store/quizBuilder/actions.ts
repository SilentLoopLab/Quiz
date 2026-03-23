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
        }));
    };

    return {
        setDraftField,
        resetDraft: () => {
            set({
                draft: createQuizDraft(),
            });
        },
        setHasHydrated: (value) => {
            set({
                hasHydrated: value,
            });
        },
    };
}
