"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    buildQuizDraftFromManageQuiz,
    buildQuizPreview,
    normalizeQuizDraft,
    resolveQuizCategory,
} from "../../lib/quizBuilder";
import { cdnService } from "../../services/cdn.service";
import { quizService } from "../../services/quiz.service";
import { useAuthStore } from "../../store/authStore";
import { useQuizBuilderStore } from "../../store/quizBuilderStore";
import type {
    QuizAccessType,
    QuizAnswerMode,
    QuizCategory,
    QuizCategoryMode,
    QuizDifficulty,
    QuizDraft,
    QuizEditorMode,
    QuizManualPointsMode,
    QuizScoringMode,
} from "../../types/quiz.types";
import { buildQuestionDraftsFromManageQuiz } from "../quizCreation/helpers";

const SETTINGS_VALIDATION_MESSAGE =
    "Add a quiz title before saving quiz settings.";
const CATEGORY_VALIDATION_MESSAGE =
    "Choose a topic or write your own topic before saving quiz settings.";

function getQuestionEditorRoute(mode: QuizEditorMode, quizId?: string) {
    if (mode === "edit" && quizId) {
        return `/quizzes/${quizId}/edit/questions`;
    }

    return "/quizzes/create/questions";
}

interface UseQuizBuilderOptions {
    mode?: QuizEditorMode;
    quizId?: string;
}

