"use client";

import { useQuizBuilder } from "./useQuizBuilder";
import {
    AccessSection,
    CoverSection,
    IdentitySection,
    PreviewPanel,
    QuizFormatSection,
    ScoringSection,
    ShuffleSection,
} from "./components";
import type { QuizEditorMode } from "../../types/quiz.types";

interface QuizBuilderPageProps {
    mode?: QuizEditorMode;
    quizId?: string;
}

export default function QuizBuilderPage({
    mode = "create",
    quizId,
}: QuizBuilderPageProps) {
    const {
        availableTopics,
        builderError,
        builderMessage,
        draft,
        imagePreviewUrl,
        isEditing,
        isInitializing,
        isLoadingTopics,
        isSavingSettings,
        isPremiumUser,
        preview,
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
    } = useQuizBuilder({ mode, quizId });

    if (isInitializing) {
        return (
            <section className="rounded-[2rem] border border-indigo-200/15 bg-indigo-900/45 p-6 text-center shadow-xl sm:p-8">
                <p className="text-sm uppercase tracking-[0.3em] text-indigo-200/55">
                    {isEditing ? "Quiz Editing" : "Quiz Builder"}
                </p>
                <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
                    Loading settings
                </h1>
            </section>
        );
    }

    return (
        <section className="rounded-[2rem] border border-indigo-200/15 bg-indigo-900/45 p-6 shadow-xl sm:p-8 xl:p-10">
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1.5fr)_minmax(360px,0.9fr)] 2xl:gap-10 2xl:grid-cols-[minmax(0,1.62fr)_minmax(400px,0.92fr)]">
                <div className="rounded-[1.5rem] border border-indigo-200/10 bg-indigo-950/35 p-6">
                    <p className="text-sm uppercase tracking-[0.3em] text-indigo-200/55">
                        {isEditing ? "Quiz Editing" : "Quiz Builder"}
                    </p>
                    <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
                        {isEditing
                            ? "Update quiz settings"
                            : "Quiz settings"}
                    </h1>

                    {builderError ? (
                        <p className="mt-4 rounded-xl border border-red-300/10 bg-red-950/30 px-4 py-3 text-sm text-red-200">
                            {builderError}
                        </p>
                    ) : null}

                    {builderMessage ? (
                        <p className="mt-4 rounded-xl border border-emerald-300/10 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-100">
                            {builderMessage}
                        </p>
                    ) : null}

                    <div className="mt-6 space-y-5">
                        <IdentitySection
                            availableTopics={availableTopics}
                            draft={draft}
                            handleCustomCategoryChange={handleCustomCategoryChange}
                            handlePresetCategoryChange={handlePresetCategoryChange}
                            handleSettingsChange={handleSettingsChange}
                            handleTopicModeChange={handleTopicModeChange}
                            isLoadingTopics={isLoadingTopics}
                            topicsError={topicsError}
                        />
                        <QuizFormatSection
                            draft={draft}
                            handleAnswerModeChange={handleAnswerModeChange}
                            handleDifficultyChange={handleDifficultyChange}
                        />
                        <ShuffleSection
                            draft={draft}
                            handleShuffleAnswersChange={
                                handleShuffleAnswersChange
                            }
                            handleShuffleQuestionsChange={
                                handleShuffleQuestionsChange
                            }
                        />
                        <ScoringSection
                            draft={draft}
                            handleManualPointsModeChange={
                                handleManualPointsModeChange
                            }
                            handleScoringModeChange={handleScoringModeChange}
                        />
                        <AccessSection
                            draft={draft}
                            handleAccessTypeChange={handleAccessTypeChange}
                            handlePremiumQuizChange={handlePremiumQuizChange}
                            isPremiumUser={isPremiumUser}
                        />
                        <CoverSection
                            draftImageName={draft.imageName}
                            draftImageUrl={draft.imageUrl}
                            imagePreviewUrl={imagePreviewUrl}
                            isSavingSettings={isSavingSettings}
                            onImageSelection={handleImageSelection}
                            onResetDraft={resetQuizDraft}
                            onSaveSettings={finalizeQuizSettings}
                            resetLabel={
                                isEditing ? "Reset Editor" : "Reset Draft"
                            }
                            saveLabel={
                                isEditing
                                    ? "Save Settings and Continue"
                                    : "Save Settings and Continue"
                            }
                            savingLabel={
                                isEditing
                                    ? "Saving Settings..."
                                    : "Saving Settings..."
                            }
                        />
                    </div>
                </div>

                <PreviewPanel preview={preview} />
            </div>
        </section>
    );
}
