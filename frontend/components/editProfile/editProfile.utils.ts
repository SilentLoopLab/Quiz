import type { UpdateProfileDto, User } from "../../types/auth.types";

type ProfileFieldName = "name" | "email";

export type ProfileFieldErrors = Partial<Record<ProfileFieldName, string>>;

export const DEFAULT_PROFILE_FORM_ERROR =
    "Something went wrong. Please try again.";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const profileFieldMessageMap: Record<string, ProfileFieldName> = {
    "Name is required": "name",
    "Email is required": "email",
    "Email is invalid": "email",
    "Email already exists": "email",
};

export function createProfileFormValues(user: User | null): UpdateProfileDto {
    return {
        name: user?.name ?? "",
        email: user?.email ?? "",
        image: user?.image ?? "",
        bio: user?.bio ?? "",
        location: user?.location ?? "",
        phone: user?.phone ?? "",
    };
}

export function normalizeProfileFormValues(
    values: UpdateProfileDto,
): UpdateProfileDto {
    return {
        name: values.name.trim(),
        email: values.email.trim(),
        image: values.image.trim(),
        bio: values.bio.trim(),
        location: values.location.trim(),
        phone: values.phone.trim(),
    };
}

export function validateProfileFormValues(
    values: UpdateProfileDto,
): ProfileFieldErrors {
    const errors: ProfileFieldErrors = {};

    if (!values.name) {
        errors.name = "Name is required";
    }

    if (!values.email) {
        errors.email = "Email is required";
    } else if (!emailPattern.test(values.email)) {
        errors.email = "Email is invalid";
    }

    return errors;
}

export function getProfileFieldError(message: string) {
    return profileFieldMessageMap[message];
}
