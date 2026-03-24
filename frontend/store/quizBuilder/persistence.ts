import { createQuizDraft, normalizeQuizDraft } from "../../lib/quizBuilder";
import type { QuizDraft, QuizQuestionDraft } from "../../types/quiz.types";

const OBJECT_URL_PREFIX = "blob:";

function isObjectUrl(value: string) {
    return value.trim().startsWith(OBJECT_URL_PREFIX);
}

export function serializeQuestionDraft(
    question: QuizQuestionDraft,
): QuizQuestionDraft {
    const imagePreviewUrl = question.imagePreviewUrl.trim();
    const shouldDropUnsavedImage = isObjectUrl(imagePreviewUrl);

    return {
        ...question,
        imageFile: null,
        imageName: shouldDropUnsavedImage ? "" : question.imageName,
        imagePreviewUrl: shouldDropUnsavedImage ? "" : question.imagePreviewUrl,
    };
}

export function serializeQuestionDrafts(questions: QuizQuestionDraft[]) {
    return questions.map(serializeQuestionDraft);
}

export function hydratePersistedDraft(draft?: QuizDraft) {
    return normalizeQuizDraft(draft ?? createQuizDraft());
}

export function hydratePersistedQuestions(questions?: QuizQuestionDraft[]) {
    return Array.isArray(questions) ? serializeQuestionDrafts(questions) : [];
}
