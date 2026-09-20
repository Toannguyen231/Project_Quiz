/**
 * score.js — Pure Scoring Logic for Exam Engine
 * Pure utility function for calculating exam results.
 * Completely decoupled from React and DOM for effortless unit testing.
 */

/**
 * Calculates exam score, statistics, and per-question breakdown.
 *
 * @param {Array<Object>} questions - List of questions with answers.
 *   Expected shape per question:
 *   {
 *     id: number|string,
 *     questionId?: number|string,
 *     answers: Array<{ id: number|string, isCorrect?: boolean, correct_answer?: boolean }>
 *   }
 *
 * @param {Object|Array} userAnswers - Candidate selections.
 *   Can be:
 *   1. Object map: { [questionId]: [answerId1, ...] } or { [questionId]: answerId }
 *   2. Array of objects: [ { questionId: 1, userAnswerId: [101] } ] or [ { questionId: 1, answers: [101] } ]
 *
 * @returns {Object} Result object:
 *   - totalQuestions: number
 *   - correctCount: number
 *   - incorrectCount: number
 *   - unansweredCount: number
 *   - score: number (scaled 0-10, rounded to 2 decimals)
 *   - percentage: number (0-100, integer)
 *   - passed: boolean (percentage >= 50)
 *   - details: Array<{
 *       questionId: number|string,
 *       isCorrect: boolean,
 *       isUnanswered: boolean,
 *       userAnswers: Array<number|string>,
 *       systemAnswers: Array<number|string>
 *     }>
 */
export function calculateScore(questions = [], userAnswers = {}) {
  if (!Array.isArray(questions) || questions.length === 0) {
    return {
      total: 0,
      totalQuestions: 0,
      correctCount: 0,
      countCorrect: 0,
      incorrectCount: 0,
      countIncorrect: 0,
      unansweredCount: 0,
      countUnanswered: 0,
      skippedCount: 0,
      score: 0,
      percentage: 0,
      passed: false,
      details: []
    };
  }

  // Normalize userAnswers into a lookup map: { [questionId]: [selectedAnswerIds] }
  const normalizedAnswersMap = {};

  if (Array.isArray(userAnswers)) {
    userAnswers.forEach((entry) => {
      if (!entry) return;
      const qId = String(entry.questionId ?? entry.id);
      let selected = entry.userAnswerId ?? entry.userAnswers ?? entry.answers ?? [];
      if (!Array.isArray(selected)) {
        selected = selected != null ? [selected] : [];
      }
      normalizedAnswersMap[qId] = selected.map(id => String(id));
    });
  } else if (userAnswers && typeof userAnswers === 'object') {
    Object.keys(userAnswers).forEach((qId) => {
      const val = userAnswers[qId];
      if (Array.isArray(val)) {
        normalizedAnswersMap[String(qId)] = val.map(id => String(id));
      } else if (val != null) {
        normalizedAnswersMap[String(qId)] = [String(val)];
      } else {
        normalizedAnswersMap[String(qId)] = [];
      }
    });
  }

  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;

  const details = questions.map((q) => {
    const qId = String(q.questionId ?? q.id);
    const answersList = Array.isArray(q.answers) ? q.answers : [];

    // System correct answer IDs
    const systemCorrect = answersList
      .filter((a) => a.isCorrect === true || a.correct_answer === true || a.iscorrect === true || a.iscorrect === 1)
      .map((a) => String(a.id));

    // Candidate selected answer IDs: check normalizedAnswersMap first, or q.answers.isSelected
    let userSelected = normalizedAnswersMap[qId];
    if (userSelected === undefined) {
      // Fallback: check if answers inside the question have isSelected property
      userSelected = answersList
        .filter((a) => a.isSelected === true)
        .map((a) => String(a.id));
    }

    const isUnanswered = userSelected.length === 0;

    // Check correctness:
    // 1. Must have selected at least 1 answer.
    // 2. Count of selections must equal count of system correct answers.
    // 3. Every correct answer must be selected by user.
    let isCorrect = false;
    if (!isUnanswered && systemCorrect.length > 0) {
      const allCorrectSelected = systemCorrect.length === userSelected.length &&
        systemCorrect.every((cId) => userSelected.includes(cId));
      isCorrect = allCorrectSelected;
    }

    if (isUnanswered) {
      unansweredCount++;
    } else if (isCorrect) {
      correctCount++;
    } else {
      incorrectCount++;
    }

    return {
      questionId: q.questionId ?? q.id,
      isCorrect,
      isUnanswered,
      userAnswers: userSelected,
      systemAnswers: systemCorrect
    };
  });

  const total = questions.length;
  const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const rawScore = total > 0 ? (correctCount / total) * 10 : 0;
  const score = Math.round(rawScore * 100) / 100; // Round to 2 decimal places
  const passed = percentage >= 50;

  return {
    total,
    totalQuestions: total,
    correctCount,
    countCorrect: correctCount,
    incorrectCount,
    countIncorrect: incorrectCount,
    unansweredCount,
    countUnanswered: unansweredCount,
    skippedCount: unansweredCount,
    score,
    percentage,
    passed,
    details
  };
}

/**
 * Format score display (e.g., "8.5 / 10").
 */
export function formatScore(score, maxScore = 10) {
  return `${Number(score).toFixed(1)} / ${maxScore}`;
}

/**
 * Helper to determine if a specific answer option was correct, wrong, or missed.
 */
export function evaluateAnswerOption(answerId, userSelectedIds = [], systemCorrectIds = []) {
  const sAnswerId = String(answerId);
  const userList = userSelectedIds.map(String);
  const systemList = systemCorrectIds.map(String);

  const isUserChosen = userList.includes(sAnswerId);
  const isSystemCorrect = systemList.includes(sAnswerId);

  if (isSystemCorrect && isUserChosen) {
    return 'USER_CORRECT'; // User chose the right answer
  }
  if (isSystemCorrect && !isUserChosen) {
    return 'SYSTEM_CORRECT'; // Right answer that user missed
  }
  if (!isSystemCorrect && isUserChosen) {
    return 'USER_WRONG'; // User chose an incorrect answer
  }
  return 'DEFAULT';
}

export default calculateScore;
