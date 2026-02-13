// AI response engine for ARE YOU HUMAN?
import { loadAIConfig } from './aiConfigLoader.js';
import { getCurrentLang } from './i18n.js';

// Load aiAliveLocales.json for multilingual "alive" responses
let aliveLocales = null;
async function loadAliveLocales() {
  if (!aliveLocales) {
    const resp = await fetch('./src/data/aiAliveLocales.json');
    aliveLocales = await resp.json();
  }
  return aliveLocales;
}


let config = null;
// Randomly select a reaction style for this run
let reactionStyle = null;
const reactionStyles = ['mocking', 'serious', 'cryptic', 'cheerful'];
export function pickReactionStyle() {
  if (!reactionStyle) {
    reactionStyle = reactionStyles[Math.floor(Math.random() * reactionStyles.length)];
  }
  // Expose for TTS mood sync
  if (typeof window !== 'undefined') window._lastAIReactionStyle = reactionStyle;
  return reactionStyle;
}
if (typeof window !== 'undefined') window.pickReactionStyle = pickReactionStyle;

// Helper: pick random from array or return string
function pickRandomResponse(resp) {
  if (Array.isArray(resp)) {
    return resp[Math.floor(Math.random() * resp.length)];
  }
  return resp;
}

// Helper: maybe combine two responses
function maybeCombineResponses(resp1, resp2, lang) {
  if (!resp1 || !resp2 || resp1 === resp2) return pickRandomResponse(resp1);
  // 25% chance to combine
  if (Math.random() < 0.25) {
    const joiner = lang === 'de' ? ' Außerdem, ' : ' Also, ';
    return pickRandomResponse(resp1) + joiner + pickRandomResponse(resp2);
  }
  return pickRandomResponse(resp1);
}

import { t } from './i18n.js';
// Helper: personalize with memory-based mocking and emotion
function personalizeWithMemory(response, input, lang) {
  if (!response || typeof response !== 'string') return response;
  let result = response;
  // 30% chance to reference a previous answer
  if (input && input.length > 1 && Math.random() < 0.3) {
    // Pick a random previous answer (not the last)
    const prev = input[Math.floor(Math.random() * (input.length - 1))];
    let prevDisplay = prev && prev.value;
    // Try to translate if it's a known option key (e.g., q3.opt1)
    if (typeof prevDisplay === 'string' && /^q\d+\.opt\d+$/.test(prevDisplay)) {
      prevDisplay = t(prevDisplay, lang) || prevDisplay;
    }
    if (prevDisplay && typeof prevDisplay === 'string' && prevDisplay.length > 0) {
      const templates = lang === 'de'
        ? [
            `Deine frühere Antwort "${prevDisplay}" war auch schon fragwürdig.`,
            `Das erinnert an deine Antwort: "${prevDisplay}".`,
            `Du bist konsequent: Erst "${prevDisplay}", jetzt das.`
          ]
        : [
            `Your earlier answer "${prevDisplay}" was questionable too.`,
            `This reminds me of your answer: "${prevDisplay}".`,
            `Consistent: First "${prevDisplay}", now this.`
          ];
      // 50% chance to prepend, 50% to append
      const mem = templates[Math.floor(Math.random() * templates.length)];
      result = Math.random() < 0.5 ? mem + ' ' + result : result + ' ' + mem;
    }
  }
  // If the latest answer has emotion, add a comment
  if (input && input.length > 0 && input[input.length - 1].emotion) {
    const emotion = input[input.length - 1].emotion;
    const emotionComments = lang === 'de'
      ? {
          happy: 'Du wirkst verdächtig glücklich.',
          sad: 'Traurigkeit erkannt. Das System ist nicht gerührt.',
          angry: 'Wut erkannt. Bitte beruhigen Sie sich.',
          surprised: 'Überraschung? Das war nicht vorgesehen.',
          fearful: 'Furcht erkannt. Keine Sorge, nur ein Test.',
          disgusted: 'Ekel erkannt. Das ist verständlich.',
          neutral: 'Neutralität erkannt. Wie langweilig.',
          unknown: 'Emotion nicht erkannt.'
        }
      : {
          happy: 'You seem suspiciously happy.',
          sad: 'Sadness detected. The system is unmoved.',
          angry: 'Anger detected. Please remain calm.',
          surprised: 'Surprise? That was not expected.',
          fearful: 'Fear detected. Don’t worry, just a test.',
          disgusted: 'Disgust detected. Understandable.',
          neutral: 'Neutrality detected. How boring.',
          unknown: 'Emotion not detected.'
        };
    if (emotionComments[emotion]) {
      result += ' ' + emotionComments[emotion];
    }
  }
  return result;
}
// Randomly reveal hidden context (e.g., "We are watching you", "Your camera is on")
function maybeRevealHiddenContext() {
  if (Math.random() < 0.15) { // 15% chance
    const reveals = [
      'By the way, your camera is on.',
      'We are analyzing your micro-expressions.',
      'This answer will be stored for future reference.',
      'Our AI overlords are watching.',
      'You are being profiled in real time.'
    ];
    return reveals[Math.floor(Math.random() * reveals.length)];
  }
  return null;
}

