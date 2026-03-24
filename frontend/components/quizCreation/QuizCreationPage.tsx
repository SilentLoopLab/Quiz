"use client";

import { useQuizCreation } from "./useQuizCreation";
import {
    ChoiceQuestionCard,
    CreationHeader,
    CreationStatusCard,
    IdentityQuestionCard,
    QuestionActions,
    SavedSettingsPanel,
} from "./components";
import type { QuizEditorMode } from "../../types/quiz.types";

interface QuizCreationPageProps {
    mode?: QuizEditorMode;
    quizId?: string;
}

export default function QuizCreationPage({
    mode = "create",
    quizId,
}: QuizCreationPageProps) {
    const {
        canCreateQuiz,
        createdQuiz,
        creationError,
        creationMessage,
        editorMode,
        hasHydrated,
        isEditing,
        isInitializing,
        isCreatingQuiz,
        isLocked,
        questionPointsPreview,
        questionErrors,
        questions,
        regularQuestionCount,
        savedQuizId,
        saveQuiz,
        settingsRoute,
        questionSettings,
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
        unlockEditor,
        validateQuestions,
    } = useQuizCreation({ mode, quizId });

    if (isInitializing) {
        return (
            <section className="rounded-[2rem] border border-indigo-200/15 bg-indigo-900/45 p-6 text-center shadow-xl sm:p-8">
                <p className="text-sm uppercase tracking-[0.3em] text-indigo-200/55">
                    {isEditing ? "Quiz Editing" : "Quiz Creation"}
                </p>
                <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
                    Loading questions
                </h1>
            </section>
        );
    }

    if (!canCreateQuiz) {
        return (
            <section className="rounded-[2rem] border border-indigo-200/15 bg-indigo-900/45 p-6 text-center shadow-xl sm:p-8">
                <p className="text-sm uppercase tracking-[0.3em] text-indigo-200/55">
                    {isEditing ? "Quiz Editing" : "Quiz Creation"}
                </p>
                <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
                    Redirecting
                </h1>
            </section>
        );
    }

    return (
        <section className="rounded-[2rem] border border-indigo-200/15 bg-indigo-900/45 p-6 shadow-xl sm:p-8 xl:p-10">
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1.5fr)_minmax(360px,0.9fr)] 2xl:gap-10 2xl:grid-cols-[minmax(0,1.62fr)_minmax(400px,0.92fr)]">
                <div className="rounded-[1.5rem] border border-indigo-200/10 bg-indigo-950/35 p-6">
                    <CreationHeader
                        isLocked={isLocked}
                        mode={editorMode}
                        settingsRoute={settingsRoute}
                    />
                    <CreationStatusCard
                        createdQuiz={createdQuiz}
                        creationError={creationError}
                        creationMessage={creationMessage}
                    />

                    <div className="mt-6 space-y-5">
                        {questions.map((question, index) => {
                            const errors = questionErrors[question.id];
                            const questionPoints =
                                questionPointsPreview.questions[index]?.points ??
                                null;

                            if (question.kind === "respondent_name") {
                                return (
                                    <IdentityQuestionCard
                                        key={question.id}
                                        prompt={question.prompt}
                                    />
                                );
                            }

                            return (
                                <ChoiceQuestionCard
                                    key={question.id}
                                    answerMode={questionSettings.answerMode}
                                    errors={errors}
                                    index={index}
                                    isLocked={isLocked}
                                    manualPointsMode={
                                        questionSettings.manualPointsMode
                                    }
                                    onAddOption={() => addOption(question.id)}
                                    onManualPointsChange={(value) =>
                                        handleQuestionManualPointsChange(
                                            question.id,
                                            value,
                                        )
                                    }
                                    onOptionCorrectChange={(optionId) =>
                                        handleOptionCorrectChange(
                                            question.id,
                                            optionId,
                                        )
                                    }
                                    onOptionTextChange={(optionId, value) =>
                                        handleOptionTextChange(
                                            question.id,
                                            optionId,
                                            value,
                                        )
                                    }
                                    onPromptChange={(value) =>
                                        handleQuestionPromptChange(
                                            question.id,
                                            value,
                                        )
                                    }
                                    onQuestionImageChange={(file) =>
                                        handleQuestionImageChange(
                                            question.id,
                                            file,
                                        )
                                    }
                                    onRemoveOption={(optionId) =>
                                        removeOption(question.id, optionId)
                                    }
                                    onRemoveQuestion={() =>
                                        removeQuestion(question.id)
                                    }
                                    onRequiredChange={(isRequired) =>
                                        handleQuestionRequiredChange(
                                            question.id,
                                            isRequired,
                                        )
                                    }
                                    question={question}
                                    questionPoints={questionPoints}
                                    regularQuestionCount={regularQuestionCount}
                                    scoringMode={questionSettings.scoringMode}
                                    totalPoints={
                                        questionPointsPreview.totalPoints
                                    }
                                />
                            );
                        })}

                        <QuestionActions
                            createdQuizExists={Boolean(createdQuiz)}
                            editorMode={editorMode}
                            isCreatingQuiz={isCreatingQuiz}
                            isLocked={isLocked}
                            onAddQuestion={addQuestion}
                            onResetQuestions={resetQuestions}
                            onReviewQuizDraft={validateQuestions}
                            onSaveQuiz={saveQuiz}
                            onUnlockEditor={unlockEditor}
                            savedQuizId={savedQuizId}
                        />
                    </div>
                </div>

                <aside className="space-y-6">
                    <SavedSettingsPanel
                        questionSettings={questionSettings}
                        totalPoints={questionPointsPreview.totalPoints}
                    />
                </aside>
            </div>
        </section>
    );
}
