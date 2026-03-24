const crypto = require("crypto");
const path = require("path");
const { readJsonFile, writeJsonFile } = require("../utils/file");
const generateId = require("../utils/generateId");
const normalizeString = require("../utils/normalizeString");
const createHttpError = require("../utils/createHttpError");
const { isUserPremium } = require("../utils/normalizeUser");
const { findUserById, readUsers } = require("./user.service");
const {
  validateQuizCreationInput,
  validateQuizSubmissionInput,
} = require("./quiz.validation");

const quizzesFilePath = path.join(__dirname, "..", "data", "quizzes.json");
const quizInsightsFilePath = path.join(__dirname, "..", "data", "quiz-insights.json");
const quizTopicsFilePath = path.join(__dirname, "..", "data", "quiz-topics.json");
const quizAttemptsFilePath = path.join(__dirname, "..", "data", "quiz-attempts.json");
const DEFAULT_HOME_FEATURED_QUIZ_LIMIT = 6;
const DEFAULT_PUBLIC_QUIZ_PAGE = 1;
const DEFAULT_PUBLIC_QUIZ_LIMIT = 10;
const MAX_PUBLIC_QUIZ_LIMIT = 50;
const PREMIUM_LIST_FILTER_VALUES = new Set(["all", "free", "premium"]);
const QUIZ_QUESTION_KIND_VALUES = new Set(["respondent_name", "choice"]);

function nowIso() {
  return new Date().toISOString();
}

function roundPoints(value) {
  return Math.round(value * 100) / 100;
}

function getLatestIsoTimestamp(values) {
  const timestamps = values
    .map((value) => Date.parse(normalizeOptionalString(value)))
    .filter((value) => Number.isFinite(value));

  if (timestamps.length === 0) {
    return "";
  }

  return new Date(Math.max(...timestamps)).toISOString();
}

function normalizeOptionalString(value, maxLength) {
  const normalizedValue = normalizeString(value);

  if (!maxLength || normalizedValue.length <= maxLength) {
    return normalizedValue;
  }

  return normalizedValue.slice(0, maxLength);
}

function normalizeOptionalHttpUrl(value) {
  const normalizedValue = normalizeOptionalString(value, 2048);

  if (!normalizedValue) {
    return "";
  }

  try {
    const url = new URL(normalizedValue);

    if (url.protocol === "http:" || url.protocol === "https:") {
      return normalizedValue;
    }
  } catch {
    return "";
  }

  return "";
}

function normalizePositivePoints(value) {
  const numericValue = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(numericValue) || numericValue < 0) {
    return 0;
  }

  return roundPoints(numericValue);
}

function createShareToken() {
  return crypto.randomBytes(24).toString("hex");
}

function normalizeQuizOption(option) {
  if (!option || typeof option !== "object") {
    return null;
  }

  const text = normalizeOptionalString(option.text, 200);

  if (!text) {
    return null;
  }

  return {
    id: normalizeOptionalString(option.id, 80) || generateId(),
    text,
    isCorrect: option.isCorrect === true,
  };
}

function normalizeQuizQuestion(question) {
  if (!question || typeof question !== "object") {
    return null;
  }

  const kind =
    normalizeString(question.kind) === "respondent_name"
      ? "respondent_name"
      : normalizeString(question.kind) === "choice"
        ? "choice"
        : "";

  if (!kind) {
    return null;
  }

  const options =
    kind === "choice"
      ? (Array.isArray(question.options)
          ? question.options.map((option) => normalizeQuizOption(option)).filter(Boolean)
          : [])
      : [];

  return {
    id: normalizeOptionalString(question.id, 80) || generateId(),
    kind,
    prompt:
      normalizeOptionalString(question.prompt, 500) ||
      (kind === "respondent_name" ? "First name and last name" : ""),
    required: kind === "respondent_name" ? true : question.required === true,
    shuffleEligible: kind === "choice",
    responseType: kind === "respondent_name" ? "full_name" : "choice",
    imageName:
      kind === "choice" ? normalizeOptionalString(question.imageName, 255) : "",
    imageUrl:
      kind === "choice" ? normalizeOptionalHttpUrl(question.imageUrl) : "",
    points: kind === "choice" ? normalizePositivePoints(question.points) : 0,
    options,
  };
}

function normalizeQuizQuestions(questions) {
  if (!Array.isArray(questions)) {
    return [];
  }

  return questions.map((question) => normalizeQuizQuestion(question)).filter(Boolean);
}

function buildQuizOwnerLookup(users) {
  return new Map(
    (Array.isArray(users) ? users : [])
      .map((user) => {
        if (!user?.id) {
          return null;
        }

        return [
          user.id,
          {
            name: normalizeOptionalString(user.name, 120),
            quizCreationBlocked: user.quizCreationBlocked === true,
          },
        ];
      })
      .filter(Boolean)
  );
}

function resolveQuizOwnerName(quiz, ownerLookup = null) {
  if (ownerLookup && typeof ownerLookup.get === "function") {
    const resolvedOwnerName = normalizeOptionalString(
      ownerLookup.get(quiz?.ownerId)?.name,
      120
    );

    if (resolvedOwnerName) {
      return resolvedOwnerName;
    }
  }

  return normalizeOptionalString(quiz?.ownerName, 120);
}

function resolveQuizOwnerQuizCreationBlocked(quiz, ownerLookup = null) {
  if (ownerLookup && typeof ownerLookup.get === "function") {
    return ownerLookup.get(quiz?.ownerId)?.quizCreationBlocked === true;
  }

  return quiz?.ownerQuizCreationBlocked === true;
}

