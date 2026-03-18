"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LoginButton from "./LoginButton";
import { useAuthStore } from "../../store/authStore";

type RegisterFieldErrors = {
    name?: string;
    email?: string;
    password?: string;
};

const registerFieldMessageMap: Record<string, keyof RegisterFieldErrors> = {
    "Name is required": "name",
    "Email is required": "email",
    "Email is invalid": "email",
    "Email already exists": "email",
    "Password is required": "password",
    "Password must be at least 8 characters long": "password",
};

export default function RegisterForm() {
    const router = useRouter();
    const register = useAuthStore((state) => state.register);
    const isLoading = useAuthStore((state) => state.isLoading);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});
    const [formError, setFormError] = useState("");

    function clearFieldError(field: keyof RegisterFieldErrors) {
        setFieldErrors((current) =>
            current[field] ? { ...current, [field]: undefined } : current,
        );
    }

    function handleNameChange(value: string) {
        setName(value);
        setFormError("");
        clearFieldError("name");
    }

    function handleEmailChange(value: string) {
        setEmail(value);
        setFormError("");
        clearFieldError("email");
    }

    function handlePasswordChange(value: string) {
        setPassword(value);
        setFormError("");
        clearFieldError("password");
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const trimmedName = name.trim();
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();
        const nextFieldErrors: RegisterFieldErrors = {};

        setFieldErrors({});
        setFormError("");

        if (!trimmedName) {
            nextFieldErrors.name = "Name is required";
        }

        if (!trimmedEmail) {
            nextFieldErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            nextFieldErrors.email = "Email is invalid";
        }

        if (!trimmedPassword) {
            nextFieldErrors.password = "Password is required";
        } else if (trimmedPassword.length < 8) {
            nextFieldErrors.password =
                "Password must be at least 8 characters long";
        }

        if (Object.keys(nextFieldErrors).length > 0) {
            setFieldErrors(nextFieldErrors);
            return;
        }

        try {
            await register({
                name: trimmedName,
                email: trimmedEmail,
                password,
            });

            router.push("/login");
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Something went wrong. Please try again.";
            const field = registerFieldMessageMap[message];

            if (field) {
                setFieldErrors({ [field]: message });
                return;
            }

            setFormError(message);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="w-full max-w-md rounded-2xl border border-indigo-300/10 bg-indigo-900/30 p-8 text-white shadow-lg"
        >
            <h1 className="mb-2 text-3xl font-semibold">
                Create your workspace
            </h1>
            <p className="mb-6 text-sm leading-6 text-indigo-100/75">
                Set up your account, keep progress synced, and start every quiz
                flow with a stronger first impression.
            </p>

            {formError ? (
                <p className="mb-4 rounded-xl border border-red-300/10 bg-red-950/30 px-4 py-3 text-sm text-red-200">
                    {formError}
                </p>
            ) : null}

            <LoginButton
                label="Sign up with Google"
                description="Start with a verified identity and skip the manual setup."
            />

            <p className="my-5 text-sm text-indigo-100/65">
                Or create with email
            </p>

            <div className="mb-4">
                <label className="block">
                    <span className="mb-2 block text-sm text-indigo-100/80">
                        Name
                    </span>
                    <input
                        onChange={(event) =>
                            handleNameChange(event.target.value)
                        }
                        placeholder="Your full name"
                        type="text"
                        value={name}
                        className="w-full rounded-xl border border-indigo-200/25 bg-indigo-950/50 px-4 py-3 text-white outline-none transition placeholder:text-indigo-100/40 focus:border-indigo-100/50"
                    />
                </label>
                {fieldErrors.name ? (
                    <p className="mt-2 text-sm text-red-200">
                        {fieldErrors.name}
                    </p>
                ) : null}
            </div>

            <div className="mb-4">
                <label className="block">
                    <span className="mb-2 block text-sm text-indigo-100/80">
                        Email
                    </span>
                    <input
                        autoComplete="email"
                        onChange={(event) =>
                            handleEmailChange(event.target.value)
                        }
                        placeholder="you@example.com"
                        type="email"
                        value={email}
                        className="w-full rounded-xl border border-indigo-200/25 bg-indigo-950/50 px-4 py-3 text-white outline-none transition placeholder:text-indigo-100/40 focus:border-indigo-100/50"
                    />
                </label>
                {fieldErrors.email ? (
                    <p className="mt-2 text-sm text-red-200">
                        {fieldErrors.email}
                    </p>
                ) : null}
            </div>

            <div className="mb-6">
                <label className="block">
                    <span className="mb-2 block text-sm text-indigo-100/80">
                        Password
                    </span>
                    <input
                        autoComplete="new-password"
                        onChange={(event) =>
                            handlePasswordChange(event.target.value)
                        }
                        placeholder="Create a strong password"
                        type="password"
                        value={password}
                        className="w-full rounded-xl border border-indigo-200/25 bg-indigo-950/50 px-4 py-3 text-white outline-none transition placeholder:text-indigo-100/40 focus:border-indigo-100/50"
                    />
                </label>
                {fieldErrors.password ? (
                    <p className="mt-2 text-sm text-red-200">
                        {fieldErrors.password}
                    </p>
                ) : null}
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full cursor-pointer rounded-xl bg-indigo-200 px-4 py-3 font-medium text-indigo-950 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isLoading ? "Loading..." : "Create account"}
            </button>

            <p className="mt-5 text-sm text-indigo-100/75">
                Already have an account?{" "}
                <Link
                    href="/login"
                    className="cursor-pointer font-medium text-indigo-200 transition hover:text-white"
                >
                    Sign in
                </Link>
            </p>
        </form>
    );
}
