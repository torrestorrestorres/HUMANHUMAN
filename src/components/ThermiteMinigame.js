// ThermiteMinigame.js
// Web component version of the Thermite memory minigame
import { showMinigameIntro, showMinigameOutro } from './intro.js';

class ThermiteMinigame extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.gridSize = 4;
    this.totalBlocks = 16;
    this.correctBlocksNum = 6;
    this.maxIncorrectBlocksNum = 2;
    this.timeBlocksShows = 4.5;
    this.gridCorrectBlocks = [];
    this.activateClicking = false;
    this.result = null;
  }

  async connectedCallback() {
    await showMinigameIntro();
    this.render();
    this.restartGame();
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
      .grid {
        margin: 20px auto;
        width: 480px;
        height: 480px;
        background: #2D3139;
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        grid-template-rows: repeat(4, 1fr);
        gap: 20px;
        padding: 10px;
      }
      .grid.won .block { background: #008d00; }
      .grid.lost .block { background: #F22300; }
      .block {
        background: #131313;
        width: 100%;
        height: 100%;
        border-radius: 2px;
        cursor: pointer;
        transition: background 0.2s;
      }
      .block.show, .block.correct { background: #d6d6d6; }
      .block.incorrect { background: #800000; }
      .grid.lost .show.block { background: #6d9070; }
      .grid.lost .block { background: #bd5151; }
      .grid.lost .block.clicked.incorrect { background: #F22300; }
      .grid.lost .block.clicked.correct { background: #bfbfbf; }
      .restart-button {
        display: block;
        padding: 12px 60px;
        background: #394D61;
        color: white;
        margin-top: 30px;
        font-weight: bold;
        font-size: 18px;
        cursor: pointer;
      }
      .end-message {
        text-align: center;
        font-size: 2rem;
        color: #fff;
        margin-top: 20px;
        min-height: 2.5em;
      }
    `;
    this.shadowRoot.appendChild(style);
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';
    // Grid
    this.grid = document.createElement('div');
    this.grid.className = 'grid';
    for (let i = 1; i <= this.totalBlocks; i++) {
      const block = document.createElement('div');
      block.className = `block block-${i}`;
      block.addEventListener('click', (e) => this.onBlockClick(e));
      this.grid.appendChild(block);
    }
    container.appendChild(this.grid);
    // End message
    this.endMessage = document.createElement('div');
    this.endMessage.className = 'end-message';
    container.appendChild(this.endMessage);
    // (Restart button removed)
    this.shadowRoot.appendChild(container);
  }

  generateRandomNumberBetween(min = 1, max = this.totalBlocks, length = this.correctBlocksNum) {
    const arr = [];
    while (arr.length < length) {
      const r = Math.floor(Math.random() * (max + 1 - min)) + min;
      if (!arr.includes(r)) arr.push(r);
    }
    return arr;
  }

  onBlockClick(e) {
    if (!this.activateClicking) return;
    const clickedBlock = e.target;
    const blockNum = Number(clickedBlock.className.match(/block-(\d+)/)[1]);
    const correct = this.gridCorrectBlocks.includes(blockNum);
    clickedBlock.classList.add('clicked');
    if (correct) {
      clickedBlock.classList.remove('incorrect');
      clickedBlock.classList.add('correct');
    } else {
      clickedBlock.classList.add('incorrect');
      clickedBlock.classList.remove('correct');
    }
    this.checkWinOrLost();
  }

  showCorrectBlocks() {
    this.grid.querySelectorAll('.block').forEach(ele => {
      const blockNum = Number(ele.className.match(/block-(\d+)/)[1]);
      if (this.gridCorrectBlocks.includes(blockNum)) {
        ele.classList.add('show');
      }
    });
  }

  hideAllBlocks() {
    this.grid.querySelectorAll('.block').forEach(ele => {
      ele.classList.remove('show', 'correct', 'incorrect', 'clicked');
    });
  }

  restartGame() {
    this.grid.classList.remove('won', 'lost');
    this.hideAllBlocks();
    this.gridCorrectBlocks = this.generateRandomNumberBetween();
    this.activateClicking = false;
    this.endMessage.textContent = '';
    this.showCorrectBlocks();
    setTimeout(() => {
      this.hideAllBlocks();
      this.activateClicking = true;
    }, this.timeBlocksShows * 1000);
  }

  checkWinOrLost() {
    if (this.isGameWon()) {
      this.grid.classList.add('won');
      this.activateClicking = false;
      this.endMessage.textContent = 'You Win!';
      setTimeout(() => this.finishGame('win'), 1200);
      return 'won';
    }
    if (this.isGameLost()) {
      this.grid.classList.add('lost');
      this.showCorrectBlocks();
      this.activateClicking = false;
      this.endMessage.textContent = 'You Lose!';
      setTimeout(() => this.finishGame('lose'), 1200);
      return 'lost';
    }
  }

  isGameWon() {
    return this.grid.querySelectorAll('.correct').length >= this.correctBlocksNum;
  }
  isGameLost() {
    return this.grid.querySelectorAll('.incorrect').length >= this.maxIncorrectBlocksNum;
  }

  finishGame(result) {
    // Humanity delta: +2 for win, -2 for loss
    let humanityDelta = 0;
    if (result === 'win') humanityDelta = 2;
    else if (result === 'lose') humanityDelta = -2;
    this.dispatchEvent(new CustomEvent('minigame-complete', {
      detail: {
        score: humanityDelta,
        result,
        correctBlocks: this.gridCorrectBlocks
      },
      bubbles: true,
      composed: true
    }));
    showMinigameOutro(result === 'win');
  }
}

customElements.define('thermite-minigame', ThermiteMinigame);
