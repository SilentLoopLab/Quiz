"use client";

import type { QuizManualPointsMode, QuizScoringMode } from "../../../types/quiz.types";
import { formatPoints } from "./styles";

interface QuestionScoringCardProps {
    error?: string;
    isDisabled?: boolean;
    manualPoints: string;
    manualPointsMode: QuizManualPointsMode;
    onManualPointsChange: (value: string) => void;
    questionPoints: number | null;
    scoringMode: QuizScoringMode;
    totalPoints: number;
}

export function QuestionScoringCard({
    error,
    isDisabled = false,
    manualPoints,
    manualPointsMode,
    onManualPointsChange,
    questionPoints,
    scoringMode,
    totalPoints,
}: QuestionScoringCardProps) {
    if (scoringMode === "manual") {
        return (
            <div className="mt-5 rounded-[1.5rem] border border-indigo-200/10 bg-indigo-950/25 p-4">
                <label className="block">
                    <span className="mb-2 block text-sm text-indigo-100/80">
                        Question points
                    </span>
                    <input
                        type="number"
                        disabled={isDisabled}
                        min={manualPointsMode === "integer" ? "1" : "0.01"}
                        step={manualPointsMode === "integer" ? "1" : "0.01"}
                        value={manualPoints}
                        onChange={(event) =>
                            onManualPointsChange(event.target.value)
                        }
                        placeholder="Points"
                        className="w-full rounded-xl border border-indigo-200/25 bg-indigo-950/50 px-4 py-3 text-white outline-none transition placeholder:text-indigo-100/40 focus:border-indigo-100/50 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                </label>
                <p className="mt-3 text-sm leading-7 text-indigo-100/60">
                    Total = sum of all question points.
                    {manualPointsMode === "integer"
                        ? " Whole numbers only."
                        : " Decimals allowed."}
                </p>
                {error ? <p className="mt-2 text-sm text-red-200">{error}</p> : null}
            </div>
        );
    }

    return (
        <div className="mt-5 rounded-[1.5rem] border border-indigo-200/10 bg-indigo-950/25 p-4">
            <p className="text-sm text-indigo-100/80">
                Automatic scoring
            </p>
            <p className="mt-2 text-sm leading-7 text-indigo-100/60">
                {formatPoints(questionPoints ?? 0)} of {formatPoints(totalPoints)} points.
            </p>
        </div>
    );
}
