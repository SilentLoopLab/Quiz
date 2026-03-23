"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../../store/authStore";
import {
    createRegisterFormValues,
    DEFAULT_REGISTER_FORM_ERROR,
    getRegisterFieldError,
    normalizeRegisterFormValues,
    type RegisterFieldErrors,
    type RegisterFormValues,
    validateRegisterFormValues,
} from "./helpers";

export function useRegisterForm() {
    const router = useRouter();
    const register = useAuthStore((state) => state.register);
    const isLoading = useAuthStore((state) => state.isLoading);
    const [formValues, setFormValues] = useState<RegisterFormValues>(
        createRegisterFormValues,
    );
    const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});
    const [formError, setFormError] = useState("");

    function handleFieldChange(field: keyof RegisterFormValues, value: string) {
        setFormValues((current) => ({ ...current, [field]: value }));
        setFormError("");
        setFieldErrors((current) =>
            current[field] ? { ...current, [field]: undefined } : current,
        );
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const normalizedValues = normalizeRegisterFormValues(formValues);
        const nextFieldErrors = validateRegisterFormValues(normalizedValues);

        setFieldErrors({});
        setFormError("");

        if (Object.keys(nextFieldErrors).length > 0) {
            setFieldErrors(nextFieldErrors);
            return;
        }

        try {
            await register(normalizedValues);
            router.push("/login");
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : DEFAULT_REGISTER_FORM_ERROR;
            const field = getRegisterFieldError(message);

            if (field) {
                setFieldErrors({ [field]: message });
                return;
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
