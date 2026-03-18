"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
    const router = useRouter();

    return (
        <main className="flex min-h-screen items-center justify-center bg-violet-950 px-4">
            <section className="w-full max-w-md rounded-2xl border border-violet-300/10 bg-violet-900/30 p-8 text-center text-white shadow-lg">
                <h1 className="mb-6 text-3xl font-semibold">Not Found</h1>

                <div className="grid gap-3 sm:grid-cols-2">
                    <Link
                        href="/home"
                        className="cursor-pointer rounded-xl bg-violet-200 px-4 py-3 font-medium text-violet-950 transition hover:bg-violet-100"
                    >
                        Go home
                    </Link>

                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="cursor-pointer rounded-xl border border-violet-300/10 bg-violet-950/50 px-4 py-3 font-medium text-white transition hover:bg-violet-950/70"
                    >
                        Go back
                    </button>
                </div>
            </section>
        </main>
    );
}
