"use client";

import { useEffect, useMemo, useState } from "react";
import { quizService } from "../../services/quiz.service";
import type {
    QuizPlayableQuiz,
    QuizSubmissionAnswerValue,
    QuizSubmissionResult,
} from "../../types/quiz.types";
import {
    buildQuizSubmissionPayload,
    getMissingRequiredQuestionNumbers,
    hasQuizAnswer,
} from "./helpers";

const DEFAULT_ERROR_MESSAGE = "Failed to load the quiz.";
const DEFAULT_SUBMIT_ERROR_MESSAGE = "Failed to submit the quiz.";

interface UseQuizPlayerParams {
    quizId?: string;
    shareToken?: string;
}

export function useQuizPlayer({ quizId, shareToken }: UseQuizPlayerParams) {
    const [quiz, setQuiz] = useState<QuizPlayableQuiz | null>(null);
    const [answers, setAnswers] = useState<
        Record<string, QuizSubmissionAnswerValue>
    >({});
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionResult, setSubmissionResult] =
        useState<QuizSubmissionResult | null>(null);
    const [submitError, setSubmitError] = useState("");

    useEffect(() => {
        let isCancelled = false;

        async function loadQuiz() {
            setIsLoading(true);
            setError("");
            setSubmitError("");
            setSubmissionResult(null);
            setAnswers({});

            try {
                const result = shareToken
                    ? await quizService.getPlayableQuizByShareToken(
                          shareToken,
                      )
                    : await quizService.getPlayableQuiz(quizId ?? "");

                if (!isCancelled) {
                    setQuiz(result.quiz);
                    setSubmissionResult(result.quiz.latestAttempt ?? null);
                }
            } catch (loadError) {
                if (!isCancelled) {
                    setError(
                        loadError instanceof Error
                            ? loadError.message
                            : DEFAULT_ERROR_MESSAGE,
                    );
                }
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        }

        void loadQuiz();

        return () => {
            isCancelled = true;
        };
    }, [quizId, shareToken]);

    const answeredCount = useMemo(() => {
        if (!quiz) {
            return 0;
        }

        return quiz.questions.reduce((count, question) => {
            const answer = answers[question.id];
            return hasQuizAnswer(answer) ? count + 1 : count;
        }, 0);
    }, [answers, quiz]);

    const missingRequiredQuestionNumbers = useMemo(
        () => getMissingRequiredQuestionNumbers(quiz, answers),
        [answers, quiz],
    );

    function handleTextAnswerChange(questionId: string, value: string) {
        if (submissionResult) {
            return;
        }

        setSubmitError("");
        setAnswers((current) => ({
            ...current,
            [questionId]: value,
        }));
    }

    function handleOptionToggle(
        questionId: string,
        optionId: string,
        allowMultiple: boolean,
    ) {
        if (submissionResult) {
            return;
        }

        setSubmitError("");
        setAnswers((current) => {
            const currentValue = current[questionId];

            if (!allowMultiple) {
                return {
                    ...current,
                    [questionId]: optionId,
                };
            }

            const nextValues = Array.isArray(currentValue)
                ? currentValue.includes(optionId)
                    ? currentValue.filter((value) => value !== optionId)
                    : [...currentValue, optionId]
                : [optionId];

            return {
                ...current,
                [questionId]: nextValues,
            };
        });
    }

    function resetAnswers() {
        setAnswers({});
        setSubmissionResult(null);
        setSubmitError("");
    }

    async function submitQuiz() {
        if (!quiz) {
            return;
        }

        if (missingRequiredQuestionNumbers.length > 0) {
            setSubmitError(
                `Answer required question${missingRequiredQuestionNumbers.length > 1 ? "s" : ""}: ${missingRequiredQuestionNumbers.join(", ")}.`,
            );
            return;
        }

        setIsSubmitting(true);
        setSubmitError("");

        try {
            const result = await quizService.submitQuizAttempt(
                quiz.id,
                buildQuizSubmissionPayload(quiz, answers),
            );

            setSubmissionResult(result.result);
            setQuiz((current) =>
                current
                    ? {
                          ...current,
                          latestAttempt: result.result,
                      }
                    : current,
            );
        } catch (submitQuizError) {
            setSubmitError(
                submitQuizError instanceof Error
                    ? submitQuizError.message
                    : DEFAULT_SUBMIT_ERROR_MESSAGE,
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return {
        answeredCount,
        answers,
        error,
        isLoading,
        isSubmitting,
        quiz,
        handleOptionToggle,
        handleTextAnswerChange,
        resetAnswers,
        missingRequiredQuestionNumbers,
        submissionResult,
        submitError,
        submitQuiz,
    };
}
