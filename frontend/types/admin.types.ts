import type { QuizDeleteResponse } from "./quiz.types";
import type { User } from "./auth.types";

export interface AdminQuizCreationAccessPayload {
    isBlocked: boolean;
}

export interface AdminQuizCreationAccessResponse {
    user: User;
    moderation: {
        isBlocked: boolean;
        reason: string;
        changedAt: string;
        changedBy: string;
    };
}

export type AdminDeleteQuizResponse = QuizDeleteResponse;
