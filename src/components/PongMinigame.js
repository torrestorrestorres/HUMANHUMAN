// PongMinigame.js
// Web component version of Pong, integrated with minigame system
import { showMinigameIntro, showMinigameOutro } from './intro.js';

class PongMinigame extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.score = 0;
    this.score2 = 0;
    this.Winningscore = 3;
    this.gameEnded = false;
    this.canvas = null;
    this.ctx = null;
    this.animationFrame = null;
    // Game state
    this.ballX = 75;
    this.ballY = 75;
    this.ballSpeedX = 5;
    this.ballSpeedY = 2;
    this.paddle1Y = 100;
    this.paddle1X = 10;
    this.paddle2Y = 100;
    this.paddle2X = 790;
    this.PADDLE_HEIGHT = 100;
    this.PADDLE_THICKNESS = 10;
    this.ComputerYspeed = 6;
    this.ShowingWinscreen = false;
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseClick = this.handleMouseClick.bind(this);
  }

  async connectedCallback() {
    await showMinigameIntro();
    this.render();
    this.startGame();
  }

  disconnectedCallback() {
    this.stopGame();
    if (this.canvas) {
      this.canvas.removeEventListener('mousemove', this.handleMouseMove);
      this.canvas.removeEventListener('mousedown', this.handleMouseClick);
    }
  }

  render() {
    this.shadowRoot.innerHTML = '';
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';
    container.style.gap = '16px';
    // Add style to hide cursor on canvas
    const style = document.createElement('style');
    style.textContent = `canvas { cursor: none !important; }`;
    this.shadowRoot.appendChild(style);
    this.canvas = document.createElement('canvas');
    this.canvas.width = 800;
    this.canvas.height = 600;
    this.canvas.style.border = '2px solid #fff';
    container.appendChild(this.canvas);
    this.shadowRoot.appendChild(container);
    this.ctx = this.canvas.getContext('2d');
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('mousedown', this.handleMouseClick);
  }

  startGame() {
    this.resetGame();
    this.gameEnded = false;
    this.loop();
  }

  stopGame() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  resetGame() {
    this.score = 0;
    this.score2 = 0;
    this.ballX = 75;
    this.ballY = 75;
    this.ballSpeedX = 5;
    this.ballSpeedY = 2;
    this.paddle1Y = 100;
    this.paddle2Y = 100;
    this.ShowingWinscreen = false;
  }

  handleMouseMove(evt) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseY = evt.clientY - rect.top;
    this.paddle1Y = mouseY - this.PADDLE_HEIGHT / 2;
  }

  handleMouseClick(evt) {
    if (this.ShowingWinscreen) {
      this.resetGame();
      this.ShowingWinscreen = false;
      this.gameEnded = false;
      this.loop();
    }
  }

  loop() {
    this.moveEverything();
    this.drawEverything();
    if (!this.gameEnded) {
      this.animationFrame = requestAnimationFrame(() => this.loop());
    }
  }

  moveComputerPaddle() {
    if (this.paddle2Y + this.PADDLE_HEIGHT / 2 < this.ballY - 30) {
      this.paddle2Y += this.ComputerYspeed;
    } else if (this.paddle2Y + this.PADDLE_HEIGHT / 2 > this.ballY + 30) {
      this.paddle2Y -= this.ComputerYspeed;
    }
  }

  moveEverything() {
    if (this.ShowingWinscreen) return;
    this.moveComputerPaddle();
    this.ballX += this.ballSpeedX;
    this.ballY += this.ballSpeedY;
    if (this.ballX > this.canvas.width) {
      this.ballSpeedX *= -1;
    }
    if (this.ballX < 0) {
      this.ballSpeedX *= -1;
    }
    if (this.ballY > this.canvas.height) {
      this.ballSpeedY *= -1;
    }
    if (this.ballY < 0) {
      this.ballSpeedY *= -1;
    }
    if (this.ballX < this.paddle1X + this.PADDLE_THICKNESS) {
      if (this.ballY > this.paddle1Y && this.ballY < this.paddle1Y + this.PADDLE_HEIGHT) {
        this.ballSpeedX = -this.ballSpeedX;
        const deltaY = this.ballY - (this.paddle1Y + this.PADDLE_HEIGHT / 2);
        this.ballSpeedY = deltaY * 0.20;
      } else {
        this.score2 += 1;
        this.ballReset();
      }
    }
    if (this.ballX > this.canvas.width - this.PADDLE_THICKNESS * 2) {
      if (this.ballY > this.paddle2Y && this.ballY < this.paddle2Y + this.PADDLE_HEIGHT) {
        this.ballSpeedX = -this.ballSpeedX;
        const delta2Y = this.ballY - (this.paddle2Y + this.PADDLE_HEIGHT / 2);
        this.ballSpeedY = delta2Y * 0.20;
      } else {
        this.score += 1;
        this.ballReset();
      }
    }
    if (this.score >= this.Winningscore || this.score2 >= this.Winningscore) {
      this.ShowingWinscreen = true;
      this.gameEnded = true;
      setTimeout(() => this.finishGame(), 1200);
    }
  }

  ballReset() {
    this.ballSpeedX = -this.ballSpeedX;
    this.ballX = this.canvas.width / 2;
    this.ballY = this.canvas.height / 2;
  }

  drawNet() {
    for (let i = 0; i < this.canvas.height; i += 40) {
      this.colorRect(this.canvas.width / 2 - 1, i, 2, 20, 'white');
    }
  }

  drawEverything() {
    this.colorRect(0, 0, this.canvas.width, this.canvas.height, 'black');
    if (this.ShowingWinscreen) {
      this.ctx.fillStyle = 'white';
      if (this.score >= this.Winningscore) {
        this.ctx.fillText('Red Player won!', 355, 250);
      } else if (this.score2 >= this.Winningscore) {
        this.ctx.fillText('Blue Player won!', 355, 250);
      }
      this.ctx.fillText('Click to Play again', 350, 300);
      return;
    }
    this.drawNet();
    this.colorRect(this.paddle1X, this.paddle1Y, this.PADDLE_THICKNESS, this.PADDLE_HEIGHT, 'red');
    this.colorRect(this.canvas.width - this.PADDLE_THICKNESS * 2, this.paddle2Y, this.PADDLE_THICKNESS, this.PADDLE_HEIGHT, 'blue');
    this.colorCircle(this.ballX, this.ballY, 10, 'white');
    this.ctx.fillStyle = 'white';
    this.ctx.fillText('This game was made by Born228', 5, 595);
  }

  colorRect(x, y, w, h, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, w, h);
  }

  colorCircle(x, y, r, color) {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, r, 0, Math.PI * 2, true);
    this.ctx.fill();
  }

  finishGame() {
    // Humanity delta: +3 for win, -3 for loss
    let humanityDelta = 0;
    if (this.score >= this.Winningscore) humanityDelta = 3;
    else if (this.score2 >= this.Winningscore) humanityDelta = -3;
    this.dispatchEvent(new CustomEvent('minigame-complete', {
      detail: {
        score: humanityDelta,
        result: this.score >= this.Winningscore ? 'win' : 'lose',
        playerScore: this.score,
        aiScore: this.score2
      },
      bubbles: true,
      composed: true
    }));
    showMinigameOutro(this.score >= this.Winningscore);
  }
}

customElements.define('pong-minigame', PongMinigame);
