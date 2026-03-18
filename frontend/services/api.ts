import axios from "axios";

const DEFAULT_API_BASE_URL = "http://localhost:4000";
const DEFAULT_REQUEST_ERROR_MESSAGE = "Something went wrong. Please try again.";
const NETWORK_ERROR_MESSAGE =
    "Unable to connect to the server. Please try again.";

const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL;

export const api = axios.create({
    baseURL: apiBaseUrl.replace(/\/$/, ""),
    headers: {
        Accept: "application/json",
    },
});

interface ApiErrorDetails {
    message: string;
    isUnexpected: boolean;
}

function extractErrorMessage(data: unknown): string | null {
    if (typeof data === "string" && data.trim()) {
        return data;
    }

    if (!data || typeof data !== "object") {
        return null;
    }

    const message = Reflect.get(data, "message");
    if (typeof message === "string" && message.trim()) {
        return message;
    }

    const error = Reflect.get(data, "error");
    if (typeof error === "string" && error.trim()) {
        return error;
    }

    return null;
}

export function getApiErrorDetails(error: unknown): ApiErrorDetails {
    if (axios.isAxiosError(error)) {
        if (!error.response) {
            return {
                message: NETWORK_ERROR_MESSAGE,
                isUnexpected: true,
            };
        }

        const message = extractErrorMessage(error.response.data);
        if (message) {
            return {
                message,
                isUnexpected: error.response.status >= 500,
            };
        }

        return {
            message: DEFAULT_REQUEST_ERROR_MESSAGE,
            isUnexpected: true,
        };
    }

    if (error instanceof Error && error.message.trim()) {
        return {
            message: error.message,
            isUnexpected: true,
        };
    }

    return {
        message: DEFAULT_REQUEST_ERROR_MESSAGE,
        isUnexpected: true,
    };
}
