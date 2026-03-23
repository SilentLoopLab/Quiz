"use client";

import PremiumBadge from "../premium/PremiumBadge";
import { useQuizBuilder } from "./useQuizBuilder";
import {
    quizAnswerModeOptions,
    quizAccessTypeOptions,
    quizCategoryModeOptions,
    quizCategoryOptions,
    quizDifficultyOptions,
} from "../../lib/quizBuilder";

function getChoiceButtonClassName(isActive: boolean) {
    return [
        "rounded-full border px-4 py-2 text-sm font-medium transition",
        isActive
            ? "border-indigo-100/40 bg-indigo-100 text-indigo-950 shadow-lg shadow-indigo-950/15"
            : "border-indigo-200/15 bg-indigo-950/35 text-indigo-100/72 hover:border-indigo-100/30 hover:bg-indigo-900/60",
    ].join(" ");
}

function getChoiceCardClassName(isActive: boolean, isDisabled = false) {
    return [
        "rounded-2xl border p-4 text-left transition",
        isActive
            ? "border-indigo-100/35 bg-indigo-100 text-indigo-950 shadow-lg shadow-indigo-950/15"
            : "border-indigo-200/10 bg-indigo-950/35 text-white hover:border-indigo-100/25 hover:bg-indigo-900/50",
        isDisabled ? "cursor-not-allowed opacity-45 hover:border-indigo-200/10 hover:bg-indigo-950/35" : "cursor-pointer",
    ].join(" ");
}

