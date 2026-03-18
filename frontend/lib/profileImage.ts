export const DEFAULT_PROFILE_IMAGE_URL =
    "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png";

export function resolveProfileImage(image?: string | null): string {
    return image?.trim() || DEFAULT_PROFILE_IMAGE_URL;
}
