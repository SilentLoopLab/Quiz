"use client";

import { useEffect, useState } from "react";
import { quizService } from "../../services/quiz.service";
import type { QuizSummary } from "../../types/quiz.types";

const DEFAULT_ERROR_MESSAGE = "Failed to load your quizzes.";

export function useMyQuizzes() {
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [deletingQuizId, setDeletingQuizId] = useState("");
    const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);

    useEffect(() => {
        let isCancelled = false;

        async function loadOwnQuizzes() {
            setIsLoading(true);
            setError("");

            try {
                const result = await quizService.listOwnQuizzes();

                if (!isCancelled) {
                    setQuizzes(result.quizzes);
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

        void loadOwnQuizzes();

        return () => {
            isCancelled = true;
        };
    }, []);

    async function deleteQuiz(quizId: string) {
        setDeletingQuizId(quizId);
        setError("");

        try {
            await quizService.deleteQuiz(quizId);
            setQuizzes((current) =>
                current.filter((quiz) => quiz.id !== quizId),
            );
            return true;
        } catch (deleteError) {
            setError(
                deleteError instanceof Error
                    ? deleteError.message
                    : "Failed to delete quiz.",
            );
            return false;
        } finally {
            setDeletingQuizId("");
        }
    }

    return {
        deletingQuizId,
        error,
        isLoading,
        quizzes,
        deleteQuiz,
    };
}