function normalizeQuizRecord(quiz, ownerLookup = null) {
  if (!quiz || typeof quiz !== "object") {
    return null;
  }

  const accessType =
    normalizeString(quiz.accessType) === "private" ? "private" : "public";
  const questions = normalizeQuizQuestions(quiz.questions);
  const questionCount = questions.filter((question) => question.kind === "choice").length;
  const totalPoints = roundPoints(
    questions.reduce((sum, question) => sum + question.points, 0)
  );
  const createdAt = normalizeOptionalString(quiz.createdAt) || nowIso();

  return {
    id: normalizeOptionalString(quiz.id, 80) || generateId(),
    ownerId: normalizeOptionalString(quiz.ownerId, 80),
    ownerName: resolveQuizOwnerName(quiz, ownerLookup),
    ownerQuizCreationBlocked: resolveQuizOwnerQuizCreationBlocked(
      quiz,
      ownerLookup
    ),
    title: normalizeOptionalString(quiz.title, 140),
    description: normalizeOptionalString(quiz.description, 500),
    category: normalizeOptionalString(quiz.category, 80),
    difficulty: normalizeOptionalString(quiz.difficulty, 24) || "Medium",
    answerMode: normalizeOptionalString(quiz.answerMode, 24) || "single",
    shuffleQuestions: quiz.shuffleQuestions === true,
    shuffleAnswers: quiz.shuffleAnswers === true,
    scoringMode: normalizeOptionalString(quiz.scoringMode, 24) || "automatic",
    manualPointsMode:
      normalizeOptionalString(quiz.manualPointsMode, 24) || "integer",
    accessType,
    isPremium: quiz.isPremium === true,
    status: normalizeOptionalString(quiz.status, 24) || "published",
    shareToken:
      accessType === "private"
        ? normalizeOptionalString(quiz.shareToken, 96) || createShareToken()
        : "",
    imageName: normalizeOptionalString(quiz.imageName, 255),
    imageUrl: normalizeOptionalHttpUrl(quiz.imageUrl),
    totalPoints,
    questionCount,
    createdAt,
    updatedAt: normalizeOptionalString(quiz.updatedAt) || createdAt,
    publishedAt: normalizeOptionalString(quiz.publishedAt) || createdAt,
    questions,
  };
}

function normalizeQuizRecords(quizzes, ownerLookup = null) {
  if (!Array.isArray(quizzes)) {
    return [];
  }

  return quizzes
    .map((quiz) => normalizeQuizRecord(quiz, ownerLookup))
    .filter((quiz) => quiz && quiz.ownerId && quiz.title && quiz.category);
}

async function readStoredQuizzes() {
  const quizzes = await readJsonFile(quizzesFilePath, []);
  return Array.isArray(quizzes) ? quizzes : [];
}

async function readQuizzes() {
  const quizzes = await readStoredQuizzes();
  const ownerLookup = buildQuizOwnerLookup(await readUsers());
  return normalizeQuizRecords(quizzes, ownerLookup);
}

function normalizeSubmissionQuestionResult(questionResult) {
  if (!questionResult || typeof questionResult !== "object") {
    return null;
  }

  const kind = normalizeOptionalString(questionResult.kind, 32);

  if (!QUIZ_QUESTION_KIND_VALUES.has(kind)) {
    return null;
  }

  return {
    questionId: normalizeOptionalString(questionResult.questionId, 80) || generateId(),
    kind,
    prompt: normalizeOptionalString(questionResult.prompt, 500),
    required: questionResult.required === true,
    points: normalizePositivePoints(questionResult.points),
    earnedPoints: normalizePositivePoints(questionResult.earnedPoints),
    isAnswered: questionResult.isAnswered === true,
    isCorrect:
      kind === "respondent_name"
        ? null
        : questionResult.isCorrect === true
          ? true
          : false,
    textAnswer:
      kind === "respondent_name"
        ? normalizeOptionalString(questionResult.textAnswer, 255)
        : "",
    selectedOptionIds: normalizeOptionIdSet(questionResult.selectedOptionIds),
    correctOptionIds: normalizeOptionIdSet(questionResult.correctOptionIds),
    selectedOptionTexts: (Array.isArray(questionResult.selectedOptionTexts)
      ? questionResult.selectedOptionTexts
      : [])
      .map((value) => normalizeOptionalString(value, 200))
      .filter(Boolean),
    correctOptionTexts: (Array.isArray(questionResult.correctOptionTexts)
      ? questionResult.correctOptionTexts
      : [])
      .map((value) => normalizeOptionalString(value, 200))
      .filter(Boolean),
  };
}

function normalizeSubmissionResult(result, options = {}) {
  const submittedAt =
    normalizeOptionalString(options.lastAttemptedAt || result?.submittedAt) || nowIso();
  const attemptId = normalizeOptionalString(options.attemptId, 80) || generateId();
  const attemptCount = Math.max(1, Number.parseInt(String(options.attemptCount ?? 1), 10) || 1);
  const questions = (Array.isArray(result?.questions) ? result.questions : [])
    .map((questionResult) => normalizeSubmissionQuestionResult(questionResult))
    .filter(Boolean);

  return {
    attemptId,
    attemptCount,
    lastAttemptedAt: submittedAt,
    isPersisted: options.isPersisted === true,
    quizId: normalizeOptionalString(result?.quizId, 80),
    title: normalizeOptionalString(result?.title, 140),
    totalPoints: normalizePositivePoints(result?.totalPoints),
    earnedPoints: normalizePositivePoints(result?.earnedPoints),
    percentage: normalizePositivePoints(result?.percentage),
    submittedAt,
    respondentName: normalizeOptionalString(result?.respondentName, 255),
    answeredQuestions: Math.max(
      0,
      Number.parseInt(String(result?.answeredQuestions ?? 0), 10) || 0
    ),
    totalQuestions: Math.max(
      0,
      Number.parseInt(String(result?.totalQuestions ?? questions.length), 10) || questions.length
    ),
    correctQuestions: Math.max(
      0,
      Number.parseInt(String(result?.correctQuestions ?? 0), 10) || 0
    ),
    incorrectQuestions: Math.max(
      0,
      Number.parseInt(String(result?.incorrectQuestions ?? 0), 10) || 0
    ),
    unansweredQuestions: Math.max(
      0,
      Number.parseInt(String(result?.unansweredQuestions ?? 0), 10) || 0
    ),
    questions,
  };
}

function normalizeQuizAttemptRecord(record) {
  if (!record || typeof record !== "object") {
    return null;
  }

  const id = normalizeOptionalString(record.id, 80) || generateId();
  const quizId = normalizeOptionalString(record.quizId, 80);
  const userId = normalizeOptionalString(record.userId, 80);
  const createdAt = normalizeOptionalString(record.createdAt) || nowIso();
  const updatedAt = normalizeOptionalString(record.updatedAt) || createdAt;
  const attemptCount = Math.max(1, Number.parseInt(String(record.attemptCount ?? 1), 10) || 1);
  const latestResult = normalizeSubmissionResult(record.latestResult, {
    attemptId: id,
    attemptCount,
    lastAttemptedAt: updatedAt,
    isPersisted: true,
  });

  if (!quizId || !userId || !latestResult.quizId) {
    return null;
  }

  return {
    id,
    quizId,
    userId,
    attemptCount,
    createdAt,
    updatedAt,
    latestResult,
  };
}

