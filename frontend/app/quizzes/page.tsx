import AppShell from "../../components/navigation/AppShell";

export default function QuizzesPage() {
    return (
        <AppShell>
            <section className="rounded-[2rem] border border-indigo-200/15 bg-indigo-900/45 p-6 shadow-xl sm:p-8">
                <div className="rounded-[1.5rem] border border-indigo-200/10 bg-indigo-950/35 p-6">
                    <p className="text-sm uppercase tracking-[0.3em] text-indigo-200/55">
                        All Quizzes
                    </p>
                    <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
                        All Quizzes
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-indigo-100/65 sm:text-base">
                        The sidebar route is connected. Quiz creation and
                        management logic can be added here later without
                        changing the navigation shell.
                    </p>
                </div>
            </section>
        </AppShell>
    );
}
