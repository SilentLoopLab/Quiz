"use client";

import {
    quizCategoryModeOptions,
    quizCategoryOptions,
} from "../../../lib/quizBuilder";
import type {
    QuizCategory,
    QuizCategoryMode,
    QuizDraft,
} from "../../../types/quiz.types";
import { getChoiceButtonClassName } from "./styles";

interface IdentitySectionProps {
    draft: QuizDraft;
    handleCustomCategoryChange: (value: string) => void;
    handlePresetCategoryChange: (value: QuizCategory) => void;
    handleSettingsChange: <Field extends keyof Omit<QuizDraft, "imageName">>(
        field: Field,
        value: QuizDraft[Field],
    ) => void;
    handleTopicModeChange: (value: QuizCategoryMode) => void;
}

export function IdentitySection({
    draft,
    handleCustomCategoryChange,
    handlePresetCategoryChange,
    handleSettingsChange,
    handleTopicModeChange,
}: IdentitySectionProps) {
    return (
        <article className="rounded-[1.75rem] border border-indigo-200/10 bg-indigo-900/30 p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-indigo-200/55">
                Identity
            </p>
            <label className="mt-4 block">
                <span className="mb-2 block text-sm text-indigo-100/80">
                    Title
                </span>
                <input
                    type="text"
                    value={draft.title}
                    onChange={(event) =>
                        handleSettingsChange("title", event.target.value)
                    }
                    placeholder="React Hooks Master"
                    className="w-full rounded-xl border border-indigo-200/25 bg-indigo-950/50 px-4 py-3 text-white outline-none transition placeholder:text-indigo-100/40 focus:border-indigo-100/50"
                />
            </label>

            <div className="mt-5">
                <span className="block text-sm text-indigo-100/80">
                    Topic source
                </span>
                <div className="mt-3 flex flex-wrap gap-3">
                    {quizCategoryModeOptions.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => handleTopicModeChange(option.value)}
                            className={getChoiceButtonClassName(
                                draft.categoryMode === option.value,
                            )}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
                <p className="mt-3 text-sm leading-7 text-indigo-100/60">
                    {
                        quizCategoryModeOptions.find(
                            (option) => option.value === draft.categoryMode,
                        )?.description
                    }
                </p>
            </div>

            {draft.categoryMode === "preset" ? (
                <div className="mt-5">
                    <span className="block text-sm text-indigo-100/80">
                        Topic
                    </span>
                    <div className="mt-3 flex flex-wrap gap-3">
                        {quizCategoryOptions.map((category) => (
                            <button
                                key={category}
                                type="button"
                                onClick={() =>
                                    handlePresetCategoryChange(category)
                                }
                                className={getChoiceButtonClassName(
                                    draft.presetCategory === category,
                                )}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <label className="mt-5 block">
                    <span className="mb-2 block text-sm text-indigo-100/80">
                        Custom topic
                    </span>
                    <input
                        type="text"
                        value={draft.customCategory}
                        onChange={(event) =>
                            handleCustomCategoryChange(event.target.value)
                        }
                        placeholder="Frontend Architecture"
                        className="w-full rounded-xl border border-indigo-200/25 bg-indigo-950/50 px-4 py-3 text-white outline-none transition placeholder:text-indigo-100/40 focus:border-indigo-100/50"
                    />
                </label>
            )}
        </article>
    );
}
