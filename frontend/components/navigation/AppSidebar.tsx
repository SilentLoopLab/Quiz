"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { resolveProfileImage } from "../../lib/profileImage";
import PremiumBadge from "../premium/PremiumBadge";
import { useAuthStore } from "../../store/authStore";

function getNavItemClassName(isActive: boolean) {
    return [
        "rounded-2xl border px-4 py-3 text-sm font-medium transition",
        isActive
            ? "border-indigo-100/30 bg-indigo-100 text-indigo-950 shadow-lg"
            : "border-indigo-200/15 bg-indigo-950/35 text-indigo-50 hover:bg-indigo-950/65",
    ].join(" ");
}

export default function AppSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const navItems = [
        { href: "/home", label: "Home" },
        { href: "/profile", label: "Profile" },
        { href: "/quizzes/mine", label: "My Quizzes" },
        { href: "/quizzes", label: "All Quizzes" },
        ...(user?.premium
            ? []
            : [{ href: "/premium", label: "Upgrade to Premium" }]),
        { href: "/login", label: "Change Profile" },
    ];

    const profileImageSrc = resolveProfileImage(user?.image);
    const displayName = user?.name || "Guest User";
    const displayEmail = user?.email || "No email";
    const activeHref =
        navItems
            .filter(
                (item) =>
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`),
            )
            .sort((leftItem, rightItem) => rightItem.href.length - leftItem.href.length)[0]
            ?.href || "";

    async function handleLogout() {
        await logout();
        router.push("/login");
    }
    function handleChangeProfile() {
        router.push("/login");
    }
    return (
        <aside className="w-full rounded-[2rem] border border-indigo-200/15 bg-indigo-900/55 p-4 text-white shadow-xl backdrop-blur-xl lg:sticky lg:top-6 lg:w-80 lg:self-start xl:w-[21rem]">
            <div className="rounded-[1.5rem] border border-indigo-200/10 bg-indigo-950/35 p-4">
                <p className="-ml-1 text-xs uppercase tracking-[0.28em] text-indigo-200/55">
                    QUIZZ SPACE
                </p>
                <div className="mt-4 flex items-center gap-3">
                    <img
                        src={profileImageSrc}
                        alt={displayName}
                        className="h-14 w-14 rounded-2xl border border-indigo-200/20 bg-indigo-950/60 object-cover"
                    />
                    <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-white">
                            {displayName}
                        </p>
                        <p className="truncate text-sm text-indigo-100/60">
                            {displayEmail}
                        </p>
                        {user?.premium ? (
                            <PremiumBadge className="mt-2" />
                        ) : null}
                    </div>
                </div>
            </div>

            <nav className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {navItems.map((item) => {
                    const isActive = item.href === activeHref;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={getNavItemClassName(isActive)}
                        >
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <button
                type="button"
                onClick={handleLogout}
                className="mt-4 w-full rounded-2xl border border-rose-300/20 bg-rose-950/30 px-4 py-3 text-sm font-medium text-rose-100 transition hover:bg-rose-950/50"
            >
                Log Out
            </button>
        </aside>
    );
}