function normalizeQuizAttemptRecords(records) {
  if (!Array.isArray(records)) {
    return [];
  }

  return records
    .map((record) => normalizeQuizAttemptRecord(record))
    .filter(Boolean);
}

async function readStoredQuizAttempts() {
  const quizAttempts = await readJsonFile(quizAttemptsFilePath, []);
  return Array.isArray(quizAttempts) ? quizAttempts : [];
}

async function readQuizAttempts() {
  const quizAttempts = await readStoredQuizAttempts();
  return normalizeQuizAttemptRecords(quizAttempts);
}

async function writeQuizAttempts(quizAttempts) {
  await writeJsonFile(quizAttemptsFilePath, normalizeQuizAttemptRecords(quizAttempts));
}

async function syncQuizAttemptsMetadata() {
  const quizAttempts = await readStoredQuizAttempts();
  const normalizedQuizAttempts = normalizeQuizAttemptRecords(quizAttempts);

  if (JSON.stringify(quizAttempts) !== JSON.stringify(normalizedQuizAttempts)) {
    await writeJsonFile(quizAttemptsFilePath, normalizedQuizAttempts);
  }

  return normalizedQuizAttempts;
}

function normalizeTopicList(topics) {
  return [...new Set(
    (Array.isArray(topics) ? topics : [])
      .map((topic) => normalizeOptionalString(topic, 80))
      .filter(Boolean)
  )].sort((leftTopic, rightTopic) => leftTopic.localeCompare(rightTopic));
}

function buildQuizTopicRegistry(quizzes, storedTopics = []) {
  return {
    generatedAt: getLatestIsoTimestamp(
      (Array.isArray(quizzes) ? quizzes : []).map(
        (quiz) => quiz.updatedAt || quiz.createdAt
      )
    ),
    topics: normalizeTopicList([
      ...storedTopics,
      ...(Array.isArray(quizzes)
        ? quizzes.map((quiz) => normalizeOptionalString(quiz.category, 80))
        : []),
    ]),
  };
}

async function readQuizTopicRegistry(quizzes) {
  const fallbackTopicRegistry = buildQuizTopicRegistry(quizzes);
  const storedTopicRegistry = await readJsonFile(
    quizTopicsFilePath,
    fallbackTopicRegistry
  );
  const storedTopics = Array.isArray(storedTopicRegistry)
    ? storedTopicRegistry
    : Array.isArray(storedTopicRegistry?.topics)
      ? storedTopicRegistry.topics
      : [];

  return buildQuizTopicRegistry(quizzes, storedTopics);
}

function buildQuizInsights(quizzes, topicRegistry = null) {
  const publishedQuizzes = quizzes.filter((quiz) => quiz.status === "published");
  const publicQuizzes = publishedQuizzes.filter((quiz) => quiz.accessType === "public");
  const availableTopics = normalizeTopicList([
    ...(Array.isArray(topicRegistry?.topics) ? topicRegistry.topics : []),
    ...publishedQuizzes.map((quiz) => normalizeOptionalString(quiz.category, 80)),
  ]);
  const topicMap = new Map();
  const generatedAt = getLatestIsoTimestamp(
    publishedQuizzes.map((quiz) => quiz.updatedAt || quiz.createdAt)
  );

  publishedQuizzes.forEach((quiz) => {
    const topic = normalizeOptionalString(quiz.category, 80);

    if (!topic) {
      return;
    }

    const currentTopicStats = topicMap.get(topic) || {
      topic,
      quizCount: 0,
      premiumQuizCount: 0,
      freeQuizCount: 0,
    };

    currentTopicStats.quizCount += 1;

    if (quiz.isPremium) {
      currentTopicStats.premiumQuizCount += 1;
    } else {
      currentTopicStats.freeQuizCount += 1;
    }

    topicMap.set(topic, currentTopicStats);
  });

  const popularTopics = [...topicMap.values()].sort((leftTopic, rightTopic) => {
    if (rightTopic.quizCount !== leftTopic.quizCount) {
      return rightTopic.quizCount - leftTopic.quizCount;
    }

    return leftTopic.topic.localeCompare(rightTopic.topic);
  });

  return {
    generatedAt,
    totals: {
      totalQuizzes: publishedQuizzes.length,
      publicQuizzes: publicQuizzes.length,
      privateQuizzes: publishedQuizzes.filter((quiz) => quiz.accessType === "private").length,
      premiumQuizzes: publicQuizzes.filter((quiz) => quiz.isPremium).length,
      freeQuizzes: publicQuizzes.filter((quiz) => !quiz.isPremium).length,
    },
    availableTopics,
    popularTopics,
    featuredQuizIds: publicQuizzes
      .slice()
      .sort(sortQuizzesByUpdatedAtDesc)
      .slice(0, DEFAULT_HOME_FEATURED_QUIZ_LIMIT)
      .map((quiz) => quiz.id),
  };
}

async function readQuizInsights(quizzes) {
  const topicRegistry = await readQuizTopicRegistry(quizzes);
  const fallbackInsights = buildQuizInsights(quizzes, topicRegistry);
  return fallbackInsights;
}

async function writeQuizzes(quizzes) {
  const ownerLookup = buildQuizOwnerLookup(await readUsers());
  const normalizedQuizzes = normalizeQuizRecords(quizzes, ownerLookup);
  const normalizedTopicRegistry = await readQuizTopicRegistry(normalizedQuizzes);

  await writeJsonFile(quizzesFilePath, normalizedQuizzes);
  await writeJsonFile(quizTopicsFilePath, normalizedTopicRegistry);
  await writeJsonFile(
    quizInsightsFilePath,
    buildQuizInsights(normalizedQuizzes, normalizedTopicRegistry)
  );
}

