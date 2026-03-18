"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useAuthStore } from "../store/authStore";
import type { UpdateProfileDto } from "../types/auth.types";
import { usePhotoUpload } from "./usePhotoUpload";
import { resolveProfileImage } from "../lib/profileImage";
import {
    createProfileFormValues,
    DEFAULT_PROFILE_FORM_ERROR,
    getProfileFieldError,
    type ProfileFieldErrors,
    normalizeProfileFormValues,
    validateProfileFormValues,
} from "../components/editProfile/editProfile.utils";

interface UseEditProfileFormParams {
    isOpen: boolean;
    onClose: () => void;
}

export function useEditProfileForm({
    isOpen,
    onClose,
}: UseEditProfileFormParams) {
    const { user, isLoading, updateProfile } = useAuthStore(
        useShallow((state) => ({
            user: state.user,
            isLoading: state.isLoading,
            updateProfile: state.updateProfile,
        })),
    );
    const { isUploading, resetUploadState, uploadPhoto } = usePhotoUpload();
    const [formValues, setFormValues] = useState<UpdateProfileDto>(() =>
        createProfileFormValues(user),
    );
    const [fieldErrors, setFieldErrors] = useState<ProfileFieldErrors>({});
    const [formError, setFormError] = useState("");

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        setFormValues(createProfileFormValues(user));
        setFieldErrors({});
        setFormError("");
        resetUploadState();
    }, [isOpen, user]);

    function handleFieldChange(field: keyof UpdateProfileDto, value: string) {
        setFormValues((current) => ({ ...current, [field]: value }));
        setFormError("");

        if (field === "name" || field === "email") {
            setFieldErrors((current) =>
                current[field] ? { ...current, [field]: undefined } : current,
            );
        }
    }

    async function handleImageUpload(files: FileList | null) {
        const file = files?.[0];

        if (!file) {
            return;
        }

        setFormError("");

        try {
            const response = await uploadPhoto(file, { fieldName: "image" });
            const nextImageUrl = response.url || response.files[0]?.url || "";

            setFormValues((current) => ({
                ...current,
                image: nextImageUrl,
            }));
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : DEFAULT_PROFILE_FORM_ERROR;

            setFormError(message);
        }
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const normalizedValues = normalizeProfileFormValues(formValues);
        const nextFieldErrors = validateProfileFormValues(normalizedValues);

        setFieldErrors({});
        setFormError("");

        if (Object.keys(nextFieldErrors).length > 0) {
            setFieldErrors(nextFieldErrors);
            return;
        }

        try {
            await updateProfile(normalizedValues);
            onClose();
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : DEFAULT_PROFILE_FORM_ERROR;
            const field = getProfileFieldError(message);

            if (field) {
                setFieldErrors({ [field]: message });
                return;
            }

            setFormError(message);
        }
    }

    return {
        fieldErrors,
        formError,
        formValues,
        handleFieldChange,
        handleImageUpload,
        handleSubmit,
        isUploadingImage: isUploading,
        isLoading,
        profileImageSrc: resolveProfileImage(formValues.image),
    };
}
