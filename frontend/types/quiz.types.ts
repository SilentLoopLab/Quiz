export type QuizCategory = string;

export type QuizCategoryMode = "preset" | "custom";

export type QuizDifficulty = "Easy" | "Medium" | "Hard";

export type QuizAccessType = "public" | "private";

export type QuizAnswerMode = "single" | "multiple";

export type QuizScoringMode = "automatic" | "manual";
export type QuizManualPointsMode = "integer" | "decimal";
export type QuizQuestionKind = "respondent_name" | "choice";
export type QuizQuestionResponseType = "full_name" | "choice";
export type QuizEditorMode = "create" | "edit";

export interface QuizDraft {
    title: string;
    categoryMode: QuizCategoryMode;
    presetCategory: QuizCategory;
    customCategory: string;
    difficulty: QuizDifficulty;
    answerMode: QuizAnswerMode;
    shuffleQuestions: boolean;
    shuffleAnswers: boolean;
    scoringMode: QuizScoringMode;
    manualPointsMode: QuizManualPointsMode;
    accessType: QuizAccessType;
    isPremium: boolean;
    imageName: string;
    imageUrl: string;
}

export interface QuizQuestionOptionDraft {
    id: string;
    text: string;
    isCorrect: boolean;
}

export interface QuizQuestionDraft {
    id: string;
    kind: QuizQuestionKind;
    prompt: string;
    isRequired: boolean;
    imageFile: File | null;
    imageName: string;
    imagePreviewUrl: string;
    manualPoints: string;
    options: QuizQuestionOptionDraft[];
}

export interface QuizQuestionOptionPayload {
    text: string;
    isCorrect: boolean;
}

export interface QuizQuestionPayload {
    kind: QuizQuestionKind;
    prompt: string;
    required: boolean;
    shuffleEligible: boolean;
    responseType: QuizQuestionResponseType;
    imageName?: string;
    imageUrl?: string;
    points: number;
    options: QuizQuestionOptionPayload[];
}

export interface QuizCreatePayload {
    title: string;
    category: string;
    description?: string;
    difficulty: QuizDifficulty;
    answerMode: QuizAnswerMode;
    shuffleQuestions: boolean;
    shuffleAnswers: boolean;
    scoringMode: QuizScoringMode;
    manualPointsMode: QuizManualPointsMode;
    accessType: QuizAccessType;
    isPremium: boolean;
    imageName?: string;
    imageUrl?: string;
    totalPoints: number;
    questions: QuizQuestionPayload[];
}

export interface QuizManageOption {
    id: string;
    text: string;
    isCorrect: boolean;
}

export interface QuizPlayableOption {
    id: string;
    text: string;
}

export interface QuizSummaryAccess {
    isOwner: boolean;
    canAttempt: boolean;
    requiresPremium: boolean;
    requiresShareLink: boolean;
}

export interface QuizSummary {
    id: string;
    ownerId: string;
    ownerName: string;
    ownerQuizCreationBlocked: boolean;
    title: string;
    description: string;
    category: string;
    difficulty: string;
    accessType: QuizAccessType;
    isPremium: boolean;
    imageName: string;
    imageUrl: string;
    questionCount: number;
    totalPoints: number;
    createdAt: string;
    updatedAt: string;
    access: QuizSummaryAccess;
    share?: QuizShareData;
}

export interface QuizTopicStats {
    topic: string;
    quizCount: number;
    premiumQuizCount: number;
    freeQuizCount: number;
}

export interface QuizHomeTotals {
    totalQuizzes: number;
    publicQuizzes: number;
    privateQuizzes: number;
    premiumQuizzes: number;
    freeQuizzes: number;
}

export interface QuizHomeFeedResponse {
    generatedAt: string;
    totals: QuizHomeTotals;
    availableTopics: string[];
    popularTopics: QuizTopicStats[];
    quizzes: QuizSummary[];
}

export type QuizPremiumListFilter = "all" | "free" | "premium";

export interface QuizPublicListFilters {
    topic: string;
    premium: QuizPremiumListFilter;
    page: number;
    limit: number;
}

export interface QuizPublicListCounts {
    totalQuizzes: number;
    filteredQuizzes: number;
    premiumQuizzes: number;
    freeQuizzes: number;
}

export interface QuizPagination {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    previousPage: number | null;
    nextPage: number | null;
}

