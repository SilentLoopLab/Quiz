import type {
    QuizManageQuiz,
    QuizQuestionDraft,
} from "../../types/quiz.types";

function formatManualPoints(points: number) {
    if (!Number.isFinite(points) || points <= 0) {
        return "";
    }

    return String(points);
}

export function buildQuestionDraftsFromManageQuiz(
    quiz: QuizManageQuiz,
): QuizQuestionDraft[] {
    return quiz.questions.map((question) => ({
        id: question.id,
        kind: question.kind,
        prompt: question.prompt,
        isRequired: question.required,
        imageFile: null,
        imageName: question.imageName,
        imagePreviewUrl: question.imageUrl,
        manualPoints:
            question.kind === "choice"
                ? formatManualPoints(question.points)
                : "",
        options: question.options.map((option) => ({
            id: option.id,
            text: option.text,
            isCorrect: option.isCorrect,
        })),
    }));
}
