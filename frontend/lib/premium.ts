import type { User } from "../types/auth.types";

const ACTIVE_STRIPE_PREMIUM_STATUSES = new Set([
    "active",
    "trialing",
    "past_due",
    "unpaid",
]);

function parseIsoDate(value: string): Date | null {
    if (!value) {
        return null;
    }

    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
        return null;
    }

    return parsedDate;
}

function addMonths(date: Date, months: number): Date {
    const nextDate = new Date(date);
    nextDate.setUTCMonth(nextDate.getUTCMonth() + months);
    return nextDate;
}

function hasAllowedPremiumStatus(user: Pick<User, "stripeSubscriptionStatus">) {
    const stripeSubscriptionStatus =
        user.stripeSubscriptionStatus?.trim().toLowerCase() || "";

    if (!stripeSubscriptionStatus) {
        return true;
    }

    return ACTIVE_STRIPE_PREMIUM_STATUSES.has(stripeSubscriptionStatus);
}

export function resolvePremiumExpiresAt(
    user: Pick<
        User,
        "premiumPlan" | "premiumStartedAt" | "premiumExpiresAt"
    >,
): string {
    const explicitPremiumExpiresAt = parseIsoDate(user.premiumExpiresAt);

    if (explicitPremiumExpiresAt) {
        return explicitPremiumExpiresAt.toISOString();
    }

    if (user.premiumPlan !== "stripe_monthly") {
        return "";
    }

    const premiumStartedAt = parseIsoDate(user.premiumStartedAt);

    if (!premiumStartedAt) {
        return "";
    }

    return addMonths(premiumStartedAt, 1).toISOString();
}

export function isPremiumActive(
    user:
        | Pick<
              User,
              | "premium"
              | "premiumPlan"
              | "premiumStartedAt"
              | "premiumExpiresAt"
              | "stripeSubscriptionStatus"
          >
        | null
        | undefined,
): boolean {
    if (!user) {
        return false;
    }

    if (!hasAllowedPremiumStatus(user)) {
        return false;
    }

    if (user.premium === true && !user.premiumStartedAt && !user.premiumPlan) {
        return true;
    }

    const premiumExpiresAt = resolvePremiumExpiresAt(user);

    if (!premiumExpiresAt) {
        return user.premium === true;
    }

    return Date.parse(premiumExpiresAt) > Date.now();
}

export function normalizePremiumUser(user: User): User {
    const premiumExpiresAt = resolvePremiumExpiresAt(user);

    return {
        ...user,
        premium: isPremiumActive({
            ...user,
            premiumExpiresAt,
        }),
        premiumExpiresAt,
    };
}

export function formatPremiumDate(value: string): string | null {
    if (!value) {
        return null;
    }

    const parsedDate = parseIsoDate(value);

    if (!parsedDate) {
        return null;
    }

    return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    }).format(parsedDate);
}
