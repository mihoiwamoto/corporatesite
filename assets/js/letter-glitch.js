class LetterGlitch {
  constructor(canvasElement, options = {}) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');

    // Options
    this.glitchColors = options.glitchColors || ['#2b4539', '#61dca3', '#61b3dc'];
    this.glitchSpeed = options.glitchSpeed || 50;
    this.centerVignette = options.centerVignette !== undefined ? options.centerVignette : false;
    this.outerVignette = options.outerVignette !== undefined ? options.outerVignette : true;
    this.smooth = options.smooth !== undefined ? options.smooth : true;
    this.characters = options.characters || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789';

    this.lettersAndSymbols = Array.from(this.characters);
    this.fontSize = 16;
    this.charWidth = 10;
    this.charHeight = 20;

    this.letters = [];
    this.grid = { columns: 0, rows: 0 };
    this.lastGlitchTime = Date.now();
    this.animationId = null;

    this.init();
  }

  init() {
    this.resizeCanvas();
    this.animate();

    this.resizeHandler = this.debounce(() => {
      cancelAnimationFrame(this.animationId);
      this.resizeCanvas();
      this.animate();
    }, 100);

    window.addEventListener('resize', this.resizeHandler);
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  getRandomChar() {
    return this.lettersAndSymbols[Math.floor(Math.random() * this.lettersAndSymbols.length)];
  }

  getRandomColor() {
    return this.glitchColors[Math.floor(Math.random() * this.glitchColors.length)];
  }

  hexToRgb(hex) {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  interpolateColor(start, end, factor) {
    const result = {
      r: Math.round(start.r + (end.r - start.r) * factor),
      g: Math.round(start.g + (end.g - start.g) * factor),
      b: Math.round(start.b + (end.b - start.b) * factor)
    };
    return `rgb(${result.r}, ${result.g}, ${result.b})`;
  }

  calculateGrid(width, height) {
    const columns = Math.ceil(width / this.charWidth);
    const rows = Math.ceil(height / this.charHeight);
    return { columns, rows };
  }

  initializeLetters(columns, rows) {
    this.grid = { columns, rows };
    const totalLetters = columns * rows;
    this.letters = Array.from({ length: totalLetters }, () => ({
      char: this.getRandomChar(),
      color: this.getRandomColor(),
      targetColor: this.getRandomColor(),
      colorProgress: 1
    }));
  }

  resizeCanvas() {
    const parent = this.canvas.parentElement;
    if (!parent) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = parent.getBoundingClientRect();

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;

    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;

    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const { columns, rows } = this.calculateGrid(rect.width, rect.height);
    this.initializeLetters(columns, rows);

    this.drawLetters();
  }

  drawLetters() {
    if (!this.ctx || this.letters.length === 0) return;
    const rect = this.canvas.getBoundingClientRect();
    this.ctx.clearRect(0, 0, rect.width, rect.height);
    this.ctx.font = `${this.fontSize}px monospace`;
    this.ctx.textBaseline = 'top';

    this.letters.forEach((letter, index) => {
      const x = (index % this.grid.columns) * this.charWidth;
      const y = Math.floor(index / this.grid.columns) * this.charHeight;
      this.ctx.fillStyle = letter.color;
      this.ctx.fillText(letter.char, x, y);
    });
  }

  updateLetters() {
    if (!this.letters || this.letters.length === 0) return;

    const updateCount = Math.max(1, Math.floor(this.letters.length * 0.05));

    for (let i = 0; i < updateCount; i++) {
      const index = Math.floor(Math.random() * this.letters.length);
      if (!this.letters[index]) continue;

      this.letters[index].char = this.getRandomChar();
      this.letters[index].targetColor = this.getRandomColor();

      if (!this.smooth) {
        this.letters[index].color = this.letters[index].targetColor;
        this.letters[index].colorProgress = 1;
      } else {
        this.letters[index].colorProgress = 0;
      }
    }
  }

  handleSmoothTransitions() {
    let needsRedraw = false;
    this.letters.forEach(letter => {
      if (letter.colorProgress < 1) {
        letter.colorProgress += 0.05;
        if (letter.colorProgress > 1) letter.colorProgress = 1;

        const startRgb = this.hexToRgb(letter.color);
        const endRgb = this.hexToRgb(letter.targetColor);
        if (startRgb && endRgb) {
          letter.color = this.interpolateColor(startRgb, endRgb, letter.colorProgress);
          needsRedraw = true;
        }
      }
    });

    if (needsRedraw) {
      this.drawLetters();
    }
  }

  animate() {
    const now = Date.now();
    if (now - this.lastGlitchTime >= this.glitchSpeed) {
      this.updateLetters();
      this.drawLetters();
      this.lastGlitchTime = now;
    }

    if (this.smooth) {
      this.handleSmoothTransitions();
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.resizeHandler);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  const canvas = document.getElementById('letter-glitch-canvas');
  if (canvas) {
    new LetterGlitch(canvas, {
      glitchSpeed: 50,
      centerVignette: true,
      outerVignette: false,
      smooth: true
    });
  }
});
