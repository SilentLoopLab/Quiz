"use client";

import type {
    QuizAnswerMode,
    QuizPlayableQuestion,
    QuizSubmissionAnswerValue,
    QuizSubmissionQuestionResult,
} from "../../../types/quiz.types";
import { formatPoints } from "../helpers";

interface QuizQuestionCardProps {
    answerMode: QuizAnswerMode;
    answerValue: QuizSubmissionAnswerValue | undefined;
    index: number;
    isLocked: boolean;
    isMissingRequired?: boolean;
    onOptionToggle: (
        questionId: string,
        optionId: string,
        allowMultiple: boolean,
    ) => void;
    onTextAnswerChange: (questionId: string, value: string) => void;
    question: QuizPlayableQuestion;
    result?: QuizSubmissionQuestionResult;
}

function getResultBadgeCopy(result?: QuizSubmissionQuestionResult) {
    if (!result) {
        return null;
    }

    if (result.kind === "respondent_name") {
        return result.isAnswered
            ? "Recorded"
            : result.required
              ? "Missing required answer"
              : "Skipped";
    }

    if (!result.isAnswered) {
        return "Skipped";
    }

    return result.isCorrect ? "Correct" : "Incorrect";
}

function getResultBadgeClassName(result?: QuizSubmissionQuestionResult) {
    if (!result) {
        return "border-emerald-300/20 bg-emerald-950/30 text-emerald-100";
    }

    if (result.kind === "respondent_name") {
        return result.isAnswered
            ? "border-sky-300/20 bg-sky-950/30 text-sky-100"
            : "border-amber-300/20 bg-amber-950/30 text-amber-100";
    }

    if (!result.isAnswered) {
        return "border-amber-300/20 bg-amber-950/30 text-amber-100";
    }

    return result.isCorrect
        ? "border-emerald-300/20 bg-emerald-950/30 text-emerald-100"
        : "border-rose-300/20 bg-rose-950/30 text-rose-100";
}

function getOptionClassName(params: {
    isSelected: boolean;
    isCorrectOption: boolean;
    isShowingResult: boolean;
}) {
    const { isCorrectOption, isSelected, isShowingResult } = params;

    if (!isShowingResult) {
        return isSelected
            ? "border-indigo-100/35 bg-indigo-100/10"
            : "border-indigo-200/10 bg-indigo-950/35 hover:bg-indigo-950/55";
    }

    if (isCorrectOption) {
        return "border-emerald-300/25 bg-emerald-950/25";
    }

    if (isSelected) {
        return "border-rose-300/25 bg-rose-950/25";
    }

    return "border-indigo-200/10 bg-indigo-950/20";
}

