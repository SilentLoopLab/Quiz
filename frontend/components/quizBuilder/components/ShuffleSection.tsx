"use client";

import type { QuizDraft } from "../../../types/quiz.types";
import { getChoiceCardClassName } from "./styles";

interface ShuffleSectionProps {
    draft: QuizDraft;
    handleShuffleAnswersChange: (value: boolean) => void;
    handleShuffleQuestionsChange: (value: boolean) => void;
}

export function ShuffleSection({
    draft,
    handleShuffleAnswersChange,
    handleShuffleQuestionsChange,
}: ShuffleSectionProps) {
    return (
        <article className="rounded-[1.75rem] border border-indigo-200/10 bg-indigo-900/30 p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-indigo-200/55">
                Shuffle
            </p>

            <div className="mt-4">
                <span className="block text-sm text-indigo-100/80">
                    Shuffle questions
                </span>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <button
                        type="button"
                        onClick={() => handleShuffleQuestionsChange(false)}
                        className={getChoiceCardClassName(
                            !draft.shuffleQuestions,
                        )}
                    >
                        <span className="block text-sm font-semibold">
                            Keep order
                        </span>
                        <span
                            className={`mt-2 block text-sm leading-6 ${
                                !draft.shuffleQuestions
                                    ? "text-indigo-950/75"
                                    : "text-indigo-100/65"
                            }`}
                        >
                            Keep your order.
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleShuffleQuestionsChange(true)}
                        className={getChoiceCardClassName(
                            draft.shuffleQuestions,
                        )}
                    >
                        <span className="block text-sm font-semibold">
                            Shuffle
                        </span>
                        <span
                            className={`mt-2 block text-sm leading-6 ${
                                draft.shuffleQuestions
                                    ? "text-indigo-950/75"
                                    : "text-indigo-100/65"
                            }`}
                        >
                            Name stays first.
                        </span>
                    </button>
                </div>
            </div>

            <div className="mt-5">
                <span className="block text-sm text-indigo-100/80">
                    Shuffle answers
                </span>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <button
                        type="button"
                        onClick={() => handleShuffleAnswersChange(false)}
                        className={getChoiceCardClassName(
                            !draft.shuffleAnswers,
                        )}
                    >
                        <span className="block text-sm font-semibold">
                            Keep order
                        </span>
                        <span
                            className={`mt-2 block text-sm leading-6 ${
                                !draft.shuffleAnswers
                                    ? "text-indigo-950/75"
                                    : "text-indigo-100/65"
                            }`}
                        >
                            Keep your order.
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleShuffleAnswersChange(true)}
                        className={getChoiceCardClassName(
                            draft.shuffleAnswers,
                        )}
                    >
                        <span className="block text-sm font-semibold">
                            Shuffle
                        </span>
                        <span
                            className={`mt-2 block text-sm leading-6 ${
                                draft.shuffleAnswers
                                    ? "text-indigo-950/75"
                                    : "text-indigo-100/65"
                            }`}
                        >
                            Random order.
                        </span>
                    </button>
                </div>
            </div>
        </article>
    );
}
