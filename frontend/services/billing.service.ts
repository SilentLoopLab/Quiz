import type { User } from "../types/auth.types";
import { api, getApiErrorDetails, withAuthRequest } from "./api";

interface StripeCheckoutSessionResponse {
    sessionId: string;
    url: string;
}

interface ConfirmPremiumCheckoutResponse {
    user: User;
}

export const billingService = {
    async createStripeCheckoutSession(): Promise<StripeCheckoutSessionResponse> {
        try {
            const response = await api.post<StripeCheckoutSessionResponse>(
                "/api/billing/stripe/checkout-session",
                undefined,
                withAuthRequest(),
            );

            return response.data;
        } catch (error) {
            const { message } = getApiErrorDetails(error);
            throw new Error(message);
        }
    },

    async confirmStripeCheckout(
        sessionId: string,
    ): Promise<ConfirmPremiumCheckoutResponse> {
        try {
            const response = await api.post<ConfirmPremiumCheckoutResponse>(
                "/api/billing/stripe/confirm",
                { sessionId },
                withAuthRequest(),
            );

            return response.data;
        } catch (error) {
            const { message } = getApiErrorDetails(error);
            throw new Error(message);
        }
    },
};
