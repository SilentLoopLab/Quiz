import type {
    QuizAccessType,
    QuizAnswerMode,
    QuizCategory,
    QuizCategoryMode,
    QuizDifficulty,
    QuizDraft,
    QuizManageQuiz,
    QuizManualPointsMode,
    QuizScoringMode,
} from "../types/quiz.types";

export const QUIZ_BUILDER_STORAGE_KEY = "quizz-quiz-builder-storage";
export const QUIZ_AUTOMATIC_TOTAL_POINTS = 100;

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

export const quizScoringModeOptions: Array<{
    value: QuizScoringMode;
    label: string;
    description: string;
}> = [
    {
        value: "automatic",
        label: "Automatic 100 points",
        description:
            "The quiz total stays 100 and points are distributed automatically by the number of questions.",
    },
    {
        value: "manual",
        label: "Manual per question",
        description:
            "You assign points for each question manually, and the total becomes the sum of those values.",
    },
];

export const quizManualPointsModeOptions: Array<{
    value: QuizManualPointsMode;
    label: string;
    description: string;
}> = [
    {
        value: "integer",
        label: "Whole numbers only",
        description:
            "Question points move in whole numbers like 1, 2, 3, 10.",
    },
    {
        value: "decimal",
        label: "Allow decimals",
        description:
            "Question points can use decimal values like 1.5, 2.25, 10.75.",
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

    return draft.presetCategory;
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
    const presetCategory = quizCategoryOptions.find(
        (category) => category === quiz.category,
    );

    return {
        title: quiz.title,
        categoryMode: presetCategory ? "preset" : "custom",
        presetCategory: presetCategory ?? quizCategoryOptions[0],
        customCategory: presetCategory ? "" : quiz.category,
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
