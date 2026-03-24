"use client";

interface QuestionImageFieldProps {
    imageName: string;
    imagePreviewUrl: string;
    index: number;
    isDisabled?: boolean;
    onImageChange: (file: File | null) => void;
}

export function QuestionImageField({
    imageName,
    imagePreviewUrl,
    index,
    isDisabled = false,
    onImageChange,
}: QuestionImageFieldProps) {
    return (
        <div className="mt-5 rounded-[1.5rem] border border-indigo-200/10 bg-indigo-950/25 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <span className="block text-sm text-indigo-100/80">
                        Question image
                    </span>
                    <p className="mt-2 text-sm leading-7 text-indigo-100/60">Optional</p>
                </div>

                {imagePreviewUrl ? (
                    <button
                        type="button"
                        onClick={() => onImageChange(null)}
                        disabled={isDisabled}
                        className="rounded-2xl border border-rose-300/20 bg-rose-950/30 px-4 py-2.5 text-sm font-semibold text-rose-100 transition hover:bg-rose-950/50"
                    >
                        Remove Image
                    </button>
                ) : null}
            </div>

            <label className="mt-4 block">
                <input
                    type="file"
                    accept="image/*"
                    disabled={isDisabled}
                    onChange={(event) => {
                        onImageChange(event.target.files?.[0] ?? null);
                        event.target.value = "";
                    }}
                    className="block w-full text-sm text-indigo-100/75 file:mr-4 file:rounded-xl file:border-0 file:bg-indigo-100 file:px-4 file:py-2 file:font-medium file:text-indigo-950 disabled:cursor-not-allowed disabled:opacity-60"
                />
            </label>

            {imagePreviewUrl ? (
                <div className="mt-4 rounded-[1.5rem] border border-indigo-200/10 bg-indigo-950/45 p-4">
                    <p className="text-sm text-indigo-100/70">{imageName}</p>
                    <div className="mt-4 overflow-hidden rounded-[1.25rem] border border-indigo-200/10 bg-indigo-900/25 p-4">
                        <img
                            src={imagePreviewUrl}
                            alt={`Question ${index + 1} image preview`}
                            className="mx-auto block w-full max-w-full rounded-xl object-contain"
                            style={{ maxHeight: "34rem", height: "auto" }}
                        />
                    </div>
                </div>
            ) : null}
        </div>
    );
}
