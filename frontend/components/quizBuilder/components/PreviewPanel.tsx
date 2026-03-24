"use client";

interface PreviewPanelProps {
    preview: {
        accessType: string;
        answerMode: string;
        category: string;
        difficulty: string;
        imageName?: string;
        isPremium: boolean;
        scoringMode: string;
        shuffleAnswers: boolean;
        shuffleQuestions: boolean;
        title: string;
    };
}

export function PreviewPanel({ preview }: PreviewPanelProps) {
    return (
        <aside className="rounded-[1.5rem] border border-indigo-200/10 bg-indigo-950/35 p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-indigo-200/55">
                Preview
            </p>
            <h2 className="mt-4 text-2xl font-semibold text-white">
                Summary
            </h2>
            <div className="mt-5 space-y-3 text-sm text-indigo-100/75">
                <p><span className="text-indigo-100/50">Title:</span> {preview.title || "Untitled"}</p>
                <p><span className="text-indigo-100/50">Topic:</span> {preview.category || "Not selected"}</p>
                <p><span className="text-indigo-100/50">Difficulty:</span> {preview.difficulty}</p>
                <p><span className="text-indigo-100/50">Answers:</span> {preview.answerMode}</p>
                <p><span className="text-indigo-100/50">Scoring:</span> {preview.scoringMode}</p>
                <p><span className="text-indigo-100/50">Access:</span> {preview.accessType}</p>
                <p><span className="text-indigo-100/50">Premium:</span> {preview.isPremium ? "Yes" : "No"}</p>
                <p><span className="text-indigo-100/50">Shuffle questions:</span> {preview.shuffleQuestions ? "Yes" : "No"}</p>
                <p><span className="text-indigo-100/50">Shuffle answers:</span> {preview.shuffleAnswers ? "Yes" : "No"}</p>
                {preview.imageName ? (
                    <p><span className="text-indigo-100/50">Cover:</span> {preview.imageName}</p>
                ) : null}
            </div>
        </aside>
    );
}
