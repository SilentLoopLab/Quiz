const normalizeString = require("../utils/normalizeString");
const createHttpError = require("../utils/createHttpError");

const QUIZ_DIFFICULTIES = new Set(["Easy", "Medium", "Hard"]);
const QUIZ_ACCESS_TYPES = new Set(["public", "private"]);
const QUIZ_ANSWER_MODES = new Set(["single", "multiple"]);
const QUIZ_SCORING_MODES = new Set(["automatic", "manual"]);
const QUIZ_MANUAL_POINTS_MODES = new Set(["integer", "decimal"]);
const QUIZ_QUESTION_KINDS = new Set(["respondent_name", "choice"]);

const MAX_QUIZ_TITLE_LENGTH = 140;
const MAX_QUIZ_CATEGORY_LENGTH = 80;
const MAX_QUIZ_DESCRIPTION_LENGTH = 500;
const MAX_IMAGE_NAME_LENGTH = 255;
const MAX_IMAGE_URL_LENGTH = 2048;
const MAX_QUESTION_PROMPT_LENGTH = 500;
const MAX_OPTION_TEXT_LENGTH = 200;
const MAX_SUBMISSION_TEXT_LENGTH = 255;
const MAX_QUESTIONS_PER_QUIZ = 100;
const MAX_OPTIONS_PER_QUESTION = 10;
const QUIZ_AUTOMATIC_TOTAL_POINTS = 100;

function roundPoints(value) {
  return Math.round(value * 100) / 100;
}

function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function validateBoolean(value, fieldName) {
  if (typeof value !== "boolean") {
    throw createHttpError(400, `${fieldName} must be a boolean`);
  }

  return value;
}

function validateRequiredString(value, fieldName, maxLength) {
  const normalizedValue = normalizeString(value);

  if (!normalizedValue) {
    throw createHttpError(400, `${fieldName} is required`);
  }

  if (maxLength && normalizedValue.length > maxLength) {
    throw createHttpError(400, `${fieldName} is too long`);
  }

  return normalizedValue;
}

function validateOptionalString(value, fieldName, maxLength) {
  const normalizedValue = normalizeString(value);

  if (maxLength && normalizedValue.length > maxLength) {
    throw createHttpError(400, `${fieldName} is too long`);
  }

  return normalizedValue;
}

function validateOptionalHttpUrl(value, fieldName) {
  const normalizedValue = validateOptionalString(
    value,
    fieldName,
    MAX_IMAGE_URL_LENGTH
  );

  if (normalizedValue && !isValidHttpUrl(normalizedValue)) {
    throw createHttpError(400, `${fieldName} is invalid`);
  }

  return normalizedValue;
}

function validateEnum(value, allowedValues, fieldName) {
  const normalizedValue = normalizeString(value);

  if (!allowedValues.has(normalizedValue)) {
    throw createHttpError(400, `${fieldName} is invalid`);
  }

  return normalizedValue;
}

function parsePositivePoints(value, manualPointsMode, fieldName) {
  const numericValue =
    typeof value === "number" ? value : Number(normalizeString(String(value ?? "")));

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    throw createHttpError(400, `${fieldName} must be greater than 0`);
  }

  if (manualPointsMode === "integer" && !Number.isInteger(numericValue)) {
    throw createHttpError(400, `${fieldName} must be a whole number`);
  }

  return roundPoints(numericValue);
}

function distributeAutomaticQuestionPoints(questionCount) {
  if (questionCount <= 0) {
    return [];
  }

  const totalHundredths = QUIZ_AUTOMATIC_TOTAL_POINTS * 100;
  const baseHundredths = Math.floor(totalHundredths / questionCount);
  const remainderHundredths = totalHundredths % questionCount;

  return Array.from({ length: questionCount }, (_, index) => {
    const nextHundredths =
      baseHundredths + (index < remainderHundredths ? 1 : 0);

    return nextHundredths / 100;
  });
}

function validateChoiceQuestionOption(option, questionNumber, optionNumber) {
  const text = validateRequiredString(
    option?.text,
    `Question ${questionNumber} option ${optionNumber} text`,
    MAX_OPTION_TEXT_LENGTH
  );
  const isCorrect = validateBoolean(
    option?.isCorrect,
    `Question ${questionNumber} option ${optionNumber} correctness`
  );

  return {
    text,
    isCorrect,
  };
}