async function syncQuizzesMetadata() {
  const quizzes = await readStoredQuizzes();
  const ownerLookup = buildQuizOwnerLookup(await readUsers());
  const normalizedQuizzes = normalizeQuizRecords(quizzes, ownerLookup);
  const normalizedTopicRegistry = await readQuizTopicRegistry(normalizedQuizzes);
  const normalizedInsights = buildQuizInsights(
    normalizedQuizzes,
    normalizedTopicRegistry
  );
  const storedTopicRegistry = await readJsonFile(
    quizTopicsFilePath,
    normalizedTopicRegistry
  );
  const storedInsights = await readJsonFile(quizInsightsFilePath, normalizedInsights);

  if (JSON.stringify(quizzes) !== JSON.stringify(normalizedQuizzes)) {
    await writeJsonFile(quizzesFilePath, normalizedQuizzes);
  }

  if (JSON.stringify(storedTopicRegistry) !== JSON.stringify(normalizedTopicRegistry)) {
    await writeJsonFile(quizTopicsFilePath, normalizedTopicRegistry);
  }

  if (JSON.stringify(storedInsights) !== JSON.stringify(normalizedInsights)) {
    await writeJsonFile(quizInsightsFilePath, normalizedInsights);
  }

  return normalizedQuizzes;
}

function sortQuizzesByUpdatedAtDesc(leftQuiz, rightQuiz) {
  const leftTimestamp = Date.parse(leftQuiz.updatedAt || leftQuiz.createdAt || "");
  const rightTimestamp = Date.parse(rightQuiz.updatedAt || rightQuiz.createdAt || "");

  return rightTimestamp - leftTimestamp;
}

function normalizeOrigin(origin) {
  return normalizeOptionalString(origin).replace(/\/+$/, "");
}

function buildSharePath(quiz) {
  if (quiz.accessType !== "private" || !quiz.shareToken) {
    return "";
  }

  return `/quizzes/shared/${quiz.shareToken}`;
}

function buildShareUrl(quiz) {
  const sharePath = buildSharePath(quiz);

  if (!sharePath) {
    return "";
  }

  const frontendOrigin = normalizeOrigin(process.env.FRONTEND_ORIGIN);

  return frontendOrigin ? `${frontendOrigin}${sharePath}` : sharePath;
}

function buildShareData(quiz) {
  const sharePath = buildSharePath(quiz);

  return {
    isEnabled: Boolean(sharePath),
    shareToken: quiz.accessType === "private" ? quiz.shareToken : "",
    sharePath,
    shareUrl: sharePath ? buildShareUrl(quiz) : "",
  };
}

function normalizePublicQuizFilters(filters = {}) {
  const topic = normalizeOptionalString(filters.topic, 80);
  const premium = normalizeOptionalString(filters.premium, 16).toLowerCase();
  const page = Number.parseInt(normalizeOptionalString(filters.page, 16), 10);
  const limit = Number.parseInt(normalizeOptionalString(filters.limit, 16), 10);

  return {
    topic,
    premium: PREMIUM_LIST_FILTER_VALUES.has(premium) ? premium : "all",
    page: Number.isInteger(page) && page > 0 ? page : DEFAULT_PUBLIC_QUIZ_PAGE,
    limit:
      Number.isInteger(limit) && limit > 0
        ? Math.min(limit, MAX_PUBLIC_QUIZ_LIMIT)
        : DEFAULT_PUBLIC_QUIZ_LIMIT,
  };
}

function paginateItems(items, page, limit) {
  const totalItems = items.length;
  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / limit);
  const offset = (page - 1) * limit;
  const hasPreviousPage = totalPages > 0 && page > 1;
  const hasNextPage = totalPages > 0 && page < totalPages;

  return {
    items: items.slice(offset, offset + limit),
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
      hasPreviousPage,
      hasNextPage,
      previousPage: hasPreviousPage ? Math.min(page - 1, totalPages || page - 1) : null,
      nextPage: hasNextPage ? page + 1 : null,
    },
  };
}

function isPublicPublishedQuiz(quiz) {
  return quiz.status === "published" && quiz.accessType === "public";
}

function matchesPublicQuizFilters(quiz, filters) {
  if (!isPublicPublishedQuiz(quiz)) {
    return false;
  }

  if (
    filters.topic &&
    normalizeOptionalString(quiz.category, 80).toLowerCase() !== filters.topic.toLowerCase()
  ) {
    return false;
  }

  if (filters.premium === "premium" && !quiz.isPremium) {
    return false;
  }

  if (filters.premium === "free" && quiz.isPremium) {
    return false;
  }

  return true;
}

function isQuizOwner(quiz, viewer) {
  return Boolean(quiz && viewer && quiz.ownerId === viewer.id);
}

function viewerHasPremium(viewer) {
  return Boolean(viewer && isUserPremium(viewer));
}

function buildQuizDescription(quiz) {
  if (quiz.description) {
    return quiz.description;
  }

  const parts = [`${quiz.questionCount} questions`, `${quiz.totalPoints} points`];

  if (quiz.isPremium) {
    parts.push("premium access");
  }

  if (quiz.accessType === "private") {
    parts.push("private link");
  }

  return parts.join(", ");
}

function buildQuizSummary(quiz, viewer, options = {}) {
  const isOwner = isQuizOwner(quiz, viewer);
  const requiresPremium = quiz.isPremium && !isOwner && !viewerHasPremium(viewer);
  const share = options.includeShare ? buildShareData(quiz) : undefined;

  return {
    id: quiz.id,
    ownerId: quiz.ownerId,
    ownerName: quiz.ownerName,
    ownerQuizCreationBlocked: quiz.ownerQuizCreationBlocked === true,
    title: quiz.title,
    description: buildQuizDescription(quiz),
    category: quiz.category,
    difficulty: quiz.difficulty,
    accessType: quiz.accessType,
    isPremium: quiz.isPremium,
    imageName: quiz.imageName,
    imageUrl: quiz.imageUrl,
    questionCount: quiz.questionCount,
    totalPoints: quiz.totalPoints,
    createdAt: quiz.createdAt,
    updatedAt: quiz.updatedAt,
    access: {
      isOwner,
      canAttempt:
        isOwner ||
        (quiz.accessType === "public" &&
          (!quiz.isPremium || viewerHasPremium(viewer))),
      requiresPremium,
      requiresShareLink: quiz.accessType === "private" && !isOwner,
    },
    ...(options.includeShare ? { share } : {}),
  };
}

function buildPlayableQuestion(question) {
  return {
    id: question.id,
    kind: question.kind,
    prompt: question.prompt,
    required: question.required,
    shuffleEligible: question.shuffleEligible,
    responseType: question.responseType,
    imageName: question.imageName,
    imageUrl: question.imageUrl,
    points: question.points,
    options: question.options.map((option) => ({
      id: option.id,
      text: option.text,
    })),
  };
}

