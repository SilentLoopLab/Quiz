const { isUserPremium } = require("./normalizeUser");

function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: typeof user.image === "string" ? user.image : "",
    bio: typeof user.bio === "string" ? user.bio : "",
    location: typeof user.location === "string" ? user.location : "",
    phone: typeof user.phone === "string" ? user.phone : "",
    role: user.role,
    premium: isUserPremium(user),
    premiumPlan: typeof user.premiumPlan === "string" ? user.premiumPlan : "",
    premiumStartedAt: typeof user.premiumStartedAt === "string" ? user.premiumStartedAt : "",
    premiumExpiresAt: typeof user.premiumExpiresAt === "string" ? user.premiumExpiresAt : "",
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

module.exports = sanitizeUser;
