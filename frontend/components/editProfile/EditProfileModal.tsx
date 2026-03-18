"use client";

import { useEffect, useRef } from "react";
import EditProfileField from "./EditProfileField";
import { DEFAULT_PROFILE_IMAGE_URL } from "../../lib/profileImage";
import { useEditProfileForm } from "../../hooks/useEditProfileForm";

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function EditProfileModal({
    isOpen,
    onClose,
}: EditProfileModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const {
        fieldErrors,
        formError,
        formValues,
        handleFieldChange,
        handleImageUpload,
        handleSubmit,
        isLoading,
        isUploadingImage,
        profileImageSrc,
    } = useEditProfileForm({
        isOpen,
        onClose,
    });
    const isBusy = isLoading || isUploadingImage;

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape" && !isBusy) {
                onClose();
            }
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isBusy, isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-950/80 px-4 py-6 backdrop-blur-sm"
            onClick={(event) => {
                if (event.target === event.currentTarget && !isBusy) {
                    onClose();
                }
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-profile-title"
                className="w-full max-w-2xl rounded-2xl border border-indigo-200/15 bg-indigo-900/70 p-6 text-white shadow-xl"
            >
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <h2
                            id="edit-profile-title"
                            className="text-2xl font-semibold"
                        >
                            Edit Profile
                        </h2>
                        <p className="mt-2 text-sm text-indigo-100/70">
                            Update the details people see on your profile.
                        </p>
                    </div>
                </div>

                {formError ? (
                    <p className="mb-4 rounded-xl border border-red-300/10 bg-red-950/30 px-4 py-3 text-sm text-red-200">
                        {formError}
                    </p>
                ) : null}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4 rounded-2xl border border-indigo-200/10 bg-indigo-950/30 p-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <img
                                    src={profileImageSrc}
                                    alt={formValues.name || "Profile image"}
                                    onError={(event) => {
                                        event.currentTarget.src =
                                            DEFAULT_PROFILE_IMAGE_URL;
                                    }}
                                    className="h-20 w-20 rounded-2xl border border-indigo-200/20 bg-indigo-950/50 object-cover shadow-lg"
                                />

                                <div>
                                    <p className="text-sm font-medium text-white">
                                        Profile image
                                    </p>
                                    <p className="mt-1 text-sm text-indigo-100/60">
                                        Upload one image for your public
                                        profile.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 sm:items-end">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    disabled={isBusy}
                                    onChange={(event) => {
                                        void handleImageUpload(
                                            event.target.files,
                                        );
                                        event.target.value = "";
                                    }}
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    disabled={isBusy}
                                    className="cursor-pointer rounded-xl border border-indigo-200/20 bg-indigo-950/40 px-4 py-3 font-medium text-white transition hover:bg-indigo-950/70 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isUploadingImage
                                        ? "Uploading..."
                                        : "Upload image"}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <EditProfileField
                            label="Name"
                            value={formValues.name}
                            onChange={(value) =>
                                handleFieldChange("name", value)
                            }
                            placeholder="Your name"
                            error={fieldErrors.name}
                        />

                        <EditProfileField
                            label="Email"
                            type="email"
                            value={formValues.email}
                            onChange={(value) =>
                                handleFieldChange("email", value)
                            }
                            placeholder="you@example.com"
                            error={fieldErrors.email}
                        />

                        <EditProfileField
                            label="Location"
                            value={formValues.location}
                            onChange={(value) =>
                                handleFieldChange("location", value)
                            }
                            placeholder="City, country"
                        />

                        <EditProfileField
                            label="Phone"
                            value={formValues.phone}
                            onChange={(value) =>
                                handleFieldChange("phone", value)
                            }
                            placeholder="+374 ..."
                        />
                    </div>

                    <div className="mt-4">
                        <EditProfileField
                            label="About me"
                            multiline
                            rows={5}
                            value={formValues.bio}
                            onChange={(value) =>
                                handleFieldChange("bio", value)
                            }
                            placeholder="Tell people a little about yourself"
                        />
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isBusy}
                            className="cursor-pointer rounded-xl border border-indigo-200/20 bg-indigo-950/40 px-4 py-3 font-medium text-white transition hover:bg-indigo-950/70 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isBusy}
                            className="cursor-pointer rounded-xl bg-indigo-200 px-4 py-3 font-medium text-indigo-950 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isLoading ? "Saving..." : "Save changes"}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}
