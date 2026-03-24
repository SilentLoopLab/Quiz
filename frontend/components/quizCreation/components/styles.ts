export function getCorrectOptionClassName(isCorrect: boolean) {
    return [
        "rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition",
        isCorrect
            ? "border-emerald-200/30 bg-emerald-100 text-emerald-950"
            : "border-indigo-200/15 bg-indigo-950/35 text-indigo-100/70 hover:bg-indigo-900/60",
    ].join(" ");
}

export function getRequirementButtonClassName(isActive: boolean) {
    return [
        "rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition",
        isActive
            ? "border-indigo-100/35 bg-indigo-100 text-indigo-950"
            : "border-indigo-200/15 bg-indigo-950/35 text-indigo-100/70 hover:bg-indigo-900/60",
    ].join(" ");
}

export function formatPoints(points: number) {
    return Number.isInteger(points) ? String(points) : points.toFixed(2);
}
