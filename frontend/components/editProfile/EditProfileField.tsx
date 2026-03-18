import type { HTMLInputTypeAttribute } from "react";

interface EditProfileFieldProps {
    error?: string;
    label: string;
    multiline?: boolean;
    onChange: (value: string) => void;
    placeholder: string;
    rows?: number;
    type?: HTMLInputTypeAttribute;
    value: string;
}

const fieldClassName =
    "w-full rounded-xl border border-indigo-200/25 bg-indigo-950/50 px-4 py-3 text-white outline-none transition placeholder:text-indigo-100/40 focus:border-indigo-100/50";

export default function EditProfileField({
    error,
    label,
    multiline = false,
    onChange,
    placeholder,
    rows = 5,
    type = "text",
    value,
}: EditProfileFieldProps) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm text-indigo-100/80">
                {label}
            </span>

            {multiline ? (
                <textarea
                    rows={rows}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder={placeholder}
                    className={`${fieldClassName} resize-none`}
                />
            ) : (
                <input
                    type={type}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder={placeholder}
                    className={fieldClassName}
                />
            )}

            {error ? (
                <p className="mt-2 text-sm text-red-200">{error}</p>
            ) : null}
        </label>
    );
}
