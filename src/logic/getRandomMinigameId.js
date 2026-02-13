// Utility: Pick a random minigameId from the registry
import { minigameRegistry } from '../logic/minigameRegistry.js';

export function getRandomMinigameId() {
  const keys = Object.keys(minigameRegistry);
  if (keys.length === 0) throw new Error('No minigames registered');
  return keys[Math.floor(Math.random() * keys.length)];
}
