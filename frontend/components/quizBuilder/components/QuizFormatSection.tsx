"use client";

import {
    quizAnswerModeOptions,
    quizDifficultyOptions,
} from "../../../lib/quizBuilder";
import type {
    QuizAnswerMode,
    QuizDifficulty,
    QuizDraft,
} from "../../../types/quiz.types";
import { getChoiceCardClassName, getChoiceButtonClassName } from "./styles";

interface QuizFormatSectionProps {
    draft: QuizDraft;
    handleAnswerModeChange: (value: QuizAnswerMode) => void;
    handleDifficultyChange: (value: QuizDifficulty) => void;
}

export function QuizFormatSection({
    draft,
    handleAnswerModeChange,
    handleDifficultyChange,
}: QuizFormatSectionProps) {
    return (
        <article className="rounded-[1.75rem] border border-indigo-200/10 bg-indigo-900/30 p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-indigo-200/55">
                Format
            </p>

            <div className="mt-4">
                <span className="block text-sm text-indigo-100/80">
                    Difficulty
                </span>
                <div className="mt-3 flex flex-wrap gap-3">
                    {quizDifficultyOptions.map((difficulty) => (
                        <button
                            key={difficulty}
                            type="button"
                            onClick={() => handleDifficultyChange(difficulty)}
                            className={getChoiceButtonClassName(
                                draft.difficulty === difficulty,
                            )}
                        >
                            {difficulty}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-5">
                <span className="block text-sm text-indigo-100/80">
                    Answer mode
                </span>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {quizAnswerModeOptions.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                                handleAnswerModeChange(option.value)
                            }
                            className={getChoiceCardClassName(
                                draft.answerMode === option.value,
                            )}
                        >
                            <span className="block text-sm font-semibold">
                                {option.label}
                            </span>
                            <span
                                className={`mt-2 block text-sm leading-6 ${
                                    draft.answerMode === option.value
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
        </article>
    );
}
