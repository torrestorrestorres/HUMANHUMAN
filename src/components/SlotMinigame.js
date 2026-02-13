// SlotMinigame.js
// Web component version of the slot machine minigame for integration
import { showMinigameIntro, showMinigameOutro } from './intro.js';

class SlotMinigame extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.symbols = ["🍉", "⭐", "7️⃣", "🍋", "🍒", "🔔", "🍀"];
    this.spinDuration = 1000;
    this.result = null;
    this.maxTries = 10;
    this.triesLeft = this.maxTries;
    this.totalWins = 0;
    this.totalLosses = 0;
    this.gameOver = false;
  }

  async connectedCallback() {
    await showMinigameIntro();
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = '';
    const style = document.createElement('style');
    style.textContent = `
    * {    
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        color: aliceblue;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #121212;
    }
      .slot-container {
        display: flex;
        gap: 20px;
        margin-bottom: 30px;
        justify-content: center;
      }
      .slot {
        width: 80px;
        height: 80px;
        border: 1px solid white;
        border-radius: 10px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 2.5rem;
        background: #222;
      }
      .spin-btn:active {
        background: #2D3139;
      }
      .result-message {
        text-align: center;
        font-size: 2rem;
        color: #fff;
        min-height: 2.5em;
        margin-bottom: 10px;
      }
      .tries-message {
        text-align: center;
        font-size: 1.2rem;
        color: #aaa;
        margin-bottom: 10px;
      }
    `;
    this.shadowRoot.appendChild(style);
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';
    // Tries message
    this.triesMessage = document.createElement('div');
    this.triesMessage.className = 'tries-message';
    container.appendChild(this.triesMessage);
    // Result message
    this.resultMessage = document.createElement('div');
    this.resultMessage.className = 'result-message';
    container.appendChild(this.resultMessage);
    // Slot row
    this.slotContainer = document.createElement('div');
    this.slotContainer.className = 'slot-container';
    this.slots = [];
    for (let i = 0; i < 3; i++) {
      const slot = document.createElement('div');
      slot.className = 'slot';
      slot.textContent = this.symbols[i];
      this.slots.push(slot);
      this.slotContainer.appendChild(slot);
    }
    container.appendChild(this.slotContainer);
    // Spin button
    this.spinBtn = document.createElement('button');
    this.spinBtn.className = 'spin-btn';
    this.spinBtn.textContent = 'Spin';
    this.spinBtn.addEventListener('click', () => this.spin());
    container.appendChild(this.spinBtn);
    this.shadowRoot.appendChild(container);
    this.updateTriesMessage();
  }

  spin() {
    if (this.gameOver) return;
    this.spinBtn.disabled = true;
    this.resultMessage.textContent = '';
    let finished = 0;
    let finalSymbols = [];
    this.triesLeft--;
    this.updateTriesMessage();
    this.slots.forEach((slot, i) => {
      this.spinSlot(slot, this.symbols, this.spinDuration, 30, 30, () => {
        finalSymbols[i] = slot.textContent;
        finished++;
        if (finished === this.slots.length) {
          this.spinBtn.disabled = false;
          this.showResult(finalSymbols);
        }
      });
    });
  }

  spinSlot(slot, symbols, duration, initialInterval, intervalStep, done) {
    let elapsed = 0;
    let interval = initialInterval;
    function spin() {
      const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
      slot.textContent = randomSymbol;
      elapsed += interval;
      interval += intervalStep;
      if (elapsed < duration) {
        setTimeout(spin, interval);
      } else {
        const finalSymbol = symbols[Math.floor(Math.random() * symbols.length)];
        slot.textContent = finalSymbol;
        if (done) done();
      }
    }
    spin();
  }

  showResult(finalSymbols) {
    let win = false;
    if (finalSymbols[0] === finalSymbols[1] && finalSymbols[1] === finalSymbols[2]) {
      win = true;
      this.resultMessage.textContent = 'You Win! 🎉';
      this.totalWins++;
    } else {
      this.resultMessage.textContent = 'Try Again!';
      this.totalLosses++;
    }
    if (this.triesLeft <= 0) {
      this.gameOver = true;
      this.spinBtn.disabled = true;
      setTimeout(() => this.finishGame(), 1200);
    }
  }

  finishGame() {
    // Humanity delta: +2 for any win, -2 if no wins
    let humanityDelta = this.totalWins > 0 ? 2 : -2;
    let result = this.totalWins > 0 ? 'win' : 'lose';
    this.resultMessage.textContent = this.totalWins > 0 ? `Game Over! You won ${this.totalWins}x 🎉` : 'Game Over! No wins.';
    this.updateTriesMessage();
    this.dispatchEvent(new CustomEvent('minigame-complete', {
      detail: {
        score: humanityDelta,
        result,
        wins: this.totalWins,
        losses: this.totalLosses
      },
      bubbles: true,
      composed: true
    }));
    showMinigameOutro(this.totalWins > 0);
  }

  updateTriesMessage() {
    if (this.triesMessage) {
      if (this.gameOver) {
        this.triesMessage.textContent = 'No tries left.';
      } else {
        this.triesMessage.textContent = `Tries left: ${this.triesLeft}`;
      }
    }
  }
}

customElements.define('slot-minigame', SlotMinigame);
