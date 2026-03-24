"use client";

import PremiumBadge from "../../premium/PremiumBadge";
import { quizAccessTypeOptions } from "../../../lib/quizBuilder";
import type { QuizAccessType, QuizDraft } from "../../../types/quiz.types";
import { getChoiceCardClassName } from "./styles";

interface AccessSectionProps {
    draft: QuizDraft;
    handleAccessTypeChange: (value: QuizAccessType) => void;
    handlePremiumQuizChange: (value: boolean) => void;
    isPremiumUser: boolean;
}

export function AccessSection({
    draft,
    handleAccessTypeChange,
    handlePremiumQuizChange,
    isPremiumUser,
}: AccessSectionProps) {
    return (
        <>
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
                                accessType === "private" && !isPremiumUser;

                            return (
                                <button
                                    key={accessType}
                                    type="button"
                                    onClick={() =>
                                        handleAccessTypeChange(accessType)
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
                                            draft.accessType === accessType
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
                            onClick={() => handlePremiumQuizChange(false)}
                            className={getChoiceCardClassName(!draft.isPremium)}
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
                                Only premium users can open this quiz.
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
                    Private quizzes and premium-only quizzes are available only
                    for premium users.
                </p>
            ) : null}
        </>
    );
}
