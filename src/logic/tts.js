// TTS logic for ARE YOU HUMAN?
// Provides speak(text, mood) and voice toggle


let voices = [];
let voiceEnabled = true;
let currentLang = 'en';

function loadVoices() {
  voices = window.speechSynthesis.getVoices();
}

// Call once on load and also onvoiceschanged
if ('speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

export function setTTSLang(lang) {
  currentLang = lang;
}

function getVoice(mood = "neutral") {
  // Always reload voices to handle dynamic changes
  voices = window.speechSynthesis.getVoices();
  let langCode = currentLang === 'de' ? 'de' : 'en';
  let candidates = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith(langCode));
  if (mood === "robot") {
    let robot = candidates.find(v => v.name.toLowerCase().includes("microsoft") || v.name.toLowerCase().includes("robot"));
    if (robot) return robot;
  }
  if (mood === "bored") {
    let bored = candidates.find(v => v.name.toLowerCase().includes("zira") || v.name.toLowerCase().includes("female"));
    if (bored) return bored;
  }
  if (candidates.length) return candidates[0];
  return voices[0];
}

export function speak(text, mood = "neutral") {
  if (!voiceEnabled || !('speechSynthesis' in window)) return;
  // Cancel any ongoing speech to avoid overlap and force voice update
  window.speechSynthesis.cancel();
  // Force reload voices for every utterance
  voices = window.speechSynthesis.getVoices();
  const utter = new window.SpeechSynthesisUtterance(text);
  utter.rate = 0.95;
  utter.pitch = 0.9;
  utter.volume = 1;
  utter.voice = getVoice(mood);
  window.speechSynthesis.speak(utter);
}

export function setVoiceEnabled(enabled) {
  voiceEnabled = enabled;
}

export function isVoiceEnabled() {
  return voiceEnabled;
}
