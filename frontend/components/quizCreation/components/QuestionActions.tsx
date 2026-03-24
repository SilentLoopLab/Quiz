"use client";

import Link from "next/link";
import type { QuizEditorMode } from "../../../types/quiz.types";

interface QuestionActionsProps {
    createdQuizExists: boolean;
    editorMode: QuizEditorMode;
    isCreatingQuiz: boolean;
    isLocked?: boolean;
    onAddQuestion: () => void;
    onResetQuestions: () => void | Promise<void>;
    onReviewQuizDraft: () => void;
    onSaveQuiz: () => void | Promise<void>;
    onUnlockEditor: () => void;
    savedQuizId?: string;
}

export function QuestionActions({
    createdQuizExists,
    editorMode,
    isCreatingQuiz,
    isLocked = false,
    onAddQuestion,
    onResetQuestions,
    onReviewQuizDraft,
    onSaveQuiz,
    onUnlockEditor,
    savedQuizId,
}: QuestionActionsProps) {
    if (isLocked && savedQuizId) {
        return (
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
                <button
                    type="button"
                    onClick={onUnlockEditor}
                    className="rounded-2xl border border-indigo-200/15 bg-indigo-950/40 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-950/70"
                >
                    Edit Quiz
                </button>
                <Link
                    href="/quizzes/mine"
                    className="rounded-2xl border border-indigo-200/15 bg-indigo-950/40 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-950/70"
                >
                    Back to My Quizzes
                </Link>
                <Link
                    href={`/quizzes/${savedQuizId}`}
                    className="rounded-2xl bg-indigo-100 px-5 py-3 text-sm font-semibold text-indigo-950 transition hover:bg-white"
                >
                    View Quiz
                </Link>
            </div>
        );
    }

    const isEditing = editorMode === "edit";

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
            <button
                type="button"
                onClick={onResetQuestions}
                className="rounded-2xl border border-indigo-200/15 bg-indigo-950/40 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-950/70"
            >
                Reset Questions
            </button>
            <button
                type="button"
                onClick={onAddQuestion}
                className="rounded-2xl border border-indigo-200/15 bg-indigo-950/40 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-950/70"
            >
                Add Question
            </button>
            <button
                type="button"
                onClick={onReviewQuizDraft}
                disabled={isCreatingQuiz}
                className="rounded-2xl border border-indigo-200/15 bg-indigo-950/40 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-950/70 disabled:cursor-not-allowed disabled:opacity-70"
            >
                Review Quiz Draft
            </button>
            <button
                type="button"
                onClick={onSaveQuiz}
                disabled={isCreatingQuiz}
                className="rounded-2xl bg-indigo-100 px-5 py-3 text-sm font-semibold text-indigo-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
            >
                {isCreatingQuiz
                    ? isEditing
                        ? "Saving Changes..."
                        : "Creating Quiz..."
                    : createdQuizExists
                      ? isEditing
                          ? "Save Quiz Changes"
                          : "Save Quiz"
                      : isEditing
                        ? "Save Quiz Changes"
                        : "Create Quiz"}
            </button>
        </div>
    );
}
