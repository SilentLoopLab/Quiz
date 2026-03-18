"use client";

import { useState } from "react";
import { cdnService } from "../services/cdn.service";
import type {
    UploadPhotosOptions,
    UploadPhotosResponse,
} from "../types/cdn.types";

const DEFAULT_UPLOAD_ERROR_MESSAGE = "Failed to upload image.";

export function usePhotoUpload() {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");

    async function uploadPhotos(
        files: FileList | File[],
        options?: UploadPhotosOptions,
    ): Promise<UploadPhotosResponse> {
        setIsUploading(true);
        setUploadError("");

        try {
            return await cdnService.uploadPhotos(files, options);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : DEFAULT_UPLOAD_ERROR_MESSAGE;

            setUploadError(message);
            throw new Error(message);
        } finally {
            setIsUploading(false);
        }
    }

    async function uploadPhoto(
        file: File,
        options?: UploadPhotosOptions,
    ): Promise<UploadPhotosResponse> {
        return uploadPhotos([file], options);
    }

    function resetUploadState() {
        setUploadError("");
        setIsUploading(false);
    }

    return {
        isUploading,
        resetUploadState,
        uploadError,
        uploadPhoto,
        uploadPhotos,
    };
}
