"use client";

import { useState } from "react";
import { billingService } from "../services/billing.service";

const DEFAULT_PREMIUM_CHECKOUT_ERROR =
    "Failed to start premium checkout. Please try again.";

export function usePremiumCheckout() {
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function startPremiumCheckout() {
        setIsSubmitting(true);
        setErrorMessage("");

        try {
            const { url } = await billingService.createStripeCheckoutSession();
            window.location.assign(url);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : DEFAULT_PREMIUM_CHECKOUT_ERROR;

            setErrorMessage(message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return {
        errorMessage,
        isSubmitting,
        startPremiumCheckout,
    };
}
