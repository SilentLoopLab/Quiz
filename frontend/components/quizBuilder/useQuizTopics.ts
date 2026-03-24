"use client";

import { useEffect, useState } from "react";
import { quizService } from "../../services/quiz.service";

const DEFAULT_ERROR_MESSAGE = "Failed to load suggested topics.";

function normalizeTopic(topic: string) {
    return topic.trim();
}

function mergeTopics(topics: string[], selectedTopic: string) {
    const mergedTopics: string[] = [];

    const appendTopic = (topic: string) => {
        const normalizedTopic = normalizeTopic(topic);

        if (!normalizedTopic || mergedTopics.includes(normalizedTopic)) {
            return;
        }

        mergedTopics.push(normalizedTopic);
    };

    topics.forEach(appendTopic);
    appendTopic(selectedTopic);

    return mergedTopics;
}

export function useQuizTopics(selectedTopic: string) {
    const [availableTopics, setAvailableTopics] = useState<string[]>(() =>
        mergeTopics([], selectedTopic),
    );
    const [topicsError, setTopicsError] = useState("");
    const [isLoadingTopics, setIsLoadingTopics] = useState(true);

    useEffect(() => {
        setAvailableTopics((currentTopics) =>
            mergeTopics(currentTopics, selectedTopic),
        );
    }, [selectedTopic]);

    useEffect(() => {
        let isCancelled = false;

        async function loadTopics() {
            setIsLoadingTopics(true);
            setTopicsError("");

            try {
                const result = await quizService.listPublicQuizzes({
                    page: 1,
                    limit: 1,
                });

                if (!isCancelled) {
                    setAvailableTopics(
                        mergeTopics(result.availableTopics, selectedTopic),
                    );
                }
            } catch (error) {
                if (!isCancelled) {
                    setTopicsError(
                        error instanceof Error
                            ? error.message
                            : DEFAULT_ERROR_MESSAGE,
                    );
                }
            } finally {
                if (!isCancelled) {
                    setIsLoadingTopics(false);
                }
            }
        }

        void loadTopics();

        return () => {
            isCancelled = true;
        };
    }, []);

    return {
        availableTopics,
        isLoadingTopics,
        topicsError,
    };
}
