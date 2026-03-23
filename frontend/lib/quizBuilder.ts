import type {
    QuizAccessType,
    QuizAnswerMode,
    QuizCategory,
    QuizCategoryMode,
    QuizDifficulty,
    QuizDraft,
} from "../types/quiz.types";

export const QUIZ_BUILDER_STORAGE_KEY = "quizz-quiz-builder-storage";

export const quizCategoryOptions: QuizCategory[] = [
    "Programming",
    "Science",
    "Medicine",
    "Driving",
    "History",
    "Business",
    "Languages",
    "General",
];

export const quizDifficultyOptions: QuizDifficulty[] = [
    "Easy",
    "Medium",
    "Hard",
];

export const quizAccessTypeOptions: QuizAccessType[] = ["public", "private"];

export const quizCategoryModeOptions: Array<{
    value: QuizCategoryMode;
    label: string;
    description: string;
}> = [
    {
        value: "preset",
        label: "Suggested topics",
        description: "Choose from the topics already available in the app.",
    },
    {
        value: "custom",
        label: "Custom topic",
        description: "Write your own topic for this quiz.",
    },
];

export const quizAnswerModeOptions: Array<{
    value: QuizAnswerMode;
    label: string;
    description: string;
}> = [
    {
        value: "single",
        label: "Single correct answer",
        description: "Each question can have only one correct option.",
    },
    {
        value: "multiple",
        label: "Multiple correct answers",
        description: "Questions can contain several correct options.",
    },
];

export function createQuizDraft(): QuizDraft {
    return {
        title: "",
        categoryMode: "preset",
        presetCategory: "Programming",
        customCategory: "",
        difficulty: "Medium",
        answerMode: "single",
        accessType: "public",
        isPremium: false,
        imageName: "",
    };
}

export function normalizeQuizDraft(draft: QuizDraft): QuizDraft {
    return {
        ...draft,
        title: draft.title.trim(),
        customCategory: draft.customCategory.trim(),
        imageName: draft.imageName.trim(),
    };
}

export function resolveQuizCategory(
    draft: Pick<QuizDraft, "categoryMode" | "presetCategory" | "customCategory">,
): string {
    if (draft.categoryMode === "custom") {
        return draft.customCategory.trim();
    }

    return draft.presetCategory;
}

export function buildQuizPreview(draft: QuizDraft) {
    const normalizedDraft = normalizeQuizDraft(draft);

    return {
        title: normalizedDraft.title,
        category: resolveQuizCategory(normalizedDraft),
        difficulty: normalizedDraft.difficulty,
        answerMode: normalizedDraft.answerMode,
        accessType: normalizedDraft.accessType,
        isPremium: normalizedDraft.isPremium,
        imageName: normalizedDraft.imageName || undefined,
    };
}
