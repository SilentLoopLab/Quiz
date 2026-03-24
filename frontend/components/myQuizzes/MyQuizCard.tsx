"use client";

import Link from "next/link";
import type { QuizSummary } from "../../types/quiz.types";

interface MyQuizCardProps {
    isDeleting: boolean;
    onDelete: () => void;
    quiz: QuizSummary;
}

export function MyQuizCard({
    isDeleting,
    onDelete,
    quiz,
}: MyQuizCardProps) {
    return (
        <article className="overflow-hidden rounded-[1.5rem] border border-indigo-200/10 bg-indigo-950/35">
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
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p className="text-sm text-indigo-100/55">
                            {quiz.category}
                        </p>
                        <h2 className="mt-2 text-xl font-semibold text-white">
                            {quiz.title}
                        </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-indigo-200/15 bg-indigo-900/35 px-3 py-1 text-xs uppercase tracking-[0.18em] text-indigo-100/60">
                            {quiz.difficulty}
                        </span>
                        <Link
                            href={`/quizzes/${quiz.id}/edit`}
                            className="rounded-xl border border-indigo-200/15 bg-indigo-900/45 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-900/70"
                        >
                            Edit
                        </Link>
                        <button
                            type="button"
                            onClick={onDelete}
                            disabled={isDeleting}
                            className="rounded-xl border border-rose-300/20 bg-rose-950/30 px-3 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-950/50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                    </div>
                </div>

                <p className="mt-4 text-sm leading-7 text-indigo-100/65">
                    {quiz.description}
                </p>

                <div className="mt-5 flex flex-wrap gap-2 text-xs text-indigo-100/70">
                    <span className="rounded-full border border-indigo-200/10 bg-indigo-900/35 px-3 py-1">
                        {quiz.questionCount} questions
                    </span>
                    <span className="rounded-full border border-indigo-200/10 bg-indigo-900/35 px-3 py-1">
                        {quiz.totalPoints} points
                    </span>
                    <span className="rounded-full border border-indigo-200/10 bg-indigo-900/35 px-3 py-1 capitalize">
                        {quiz.accessType}
                    </span>
                    {quiz.isPremium ? (
                        <span className="rounded-full border border-amber-300/20 bg-amber-400/10 px-3 py-1 text-amber-100">
                            Premium
                        </span>
                    ) : null}
                </div>

                {quiz.share?.shareUrl ? (
                    <p className="mt-4 break-all text-sm text-indigo-100/60">
                        Share: {quiz.share.shareUrl}
                    </p>
                ) : null}
            </div>
        </article>
    );
}
