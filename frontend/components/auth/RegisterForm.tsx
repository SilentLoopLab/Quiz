"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setFieldErrors({});
    setFormError("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const nextFieldErrors: RegisterFieldErrors = {};

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
      nextFieldErrors.password = "Password must be at least 8 characters long";
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
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative z-10 w-full max-w-md space-y-6 rounded-3xl border border-slate-700/70 bg-slate-900/80 p-7 shadow-[0_34px_72px_-30px_rgba(2,6,23,0.95)] backdrop-blur-xl sm:p-8"
    >
      <div className="space-y-2">
        <span className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-cyan-200">
          Quiz Portal
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
          Register
        </h1>
        <p className="text-sm text-slate-400">
          Create your account to access quizzes and track your progress.
        </p>
      </div>

      {formError ? (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {formError}
        </div>
      ) : null}

      <div className="space-y-4">
        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
            Name
          </span>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setFormError("");
              if (fieldErrors.name) {
                setFieldErrors((current) => ({ ...current, name: undefined }));
              }
            }}
            className={`w-full rounded-xl border bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 transition focus:outline-none focus:ring-2 ${
              fieldErrors.name
                ? "border-rose-500/70 focus:border-rose-400/70 focus:ring-rose-400/20"
                : "border-slate-700 focus:border-cyan-300/70 focus:ring-cyan-400/25"
            }`}
          />
          {fieldErrors.name ? (
            <p className="text-sm text-rose-300">{fieldErrors.name}</p>
          ) : null}
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
            Email
          </span>
          <input
            type="email"
            placeholder="Email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFormError("");
              if (fieldErrors.email) {
                setFieldErrors((current) => ({ ...current, email: undefined }));
              }
            }}
            className={`w-full rounded-xl border bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 transition focus:outline-none focus:ring-2 ${
              fieldErrors.email
                ? "border-rose-500/70 focus:border-rose-400/70 focus:ring-rose-400/20"
                : "border-slate-700 focus:border-cyan-300/70 focus:ring-cyan-400/25"
            }`}
          />
          {fieldErrors.email ? (
            <p className="text-sm text-rose-300">{fieldErrors.email}</p>
          ) : null}
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
            Password
          </span>
          <input
            type="password"
            placeholder="Password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setFormError("");
              if (fieldErrors.password) {
                setFieldErrors((current) => ({ ...current, password: undefined }));
              }
            }}
            className={`w-full rounded-xl border bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 transition focus:outline-none focus:ring-2 ${
              fieldErrors.password
                ? "border-rose-500/70 focus:border-rose-400/70 focus:ring-rose-400/20"
                : "border-slate-700 focus:border-cyan-300/70 focus:ring-cyan-400/25"
            }`}
          />
          {fieldErrors.password ? (
            <p className="text-sm text-rose-300">{fieldErrors.password}</p>
          ) : null}
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-xl bg-gradient-to-r from-cyan-300 via-cyan-200 to-emerald-200 py-3 text-sm font-semibold text-slate-900 transition hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-cyan-300/80 focus:ring-offset-2 focus:ring-offset-slate-900"
      >
        {isLoading ? "Loading..." : "Register"}
      </button>

      <p className="text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-cyan-200 underline underline-offset-4 transition hover:text-cyan-100"
        >
          Login
        </Link>
      </p>
    </form>
  );
}
