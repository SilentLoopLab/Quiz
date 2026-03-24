import type {
    QuizCreatePayload,
    QuizCreateResponse,
    QuizDeleteResponse,
    QuizHomeFeedResponse,
    QuizManageQuiz,
    QuizOwnListResponse,
    QuizPlayableResponse,
    QuizSubmissionPayload,
    QuizSubmissionResponse,
    QuizPremiumListFilter,
    QuizPublicListResponse,
} from "../types/quiz.types";
import { api, getApiErrorDetails, withAuthRequest } from "./api";

export const quizService = {
    async getHomeFeed(): Promise<QuizHomeFeedResponse> {
        try {
            const response = await api.get<QuizHomeFeedResponse>(
                "/api/quizzes/home",
                withAuthRequest(),
            );

            return response.data;
        } catch (error) {
            const { message } = getApiErrorDetails(error);
            throw new Error(message);
        }
    },

    async listPublicQuizzes(params: {
        topic?: string;
        premium?: QuizPremiumListFilter;
        page?: number;
        limit?: number;
    } = {}): Promise<QuizPublicListResponse> {
        try {
            const response = await api.get<QuizPublicListResponse>(
                "/api/quizzes",
                withAuthRequest({
                    params,
                }),
            );

            return response.data;
        } catch (error) {
            const { message } = getApiErrorDetails(error);
            throw new Error(message);
        }
    },

    async createQuiz(payload: QuizCreatePayload): Promise<QuizCreateResponse> {
        try {
            const response = await api.post<QuizCreateResponse>(
                "/api/quizzes",
                payload,
                withAuthRequest(),
            );

            return response.data;
        } catch (error) {
            const { message } = getApiErrorDetails(error);
            throw new Error(message);
        }
    },

    async listOwnQuizzes(): Promise<QuizOwnListResponse> {
        try {
            const response = await api.get<QuizOwnListResponse>(
                "/api/quizzes/mine",
                withAuthRequest(),
            );

            return response.data;
        } catch (error) {
            const { message } = getApiErrorDetails(error);
            throw new Error(message);
        }
    },

    async getManageQuiz(quizId: string): Promise<{ quiz: QuizManageQuiz }> {
        try {
            const response = await api.get<{ quiz: QuizManageQuiz }>(
                `/api/quizzes/${quizId}/manage`,
                withAuthRequest(),
            );

            return response.data;
        } catch (error) {
            const { message } = getApiErrorDetails(error);
            throw new Error(message);
        }
    },

    async getPlayableQuiz(quizId: string): Promise<QuizPlayableResponse> {
        try {
            const response = await api.get<QuizPlayableResponse>(
                `/api/quizzes/${quizId}`,
                withAuthRequest(),
            );

            return response.data;
        } catch (error) {
            const { message } = getApiErrorDetails(error);
            throw new Error(message);
        }
    },

    async getPlayableQuizByShareToken(
        shareToken: string,
    ): Promise<QuizPlayableResponse> {
        try {
            const response = await api.get<QuizPlayableResponse>(
                `/api/quizzes/shared/${shareToken}`,
                withAuthRequest(),
            );

            return response.data;
        } catch (error) {
            const { message } = getApiErrorDetails(error);
            throw new Error(message);
        }
    },

    async submitQuizAttempt(
        quizId: string,
        payload: QuizSubmissionPayload,
    ): Promise<QuizSubmissionResponse> {
        try {
            const response = await api.post<QuizSubmissionResponse>(
                `/api/quizzes/${quizId}/submit`,
                payload,
                withAuthRequest(),
            );

            return response.data;
        } catch (error) {
            const { message } = getApiErrorDetails(error);
            throw new Error(message);
        }
    },

    async updateQuiz(
        quizId: string,
        payload: QuizCreatePayload,
    ): Promise<QuizCreateResponse> {
        try {
            const response = await api.patch<QuizCreateResponse>(
                `/api/quizzes/${quizId}`,
                payload,
                withAuthRequest(),
            );

            return response.data;
        } catch (error) {
            const { message } = getApiErrorDetails(error);
            throw new Error(message);
        }
    },

    async deleteQuiz(quizId: string): Promise<QuizDeleteResponse> {
        try {
            const response = await api.delete<QuizDeleteResponse>(
                `/api/quizzes/${quizId}`,
                withAuthRequest(),
            );

            return response.data;
        } catch (error) {
            const { message } = getApiErrorDetails(error);
            throw new Error(message);
        }
    },
};
