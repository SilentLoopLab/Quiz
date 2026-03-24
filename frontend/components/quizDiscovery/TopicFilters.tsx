"use client";

interface TopicFiltersProps {
    activeTopic: string;
    filters: string[];
    isLoading?: boolean;
    onTopicChange: (topic: string) => void;
}

export function TopicFilters({
    activeTopic,
    filters,
    isLoading = false,
    onTopicChange,
}: TopicFiltersProps) {
    return (
        <div className="mt-6 flex flex-wrap gap-3">
            {filters.map((filter) => {
                const isActive = filter === activeTopic;

                return (
                    <button
                        key={filter}
                        type="button"
                        disabled={isLoading}
                        onClick={() => onTopicChange(filter)}
                        className={`rounded-2xl border px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-70 ${
                            isActive
                                ? "border-indigo-100/30 bg-indigo-100 text-indigo-950 shadow-lg"
                                : "border-indigo-200/15 bg-indigo-900/45 text-indigo-50 hover:bg-indigo-900/70"
                        }`}
                    >
                        {filter}
                    </button>
                );
            })}
        </div>
    );
}
