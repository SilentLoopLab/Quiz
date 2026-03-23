import { createQuizDraft } from "../../lib/quizBuilder";
import type { QuizBuilderState } from "./types";

export const initialState: QuizBuilderState = {
    draft: createQuizDraft(),
    hasHydrated: false,
};
