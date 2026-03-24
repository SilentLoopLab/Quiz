"use client";

import type {
    QuizPlayableQuiz,
    QuizSubmissionAnswerValue,
    QuizSubmissionPayload,
} from "../../types/quiz.types";

export function hasQuizAnswer(
    value: QuizSubmissionAnswerValue | undefined,
): boolean {
    if (typeof value === "string") {
        return Boolean(value.trim());
    }

    if (Array.isArray(value)) {
        return value.length > 0;
    }

    return false;
}

export function buildQuizSubmissionPayload(
    quiz: QuizPlayableQuiz,
    answers: Record<string, QuizSubmissionAnswerValue>,
): QuizSubmissionPayload {
    return {
        answers: quiz.questions
            .map((question) => {
                const value = answers[question.id];

                if (typeof value === "undefined") {
                    return null;
                }

                if (question.kind === "respondent_name") {
                    return {
                        questionId: question.id,
                        textAnswer: typeof value === "string" ? value.trim() : "",
                    };
                }

                return {
                    questionId: question.id,
                    selectedOptionIds: Array.isArray(value)
                        ? value
                        : typeof value === "string" && value
                          ? [value]
                          : [],
                };
            })
            .filter((answer): answer is NonNullable<typeof answer> => Boolean(answer)),
    };
}

export function formatPoints(points: number) {
    return Number.isInteger(points) ? String(points) : points.toFixed(2);
}

export function getMissingRequiredQuestionNumbers(
    quiz: QuizPlayableQuiz | null,
    answers: Record<string, QuizSubmissionAnswerValue>,
): number[] {
    if (!quiz) {
        return [];
    }

    return quiz.questions.reduce<number[]>((missingNumbers, question, index) => {
        if (!question.required || hasQuizAnswer(answers[question.id])) {
            return missingNumbers;
        }

        missingNumbers.push(index + 1);
        return missingNumbers;
    }, []);
}
