"use client";

import { useEffect } from "react";

interface DeleteQuizModalProps {
    isDeleting: boolean;
    isOpen: boolean;
    onCancel: () => void;
    onConfirm: () => void;
    quizTitle: string;
}

export function DeleteQuizModal({
    isDeleting,
    isOpen,
    onCancel,
    onConfirm,
    quizTitle,
}: DeleteQuizModalProps) {
    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape" && !isDeleting) {
                onCancel();
            }
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isDeleting, isOpen, onCancel]);

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-950/80 px-4 py-6 backdrop-blur-sm"
            onClick={(event) => {
                if (event.target === event.currentTarget && !isDeleting) {
                    onCancel();
                }
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="delete-quiz-title"
                className="w-full max-w-xl rounded-[2rem] border border-rose-200/15 bg-indigo-900/75 p-6 text-white shadow-xl"
            >
                <div className="rounded-[1.5rem] border border-rose-200/10 bg-indigo-950/35 p-6">
                    <p className="text-sm uppercase tracking-[0.24em] text-rose-100/60">
                        Delete Quiz
                    </p>
                    <h2
                        id="delete-quiz-title"
                        className="mt-4 text-2xl font-semibold text-white"
                    >
                        Delete this quiz?
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-indigo-100/70">
                        <span className="font-semibold text-white">
                            {quizTitle}
                        </span>{" "}
                        will be removed from your account.
                    </p>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isDeleting}
                        className="cursor-pointer rounded-xl border border-indigo-200/20 bg-indigo-950/40 px-4 py-3 font-medium text-white transition hover:bg-indigo-950/70 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="cursor-pointer rounded-xl border border-rose-300/20 bg-rose-950/35 px-4 py-3 font-medium text-rose-100 transition hover:bg-rose-950/55 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isDeleting ? "Deleting..." : "Delete Quiz"}
                    </button>
                </div>
            </section>
        </div>
    );
}
