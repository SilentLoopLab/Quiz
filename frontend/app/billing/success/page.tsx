"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AppShell from "../../../components/navigation/AppShell";
import { billingService } from "../../../services/billing.service";
import { useAuthStore } from "../../../store/authStore";

const DEFAULT_CONFIRM_ERROR_MESSAGE =
    "Failed to confirm premium purchase. Please try again.";

export default function BillingSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const setCurrentUser = useAuthStore((state) => state.setCurrentUser);
    const [errorMessage, setErrorMessage] = useState("");
    const handledSessionIdRef = useRef("");
    const sessionId = searchParams.get("session_id")?.trim() || "";

    useEffect(() => {
        if (!sessionId) {
            setErrorMessage("Stripe checkout session is missing.");
            return;
        }

        if (handledSessionIdRef.current === sessionId) {
            return;
        }

        handledSessionIdRef.current = sessionId;

        let isCancelled = false;

        void (async () => {
            try {
                const response =
                    await billingService.confirmStripeCheckout(sessionId);

                if (isCancelled) {
                    return;
                }

                setCurrentUser(response.user);
                router.replace("/premium?upgraded=1");
            } catch (error) {
                if (isCancelled) {
                    return;
                }

                setErrorMessage(
                    error instanceof Error
                        ? error.message
                        : DEFAULT_CONFIRM_ERROR_MESSAGE,
                );
            }
        })();

        return () => {
            isCancelled = true;
        };
    }, [router, sessionId, setCurrentUser]);

    return (
        <AppShell>
            <section className="rounded-[2rem] border border-indigo-200/15 bg-indigo-900/45 p-6 shadow-xl sm:p-8">
                <div className="rounded-[1.5rem] border border-indigo-200/10 bg-indigo-950/35 p-6">
                    <p className="text-sm uppercase tracking-[0.3em] text-indigo-200/55">
                        Billing
                    </p>
                    <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
                        Confirming Premium access
                    </h1>

                    {errorMessage ? (
                        <>
                            <p className="mt-3 max-w-2xl text-sm leading-7 text-red-200 sm:text-base">
                                {errorMessage}
                            </p>

                            <Link
                                href="/premium"
                                className="mt-6 inline-flex rounded-2xl border border-indigo-200/15 bg-indigo-950/45 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-950/70"
                            >
                                Back to Premium
                            </Link>
                        </>
                    ) : (
                        <p className="mt-3 max-w-2xl text-sm leading-7 text-indigo-100/65 sm:text-base">
                            Payment succeeded. We are confirming your premium
                            subscription and updating your account now.
                        </p>
                    )}
                </div>
            </section>
        </AppShell>
    );
}
