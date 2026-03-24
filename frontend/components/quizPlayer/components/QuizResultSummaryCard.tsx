"use client";

import type { QuizSubmissionResult } from "../../../types/quiz.types";
import { formatPoints } from "../helpers";

interface QuizResultSummaryCardProps {
    result: QuizSubmissionResult;
}

function formatAttemptDate(value: string) {
    if (!value) {
        return "";
    }

    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(parsedDate);
}

export function QuizResultSummaryCard({
    result,
}: QuizResultSummaryCardProps) {
    return (
        <div className="rounded-[1.5rem] border border-emerald-300/15 bg-emerald-950/20 p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-emerald-100/55">
                Quiz Result
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-white">
                {formatPoints(result.earnedPoints)} /{" "}
                {formatPoints(result.totalPoints)} pts
            </h2>
            <p className="mt-2 text-sm text-emerald-100/70">
                {formatPoints(result.percentage)}% score
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-emerald-100/45">
                        Correct
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                        {result.correctQuestions}
                    </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-emerald-100/45">
                        Incorrect
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                        {result.incorrectQuestions}
                    </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-emerald-100/45">
                        Answered
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                        {result.answeredQuestions} / {result.totalQuestions}
                    </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-emerald-100/45">
                        Unanswered
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                        {result.unansweredQuestions}
                    </p>
                </div>
            </div>

            {result.respondentName ? (
                <p className="mt-5 text-sm leading-7 text-emerald-100/75">
                    Submitted as <span className="font-semibold text-white">{result.respondentName}</span>
                </p>
            ) : null}

            <div className="mt-4 space-y-1 text-sm text-emerald-100/70">
                <p>Attempt #{result.attemptCount}</p>
                <p>
                    {result.isPersisted
                        ? `Last saved on ${formatAttemptDate(result.lastAttemptedAt)}`
                        : "This attempt is shown locally and was not saved to your account."}
                </p>
            </div>
        </div>
    );
}
