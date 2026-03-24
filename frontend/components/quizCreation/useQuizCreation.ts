"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
    buildQuizDraftFromManageQuiz,
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
import {
    buildQuizCreationPayload,
    buildQuestionDraftsFromManageQuiz,
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
    const hasHydrated = useQuizBuilderStore((state) => state.hasHydrated);
    const isSettingsSaved = useQuizBuilderStore(
        (state) => state.isSettingsSaved,
    );
    const storeMode = useQuizBuilderStore((state) => state.mode);
    const editingQuizId = useQuizBuilderStore((state) => state.editingQuizId);
    const questions = useQuizBuilderStore((state) => state.questions);
    const setQuestions = useQuizBuilderStore((state) => state.setQuestions);
    const startEditSession = useQuizBuilderStore(
        (state) => state.startEditSession,
    );
    const [creationError, setCreationError] = useState("");
    const [creationMessage, setCreationMessage] = useState("");
    const [createdQuiz, setCreatedQuiz] = useState<QuizManageQuiz | null>(null);
    const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
    const [isBootstrappingEdit, setIsBootstrappingEdit] = useState(
        mode === "edit",
    );
    const [questionErrors, setQuestionErrors] =
        useState<QuizQuestionValidationMap>({});
    const questionsRef = useRef<QuizQuestionDraft[]>(questions);
    const isEditing = mode === "edit";
    const settingsRoute = getSettingsRoute(mode, quizId);
    const hasMatchingEditSession =
        storeMode === "edit" && editingQuizId === quizId;
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
        if (!hasHydrated) {
            return;
        }

        if (!isEditing) {
            if (storeMode === "edit") {
                router.replace(settingsRoute);
                return;
            }

            if (isSettingsSaved && questions.length === 0) {
                setQuestions(createInitialQuizQuestions());
            }

            setIsBootstrappingEdit(false);
            return;
        }

        if (!quizId) {
            setCreationError("Quiz ID is required to edit quiz questions.");
            setIsBootstrappingEdit(false);
            return;
        }

        if (hasMatchingEditSession && questions.length > 0) {
            setIsBootstrappingEdit(false);
            return;
        }

        let isCancelled = false;
        const currentQuizId = quizId;

        async function loadQuizForEditing() {
            setIsBootstrappingEdit(true);
            setCreationError("");
            setCreationMessage("");

            try {
                const result = await quizService.getManageQuiz(currentQuizId);

                if (isCancelled) {
                    return;
                }

                startEditSession({
                    draft: buildQuizDraftFromManageQuiz(result.quiz),
                    questions: buildQuestionDraftsFromManageQuiz(result.quiz),
                    quizId: currentQuizId,
                });
            } catch (error) {
                if (!isCancelled) {
                    setCreationError(
                        error instanceof Error
                            ? error.message
                            : "Failed to load quiz questions.",
                    );
                }
            } finally {
                if (!isCancelled) {
                    setIsBootstrappingEdit(false);
                }
            }
        }

        void loadQuizForEditing();

        return () => {
            isCancelled = true;
        };
    }, [
        editingQuizId,
        hasHydrated,
        hasMatchingEditSession,
        isEditing,
        isSettingsSaved,
        questions.length,
        quizId,
        router,
        setQuestions,
        settingsRoute,
        startEditSession,
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

            try {
                const result = await quizService.getManageQuiz(quizId);

                startEditSession({
                    draft: buildQuizDraftFromManageQuiz(result.quiz),
                    questions: buildQuestionDraftsFromManageQuiz(result.quiz),
                    quizId,
                });
                setCreationMessage(
                    `Questions from "${result.quiz.title}" were restored.`,
                );
            } catch (error) {
                setCreationError(
                    error instanceof Error
                        ? error.message
                        : "Failed to restore quiz questions.",
                );
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
            showReadyMessage ? "Quiz draft is valid and ready to be saved." : "",
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
                ? "Uploading images and updating the quiz..."
                : "Uploading images and saving the quiz...",
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
                    ? `Quiz "${result.quiz.title}" was updated.`
                    : `Quiz "${result.quiz.title}" was saved.`,
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
        creationError,
        creationMessage,
        editorMode: mode,
        hasHydrated,
        isCreatingQuiz,
        isEditing,
        isInitializing: !hasHydrated || isBootstrappingEdit,
        isLocked,
        payloadPreview: buildQuizCreationPayload(normalizedDraft, questions),
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
