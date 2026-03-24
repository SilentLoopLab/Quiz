"use client";

interface CoverSectionProps {
    draftImageName: string;
    draftImageUrl: string;
    imagePreviewUrl: string;
    isSavingSettings: boolean;
    onImageSelection: (file: File | null) => void;
    onResetDraft: () => void;
    onSaveSettings: () => void | Promise<void>;
    resetLabel?: string;
    saveLabel?: string;
    savingLabel?: string;
}

export function CoverSection({
    draftImageName,
    draftImageUrl,
    imagePreviewUrl,
    isSavingSettings,
    onImageSelection,
    onResetDraft,
    onSaveSettings,
    resetLabel = "Reset Draft",
    saveLabel = "Save Settings and Continue",
    savingLabel = "Saving Settings...",
}: CoverSectionProps) {
    return (
        <>
            <article className="rounded-[1.75rem] border border-indigo-200/10 bg-indigo-900/30 p-5">
                <p className="text-sm uppercase tracking-[0.24em] text-indigo-200/55">
                    Cover
                </p>
                <label className="mt-4 block">
                    <span className="mb-2 block text-sm text-indigo-100/80">
                        Cover image
                    </span>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                            onImageSelection(event.target.files?.[0] ?? null);
                            event.target.value = "";
                        }}
                        className="block w-full text-sm text-indigo-100/75 file:mr-4 file:rounded-xl file:border-0 file:bg-indigo-100 file:px-4 file:py-2 file:font-medium file:text-indigo-950"
                    />
                </label>
            </article>

            {imagePreviewUrl || draftImageUrl ? (
                <div className="rounded-2xl border border-indigo-200/10 bg-indigo-900/35 p-4">
                    <img
                        src={imagePreviewUrl || draftImageUrl}
                        alt={draftImageName || "Quiz cover preview"}
                        className="h-40 w-full rounded-xl object-cover"
                    />
                    <p className="mt-3 text-sm text-indigo-100/60">
                        {draftImageName}
                    </p>
                </div>
            ) : draftImageName ? (
                <div className="rounded-2xl border border-indigo-200/10 bg-indigo-900/35 p-4">
                    <p className="text-sm font-medium text-white">
                        Saved image name
                    </p>
                    <p className="mt-3 text-sm leading-7 text-indigo-100/60">
                        {draftImageName}
                    </p>
                </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                    type="button"
                    onClick={onResetDraft}
                    className="rounded-2xl border border-indigo-200/15 bg-indigo-950/40 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-950/70"
                >
                    {resetLabel}
                </button>
                <button
                    type="button"
                    onClick={onSaveSettings}
                    disabled={isSavingSettings}
                    className="rounded-2xl bg-indigo-100 px-5 py-3 text-sm font-semibold text-indigo-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {isSavingSettings ? savingLabel : saveLabel}
                </button>
            </div>
        </>
    );
}
