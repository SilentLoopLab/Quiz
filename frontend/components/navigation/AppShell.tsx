"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AppSidebar from "./AppSidebar";
import { useAuthStore } from "../../store/authStore";

interface AppShellProps {
    children: ReactNode;
}

function AuthGuardFallback({ message }: { message: string }) {
    return (
        <main className="min-h-screen bg-indigo-950 px-4 py-6 text-white sm:px-6 lg:px-8">
            <div className="mx-auto flex min-h-[70vh] w-full max-w-7xl items-center justify-center">
                <section className="w-full max-w-md rounded-[2rem] border border-indigo-200/15 bg-indigo-900/45 p-8 text-center shadow-xl">
                    <p className="text-sm uppercase tracking-[0.24em] text-indigo-200/55">
                        Quizz
                    </p>
                    <h1 className="mt-4 text-2xl font-semibold text-white">
                        {message}
                    </h1>
                </section>
            </div>
        </main>
    );
}

export default function AppShell({ children }: AppShellProps) {
    const router = useRouter();
    const hasHydrated = useAuthStore((state) => state.hasHydrated);
    const token = useAuthStore((state) => state.token);
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        if (!hasHydrated) {
            return;
        }

        if (!token) {
            router.replace("/login");
        }
    }, [hasHydrated, router, token]);

    if (!hasHydrated) {
        return <AuthGuardFallback message="Checking your session..." />;
    }

    if (token && !user) {
        return <AuthGuardFallback message="Loading your account..." />;
    }

    if (!token) {
        return <AuthGuardFallback message="Redirecting to login..." />;
    }

    return (
        <main className="min-h-screen bg-indigo-950 px-4 py-6 text-white sm:px-6 lg:px-8">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 lg:flex-row lg:items-start">
                <AppSidebar />
                <div className="min-w-0 flex-1">{children}</div>
            </div>
        </main>
    );
}