function validateRespondentNameQuestion(question, questionNumber) {
  const prompt =
    validateOptionalString(
      question?.prompt,
      `Question ${questionNumber} prompt`,
      MAX_QUESTION_PROMPT_LENGTH
    ) || "First name and last name";

  return {
    kind: "respondent_name",
    prompt,
    required: true,
    shuffleEligible: false,
    responseType: "full_name",
    imageName: "",
    imageUrl: "",
    points: 0,
    options: [],
  };
}

function validateChoiceQuestion(
  question,
  questionNumber,
  answerMode,
  scoringMode,
  manualPointsMode
) {
  const prompt = validateRequiredString(
    question?.prompt,
    `Question ${questionNumber} prompt`,
    MAX_QUESTION_PROMPT_LENGTH
  );
  const required = validateBoolean(
    question?.required,
    `Question ${questionNumber} required flag`
  );
  const imageName = validateOptionalString(
    question?.imageName,
    `Question ${questionNumber} image name`,
    MAX_IMAGE_NAME_LENGTH
  );
  const imageUrl = validateOptionalHttpUrl(
    question?.imageUrl,
    `Question ${questionNumber} image URL`
  );

  if (!Array.isArray(question?.options)) {
    throw createHttpError(400, `Question ${questionNumber} options are required`);
  }

  if (question.options.length < 2) {
    throw createHttpError(
      400,
      `Question ${questionNumber} must have at least 2 answer options`
    );
  }

  if (question.options.length > MAX_OPTIONS_PER_QUESTION) {
    throw createHttpError(
      400,
      `Question ${questionNumber} has too many answer options`
    );
  }

  const options = question.options.map((option, optionIndex) =>
    validateChoiceQuestionOption(option, questionNumber, optionIndex + 1)
  );
  const correctOptions = options.filter((option) => option.isCorrect);

  if (correctOptions.length === 0) {
    throw createHttpError(
      400,
      `Question ${questionNumber} must have at least one correct answer`
    );
  }

  if (answerMode === "single" && correctOptions.length !== 1) {
    throw createHttpError(
      400,
      `Question ${questionNumber} must have exactly one correct answer`
    );
  }

  return {
    kind: "choice",
    prompt,
    required,
    shuffleEligible: true,
    responseType: "choice",
    imageName,
    imageUrl,
    points:
      scoringMode === "manual"
        ? parsePositivePoints(
            question?.points,
            manualPointsMode,
            `Question ${questionNumber} points`
          )
        : 0,
    options,
  };
}

function validateQuestions(questions, answerMode, scoringMode, manualPointsMode) {
  if (!Array.isArray(questions) || questions.length === 0) {
    throw createHttpError(400, "Questions are required");
  }

  if (questions.length > MAX_QUESTIONS_PER_QUIZ) {
    throw createHttpError(400, "Quiz has too many questions");
  }

  let respondentNameQuestionCount = 0;
  let choiceQuestionCount = 0;

  const normalizedQuestions = questions.map((question, index) => {
    const questionNumber = index + 1;
    const kind = validateEnum(
      question?.kind,
      QUIZ_QUESTION_KINDS,
      `Question ${questionNumber} kind`
    );

    if (kind === "respondent_name") {
      respondentNameQuestionCount += 1;
      return validateRespondentNameQuestion(question, questionNumber);
    }

    choiceQuestionCount += 1;

    return validateChoiceQuestion(
      question,
      questionNumber,
      answerMode,
      scoringMode,
      manualPointsMode
    );
  });

  if (respondentNameQuestionCount !== 1) {
    throw createHttpError(
      400,
      "Quiz must contain exactly one respondent name question"
    );
  }

  if (choiceQuestionCount === 0) {
    throw createHttpError(400, "Quiz must contain at least one choice question");
  }

  if (scoringMode === "automatic") {
    const automaticPoints = distributeAutomaticQuestionPoints(choiceQuestionCount);
    let choiceQuestionIndex = 0;

    normalizedQuestions.forEach((question) => {
      if (question.kind !== "choice") {
        return;
      }

      question.points = automaticPoints[choiceQuestionIndex] || 0;
      choiceQuestionIndex += 1;
    });
  }

  const totalPoints = roundPoints(
    normalizedQuestions.reduce((sum, question) => sum + question.points, 0)
  );

  if (totalPoints <= 0) {
    throw createHttpError(400, "Quiz total points must be greater than 0");
  }

  return {
    questions: normalizedQuestions,
    totalPoints,
    questionCount: choiceQuestionCount,
  };
}

