"use client";

import type {
    QuizQuestionValidationErrors,
} from "../helpers";
import type { QuizQuestionOptionDraft } from "../../../types/quiz.types";
import { getCorrectOptionClassName } from "./styles";

interface QuestionOptionsEditorProps {
    errors?: QuizQuestionValidationErrors;
    isDisabled?: boolean;
    onAddOption: () => void;
    onOptionCorrectChange: (optionId: string) => void;
    onOptionTextChange: (optionId: string, value: string) => void;
    onRemoveOption: (optionId: string) => void;
    options: QuizQuestionOptionDraft[];
}

export function QuestionOptionsEditor({
    errors,
    isDisabled = false,
    onAddOption,
    onOptionCorrectChange,
    onOptionTextChange,
    onRemoveOption,
    options,
}: QuestionOptionsEditorProps) {
    return (
        <div className="mt-5">
            <div className="flex items-center justify-between gap-3">
                <span className="block text-sm text-indigo-100/80">
                    Answer options
                </span>
                <button
                    type="button"
                    onClick={onAddOption}
                    disabled={isDisabled}
                    className="rounded-xl border border-indigo-200/15 bg-indigo-950/35 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-900/60 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    Add Option
                </button>
            </div>

            <div className="mt-3 space-y-3">
                {options.map((option) => (
                    <div
                        key={option.id}
                        className="rounded-2xl border border-indigo-200/10 bg-indigo-950/35 p-3"
                    >
                        <div className="flex flex-col gap-3 md:flex-row md:items-center">
                            <input
                                type="text"
                                disabled={isDisabled}
                                value={option.text}
                                onChange={(event) =>
                                    onOptionTextChange(
                                        option.id,
                                        event.target.value,
                                    )
                                }
                                placeholder="Answer option"
                                className="min-w-0 flex-1 rounded-xl border border-indigo-200/25 bg-indigo-950/50 px-4 py-3 text-white outline-none transition placeholder:text-indigo-100/40 focus:border-indigo-100/50 disabled:cursor-not-allowed disabled:opacity-60"
                            />

                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    disabled={isDisabled}
                                    onClick={() =>
                                        onOptionCorrectChange(option.id)
                                    }
                                    className={`${getCorrectOptionClassName(
                                        option.isCorrect,
                                    )} disabled:cursor-not-allowed disabled:opacity-60`}
                                >
                                    {option.isCorrect ? "Correct" : "Mark Correct"}
                                </button>

                                {options.length > 2 ? (
                                    <button
                                        type="button"
                                        disabled={isDisabled}
                                        onClick={() => onRemoveOption(option.id)}
                                        className="rounded-xl border border-rose-300/20 bg-rose-950/30 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-rose-100 transition hover:bg-rose-950/50 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        Remove
                                    </button>
                                ) : null}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {errors?.options ? (
                <p className="mt-3 text-sm text-red-200">{errors.options}</p>
            ) : null}

            {errors?.correctAnswers ? (
                <p className="mt-2 text-sm text-red-200">
                    {errors.correctAnswers}
                </p>
            ) : null}
        </div>
    );
}
