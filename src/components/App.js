// Main App component for ARE YOU HUMAN?
// ...existing code...


import gameflow from '../logic/gameflow.js';
import { getAIResponse } from '../logic/aiResponse.js';
import { totalScore, scoreAnswer } from '../logic/scoring.js';
import '../components/humanity-popup.js';
import { minigameRegistry } from '../logic/minigameRegistry.js';
import { loadLocales, setLanguage, t, getCurrentLang } from '../logic/i18n.js';
import { loadFaceApi, detectEmotion } from '../logic/emotionDetection.js';
import { speak, setVoiceEnabled, isVoiceEnabled, setTTSLang } from '../logic/tts.js';
import { getMemory, addRun } from '../logic/memory.js';

export class App {
  #_humanity = 100; // Declare private field at class level
  constructor(rootElement) {
    this.root = rootElement;
    this.state = {
      currentStep: 0,
      questions: [],
      answers: [],
      aiContext: {},
      cameraEnabled: false,
      cameraStream: null,
      latestEmotion: null,
      memory: getMemory(),
      // humanity is now a getter/setter property
    };
    this.playedMinigames = new Set();
    this.emotionInterval = null;
  }
  get humanity() {
    return this.#_humanity;
  }
  set humanity(val) {
    const old = this.#_humanity;
    this.#_humanity = Math.max(0, val);
    if (this.showHumanityPopup && typeof old === 'number' && old !== this.#_humanity) {
      this.showHumanityPopup(this.#_humanity - old);
    }
  }

  async init() {
    this.root.innerHTML = '<div class="ayh-loading">Loading...</div>';
    try {
      await loadLocales();
      // Load chapters via gameflow async init
      await gameflow.init();
      this.renderEntrance();
    } catch (e) {
      this.root.innerHTML = '<div class="ayh-error">Failed to load data. Please try again later.</div>';
    }
  }
  renderEntrance() {
    this.root.innerHTML = `
      <div class="ayh-entrance" style="text-align:center;max-width:400px;margin:60px auto;">
        <h1>ARE YOU HUMAN?</h1>
        <div style="margin:2em 0;color:#888;font-size:1.1em;">This system will evaluate you.<br>This is not optional.</div>
        <label style="display:block;margin:1.5em 0;">
          <input type="checkbox" id="camera-opt-in"> Enable camera for emotion analysis (optional, local only)
        </label>
        <label style="display:block;margin:1em 0;">
          <input type="checkbox" id="voice-toggle" checked> Voice: ON
        </label>
        <div id="camera-preview" style="display:none;text-align:center;margin-bottom:1em;"></div>
        <button id="start-btn" style="margin:0 1em;">START</button>
        <button id="refuse-btn" style="margin:0 1em;">I refuse</button>
        <div id="camera-error" style="color:red;margin-top:1em;"></div>
      </div>
    `;
    const cameraOpt = this.root.querySelector('#camera-opt-in');
    const cameraPreview = this.root.querySelector('#camera-preview');
    const cameraError = this.root.querySelector('#camera-error');
    const voiceToggle = this.root.querySelector('#voice-toggle');
    voiceToggle.onchange = (e) => {
      setVoiceEnabled(voiceToggle.checked);
      if (!voiceToggle.checked) {
        speak("You're muting me? Fine. I'll judge you silently.", "bored");
      }
    };
    cameraOpt.onchange = async (e) => {
      if (cameraOpt.checked) {
        cameraError.textContent = '';
        try {
          await loadFaceApi();
          // Only get a new stream if one doesn't already exist
          let stream = this.state.cameraStream;
          if (!stream) {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            this.state.cameraStream = stream;
          }
          this.state.cameraEnabled = true;
          cameraPreview.style.display = 'block';
          cameraPreview.innerHTML = `
            <video id="cam-preview-video" width="160" height="120" autoplay muted playsinline style="border-radius:8px;border:1px solid #ccc;"></video>
            <div id="emotion-debug" style="margin-top:0.5em;font-size:1.1em;color:#444;"></div>
          `;
          const video = this.root.querySelector('#cam-preview-video');
          const emotionDebug = this.root.querySelector('#emotion-debug');
          video.srcObject = stream;
          await new Promise(r => video.onloadedmetadata = r);
          this.startBackgroundEmotion(video, emotionDebug);
        } catch (err) {
          cameraError.textContent = 'Camera or model error. Cannot enable emotion analysis.';
          cameraOpt.checked = false;
          this.state.cameraEnabled = false;
          this.state.cameraStream = null;
          cameraPreview.style.display = 'none';
        }
      } else {
        this.state.cameraEnabled = false;
        // Only stop the stream if the user disables the camera here
        if (this.state.cameraStream) {
          try {
            this.state.cameraStream.getTracks().forEach(t => t.stop());
          } catch {}
          this.state.cameraStream = null;
        }
        cameraPreview.style.display = 'none';
        this.stopBackgroundEmotion();
      }
    };
    this.root.querySelector('#start-btn').onclick = () => this.renderCalibration();
    this.root.querySelector('#refuse-btn').onclick = () => {
      this.root.innerHTML = `<div class="ayh-entrance" style="text-align:center;max-width:400px;margin:60px auto;">
        <h1>ARE YOU HUMAN?</h1>
        <div style="margin:2em 0;color:#888;font-size:1.1em;">Of course you do. Humans love refusing things they don’t understand.</div>
        <button id="continue-btn">Continue anyway</button>
      </div>`;
      this.root.querySelector('#continue-btn').onclick = () => this.renderCalibration();
    };
  }

  startBackgroundEmotion(video, debugElem) {
    this.stopBackgroundEmotion();
    this.emotionInterval = setInterval(async () => {
      try {
        const emotion = await detectEmotion(video);
        if (emotion && emotion !== 'unknown') {
          this.state.latestEmotion = emotion;
        }
        if (debugElem) {
          debugElem.textContent = `Detected emotion: ${this.state.latestEmotion || 'none'}`;
        }
      } catch {
        if (debugElem) debugElem.textContent = 'Error detecting emotion';
      }
    }, 1500);
  }

  stopBackgroundEmotion() {
    if (this.emotionInterval) clearInterval(this.emotionInterval);
    this.emotionInterval = null;
    this.state.latestEmotion = null;
  }

  renderCalibration() {
    const steps = [
      'Loading empathy…',
      'Analyzing social coherence…',
      'Measuring irrationality…',
      'Wasting resources…',
      'Done. You’re still here.'
    ];
    let current = 0;
    this.root.innerHTML = `
      <div class="ayh-calibration" style="text-align:center;max-width:400px;margin:60px auto;">
        <h2>Calibration</h2>
        <div id="calib-bar" style="background:#eee;height:20px;width:100%;border-radius:10px;overflow:hidden;margin:2em 0;">
          <div id="calib-progress" style="background:#aaa;height:100%;width:0%;transition:width 0.5s;"></div>
        </div>
        <div id="calib-msg" style="margin:1em 0;color:#888;font-size:1.1em;">${steps[0]}</div>
      </div>
    `;
    const progress = this.root.querySelector('#calib-progress');
    const msg = this.root.querySelector('#calib-msg');
    const nextStep = () => {
      current++;
      if (current < steps.length) {
        progress.style.width = `${(current/(steps.length-1))*100}%`;
        msg.textContent = steps[current];
        // No TTS during calibration/loading
        setTimeout(nextStep, 900);
      } else {
        setTimeout(() => {
          // After calibration, go to intro (language select)
          this.renderIntro();
        }, 1200);
      }
    };
    setTimeout(nextStep, 900);
  }

  renderIntro() {
    this.root.innerHTML = `
      <div class="ayh-intro">
        <div style="float:right;">
          <select id="lang-select">
            <option value="en" ${getCurrentLang() === 'en' ? 'selected' : ''}>EN</option>
            <option value="de" ${getCurrentLang() === 'de' ? 'selected' : ''}>DE</option>
          </select>
        </div>
        <h1>${t('introTitle')}</h1>
        <button id="start-btn">${t('beginEvaluation')}</button>
      </div>
    `;
    setTTSLang(getCurrentLang());
    this.root.querySelector('#start-btn').onclick = () => this.nextStep();
    this.root.querySelector('#lang-select').onchange = (e) => {
      setLanguage(e.target.value);
      setTTSLang(e.target.value);
      this.renderIntro();
    };
  }


  nextStep() {
    if (gameflow.isEnded()) {
      this.renderResult();
      return;
    }
    const node = gameflow.getCurrentNode();
    if (!node) {
      this.renderResult();
      return;
    }
    this.state.questionStartTime = Date.now();
    if (node.type === 'scripted_event') {
      this.renderScriptedEvent(node);
    } else if (node.type === 'multiple_choice') {
      this.renderMultipleChoice(node);
    } else if (node.type === 'text_input') {
      this.renderTextInput(node);
    } else if (node.type === 'random_pool') {
      this.renderRandomPool(node);
    } else if (node.type === 'camera_event') {
      this.renderCameraEvent(node);
    } else if (node.type === 'minigame') {
      this.renderMinigame(node);
    } else {
      // Fallback for unknown node types
      this.root.innerHTML = `<div>Unknown node type: ${node.type}</div><button id="next-btn">Next</button>`;
      this.root.querySelector('#next-btn').onclick = () => {
        gameflow.nextNode();
        this.nextStep();
      };
    }
  }

  renderMinigame(node) {
    // Pick a random eligible minigame (not played, condition passes)
    const available = Object.entries(minigameRegistry)
      .filter(([id, entry]) => !this.playedMinigames.has(id) && entry.condition(this.state));
    if (available.length === 0) {
      this.root.innerHTML = `<div>No eligible minigames available.</div><button id="next-btn">Next</button>`;
      this.root.querySelector('#next-btn').onclick = () => {
        gameflow.nextNode();
        this.nextStep();
      };
      return;
    }
    const [minigameId, minigameEntry] = available[Math.floor(Math.random() * available.length)];
    this.playedMinigames.add(minigameId);
    const Minigame = minigameEntry.component;
    this.root.innerHTML = `<div id="minigame-root"></div>`;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    const minigameRoot = this.root.querySelector('#minigame-root');
    if (typeof Minigame === 'string') {
      // Web component: insert by tag name and listen for event
      const el = document.createElement(Minigame);
      el.addEventListener('minigame-complete', (e) => {
        const result = e.detail;
        if (result && typeof result.score === 'number') {
          const delta = scoreAnswer({ score: result.score }, { type: 'minigame' }, { minigame: true });
          this.humanity += delta;
        }
        if (node.endOfChapter) {
          gameflow.nextChapter();
        } else {
          gameflow.nextNode();
        }
        this.nextStep();
      }, { once: true });
      minigameRoot.appendChild(el);
    } else {
      // Class-based minigame
      new Minigame(minigameRoot, (result) => {
        if (result && typeof result.score === 'number') {
          const delta = scoreAnswer({ score: result.score }, { type: 'minigame' }, { minigame: true });
          this.humanity += delta;
        }
        if (node.endOfChapter) {
          gameflow.nextChapter();
        } else {
          gameflow.nextNode();
        }
        this.nextStep();
      }, t).start();
    }
  }

  showHumanityPopup(delta) {
    if (!this.humanityPopup) {
      this.humanityPopup = document.createElement('humanity-popup');
      document.body.appendChild(this.humanityPopup);
    }
    this.humanityPopup.show(delta);
  }

  async renderCameraEvent(node) {
      // Always speak the camera event prompt
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      speak(node.text, gameflow.getCurrentChapter().aiMood || 'neutral');
    if (!this.state.cameraEnabled || !this.state.cameraStream) {
      // Camera not enabled, skip node
      gameflow.nextNode();
      this.nextStep();
      return;
    }
    // Show camera feed and run emotion detection for node.duration ms
    this.root.innerHTML = `
      <div class="ayh-camera-event">
        <div class="ayh-prompt">${node.text}</div>
        <video id="camera-event-video" width="240" height="180" autoplay muted playsinline style="border-radius:8px;border:1px solid #ccc;"></video>
        <div id="emotion-debug" style="margin-top:0.5em;font-size:1.1em;color:#444;"></div>
      </div>
    `;
    const video = this.root.querySelector('#camera-event-video');
    const emotionDebug = this.root.querySelector('#emotion-debug');
    video.srcObject = this.state.cameraStream;
    await new Promise(r => video.onloadedmetadata = r);
    // Load face-api if not loaded
    await loadFaceApi();
    // Run emotion detection for node.duration ms
    let detectedEmotion = 'neutral';
    let running = true;
    const detect = async () => {
      if (!running) return;
      try {
        const emotion = await detectEmotion(video);
        if (emotion && emotion !== 'unknown') detectedEmotion = emotion;
        if (emotionDebug) emotionDebug.textContent = `Detected emotion: ${detectedEmotion}`;
      } catch {}
      if (running) setTimeout(detect, 1000);
    };
    detect();
    setTimeout(() => {
      running = false;
      // Find matching expression in node.expressions
      let mock = null;
      if (node.expressions && Array.isArray(node.expressions)) {
        let exprObj = node.expressions.find(e => e.expression === detectedEmotion);
        if (!exprObj) exprObj = node.expressions.find(e => e.expression === 'neutral');
        if (exprObj) mock = exprObj.mock;
      }
      this.root.innerHTML = `<div class=\"ayh-prompt\">${mock || '...'} </div><button id=\"next-btn\">Next</button>`;
      speak(mock || '', gameflow.getCurrentChapter().aiMood || 'neutral');
      this.root.querySelector('#next-btn').onclick = () => {
        gameflow.nextNode();
        this.nextStep();
      };
    }, node.duration || 5000);
    // Do NOT stop or nullify the camera stream here; keep it alive for future events
  }

  renderTextInput(node) {
    // Special handling for shoe size, age, and name input
    if (node.memoryKey === 'shoeSize') {
      this.root.innerHTML = `
        <div class="ayh-question">
          <div class="ayh-prompt">${node.text}</div>
          <input id="answer-input" type="number" min="30" max="50" autocomplete="off" style="width:80px;" />
          <button id="submit-btn">Submit</button>
          <button id="why-btn" type="button">Why?</button>
          <div id="error-msg" style="color:red;display:none;"></div>
        </div>
      `;
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      speak(node.text, gameflow.getCurrentChapter().aiMood || 'neutral');
      this.root.querySelector('#why-btn').onclick = () => {
        // Find the 'why' reaction
        const reaction = node.reactions && node.reactions.find(r => r.condition === 'why');
        if (reaction) {
          this.humanity -= 10; // Decrease humanity by 10
          this.root.innerHTML = `<div class="ayh-prompt">${reaction.text} <span style='color:#c00;'>(- humanity)</span></div><button id="next-btn">Next</button>`;
          this.root.querySelector('#next-btn').onclick = () => {
            gameflow.nextNode();
            this.nextStep();
          };
          speak(reaction.text, gameflow.getCurrentChapter().aiMood || 'neutral');
        } else {
          // If no reaction, just go to next node
          gameflow.nextNode();
          this.nextStep();
        }
      };
    } else if (node.memoryKey === 'age') {
      this.root.innerHTML = `
        <div class="ayh-question">
          <div class="ayh-prompt">${node.text}</div>
          <input id="answer-input" type="number" min="1" max="120" autocomplete="off" style="width:80px;" />
          <button id="submit-btn">Submit</button>
          <div id="error-msg" style="color:red;display:none;"></div>
        </div>
      `;
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      speak(node.text, gameflow.getCurrentChapter().aiMood || 'neutral');
    } else if (node.memoryKey === 'name') {
      this.root.innerHTML = `
        <div class="ayh-question">
          <div class="ayh-prompt">${node.text}</div>
          <input id="answer-input" type="text" autocomplete="off" />
          <button id="submit-btn">Submit</button>
          <div id="error-msg" style="color:red;display:none;"></div>
        </div>
      `;
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      speak(node.text, gameflow.getCurrentChapter().aiMood || 'neutral');
    } else {
      this.root.innerHTML = `
        <div class="ayh-question">
          <div class="ayh-prompt">${node.text}</div>
          <input id="answer-input" type="text" autocomplete="off" />
          <button id="submit-btn">Submit</button>
          <div id="error-msg" style="color:red;display:none;"></div>
        </div>
      `;
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      speak(node.text, gameflow.getCurrentChapter().aiMood || 'neutral');
    }
    this.root.querySelector('#submit-btn').onclick = async () => {
      const answer = this.root.querySelector('#answer-input').value;
      if (!answer.trim()) {
        this.root.querySelector('#error-msg').textContent = 'Please enter an answer.';
        this.root.querySelector('#error-msg').style.display = 'block';
        return;
      }
      // Store in memory if needed
      if (node.memoryKey) gameflow.setMemory(node.memoryKey, answer);
      // Handle unlocks
      if (node.unlock) gameflow.unlock(node.unlock);
      // Handle reactions for shoe size and number question
      let reactionText = null;
      if (node.reactions) {
        let reaction = null;
        if (/why/i.test(answer)) reaction = node.reactions.find(r => r.condition === 'why');
        else if (/no/i.test(answer)) reaction = node.reactions.find(r => r.condition === 'no');
        else if (node.memoryKey === 'shoeSize') {
          const num = parseFloat(answer);
          if (!isNaN(num)) {
            if (num >= 35 && num <= 46) reaction = node.reactions.find(r => r.condition === 'range');
            else {
              reaction = node.reactions.find(r => r.condition === 'outOfRange');
              this.humanity -= 9;
            }
          }
        } else if (node.id === 'c3_choose_number') {
          // GDD: 7 = "Of course. Almost everyone chooses 7." (humanity -1)
          //      3 or 5 = "boring." (humanity 0)
          //      else = "Unexpected. I like that." (humanity +1)
          const num = parseInt(answer, 10);
          if (!isNaN(num)) {
            if (num === 7) {
              reaction = node.reactions.find(r => r.condition === '7');
              if (reaction && reaction.score && reaction.score.humanity !== undefined) {
                 this.humanity += reaction.score.humanity;
              }
            } else if (num === 3 || num === 5) {
              reaction = node.reactions.find(r => r.condition === '3or5');
              if (reaction && reaction.score && reaction.score.humanity !== undefined) {
                 this.humanity += reaction.score.humanity;
              }
            } else {
              reaction = node.reactions.find(r => r.condition === 'other');
              if (reaction && reaction.score && reaction.score.humanity !== undefined) {
                 this.humanity += reaction.score.humanity;
              }
            }
          }
          if (reaction) {
            reactionText = reaction.text;
          }
        } else if (node.id === 'c3_finish_sentence') {
          // GDD: short = "That’s… disappointingly brief." (humanity -1)
          //      long = "Like yapping huh? Humans do that." (humanity +1)
          // Use 20 chars as threshold for short/long
          const threshold = 20;
          if (answer.length < threshold) {
            reaction = node.reactions.find(r => r.condition === 'short');
            if (reaction && reaction.score && reaction.score.humanity !== undefined) {
               this.humanity += reaction.score.humanity;
            }
          } else {
            reaction = node.reactions.find(r => r.condition === 'long');
            if (reaction && reaction.score && reaction.score.humanity !== undefined) {
               this.humanity += reaction.score.humanity;
            }
          }
          if (reaction) {
            reactionText = reaction.text;
          }
        }
        if (reaction) {
          reactionText = reaction.text;
        }
      }
      // Special handling for age
      if (node.memoryKey === 'age') {
        const num = parseInt(answer, 10);
        if (isNaN(num) || num < 15) {
          this.humanity -= 10;
          reactionText = 'Too young.';
        } else if (num > 35) {
          this.humanity -= 10;
          reactionText = 'Too old.';
        }
      }
      // Special handling for name
      if (node.memoryKey === 'name') {
        const basicNames = [
          'bjoern', 'björn', 'finn', 'viviane', 'anna', 'max', 'lisa', 'paul', 'sophie', 'ben', 'lena', 'tim', 'mia', 'jan', 'tom', 'leo', 'emil', 'luca', 'nina', 'emma', 'noah', 'luis', 'jonas', 'laura', 'julia', 'marie', 'leon', 'sarah', 'johanna', 'philipp', 'moritz', 'hannah', 'jannik', 'julian', 'niclas', 'simon', 'lukas', 'marcel', 'kevin', 'daniel', 'alex', 'alexander', 'sandra', 'sven', 'sina', 'saskia', 'sarah', 'sabrina', 'sandra', 'sandra', 'sandra', 'sandra'
        ];
        const normalized = answer.trim().toLowerCase();
        if (basicNames.some(n => normalized.includes(n))) {
          this.humanity -= 10;
          reactionText = 'Name too basic.';
        }
      }
      // Always show AI response (scripted or dynamic) before advancing
      const context = {
        chapter: gameflow.getCurrentChapter(),
        question: node
      };
      const inputArr = [
        ...this.state.answers,
        { value: answer }
      ];
      if (reactionText) {
        // Always show scripted response
        const aiResponse = reactionText;
        this.root.innerHTML = `<div class=\"ayh-prompt\">${aiResponse}</div><button id=\"next-btn\">Next</button>`;
        speak(aiResponse, gameflow.getCurrentChapter().aiMood || 'neutral');
        this.root.querySelector('#next-btn').onclick = () => {
          gameflow.nextNode();
          this.nextStep();
        };
      } else if (Math.random() < 0.15) {
        // 15% chance to show AI response if not scripted
        const aiResponse = await getAIResponse(inputArr, context);
        this.root.innerHTML = `<div class=\"ayh-prompt\">${aiResponse}</div><button id=\"next-btn\">Next</button>`;
        speak(aiResponse, gameflow.getCurrentChapter().aiMood || 'neutral');
        this.root.querySelector('#next-btn').onclick = () => {
          gameflow.nextNode();
          this.nextStep();
        };
      } else {
        // No response, just advance
        gameflow.nextNode();
        this.nextStep();
      }
    };
  }

  renderRandomPool(node) {
    // Pick a random question from the pool and render as a node
    const pool = node.pool || [];
    if (pool.length === 0) {
      gameflow.nextNode();
      this.nextStep();
      return;
    }
    const randomIdx = Math.floor(Math.random() * pool.length);
    const randomNode = pool[randomIdx];
    // Render as if it were a normal node
    if (randomNode.type === 'multiple_choice') {
      this.renderMultipleChoice(randomNode);
    } else if (randomNode.type === 'text_input') {
      this.renderTextInput(randomNode);
    } else {
      // Fallback
      this.root.innerHTML = `<div>Unknown random pool node type: ${randomNode.type}</div><button id="next-btn">Next</button>`;
      this.root.querySelector('#next-btn').onclick = () => {
        gameflow.nextNode();
        this.nextStep();
      };
    }
    // After answering, advance the main node
    // (Handled in the submit of the rendered node)
  }

  renderScriptedEvent(node) {
    this.root.innerHTML = `
      <div class="ayh-scripted-event">
        <div>${node.text}</div>
        <button id="next-btn">Next</button>
      </div>
    `;
    // Cancel any ongoing speech and TTS for event
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    speak(node.text, gameflow.getCurrentChapter().aiMood || 'neutral');
    this.root.querySelector('#next-btn').onclick = () => {
      gameflow.nextNode();
      this.nextStep();
    };
  }

  renderMultipleChoice(node) {
    // Handle repeat logic for looped questions
    const repeatCount = gameflow.state.repeatCount;
    this.root.innerHTML = `
      <div class="ayh-question">
        <div class="ayh-prompt">${node.text}</div>
        <div id="mc-options">
          ${node.options.map(opt => `
            <label><input type="radio" name="mc" value="${opt.id}"> ${opt.text}</label><br>
          `).join('')}
        </div>
        <button id="submit-btn">Submit</button>
        <div id="error-msg" style="color:red;display:none;"></div>
      </div>
    `;
    // Cancel any ongoing speech and TTS for question only
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    speak(node.text, gameflow.getCurrentChapter().aiMood || 'neutral');
    this.root.querySelector('#submit-btn').onclick = async () => {
      const selected = this.root.querySelector('input[name="mc"]:checked');
      if (selected) {
        const opt = node.options.find(o => o.id === selected.value);
        // Handle repeat for looped question
        if (opt.repeat) {
          gameflow.repeatNode();
          // If repeat limit reached, maybe show hostile response
          if (node.repeatLimit && gameflow.state.repeatCount >= node.repeatLimit) {
            if (Math.random() < (node.hostileChanceAfterRepeat || 0)) {
              this.root.innerHTML = `<div class="ayh-prompt">Fine. Have it your way.</div><button id="next-btn">Next</button>`;
              this.root.querySelector('#next-btn').onclick = () => {
                gameflow.nextNode();
                this.nextStep();
              };
              return;
            }
          }
          // Otherwise, repeat node
          this.nextStep();
          return;
        }
        // Handle unlocks
        if (opt.unlock) gameflow.unlock(opt.unlock);
        // Handle continue/end
        if (opt.end) {
          this.root.innerHTML = `<div class="ayh-prompt">${node.endText || 'Farewell.'}</div>`;
          gameflow.state.ended = true;
          setTimeout(() => this.renderResult(), 1200);
          return;
        }
        // Always show AI response (scripted or dynamic) before advancing
        const context = {
          chapter: gameflow.getCurrentChapter(),
          question: node
        };
        const inputArr = [
          ...this.state.answers,
          { value: opt.id }
        ];
        if (opt.mock) {
          // Always show scripted response
          const aiResponse = opt.mock;
          this.root.innerHTML = `<div class=\"ayh-prompt\">${aiResponse}</div><button id=\"next-btn\">Next</button>`;
          speak(aiResponse, gameflow.getCurrentChapter().aiMood || 'neutral');
          this.root.querySelector('#next-btn').onclick = () => {
            gameflow.nextNode();
            this.nextStep();
          };
        } else if (Math.random() < 0.15) {
          // 15% chance to show AI response if not scripted
          const aiResponse = await getAIResponse(inputArr, context);
          this.root.innerHTML = `<div class=\"ayh-prompt\">${aiResponse}</div><button id=\"next-btn\">Next</button>`;
          speak(aiResponse, gameflow.getCurrentChapter().aiMood || 'neutral');
          this.root.querySelector('#next-btn').onclick = () => {
            gameflow.nextNode();
            this.nextStep();
          };
        } else {
          // No response, just advance
          gameflow.nextNode();
          this.nextStep();
        }
      } else {
        this.root.querySelector('#error-msg').textContent = 'Please select an option.';
        this.root.querySelector('#error-msg').style.display = 'block';
      }
    };
  }
  // (removed obsolete renderMinigame(question) that remembered right answer)

  renderQuestion(question) {
    // Support custom memory keys for answers
    const memoryKey = question.memoryKey;
    // Speak the question prompt using current AI mood
    let aiMood = "robot";
    if (typeof window.pickReactionStyle === 'function') {
      aiMood = window.pickReactionStyle();
    } else if (window._lastAIReactionStyle) {
      aiMood = window._lastAIReactionStyle;
    }
    speak(t(question.prompt), aiMood);
    if (question.type === 'multiple_choice') {
      this.root.innerHTML = `
        <div class="ayh-question">
          <div class="ayh-prompt">${t(question.prompt)}</div>
          <div id="mc-options">
            ${question.options.map(opt => `
              <label><input type="radio" name="mc" value="${opt}"> ${t(opt)}</label><br>
            `).join('')}
          </div>
          <button id="submit-btn">Submit</button>
          <div id="error-msg" style="color:red;display:none;"></div>
        </div>
      `;
      this.root.querySelector('#submit-btn').onclick = async () => {
        const selected = this.root.querySelector('input[name="mc"]:checked');
        if (selected) {
          const timeTaken = Date.now() - this.state.questionStartTime;
          const answerObj = { value: selected.value, timeTaken };
          if (memoryKey) answerObj[memoryKey] = selected.value;
          // Always attach latest emotion if available and camera enabled
          if (this.state.cameraEnabled && this.state.latestEmotion) answerObj.emotion = this.state.latestEmotion;
          this.state.answers.push(answerObj);
          await this.showAIResponse(answerObj);
        } else {
          this.root.querySelector('#error-msg').textContent = 'Please select an option.';
          this.root.querySelector('#error-msg').style.display = 'block';
        }
      };
    } else if (question.type === 'camera') {
      // ...existing code for camera question...
    } else {
      this.root.innerHTML = `
        <div class="ayh-question">
          <div class="ayh-prompt">${t(question.prompt)}</div>
          <input id="answer-input" type="text" autocomplete="off" />
          <button id="submit-btn">Submit</button>
          <div id="error-msg" style="color:red;display:none;"></div>
        </div>
      `;
      this.root.querySelector('#submit-btn').onclick = async () => {
        const answer = this.root.querySelector('#answer-input').value;
        if (!answer.trim()) {
          this.root.querySelector('#error-msg').textContent = 'Please enter an answer.';
          this.root.querySelector('#error-msg').style.display = 'block';
          return;
        }
        const timeTaken = Date.now() - this.state.questionStartTime;
        const answerObj = { value: answer, timeTaken };
        if (memoryKey) answerObj[memoryKey] = answer;
        // Always attach latest emotion if available and camera enabled
        if (this.state.cameraEnabled && this.state.latestEmotion) answerObj.emotion = this.state.latestEmotion;
        this.state.answers.push(answerObj);
        await this.showAIResponse(answerObj);
      };
    }
  }
  async showAIResponse(answerObj) {
    // Show AI response for the last answer, then allow user to proceed
    const currentQuestion = this.state.questions[this.state.currentStep];
    const currentChapter = gameflow.getCurrentChapter && gameflow.getCurrentChapter();
    const aiContext = { ...this.state.aiContext, question: currentQuestion, chapter: currentChapter };
    const aiResponse = await getAIResponse(this.state.answers, aiContext);
    // Try to get the current AI reaction style for TTS mood
    let aiMood = "robot";
    if (typeof window.pickReactionStyle === 'function') {
      aiMood = window.pickReactionStyle();
    } else if (window._lastAIReactionStyle) {
      aiMood = window._lastAIReactionStyle;
    }
    this.root.innerHTML = `
      <div class="ayh-ai-response">
        <div>${aiResponse}</div>
        <button id="next-btn">Next</button>
      </div>
    `;
    speak(aiResponse, aiMood);
    this.root.querySelector('#next-btn').onclick = () => {
      this.state.currentStep++;
      this.nextStep();
    };
  }

  async renderResult() {
    // Save run to memory
    addRun({
      answers: this.state.answers,
      score: 0, // Optionally compute real score
      cameraEnabled: this.state.cameraEnabled,
      humanity: this.humanity
    });
    this.state.memory = getMemory();
    const aiResponse = await getAIResponse(this.state.answers, { ...this.state.aiContext, memory: this.state.memory });
    let aiMood = "robot";
    if (typeof window.pickReactionStyle === 'function') {
      aiMood = window.pickReactionStyle();
    } else if (window._lastAIReactionStyle) {
      aiMood = window._lastAIReactionStyle;
    }
    speak(aiResponse, aiMood);
    // Humanity-only end screen
    const humanity = Math.max(0, Math.min(100, this.humanity));
    let verdict = '';
    if (humanity >= 85) verdict = 'You are suspiciously human.';
    else if (humanity >= 60) verdict = 'You pass. For now.';
    else if (humanity >= 40) verdict = 'You are on the edge.';
    else verdict = 'You are not human enough.';
    this.root.innerHTML = `
      <div class="ayh-result">
        <h2>${t('analysisComplete')}</h2>
        <div>${aiResponse}</div>
        <div style="margin:2em 0 1em 0;">
          <div style="font-size:1.3em;margin-bottom:0.5em;">Humanity: <b>${humanity}</b> / 100</div>
          <div style="background:#eee;border-radius:1em;height:28px;width:100%;max-width:340px;margin:0 auto;overflow:hidden;">
            <div style="background:#4caf50;height:100%;width:${humanity}%;transition:width 1s;"></div>
          </div>
          <div style="margin-top:1.2em;font-size:1.1em;color:#444;">${verdict}</div>
        </div>
        <button id="restart-btn" style="margin-top:2em;">Restart</button>
      </div>
    `;
    this.root.querySelector('#restart-btn').onclick = async () => {
      this.state.currentStep = 0;
      this.state.answers = [];
      this.state.memory = getMemory();
      await gameflow.init();
      this.renderIntro();
    };
  }
    }

