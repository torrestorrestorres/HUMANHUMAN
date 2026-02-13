// Memory system for ARE YOU HUMAN?
// Stores minimal user behavior in localStorage (or cookies if needed)

const MEMORY_KEY = 'ayh_memory';

function loadMemory() {
  try {
    const raw = localStorage.getItem(MEMORY_KEY);
    if (!raw) return {
      runs: 0,
      lastScore: 0,
      lastAnswers: [],
      cameraEnabled: false,
      repeatedPatterns: { goodAnswers: 0, absurdAnswers: 0 }
    };
    return JSON.parse(raw);
  } catch {
    return {
      runs: 0,
      lastScore: 0,
      lastAnswers: [],
      cameraEnabled: false,
      repeatedPatterns: { goodAnswers: 0, absurdAnswers: 0 }
    };
  }
}

function saveMemory(mem) {
  try {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(mem));
  } catch {}
}

export function getMemory() {
  return loadMemory();
}

export function updateMemory(update) {
  const mem = loadMemory();
  Object.assign(mem, update);
  saveMemory(mem);
}

export function addRun({ answers, score, cameraEnabled }) {
  const mem = loadMemory();
  mem.runs = (mem.runs || 0) + 1;
  mem.lastScore = score;
  mem.lastAnswers = answers.map(a => a.value || a);
  mem.cameraEnabled = cameraEnabled;
  // Count repeated patterns
  let good = 0, absurd = 0;
  for (const a of answers) {
    if (a.type === 'good' || a.type === 'human') good++;
    if (a.type === 'absurd' || a.type === 'chaos') absurd++;
  }
  mem.repeatedPatterns = {
    goodAnswers: (mem.repeatedPatterns?.goodAnswers || 0) + good,
    absurdAnswers: (mem.repeatedPatterns?.absurdAnswers || 0) + absurd
  };
  saveMemory(mem);
}

export function clearMemory() {
  localStorage.removeItem(MEMORY_KEY);
}
