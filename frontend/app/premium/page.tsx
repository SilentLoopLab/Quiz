"use client";

import AppShell from "../../components/navigation/AppShell";
import PremiumBadge from "../../components/premium/PremiumBadge";
import { usePremiumCheckout } from "../../hooks/usePremiumCheckout";
import { formatPremiumDate } from "../../lib/premium";
import { useAuthStore } from "../../store/authStore";

export default function BuyPremium() {
    const user = useAuthStore((state) => state.user);
    const { errorMessage, isSubmitting, startPremiumCheckout } =
        usePremiumCheckout();

    if (!user) {
        return (
            <AppShell>
                <section className="rounded-[2rem] border border-indigo-200/15 bg-indigo-900/45 p-6 shadow-xl sm:p-8">
                    <div className="rounded-[1.5rem] border border-indigo-200/10 bg-indigo-950/35 p-6">
                        <h1 className="text-2xl font-semibold text-white">
                            Loading premium details...
                        </h1>
                    </div>
                </section>
            </AppShell>
        );
    }

    const premiumStartedAt = formatPremiumDate(user.premiumStartedAt);
    const premiumExpiresAt = formatPremiumDate(user.premiumExpiresAt);

    return (
        <AppShell>
            <section className="rounded-[2rem] border border-indigo-200/15 bg-indigo-900/45 p-6 shadow-xl sm:p-8">
                <div className="rounded-[1.5rem] border border-indigo-200/10 bg-indigo-950/35 p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <p className="text-sm uppercase tracking-[0.3em] text-indigo-200/55">
                                Premium
                            </p>
                            <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
                                {user.premium
                                    ? "Premium is active"
                                    : "Upgrade to Premium"}
                            </h1>
                        </div>

                        {user.premium ? <PremiumBadge /> : null}
                    </div>

                    <p className="mt-3 max-w-2xl text-sm leading-7 text-indigo-100/65 sm:text-base">
                        {user.premium
                            ? "Your account already has premium access. You can keep using the premium workspace until your current billing window ends."
                            : "Start a one-month premium subscription for $20 and unlock premium access across your account."}
                    </p>

                    {errorMessage ? (
                        <p className="mt-4 rounded-xl border border-red-300/10 bg-red-950/30 px-4 py-3 text-sm text-red-200">
                            {errorMessage}
                        </p>
                    ) : null}

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        <article className="rounded-2xl border border-indigo-200/10 bg-indigo-900/35 p-5">
                            <p className="text-sm uppercase tracking-[0.2em] text-indigo-200/55">
                                Plan
                            </p>
                            <p className="mt-3 text-lg font-semibold text-white">
                                One month premium access
                            </p>
                            <p className="mt-2 text-sm text-indigo-100/65">
                                Premium monthly subscription billed at $20 via
                                Stripe checkout.
                            </p>
                        </article>

                        <article className="rounded-2xl border border-indigo-200/10 bg-indigo-900/35 p-5">
                            <p className="text-sm uppercase tracking-[0.2em] text-indigo-200/55">
                                Status
                            </p>
                            <p className="mt-3 text-lg font-semibold text-white">
                                {user.premium ? "Premium active" : "Not active"}
                            </p>
                            <p className="mt-2 text-sm text-indigo-100/65">
                                {user.premium && premiumExpiresAt
                                    ? `Access valid until ${premiumExpiresAt}.`
                                    : "Upgrade once and the backend will activate your premium window for the current monthly period."}
                            </p>
                        </article>
                    </div>

                    {user.premium ? (
                        <div className="mt-6 rounded-2xl border border-amber-300/15 bg-amber-500/10 p-5 text-sm text-amber-50">
                            <p className="font-semibold text-white">
                                Premium membership is already enabled.
                            </p>
                            <p className="mt-2 text-amber-100/80">
                                {premiumStartedAt && premiumExpiresAt
                                    ? `Started on ${premiumStartedAt} and active through ${premiumExpiresAt}.`
                                    : "Your account already has premium access, so the upgrade button is hidden until the current premium window ends."}
                            </p>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => {
                                void startPremiumCheckout();
                            }}
                            disabled={isSubmitting}
                            className="mt-6 rounded-2xl bg-indigo-100 px-5 py-3 text-sm font-semibold text-indigo-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting
                                ? "Redirecting to checkout..."
                                : "Upgrade to Premium"}
                        </button>
                    )}
                </div>
            </section>
        </AppShell>
    );
}
