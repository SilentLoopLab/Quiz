export function getChoiceButtonClassName(isActive: boolean) {
    return [
        "rounded-full border px-4 py-2 text-sm font-medium transition",
        isActive
            ? "border-indigo-100/40 bg-indigo-100 text-indigo-950 shadow-lg shadow-indigo-950/15"
            : "border-indigo-200/15 bg-indigo-950/35 text-indigo-100/72 hover:border-indigo-100/30 hover:bg-indigo-900/60",
    ].join(" ");
}

export function getChoiceCardClassName(
    isActive: boolean,
    isDisabled = false,
) {
    return [
        "rounded-2xl border p-4 text-left transition",
        isActive
            ? "border-indigo-100/35 bg-indigo-100 text-indigo-950 shadow-lg shadow-indigo-950/15"
            : "border-indigo-200/10 bg-indigo-950/35 text-white hover:border-indigo-100/25 hover:bg-indigo-900/50",
        isDisabled
            ? "cursor-not-allowed opacity-45 hover:border-indigo-200/10 hover:bg-indigo-950/35"
            : "cursor-pointer",
    ].join(" ");
}
