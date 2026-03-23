"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../../store/authStore";
import {
    createLoginFormValues,
    DEFAULT_LOGIN_FORM_ERROR,
    getLoginFieldError,
    normalizeLoginFormValues,
    shouldResetLoginPassword,
    type LoginFieldErrors,
    type LoginFormValues,
    validateLoginFormValues,
} from "./helpers";

export function useLoginForm() {
    const router = useRouter();
    const login = useAuthStore((state) => state.login);
    const isLoading = useAuthStore((state) => state.isLoading);
    const [formValues, setFormValues] = useState<LoginFormValues>(
        createLoginFormValues,
    );
    const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
    const [formError, setFormError] = useState("");

    function handleFieldChange(field: keyof LoginFormValues, value: string) {
        setFormValues((current) => ({ ...current, [field]: value }));
        setFormError("");
        setFieldErrors((current) =>
            current[field] ? { ...current, [field]: undefined } : current,
        );
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const normalizedValues = normalizeLoginFormValues(formValues);
        const nextFieldErrors = validateLoginFormValues(normalizedValues);

        setFieldErrors({});
        setFormError("");

        if (Object.keys(nextFieldErrors).length > 0) {
            setFieldErrors(nextFieldErrors);
            return;
        }

        try {
            await login(normalizedValues);
            router.push("/home");
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : DEFAULT_LOGIN_FORM_ERROR;
            const field = getLoginFieldError(message);

            if (field) {
                setFieldErrors({ [field]: message });
                return;
            }

            if (shouldResetLoginPassword(message)) {
                setFormValues((current) => ({ ...current, password: "" }));
            }

            setFormError(message);
        }
    }

    return {
        fieldErrors,
        formError,
        formValues,
        handleFieldChange,
        handleSubmit,
        isLoading,
    };
}
