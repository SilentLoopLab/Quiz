"use client";

import { useState } from "react";
import AppShell from "../../components/navigation/AppShell";

const quizThemes = ["All", "Programming", "Medicine", "Driving"] as const;

const quizOptions = [
    {
        title: "JavaScript Essentials",
        theme: "Programming",
        level: "Beginner",
        description: "Core syntax, arrays, objects, and browser basics.",
    },
    {
        title: "React Patterns",
        theme: "Programming",
        level: "Intermediate",
        description: "Components, state flow, hooks, and UI architecture.",
    },
    {
        title: "Human Anatomy Basics",
        theme: "Medicine",
        level: "Beginner",
        description: "Organs, systems, and essential body structure topics.",
    },
    {
        title: "Clinical Practice Review",
        theme: "Medicine",
        level: "Advanced",
        description:
            "Patient cases, diagnosis thinking, and treatment decisions.",
    },
    {
        title: "Road Signs Trainer",
        theme: "Driving",
        level: "Beginner",
        description: "Signs, symbols, warnings, and direction markers.",
    },
    {
        title: "Safe Driving Rules",
        theme: "Driving",
        level: "Intermediate",
        description:
            "Traffic flow, priority rules, and everyday driving safety.",
    },
] as const;

export default function HomePage() {
    const [activeTheme, setActiveTheme] =
        useState<(typeof quizThemes)[number]>("All");

    const visibleQuizzes =
        activeTheme === "All"
            ? quizOptions
            : quizOptions.filter((quiz) => quiz.theme === activeTheme);

    return (
        <AppShell>
            <section className="rounded-[2rem] border border-indigo-200/15 bg-indigo-900/45 p-6 shadow-xl sm:p-8">
                <div className="rounded-[1.5rem] border border-indigo-200/10 bg-indigo-950/35 p-6">
                    <p className="text-sm uppercase tracking-[0.3em] text-indigo-200/55">
                        Home
                    </p>
                    <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
                        Welcome back to Quizz
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-indigo-100/65 sm:text-base">
                        This is your workspace for managing profile details,
                        browsing your quizzes, and upgrading your account when
                        you need premium tools.
                    </p>
                </div>

                <div className="mt-6 rounded-[1.5rem] border border-indigo-200/10 bg-indigo-950/35 p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-sm uppercase tracking-[0.24em] text-indigo-200/55">
                                Quiz Themes
                            </p>
                            <h2 className="mt-3 text-2xl font-semibold text-white">
                                Pick a topic and explore quizzes
                            </h2>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {quizThemes.map((theme) => {
                                const isActive = theme === activeTheme;

                                return (
                                    <button
                                        key={theme}
                                        type="button"
                                        onClick={() => setActiveTheme(theme)}
                                        className={`rounded-2xl border px-4 py-2.5 text-sm font-medium transition ${
                                            isActive
                                                ? "border-indigo-100/30 bg-indigo-100 text-indigo-950 shadow-lg"
                                                : "border-indigo-200/15 bg-indigo-900/45 text-indigo-50 hover:bg-indigo-900/70"
                                        }`}
                                    >
                                        {theme}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-6 grid gap-4 xl:grid-cols-2">
                        {visibleQuizzes.map((quiz) => (
                            <article
                                key={quiz.title}
                                className="rounded-2xl border border-indigo-200/10 bg-indigo-900/35 p-5"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-sm text-indigo-100/55">
                                            {quiz.theme}
                                        </p>
                                        <h3 className="mt-2 text-xl font-semibold text-white">
                                            {quiz.title}
                                        </h3>
                                    </div>

                                    <span className="rounded-full border border-indigo-200/15 bg-indigo-950/50 px-3 py-1 text-xs uppercase tracking-[0.18em] text-indigo-100/60">
                                        {quiz.level}
                                    </span>
                                </div>

                                <p className="mt-4 text-sm leading-7 text-indigo-100/65">
                                    {quiz.description}
                                </p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </AppShell>
    );
}
