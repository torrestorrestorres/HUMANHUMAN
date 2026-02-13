// Loads AI config for the current language
let aiConfig = null;

export async function loadAIConfig() {
  if (!aiConfig) {
    const response = await fetch('./src/data/aiConfig.json');
    aiConfig = await response.json();
  }
  return aiConfig;
}
