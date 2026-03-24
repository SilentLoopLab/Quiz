"use client";

import { useState } from "react";
import { adminService } from "../../services/admin.service";
import { useAuthStore } from "../../store/authStore";
import { ModerationConfirmationModal } from "./ModerationConfirmationModal";

interface QuizModerationActionsProps {
    ownerId: string;
    ownerName: string;
    ownerQuizCreationBlocked: boolean;
    onDeleteSuccess?: () => void;
    quizId: string;
}

export function QuizModerationActions({
    ownerId,
    ownerName,
    ownerQuizCreationBlocked,
    onDeleteSuccess,
    quizId,
}: QuizModerationActionsProps) {
    const user = useAuthStore((state) => state.user);
    const [error, setError] = useState("");
    const [feedback, setFeedback] = useState("");
    const [isOwnerBlocked, setIsOwnerBlocked] = useState(
        ownerQuizCreationBlocked,
    );
    const [modalAction, setModalAction] = useState<"" | "block" | "delete">(
        "",
    );
    const [pendingAction, setPendingAction] = useState("");

    if (user?.role !== "admin") {
        return null;
    }

    const canModerateOwner = ownerId !== user.id;

    async function handleDeleteQuiz() {
        setPendingAction("delete");
        setError("");
        setFeedback("");

        try {
            await adminService.deleteQuiz(quizId);
            setFeedback("Quiz deleted.");
            setModalAction("");
            onDeleteSuccess?.();
        } catch (moderationError) {
            setError(
                moderationError instanceof Error
                    ? moderationError.message
                    : "Failed to delete quiz.",
            );
        } finally {
            setPendingAction("");
        }
    }

    async function handleBlockQuizCreation() {
        if (!canModerateOwner) {
            return;
        }

        setPendingAction("block");
        setError("");
        setFeedback("");

        try {
            await adminService.setUserQuizCreationAccess(ownerId, {
                isBlocked: true,
            });
            setIsOwnerBlocked(true);
            setFeedback("User can no longer create quizzes.");
            setModalAction("");
        } catch (moderationError) {
            setError(
                moderationError instanceof Error
                    ? moderationError.message
                    : "Failed to update quiz creation access.",
            );
        } finally {
            setPendingAction("");
        }
    }

    return (
        <div className="border-t border-indigo-200/10 p-4">
            <ModerationConfirmationModal
                confirmLabel="Delete Quiz"
                description="This quiz will be removed."
                isOpen={modalAction === "delete"}
                isPending={pendingAction === "delete"}
                onCancel={() => {
                    if (!pendingAction) {
                        setModalAction("");
                    }
                }}
                onConfirm={() => {
                    void handleDeleteQuiz();
                }}
                title="Delete this quiz?"
                tone="danger"
            />

            <ModerationConfirmationModal
                confirmLabel="Block Quiz Creation"
                description={`${
                    ownerName || "This user"
                } will no longer be able to create quizzes.`}
                isOpen={modalAction === "block"}
                isPending={pendingAction === "block"}
                onCancel={() => {
                    if (!pendingAction) {
                        setModalAction("");
                    }
                }}
                onConfirm={() => {
                    void handleBlockQuizCreation();
                }}
                title="Block this user?"
                tone="warning"
            />

            <div className="rounded-2xl border border-amber-300/15 bg-amber-950/15 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-amber-100/55">
                    Admin Controls
                </p>
                <p className="mt-2 text-sm text-amber-100/75">
                    Creator: {ownerName || "Unknown user"}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => setModalAction("delete")}
                        disabled={pendingAction !== ""}
                        className="rounded-xl border border-rose-300/20 bg-rose-950/30 px-3 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-950/50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {pendingAction === "delete"
                            ? "Deleting..."
                            : "Delete Quiz"}
                    </button>

                    {canModerateOwner && !isOwnerBlocked ? (
                        <button
                            type="button"
                            onClick={() => setModalAction("block")}
                            disabled={pendingAction !== ""}
                            className="rounded-xl border border-amber-300/20 bg-amber-950/35 px-3 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-950/50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {pendingAction === "block"
                                ? "Blocking..."
                                : "Block Quiz Creation"}
                        </button>
                    ) : null}
                </div>

                {canModerateOwner && isOwnerBlocked ? (
                    <p className="mt-3 text-sm text-amber-100/75">
                        Quiz creation is already blocked for this user.
                    </p>
                ) : null}

                {feedback ? (
                    <p className="mt-3 text-sm text-emerald-100/85">
                        {feedback}
                    </p>
                ) : null}

                {error ? (
                    <p className="mt-3 text-sm text-rose-100/85">{error}</p>
                ) : null}
            </div>
        </div>
    );
}
