"use client";

import {
    quizManualPointsModeOptions,
    quizScoringModeOptions,
} from "../../../lib/quizBuilder";
import type {
    QuizDraft,
    QuizManualPointsMode,
    QuizScoringMode,
} from "../../../types/quiz.types";
import { getChoiceCardClassName } from "./styles";

interface ScoringSectionProps {
    draft: QuizDraft;
    handleManualPointsModeChange: (value: QuizManualPointsMode) => void;
    handleScoringModeChange: (value: QuizScoringMode) => void;
}

export function ScoringSection({
    draft,
    handleManualPointsModeChange,
    handleScoringModeChange,
}: ScoringSectionProps) {
    return (
        <article className="rounded-[1.75rem] border border-indigo-200/10 bg-indigo-900/30 p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-indigo-200/55">
                Scoring
            </p>

            <div className="mt-4">
                <span className="block text-sm text-indigo-100/80">
                    Scoring mode
                </span>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {quizScoringModeOptions.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                                handleScoringModeChange(option.value)
                            }
                            className={getChoiceCardClassName(
                                draft.scoringMode === option.value,
                            )}
                        >
                            <span className="block text-sm font-semibold">
                                {option.label}
                            </span>
                            <span
                                className={`mt-2 block text-sm leading-6 ${
                                    draft.scoringMode === option.value
                                        ? "text-indigo-950/75"
                                        : "text-indigo-100/65"
                                }`}
                            >
                                {option.description}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {draft.scoringMode === "manual" ? (
                <div className="mt-5">
                    <span className="block text-sm text-indigo-100/80">
                        Manual points format
                    </span>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        {quizManualPointsModeOptions.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() =>
                                    handleManualPointsModeChange(option.value)
                                }
                                className={getChoiceCardClassName(
                                    draft.manualPointsMode === option.value,
                                )}
                            >
                                <span className="block text-sm font-semibold">
                                    {option.label}
                                </span>
                                <span
                                    className={`mt-2 block text-sm leading-6 ${
                                        draft.manualPointsMode === option.value
                                            ? "text-indigo-950/75"
                                            : "text-indigo-100/65"
                                    }`}
                                >
                                    {option.description}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            ) : null}
        </article>
    );
}
