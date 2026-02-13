// Patch for getAIResponse to accept memory and use it for mocking
import { getMemory } from './memory.js';

// Wrap the original getAIResponse
import { getAIResponse as origGetAIResponse } from './aiResponse.js';

export async function getAIResponse(answers, aiContext = {}) {
  // Attach memory to context for mocking
  if (!aiContext.memory) {
    aiContext.memory = getMemory();
  }
  // Optionally, inject mocking based on memory
  let prepend = '';
  if (aiContext.memory && aiContext.memory.runs > 1) {
    aiContext.mocking = true;
    prepend = `You've done this ${aiContext.memory.runs} times. Last score: ${aiContext.memory.lastScore}. `;
    if (aiContext.memory.runs > 3) {
      prepend += 'You really enjoy being judged, don’t you? ';
    }
    if (aiContext.memory.repeatedPatterns && aiContext.memory.repeatedPatterns.absurdAnswers > 5) {
      prepend += 'Your answers are getting more absurd each time. ';
    }
  }
  const resp = await origGetAIResponse(answers, aiContext);
  return prepend + resp;
}