function validateSubmissionAnswer(answer, answerNumber) {
  const questionId = validateRequiredString(
    answer?.questionId,
    `Answer ${answerNumber} question ID`,
    80
  );
  const textAnswer = validateOptionalString(
    answer?.textAnswer,
    `Answer ${answerNumber} text`,
    MAX_SUBMISSION_TEXT_LENGTH
  );

  if (
    typeof answer?.selectedOptionIds !== "undefined" &&
    !Array.isArray(answer.selectedOptionIds)
  ) {
    throw createHttpError(
      400,
      `Answer ${answerNumber} selected options must be an array`
    );
  }

  if ((answer?.selectedOptionIds || []).length > MAX_OPTIONS_PER_QUESTION) {
    throw createHttpError(
      400,
      `Answer ${answerNumber} has too many selected options`
    );
  }

  const selectedOptionIds = [...new Set(
    (answer?.selectedOptionIds || []).map((selectedOptionId, optionIndex) =>
      validateRequiredString(
        selectedOptionId,
        `Answer ${answerNumber} selected option ${optionIndex + 1}`,
        80
      )
    )
  )];

  return {
    questionId,
    textAnswer,
    selectedOptionIds,
  };
}

function validateQuizSubmissionInput(payload) {
  if (!payload || typeof payload !== "object") {
    throw createHttpError(400, "Submission payload is required");
  }

  if (!Array.isArray(payload.answers)) {
    throw createHttpError(400, "Answers are required");
  }

  if (payload.answers.length > MAX_QUESTIONS_PER_QUIZ) {
    throw createHttpError(400, "Submission has too many answers");
  }

  const questionIds = new Set();
  const answers = payload.answers.map((answer, index) => {
    const normalizedAnswer = validateSubmissionAnswer(answer, index + 1);

    if (questionIds.has(normalizedAnswer.questionId)) {
      throw createHttpError(
        400,
        `Answer ${index + 1} duplicates a previous question`
      );
    }

    questionIds.add(normalizedAnswer.questionId);
    return normalizedAnswer;
  });

  return {
    answers,
  };
}

function validateQuizCreationInput(payload) {
  const title = validateRequiredString(
    payload?.title,
    "Title",
    MAX_QUIZ_TITLE_LENGTH
  );
  const category = validateRequiredString(
    payload?.category,
    "Category",
    MAX_QUIZ_CATEGORY_LENGTH
  );
  const description = validateOptionalString(
    payload?.description,
    "Description",
    MAX_QUIZ_DESCRIPTION_LENGTH
  );
  const difficulty = validateEnum(
    payload?.difficulty,
    QUIZ_DIFFICULTIES,
    "Difficulty"
  );
  const answerMode = validateEnum(
    payload?.answerMode,
    QUIZ_ANSWER_MODES,
    "Answer mode"
  );
  const shuffleQuestions = validateBoolean(
    payload?.shuffleQuestions,
    "Shuffle questions"
  );
  const shuffleAnswers = validateBoolean(
    payload?.shuffleAnswers,
    "Shuffle answers"
  );
  const scoringMode = validateEnum(
    payload?.scoringMode,
    QUIZ_SCORING_MODES,
    "Scoring mode"
  );
  const manualPointsMode = validateEnum(
    payload?.manualPointsMode,
    QUIZ_MANUAL_POINTS_MODES,
    "Manual points mode"
  );
  const accessType = validateEnum(
    payload?.accessType,
    QUIZ_ACCESS_TYPES,
    "Access type"
  );
  const isPremium = validateBoolean(payload?.isPremium, "Premium flag");
  const imageName = validateOptionalString(
    payload?.imageName,
    "Image name",
    MAX_IMAGE_NAME_LENGTH
  );
  const imageUrl = validateOptionalHttpUrl(payload?.imageUrl, "Image URL");
  const { questions, totalPoints, questionCount } = validateQuestions(
    payload?.questions,
    answerMode,
    scoringMode,
    manualPointsMode
  );

  return {
    title,
    category,
    description,
    difficulty,
    answerMode,
    shuffleQuestions,
    shuffleAnswers,
    scoringMode,
    manualPointsMode,
    accessType,
    isPremium,
    imageName,
    imageUrl,
    totalPoints,
    questionCount,
    questions,
  };
}

module.exports = {
  validateQuizCreationInput,
  validateQuizSubmissionInput,
};
