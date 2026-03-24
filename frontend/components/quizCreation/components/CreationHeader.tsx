"use client";

import Link from "next/link";
import type { QuizEditorMode } from "../../../types/quiz.types";

interface CreationHeaderProps {
    isLocked?: boolean;
    mode: QuizEditorMode;
    settingsRoute: string;
}

export function CreationHeader({
    isLocked = false,
    mode,
    settingsRoute,
}: CreationHeaderProps) {
    const isEditing = mode === "edit";

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
                <p className="text-sm uppercase tracking-[0.3em] text-indigo-200/55">
                    {isEditing ? "Quiz Editing" : "Quiz Creation"}
                </p>
                <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
                    {isEditing ? "Edit questions" : "Questions"}
                </h1>
            </div>

            {isLocked ? (
                <span className="inline-flex rounded-2xl border border-emerald-300/20 bg-emerald-950/30 px-5 py-3 text-sm font-semibold text-emerald-100">
                    Quiz saved
                </span>
            ) : (
                <Link
                    href={settingsRoute}
                    className="inline-flex rounded-2xl border border-indigo-200/15 bg-indigo-950/40 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-950/70"
                >
                    Edit Settings
                </Link>
            )}
        </div>
    );
}
