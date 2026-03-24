"use client";

interface PayloadPreviewPanelProps {
    payloadPreview: unknown;
}

export function PayloadPreviewPanel({
    payloadPreview,
}: PayloadPreviewPanelProps) {
    return (
        <div className="rounded-[1.5rem] border border-indigo-200/10 bg-indigo-950/35 p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-indigo-200/55">
                Live Payload
            </p>
            <h2 className="mt-4 text-2xl font-semibold text-white">
                Ready for backend
            </h2>
            <p className="mt-3 text-sm leading-7 text-indigo-100/65">
                This payload merges the saved settings from Zustand with the
                questions currently kept in local component state.
            </p>

            <pre className="mt-6 overflow-x-auto rounded-2xl border border-indigo-200/10 bg-indigo-950/60 p-4 text-xs leading-6 text-indigo-100/85">
                {JSON.stringify(payloadPreview, null, 2)}
            </pre>
        </div>
    );
}
