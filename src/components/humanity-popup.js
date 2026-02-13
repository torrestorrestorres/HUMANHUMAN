// humanity-popup.js
class HumanityPopup extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.timeout = null;
  }

  show(delta) {
    this.shadowRoot.innerHTML = `
      <style>
        .popup {
          position: fixed;
          left: 50%;
          bottom: 32px;
          transform: translateX(-50%);
          background: rgba(30,30,30,0.95);
          color: #fff;
          font-size: 1.2em;
          padding: 0.7em 1.5em;
          border-radius: 2em;
          box-shadow: 0 2px 12px #0006;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s;
        }
        .popup.show { opacity: 1; }
      </style>
      <div class="popup">Humanity ${delta > 0 ? '+' : ''}${delta}</div>
    `;
    const popup = this.shadowRoot.querySelector('.popup');
    setTimeout(() => popup.classList.add('show'), 10);
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => popup.classList.remove('show'), 1200);
  }
}
customElements.define('humanity-popup', HumanityPopup);
