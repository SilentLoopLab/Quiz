"use client";

import { useEffect, useState } from "react";
import { quizService } from "../services/quiz.service";
import type { QuizHomeFeedResponse } from "../types/quiz.types";

const DEFAULT_ERROR_MESSAGE = "Failed to load the home quiz feed.";

interface UseQuizHomeFeedOptions {
    enabled?: boolean;
}

export function useQuizHomeFeed({
    enabled = true,
}: UseQuizHomeFeedOptions = {}) {
    const [data, setData] = useState<QuizHomeFeedResponse | null>(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(enabled);
    const [hasResolved, setHasResolved] = useState(false);

    useEffect(() => {
        if (!enabled) {
            setIsLoading(false);
            setHasResolved(false);
            return;
        }

        let isCancelled = false;

        async function loadHomeFeed() {
            setIsLoading(true);
            setError("");

            try {
                const nextData = await quizService.getHomeFeed();

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
                    setHasResolved(true);
                }
            }
        }

        void loadHomeFeed();

        return () => {
            isCancelled = true;
        };
    }, [enabled]);

    return {
        data,
        error,
        hasResolved,
        isLoading,
    };
}
