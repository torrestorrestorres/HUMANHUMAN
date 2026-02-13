// Scoring logic for ARE YOU HUMAN?
// Modular and extensible scoring system

// Humanity-only scoring system with contextual, streak, and meta-recognition support

// Helper: Detect meta/self-aware answers
export function isMetaAnswer(answer) {
  if (!answer || typeof answer.value !== 'string') return false;
  const metaPhrases = [
    'is this a test', 'are you an ai', 'is this real', 'am i being tested', 'are you real', 'is this a game', 'meta', 'simulation'
  ];
  const val = answer.value.toLowerCase();
  return metaPhrases.some(phrase => val.includes(phrase));
}

// Helper: Detect streaks (pass in lastN array of booleans or values)
export function streakModifier(lastN, current) {
  if (!Array.isArray(lastN) || lastN.length < 2) return 0;
  // If last 3 answers are the same as current, increase/decrease impact
  const streak = lastN.slice(-2).every(v => v === current);
  return streak ? 1 : 0;
}

// Main scoring function
export function scoreAnswer(answer, question, context = {}) {
  // context: { lastAnswers: [], minigame: false }
  let delta = 0;
  // Contextual: use question.score.humanity if present
  if (question && question.score && typeof question.score.humanity === 'number') {
    delta = question.score.humanity;
  } else if (context.minigame && typeof answer.score === 'number') {
    delta = answer.score;
  } else {
    // Fallback: basic logic
    if (typeof answer.value === 'string') {
      delta = answer.value.length > 30 ? 2 : 1;
    } else {
      delta = 1;
    }
  }
  // Streaks: if user repeats same answer, increase/decrease impact
  if (context.lastAnswers) {
    delta += streakModifier(context.lastAnswers, answer.value);
  }
  // Meta-recognition: bonus for meta/self-aware answers
  if (isMetaAnswer(answer)) {
    delta += 2;
  }
  return delta;
}

// For final analysis, sum all humanity scores
export function totalScore(answers, questions) {
  let score = 0;
  let lastAnswers = [];
  for (let i = 0; i < answers.length; i++) {
    score += scoreAnswer(answers[i], questions[i], { lastAnswers });
    lastAnswers.push(answers[i]?.value);
  }
  return score;
}