function buildManageQuestion(question) {
  return {
    id: question.id,
    kind: question.kind,
    prompt: question.prompt,
    required: question.required,
    shuffleEligible: question.shuffleEligible,
    responseType: question.responseType,
    imageName: question.imageName,
    imageUrl: question.imageUrl,
    points: question.points,
    options: question.options.map((option) => ({
      id: option.id,
      text: option.text,
      isCorrect: option.isCorrect,
    })),
  };
}

function buildPlayableQuiz(quiz, viewer, latestAttempt = null) {
  return {
    id: quiz.id,
    ownerId: quiz.ownerId,
    ownerName: quiz.ownerName,
    ownerQuizCreationBlocked: quiz.ownerQuizCreationBlocked === true,
    title: quiz.title,
    description: buildQuizDescription(quiz),
    category: quiz.category,
    difficulty: quiz.difficulty,
    answerMode: quiz.answerMode,
    shuffleQuestions: quiz.shuffleQuestions,
    shuffleAnswers: quiz.shuffleAnswers,
    scoringMode: quiz.scoringMode,
    manualPointsMode: quiz.manualPointsMode,
    accessType: quiz.accessType,
    isPremium: quiz.isPremium,
    imageName: quiz.imageName,
    imageUrl: quiz.imageUrl,
    totalPoints: quiz.totalPoints,
    questionCount: quiz.questionCount,
    createdAt: quiz.createdAt,
    updatedAt: quiz.updatedAt,
    access: {
      isOwner: isQuizOwner(quiz, viewer),
      requiresPremium: quiz.isPremium && !isQuizOwner(quiz, viewer) && !viewerHasPremium(viewer),
      share: buildShareData(quiz),
    },
    latestAttempt: buildLatestQuizAttempt(latestAttempt),
    questions: quiz.questions.map((question) => buildPlayableQuestion(question)),
  };
}

function buildManageQuiz(quiz, viewer) {
  return {
    id: quiz.id,
    ownerId: quiz.ownerId,
    ownerName: quiz.ownerName,
    ownerQuizCreationBlocked: quiz.ownerQuizCreationBlocked === true,
    title: quiz.title,
    description: quiz.description,
    category: quiz.category,
    difficulty: quiz.difficulty,
    answerMode: quiz.answerMode,
    shuffleQuestions: quiz.shuffleQuestions,
    shuffleAnswers: quiz.shuffleAnswers,
    scoringMode: quiz.scoringMode,
    manualPointsMode: quiz.manualPointsMode,
    accessType: quiz.accessType,
    isPremium: quiz.isPremium,
    imageName: quiz.imageName,
    imageUrl: quiz.imageUrl,
    totalPoints: quiz.totalPoints,
    questionCount: quiz.questionCount,
    createdAt: quiz.createdAt,
    updatedAt: quiz.updatedAt,
    access: {
      isOwner: isQuizOwner(quiz, viewer),
      share: buildShareData(quiz),
    },
    questions: quiz.questions.map((question) => buildManageQuestion(question)),
  };
}

function buildLatestQuizAttempt(quizAttempt) {
  if (!quizAttempt?.latestResult) {
    return null;
  }

  return normalizeSubmissionResult(quizAttempt.latestResult, {
    attemptId: quizAttempt.id,
    attemptCount: quizAttempt.attemptCount,
    lastAttemptedAt: quizAttempt.updatedAt,
    isPersisted: true,
  });
}

function findLatestQuizAttempt(quizAttempts, quizId, userId) {
  const normalizedQuizId = normalizeOptionalString(quizId, 80);
  const normalizedUserId = normalizeOptionalString(userId, 80);

  if (!normalizedQuizId || !normalizedUserId) {
    return null;
  }

  return (
    (Array.isArray(quizAttempts) ? quizAttempts : []).find(
      (quizAttempt) =>
        quizAttempt.quizId === normalizedQuizId &&
        quizAttempt.userId === normalizedUserId
    ) || null
  );
}

function createQuizAttemptRecord(userId, result) {
  const timestamp = normalizeOptionalString(result.submittedAt) || nowIso();
  const attemptId = generateId();

  return {
    id: attemptId,
    quizId: result.quizId,
    userId,
    attemptCount: 1,
    createdAt: timestamp,
    updatedAt: timestamp,
    latestResult: normalizeSubmissionResult(result, {
      attemptId,
      attemptCount: 1,
      lastAttemptedAt: timestamp,
      isPersisted: true,
    }),
  };
}

function updateQuizAttemptRecord(existingQuizAttempt, result) {
  const timestamp = normalizeOptionalString(result.submittedAt) || nowIso();
  const attemptCount = Math.max(1, existingQuizAttempt.attemptCount + 1);

  return {
    ...existingQuizAttempt,
    attemptCount,
    updatedAt: timestamp,
    latestResult: normalizeSubmissionResult(result, {
      attemptId: existingQuizAttempt.id,
      attemptCount,
      lastAttemptedAt: timestamp,
      isPersisted: true,
    }),
  };
}

function buildSubmissionResponseResult(result, options = {}) {
  return normalizeSubmissionResult(result, {
    attemptId: options.attemptId,
    attemptCount: options.attemptCount,
    lastAttemptedAt: options.lastAttemptedAt || result.submittedAt,
    isPersisted: options.isPersisted === true,
  });
}

function normalizeOptionIdSet(values) {
  return [...new Set(
    (Array.isArray(values) ? values : [])
      .map((value) => normalizeOptionalString(value, 80))
      .filter(Boolean)
  )].sort((leftValue, rightValue) => leftValue.localeCompare(rightValue));
}

function areOptionSetsEqual(leftValues, rightValues) {
  const normalizedLeftValues = normalizeOptionIdSet(leftValues);
  const normalizedRightValues = normalizeOptionIdSet(rightValues);

  if (normalizedLeftValues.length !== normalizedRightValues.length) {
    return false;
  }

  return normalizedLeftValues.every((value, index) => value === normalizedRightValues[index]);
}

