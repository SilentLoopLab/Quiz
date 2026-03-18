import AppShell from "../../components/navigation/AppShell";

export default function BuyPremium() {
    return (
        <AppShell>
            <section className="rounded-[2rem] border border-indigo-200/15 bg-indigo-900/45 p-6 shadow-xl sm:p-8">
                <div className="rounded-[1.5rem] border border-indigo-200/10 bg-indigo-950/35 p-6">
                    <p className="text-sm uppercase tracking-[0.3em] text-indigo-200/55">
                        Premium
                    </p>
                    <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
                        Upgrade to Premium
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-indigo-100/65 sm:text-base">
                        Premium purchase flow is not implemented here yet, but
                        the page is now integrated into the main app navigation.
                    </p>

                    <button
                        type="button"
                        className="mt-6 rounded-2xl bg-indigo-100 px-5 py-3 text-sm font-semibold text-indigo-950 transition hover:bg-white"
                    >
                        Upgrade to Premium
                    </button>
                </div>
            </section>
        </AppShell>
    );
}
