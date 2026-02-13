class Gameflow {
  constructor() {
    this.chapters = [];
    this.state = {
      chapterIdx: 0,
      nodeIdx: 0,
      repeatCount: 0,
      unlocked: {},
      ended: false,
      memory: {},
      scores: {
        humanity: 0,
        compliance: 0,
        absurdity: 0
      }
    };
  }

  async init() {
    const resp = await fetch('./src/data/chapters.json');
    this.chapters = await resp.json();
    this.state.chapterIdx = 0;
    this.state.nodeIdx = 0;
    this.state.repeatCount = 0;
    this.state.ended = false;
    this.state.unlocked = {};
    this.state.memory = {};
    this.state.scores = { humanity: 0, compliance: 0, absurdity: 0 };
  }

  getCurrentChapter() {
    return this.chapters[this.state.chapterIdx];
  }

  getCurrentNode() {
    const chapter = this.getCurrentChapter();
    return chapter.nodes[this.state.nodeIdx];
  }

  nextNode() {
    const chapter = this.getCurrentChapter();
    if (this.state.nodeIdx < chapter.nodes.length - 1) {
      this.state.nodeIdx++;
      this.state.repeatCount = 0;
      return true;
    } else {
      // End of chapter: check if there is another chapter
      if (this.state.chapterIdx < this.chapters.length - 1) {
        this.state.chapterIdx++;
        this.state.nodeIdx = 0;
        this.state.repeatCount = 0;
        return true;
      } else {
        // No more chapters, end the game
        this.state.ended = true;
        return false;
      }
    }
  }

  repeatNode() {
    this.state.repeatCount++;
  }

  resetRepeat() {
    this.state.repeatCount = 0;
  }

  unlock(category) {
    this.state.unlocked[category] = true;
  }

  isUnlocked(category) {
    return !!this.state.unlocked[category];
  }

  setMemory(key, value) {
    this.state.memory[key] = value;
  }

  getMemory(key) {
    return this.state.memory[key];
  }

  adjustScore(type, delta) {
    if (this.state.scores[type] !== undefined) {
      this.state.scores[type] += delta;
    }
  }

  getScores() {
    return { ...this.state.scores };
  }

  isEnded() {
    return this.state.ended;
  }

  nextChapter() {
    if (this.state.chapterIdx < this.chapters.length - 1) {
      this.state.chapterIdx++;
      this.state.nodeIdx = 0;
      this.state.repeatCount = 0;
      return true;
    } else {
      this.state.ended = true;
      return false;
    }
  }
}

export default new Gameflow();