function buildSubmissionQuestionResult(question, answer) {
  const selectedOptionIds = normalizeOptionIdSet(
    (answer?.selectedOptionIds || []).filter((selectedOptionId) =>
      question.options.some((option) => option.id === selectedOptionId)
    )
  );
  const textAnswer = normalizeOptionalString(answer?.textAnswer, 255);

  if (question.kind === "respondent_name") {
    return {
      questionId: question.id,
      kind: question.kind,
      prompt: question.prompt,
      required: question.required,
      points: 0,
      earnedPoints: 0,
      isAnswered: Boolean(textAnswer),
      isCorrect: null,
      textAnswer,
      selectedOptionIds: [],
      correctOptionIds: [],
      selectedOptionTexts: [],
      correctOptionTexts: [],
    };
  }

  const correctOptionIds = normalizeOptionIdSet(
    question.options
      .filter((option) => option.isCorrect)
      .map((option) => option.id)
  );
  const selectedOptionTexts = question.options
    .filter((option) => selectedOptionIds.includes(option.id))
    .map((option) => option.text);
  const correctOptionTexts = question.options
    .filter((option) => correctOptionIds.includes(option.id))
    .map((option) => option.text);
  const isAnswered = selectedOptionIds.length > 0;
  const isCorrect = isAnswered && areOptionSetsEqual(selectedOptionIds, correctOptionIds);
  const earnedPoints = isCorrect ? question.points : 0;

  return {
    questionId: question.id,
    kind: question.kind,
    prompt: question.prompt,
    required: question.required,
    points: question.points,
    earnedPoints,
    isAnswered,
    isCorrect,
    textAnswer: "",
    selectedOptionIds,
    correctOptionIds,
    selectedOptionTexts,
    correctOptionTexts,
  };
}

function validateSubmissionAnswersAgainstQuiz(quiz, payload) {
  const questionsById = new Map(quiz.questions.map((question) => [question.id, question]));

  payload.answers.forEach((answer, answerIndex) => {
    const question = questionsById.get(answer.questionId);

    if (!question) {
      throw createHttpError(
        400,
        `Answer ${answerIndex + 1} references an unknown question.`
      );
    }

    if (question.kind !== "choice" && answer.selectedOptionIds.length > 0) {
      throw createHttpError(
        400,
        `Answer ${answerIndex + 1} cannot select options for this question.`
      );
    }

    if (question.kind !== "choice") {
      return;
    }

    const optionIds = new Set(question.options.map((option) => option.id));

    answer.selectedOptionIds.forEach((selectedOptionId) => {
      if (!optionIds.has(selectedOptionId)) {
        throw createHttpError(
          400,
          `Answer ${answerIndex + 1} contains an unknown option.`
        );
      }
    });
  });
}

function ensureQuizQuestionIsAnswered(questionResult, questionIndex) {
  if (questionResult.isAnswered) {
    return;
  }

  throw createHttpError(
    400,
    `Question ${questionIndex + 1} is required before submitting the quiz.`
  );
}

function evaluateQuizSubmission(quiz, payload) {
  validateSubmissionAnswersAgainstQuiz(quiz, payload);

  const answersByQuestionId = new Map(
    payload.answers.map((answer) => [answer.questionId, answer])
  );
  const questionResults = quiz.questions.map((question, questionIndex) => {
    const questionResult = buildSubmissionQuestionResult(
      question,
      answersByQuestionId.get(question.id)
    );

    if (question.required) {
      ensureQuizQuestionIsAnswered(questionResult, questionIndex);
    }

    return questionResult;
  });
  const earnedPoints = roundPoints(
    questionResults.reduce((sum, questionResult) => sum + questionResult.earnedPoints, 0)
  );
  const scoredQuestionResults = questionResults.filter(
    (questionResult) => questionResult.kind === "choice"
  );
  const respondentNameQuestion = questionResults.find(
    (questionResult) => questionResult.kind === "respondent_name"
  );

  return {
    quizId: quiz.id,
    title: quiz.title,
    totalPoints: quiz.totalPoints,
    earnedPoints,
    percentage:
      quiz.totalPoints > 0 ? roundPoints((earnedPoints / quiz.totalPoints) * 100) : 0,
    submittedAt: nowIso(),
    respondentName: respondentNameQuestion?.textAnswer || "",
    answeredQuestions: questionResults.filter((questionResult) => questionResult.isAnswered).length,
    totalQuestions: questionResults.length,
    correctQuestions: scoredQuestionResults.filter(
      (questionResult) => questionResult.isCorrect === true
    ).length,
    incorrectQuestions: scoredQuestionResults.filter(
      (questionResult) => questionResult.isAnswered && questionResult.isCorrect === false
    ).length,
    unansweredQuestions: questionResults.filter((questionResult) => !questionResult.isAnswered)
      .length,
    questions: questionResults,
  };
}

function ensureQuizPlayableAccess(quiz, viewer, options = {}) {
  if (!quiz || quiz.status !== "published") {
    throw createHttpError(404, "Quiz not found");
  }

  if (
    quiz.accessType === "private" &&
    !options.allowPrivateShare &&
    !isQuizOwner(quiz, viewer)
  ) {
    throw createHttpError(404, "Quiz not found");
  }

  ensurePremiumQuizAccess(quiz, viewer);
}

function ensurePremiumQuizAccess(quiz, viewer) {
  if (!quiz.isPremium || isQuizOwner(quiz, viewer)) {
    return;
  }

  if (!viewer) {
    throw createHttpError(401, "Login with a premium account to open this quiz.");
  }

  if (!viewerHasPremium(viewer)) {
    throw createHttpError(403, "Premium access is required to open this quiz.");
  }
}

function createPersistedQuiz(owner, payload) {
  const timestamp = nowIso();

  return {
    id: generateId(),
    ownerId: owner.id,
    ownerName: normalizeOptionalString(owner.name, 120),
    ownerQuizCreationBlocked: owner.quizCreationBlocked === true,
    title: payload.title,
    description: payload.description,
    category: payload.category,
    difficulty: payload.difficulty,
    answerMode: payload.answerMode,
    shuffleQuestions: payload.shuffleQuestions,
    shuffleAnswers: payload.shuffleAnswers,
    scoringMode: payload.scoringMode,
    manualPointsMode: payload.manualPointsMode,
    accessType: payload.accessType,
    isPremium: payload.isPremium,
    status: "published",
    shareToken: payload.accessType === "private" ? createShareToken() : "",
    imageName: payload.imageName,
    imageUrl: payload.imageUrl,
    totalPoints: payload.totalPoints,
    questionCount: payload.questionCount,
    createdAt: timestamp,
    updatedAt: timestamp,
    publishedAt: timestamp,
    questions: payload.questions.map((question) => ({
      id: generateId(),
      kind: question.kind,
      prompt: question.prompt,
      required: question.required,
      shuffleEligible: question.shuffleEligible,
      responseType: question.responseType,
      imageName: question.imageName,
      imageUrl: question.imageUrl,
      points: question.points,
      options: question.options.map((option) => ({
        id: generateId(),
        text: option.text,
        isCorrect: option.isCorrect,
      })),
    })),
  };
}

