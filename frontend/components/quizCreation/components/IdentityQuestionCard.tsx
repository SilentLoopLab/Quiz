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
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-sky-100/70">
                        This is a fixed respondent field. The user must enter a
                        string with first name and last name before the quiz
                        starts.
                    </p>
                </div>

                <span className="rounded-2xl border border-sky-300/20 bg-sky-100 px-4 py-2.5 text-sm font-semibold text-sky-950">
                    Always Required
                </span>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-sky-300/15 bg-sky-950/30 p-4">
                    <p className="text-sm font-semibold text-white">
                        Response type
                    </p>
                    <p className="mt-2 text-sm leading-7 text-sky-100/70">
                        Plain text input for full name.
                    </p>
                </div>

                <div className="rounded-2xl border border-sky-300/15 bg-sky-950/30 p-4">
                    <p className="text-sm font-semibold text-white">
                        Shuffle behavior
                    </p>
                    <p className="mt-2 text-sm leading-7 text-sky-100/70">
                        This field always stays first, even when question
                        shuffle is enabled.
                    </p>
                </div>

                <div className="rounded-2xl border border-sky-300/15 bg-sky-950/30 p-4">
                    <p className="text-sm font-semibold text-white">Scoring</p>
                    <p className="mt-2 text-sm leading-7 text-sky-100/70">
                        This field is informational only and does not affect the
                        quiz score.
                    </p>
                </div>
            </div>
        </article>
    );
}
