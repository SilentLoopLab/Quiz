export type QuizCategory =
    | "Programming"
    | "Science"
    | "Medicine"
    | "Driving"
    | "History"
    | "Business"
    | "Languages"
    | "General";

export type QuizCategoryMode = "preset" | "custom";

export type QuizDifficulty = "Easy" | "Medium" | "Hard";

export type QuizAccessType = "public" | "private";

export type QuizAnswerMode = "single" | "multiple";

export interface QuizDraft {
    title: string;
    categoryMode: QuizCategoryMode;
    presetCategory: QuizCategory;
    customCategory: string;
    difficulty: QuizDifficulty;
    answerMode: QuizAnswerMode;
    accessType: QuizAccessType;
    isPremium: boolean;
    imageName: string;
}
