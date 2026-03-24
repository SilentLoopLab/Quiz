"use client";

import Link from "next/link";
import { useState } from "react";
import AppShell from "../navigation/AppShell";
import type { QuizSummary } from "../../types/quiz.types";
import { DeleteQuizModal } from "./DeleteQuizModal";
import { MyQuizCard } from "./MyQuizCard";
import { useMyQuizzes } from "./useMyQuizzes";

export default function MyQuizzesPage() {
    const [quizToDelete, setQuizToDelete] = useState<QuizSummary | null>(null);
    const {
        deletingQuizId,
        error,
        isLoading,
        quizzes,
        deleteQuiz,
    } = useMyQuizzes();

    return (
        <AppShell>
            <DeleteQuizModal
                isDeleting={deletingQuizId === quizToDelete?.id}
                isOpen={Boolean(quizToDelete)}
                onCancel={() => {
                    if (!deletingQuizId) {
                        setQuizToDelete(null);
                    }
                }}
                onConfirm={() => {
                    if (!quizToDelete) {
                        return;
                    }

                    void deleteQuiz(quizToDelete.id).then((wasDeleted) => {
                        if (wasDeleted) {
                            setQuizToDelete(null);
                        }
                    });
                }}
                quizTitle={quizToDelete?.title ?? ""}
            />

            <section className="rounded-[2rem] border border-indigo-200/15 bg-indigo-900/45 p-6 shadow-xl sm:p-8">
                <div className="rounded-[1.5rem] border border-indigo-200/10 bg-indigo-950/35 p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <p className="text-sm uppercase tracking-[0.3em] text-indigo-200/55">
                                My Quizzes
                            </p>
                            <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
                                My Quizzes
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm leading-7 text-indigo-100/65 sm:text-base">
                                Here you can see only your own quizzes and
                                quickly edit or delete them.
                            </p>
                        </div>

                        <Link
                            href="/quizzes/create"
                            className="inline-flex rounded-2xl bg-indigo-100 px-5 py-3 text-sm font-semibold text-indigo-950 transition hover:bg-white"
                        >
                            Add Quiz
                        </Link>
                    </div>

                    <p className="mt-4 rounded-xl border border-indigo-200/10 bg-indigo-900/25 px-4 py-3 text-sm text-indigo-100/75">
                        Edit opens the same two-step flow as quiz creation:
                        first settings, then full question editing.
                    </p>
                </div>

                {error ? (
                    <p className="mt-6 rounded-xl border border-red-300/10 bg-red-950/30 px-4 py-3 text-sm text-red-200">
                        {error}
                    </p>
                ) : null}

                {isLoading ? (
                    <div className="mt-6 grid gap-4 xl:grid-cols-2">
                        {Array.from({ length: 4 }, (_, index) => (
                            <div
                                key={index}
                                className="h-64 animate-pulse rounded-[1.5rem] border border-indigo-200/10 bg-indigo-950/35"
                            />
                        ))}
                    </div>
                ) : quizzes.length > 0 ? (
                    <div className="mt-6 grid gap-4 xl:grid-cols-2">
                        {quizzes.map((quiz) => (
                            <MyQuizCard
                                key={quiz.id}
                                isDeleting={deletingQuizId === quiz.id}
                                onDelete={() => setQuizToDelete(quiz)}
                                quiz={quiz}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="mt-6 rounded-[1.5rem] border border-indigo-200/10 bg-indigo-950/35 p-6">
                        <h2 className="text-xl font-semibold text-white">
                            You do not have quizzes yet
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-indigo-100/65">
                            Create your first quiz and it will appear here with
                            edit and delete controls.
                        </p>
                    </div>
                )}
            </section>
        </AppShell>
    );
}
