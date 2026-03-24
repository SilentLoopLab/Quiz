import Link from "next/link";
import AppShell from "../../../components/navigation/AppShell";

export default function BillingCancelPage() {
    return (
        <AppShell>
            <section className="rounded-[2rem] border border-indigo-200/15 bg-indigo-900/45 p-6 shadow-xl sm:p-8">
                <div className="rounded-[1.5rem] border border-indigo-200/10 bg-indigo-950/35 p-6">
                    <p className="text-sm uppercase tracking-[0.3em] text-indigo-200/55">
                        Billing
                    </p>
                    <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
                        Checkout cancelled
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-indigo-100/65 sm:text-base">
                        No payment was made.
                    </p>

                    <Link
                        href="/premium"
                        className="mt-6 inline-flex rounded-2xl bg-indigo-100 px-5 py-3 text-sm font-semibold text-indigo-950 transition hover:bg-white"
                    >
                        Return to Premium
                    </Link>
                </div>
            </section>
        </AppShell>
    );
}
