const createHttpError = require("../utils/createHttpError");
const normalizeString = require("../utils/normalizeString");
const sanitizeUser = require("../utils/sanitizeUser");
const { isSuperAdminUser } = require("../utils/normalizeUser");
const { updateUserById, findUserById } = require("./user.service");
const { deleteQuiz } = require("./quiz.service");

function nowIso() {
  return new Date().toISOString();
}

function validateQuizCreationModerationInput(payload) {
  const isBlocked = payload?.isBlocked;

  if (typeof isBlocked !== "boolean") {
    throw createHttpError(400, "isBlocked must be a boolean");
  }

  if (isBlocked !== true) {
    throw createHttpError(400, "Quiz creation access can only be blocked.");
  }

  return {
    isBlocked,
  };
}

async function requireTargetUserForModeration(adminUser, targetUserId) {
  const targetUser = await findUserById(targetUserId);

  if (!targetUser) {
    throw createHttpError(404, "User not found");
  }

  if (targetUser.id === adminUser.id) {
    throw createHttpError(
      400,
      "Admin cannot change quiz creation access for themselves."
    );
  }

  if (isSuperAdminUser(targetUser)) {
    throw createHttpError(403, "Admin moderation is not allowed for another admin.");
  }

  return targetUser;
}

async function setUserQuizCreationBlocked(adminUser, targetUserId, payload) {
  const { isBlocked } = validateQuizCreationModerationInput(payload);
  const targetUser = await requireTargetUserForModeration(adminUser, targetUserId);
  const timestamp = nowIso();
  const updatedUser = await updateUserById(targetUser.id, (currentUser) => ({
    ...currentUser,
    quizCreationBlocked: isBlocked,
    quizCreationBlockedAt: timestamp,
    quizCreationBlockedBy: adminUser.id,
    quizCreationBlockReason: "",
    updatedAt: timestamp,
  }));

  if (!updatedUser) {
    throw createHttpError(404, "User not found");
  }

  return {
    user: sanitizeUser(updatedUser),
    moderation: {
      isBlocked,
      reason: "",
      changedAt: timestamp,
      changedBy: adminUser.id,
    },
  };
}

async function adminDeleteQuiz(adminUser, quizId) {
  return deleteQuiz(adminUser, quizId);
}

module.exports = {
  setUserQuizCreationBlocked,
  adminDeleteQuiz,
};
