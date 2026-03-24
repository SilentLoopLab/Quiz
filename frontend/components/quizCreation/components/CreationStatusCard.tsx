"use client";

import type { QuizManageQuiz } from "../../../types/quiz.types";
import { formatPoints } from "./styles";

interface CreationStatusCardProps {
    createdQuiz: QuizManageQuiz | null;
    creationError: string;
    creationMessage: string;
}

export function CreationStatusCard({
    createdQuiz,
    creationError,
    creationMessage,
}: CreationStatusCardProps) {
    return (
        <>
            {creationError ? (
                <p className="mt-4 rounded-xl border border-red-300/10 bg-red-950/30 px-4 py-3 text-sm text-red-200">
                    {creationError}
                </p>
            ) : null}

            {creationMessage ? (
                <p className="mt-4 rounded-xl border border-emerald-300/10 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-100">
                    {creationMessage}
                </p>
            ) : null}

            {createdQuiz ? (
                <div className="mt-4 rounded-[1.5rem] border border-emerald-300/15 bg-emerald-950/20 p-5">
                    <p className="text-sm uppercase tracking-[0.24em] text-emerald-100/60">
                        Quiz Saved
                    </p>
                    <h2 className="mt-3 text-xl font-semibold text-white">
                        {createdQuiz.title}
                    </h2>
                    <div className="mt-4 space-y-2 text-sm text-emerald-100/80">
                        <p>
                            <span className="text-emerald-100/55">
                                Quiz ID:
                            </span>{" "}
                            {createdQuiz.id}
                        </p>
                        <p>
                            <span className="text-emerald-100/55">
                                Total points:
                            </span>{" "}
                            {formatPoints(createdQuiz.totalPoints)}
                        </p>
                        <p>
                            <span className="text-emerald-100/55">
                                Questions:
                            </span>{" "}
                            {createdQuiz.questionCount}
                        </p>
                        {createdQuiz.access.share.shareUrl ? (
                            <p className="break-all">
                                <span className="text-emerald-100/55">
                                    Share link:
                                </span>{" "}
                                {createdQuiz.access.share.shareUrl}
                            </p>
                        ) : null}
                    </div>
                </div>
            ) : null}
        </>
    );
}
