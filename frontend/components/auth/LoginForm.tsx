"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setFieldErrors({});
    setFormError("");

    const nextFieldErrors: LoginFieldErrors = {};
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

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
          Login
        </h1>
        <p className="text-sm text-slate-400">
          Continue where you left off and enter your quiz dashboard.
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
            Email
          </span>
          <input
            type="email"
            placeholder="Email"
            autoComplete="username"
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
            autoComplete="current-password"
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
        {isLoading ? "Loading..." : "Login"}
      </button>

      <p className="text-center text-sm text-slate-400">
        Don't have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-cyan-200 underline underline-offset-4 transition hover:text-cyan-100"
        >
          Register
        </Link>
      </p>
    </form>
  );
}
