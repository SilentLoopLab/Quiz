"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
    normalizeQuizDraft,
    resolveQuizCategory,
} from "../../lib/quizBuilder";
import { cdnService } from "../../services/cdn.service";
import { quizService } from "../../services/quiz.service";
import { useQuizBuilderStore } from "../../store/quizBuilderStore";
import type {
    QuizEditorMode,
    QuizManageQuiz,
    QuizQuestionDraft,
} from "../../types/quiz.types";
import { useQuizEditorSession } from "../quizEditor";
import {
    buildQuizCreationPayload,
    buildQuestionPointsPreview,
    createInitialQuizQuestions,
    createQuestionDraft,
    createQuestionOptionDraft,
    validateQuestionDraft,
    type QuizQuestionValidationMap,
} from "./helpers";

function getSettingsRoute(mode: QuizEditorMode, quizId?: string) {
    if (mode === "edit" && quizId) {
        return `/quizzes/${quizId}/edit`;
    }

    return "/quizzes/create";
}

function revokeQuestionImagePreview(previewUrl: string) {
    if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
    }
}

interface UseQuizCreationOptions {
    mode?: QuizEditorMode;
    quizId?: string;
}

export function useQuizCreation({
    mode = "create",
    quizId,
}: UseQuizCreationOptions = {}) {
    const router = useRouter();
    const draft = useQuizBuilderStore((state) => state.draft);
    const isSettingsSaved = useQuizBuilderStore(
        (state) => state.isSettingsSaved,
    );
    const questions = useQuizBuilderStore((state) => state.questions);
    const setQuestions = useQuizBuilderStore((state) => state.setQuestions);
    const [creationError, setCreationError] = useState("");
    const [creationMessage, setCreationMessage] = useState("");
    const [createdQuiz, setCreatedQuiz] = useState<QuizManageQuiz | null>(null);
    const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
    const [questionErrors, setQuestionErrors] =
        useState<QuizQuestionValidationMap>({});
    const questionsRef = useRef<QuizQuestionDraft[]>(questions);
    const settingsRoute = getSettingsRoute(mode, quizId);
    const {
        clearSessionError,
        hasHydrated,
        hasMatchingEditSession,
        isBootstrappingEdit,
        isEditing,
        loadEditSession,
        sessionError,
        storeMode,
    } = useQuizEditorSession({
        mode,
        quizId,
        loadErrorMessage: "Failed to load quiz questions.",
        missingQuizIdMessage: "Quiz ID is required to edit quiz questions.",
        requireQuestions: true,
    });
    const isLocked = createdQuiz !== null;

    const normalizedDraft = normalizeQuizDraft(draft);
    const resolvedCategory = resolveQuizCategory(normalizedDraft);
    const regularQuestionCount = questions.filter(
        (question) => question.kind === "choice",
    ).length;
    const questionPointsPreview = buildQuestionPointsPreview(
        normalizedDraft.scoringMode,
        normalizedDraft.manualPointsMode,
        questions,
    );
    const canCreateQuiz =
        isSettingsSaved &&
        Boolean(normalizedDraft.title) &&
        Boolean(resolvedCategory) &&
        (!isEditing || hasMatchingEditSession);

    useEffect(() => {
        if (!hasHydrated || isEditing) {
            return;
        }

        if (storeMode === "edit") {
            router.replace(settingsRoute);
            return;
        }

        if (isSettingsSaved && questions.length === 0) {
            setQuestions(createInitialQuizQuestions());
        }
    }, [
        hasHydrated,
        isEditing,
        isSettingsSaved,
        questions.length,
        router,
        setQuestions,
        settingsRoute,
        storeMode,
    ]);

    useEffect(() => {
        if (!hasHydrated || isBootstrappingEdit || canCreateQuiz) {
            return;
        }

        router.replace(settingsRoute);
    }, [
        canCreateQuiz,
        hasHydrated,
        isBootstrappingEdit,
        router,
        settingsRoute,
    ]);

    useEffect(() => {
        questionsRef.current = questions;
    }, [questions]);

    useEffect(() => {
        return () => {
            questionsRef.current.forEach((question) => {
                revokeQuestionImagePreview(question.imagePreviewUrl);
            });
        };
    }, []);

    function clearFeedback(questionId?: string) {
        setCreationError("");
        setCreationMessage("");
        setCreatedQuiz(null);
        clearSessionError();

        if (!questionId) {
            return;
        }

        setQuestionErrors((current) => {
            if (!current[questionId]) {
                return current;
            }

            const nextErrors = { ...current };

            delete nextErrors[questionId];

            return nextErrors;
        });
    }

    function updateQuestions(
        updater: (current: QuizQuestionDraft[]) => QuizQuestionDraft[],
    ) {
        setQuestions(updater(questionsRef.current));
    }

    function handleQuestionPromptChange(questionId: string, value: string) {
        clearFeedback(questionId);
        updateQuestions((current) =>
            current.map((question) =>
                question.id === questionId
                    ? { ...question, prompt: value }
                    : question,
            ),
        );
    }

    function handleQuestionRequiredChange(
        questionId: string,
        isRequired: boolean,
    ) {
        clearFeedback(questionId);
        updateQuestions((current) =>
            current.map((question) =>
                question.id === questionId && question.kind === "choice"
                    ? { ...question, isRequired }
                    : question,
            ),
        );
    }

    function handleQuestionImageChange(questionId: string, file: File | null) {
        clearFeedback(questionId);
        updateQuestions((current) =>
            current.map((question) => {
                if (question.id !== questionId || question.kind !== "choice") {
                    return question;
                }

                revokeQuestionImagePreview(question.imagePreviewUrl);

                if (!file) {
                    return {
                        ...question,
                        imageFile: null,
                        imageName: "",
                        imagePreviewUrl: "",
                    };
                }

                return {
                    ...question,
                    imageFile: file,
                    imageName: file.name,
                    imagePreviewUrl: URL.createObjectURL(file),
                };
            }),
        );
    }

    function handleQuestionManualPointsChange(
        questionId: string,
        value: string,
    ) {
        clearFeedback(questionId);
        updateQuestions((current) =>
            current.map((question) =>
                question.id === questionId && question.kind === "choice"
                    ? { ...question, manualPoints: value }
                    : question,
            ),
        );
    }

    function handleOptionTextChange(
        questionId: string,
        optionId: string,
        value: string,
    ) {
        clearFeedback(questionId);
        updateQuestions((current) =>
            current.map((question) =>
                question.id === questionId && question.kind === "choice"
                    ? {
                          ...question,
                          options: question.options.map((option) =>
                              option.id === optionId
                                  ? { ...option, text: value }
                                  : option,
                          ),
                      }
                    : question,
            ),
        );
    }

    function handleOptionCorrectChange(questionId: string, optionId: string) {
        clearFeedback(questionId);
        updateQuestions((current) =>
            current.map((question) => {
                if (question.id !== questionId || question.kind !== "choice") {
                    return question;
                }

                return {
                    ...question,
                    options: question.options.map((option) => {
                        if (draft.answerMode === "single") {
                            return {
                                ...option,
                                isCorrect: option.id === optionId,
                            };
                        }

                        if (option.id !== optionId) {
                            return option;
                        }

                        return {
                            ...option,
                            isCorrect: !option.isCorrect,
                        };
                    }),
                };
            }),
        );
    }

    function addQuestion() {
        clearFeedback();
        updateQuestions((current) => [...current, createQuestionDraft()]);
    }

    function removeQuestion(questionId: string) {
        clearFeedback(questionId);
        updateQuestions((current) =>
            current.filter((question) => question.kind === "choice").length <= 1
                ? current
                : current.filter((question) => {
                      if (question.kind === "respondent_name") {
                          return true;
                      }

                      if (question.id === questionId) {
                          revokeQuestionImagePreview(question.imagePreviewUrl);
                          return false;
                      }

                      return true;
                  }),
        );
        setQuestionErrors((current) => {
            if (!current[questionId]) {
                return current;
            }

            const nextErrors = { ...current };

            delete nextErrors[questionId];

            return nextErrors;
        });
    }

    function addOption(questionId: string) {
        clearFeedback(questionId);
        updateQuestions((current) =>
            current.map((question) =>
                question.id === questionId && question.kind === "choice"
                    ? {
                          ...question,
                          options: [
                              ...question.options,
                              createQuestionOptionDraft(),
                          ],
                      }
                    : question,
            ),
        );
    }

    function removeOption(questionId: string, optionId: string) {
        clearFeedback(questionId);
        updateQuestions((current) =>
            current.map((question) => {
                if (
                    question.id !== questionId ||
                    question.kind !== "choice" ||
                    question.options.length <= 2
                ) {
                    return question;
                }

                return {
                    ...question,
                    options: question.options.filter(
                        (option) => option.id !== optionId,
                    ),
                };
            }),
        );
    }

    async function resetQuestions() {
        clearFeedback();
        setQuestionErrors({});
        questionsRef.current.forEach((question) => {
            revokeQuestionImagePreview(question.imagePreviewUrl);
        });

        if (isEditing && quizId) {
            setCreationMessage("Restoring saved quiz questions...");

            const restoredQuiz = await loadEditSession({
                loadErrorMessage: "Failed to restore quiz questions.",
            });

            if (restoredQuiz) {
                setCreationMessage(
                    `Questions from "${restoredQuiz.title}" were restored.`,
                );
            } else {
                setCreationMessage("");
            }

            return;
        }

        setQuestions(createInitialQuizQuestions());
    }

    function runQuestionsValidation(showReadyMessage: boolean) {
        if (regularQuestionCount === 0) {
            setCreationError(
                "Add at least one quiz question before saving the quiz.",
            );
            setCreationMessage("");
            setQuestionErrors({});
            return false;
        }

        const nextQuestionErrors = questions.reduce<QuizQuestionValidationMap>(
            (accumulator, question) => {
                const errors = validateQuestionDraft(
                    question,
                    normalizedDraft.answerMode,
                    normalizedDraft.scoringMode,
                    normalizedDraft.manualPointsMode,
                );

                if (Object.keys(errors).length > 0) {
                    accumulator[question.id] = errors;
                }

                return accumulator;
            },
            {},
        );

        setQuestionErrors(nextQuestionErrors);

        if (Object.keys(nextQuestionErrors).length > 0) {
            setCreationError(
                "Complete the highlighted question fields before continuing.",
            );
            setCreationMessage("");
            return false;
        }

        setCreationError("");
        setCreationMessage(
            showReadyMessage ? "Quiz is ready." : "",
        );
        return true;
    }

    function validateQuestions() {
        runQuestionsValidation(true);
    }

    function unlockEditor() {
        setCreatedQuiz(null);
        setCreationError("");
        setCreationMessage(
            isEditing
                ? "Quiz is unlocked. You can change settings or questions again."
                : "Quiz is unlocked. You can change the draft again.",
        );
    }

    async function uploadQuestionImages() {
        const questionsWithImages = questions.filter(
            (question) => question.kind === "choice" && question.imageFile,
        );

        if (questionsWithImages.length === 0) {
            return {};
        }

        const uploads = await Promise.all(
            questionsWithImages.map(async (question) => {
                const uploadResult = await cdnService.uploadPhoto(
                    question.imageFile as File,
                );

                return [question.id, uploadResult.url] as const;
            }),
        );

        return Object.fromEntries(uploads);
    }

    async function saveQuiz() {
        if (isCreatingQuiz) {
            return;
        }

        if (!runQuestionsValidation(false)) {
            return;
        }

        setIsCreatingQuiz(true);
        setCreationError("");
        setCreationMessage(
            isEditing
                ? "Saving changes..."
                : "Saving quiz...",
        );

        try {
            const questionImageUrls = await uploadQuestionImages();
            const payload = buildQuizCreationPayload(normalizedDraft, questions, {
                questionImageUrls,
            });
            const result =
                isEditing && quizId
                    ? await quizService.updateQuiz(quizId, payload)
                    : await quizService.createQuiz(payload);

            setQuestionErrors({});
            setCreatedQuiz(result.quiz);
            setCreationMessage(
                isEditing
                    ? "Changes saved."
                    : "Quiz saved.",
            );
        } catch (error) {
            setCreationError(
                error instanceof Error
                    ? error.message
                    : isEditing
                      ? "Failed to update quiz."
                      : "Failed to create quiz.",
            );
            setCreationMessage("");
        } finally {
            setIsCreatingQuiz(false);
        }
    }

    return {
        canCreateQuiz,
        createdQuiz,
        creationError: creationError || sessionError,
        creationMessage,
        editorMode: mode,
        hasHydrated,
        isCreatingQuiz,
        isEditing,
        isInitializing: !hasHydrated || isBootstrappingEdit,
        isLocked,
        questionPointsPreview,
        questionErrors,
        questions,
        regularQuestionCount,
        savedQuizId: createdQuiz?.id || undefined,
        settingsRoute,
        questionSettings: {
            title: normalizedDraft.title,
            category: resolvedCategory,
            difficulty: normalizedDraft.difficulty,
            answerMode: normalizedDraft.answerMode,
            shuffleQuestions: normalizedDraft.shuffleQuestions,
            shuffleAnswers: normalizedDraft.shuffleAnswers,
            scoringMode: normalizedDraft.scoringMode,
            manualPointsMode: normalizedDraft.manualPointsMode,
            accessType: normalizedDraft.accessType,
            isPremium: normalizedDraft.isPremium,
            imageName: normalizedDraft.imageName,
            imageUrl: normalizedDraft.imageUrl,
        },
        addOption,
        addQuestion,
        handleOptionCorrectChange,
        handleQuestionImageChange,
        handleQuestionManualPointsChange,
        handleQuestionRequiredChange,
        handleOptionTextChange,
        handleQuestionPromptChange,
        removeOption,
        removeQuestion,
        resetQuestions,
        saveQuiz,
        unlockEditor,
        validateQuestions,
    };
}
