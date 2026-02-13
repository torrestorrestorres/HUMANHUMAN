// DinoRunMinigame.js
// Web component version of the Dino Run minigame for integration
import { showMinigameIntro, showMinigameOutro } from './intro.js';

class DinoRunMinigame extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.score = 0;
    this.gameOver = false;
  }

  async connectedCallback() {
    await showMinigameIntro();
    this.render();
    this.startGame();
  }

  render() {
    this.shadowRoot.innerHTML = '';
    const style = document.createElement('style');
    style.textContent = `
      canvas {
        border: 2px solid white;
        background: #121212;
        display: block;
        margin: 0 auto;
      }
      .score {
        color: #fff;
        font-size: 1.2rem;
        text-align: center;
        margin-bottom: 8px;
      }
    `;
    this.shadowRoot.appendChild(style);
    this.scoreDiv = document.createElement('div');
    this.scoreDiv.className = 'score';
    this.shadowRoot.appendChild(this.scoreDiv);
    this.canvas = document.createElement('canvas');
    this.canvas.width = 800;
    this.canvas.height = 200;
    this.shadowRoot.appendChild(this.canvas);
  }

  startGame() {
    const canvas = this.canvas;
    const ctx = canvas.getContext('2d');
    let dino = {
      x: 50, y: 150, width: 40, height: 40, dy: 0,
      gravity: 1.3, jumpForce: -11, grounded: true,
      jumpHold: false, jumpTimer: 0,
      coyoteTime: 0, jumpBuffer: 0,
      maxHoldFrames: 24
    };
    let obstacles = [];
    let score = 0;
    let gameOver = false;
    let speed = 6 * 0.6;
    let speedIncrease = 0.002 * 0.6;
    // Obstacle spacing rules
    let lastObstacleType = 1;
    let minGapAfter = 120;
    let minGapAfterDouble = 180;
    let minGapAfterTriple = 240;
    let pendingObstacles = 0;
    let started = false;

    const updateScore = () => {
      this.scoreDiv.textContent = `Score: ${score}`;
    };

    function drawDino() {
      ctx.fillStyle = 'white';
      ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
    }
    function drawObstacles() {
      ctx.fillStyle = 'white';
      obstacles.forEach(obs => {
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      });
    }
    function updateDino() {
      if (dino.grounded) {
        dino.coyoteTime = 8;
      } else if (dino.coyoteTime > 0) {
        dino.coyoteTime--;
      }
      if (dino.jumpBuffer > 0) dino.jumpBuffer--;
      if (dino.jumpBuffer > 0 && (dino.grounded || dino.coyoteTime > 0)) {
        dino.dy = dino.jumpForce;
        dino.grounded = false;
        dino.jumpHold = true;
        dino.jumpTimer = 0;
        dino.coyoteTime = 0;
        dino.jumpBuffer = 0;
      }
      if (!dino.grounded) {
        if (dino.jumpHold && dino.jumpTimer < dino.maxHoldFrames) {
          dino.dy += dino.gravity * 0.10;
          dino.jumpTimer++;
        } else {
          dino.dy += dino.gravity;
        }
        dino.y += dino.dy;
        if (dino.y + dino.height >= 190) {
          dino.y = 190 - dino.height;
          dino.grounded = true;
          dino.dy = 0;
          dino.jumpTimer = 0;
        }
      }
    }
    function updateObstacles() {
      obstacles.forEach(obs => {
        obs.x -= speed;
      });
      obstacles = obstacles.filter(obs => obs.x + obs.width > 0);
      if (pendingObstacles > 0) {
        let gone = 0;
        for (let i = 0; i < obstacles.length; i++) {
          if (obstacles[i].x + obstacles[i].width < 0) gone++;
        }
        if (gone >= pendingObstacles) {
          pendingObstacles = 0;
        }
      }
    }
    function canSpawnObstacle() {
      if (obstacles.length === 0) return true;
      const last = obstacles[obstacles.length - 1];
      const gap = last ? (canvas.width - (last.x + last.width)) : canvas.width;
      if (pendingObstacles > 0) return false;
      if (lastObstacleType === 1 && gap < minGapAfter) return false;
      if (lastObstacleType === 2 && gap < minGapAfterDouble) return false;
      if (lastObstacleType === 3 && gap < minGapAfterTriple) return false;
      return true;
    }
    function spawnObstacle() {
      let type = 1;
      const rand = Math.random();
      if (rand > 0.92) type = 3;
      else if (rand > 0.82) type = 2;
      if (!canSpawnObstacle()) return;
      let baseX = canvas.width;
      for (let i = 0; i < type; i++) {
        const height = Math.random() * 30 + 20;
        obstacles.push({ x: baseX + i * 24, y: 190 - height, width: 20, height: height });
      }
      lastObstacleType = type;
      pendingObstacles = type - 1;
    }
    function checkCollision() {
      obstacles.forEach(obs => {
        if (dino.x < obs.x + obs.width &&
          dino.x + dino.width > obs.x &&
          dino.y < obs.y + obs.height &&
          dino.y + dino.height > obs.y) {
          gameOver = true;
        }
      });
    }
    const WIN_SCORE = 2500;
    const gameLoop = () => {
      if (gameOver) {
        this.finishGame(score);
        return;
      }
      if (score >= WIN_SCORE) {
        this.finishGame(score, true);
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawDino();
      drawObstacles();
      if (started) {
        updateDino();
        updateObstacles();
        checkCollision();
        score++;
        updateScore();
        speed += speedIncrease;
        if (Math.random() < 0.02 + speed * 0.001) {
          spawnObstacle();
        }
      }
      requestAnimationFrame(gameLoop);
    };
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        dino.jumpBuffer = 8;
        dino.jumpHold = true;
        if (!started) started = true;
      }
    });
    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        dino.jumpHold = false;
      }
    });
    gameLoop();
  }

  finishGame(score, win = false) {
    if (win) {
      this.scoreDiv.textContent = `You Win! Score: ${score}`;
    } else {
      this.scoreDiv.textContent = `Game Over! Score: ${score}`;
    }
    this.dispatchEvent(new CustomEvent('minigame-complete', {
      detail: {
        score: win ? 3 : Math.floor(score / 100),
        result: score,
        win
      },
      bubbles: true,
      composed: true
    }));
    showMinigameOutro(win);
  }
}

customElements.define('dinorun-minigame', DinoRunMinigame);