function createUpdatedQuizRecord(existingQuiz, owner, payload) {
  const timestamp = nowIso();

  return {
    ...existingQuiz,
    ownerName:
      normalizeOptionalString(owner?.name, 120) ||
      normalizeOptionalString(existingQuiz.ownerName, 120),
    ownerQuizCreationBlocked: owner?.quizCreationBlocked === true,
    title: payload.title,
    description: payload.description,
    category: payload.category,
    difficulty: payload.difficulty,
    answerMode: payload.answerMode,
    shuffleQuestions: payload.shuffleQuestions,
    shuffleAnswers: payload.shuffleAnswers,
    scoringMode: payload.scoringMode,
    manualPointsMode: payload.manualPointsMode,
    accessType: payload.accessType,
    isPremium: payload.isPremium,
    status: "published",
    shareToken:
      payload.accessType === "private"
        ? existingQuiz.shareToken || createShareToken()
        : "",
    imageName: payload.imageName,
    imageUrl: payload.imageUrl,
    totalPoints: payload.totalPoints,
    questionCount: payload.questionCount,
    updatedAt: timestamp,
    publishedAt: existingQuiz.publishedAt || timestamp,
    questions: payload.questions.map((question) => ({
      id: generateId(),
      kind: question.kind,
      prompt: question.prompt,
      required: question.required,
      shuffleEligible: question.shuffleEligible,
      responseType: question.responseType,
      imageName: question.imageName,
      imageUrl: question.imageUrl,
      points: question.points,
      options: question.options.map((option) => ({
        id: generateId(),
        text: option.text,
        isCorrect: option.isCorrect,
      })),
    })),
  };
}

async function requireActiveUser(userId) {
  const user = await findUserById(userId);

  if (!user) {
    throw createHttpError(401, "Unauthorized");
  }

  if (user.isBanned === true) {
    throw createHttpError(403, "Your account has been banned.");
  }

  return user;
}

function ensureUserCanCreateQuizzes(user) {
  if (user.quizCreationBlocked === true) {
    throw createHttpError(
      403,
      user.quizCreationBlockReason || "Your account cannot create quizzes."
    );
  }
}

function findQuizById(quizzes, quizId) {
  const normalizedQuizId = normalizeOptionalString(quizId, 80);

  if (!normalizedQuizId) {
    return null;
  }

  return quizzes.find((quiz) => quiz.id === normalizedQuizId) || null;
}

function findQuizByShareToken(quizzes, shareToken) {
  const normalizedShareToken = normalizeOptionalString(shareToken, 96);

  if (!normalizedShareToken) {
    return null;
  }

  return quizzes.find((quiz) => quiz.shareToken === normalizedShareToken) || null;
}

async function createQuiz(ownerId, payload) {
  const owner = await requireActiveUser(ownerId);
  ensureUserCanCreateQuizzes(owner);
  const normalizedPayload = validateQuizCreationInput(payload);

  if (
    (normalizedPayload.accessType === "private" || normalizedPayload.isPremium) &&
    !isUserPremium(owner)
  ) {
    throw createHttpError(
      403,
      "Premium access is required to create private or premium quizzes."
    );
  }

  const quizzes = await readQuizzes();
  const createdQuiz = createPersistedQuiz(owner, normalizedPayload);

  quizzes.push(createdQuiz);
  await writeQuizzes(quizzes);

  return {
    quiz: buildManageQuiz(createdQuiz, owner),
  };
}

async function updateQuiz(ownerId, quizId, payload) {
  const owner = await requireActiveUser(ownerId);
  const quizzes = await readQuizzes();
  const quizIndex = quizzes.findIndex((quiz) => quiz.id === normalizeOptionalString(quizId, 80));

  if (quizIndex === -1 || quizzes[quizIndex].ownerId !== owner.id) {
    throw createHttpError(404, "Quiz not found");
  }

  const normalizedPayload = validateQuizCreationInput(payload);
  const ownerHasPremium = isUserPremium(owner);
  const existingQuiz = quizzes[quizIndex];
  const escalatesToPrivate =
    normalizedPayload.accessType === "private" &&
    existingQuiz.accessType !== "private";
  const escalatesToPremium =
    normalizedPayload.isPremium === true &&
    existingQuiz.isPremium !== true;

  if (!ownerHasPremium && (escalatesToPrivate || escalatesToPremium)) {
    throw createHttpError(
      403,
      "Premium access is required to make a quiz private or premium."
    );
  }

  const updatedQuiz = createUpdatedQuizRecord(existingQuiz, owner, normalizedPayload);

  quizzes[quizIndex] = updatedQuiz;
  await writeQuizzes(quizzes);

  return {
    quiz: buildManageQuiz(updatedQuiz, owner),
  };
}

async function deleteQuiz(ownerId, quizId) {
  const actor =
    ownerId && typeof ownerId === "object" ? ownerId : await requireActiveUser(ownerId);
  const quizzes = await readQuizzes();
  const quizAttempts = await readQuizAttempts();
  const normalizedQuizId = normalizeOptionalString(quizId, 80);
  const quiz = quizzes.find((currentQuiz) => currentQuiz.id === normalizedQuizId);

  if (!quiz) {
    throw createHttpError(404, "Quiz not found");
  }

  if (quiz.ownerId !== actor.id && actor.role !== "admin") {
    throw createHttpError(404, "Quiz not found");
  }

  const nextQuizzes = quizzes.filter((currentQuiz) => currentQuiz.id !== normalizedQuizId);
  const nextQuizAttempts = quizAttempts.filter(
    (quizAttempt) => quizAttempt.quizId !== normalizedQuizId
  );

  await writeQuizzes(nextQuizzes);
  await writeQuizAttempts(nextQuizAttempts);

  return {
    message: "Quiz deleted",
    quizId: normalizedQuizId,
    deletedBy: actor.id,
  };
}

