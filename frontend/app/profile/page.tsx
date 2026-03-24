"use client";

import Link from "next/link";
import { useState } from "react";
import EditProfileModal from "../../components/editProfile/EditProfileModal";
import AppShell from "../../components/navigation/AppShell";
import PremiumBadge from "../../components/premium/PremiumBadge";
import { formatPremiumDate } from "../../lib/premium";
import {
    DEFAULT_PROFILE_IMAGE_URL,
    resolveProfileImage,
} from "../../lib/profileImage";
import { useAuthStore } from "../../store/authStore";

const emptyValue = "Not added yet";

export default function ProfilePage() {
    const user = useAuthStore((state) => state.user);
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

    if (!user) {
        return (
            <AppShell>
                <section className="w-full rounded-3xl border border-indigo-200/15 bg-indigo-900/30 p-8 text-center shadow-xl">
                    <h1 className="text-2xl font-semibold text-white">
                        Loading profile...
                    </h1>
                </section>
            </AppShell>
        );
    }

    const profileImageSrc = resolveProfileImage(user.image);
    const premiumExpiresAt = formatPremiumDate(user.premiumExpiresAt);

    return (
        <AppShell>
            <section className="mx-auto w-full max-w-4xl rounded-3xl border border-indigo-200/15 bg-indigo-900/30 p-6 shadow-xl sm:p-8">
                <div className="flex flex-col gap-5 border-b border-indigo-200/10 pb-6 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-4">
                        <img
                            src={profileImageSrc}
                            alt={user.name || "Profile image"}
                            onError={(event) => {
                                event.currentTarget.src =
                                    DEFAULT_PROFILE_IMAGE_URL;
                            }}
                            className="h-20 w-20 rounded-2xl border border-indigo-200/20 bg-indigo-950/50 object-cover shadow-lg"
                        />

                        <div>
                            <p className="text-sm uppercase tracking-[0.24em] text-indigo-200/60">
                                Profile
                            </p>
                            <div className="mt-3 flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl font-semibold">
                                    {user.name}
                                </h1>
                                {user.premium ? <PremiumBadge /> : null}
                            </div>
                            <p className="mt-2 text-sm text-indigo-100/70">
                                {user.email}
                            </p>
                            {user.premium && premiumExpiresAt ? (
                                <p className="mt-2 text-sm text-amber-100/80">
                                    Premium active until {premiumExpiresAt}
                                </p>
                            ) : null}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsEditProfileOpen(true)}
                        className="cursor-pointer rounded-xl bg-indigo-200 px-4 py-3 font-medium text-indigo-950 transition hover:bg-indigo-100"
                    >
                        Edit Profile
                    </button>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <article className="rounded-2xl border border-indigo-200/10 bg-indigo-950/30 p-5">
                        <p className="text-sm text-indigo-100/55">Name</p>
                        <p className="mt-2 text-lg font-medium">
                            {user.name || emptyValue}
                        </p>
                    </article>

                    <article className="rounded-2xl border border-indigo-200/10 bg-indigo-950/30 p-5">
                        <p className="text-sm text-indigo-100/55">Email</p>
                        <p className="mt-2 text-lg font-medium">
                            {user.email || emptyValue}
                        </p>
                    </article>

                    <article className="rounded-2xl border border-indigo-200/10 bg-indigo-950/30 p-5">
                        <p className="text-sm text-indigo-100/55">Location</p>
                        <p className="mt-2 text-lg font-medium">
                            {user.location || emptyValue}
                        </p>
                    </article>

                    <article className="rounded-2xl border border-indigo-200/10 bg-indigo-950/30 p-5">
                        <p className="text-sm text-indigo-100/55">Phone</p>
                        <p className="mt-2 text-lg font-medium">
                            {user.phone || emptyValue}
                        </p>
                    </article>
                </div>

                <article className="mt-4 rounded-2xl border border-indigo-200/10 bg-indigo-950/30 p-5">
                    <p className="text-sm text-indigo-100/55">About me</p>
                    <p className="mt-2 text-base leading-7 text-indigo-50/90">
                        {user.bio || emptyValue}
                    </p>
                </article>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <Link
                        href="/quizzes/create"
                        className="cursor-pointer rounded-xl border border-indigo-200/15 bg-indigo-950/40 px-4 py-3 text-left font-medium text-white transition hover:bg-indigo-950/70"
                    >
                        Add Quiz
                    </Link>

                    <Link
                        href="/quizzes/mine"
                        className="cursor-pointer rounded-xl border border-indigo-200/15 bg-indigo-950/40 px-4 py-3 text-left font-medium text-white transition hover:bg-indigo-950/70"
                    >
                        My Quizzes
                    </Link>

                    {!user.premium ? (
                        <Link
                            href="/premium"
                            className="cursor-pointer rounded-xl border border-indigo-200/15 bg-indigo-950/40 px-4 py-3 text-left font-medium text-white transition hover:bg-indigo-950/70"
                        >
                            Upgrade to Premium
                        </Link>
                    ) : null}
                </div>
            </section>

            <EditProfileModal
                isOpen={isEditProfileOpen}
                onClose={() => setIsEditProfileOpen(false)}
            />
        </AppShell>
    );
}
