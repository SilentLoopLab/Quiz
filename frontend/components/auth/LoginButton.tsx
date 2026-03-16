"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuthStore } from "../../store/authStore";

interface LoginButtonProps {
  label?: string;
  description?: string;
  redirectTo?: string;
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" width="20" height="20" fill="none">
      <path
        fill="#FFC107"
        d="M43.61 20.08H42V20H24v8h11.3C33.65 32.66 29.19 36 24 36c-6.63 0-12-5.37-12-12s5.37-12 12-12c3.06 0 5.84 1.15 7.95 3.05l5.66-5.66C34.06 6.05 29.28 4 24 4 12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20c0-1.34-.14-2.65-.39-3.92Z"
      />
      <path
        fill="#FF3D00"
        d="M6.31 14.69l6.57 4.82A11.95 11.95 0 0 1 24 12c3.06 0 5.84 1.15 7.95 3.05l5.66-5.66C34.06 6.05 29.28 4 24 4c-7.68 0-14.35 4.34-17.69 10.69Z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.18 0 9.86-1.98 13.41-5.2l-6.19-5.24A11.94 11.94 0 0 1 24 36c-5.17 0-9.62-3.32-11.28-7.93l-6.52 5.02A19.98 19.98 0 0 0 24 44Z"
      />
      <path
        fill="#1976D2"
        d="M43.61 20.08H42V20H24v8h11.3a12.03 12.03 0 0 1-4.09 5.56l.01-.01 6.19 5.24C37 39.09 44 34 44 24c0-1.34-.14-2.65-.39-3.92Z"
      />
    </svg>
  );
}

export default function LoginButton({
  label = "Continue with Google",
  description = "Use your Google account for a faster, verified sign-in.",
  redirectTo = "/home",
}: LoginButtonProps) {
  const router = useRouter();
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [errorMessage, setErrorMessage] = useState("");

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setErrorMessage("");

      try {
        await loginWithGoogle(tokenResponse.access_token);
        router.push(redirectTo);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Google sign-in failed. Please try again.",
        );
      }
    },
    onError: () => {
      setErrorMessage("Google sign-in was cancelled or could not be completed.");
    },
  });

  return (
    <section className="space-y-3">
      <button
        type="button"
        disabled={isLoading}
        onClick={() => {
          setErrorMessage("");
          googleLogin();
        }}
        className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-indigo-200/25 bg-indigo-950/50 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-950/70 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <GoogleMark /> {isLoading ? "Connecting to Google..." : label}
      </button>
      <p className="text-sm text-indigo-100/75">{description}</p>
      {errorMessage ? <p className="text-sm text-red-200">{errorMessage}</p> : null}
    </section>
  );
}
