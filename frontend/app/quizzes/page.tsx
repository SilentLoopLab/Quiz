"use client";

import Link from "next/link";
import AppShell from "../../components/navigation/AppShell";
import {
    PaginationControls,
    QuizCollection,
    TopicFilters,
} from "../../components/quizDiscovery";
import { useAuthReady } from "../../hooks/useAuthReady";
import { usePublicQuizCatalog } from "../../hooks/usePublicQuizCatalog";

export default function QuizzesPage() {
    const authReady = useAuthReady();
    const quizCatalog = usePublicQuizCatalog({
        limit: 8,
        enabled: authReady,
    });
    const filters = ["All", ...quizCatalog.availableTopics];

    return (
        <AppShell>
            <section className="rounded-[2rem] border border-indigo-200/15 bg-indigo-900/45 p-6 shadow-xl sm:p-8">
                <div className="rounded-[1.5rem] border border-indigo-200/10 bg-indigo-950/35 p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <p className="text-sm uppercase tracking-[0.3em] text-indigo-200/55">
                                All Quizzes
                            </p>
                            <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
                                All Quizzes
                            </h1>
                        </div>

                        <Link
                            href="/quizzes/create"
                            className="inline-flex rounded-2xl bg-indigo-100 px-5 py-3 text-sm font-semibold text-indigo-950 transition hover:bg-white"
                        >
                            Add Quiz
                        </Link>
                    </div>
                </div>

                <div className="mt-6 rounded-[1.5rem] border border-indigo-200/10 bg-indigo-950/35 p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-sm uppercase tracking-[0.24em] text-indigo-200/55">
                                Topics
                            </p>
                            <h2 className="mt-3 text-2xl font-semibold text-white">
                                All topics
                            </h2>
                        </div>

                        <p className="text-sm text-indigo-100/65">
                            {quizCatalog.counts
                                ? `${quizCatalog.counts.filteredQuizzes} of ${quizCatalog.counts.totalQuizzes} quizzes`
                                : "Loading quizzes..."}
                        </p>
                    </div>

                    <TopicFilters
                        activeTopic={quizCatalog.activeTopic || "All"}
                        filters={filters}
                        isLoading={!authReady || quizCatalog.isLoading}
                        onTopicChange={(topic) =>
                            quizCatalog.setActiveTopic(
                                topic === "All" ? "" : topic,
                            )
                        }
                    />

                    <QuizCollection
                        emptyDescription="No quizzes yet."
                        emptyTitle="No quizzes"
                        error={quizCatalog.error}
                        isLoading={!authReady || quizCatalog.isLoading}
                        onQuizDeleted={quizCatalog.removeQuiz}
                        quizzes={quizCatalog.quizzes}
                    />

                    <PaginationControls
                        isLoading={!authReady || quizCatalog.isLoading}
                        onPageChange={quizCatalog.goToPage}
                        pagination={quizCatalog.pagination}
                    />
                </div>
            </section>
        </AppShell>
    );
}
