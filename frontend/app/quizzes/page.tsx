"use client";

import Link from "next/link";
import AppShell from "../../components/navigation/AppShell";
import {
    PaginationControls,
    QuizCollection,
    TopicFilters,
} from "../../components/quizDiscovery";
import { usePublicQuizCatalog } from "../../hooks/usePublicQuizCatalog";

export default function QuizzesPage() {
    const quizCatalog = usePublicQuizCatalog({ limit: 8 });
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
                            <p className="mt-3 max-w-2xl text-sm leading-7 text-indigo-100/65 sm:text-base">
                                Backend returns every registered theme for
                                these filter buttons, while quiz cards
                                themselves still come from the public catalog
                                page by page.
                            </p>
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
                                Topic Filter
                            </p>
                            <h2 className="mt-3 text-2xl font-semibold text-white">
                                Browse all available topics
                            </h2>
                        </div>

                        <p className="text-sm text-indigo-100/65">
                            {quizCatalog.counts
                                ? `${quizCatalog.counts.filteredQuizzes} of ${quizCatalog.counts.totalQuizzes} public quizzes`
                                : "Loading topics from backend."}
                        </p>
                    </div>

                    <TopicFilters
                        activeTopic={quizCatalog.activeTopic || "All"}
                        filters={filters}
                        isLoading={quizCatalog.isLoading}
                        onTopicChange={(topic) =>
                            quizCatalog.setActiveTopic(
                                topic === "All" ? "" : topic,
                            )
                        }
                    />

                    <QuizCollection
                        emptyDescription="This theme exists, but there are no public quizzes in it yet."
                        emptyTitle="No quizzes in this topic"
                        error={quizCatalog.error}
                        isLoading={quizCatalog.isLoading}
                        onQuizDeleted={quizCatalog.removeQuiz}
                        quizzes={quizCatalog.quizzes}
                    />

                    <PaginationControls
                        isLoading={quizCatalog.isLoading}
                        onPageChange={quizCatalog.goToPage}
                        pagination={quizCatalog.pagination}
                    />
                </div>
            </section>
        </AppShell>
    );
}
