// isHumanMinigame.js
// Web component version of the isHuman minigame, using intro/outro from intro.js
import { showMinigameIntro, showMinigameOutro } from './intro.js';
import { distortImage } from './imageDistortion.js';
import { aiFeedbackPoolFalse, aiFeedbackPoolTrue } from './aiFeedbackPool.js';

class IsHumanMinigame extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.images = [];
    this.currentIndex = 0;
    this.results = [];
    this.cameraImage = null;
    this.roundSize = 15;
  }

  async connectedCallback() {
    await showMinigameIntro();
    await this.loadImages();
    this.cameraImage = await this.captureCameraImage();
    this.shuffleImages();
    this.renderCurrentImage();
  }

  async loadImages() {
    // Load 15 random images from assets/humans and assets/notHumans
    const humanList = await this.fetchImageList('humans');
    const notHumanList = await this.fetchImageList('notHumans');
    const pool = [];
    for (let i = 0; i < this.roundSize / 2; i++) {
      pool.push({ src: humanList[i % humanList.length], isHuman: true });
      pool.push({ src: notHumanList[i % notHumanList.length], isHuman: false });
    }
    this.images = pool;
  }

  async fetchImageList(folder) {
    // Use the correct naming convention: human${num}.png
    const files = [];
    for (let i = 1; i <= folder.length; i++) {
      files.push(`/assets/${folder}/${i}.png`);
    }
    return files;
  }

  async captureCameraImage() {
    // Use camera to capture image and return a data URL
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.autoplay = true;
      video.width = 300;
      video.height = 300;
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          video.srcObject = stream;
          video.onloadedmetadata = () => {
            setTimeout(() => {
              const canvas = document.createElement('canvas');
              canvas.width = 300;
              canvas.height = 300;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(video, 0, 0, 300, 300);
              // Stop the camera
              stream.getTracks().forEach(track => track.stop());
              resolve(canvas.toDataURL('image/png'));
            }, 1000); // Wait a moment for camera to adjust
          };
        })
        .catch(reject);
    });
  }

  shuffleImages() {
    for (let i = this.images.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.images[i], this.images[j]] = [this.images[j], this.images[i]];
    }
    // Insert camera image at the end
    if (this.cameraImage) {
      this.images.push({ src: this.cameraImage, isHuman: false, isCamera: true });
    }
  }

  renderCurrentImage() {
    const imgObj = this.images[this.currentIndex];
    this.shadowRoot.innerHTML = '';
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';
    container.style.gap = '16px';

    // Image/canvas area
    const imageArea = document.createElement('div');
    imageArea.style.display = 'flex';
    imageArea.style.justifyContent = 'center';
    imageArea.style.alignItems = 'center';
    imageArea.style.width = '100%';

    const img = document.createElement('img');
    img.src = imgObj.src;
    img.width = 300;
    img.height = 300;
    img.onload = () => {
      // Distortion increases with each image
      const progress = this.currentIndex / (this.images.length - 1);
      const noiseLevel = 0.05 + 0.5 * progress;      // 0.05 to 0.55
      const pixelateLevel = 0.05 + 0.25 * progress;   // 0.05 to 0.3
      const morphLevel = 0.01 + 0.15 * progress;      // 0.01 to 0.16
      // Draw image to canvas first, then apply distortion
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, 300, 300);
      // Now apply distortion to the canvas
      const distorted = distortImage(canvas, {
        noiseLevel,
        pixelateLevel,
        morphLevel
      });
      imageArea.appendChild(distorted);
    };
    img.style.display = 'block';
    img.style.visibility = 'hidden';
    imageArea.appendChild(img);
    container.appendChild(imageArea);

    // Button row
    const buttonRow = document.createElement('div');
    buttonRow.style.display = 'flex';
    buttonRow.style.flexDirection = 'row';
    buttonRow.style.justifyContent = 'center';
    buttonRow.style.gap = '16px';

    const btnHuman = document.createElement('button');
    btnHuman.textContent = 'Human';
    btnHuman.onclick = () => this.handleGuess(true);
    const btnNotHuman = document.createElement('button');
    btnNotHuman.textContent = 'Not Human';
    btnNotHuman.onclick = () => this.handleGuess(false);
    buttonRow.appendChild(btnHuman);
    buttonRow.appendChild(btnNotHuman);
    container.appendChild(buttonRow);

    this.shadowRoot.appendChild(container);
  }

  handleGuess(guess) {
    const imgObj = this.images[this.currentIndex];
    // User must guess the opposite: humans should be marked as not human, notHumans as human, camera as not human
    let correct;
    if (imgObj.isCamera) {
      // Camera image should be marked as not human (so correct if guess is false)
      correct = (guess === false);
    } else {
      correct = (imgObj.isHuman && !guess) || (!imgObj.isHuman && guess);
    }
    this.results.push({
      index: this.currentIndex,
      correct,
      isCamera: imgObj.isCamera || false
    });
    this.showFeedback(correct);
    setTimeout(() => {
      this.currentIndex++;
      if (this.currentIndex < this.images.length) {
        this.renderCurrentImage();
      } else {
        this.finishGame();
      }
    }, 1200);
  }

  showFeedback(correct) {
    let msg;
    if (correct) {
      msg = aiFeedbackPoolTrue[Math.floor(Math.random() * aiFeedbackPoolTrue.length)];
    } else {
      msg = aiFeedbackPoolFalse[Math.floor(Math.random() * aiFeedbackPoolFalse.length)];
    }
    const feedback = document.createElement('div');
    feedback.textContent = msg;
    this.shadowRoot.appendChild(feedback);
    // Speak feedback aloud
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utter = new window.SpeechSynthesisUtterance(msg);
      window.speechSynthesis.speak(utter);
    }
  }

  finishGame() {
    // Humanity delta: +2 for each correct, -2 for each wrong
    const correct = this.results.filter(r => r.correct).length;
    const wrong = this.results.length - correct;
    const humanityDelta = correct * 2 - wrong * 2;
    this.dispatchEvent(new CustomEvent('minigame-complete', {
      detail: {
        score: humanityDelta,
        results: this.results
      },
      bubbles: true,
      composed: true
    }));
    showMinigameOutro(correct >= this.results.length / 2);
  }
}

customElements.define('is-human-minigame', IsHumanMinigame);
