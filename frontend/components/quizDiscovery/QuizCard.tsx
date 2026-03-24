"use client";

import Link from "next/link";
import { QuizModerationActions } from "../admin";
import type { QuizSummary } from "../../types/quiz.types";

interface QuizCardProps {
    onDeleteSuccess?: () => void;
    quiz: QuizSummary;
}

export function QuizCard({ onDeleteSuccess, quiz }: QuizCardProps) {
    const canOpenQuiz = quiz.access.canAttempt;
    const href = canOpenQuiz ? `/quizzes/${quiz.id}` : "/premium";
    const ctaLabel = canOpenQuiz ? "Open Quiz" : "Upgrade to Premium";
    const helperCopy =
        canOpenQuiz || !quiz.access.requiresPremium
            ? "Open quiz."
            : "Premium only.";

    return (
        <article
            className={`overflow-hidden rounded-[1.5rem] border ${
                canOpenQuiz
                    ? "border-indigo-200/10 bg-indigo-950/35"
                    : "border-amber-300/15 bg-indigo-950/35"
            }`}
        >
            <Link
                href={href}
                className={`group block transition ${
                    canOpenQuiz
                        ? "hover:bg-indigo-950/55"
                        : "hover:bg-indigo-950/55"
                }`}
                aria-label={`${ctaLabel}: ${quiz.title}`}
            >
                {quiz.imageUrl ? (
                    <div className="border-b border-indigo-200/10 bg-indigo-900/30 p-3">
                        <img
                            src={quiz.imageUrl}
                            alt={quiz.imageName || quiz.title}
                            className="h-44 w-full rounded-[1.25rem] object-cover"
                        />
                    </div>
                ) : null}

                <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm text-indigo-100/55">
                                {quiz.category}
                            </p>
                            <h3 className="mt-2 text-xl font-semibold text-white">
                                {quiz.title}
                            </h3>
                        </div>

                        <span className="rounded-full border border-indigo-200/15 bg-indigo-900/35 px-3 py-1 text-xs uppercase tracking-[0.18em] text-indigo-100/60">
                            {quiz.difficulty}
                        </span>
                    </div>

                    <p className="mt-4 text-sm leading-7 text-indigo-100/65">
                        {quiz.description}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                        <span className="rounded-full border border-indigo-200/10 bg-indigo-900/35 px-3 py-1 text-xs text-indigo-100/70">
                            {quiz.questionCount} questions
                        </span>
                        <span className="rounded-full border border-indigo-200/10 bg-indigo-900/35 px-3 py-1 text-xs text-indigo-100/70">
                            {quiz.totalPoints} points
                        </span>
                        {quiz.isPremium ? (
                            <span className="rounded-full border border-amber-300/20 bg-amber-400/10 px-3 py-1 text-xs text-amber-100">
                                Premium
                            </span>
                        ) : null}
                    </div>

                    <div className="mt-6 flex items-center justify-between gap-4 border-t border-indigo-200/10 pt-5">
                        <p className="text-sm leading-6 text-indigo-100/60">
                            {helperCopy}
                        </p>
                        <span
                            className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
                                canOpenQuiz
                                    ? "bg-indigo-100 text-indigo-950 group-hover:bg-white"
                                    : "bg-amber-100 text-amber-950 group-hover:bg-amber-50"
                            }`}
                        >
                            {ctaLabel}
                        </span>
                    </div>
                </div>
            </Link>
            <QuizModerationActions
                ownerId={quiz.ownerId}
                ownerName={quiz.ownerName}
                ownerQuizCreationBlocked={quiz.ownerQuizCreationBlocked}
                onDeleteSuccess={onDeleteSuccess}
                quizId={quiz.id}
            />
        </article>
    );
}
