"use client";

import { useEffect, useState } from "react";
import { quizService } from "../services/quiz.service";
import type {
    QuizPagination,
    QuizPublicListResponse,
    QuizSummary,
} from "../types/quiz.types";

const DEFAULT_ERROR_MESSAGE = "Failed to load quizzes.";

interface UsePublicQuizCatalogOptions {
    initialTopic?: string;
    limit: number;
}

const EMPTY_PAGINATION: QuizPagination = {
    page: 1,
    limit: 0,
    totalItems: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
    previousPage: null,
    nextPage: null,
};

function scrollPageToTop() {
    if (typeof window === "undefined") {
        return;
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth",
    });
}

export function usePublicQuizCatalog({
    initialTopic = "",
    limit,
}: UsePublicQuizCatalogOptions) {
    const [activeTopic, setActiveTopicState] = useState(initialTopic);
    const [data, setData] = useState<QuizPublicListResponse | null>(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);

    useEffect(() => {
        let isCancelled = false;

        async function loadQuizzes() {
            setIsLoading(true);
            setError("");

            try {
                const nextData = await quizService.listPublicQuizzes({
                    topic: activeTopic || undefined,
                    page,
                    limit,
                });

                if (!isCancelled) {
                    setData(nextData);
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

        loadQuizzes();

        return () => {
            isCancelled = true;
        };
    }, [activeTopic, limit, page]);

    function setActiveTopic(topic: string) {
        setActiveTopicState(topic);
        setPage(1);
    }

    function goToPage(nextPage: number) {
        setPage((currentPage) => {
            if (currentPage === nextPage) {
                return currentPage;
            }

            scrollPageToTop();
            return nextPage;
        });
    }

    function removeQuiz(quizId: string) {
        setData((current) => {
            if (!current) {
                return current;
            }

            const removedQuiz = current.quizzes.find((quiz) => quiz.id === quizId);

            if (!removedQuiz) {
                return current;
            }

            const nextQuizzes = current.quizzes.filter(
                (quiz) => quiz.id !== quizId,
            );
            const nextTotalItems = Math.max(
                0,
                current.pagination.totalItems - 1,
            );
            const nextTotalPages =
                nextTotalItems === 0
                    ? 0
                    : Math.ceil(nextTotalItems / current.pagination.limit);
            const hasPreviousPage =
                nextTotalPages > 0 && current.pagination.page > 1;
            const hasNextPage =
                nextTotalPages > 0 && current.pagination.page < nextTotalPages;

            return {
                ...current,
                counts: {
                    ...current.counts,
                    totalQuizzes: Math.max(
                        0,
                        current.counts.totalQuizzes - 1,
                    ),
                    filteredQuizzes: Math.max(
                        0,
                        current.counts.filteredQuizzes - 1,
                    ),
                    premiumQuizzes: removedQuiz.isPremium
                        ? Math.max(0, current.counts.premiumQuizzes - 1)
                        : current.counts.premiumQuizzes,
                    freeQuizzes: removedQuiz.isPremium
                        ? current.counts.freeQuizzes
                        : Math.max(0, current.counts.freeQuizzes - 1),
                },
                pagination: {
                    ...current.pagination,
                    totalItems: nextTotalItems,
                    totalPages: nextTotalPages,
                    hasPreviousPage,
                    hasNextPage,
                    previousPage: hasPreviousPage
                        ? Math.min(
                              current.pagination.page - 1,
                              nextTotalPages || current.pagination.page - 1,
                          )
                        : null,
                    nextPage: hasNextPage
                        ? current.pagination.page + 1
                        : null,
                },
                quizzes: nextQuizzes,
            };
        });
    }

    return {
        activeTopic,
        availableTopics: data?.availableTopics ?? [],
        counts: data?.counts ?? null,
        error,
        filters: data?.filters ?? null,
        goToPage,
        isLoading,
        page,
        pagination: data?.pagination ?? EMPTY_PAGINATION,
        quizzes: data?.quizzes ?? ([] as QuizSummary[]),
        rawData: data,
        removeQuiz,
        setActiveTopic,
    };
}
