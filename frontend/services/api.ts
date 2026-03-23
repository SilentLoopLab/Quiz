import axios, {
    type AxiosRequestConfig,
    type AxiosResponse,
    type InternalAxiosRequestConfig,
} from "axios";
import {
    clearStoredAuthToken,
    getStoredAuthToken,
    setStoredAuthToken,
} from "../lib/authStorage";
import type { AuthResponse } from "../types/auth.types";

const DEFAULT_API_BASE_URL = "http://localhost:4000";
const DEFAULT_REQUEST_ERROR_MESSAGE = "Something went wrong. Please try again.";
const NETWORK_ERROR_MESSAGE =
    "Unable to connect to the server. Please try again.";
const REFRESH_ENDPOINT = "/api/auth/refresh";
const ACCESS_TOKEN_EXPIRATION_BUFFER_MS = 5_000;

const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL;

export const api = axios.create({
    baseURL: apiBaseUrl.replace(/\/$/, ""),
    withCredentials: true,
    headers: {
        Accept: "application/json",
    },
});

export interface ApiRequestConfig extends AxiosRequestConfig {
    requiresAuth?: boolean;
    skipAuthRefresh?: boolean;
    _retry?: boolean;
}

type ApiInternalRequestConfig = InternalAxiosRequestConfig & ApiRequestConfig;

let refreshRequest: Promise<string> | null = null;

export function withAuthRequest(
    config: ApiRequestConfig = {},
): ApiRequestConfig {
    return {
        ...config,
        requiresAuth: true,
    };
}

export function withSkippedAuthRefresh(
    config: ApiRequestConfig = {},
): ApiRequestConfig {
    return {
        ...config,
        skipAuthRefresh: true,
    };
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
    if (typeof window === "undefined" || typeof window.atob !== "function") {
        return null;
    }

    const [, payload = ""] = token.split(".");

    if (!payload) {
        return null;
    }

    try {
        const normalizedPayload = payload
            .replace(/-/g, "+")
            .replace(/_/g, "/")
            .padEnd(Math.ceil(payload.length / 4) * 4, "=");

        return JSON.parse(window.atob(normalizedPayload)) as Record<
            string,
            unknown
        >;
    } catch {
        return null;
    }
}

function isAccessTokenExpired(token: string): boolean {
    const payload = decodeJwtPayload(token);
    const expValue =
        typeof payload?.exp === "number" ? payload.exp : Number(payload?.exp);

    if (!Number.isFinite(expValue)) {
        return false;
    }

    return expValue * 1000 <= Date.now() + ACCESS_TOKEN_EXPIRATION_BUFFER_MS;
}

function isRefreshRequest(url?: string): boolean {
    return typeof url === "string" && url.includes(REFRESH_ENDPOINT);
}

function setAuthorizationHeader(
    config: ApiInternalRequestConfig,
    token: string,
) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
}

async function refreshAccessToken(): Promise<string> {
    if (refreshRequest) {
        return refreshRequest;
    }

    refreshRequest = api
        .post<AuthResponse>(
            REFRESH_ENDPOINT,
            undefined,
            withSkippedAuthRefresh(),
        )
        .then((response: AxiosResponse<AuthResponse>) => {
            setStoredAuthToken(response.data.token);
            return response.data.token;
        })
        .catch((error: unknown) => {
            clearStoredAuthToken();
            throw error;
        })
        .finally(() => {
            refreshRequest = null;
        });

    return refreshRequest;
}

api.interceptors.request.use(async (config) => {
    const nextConfig = config as ApiInternalRequestConfig;

    if (
        nextConfig.skipAuthRefresh ||
        !nextConfig.requiresAuth ||
        isRefreshRequest(nextConfig.url)
    ) {
        return nextConfig;
    }

    const storedToken = getStoredAuthToken();

    if (!storedToken) {
        return nextConfig;
    }

    let token = storedToken;

    if (isAccessTokenExpired(storedToken)) {
        token = await refreshAccessToken();
        nextConfig._retry = true;
    }

    setAuthorizationHeader(nextConfig, token);

    return nextConfig;
});

api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: unknown) => {
        if (!axios.isAxiosError(error)) {
            return Promise.reject(error);
        }

        const originalRequest = error.config as
            | ApiInternalRequestConfig
            | undefined;

        if (
            !originalRequest ||
            originalRequest.skipAuthRefresh ||
            originalRequest._retry ||
            !originalRequest.requiresAuth ||
            error.response?.status !== 401 ||
            isRefreshRequest(originalRequest.url)
        ) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            const nextToken = await refreshAccessToken();
            setAuthorizationHeader(originalRequest, nextToken);

            return api(originalRequest);
        } catch (refreshError) {
            clearStoredAuthToken();
            return Promise.reject(refreshError);
        }
    },
);

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
        const response = error.response;

        if (!response) {
            return {
                message: NETWORK_ERROR_MESSAGE,
                isUnexpected: true,
            };
        }

        const message = extractErrorMessage(response.data);
        if (message) {
            return {
                message,
                isUnexpected: response.status >= 500,
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
