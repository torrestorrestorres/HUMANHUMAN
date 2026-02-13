// inventory.js
// Simple external inventory system for use across minigames and main game

export class Inventory {
  constructor() {
    this.items = [];
  }

  add(item) {
    if (!this.items.includes(item)) {
      this.items.push(item);
    }
  }

  remove(item) {
    this.items = this.items.filter(i => i !== item);
  }

  has(item) {
    return this.items.includes(item);
  }

  clear() {
    this.items = [];
  }

  getAll() {
    return this.items;
  }
}

// Singleton instance for global use
export const inventory = new Inventory();