export interface QuizPublicListResponse {
    filters: QuizPublicListFilters;
    availableTopics: string[];
    premiumOptions: QuizPremiumListFilter[];
    counts: QuizPublicListCounts;
    pagination: QuizPagination;
    quizzes: QuizSummary[];
}

export interface QuizManageQuestion {
    id: string;
    kind: QuizQuestionKind;
    prompt: string;
    required: boolean;
    shuffleEligible: boolean;
    responseType: QuizQuestionResponseType;
    imageName: string;
    imageUrl: string;
    points: number;
    options: QuizManageOption[];
}

export interface QuizPlayableQuestion {
    id: string;
    kind: QuizQuestionKind;
    prompt: string;
    required: boolean;
    shuffleEligible: boolean;
    responseType: QuizQuestionResponseType;
    imageName: string;
    imageUrl: string;
    points: number;
    options: QuizPlayableOption[];
}

export type QuizSubmissionAnswerValue = string | string[];

export interface QuizSubmissionAnswerPayload {
    questionId: string;
    textAnswer?: string;
    selectedOptionIds?: string[];
}

export interface QuizSubmissionPayload {
    answers: QuizSubmissionAnswerPayload[];
}

export interface QuizSubmissionQuestionResult {
    questionId: string;
    kind: QuizQuestionKind;
    prompt: string;
    required: boolean;
    points: number;
    earnedPoints: number;
    isAnswered: boolean;
    isCorrect: boolean | null;
    textAnswer: string;
    selectedOptionIds: string[];
    correctOptionIds: string[];
    selectedOptionTexts: string[];
    correctOptionTexts: string[];
}

export interface QuizSubmissionResult {
    attemptId: string;
    attemptCount: number;
    lastAttemptedAt: string;
    isPersisted: boolean;
    quizId: string;
    title: string;
    totalPoints: number;
    earnedPoints: number;
    percentage: number;
    submittedAt: string;
    respondentName: string;
    answeredQuestions: number;
    totalQuestions: number;
    correctQuestions: number;
    incorrectQuestions: number;
    unansweredQuestions: number;
    questions: QuizSubmissionQuestionResult[];
}

export interface QuizShareData {
    isEnabled: boolean;
    shareToken: string;
    sharePath: string;
    shareUrl: string;
}

export interface QuizManageQuiz {
    id: string;
    ownerId: string;
    ownerName: string;
    ownerQuizCreationBlocked: boolean;
    title: string;
    description: string;
    category: string;
    difficulty: QuizDifficulty;
    answerMode: QuizAnswerMode;
    shuffleQuestions: boolean;
    shuffleAnswers: boolean;
    scoringMode: QuizScoringMode;
    manualPointsMode: QuizManualPointsMode;
    accessType: QuizAccessType;
    isPremium: boolean;
    imageName: string;
    imageUrl: string;
    totalPoints: number;
    questionCount: number;
    createdAt: string;
    updatedAt: string;
    access: {
        isOwner: boolean;
        share: QuizShareData;
    };
    questions: QuizManageQuestion[];
}

export interface QuizPlayableQuiz {
    id: string;
    ownerId: string;
    ownerName: string;
    ownerQuizCreationBlocked: boolean;
    title: string;
    description: string;
    category: string;
    difficulty: QuizDifficulty;
    answerMode: QuizAnswerMode;
    shuffleQuestions: boolean;
    shuffleAnswers: boolean;
    scoringMode: QuizScoringMode;
    manualPointsMode: QuizManualPointsMode;
    accessType: QuizAccessType;
    isPremium: boolean;
    imageName: string;
    imageUrl: string;
    totalPoints: number;
    questionCount: number;
    createdAt: string;
    updatedAt: string;
    access: {
        isOwner: boolean;
        requiresPremium: boolean;
        share: QuizShareData;
    };
    latestAttempt: QuizSubmissionResult | null;
    questions: QuizPlayableQuestion[];
}

export interface QuizCreateResponse {
    quiz: QuizManageQuiz;
}

export interface QuizPlayableResponse {
    quiz: QuizPlayableQuiz;
}

export interface QuizSubmissionResponse {
    result: QuizSubmissionResult;
}

export interface QuizOwnListResponse {
    quizzes: QuizSummary[];
}

export interface QuizDeleteResponse {
    message: string;
    quizId: string;
}
