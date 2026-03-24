"use client";

import type { QuizSummary } from "../../types/quiz.types";
import { QuizCard } from "./QuizCard";

interface QuizCollectionProps {
    emptyDescription: string;
    emptyTitle: string;
    error?: string;
    isLoading?: boolean;
    onQuizDeleted?: (quizId: string) => void;
    quizzes: QuizSummary[];
}

export function QuizCollection({
    emptyDescription,
    emptyTitle,
    error = "",
    isLoading = false,
    onQuizDeleted,
    quizzes,
}: QuizCollectionProps) {
    if (error) {
        return (
            <p className="mt-6 rounded-xl border border-red-300/10 bg-red-950/30 px-4 py-3 text-sm text-red-200">
                {error}
            </p>
        );
    }

    if (isLoading) {
        return (
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
                {Array.from({ length: 4 }, (_, index) => (
                    <div
                        key={index}
                        className="h-64 animate-pulse rounded-[1.5rem] border border-indigo-200/10 bg-indigo-950/35"
                    />
                ))}
            </div>
        );
    }

    if (quizzes.length === 0) {
        return (
            <div className="mt-6 rounded-[1.5rem] border border-indigo-200/10 bg-indigo-950/35 p-6">
                <h3 className="text-xl font-semibold text-white">{emptyTitle}</h3>
                <p className="mt-3 text-sm leading-7 text-indigo-100/65">
                    {emptyDescription}
                </p>
            </div>
        );
    }

    return (
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
            {quizzes.map((quiz) => (
                <QuizCard
                    key={quiz.id}
                    onDeleteSuccess={() => onQuizDeleted?.(quiz.id)}
                    quiz={quiz}
                />
            ))}
        </div>
    );
}