export function QuizQuestionCard({
    answerMode,
    answerValue,
    index,
    isLocked,
    isMissingRequired = false,
    onOptionToggle,
    onTextAnswerChange,
    question,
    result,
}: QuizQuestionCardProps) {
    const isMultiple = answerMode === "multiple";
    const selectedValues = Array.isArray(answerValue)
        ? answerValue
        : typeof answerValue === "string" && answerValue
          ? [answerValue]
          : [];

    if (question.kind === "respondent_name") {
        return (
            <article
                className={`rounded-[1.75rem] border p-5 ${
                    isMissingRequired
                        ? "border-amber-300/30 bg-amber-950/20"
                        : "border-sky-300/15 bg-sky-950/20"
                }`}
            >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p className="text-sm uppercase tracking-[0.24em] text-sky-100/55">
                            Question {index + 1}
                        </p>
                        <h2 className="mt-3 text-xl font-semibold text-white">
                            {question.prompt}
                        </h2>
                        <div className="mt-3 flex flex-wrap gap-2">
                            <span className="rounded-xl border border-sky-300/20 bg-sky-950/35 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-100">
                                Required
                            </span>
                            {isMissingRequired && !result ? (
                                <span className="rounded-xl border border-amber-300/20 bg-amber-950/35 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-100">
                                    Missing answer
                                </span>
                            ) : null}
                        </div>
                    </div>

                    {result ? (
                        <span
                            className={`rounded-2xl border px-4 py-2.5 text-sm font-semibold ${getResultBadgeClassName(result)}`}
                        >
                            {getResultBadgeCopy(result)}
                        </span>
                    ) : null}
                </div>

                <input
                    type="text"
                    disabled={isLocked}
                    value={typeof answerValue === "string" ? answerValue : ""}
                    onChange={(event) =>
                        onTextAnswerChange(question.id, event.target.value)
                    }
                    placeholder="Enter first name and last name"
                    className="mt-4 w-full rounded-xl border border-sky-300/20 bg-sky-950/40 px-4 py-3 text-white outline-none transition placeholder:text-sky-100/35 focus:border-sky-100/45 disabled:cursor-not-allowed disabled:opacity-80"
                />

                {!result && isMissingRequired ? (
                    <p className="mt-3 text-sm leading-7 text-amber-100/85">
                        Enter the respondent name before submitting the quiz.
                    </p>
                ) : null}

                {result ? (
                    <div className="mt-4 rounded-2xl border border-sky-300/15 bg-sky-950/30 p-4 text-sm leading-7 text-sky-100/75">
                        <p>
                            <span className="text-sky-100/50">
                                Submitted name:
                            </span>{" "}
                            {result.textAnswer || "No name was submitted"}
                        </p>
                    </div>
                ) : null}
            </article>
        );
    }

    return (
        <article
            className={`rounded-[1.75rem] border p-5 ${
                isMissingRequired
                    ? "border-amber-300/30 bg-amber-950/15"
                    : "border-indigo-200/10 bg-indigo-900/30"
            }`}
        >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-indigo-200/55">
                        Question {index + 1}
                    </p>
                    <h2 className="mt-3 text-xl font-semibold text-white">
                        {question.prompt}
                    </h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                        <span
                            className={`rounded-xl border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                                question.required
                                    ? "border-indigo-200/20 bg-indigo-950/35 text-indigo-100"
                                    : "border-indigo-200/10 bg-indigo-950/25 text-indigo-100/65"
                            }`}
                        >
                            {question.required ? "Required" : "Optional"}
                        </span>
                        {isMissingRequired && !result ? (
                            <span className="rounded-xl border border-amber-300/20 bg-amber-950/35 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-100">
                                Missing answer
                            </span>
                        ) : null}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {result ? (
                        <span
                            className={`rounded-2xl border px-4 py-2.5 text-sm font-semibold ${getResultBadgeClassName(result)}`}
                        >
                            {getResultBadgeCopy(result)}
                        </span>
                    ) : null}

                    <span className="rounded-2xl border border-emerald-300/20 bg-emerald-950/30 px-4 py-2.5 text-sm font-semibold text-emerald-100">
                        {formatPoints(question.points)} pts
                    </span>
                </div>
            </div>

            {question.imageUrl ? (
                <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-indigo-200/10 bg-indigo-950/40 p-4">
                    <img
                        src={question.imageUrl}
                        alt={question.imageName || `Question ${index + 1}`}
                        className="mx-auto block h-auto w-full rounded-[1.25rem] object-contain"
                        style={{ maxHeight: "26rem" }}
                    />
                </div>
            ) : null}

            <div className="mt-5 space-y-3">
                {question.options.map((option) => {
                    const resultSelected = result?.selectedOptionIds.includes(
                        option.id,
                    );
                    const resultCorrect = result?.correctOptionIds.includes(
                        option.id,
                    );
                    const isSelected =
                        typeof resultSelected === "boolean"
                            ? resultSelected
                            : selectedValues.includes(option.id);

                    return (
                        <label
                            key={option.id}
                            className={`flex items-start gap-3 rounded-2xl border p-4 transition ${getOptionClassName({
                                isSelected,
                                isCorrectOption: Boolean(resultCorrect),
                                isShowingResult: Boolean(result),
                            })}`}
                        >
                            <input
                                type={isMultiple ? "checkbox" : "radio"}
                                name={question.id}
                                disabled={isLocked}
                                checked={isSelected}
                                onChange={() =>
                                    onOptionToggle(
                                        question.id,
                                        option.id,
                                        isMultiple,
                                    )
                                }
                                className="mt-1 h-4 w-4"
                            />
                            <div className="flex-1">
                                <p className="text-sm leading-7 text-indigo-50/90">
                                    {option.text}
                                </p>
                                {result ? (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {resultCorrect ? (
                                            <span className="rounded-xl border border-emerald-300/20 bg-emerald-950/35 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-100">
                                                Correct answer
                                            </span>
                                        ) : null}
                                        {resultSelected ? (
                                            <span className="rounded-xl border border-indigo-200/15 bg-indigo-950/45 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-100/80">
                                                Your choice
                                            </span>
                                        ) : null}
                                    </div>
                                ) : null}
                            </div>
                        </label>
                    );
                })}
            </div>

            {!result && isMissingRequired ? (
                <p className="mt-4 text-sm leading-7 text-amber-100/85">
                    This question is required. Choose an answer before submitting.
                </p>
            ) : null}

            {result ? (
                <div className="mt-5 rounded-2xl border border-indigo-200/10 bg-indigo-950/35 p-4 text-sm leading-7 text-indigo-100/75">
                    <p>
                        <span className="text-indigo-100/50">Selected:</span>{" "}
                        {result.selectedOptionTexts.length > 0
                            ? result.selectedOptionTexts.join(", ")
                            : "No answer"}
                    </p>
                    <p>
                        <span className="text-indigo-100/50">Correct:</span>{" "}
                        {result.correctOptionTexts.join(", ")}
                    </p>
                    <p>
                        <span className="text-indigo-100/50">Points:</span>{" "}
                        {formatPoints(result.earnedPoints)} /{" "}
                        {formatPoints(result.points)}
                    </p>
                </div>
            ) : null}
        </article>
    );
}