export function useQuizBuilder({
    mode = "create",
    quizId,
}: UseQuizBuilderOptions = {}) {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const draft = useQuizBuilderStore((state) => state.draft);
    const hasHydrated = useQuizBuilderStore((state) => state.hasHydrated);
    const isSettingsSaved = useQuizBuilderStore((state) => state.isSettingsSaved);
    const storeMode = useQuizBuilderStore((state) => state.mode);
    const editingQuizId = useQuizBuilderStore((state) => state.editingQuizId);
    const saveSettingsDraft = useQuizBuilderStore(
        (state) => state.saveSettingsDraft,
    );
    const setDraftField = useQuizBuilderStore((state) => state.setDraftField);
    const resetStoredDraft = useQuizBuilderStore((state) => state.resetDraft);
    const startEditSession = useQuizBuilderStore(
        (state) => state.startEditSession,
    );
    const [builderError, setBuilderError] = useState("");
    const [builderMessage, setBuilderMessage] = useState("");
    const [imagePreviewUrl, setImagePreviewUrl] = useState("");
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(
        null,
    );
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [isBootstrappingEdit, setIsBootstrappingEdit] = useState(
        mode === "edit",
    );
    const isPremiumUser = user?.premium === true;
    const isEditing = mode === "edit";

    useEffect(() => {
        return () => {
            if (imagePreviewUrl) {
                URL.revokeObjectURL(imagePreviewUrl);
            }
        };
    }, [imagePreviewUrl]);

    useEffect(() => {
        if (!hasHydrated) {
            return;
        }

        if (!isEditing) {
            if (storeMode === "edit") {
                resetStoredDraft();
            }

            setIsBootstrappingEdit(false);
            return;
        }

        if (!quizId) {
            setBuilderError("Quiz ID is required to edit the quiz.");
            setIsBootstrappingEdit(false);
            return;
        }

        if (
            storeMode === "edit" &&
            editingQuizId === quizId
        ) {
            setIsBootstrappingEdit(false);
            return;
        }

        let isCancelled = false;
        const currentQuizId = quizId;

        async function loadQuizForEditing() {
            setIsBootstrappingEdit(true);
            setBuilderError("");
            setBuilderMessage("");

            try {
                const result = await quizService.getManageQuiz(currentQuizId);

                if (isCancelled) {
                    return;
                }

                if (imagePreviewUrl) {
                    URL.revokeObjectURL(imagePreviewUrl);
                    setImagePreviewUrl("");
                }

                setSelectedImageFile(null);
                startEditSession({
                    draft: buildQuizDraftFromManageQuiz(result.quiz),
                    questions: buildQuestionDraftsFromManageQuiz(result.quiz),
                    quizId: currentQuizId,
                });
            } catch (error) {
                if (!isCancelled) {
                    setBuilderError(
                        error instanceof Error
                            ? error.message
                            : "Failed to load quiz settings.",
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
        imagePreviewUrl,
        isEditing,
        quizId,
        resetStoredDraft,
        startEditSession,
        storeMode,
    ]);

    useEffect(() => {
        if (isBootstrappingEdit || !isPremiumUser) {
            if (isBootstrappingEdit) {
                return;
            }

            let didNormalizePremiumFields = false;

            if (draft.accessType === "private") {
                setDraftField("accessType", "public");
                didNormalizePremiumFields = true;
            }

            if (draft.isPremium) {
                setDraftField("isPremium", false);
                didNormalizePremiumFields = true;
            }

            if (didNormalizePremiumFields) {
                setBuilderError("");
                setBuilderMessage(
                    "Saved draft was adjusted to public settings because premium options require a premium account.",
                );
            }
        }
    }, [
        draft.accessType,
        draft.isPremium,
        isBootstrappingEdit,
        isPremiumUser,
        setDraftField,
    ]);

    function clearFeedback() {
        setBuilderError("");
        setBuilderMessage("");
    }

    function handleSettingsChange<Field extends keyof Omit<QuizDraft, "imageName">>(
        field: Field,
        value: QuizDraft[Field],
    ) {
        clearFeedback();

        if (field === "accessType" && value === "private" && !isPremiumUser) {
            return;
        }

        if (field === "isPremium" && value === true && !isPremiumUser) {
            return;
        }

        setDraftField(field, value);
    }

    function handleDifficultyChange(value: QuizDifficulty) {
        handleSettingsChange("difficulty", value);
    }

    function handleAnswerModeChange(value: QuizAnswerMode) {
        handleSettingsChange("answerMode", value);
    }

    function handleShuffleQuestionsChange(value: boolean) {
        handleSettingsChange("shuffleQuestions", value);
    }

    function handleShuffleAnswersChange(value: boolean) {
        handleSettingsChange("shuffleAnswers", value);
    }

    function handleScoringModeChange(value: QuizScoringMode) {
        handleSettingsChange("scoringMode", value);
    }

    function handleManualPointsModeChange(value: QuizManualPointsMode) {
        handleSettingsChange("manualPointsMode", value);
    }

    function handleTopicModeChange(value: QuizCategoryMode) {
        clearFeedback();
        setDraftField("categoryMode", value);

        if (value === "custom" && !draft.customCategory.trim()) {
            setDraftField("customCategory", draft.presetCategory);
        }
    }

    function handlePresetCategoryChange(value: QuizCategory) {
        clearFeedback();
        setDraftField("presetCategory", value);
    }

    function handleCustomCategoryChange(value: string) {
        clearFeedback();
        setDraftField("customCategory", value);
    }

    function handleImageSelection(file: File | null) {
        clearFeedback();

        if (imagePreviewUrl) {
            URL.revokeObjectURL(imagePreviewUrl);
            setImagePreviewUrl("");
        }

        if (!file) {
            setDraftField("imageName", "");
            setDraftField("imageUrl", "");
            setSelectedImageFile(null);
            return;
        }

        const previewUrl = URL.createObjectURL(file);

        setSelectedImageFile(file);
        setDraftField("imageName", file.name);
        setDraftField("imageUrl", "");
        setImagePreviewUrl(previewUrl);
    }

    async function finalizeQuizSettings() {
        const normalizedDraft = normalizeQuizDraft(draft);
        const resolvedCategory = resolveQuizCategory(normalizedDraft);

        if (!normalizedDraft.title) {
            setBuilderError(SETTINGS_VALIDATION_MESSAGE);
            return;
        }

        if (!resolvedCategory) {
            setBuilderError(CATEGORY_VALIDATION_MESSAGE);
            return;
        }

        setIsSavingSettings(true);

        try {
            let nextDraft = normalizedDraft;

            if (selectedImageFile) {
                const uploadResult = await cdnService.uploadPhoto(
                    selectedImageFile,
                );

                nextDraft = {
                    ...nextDraft,
                    imageName: selectedImageFile.name,
                    imageUrl: uploadResult.url,
                };
            }

            saveSettingsDraft(nextDraft);
            setSelectedImageFile(null);
            setBuilderError("");
            setBuilderMessage("");
            router.push(getQuestionEditorRoute(mode, quizId));
        } catch (error) {
            setBuilderError(
                error instanceof Error
                    ? error.message
                    : "Failed to save quiz settings.",
            );
        } finally {
            setIsSavingSettings(false);
        }
    }

    function handleAccessTypeChange(value: QuizAccessType) {
        handleSettingsChange("accessType", value);
    }

    function handlePremiumQuizChange(value: boolean) {
        handleSettingsChange("isPremium", value);
    }

    function resetQuizDraft() {
        clearFeedback();

        if (imagePreviewUrl) {
            URL.revokeObjectURL(imagePreviewUrl);
            setImagePreviewUrl("");
        }

        setSelectedImageFile(null);
        resetStoredDraft();
    }

    return {
        hasHydrated,
        builderError,
        builderMessage,
        draft,
        imagePreviewUrl,
        isEditing,
        isInitializing: !hasHydrated || isBootstrappingEdit,
        isSavingSettings,
        isPremiumUser,
        preview: buildQuizPreview(draft),
        finalizeQuizSettings,
        handleAccessTypeChange,
        handleAnswerModeChange,
        handleCustomCategoryChange,
        handleDifficultyChange,
        handleImageSelection,
        handleManualPointsModeChange,
        handlePremiumQuizChange,
        handlePresetCategoryChange,
        handleShuffleAnswersChange,
        handleShuffleQuestionsChange,
        handleScoringModeChange,
        handleSettingsChange,
        handleTopicModeChange,
        resetQuizDraft,
    };
}
