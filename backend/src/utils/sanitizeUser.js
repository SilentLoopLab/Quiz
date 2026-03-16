function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    premium: user.premium === true,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

module.exports = sanitizeUser;
