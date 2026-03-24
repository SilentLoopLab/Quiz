"use client";

import { useEffect } from "react";

interface ModerationConfirmationModalProps {
    confirmLabel: string;
    description: string;
    isOpen: boolean;
    isPending: boolean;
    onCancel: () => void;
    onConfirm: () => void;
    title: string;
    tone?: "danger" | "warning";
}

function getConfirmButtonClassName(tone: "danger" | "warning") {
    if (tone === "warning") {
        return "cursor-pointer rounded-xl border border-amber-300/20 bg-amber-950/35 px-4 py-3 font-medium text-amber-100 transition hover:bg-amber-950/55 disabled:cursor-not-allowed disabled:opacity-60";
    }

    return "cursor-pointer rounded-xl border border-rose-300/20 bg-rose-950/35 px-4 py-3 font-medium text-rose-100 transition hover:bg-rose-950/55 disabled:cursor-not-allowed disabled:opacity-60";
}

export function ModerationConfirmationModal({
    confirmLabel,
    description,
    isOpen,
    isPending,
    onCancel,
    onConfirm,
    title,
    tone = "danger",
}: ModerationConfirmationModalProps) {
    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape" && !isPending) {
                onCancel();
            }
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, isPending, onCancel]);

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-950/80 px-4 py-6 backdrop-blur-sm"
            onClick={(event) => {
                if (event.target === event.currentTarget && !isPending) {
                    onCancel();
                }
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="moderation-confirmation-title"
                className="w-full max-w-xl rounded-[2rem] border border-indigo-200/15 bg-indigo-900/75 p-6 text-white shadow-xl"
            >
                <div className="rounded-[1.5rem] border border-indigo-200/10 bg-indigo-950/35 p-6">
                    <p className="text-sm uppercase tracking-[0.24em] text-indigo-100/55">
                        Admin Action
                    </p>
                    <h2
                        id="moderation-confirmation-title"
                        className="mt-4 text-2xl font-semibold text-white"
                    >
                        {title}
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-indigo-100/70">
                        {description}
                    </p>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isPending}
                        className="cursor-pointer rounded-xl border border-indigo-200/20 bg-indigo-950/40 px-4 py-3 font-medium text-white transition hover:bg-indigo-950/70 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isPending}
                        className={getConfirmButtonClassName(tone)}
                    >
                        {isPending ? "Please wait..." : confirmLabel}
                    </button>
                </div>
            </section>
        </div>
    );
}
