"use client";

interface IdentityQuestionCardProps {
    prompt: string;
}

export function IdentityQuestionCard({ prompt }: IdentityQuestionCardProps) {
    return (
        <article className="rounded-[1.75rem] border border-sky-300/15 bg-sky-950/20 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-sky-100/55">
                        Question 1
                    </p>
                    <h2 className="mt-2 text-xl font-semibold text-white">
                        {prompt}
                    </h2>
                </div>

                <span className="rounded-2xl border border-sky-300/20 bg-sky-100 px-4 py-2.5 text-sm font-semibold text-sky-950">
                    Required
                </span>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
                <span className="rounded-2xl border border-sky-300/15 bg-sky-950/30 px-4 py-2 text-sm text-sky-100/80">
                    Text answer
                </span>
                <span className="rounded-2xl border border-sky-300/15 bg-sky-950/30 px-4 py-2 text-sm text-sky-100/80">
                    Always first
                </span>
                <span className="rounded-2xl border border-sky-300/15 bg-sky-950/30 px-4 py-2 text-sm text-sky-100/80">
                    No points
                </span>
            </div>
        </article>
    );
}
