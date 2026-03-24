"use client";

import Link from "next/link";
import AppShell from "../../components/navigation/AppShell";
import {
    PaginationControls,
    QuizCollection,
    TopicFilters,
} from "../../components/quizDiscovery";
import { usePublicQuizCatalog } from "../../hooks/usePublicQuizCatalog";
import { useQuizHomeFeed } from "../../hooks/useQuizHomeFeed";

export default function HomePage() {
    const homeFeed = useQuizHomeFeed();
    const quizCatalog = usePublicQuizCatalog({ limit: 6 });
    const homeFilters = Array.from(
        new Set([
            "All",
            ...(homeFeed.data?.popularTopics ?? [])
                .slice(0, 3)
                .map((topic) => topic.topic),
        ]),
    );

    return (
        <AppShell>
            <section className="rounded-[2rem] border border-indigo-200/15 bg-indigo-900/45 p-6 shadow-xl sm:p-8">
                <div className="rounded-[1.5rem] border border-indigo-200/10 bg-indigo-950/35 p-6">
                    <p className="text-sm uppercase tracking-[0.3em] text-indigo-200/55">
                        Home
                    </p>
                    <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
                        Welcome back to Quizz
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-indigo-100/65 sm:text-base">
                        Discover quizzes by topic. Home shows All plus the top
                        three themes returned by backend insights, while quiz
                        cards still load from the public catalog page by page.
                    </p>
                </div>

                <div className="mt-6 rounded-[1.5rem] border border-indigo-200/10 bg-indigo-950/35 p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-sm uppercase tracking-[0.24em] text-indigo-200/55">
                                Quiz Categories
                            </p>
                            <h2 className="mt-3 text-2xl font-semibold text-white">
                                Browse quizzes by popular topics
                            </h2>
                            <p className="mt-3 text-sm leading-7 text-indigo-100/65">
                                {quizCatalog.counts
                                    ? `${quizCatalog.counts.filteredQuizzes} quizzes for the current filter`
                                    : "Loading topic insights from backend."}
                            </p>
                        </div>

                        <Link
                            href="/quizzes/create"
                            className="inline-flex rounded-2xl bg-indigo-100 px-5 py-3 text-sm font-semibold text-indigo-950 transition hover:bg-white"
                        >
                            Add Quiz
                        </Link>
                    </div>

                    {homeFeed.error ? (
                        <p className="mt-4 rounded-xl border border-amber-300/10 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/85">
                            {homeFeed.error}
                        </p>
                    ) : null}

                    <TopicFilters
                        activeTopic={quizCatalog.activeTopic || "All"}
                        filters={homeFilters}
                        isLoading={homeFeed.isLoading || quizCatalog.isLoading}
                        onTopicChange={(topic) =>
                            quizCatalog.setActiveTopic(
                                topic === "All" ? "" : topic,
                            )
                        }
                    />

                    <QuizCollection
                        emptyDescription="This theme exists, but there are no public quizzes for it yet."
                        emptyTitle="No quizzes for this topic"
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
