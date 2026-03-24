import {
    buildQuizPreview,
    QUIZ_AUTOMATIC_TOTAL_POINTS,
} from "../../lib/quizBuilder";
import type {
    QuizAnswerMode,
    QuizCreatePayload,
    QuizDraft,
    QuizManualPointsMode,
    QuizQuestionDraft,
    QuizQuestionOptionDraft,
    QuizScoringMode,
} from "../../types/quiz.types";

export interface QuizQuestionValidationErrors {
    prompt?: string;
    options?: string;
    correctAnswers?: string;
    points?: string;
}

export type QuizQuestionValidationMap = Record<
    string,
    QuizQuestionValidationErrors
>;

export interface QuizQuestionPointsPreview {
    questionId: string;
    points: number | null;
}

const MIN_OPTIONS_PER_QUESTION = 2;

function createDraftId() {
    return `quiz-draft-${Math.random().toString(36).slice(2, 10)}`;
}

export function createQuestionOptionDraft(): QuizQuestionOptionDraft {
    return {
        id: createDraftId(),
        text: "",
        isCorrect: false,
    };
}

export function createRespondentNameQuestionDraft(): QuizQuestionDraft {
    return {
        id: createDraftId(),
        kind: "respondent_name",
        prompt: "First name and last name",
        isRequired: true,
        imageFile: null,
        imageName: "",
        imagePreviewUrl: "",
        manualPoints: "",
        options: [],
    };
}

export function createQuestionDraft(): QuizQuestionDraft {
    return {
        id: createDraftId(),
        kind: "choice",
        prompt: "",
        isRequired: true,
        imageFile: null,
        imageName: "",
        imagePreviewUrl: "",
        manualPoints: "",
        options: [createQuestionOptionDraft(), createQuestionOptionDraft()],
    };
}

export function createInitialQuizQuestions(): QuizQuestionDraft[] {
    return [createRespondentNameQuestionDraft(), createQuestionDraft()];
}

function getScoredQuestions(questions: QuizQuestionDraft[]) {
    return questions.filter((question) => question.kind === "choice");
}

function parseManualPoints(
    manualPoints: string,
    manualPointsMode: QuizManualPointsMode,
): number | null {
    const trimmedPoints = manualPoints.trim();

    if (!trimmedPoints) {
        return null;
    }

    const numericPoints = Number(trimmedPoints);

    if (!Number.isFinite(numericPoints) || numericPoints <= 0) {
        return null;
    }

    if (
        manualPointsMode === "integer" &&
        !Number.isInteger(numericPoints)
    ) {
        return null;
    }

    return Math.round(numericPoints * 100) / 100;
}

function distributeAutomaticQuestionPoints(questionCount: number): number[] {
    if (questionCount <= 0) {
        return [];
    }

    const totalHundredths = QUIZ_AUTOMATIC_TOTAL_POINTS * 100;
    const baseHundredths = Math.floor(totalHundredths / questionCount);
    const remainderHundredths = totalHundredths % questionCount;

    return Array.from({ length: questionCount }, (_, index) => {
        const nextHundredths =
            baseHundredths + (index < remainderHundredths ? 1 : 0);

        return nextHundredths / 100;
    });
}

export function buildQuestionPointsPreview(
    scoringMode: QuizScoringMode,
    manualPointsMode: QuizManualPointsMode,
    questions: QuizQuestionDraft[],
) {
    const scoredQuestions = getScoredQuestions(questions);

    if (scoringMode === "automatic") {
        const automaticPoints = distributeAutomaticQuestionPoints(
            scoredQuestions.length,
        );
        let questionIndex = 0;

        return {
            totalPoints:
                scoredQuestions.length > 0 ? QUIZ_AUTOMATIC_TOTAL_POINTS : 0,
            questions: questions.map((question) => ({
                questionId: question.id,
                points:
                    question.kind === "choice"
                        ? automaticPoints[questionIndex++] ?? 0
                        : 0,
            })),
        };
    }

    const manualQuestionPoints: QuizQuestionPointsPreview[] = questions.map(
        (question) => {
            if (question.kind !== "choice") {
                return {
                    questionId: question.id,
                    points: 0,
                };
            }

            return {
                questionId: question.id,
                points: parseManualPoints(
                    question.manualPoints,
                    manualPointsMode,
                ),
            };
        },
    );

    return {
        totalPoints: manualQuestionPoints.reduce(
            (sum, question) => sum + (question.points ?? 0),
            0,
        ),
        questions: manualQuestionPoints,
    };
}

