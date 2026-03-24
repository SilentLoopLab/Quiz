import type {
    AdminDeleteQuizResponse,
    AdminQuizCreationAccessPayload,
    AdminQuizCreationAccessResponse,
} from "../types/admin.types";
import { api, getApiErrorDetails, withAuthRequest } from "./api";

export const adminService = {
    async setUserQuizCreationAccess(
        userId: string,
        payload: AdminQuizCreationAccessPayload,
    ): Promise<AdminQuizCreationAccessResponse> {
        try {
            const response = await api.patch<AdminQuizCreationAccessResponse>(
                `/api/admin/users/${userId}/quiz-creation-access`,
                payload,
                withAuthRequest(),
            );

            return response.data;
        } catch (error) {
            const { message } = getApiErrorDetails(error);
            throw new Error(message);
        }
    },

    async deleteQuiz(quizId: string): Promise<AdminDeleteQuizResponse> {
        try {
            const response = await api.delete<AdminDeleteQuizResponse>(
                `/api/admin/quizzes/${quizId}`,
                withAuthRequest(),
            );

            return response.data;
        } catch (error) {
            const { message } = getApiErrorDetails(error);
            throw new Error(message);
        }
    },
};
