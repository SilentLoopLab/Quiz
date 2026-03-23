interface PremiumBadgeProps {
    className?: string;
}

export default function PremiumBadge({
    className = "",
}: PremiumBadgeProps) {
    const badgeClassName = [
        "inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-100",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <span className={badgeClassName}>
            <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="currentColor"
            >
                <path d="m12 2.75 2.69 5.45 6.01.87-4.35 4.24 1.03 5.99L12 16.47 6.62 19.3l1.03-5.99L3.3 9.07l6.01-.87L12 2.75Z" />
            </svg>
            Premium
        </span>
    );
}
