"use client";

import { useEffect, useState } from "react";
import {
    buildQuizPreview,
    normalizeQuizDraft,
    resolveQuizCategory,
} from "../../lib/quizBuilder";
import { useAuthStore } from "../../store/authStore";
import { useQuizBuilderStore } from "../../store/quizBuilderStore";
import type {
    QuizAccessType,
    QuizAnswerMode,
    QuizCategory,
    QuizCategoryMode,
    QuizDifficulty,
    QuizDraft,
} from "../../types/quiz.types";

const SETTINGS_VALIDATION_MESSAGE =
    "Add a quiz title before saving quiz settings.";
const CATEGORY_VALIDATION_MESSAGE =
    "Choose a topic or write your own topic before saving quiz settings.";

export function useQuizBuilder() {
    const user = useAuthStore((state) => state.user);
    const draft = useQuizBuilderStore((state) => state.draft);
    const hasHydrated = useQuizBuilderStore((state) => state.hasHydrated);
    const setDraftField = useQuizBuilderStore((state) => state.setDraftField);
    const resetStoredDraft = useQuizBuilderStore((state) => state.resetDraft);
    const [builderError, setBuilderError] = useState("");
    const [builderMessage, setBuilderMessage] = useState("");
    const [imagePreviewUrl, setImagePreviewUrl] = useState("");
    const isPremiumUser = user?.premium === true;

    useEffect(() => {
        return () => {
            if (imagePreviewUrl) {
                URL.revokeObjectURL(imagePreviewUrl);
            }
        };
    }, [imagePreviewUrl]);

    useEffect(() => {
        if (isPremiumUser) {
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
    }, [draft.accessType, draft.isPremium, isPremiumUser, setDraftField]);

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
            return;
        }

        const previewUrl = URL.createObjectURL(file);

        setDraftField("imageName", file.name);
        setImagePreviewUrl(previewUrl);
    }

    function finalizeQuizSettings() {
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

        setDraftField("title", normalizedDraft.title);
        setDraftField("customCategory", normalizedDraft.customCategory);
        setDraftField("imageName", normalizedDraft.imageName);
        setBuilderError("");
        setBuilderMessage(
            "Quiz settings are saved locally and will stay after page refresh.",
        );
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

        resetStoredDraft();
    }

    return {
        hasHydrated,
        builderError,
        builderMessage,
        draft,
        imagePreviewUrl,
        isPremiumUser,
        preview: buildQuizPreview(draft),
        finalizeQuizSettings,
        handleAccessTypeChange,
        handleAnswerModeChange,
        handleCustomCategoryChange,
        handleDifficultyChange,
        handleImageSelection,
        handlePremiumQuizChange,
        handlePresetCategoryChange,
        handleSettingsChange,
        handleTopicModeChange,
        resetQuizDraft,
    };
}
