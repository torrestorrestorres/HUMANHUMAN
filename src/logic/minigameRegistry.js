import '../components/DinoRunMinigame.js';
import '../components/SlotMinigame.js';
import '../components/ThermiteMinigame.js';
// Minigame registry for dynamic minigame loading

import '../components/isHumanMinigame.js';
import '../components/PongMinigame.js';



// To register a new minigame:
// 1. Create a new minigame component in /components (e.g., MinigameNew.js)
// 2. Import it below and add to the registry with its id (e.g., m2: MinigameNew)
export const minigameRegistry = {
    ishuman: {
        component: 'is-human-minigame',
        condition: (state) => state.cameraEnabled === true
    },
    pong: {
        component: 'pong-minigame',
        condition: () => true // Always available
    },
    thermite: {
        component: 'thermite-minigame',
        condition: () => true // Always available
    },
    slot: {
        component: 'slot-minigame',
        condition: () => true // Always available
    },
    dinorun: {
        component: 'dinorun-minigame',
        condition: () => true // Always available
    },
};
