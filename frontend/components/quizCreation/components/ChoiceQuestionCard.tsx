"use client";

import type {
    QuizQuestionValidationErrors,
} from "../helpers";
import type {
    QuizAnswerMode,
    QuizManualPointsMode,
    QuizQuestionDraft,
    QuizScoringMode,
} from "../../../types/quiz.types";
import { QuestionImageField } from "./QuestionImageField";
import { QuestionOptionsEditor } from "./QuestionOptionsEditor";
import { QuestionScoringCard } from "./QuestionScoringCard";
import { getRequirementButtonClassName, formatPoints } from "./styles";

interface ChoiceQuestionCardProps {
    answerMode: QuizAnswerMode;
    errors?: QuizQuestionValidationErrors;
    index: number;
    isLocked?: boolean;
    manualPointsMode: QuizManualPointsMode;
    onAddOption: () => void;
    onManualPointsChange: (value: string) => void;
    onOptionCorrectChange: (optionId: string) => void;
    onOptionTextChange: (optionId: string, value: string) => void;
    onPromptChange: (value: string) => void;
    onQuestionImageChange: (file: File | null) => void;
    onRemoveOption: (optionId: string) => void;
    onRemoveQuestion: () => void;
    onRequiredChange: (isRequired: boolean) => void;
    question: QuizQuestionDraft;
    questionPoints: number | null;
    regularQuestionCount: number;
    scoringMode: QuizScoringMode;
    totalPoints: number;
}

export function ChoiceQuestionCard({
    answerMode,
    errors,
    index,
    isLocked = false,
    manualPointsMode,
    onAddOption,
    onManualPointsChange,
    onOptionCorrectChange,
    onOptionTextChange,
    onPromptChange,
    onQuestionImageChange,
    onRemoveOption,
    onRemoveQuestion,
    onRequiredChange,
    question,
    questionPoints,
    regularQuestionCount,
    scoringMode,
    totalPoints,
}: ChoiceQuestionCardProps) {
    return (
        <article className="rounded-[1.75rem] border border-indigo-200/10 bg-indigo-900/30 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-indigo-200/55">
                        Question {index + 1}
                    </p>
                    <p className="mt-2 text-sm text-indigo-100/65">
                        {answerMode === "single"
                            ? "Single answer"
                            : "Multiple answers"}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            disabled={isLocked}
                            onClick={() => onRequiredChange(true)}
                            className={getRequirementButtonClassName(
                                question.isRequired,
                            )}
                        >
                            Required
                        </button>
                        <button
                            type="button"
                            disabled={isLocked}
                            onClick={() => onRequiredChange(false)}
                            className={getRequirementButtonClassName(
                                !question.isRequired,
                        )}
                    >
                        Optional
                    </button>
                    {scoringMode === "automatic" ? (
                        <span className="rounded-2xl border border-emerald-300/20 bg-emerald-950/30 px-4 py-2.5 text-sm font-semibold text-emerald-100">
                            Auto: {formatPoints(questionPoints ?? 0)} pts
                        </span>
                    ) : null}
                    {regularQuestionCount > 1 ? (
                        <button
                            type="button"
                            disabled={isLocked}
                            onClick={onRemoveQuestion}
                            className="rounded-2xl border border-rose-300/20 bg-rose-950/30 px-4 py-2.5 text-sm font-semibold text-rose-100 transition hover:bg-rose-950/50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Remove Question
                        </button>
                    ) : null}
                </div>
            </div>

            <label className="mt-5 block">
                <span className="mb-2 block text-sm text-indigo-100/80">
                    Question text
                </span>
                <textarea
                    disabled={isLocked}
                    value={question.prompt}
                    onChange={(event) => onPromptChange(event.target.value)}
                    placeholder="Type question"
                    rows={3}
                    className="w-full rounded-xl border border-indigo-200/25 bg-indigo-950/50 px-4 py-3 text-white outline-none transition placeholder:text-indigo-100/40 focus:border-indigo-100/50 disabled:cursor-not-allowed disabled:opacity-60"
                />
            </label>

            {errors?.prompt ? (
                <p className="mt-2 text-sm text-red-200">{errors.prompt}</p>
            ) : null}

            <QuestionImageField
                imageName={question.imageName}
                imagePreviewUrl={question.imagePreviewUrl}
                index={index}
                isDisabled={isLocked}
                onImageChange={onQuestionImageChange}
            />
            <QuestionScoringCard
                error={errors?.points}
                isDisabled={isLocked}
                manualPoints={question.manualPoints}
                manualPointsMode={manualPointsMode}
                onManualPointsChange={onManualPointsChange}
                questionPoints={questionPoints}
                scoringMode={scoringMode}
                totalPoints={totalPoints}
            />
            <QuestionOptionsEditor
                errors={errors}
                isDisabled={isLocked}
                onAddOption={onAddOption}
                onOptionCorrectChange={onOptionCorrectChange}
                onOptionTextChange={onOptionTextChange}
                onRemoveOption={onRemoveOption}
                options={question.options}
            />
        </article>
    );
}
