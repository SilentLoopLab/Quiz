"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LoginButton from "./LoginButton";
import { useAuthStore } from "../../store/authStore";

type LoginFieldErrors = {
  email?: string;
  password?: string;
};

const fieldErrorMessages = new Set(["Email is required", "Password is required"]);

const formErrorMessages = new Set([
  "Invalid email or password",
  "Your account has been banned.",
  "Account is temporarily locked. Try again later.",
]);

export default function LoginForm() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [formError, setFormError] = useState("");

  function clearFieldError(field: keyof LoginFieldErrors) {
    setFieldErrors((current) =>
      current[field] ? { ...current, [field]: undefined } : current,
    );
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

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const nextFieldErrors: LoginFieldErrors = {};

    setFieldErrors({});
    setFormError("");

    if (!trimmedEmail) {
      nextFieldErrors.email = "Email is required";
    }

    if (!trimmedPassword) {
      nextFieldErrors.password = "Password is required";
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    try {
      await login({
        email: trimmedEmail,
        password,
      });

      router.push("/home");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";

      if (fieldErrorMessages.has(message)) {
        setFieldErrors({
          [message === "Email is required" ? "email" : "password"]: message,
        });
        return;
      }

      if (formErrorMessages.has(message)) {
        setFormError(message);
        setPassword("");
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
      <h1 className="mb-2 text-3xl font-semibold">Welcome back</h1>
      <p className="mb-6 text-sm leading-6 text-indigo-100/75">
        Sign in with your preferred method and continue your quizzes with a
        cleaner, faster workspace.
      </p>

      {formError ? (
        <p className="mb-4 rounded-xl border border-red-300/10 bg-red-950/30 px-4 py-3 text-sm text-red-200">
          {formError}
        </p>
      ) : null}

      <LoginButton
        label="Continue with Google"
        description="Jump straight into your dashboard with a verified Google account."
      />

      <p className="my-5 text-sm text-indigo-100/65">Or use email</p>

      <div className="mb-4">
        <label className="block">
          <span className="mb-2 block text-sm text-indigo-100/80">Email</span>
          <input
            autoComplete="username"
            onChange={(event) => handleEmailChange(event.target.value)}
            placeholder="you@example.com"
            type="email"
            value={email}
            className="w-full rounded-xl border border-indigo-200/25 bg-indigo-950/50 px-4 py-3 text-white outline-none transition placeholder:text-indigo-100/40 focus:border-indigo-100/50"
          />
        </label>
        {fieldErrors.email ? (
          <p className="mt-2 text-sm text-red-200">{fieldErrors.email}</p>
        ) : null}
      </div>

      <div className="mb-6">
        <label className="block">
          <span className="mb-2 block text-sm text-indigo-100/80">Password</span>
          <input
            autoComplete="current-password"
            onChange={(event) => handlePasswordChange(event.target.value)}
            placeholder="Enter your password"
            type="password"
            value={password}
            className="w-full rounded-xl border border-indigo-200/25 bg-indigo-950/50 px-4 py-3 text-white outline-none transition placeholder:text-indigo-100/40 focus:border-indigo-100/50"
          />
        </label>
        {fieldErrors.password ? (
          <p className="mt-2 text-sm text-red-200">{fieldErrors.password}</p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full cursor-pointer rounded-xl bg-indigo-200 px-4 py-3 font-medium text-indigo-950 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Loading..." : "Login"}
      </button>

      <p className="mt-5 text-sm text-indigo-100/75">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="cursor-pointer font-medium text-indigo-200 transition hover:text-white"
        >
          Create one
        </Link>
      </p>
    </form>
  );
}