export function validateQuestionDraft(
    question: QuizQuestionDraft,
    answerMode: QuizAnswerMode,
    scoringMode: QuizScoringMode,
    manualPointsMode: QuizManualPointsMode,
): QuizQuestionValidationErrors {
    if (question.kind === "respondent_name") {
        return {};
    }

    const errors: QuizQuestionValidationErrors = {};
    const filledOptions = question.options.filter((option) =>
        option.text.trim(),
    );
    const correctFilledOptions = filledOptions.filter(
        (option) => option.isCorrect,
    );

    if (!question.prompt.trim()) {
        errors.prompt = "Add the question text.";
    }

    if (filledOptions.length < MIN_OPTIONS_PER_QUESTION) {
        errors.options = "Each question needs at least two filled answer options.";
    }

    if (correctFilledOptions.length === 0) {
        errors.correctAnswers =
            answerMode === "single"
                ? "Mark one correct answer."
                : "Mark at least one correct answer.";
    }

    if (answerMode === "single" && correctFilledOptions.length > 1) {
        errors.correctAnswers =
            "Single answer mode allows only one correct option.";
    }

    if (
        scoringMode === "manual" &&
        parseManualPoints(question.manualPoints, manualPointsMode) === null
    ) {
        errors.points =
            manualPointsMode === "integer"
                ? "Enter a whole number greater than 0 for this question."
                : "Enter valid points greater than 0 for this question.";
    }

    return errors;
}

export function buildQuizCreationPayload(
    settingsDraft: QuizDraft,
    questions: QuizQuestionDraft[],
    options: {
        coverImageUrl?: string;
        questionImageUrls?: Record<string, string>;
    } = {},
): QuizCreatePayload {
    const preview = buildQuizPreview(settingsDraft);
    const questionPointsPreview = buildQuestionPointsPreview(
        settingsDraft.scoringMode,
        settingsDraft.manualPointsMode,
        questions,
    );
    const resolvedCoverImageUrl =
        options.coverImageUrl ?? settingsDraft.imageUrl.trim();
    const questionImageUrls = options.questionImageUrls ?? {};

    return {
        ...preview,
        imageName:
            resolvedCoverImageUrl && settingsDraft.imageName.trim()
                ? settingsDraft.imageName.trim()
                : undefined,
        imageUrl: resolvedCoverImageUrl || undefined,
        totalPoints: questionPointsPreview.totalPoints,
        questions: questions.map((question, index) => ({
            kind: question.kind,
            prompt: question.prompt.trim(),
            required:
                question.kind === "respondent_name" ? true : question.isRequired,
            shuffleEligible: question.kind === "choice",
            responseType:
                question.kind === "respondent_name" ? "full_name" : "choice",
            imageName:
                question.kind === "choice"
                    ? question.imageName.trim() || undefined
                    : undefined,
            imageUrl:
                question.kind === "choice"
                    ? questionImageUrls[question.id] ||
                      (!question.imageFile &&
                      question.imagePreviewUrl.trim() &&
                      /^https?:\/\//.test(question.imagePreviewUrl.trim())
                          ? question.imagePreviewUrl.trim()
                          : undefined)
                    : undefined,
            points: questionPointsPreview.questions[index]?.points ?? 0,
            options:
                question.kind === "choice"
                    ? question.options
                          .filter((option) => option.text.trim())
                          .map((option) => ({
                              text: option.text.trim(),
                              isCorrect: option.isCorrect,
                          }))
                    : [],
        })),
    };
}
