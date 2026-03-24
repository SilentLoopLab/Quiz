"use client";

import type {
    QuizAccessType,
    QuizAnswerMode,
    QuizDifficulty,
    QuizManualPointsMode,
    QuizScoringMode,
} from "../../../types/quiz.types";
import { formatPoints } from "./styles";

interface SavedSettingsPanelProps {
    questionSettings: {
        title: string;
        category: string;
        difficulty: QuizDifficulty;
        answerMode: QuizAnswerMode;
        shuffleQuestions: boolean;
        shuffleAnswers: boolean;
        scoringMode: QuizScoringMode;
        manualPointsMode: QuizManualPointsMode;
        accessType: QuizAccessType;
        isPremium: boolean;
        imageName: string;
    };
    totalPoints: number;
}

export function SavedSettingsPanel({
    questionSettings,
    totalPoints,
}: SavedSettingsPanelProps) {
    return (
        <div className="rounded-[1.5rem] border border-indigo-200/10 bg-indigo-950/35 p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-indigo-200/55">
                Settings
            </p>
            <h2 className="mt-4 text-2xl font-semibold text-white">
                {questionSettings.title}
            </h2>

            <div className="mt-5 space-y-3 text-sm text-indigo-100/75">
                <p><span className="text-indigo-100/50">Category:</span> {questionSettings.category}</p>
                <p><span className="text-indigo-100/50">Difficulty:</span> {questionSettings.difficulty}</p>
                <p><span className="text-indigo-100/50">Answer mode:</span> {questionSettings.answerMode}</p>
                <p><span className="text-indigo-100/50">First question:</span> Name</p>
                <p><span className="text-indigo-100/50">Shuffle questions:</span> {questionSettings.shuffleQuestions ? "Yes" : "No"}</p>
                <p><span className="text-indigo-100/50">Shuffle answers:</span> {questionSettings.shuffleAnswers ? "Yes" : "No"}</p>
                <p>
                    <span className="text-indigo-100/50">Scoring:</span>{" "}
                    {questionSettings.scoringMode === "automatic"
                        ? `Automatic, ${formatPoints(totalPoints)} points`
                        : `Manual, ${formatPoints(totalPoints)} points`}
                </p>
                {questionSettings.scoringMode === "manual" ? (
                    <p>
                        <span className="text-indigo-100/50">
                            Manual points:
                        </span>{" "}
                        {questionSettings.manualPointsMode === "integer"
                            ? "Whole numbers only"
                            : "Decimals allowed"}
                    </p>
                ) : null}
                <p><span className="text-indigo-100/50">Access:</span> {questionSettings.accessType}</p>
                <p><span className="text-indigo-100/50">Premium:</span> {questionSettings.isPremium ? "Yes" : "No"}</p>
                {questionSettings.imageName ? (
                    <p><span className="text-indigo-100/50">Cover:</span> {questionSettings.imageName}</p>
                ) : null}
            </div>
        </div>
    );
}
