import { getStoredAuthToken } from "../lib/authStorage";
import type {
    UploadPhotosFieldName,
    UploadPhotosOptions,
    UploadPhotosResponse,
} from "../types/cdn.types";
import { api, getApiErrorDetails } from "./api";

const DEFAULT_UPLOAD_ERROR_MESSAGE = "Please select at least one image.";

function normalizeFiles(files: FileList | File[]): File[] {
    return Array.isArray(files) ? files : Array.from(files);
}

function resolveFieldName(
    files: File[],
    fieldName?: UploadPhotosFieldName,
): UploadPhotosFieldName {
    if (fieldName) {
        return fieldName;
    }

    return files.length > 1 ? "images" : "image";
}

export const cdnService = {
    async uploadPhotos(
        files: FileList | File[],
        options: UploadPhotosOptions = {},
    ): Promise<UploadPhotosResponse> {
        const normalizedFiles = normalizeFiles(files);

        if (normalizedFiles.length === 0) {
            throw new Error(DEFAULT_UPLOAD_ERROR_MESSAGE);
        }

        const formData = new FormData();
        const fieldName = resolveFieldName(normalizedFiles, options.fieldName);

        for (const file of normalizedFiles) {
            formData.append(fieldName, file);
        }

        const token = options.token ?? getStoredAuthToken();

        try {
            const response = await api.post<UploadPhotosResponse>(
                "/api/cdn/photos",
                formData,
                {
                    headers: token
                        ? {
                              Authorization: `Bearer ${token}`,
                          }
                        : undefined,
                },
            );

            return response.data;
        } catch (error) {
            const { message } = getApiErrorDetails(error);
            throw new Error(message);
        }
    },

    async uploadPhoto(
        file: File,
        options: UploadPhotosOptions = {},
    ): Promise<UploadPhotosResponse> {
        return cdnService.uploadPhotos([file], options);
    },
};
