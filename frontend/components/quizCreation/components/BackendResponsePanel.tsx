"use client";

import type { QuizManageQuiz } from "../../../types/quiz.types";

interface BackendResponsePanelProps {
    createdQuiz: QuizManageQuiz | null;
}

export function BackendResponsePanel({
    createdQuiz,
}: BackendResponsePanelProps) {
    if (!createdQuiz) {
        return null;
    }

    return (
        <div className="rounded-[1.5rem] border border-emerald-300/15 bg-emerald-950/20 p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-emerald-100/60">
                Backend Response
            </p>
            <pre className="mt-4 overflow-x-auto rounded-2xl border border-emerald-300/10 bg-emerald-950/35 p-4 text-xs leading-6 text-emerald-100/85">
                {JSON.stringify(createdQuiz, null, 2)}
            </pre>
        </div>
    );
}
