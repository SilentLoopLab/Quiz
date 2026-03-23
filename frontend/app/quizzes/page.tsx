import Link from "next/link";
import AppShell from "../../components/navigation/AppShell";

export default function QuizzesPage() {
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
                                Start by configuring quiz settings and keep the
                                draft saved locally while you work.
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

                <div className="mt-6 rounded-[1.5rem] border border-indigo-200/10 bg-indigo-950/35 p-6">
                    <p className="text-sm uppercase tracking-[0.24em] text-indigo-200/55">
                        Current Setup
                    </p>
                    <article className="mt-4 rounded-2xl border border-indigo-200/10 bg-indigo-900/35 p-5">
                        <h2 className="text-xl font-semibold text-white">
                            Quiz Settings
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-indigo-100/65">
                            Title, suggested or custom topic, difficulty,
                            single or multiple correct answers, access type,
                            premium visibility, and optional image.
                        </p>
                    </article>
                </div>
            </section>
        </AppShell>
    );
}
