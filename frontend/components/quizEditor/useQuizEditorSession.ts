"use client";

import { useEffect, useState } from "react";
import { buildQuizDraftFromManageQuiz } from "../../lib/quizBuilder";
import { quizService } from "../../services/quiz.service";
import { useQuizBuilderStore } from "../../store/quizBuilderStore";
import type { QuizEditorMode, QuizManageQuiz } from "../../types/quiz.types";
import { buildQuestionDraftsFromManageQuiz } from "./helpers";

interface UseQuizEditorSessionOptions {
    mode?: QuizEditorMode;
    quizId?: string;
    loadErrorMessage: string;
    missingQuizIdMessage: string;
    requireQuestions?: boolean;
}

interface LoadEditSessionOptions {
    loadErrorMessage?: string;
}

function getLoadErrorMessage(error: unknown, fallbackMessage: string) {
    return error instanceof Error ? error.message : fallbackMessage;
}

function shouldProceed(guard?: () => boolean) {
    return guard ? !guard() : true;
}

export function useQuizEditorSession({
    mode = "create",
    quizId,
    loadErrorMessage,
    missingQuizIdMessage,
    requireQuestions = false,
}: UseQuizEditorSessionOptions) {
    const hasHydrated = useQuizBuilderStore((state) => state.hasHydrated);
    const storeMode = useQuizBuilderStore((state) => state.mode);
    const editingQuizId = useQuizBuilderStore((state) => state.editingQuizId);
    const questions = useQuizBuilderStore((state) => state.questions);
    const startEditSession = useQuizBuilderStore(
        (state) => state.startEditSession,
    );
    const [isBootstrappingEdit, setIsBootstrappingEdit] = useState(
        mode === "edit",
    );
    const [sessionError, setSessionError] = useState("");
    const [sessionVersion, setSessionVersion] = useState(0);
    const isEditing = mode === "edit";
    const hasMatchingEditSession =
        storeMode === "edit" && editingQuizId === quizId;
    const hasReadyEditSession =
        hasMatchingEditSession && (!requireQuestions || questions.length > 0);

    async function fetchAndApplyEditSession(
        currentQuizId: string,
        isCancelled?: () => boolean,
    ) {
        const result = await quizService.getManageQuiz(currentQuizId);

        if (!shouldProceed(isCancelled)) {
            return null;
        }

        startEditSession({
            draft: buildQuizDraftFromManageQuiz(result.quiz),
            questions: buildQuestionDraftsFromManageQuiz(result.quiz),
            quizId: currentQuizId,
        });

        if (!shouldProceed(isCancelled)) {
            return null;
        }

        setSessionVersion((currentVersion) => currentVersion + 1);

        return result.quiz;
    }

    async function loadEditSession(
        options: LoadEditSessionOptions = {},
    ): Promise<QuizManageQuiz | null> {
        if (!quizId) {
            setSessionError(missingQuizIdMessage);
            setIsBootstrappingEdit(false);
            return null;
        }

        setIsBootstrappingEdit(true);
        setSessionError("");

        try {
            return await fetchAndApplyEditSession(quizId);
        } catch (error) {
            setSessionError(
                getLoadErrorMessage(
                    error,
                    options.loadErrorMessage ?? loadErrorMessage,
                ),
            );

            return null;
        } finally {
            setIsBootstrappingEdit(false);
        }
    }

    useEffect(() => {
        if (!hasHydrated) {
            return;
        }

        if (!isEditing || hasReadyEditSession) {
            setIsBootstrappingEdit(false);
            return;
        }

        let isCancelled = false;

        void (async () => {
            if (!quizId) {
                if (!isCancelled) {
                    setSessionError(missingQuizIdMessage);
                    setIsBootstrappingEdit(false);
                }
                return;
            }

            setIsBootstrappingEdit(true);
            setSessionError("");

            try {
                await fetchAndApplyEditSession(quizId, () => isCancelled);
            } catch (error) {
                if (!isCancelled) {
                    setSessionError(
                        getLoadErrorMessage(error, loadErrorMessage),
                    );
                }
            } finally {
                if (!isCancelled) {
                    setIsBootstrappingEdit(false);
                }
            }
        })();

        return () => {
            isCancelled = true;
        };
    }, [
        hasHydrated,
        hasReadyEditSession,
        isEditing,
        loadErrorMessage,
        missingQuizIdMessage,
        quizId,
        startEditSession,
    ]);

    return {
        clearSessionError: () => setSessionError(""),
        hasHydrated,
        hasMatchingEditSession,
        isBootstrappingEdit,
        isEditing,
        loadEditSession,
        sessionError,
        sessionVersion,
        storeMode,
    };
}