export default function QuizBuilderPage() {
    const {
        hasHydrated,
        builderError,
        builderMessage,
        draft,
        imagePreviewUrl,
        isPremiumUser,
        preview,
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
    } = useQuizBuilder();

    if (!hasHydrated) {
        return (
            <section className="rounded-[2rem] border border-indigo-200/15 bg-indigo-900/45 p-6 text-center shadow-xl sm:p-8">
                <p className="text-sm uppercase tracking-[0.3em] text-indigo-200/55">
                    Quiz Builder
                </p>
                <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
                    Loading saved quiz settings
                </h1>
                <p className="mt-3 text-sm leading-7 text-indigo-100/65 sm:text-base">
                    Restoring your draft from localStorage.
                </p>
            </section>
        );
    }

    return (
        <section className="rounded-[2rem] border border-indigo-200/15 bg-indigo-900/45 p-6 shadow-xl sm:p-8">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
                <div className="rounded-[1.5rem] border border-indigo-200/10 bg-indigo-950/35 p-6">
                    <p className="text-sm uppercase tracking-[0.3em] text-indigo-200/55">
                        Quiz Builder
                    </p>
                    <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
                        Configure quiz settings
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-indigo-100/65 sm:text-base">
                        Build the quiz foundation first: title, topic, answer
                        mode, access, premium visibility, and cover image.
                    </p>

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
                                        handleSettingsChange(
                                            "title",
                                            event.target.value,
                                        )
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
                                            onClick={() =>
                                                handleTopicModeChange(option.value)
                                            }
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
                                            (option) =>
                                                option.value === draft.categoryMode,
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
                                                    handlePresetCategoryChange(
                                                        category,
                                                    )
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
                                            handleCustomCategoryChange(
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Frontend Architecture"
                                        className="w-full rounded-xl border border-indigo-200/25 bg-indigo-950/50 px-4 py-3 text-white outline-none transition placeholder:text-indigo-100/40 focus:border-indigo-100/50"
                                    />
                                </label>
                            )}
                        </article>

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
                                            onClick={() =>
                                                handleDifficultyChange(difficulty)
                                            }
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

                        <article className="rounded-[1.75rem] border border-indigo-200/10 bg-indigo-900/30 p-5">
                            <p className="text-sm uppercase tracking-[0.24em] text-indigo-200/55">
                                Access
                            </p>

                            <div className="mt-4">
                                <span className="block text-sm text-indigo-100/80">
                                    Access type
                                </span>
                                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                    {quizAccessTypeOptions.map((accessType) => {
                                        const isDisabled =
                                            accessType === "private" &&
                                            !isPremiumUser;

                                        return (
                                            <button
                                                key={accessType}
                                                type="button"
                                                onClick={() =>
                                                    handleAccessTypeChange(
                                                        accessType,
                                                    )
                                                }
                                                disabled={isDisabled}
                                                className={getChoiceCardClassName(
                                                    draft.accessType === accessType,
                                                    isDisabled,
                                                )}
                                            >
                                                <span className="block text-sm font-semibold capitalize">
                                                    {accessType}
                                                </span>
                                                <span
                                                    className={`mt-2 block text-sm leading-6 ${
                                                        draft.accessType ===
                                                        accessType
                                                            ? "text-indigo-950/75"
                                                            : "text-indigo-100/65"
                                                    }`}
                                                >
                                                    {accessType === "public"
                                                        ? "Visible to everyone who can access quizzes."
                                                        : "Restricted access for premium users."}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="mt-5">
                                <span className="block text-sm text-indigo-100/80">
                                    Premium audience
                                </span>
                                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handlePremiumQuizChange(false)
                                        }
                                        className={getChoiceCardClassName(
                                            !draft.isPremium,
                                        )}
                                    >
                                        <span className="block text-sm font-semibold">
                                            Free for everyone
                                        </span>
                                        <span
                                            className={`mt-2 block text-sm leading-6 ${
                                                !draft.isPremium
                                                    ? "text-indigo-950/75"
                                                    : "text-indigo-100/65"
                                            }`}
                                        >
                                            All users can open this quiz.
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handlePremiumQuizChange(true)}
                                        disabled={!isPremiumUser}
                                        className={getChoiceCardClassName(
                                            draft.isPremium,
                                            !isPremiumUser,
                                        )}
                                    >
                                        <span className="flex items-center gap-3 text-sm font-semibold">
                                            Premium only
                                            <PremiumBadge />
                                        </span>
                                        <span
                                            className={`mt-2 block text-sm leading-6 ${
                                                draft.isPremium
                                                    ? "text-indigo-950/75"
                                                    : "text-indigo-100/65"
                                            }`}
                                        >
                                            Only premium users can open this
                                            quiz.
                                        </span>
                                        {!isPremiumUser ? (
                                            <span className="mt-3 inline-flex rounded-full border border-amber-300/20 bg-amber-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-100">
                                                Premium required
                                            </span>
                                        ) : null}
                                    </button>
                                </div>
                            </div>
                        </article>

                        {!isPremiumUser ? (
                            <p className="rounded-xl border border-amber-300/10 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/85">
                                Private quizzes and premium-only quizzes are
                                available only for premium users.
                            </p>
                        ) : null}

                        <article className="rounded-[1.75rem] border border-indigo-200/10 bg-indigo-900/30 p-5">
                            <p className="text-sm uppercase tracking-[0.24em] text-indigo-200/55">
                                Cover
                            </p>
                            <label className="mt-4 block">
                                <span className="mb-2 block text-sm text-indigo-100/80">
                                    Cover image
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) =>
                                        handleImageSelection(
                                            event.target.files?.[0] ?? null,
                                        )
                                    }
                                    className="block w-full text-sm text-indigo-100/75 file:mr-4 file:rounded-xl file:border-0 file:bg-indigo-100 file:px-4 file:py-2 file:font-medium file:text-indigo-950"
                                />
                            </label>
                        </article>

                        {imagePreviewUrl ? (
                            <div className="rounded-2xl border border-indigo-200/10 bg-indigo-900/35 p-4">
                                <img
                                    src={imagePreviewUrl}
                                    alt={draft.imageName || "Quiz cover preview"}
                                    className="h-40 w-full rounded-xl object-cover"
                                />
                                <p className="mt-3 text-sm text-indigo-100/60">
                                    {draft.imageName}
                                </p>
                            </div>
                        ) : draft.imageName ? (
                            <div className="rounded-2xl border border-indigo-200/10 bg-indigo-900/35 p-4">
                                <p className="text-sm font-medium text-white">
                                    Saved image name
                                </p>
                                <p className="mt-3 text-sm leading-7 text-indigo-100/60">
                                    {draft.imageName}
                                </p>
                            </div>
                        ) : null}

                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={resetQuizDraft}
                                className="rounded-2xl border border-indigo-200/15 bg-indigo-950/40 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-950/70"
                            >
                                Reset Draft
                            </button>
                            <button
                                type="button"
                                onClick={finalizeQuizSettings}
                                className="rounded-2xl bg-indigo-100 px-5 py-3 text-sm font-semibold text-indigo-950 transition hover:bg-white"
                            >
                                Save Settings
                            </button>
                        </div>
                    </div>
                </div>

                <aside className="rounded-[1.5rem] border border-indigo-200/10 bg-indigo-950/35 p-6">
                    <p className="text-sm uppercase tracking-[0.24em] text-indigo-200/55">
                        Preview
                    </p>
                    <h2 className="mt-4 text-2xl font-semibold text-white">
                        Quiz settings
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-indigo-100/65">
                        This preview reflects the settings state in real time.
                    </p>

                    <pre className="mt-6 overflow-x-auto rounded-2xl border border-indigo-200/10 bg-indigo-950/60 p-4 text-xs leading-6 text-indigo-100/85">
                        {JSON.stringify(preview, null, 2)}
                    </pre>

                    <div className="mt-6 rounded-2xl border border-emerald-300/10 bg-emerald-950/20 p-4">
                        <p className="text-sm font-semibold text-emerald-100">
                            Local draft persistence
                        </p>
                        <p className="mt-2 text-sm leading-7 text-emerald-100/75">
                            These settings are stored with Zustand in
                            localStorage, so the draft stays after page refresh.
                        </p>
                    </div>
                </aside>
            </div>
        </section>
    );
}
