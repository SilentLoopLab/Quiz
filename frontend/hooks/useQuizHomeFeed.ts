"use client";

import { useEffect, useState } from "react";
import { quizService } from "../services/quiz.service";
import type { QuizHomeFeedResponse } from "../types/quiz.types";

const DEFAULT_ERROR_MESSAGE = "Failed to load the home quiz feed.";

export function useQuizHomeFeed() {
    const [data, setData] = useState<QuizHomeFeedResponse | null>(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
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
                }
            }
        }

        loadHomeFeed();

        return () => {
            isCancelled = true;
        };
    }, []);

    return {
        data,
        error,
        isLoading,
    };
}
