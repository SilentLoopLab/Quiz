"use client";

import type { QuizPagination } from "../../types/quiz.types";

interface PaginationControlsProps {
    isLoading?: boolean;
    onPageChange: (page: number) => void;
    pagination: QuizPagination;
}

export function PaginationControls({
    isLoading = false,
    onPageChange,
    pagination,
}: PaginationControlsProps) {
    if (pagination.totalPages <= 1) {
        return null;
    }

    return (
        <div className="mt-6 flex flex-col gap-3 rounded-[1.5rem] border border-indigo-200/10 bg-indigo-950/35 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-indigo-100/70">
                Page {pagination.page} of {pagination.totalPages}
            </p>

            <div className="flex items-center gap-3">
                <button
                    type="button"
                    disabled={!pagination.hasPreviousPage || isLoading}
                    onClick={() =>
                        pagination.previousPage &&
                        onPageChange(pagination.previousPage)
                    }
                    className="rounded-2xl border border-indigo-200/15 bg-indigo-900/45 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-900/70 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    Previous
                </button>
                <button
                    type="button"
                    disabled={!pagination.hasNextPage || isLoading}
                    onClick={() =>
                        pagination.nextPage && onPageChange(pagination.nextPage)
                    }
                    className="rounded-2xl bg-indigo-100 px-4 py-2.5 text-sm font-semibold text-indigo-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                    Next
                </button>
            </div>
        </div>
    );
}
