"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    buildQuizPreview,
    normalizeQuizDraft,
    resolveQuizCategory,
} from "../../lib/quizBuilder";
import { cdnService } from "../../services/cdn.service";
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
import { useQuizEditorSession } from "../quizEditor";
import { useQuizTopics } from "./useQuizTopics";

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
    const saveSettingsDraft = useQuizBuilderStore(
        (state) => state.saveSettingsDraft,
    );
    const setDraftField = useQuizBuilderStore((state) => state.setDraftField);
    const resetStoredDraft = useQuizBuilderStore((state) => state.resetDraft);
    const [builderError, setBuilderError] = useState("");
    const [builderMessage, setBuilderMessage] = useState("");
    const [imagePreviewUrl, setImagePreviewUrl] = useState("");
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(
        null,
    );
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const isPremiumUser = user?.premium === true;
    const {
        clearSessionError,
        hasHydrated,
        isBootstrappingEdit,
        isEditing,
        sessionError,
        sessionVersion,
        storeMode,
    } = useQuizEditorSession({
        mode,
        quizId,
        loadErrorMessage: "Failed to load quiz settings.",
        missingQuizIdMessage: "Quiz ID is required to edit the quiz.",
    });
    const {
        availableTopics,
        isLoadingTopics,
        topicsError,
    } = useQuizTopics(draft.presetCategory);

    useEffect(() => {
        return () => {
            if (imagePreviewUrl) {
                URL.revokeObjectURL(imagePreviewUrl);
            }
        };
    }, [imagePreviewUrl]);

    useEffect(() => {
        if (!hasHydrated || isEditing || storeMode !== "edit") {
            return;
        }

        resetStoredDraft();
    }, [hasHydrated, isEditing, resetStoredDraft, storeMode]);

    useEffect(() => {
        if (!isEditing || sessionVersion === 0) {
            return;
        }

        setSelectedImageFile(null);
        setImagePreviewUrl((currentPreviewUrl) => {
            if (currentPreviewUrl) {
                URL.revokeObjectURL(currentPreviewUrl);
            }

            return "";
        });
    }, [isEditing, sessionVersion]);

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
                    "Premium settings were changed to public.",
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

    useEffect(() => {
        if (
            !hasHydrated ||
            isBootstrappingEdit ||
            draft.categoryMode !== "preset" ||
            draft.presetCategory.trim() ||
            availableTopics.length === 0
        ) {
            return;
        }

        setDraftField("presetCategory", availableTopics[0]);
    }, [
        availableTopics,
        draft.categoryMode,
        draft.presetCategory,
        hasHydrated,
        isBootstrappingEdit,
        setDraftField,
    ]);

    function clearFeedback() {
        setBuilderError("");
        setBuilderMessage("");
        clearSessionError();
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
        availableTopics,
        hasHydrated,
        builderError: builderError || sessionError,
        builderMessage,
        draft,
        imagePreviewUrl,
        isEditing,
        isInitializing: !hasHydrated || isBootstrappingEdit,
        isLoadingTopics,
        isSavingSettings,
        isPremiumUser,
        preview: buildQuizPreview(draft),
        topicsError,
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
