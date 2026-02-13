// MinigameBase.js
// Abstract base class for all minigames, provides shared intro/outro overlay logic

export class MinigameBase {
  constructor(root, onComplete, tFunc = (x) => x) {
    this.root = root;
    this.onComplete = onComplete;
    this.t = tFunc;
    this.overlay = null;
    this._finalResult = null;
  }

  start() {
    // To be called by child with overlay config and callbacks
    throw new Error('MinigameBase.start() must be called by subclass');
  }

  showOutro(mock) {
    if (this.overlay) this.overlay.showOutro(mock);
  }

  finishMinigame() {
    if (this.onComplete) this.onComplete(this._finalResult);
  }
}
