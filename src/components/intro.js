/**
 * Simple Minigame Intro/Outro Components
 * Usage:
 *   await showMinigameIntro();
 *   // ... run minigame ...
 *   await showMinigameOutro(true); // true = win, false = lose
 */

// Helper: Animate sliding text in and out
function slideText(text) {
    return new Promise((resolve) => {
        const el = document.createElement('div');
        el.textContent = text;
        Object.assign(el.style, {
            position: 'fixed',
            top: '40%',
            left: '-100%',
            width: '100%',
            textAlign: 'center',
            fontSize: '2.5rem',
            fontFamily: 'sans-serif',
            color: '#222',
            zIndex: 9999,
            transition: 'left 0.5s cubic-bezier(.4,2,.6,1), opacity 0.5s',
            opacity: '1',
            pointerEvents: 'none',
            background: 'rgba(255,255,255,0.8)'
        });
        document.body.appendChild(el);

        // Slide in
        setTimeout(() => {
            el.style.left = '0';
        }, 10);

        // Wait 2s, then slide out
        setTimeout(() => {
            el.style.left = '100%';
            el.style.opacity = '0';
        }, 2010);

        // Remove after animation
        setTimeout(() => {
            el.remove();
            resolve();
        }, 2600);
    });
}

// Intro: "Minigame"
export async function showMinigameIntro() {
    await slideText('Minigame');
}

// Outro: "You won" or "You lost"
export async function showMinigameOutro(won) {
    await slideText(won ? 'You won' : 'You lost');
}