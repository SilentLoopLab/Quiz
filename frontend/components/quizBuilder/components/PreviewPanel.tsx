"use client";

interface PreviewPanelProps {
    preview: unknown;
}

export function PreviewPanel({ preview }: PreviewPanelProps) {
    return (
        <aside className="rounded-[1.5rem] border border-indigo-200/10 bg-indigo-950/35 p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-indigo-200/55">
                Preview
            </p>
            <h2 className="mt-4 text-2xl font-semibold text-white">
                Quiz settings
            </h2>
            <p className="mt-3 text-sm leading-7 text-indigo-100/65">
                This preview reflects the settings state in real time.
            </p>

            <pre className="mt-6 overflow-x-auto rounded-2xl border border-indigo-200/10 bg-indigo-950/60 p-4 text-xs leading-6 text-indigo-100/85">
                {JSON.stringify(preview, null, 2)}
            </pre>

            <div className="mt-6 rounded-2xl border border-emerald-300/10 bg-emerald-950/20 p-4">
                <p className="text-sm font-semibold text-emerald-100">
                    Local draft persistence
                </p>
                <p className="mt-2 text-sm leading-7 text-emerald-100/75">
                    These settings are stored with Zustand in localStorage, so
                    the draft stays after page refresh.
                </p>
            </div>
        </aside>
    );
}
