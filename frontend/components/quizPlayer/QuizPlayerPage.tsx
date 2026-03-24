"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { QuizModerationActions } from "../admin";
import { QuizQuestionCard, QuizResultSummaryCard } from "./components";
import { formatPoints } from "./helpers";
import { useQuizPlayer } from "./useQuizPlayer";

interface QuizPlayerPageProps {
    quizId?: string;
    shareToken?: string;
}

export default function QuizPlayerPage({
    quizId,
    shareToken,
}: QuizPlayerPageProps) {
    const router = useRouter();
    const {
        answeredCount,
        answers,
        error,
        isLoading,
        isSubmitting,
        missingRequiredQuestionNumbers,
        quiz,
        handleOptionToggle,
        handleTextAnswerChange,
        resetAnswers,
        submissionResult,
        submitError,
        submitQuiz,
    } = useQuizPlayer({ quizId, shareToken });

    const questionResults = useMemo(
        () =>
            new Map(
                (submissionResult?.questions ?? []).map((questionResult) => [
                    questionResult.questionId,
                    questionResult,
                ]),
            ),
        [submissionResult],
    );
    const missingRequiredQuestionNumberSet = useMemo(
        () => new Set(missingRequiredQuestionNumbers),
        [missingRequiredQuestionNumbers],
    );

    if (isLoading) {
        return (
            <section className="rounded-[2rem] border border-indigo-200/15 bg-indigo-900/45 p-6 text-center shadow-xl sm:p-8">
                <p className="text-sm uppercase tracking-[0.3em] text-indigo-200/55">
                    Quiz View
                </p>
                <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
                    Loading quiz
                </h1>
            </section>
        );
    }

    if (error || !quiz) {
        return (
            <section className="rounded-[2rem] border border-red-300/10 bg-red-950/20 p-6 shadow-xl sm:p-8">
                <p className="text-sm uppercase tracking-[0.3em] text-red-100/55">
                    Quiz View
                </p>
                <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
                    Quiz is unavailable
                </h1>
                <p className="mt-3 text-sm leading-7 text-red-100/80">
                    {error || "Quiz not found."}
                </p>
                <div className="mt-6">
                    <Link
                        href="/quizzes"
                        className="inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-red-950 transition hover:bg-red-50"
                    >
                        Back to All Quizzes
                    </Link>
                </div>
            </section>
        );
    }

    const isLocked = Boolean(submissionResult) || isSubmitting;
    const backHref = quiz.access.isOwner ? "/quizzes/mine" : "/quizzes";
    const backLabel = quiz.access.isOwner
        ? "Back to My Quizzes"
        : "Back to All Quizzes";

    return (
        <section className="rounded-[2rem] border border-indigo-200/15 bg-indigo-900/45 p-6 shadow-xl sm:p-8 xl:p-10">
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
                <div className="rounded-[1.5rem] border border-indigo-200/10 bg-indigo-950/35 p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <p className="text-sm uppercase tracking-[0.3em] text-indigo-200/55">
                                Quiz View
                            </p>
                            <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
                                {quiz.title}
                            </h1>
                            <p className="mt-3 max-w-3xl text-sm leading-7 text-indigo-100/65 sm:text-base">
                                {quiz.description}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {quiz.access.isOwner ? (
                                <Link
                                    href={`/quizzes/${quiz.id}/edit`}
                                    className="rounded-2xl border border-indigo-200/15 bg-indigo-950/40 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-950/70"
                                >
                                    Edit Quiz
                                </Link>
                            ) : null}
                            <Link
                                href={backHref}
                                className="rounded-2xl border border-indigo-200/15 bg-indigo-950/40 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-950/70"
                            >
                                {backLabel}
                            </Link>
                        </div>
                    </div>

                    {quiz.imageUrl ? (
                        <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-indigo-200/10 bg-indigo-900/25 p-4">
                            <img
                                src={quiz.imageUrl}
                                alt={quiz.imageName || quiz.title}
                                className="h-auto w-full rounded-[1.25rem] object-contain"
                                style={{ maxHeight: "28rem" }}
                            />
                        </div>
                    ) : null}

                    {submissionResult ? (
                        <div className="mt-6">
                            <QuizResultSummaryCard result={submissionResult} />
                        </div>
                    ) : null}

                    <div className="mt-6 space-y-5">
                        {quiz.questions.map((question, index) => (
                            <QuizQuestionCard
                                key={question.id}
                                answerMode={quiz.answerMode}
                                answerValue={answers[question.id]}
                                index={index}
                                isLocked={isLocked}
                                isMissingRequired={
                                    !submissionResult &&
                                    missingRequiredQuestionNumberSet.has(
                                        index + 1,
                                    )
                                }
                                onOptionToggle={handleOptionToggle}
                                onTextAnswerChange={handleTextAnswerChange}
                                question={question}
                                result={questionResults.get(question.id)}
                            />
                        ))}
                    </div>
                </div>

                <aside className="space-y-6">
                    <div className="rounded-[1.5rem] border border-indigo-200/10 bg-indigo-950/35 p-6">
                        <p className="text-sm uppercase tracking-[0.24em] text-indigo-200/55">
                            Quiz Details
                        </p>
                        <div className="mt-5 space-y-3 text-sm text-indigo-100/75">
                            <p>
                                <span className="text-indigo-100/50">
                                    Category:
                                </span>{" "}
                                {quiz.category}
                            </p>
                            <p>
                                <span className="text-indigo-100/50">
                                    Difficulty:
                                </span>{" "}
                                {quiz.difficulty}
                            </p>
                            <p>
                                <span className="text-indigo-100/50">
                                    Answer mode:
                                </span>{" "}
                                {quiz.answerMode}
                            </p>
                            <p>
                                <span className="text-indigo-100/50">
                                    Questions:
                                </span>{" "}
                                {quiz.questions.length}
                            </p>
                            <p>
                                <span className="text-indigo-100/50">
                                    Total points:
                                </span>{" "}
                                {formatPoints(quiz.totalPoints)}
                            </p>
                            <p>
                                <span className="text-indigo-100/50">
                                    Access:
                                </span>{" "}
                                {quiz.accessType}
                            </p>
                        </div>
                    </div>

                    <QuizModerationActions
                        ownerId={quiz.ownerId}
                        ownerName={quiz.ownerName}
                        ownerQuizCreationBlocked={
                            quiz.ownerQuizCreationBlocked
                        }
                        onDeleteSuccess={() => router.push(backHref)}
                        quizId={quiz.id}
                    />

                    <div className="rounded-[1.5rem] border border-indigo-200/10 bg-indigo-950/35 p-6">
                        <p className="text-sm uppercase tracking-[0.24em] text-indigo-200/55">
                            Progress
                        </p>
                        <h2 className="mt-4 text-2xl font-semibold text-white">
                            {submissionResult
                                ? `${submissionResult.answeredQuestions} / ${submissionResult.totalQuestions} answered`
                                : `${answeredCount} / ${quiz.questions.length} answered`}
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-indigo-100/65">
                            {submissionResult
                                ? submissionResult.isPersisted
                                    ? "Your latest saved attempt was loaded from backend. Review it below or start a new attempt."
                                    : "Backend checked every answer. Review the correct and incorrect responses below."
                                : "Submit the quiz to get your total points and see which answers were correct or incorrect."}
                        </p>

                        {submitError ? (
                            <p className="mt-4 rounded-xl border border-rose-300/15 bg-rose-950/25 px-4 py-3 text-sm text-rose-100/85">
                                {submitError}
                            </p>
                        ) : null}

                        {!submissionResult &&
                        missingRequiredQuestionNumbers.length > 0 ? (
                            <p className="mt-4 rounded-xl border border-amber-300/15 bg-amber-950/25 px-4 py-3 text-sm text-amber-100/85">
                                Required question
                                {missingRequiredQuestionNumbers.length > 1
                                    ? "s"
                                    : ""}{" "}
                                still missing:{" "}
                                {missingRequiredQuestionNumbers.join(", ")}.
                            </p>
                        ) : null}

                        <div className="mt-5 flex flex-wrap gap-3">
                            {submissionResult ? (
                                <button
                                    type="button"
                                    onClick={resetAnswers}
                                    className="rounded-2xl bg-indigo-100 px-5 py-3 text-sm font-semibold text-indigo-950 transition hover:bg-white"
                                >
                                    Start New Attempt
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    disabled={
                                        isSubmitting ||
                                        missingRequiredQuestionNumbers.length > 0
                                    }
                                    onClick={submitQuiz}
                                    className="rounded-2xl bg-indigo-100 px-5 py-3 text-sm font-semibold text-indigo-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {isSubmitting
                                        ? "Submitting..."
                                        : "Submit Quiz"}
                                </button>
                            )}

                            {!submissionResult ? (
                                <button
                                    type="button"
                                    onClick={resetAnswers}
                                    className="rounded-2xl border border-indigo-200/15 bg-indigo-950/40 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-950/70"
                                >
                                    Reset Answers
                                </button>
                            ) : null}
                        </div>
                    </div>
                </aside>
            </div>
        </section>
    );
}
