import type {
    QuizAccessType,
    QuizAnswerMode,
    QuizCategoryMode,
    QuizDifficulty,
    QuizDraft,
    QuizManageQuiz,
    QuizManualPointsMode,
    QuizScoringMode,
} from "../types/quiz.types";

export const QUIZ_BUILDER_STORAGE_KEY = "quizz-quiz-builder-storage";
export const QUIZ_AUTOMATIC_TOTAL_POINTS = 100;

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
        label: "Saved topics",
        description: "Use an existing topic.",
    },
    {
        value: "custom",
        label: "Custom topic",
        description: "Add a new topic.",
    },
];

export const quizAnswerModeOptions: Array<{
    value: QuizAnswerMode;
    label: string;
    description: string;
}> = [
    {
        value: "single",
        label: "Single answer",
        description: "One correct option.",
    },
    {
        value: "multiple",
        label: "Multiple answers",
        description: "More than one correct option.",
    },
];

export const quizScoringModeOptions: Array<{
    value: QuizScoringMode;
    label: string;
    description: string;
}> = [
    {
        value: "automatic",
        label: "Automatic 100 points",
        description: "Total stays 100.",
    },
    {
        value: "manual",
        label: "Manual points",
        description: "Set points per question.",
    },
];

export const quizManualPointsModeOptions: Array<{
    value: QuizManualPointsMode;
    label: string;
    description: string;
}> = [
    {
        value: "integer",
        label: "Whole numbers",
        description: "1, 2, 3",
    },
    {
        value: "decimal",
        label: "Decimals",
        description: "1.5, 2.25",
    },
];

export function createQuizDraft(): QuizDraft {
    return {
        title: "",
        categoryMode: "preset",
        presetCategory: "",
        customCategory: "",
        difficulty: "Medium",
        answerMode: "single",
        shuffleQuestions: false,
        shuffleAnswers: false,
        scoringMode: "automatic",
        manualPointsMode: "integer",
        accessType: "public",
        isPremium: false,
        imageName: "",
        imageUrl: "",
    };
}

export function normalizeQuizDraft(draft: QuizDraft): QuizDraft {
    const fallbackDraft = createQuizDraft();

    return {
        ...fallbackDraft,
        ...draft,
        title: draft.title?.trim() ?? fallbackDraft.title,
        presetCategory:
            draft.presetCategory?.trim() ?? fallbackDraft.presetCategory,
        customCategory:
            draft.customCategory?.trim() ?? fallbackDraft.customCategory,
        imageName: draft.imageName?.trim() ?? fallbackDraft.imageName,
        imageUrl: draft.imageUrl?.trim() ?? fallbackDraft.imageUrl,
    };
}

export function resolveQuizCategory(
    draft: Pick<QuizDraft, "categoryMode" | "presetCategory" | "customCategory">,
): string {
    if (draft.categoryMode === "custom") {
        return draft.customCategory.trim();
    }

    return draft.presetCategory.trim();
}

export function buildQuizPreview(draft: QuizDraft) {
    const normalizedDraft = normalizeQuizDraft(draft);

    return {
        title: normalizedDraft.title,
        category: resolveQuizCategory(normalizedDraft),
        difficulty: normalizedDraft.difficulty,
        answerMode: normalizedDraft.answerMode,
        shuffleQuestions: normalizedDraft.shuffleQuestions,
        shuffleAnswers: normalizedDraft.shuffleAnswers,
        scoringMode: normalizedDraft.scoringMode,
        manualPointsMode: normalizedDraft.manualPointsMode,
        accessType: normalizedDraft.accessType,
        isPremium: normalizedDraft.isPremium,
        imageName: normalizedDraft.imageName || undefined,
        imageUrl: normalizedDraft.imageUrl || undefined,
    };
}

export function buildQuizDraftFromManageQuiz(quiz: QuizManageQuiz): QuizDraft {
    return {
        title: quiz.title,
        categoryMode: quiz.category.trim() ? "preset" : "custom",
        presetCategory: quiz.category,
        customCategory: "",
        difficulty: quiz.difficulty,
        answerMode: quiz.answerMode,
        shuffleQuestions: quiz.shuffleQuestions,
        shuffleAnswers: quiz.shuffleAnswers,
        scoringMode: quiz.scoringMode,
        manualPointsMode: quiz.manualPointsMode,
        accessType: quiz.accessType,
        isPremium: quiz.isPremium,
        imageName: quiz.imageName,
        imageUrl: quiz.imageUrl,
    };
}