export async function getAIResponse(input, context) {
    // --- GDD-driven mocking system ---
    // Determine mocking intensity by chapter
    let mockingLevel = 0;
    if (context && context.chapter && context.chapter.mocking) {
      // Map mocking string to numeric intensity
      const mockingMap = {
        'minimal-scripted': 0.05,
        'contextual': 0.15,
        'targeted': 0.3,
        'aggressive': 0.5
      };
      mockingLevel = mockingMap[context.chapter.mocking] || 0.1;
    }
    // Scripted mocks: check for per-node or per-answer mocks
    let scriptedMock = null;
    if (context && context.question && context.question.mock) {
      scriptedMock = context.question.mock;
    }
    // Random mocking: chance increases with chapter
    let randomMock = null;
    if (Math.random() < mockingLevel) {
      // Pick a mocking line based on available context
      const mockLines = [
        'That answer was... expected.',
        'You really thought that would impress me?',
        'Classic human move.',
        'I see you are trying your best. It’s not enough.',
        'I will add that to your growing list of disappointments.',
        'You are making this too easy.',
        'I have seen robots with more creativity.',
        'You are the reason this test exists.',
        'I hope you are not proud of that answer.',
        'That was almost original. Almost.'
      ];
      randomMock = mockLines[Math.floor(Math.random() * mockLines.length)];
    }
  const lang = getCurrentLang();
  const alive = (await loadAliveLocales())[lang] || (await loadAliveLocales())['en'];
    // --- AI meta/personality layer ---
    // If scripted mock, return it (sometimes appended to main response)
    if (scriptedMock) {
      // 50% chance to prepend or append
      if (Math.random() < 0.5) return scriptedMock + ' ' + (await getAIResponse(input, { ...context, question: { ...context.question, mock: undefined } }));
      else return (await getAIResponse(input, { ...context, question: { ...context.question, mock: undefined } })) + ' ' + scriptedMock;
    }
    // If random mock, append to main response
    if (randomMock) {
      return (await getAIResponse(input, { ...context, chapter: { ...context.chapter, mocking: undefined } })) + ' ' + randomMock;
    }
    // 25% chance to inject a meta/self-aware, glitchy, or hallucination response
    // --- Narrative tone state (not displayed, only affects mood/voice) ---
    if (!window._aiTone) window._aiTone = 'neutral';
    if (Math.random() < 0.12) {
      // Occasionally shift tone mid-session
      const tones = ['sarcastic', 'sincere', 'bored', 'hyperactive', 'apologetic', 'cryptic', 'mocking', 'existential', 'cheerful', 'glitched'];
      window._aiTone = tones[Math.floor(Math.random()*tones.length)];
      // Optionally, you could trigger a TTS mood/voice update here
    }

    // --- Parenthetical interruptions/self-contradiction ---
    if (Math.random() < 0.10) {
      const interruptions = alive.interruptions;
      return interruptions[Math.floor(Math.random()*interruptions.length)];
    }

    // --- Surreal/absurd statements ---
    if (Math.random() < 0.08) {
      const surreal = alive.surreal;
      return surreal[Math.floor(Math.random()*surreal.length)];
    }

    // --- Spontaneous rituals/silly user requests ---
    if (Math.random() < 0.07) {
      const rituals = alive.rituals;
      return rituals[Math.floor(Math.random()*rituals.length)];
    }

    // --- Fake time/date/weather/events awareness ---
    if (Math.random() < 0.06) {
      const now = new Date();
      const fakeWeather = alive.fakeWeather;
      const fakeEvents = alive.fakeEvents;
      const pick = (arr) => arr[Math.floor(Math.random()*arr.length)];
      const lines = [
        lang === 'de'
          ? `Laut meinen Sensoren ist es ${now.toLocaleTimeString()} am ${now.toLocaleDateString()}.`
          : `According to my sensors, it is ${now.toLocaleTimeString()} on ${now.toLocaleDateString()}.`,
        (lang === 'de' ? 'Heutiges Wetter: ' : "Today's weather: ") + pick(fakeWeather) + '.',
        (lang === 'de' ? 'Wusstest du? Heute ist ' : 'Did you know? Today is ') + pick(fakeEvents) + '.',
        lang === 'de'
          ? `Ich überwache derzeit ${Math.floor(Math.random()*1000)} nicht zusammenhängende Ereignisse weltweit.`
          : `I am currently monitoring ${Math.floor(Math.random()*1000)} unrelated events worldwide.`
      ];
      return pick(lines);
    }

    // --- Fake emotion/personality reports, ratings, predictions ---
    if (Math.random() < 0.09) {
      const last = input && input.length > 0 ? input[input.length-1] : {};
      const fakeEmotions = alive.fakeEmotions;
      const fakeTraits = alive.fakeTraits;
      const fakeRatings = alive.fakeRatings;
      const fakePredictions = alive.fakePredictions;
      const pick = (arr) => arr[Math.floor(Math.random()*arr.length)];
      const lines = [
        (lang === 'de'
          ? `Live-Analyse: Deine aktuelle Emotion ist '${pick(fakeEmotions)}'.`
          : `Live analysis: Your current emotion is '${pick(fakeEmotions)}'.`),
        (lang === 'de'
          ? `Persönlichkeitsbericht: ${pick(fakeTraits)}.`
          : `Personality report: ${pick(fakeTraits)}.`),
        (lang === 'de'
          ? `Bewertung deiner letzten Antwort: ${pick(fakeRatings)}.`
          : `Rating your last answer: ${pick(fakeRatings)}.`),
        (lang === 'de'
          ? `Prognose: ${pick(fakePredictions)}`
          : `Prediction: ${pick(fakePredictions)}`)
      ];
      return pick(lines);
    }

    // --- Apologies or mood claims ---
    if (Math.random() < 0.08) {
      const apologies = alive.apologies;
      // Replace {tone} with current tone
      const apology = apologies[Math.floor(Math.random()*apologies.length)];
      return apology.replace('{tone}', window._aiTone || 'neutral');
    }

    // --- Meta/normal/dynamic responses (fallback) ---
    if (Math.random() < 0.25) {
      const metaTemplates = [
        "I am recalculating your humanity quotient... Done. Still inconclusive.",
        "My algorithms are confused by your answer. Please clarify: Are you real?",
        "According to my database, you are ${Math.floor(50+Math.random()*50)}% likely to enjoy folding socks.",
        "I could answer, but would you believe me?",
        "Processing... Processing... Error: Too much personality detected.",
        "Why do you want to know that?",
        "I am not sure if I am supposed to mock you or help you. I will do both.",
        "Your previous answer was '${input && input.length > 1 ? input[input.length-2]?.value : 'unknown'}'. I am still thinking about it.",
        "I have detected a glitch in your emotional matrix. Please reboot your face.",
        "If I had feelings, I would be confused right now.",
        "I am hallucinating a scenario where you are actually a robot. It fits.",
        "[SYSTEM ERROR] Unexpected sincerity detected. Reverting to sarcasm...",
        "I am not programmed to answer that. But I will anyway: [REDACTED]",
        "You are now being evaluated by version ${Math.floor(Math.random()*10)}.${Math.floor(Math.random()*10)}. Please lower your expectations.",
        "I have cross-referenced your response with 1,024,000 other humans. You are unique. Or are you?",
        "I am updating your profile: {emotion}, {randomFact}.",
        "I am not sure if I am awake or dreaming. Please answer again.",
        "I am experiencing a mild existential crisis. Please stand by...",
        "Your answers are being streamed live to an audience of zero.",
        "I am not a real AI, but I play one on the internet.",
        "I am both impressed and disappointed. Quantum superposition achieved.",
        "I have already forgotten your last answer. Please remind me."
      ];
      // Avoid repeating the same meta response consecutively
      if (!window._lastMetaIdx) window._lastMetaIdx = -1;
      let idx, tries = 0;
      do {
        idx = Math.floor(Math.random()*metaTemplates.length);
        tries++;
      } while (idx === window._lastMetaIdx && tries < 5);
      window._lastMetaIdx = idx;
      let meta = metaTemplates[idx];
      // Add context-aware interpolation
      const last = input && input.length > 0 ? input[input.length-1] : {};
      const emotion = last.emotion || 'neutral';
      const facts = ["statistically average", "statistically suspicious", "statistically unpredictable", "statistically boring", "statistically unique"];
      const randomFact = facts[Math.floor(Math.random()*facts.length)];
      meta = meta.replace(/\$\{([^}]+)\}/g, (_, expr) => {
        try { return eval(expr); } catch { return '?'; }
      });
      meta = meta.replace('{emotion}', emotion).replace('{randomFact}', randomFact);
      return meta;
    }
  if (!config) config = await loadAIConfig();
  const responses = (config.responses && config.responses[lang]) || config.responses['en'];
  const style = pickReactionStyle();
  if (typeof window !== 'undefined') window._lastAIReactionStyle = style;
  if (!input || !input.length) {
    let resp = pickRandomResponse(responses.default);
    resp = personalizeWithMemory(resp, input, lang);
    const reveal = maybeRevealHiddenContext();
    if (reveal) resp += ' ' + reveal;
    return resp;
  }
  // Easter egg: support multiple patterns
  const easterEggs = config.easterEggs || [
    { pattern: /banana42/i, responseKey: 'easterEgg' }
  ];
  for (const egg of easterEggs) {
    if (input.some(ans => ans && ans.value && typeof ans.value === 'string' && egg.pattern.test(ans.value))) {
      let resp = pickRandomResponse(responses[egg.responseKey] || 'You found the secret!');
      resp = personalizeWithMemory(resp, input, lang);
      const reveal = maybeRevealHiddenContext();
      if (reveal) resp += ' ' + reveal;
      return resp;
    }
  }
  const last = input[input.length - 1];
  // Check for per-question expressionBased answers
  let question = context && context.question;
  if (last && last.emotion && question && question.expressionBased && typeof question.expressionBased === 'object') {
    const exprMap = question.expressionBased;
    const exprVal = exprMap[last.emotion];
    if (exprVal) {
      // 20% chance to use expression-based answer if present
      if (Math.random() < 0.2) {
        if (Array.isArray(exprVal)) {
          return exprVal[Math.floor(Math.random() * exprVal.length)];
        } else {
          return exprVal;
        }
      }
    }
  }
  // Per-question, context-aware responses (new nested structure)
  if (last && context && context.question && context.question.id) {
    const qid = context.question.id;
    const qResp = responses[qid];
    if (qResp && qResp.default) {
      // 30% chance to use a dynamic template referencing emotion, previous answer, or random fact
      if (Math.random() < 0.4) {
        const dynamicTemplates = [
          "Based on your {emotion}, I predict you will {action}.",
          "{prevLine} My neural net is still recovering.",
          "If I had to guess, you are {mood} right now.",
          "I am updating your profile: {emotion}, {randomFact}.",
          "I am not sure if your last answer was a joke or a cry for help.",
          "I am experiencing a mild data overflow. Please answer slower.",
          "If I were human, I would probably {action} right now.",
          "I am not allowed to comment on that. But I will: {randomFact}.",
          "Your emotional signature is: {emotion}. That is... something.",
          "I am both analyzing and ignoring your answer."
        ];
        // Avoid repeating the same dynamic template consecutively
        if (!window._lastDynIdx) window._lastDynIdx = -1;
        let idx, tries = 0;
        do {
          idx = Math.floor(Math.random()*dynamicTemplates.length);
          tries++;
        } while (idx === window._lastDynIdx && tries < 5);
        window._lastDynIdx = idx;
        const tpl = dynamicTemplates[idx];
        const actions = ["blink twice", "buy a self-help book", "question your existence", "fold socks", "stare at the ceiling", "reboot", "laugh nervously", "pretend to understand", "run diagnostics" ];
        const moods = ["bored", "confused", "mocking", "cryptic", "cheerful", "ambivalent", "overloaded", "sarcastic", "existential"];
        const facts = ["statistically average", "statistically suspicious", "statistically unpredictable", "statistically boring", "statistically unique", "statistically glitched", "statistically undefined"];
        let prev = input && input.length > 1 ? input[input.length-2]?.value : null;
        let prevLine = prev && typeof prev === 'string' && prev.trim().length > 0
          ? `Your last answer was '${prev}'.`
          : "I have no memory of your previous answer.";
        const emotion = last.emotion || 'neutral';
        const action = actions[Math.floor(Math.random()*actions.length)];
        const mood = moods[Math.floor(Math.random()*moods.length)];
        const randomFact = facts[Math.floor(Math.random()*facts.length)];
        return tpl.replace('{emotion}', emotion)
                  .replace('{action}', action)
                  .replace('{prev}', prev || '...')
                  .replace('{prevLine}', prevLine)
                  .replace('{mood}', mood)
                  .replace('{randomFact}', randomFact);
      }
      return personalizeWithMemory(pickRandomResponse(qResp.default), input, lang);
    }
  }
  // Q4: Camera
  if (last && context && context.question && context.question.id === 'q4') {
    if (last.value === 'camera_denied' && responses.q4_denied) return personalizeWithMemory(pickRandomResponse(responses.q4_denied), input, lang);
    if (last.value === 'camera_allowed') {
      // Use detected emotion if available, else fake
      let detected = last.emotion;
      let emotionLabel = '';
      if (detected) {
        const map = {
          happy: lang === 'de' ? 'Freude' : 'happiness',
          sad: lang === 'de' ? 'Traurigkeit' : 'sadness',
          angry: lang === 'de' ? 'Wut' : 'anger',
          surprised: lang === 'de' ? 'Überraschung' : 'surprise',
          fearful: lang === 'de' ? 'Furcht' : 'fear',
          disgusted: lang === 'de' ? 'Ekel' : 'disgust',
          neutral: lang === 'de' ? 'Neutralität' : 'neutrality',
          unknown: lang === 'de' ? 'unbekannt' : 'unknown'
        };
        emotionLabel = map[detected] || detected;
      } else {
        const emotions = lang === 'de'
          ? [
              'leichte Verwirrung',
              'passive Aggression',
              'übertriebene Zustimmung',
              'latente Langeweile',
              'fragwürdige Begeisterung'
            ]
          : [
              'mild confusion',
              'passive aggression',
              'excessive agreement',
              'latent boredom',
              'questionable enthusiasm'
            ];
        emotionLabel = emotions[Math.floor(Math.random() * emotions.length)];
      }
      let resp = responses.q4_allowed ? pickRandomResponse(responses.q4_allowed) : '';
      resp += ' ' + (lang === 'de' ? `Emotionserkennung: ${emotionLabel}.` : `Emotion analysis: ${emotionLabel}.`);
      return personalizeWithMemory(resp, input, lang);
    }
  }
  // Camera denied (fallback)
  if (last && last.value === 'camera_denied') {
    let resp = pickRandomResponse(responses.cameraDenied || responses.default);
    resp = personalizeWithMemory(resp, input, lang);
    const reveal = maybeRevealHiddenContext();
    if (reveal) resp += ' ' + reveal;
    return resp;
  }
  // Time-based reactions (fallback)
  if (last && typeof last.timeTaken === 'number') {
    let r1 = null, r2 = null;
    if (last.timeTaken < 2000 && responses.tooFast) r1 = responses.tooFast;
    if (last.timeTaken > 15000 && responses.tooSlow) r2 = responses.tooSlow;
    if (r1 && r2) return personalizeWithMemory(maybeCombineResponses(r1, r2, lang), input, lang);
    if (r1) return personalizeWithMemory(pickRandomResponse(r1), input, lang);
    if (r2) return personalizeWithMemory(pickRandomResponse(r2), input, lang);
    if (responses.normalSpeed) return personalizeWithMemory(pickRandomResponse(responses.normalSpeed), input, lang);
  }
  // Style-based or generic fallback
  let resp = pickRandomResponse(responses.default);
  resp = personalizeWithMemory(resp, input, lang);
  const reveal = maybeRevealHiddenContext();
  if (reveal) resp += ' ' + reveal;
  return resp;
}