async function getQuizHomeFeed(viewer = null) {
  const quizzes = await readQuizzes();
  const insights = await readQuizInsights(quizzes);
  const publicQuizzes = quizzes
    .filter((quiz) => isPublicPublishedQuiz(quiz))
    .sort(sortQuizzesByUpdatedAtDesc);
  const featuredQuizzes = insights.featuredQuizIds
    .map((quizId) => findQuizById(publicQuizzes, quizId))
    .filter(Boolean);

  if (featuredQuizzes.length < DEFAULT_HOME_FEATURED_QUIZ_LIMIT) {
    publicQuizzes.forEach((quiz) => {
      if (featuredQuizzes.length >= DEFAULT_HOME_FEATURED_QUIZ_LIMIT) {
        return;
      }

      if (!featuredQuizzes.find((featuredQuiz) => featuredQuiz.id === quiz.id)) {
        featuredQuizzes.push(quiz);
      }
    });
  }

  return {
    generatedAt: insights.generatedAt,
    totals: insights.totals,
    availableTopics: insights.availableTopics,
    popularTopics: insights.popularTopics,
    quizzes: featuredQuizzes
      .slice(0, DEFAULT_HOME_FEATURED_QUIZ_LIMIT)
      .map((quiz) => buildQuizSummary(quiz, viewer)),
  };
}

async function listPublicQuizzes(viewer = null, filters = {}) {
  const quizzes = await readQuizzes();
  const insights = await readQuizInsights(quizzes);
  const normalizedFilters = normalizePublicQuizFilters(filters);
  const publicQuizzes = quizzes.filter((quiz) => isPublicPublishedQuiz(quiz));
  const filteredQuizzes = publicQuizzes
    .filter((quiz) => matchesPublicQuizFilters(quiz, normalizedFilters))
    .sort(sortQuizzesByUpdatedAtDesc);
  const paginatedQuizzes = paginateItems(
    filteredQuizzes,
    normalizedFilters.page,
    normalizedFilters.limit
  );

  return {
    filters: normalizedFilters,
    availableTopics: insights.availableTopics,
    premiumOptions: ["all", "free", "premium"],
    counts: {
      totalQuizzes: publicQuizzes.length,
      filteredQuizzes: filteredQuizzes.length,
      premiumQuizzes: publicQuizzes.filter((quiz) => quiz.isPremium).length,
      freeQuizzes: publicQuizzes.filter((quiz) => !quiz.isPremium).length,
    },
    pagination: paginatedQuizzes.pagination,
    quizzes: paginatedQuizzes.items.map((quiz) => buildQuizSummary(quiz, viewer)),
  };
}

async function listOwnQuizzes(ownerId, viewer = null) {
  await requireActiveUser(ownerId);
  const quizzes = await readQuizzes();

  return {
    quizzes: quizzes
      .filter((quiz) => quiz.ownerId === ownerId)
      .sort(sortQuizzesByUpdatedAtDesc)
      .map((quiz) => buildQuizSummary(quiz, viewer, { includeShare: true })),
  };
}

async function getQuizForManage(ownerId, quizId, viewer = null) {
  await requireActiveUser(ownerId);
  const quizzes = await readQuizzes();
  const quiz = findQuizById(quizzes, quizId);

  if (!quiz || quiz.ownerId !== ownerId) {
    throw createHttpError(404, "Quiz not found");
  }

  return {
    quiz: buildManageQuiz(quiz, viewer),
  };
}

async function getQuizShareInfo(ownerId, quizId) {
  await requireActiveUser(ownerId);
  const quizzes = await readQuizzes();
  const quiz = findQuizById(quizzes, quizId);

  if (!quiz || quiz.ownerId !== ownerId) {
    throw createHttpError(404, "Quiz not found");
  }

  return {
    quizId: quiz.id,
    accessType: quiz.accessType,
    share: buildShareData(quiz),
  };
}

async function getPlayableQuizById(quizId, viewer = null) {
  const quizzes = await readQuizzes();
  const quiz = findQuizById(quizzes, quizId);
  ensureQuizPlayableAccess(quiz, viewer);
  const latestAttempt = viewer?.id
    ? findLatestQuizAttempt(await readQuizAttempts(), quiz.id, viewer.id)
    : null;

  return {
    quiz: buildPlayableQuiz(quiz, viewer, latestAttempt),
  };
}

async function getPlayableQuizByShareToken(shareToken, viewer = null) {
  const quizzes = await readQuizzes();
  const quiz = findQuizByShareToken(quizzes, shareToken);

  if (!quiz || quiz.accessType !== "private") {
    throw createHttpError(404, "Quiz not found");
  }

  ensureQuizPlayableAccess(quiz, viewer, { allowPrivateShare: true });
  const latestAttempt = viewer?.id
    ? findLatestQuizAttempt(await readQuizAttempts(), quiz.id, viewer.id)
    : null;

  return {
    quiz: buildPlayableQuiz(quiz, viewer, latestAttempt),
  };
}

async function submitQuizAttempt(quizId, payload, viewer = null) {
  const quizzes = await readQuizzes();
  const quiz = findQuizById(quizzes, quizId);

  ensureQuizPlayableAccess(quiz, viewer);
  const result = evaluateQuizSubmission(quiz, validateQuizSubmissionInput(payload));

  if (!viewer?.id) {
    return {
      result: buildSubmissionResponseResult(result, {
        attemptCount: 1,
        lastAttemptedAt: result.submittedAt,
        isPersisted: false,
      }),
    };
  }

  const quizAttempts = await readQuizAttempts();
  const existingQuizAttempt = findLatestQuizAttempt(quizAttempts, quiz.id, viewer.id);
  const persistedQuizAttempt = existingQuizAttempt
    ? updateQuizAttemptRecord(existingQuizAttempt, result)
    : createQuizAttemptRecord(viewer.id, result);
  const nextQuizAttempts = existingQuizAttempt
    ? quizAttempts.map((quizAttempt) =>
        quizAttempt.id === existingQuizAttempt.id ? persistedQuizAttempt : quizAttempt
      )
    : [...quizAttempts, persistedQuizAttempt];

  await writeQuizAttempts(nextQuizAttempts);

  return {
    result: buildLatestQuizAttempt(persistedQuizAttempt),
  };
}

module.exports = {
  createQuiz,
  deleteQuiz,
  getQuizHomeFeed,
  listPublicQuizzes,
  listOwnQuizzes,
  getQuizForManage,
  getQuizShareInfo,
  getPlayableQuizById,
  getPlayableQuizByShareToken,
  submitQuizAttempt,
  syncQuizAttemptsMetadata,
  syncQuizzesMetadata,
  updateQuiz,
};
