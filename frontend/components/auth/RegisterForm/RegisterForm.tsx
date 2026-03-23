"use client";

import Link from "next/link";
import LoginButton from "../LoginButton";
import { useRegisterForm } from "./useRegisterForm";

export default function RegisterForm() {
    const {
        fieldErrors,
        formError,
        formValues,
        handleFieldChange,
        handleSubmit,
        isLoading,
    } = useRegisterForm();

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
                            handleFieldChange("name", event.target.value)
                        }
                        placeholder="Your full name"
                        type="text"
                        value={formValues.name}
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
                            handleFieldChange("email", event.target.value)
                        }
                        placeholder="you@example.com"
                        type="email"
                        value={formValues.email}
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
                            handleFieldChange("password", event.target.value)
                        }
                        placeholder="Create a strong password"
                        type="password"
                        value={formValues.password}
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
