// DecryptedText Animation (Vanilla JS version)
// Ported from React Bits component

class DecryptedText {
  constructor(element, options = {}) {
    this.element = element;
    this.originalText = element.textContent;

    // Options
    this.speed = options.speed || 50;
    this.maxIterations = options.maxIterations || 10;
    this.characters = options.characters || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+';
    this.sequential = options.sequential !== undefined ? options.sequential : false;
    this.revealDirection = options.revealDirection || 'start';
    this.animateOn = options.animateOn || 'view';

    // State
    this.isAnimating = false;
    this.revealedIndices = new Set();
    this.currentIteration = 0;
    this.intervalId = null;
    this.hasAnimated = false;

    this.init();
  }

  init() {
    // Set up initial encrypted state if needed
    if (this.animateOn === 'click') {
      this.encryptInstantly();
    }

    // Set up triggers
    if (this.animateOn === 'view') {
      this.setupViewObserver();
    } else if (this.animateOn === 'hover') {
      this.setupHoverTrigger();
    } else if (this.animateOn === 'click') {
      this.setupClickTrigger();
    }
  }

  getRandomChar() {
    return this.characters[Math.floor(Math.random() * this.characters.length)];
  }

  shuffleText(revealedSet) {
    return this.originalText
      .split('')
      .map((char, i) => {
        if (char === ' ') return ' ';
        if (revealedSet.has(i)) return this.originalText[i];
        return this.getRandomChar();
      })
      .join('');
  }

  encryptInstantly() {
    const emptySet = new Set();
    this.revealedIndices = emptySet;
    this.element.textContent = this.shuffleText(emptySet);
  }

  getNextIndex(revealedSet) {
    const textLength = this.originalText.length;

    switch (this.revealDirection) {
      case 'start':
        return revealedSet.size;
      case 'end':
        return textLength - 1 - revealedSet.size;
      case 'center': {
        const middle = Math.floor(textLength / 2);
        const offset = Math.floor(revealedSet.size / 2);
        const nextIndex = revealedSet.size % 2 === 0
          ? middle + offset
          : middle - offset - 1;

        if (nextIndex >= 0 && nextIndex < textLength && !revealedSet.has(nextIndex)) {
          return nextIndex;
        }

        for (let i = 0; i < textLength; i++) {
          if (!revealedSet.has(i)) return i;
        }
        return 0;
      }
      default:
        return revealedSet.size;
    }
  }

  animate() {
    if (this.isAnimating) return;

    this.isAnimating = true;
    this.revealedIndices = new Set();
    this.currentIteration = 0;

    this.intervalId = setInterval(() => {
      if (this.sequential) {
        // Sequential reveal
        if (this.revealedIndices.size < this.originalText.length) {
          const nextIndex = this.getNextIndex(this.revealedIndices);
          this.revealedIndices.add(nextIndex);
          this.element.textContent = this.shuffleText(this.revealedIndices);
        } else {
          this.stopAnimation();
          this.element.textContent = this.originalText;
        }
      } else {
        // Non-sequential (scramble then reveal)
        this.element.textContent = this.shuffleText(this.revealedIndices);
        this.currentIteration++;

        if (this.currentIteration >= this.maxIterations) {
          this.stopAnimation();
          this.element.textContent = this.originalText;
        }
      }
    }, this.speed);
  }

  stopAnimation() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isAnimating = false;
  }

  setupViewObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.hasAnimated) {
            this.animate();
            this.hasAnimated = true;
          }
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
      }
    );

    observer.observe(this.element);
  }

  setupHoverTrigger() {
    this.element.addEventListener('mouseenter', () => {
      this.animate();
    });

    this.element.addEventListener('mouseleave', () => {
      this.stopAnimation();
      this.element.textContent = this.originalText;
    });
  }

  setupClickTrigger() {
    this.element.addEventListener('click', () => {
      if (!this.isAnimating) {
        this.animate();
      }
    });
  }

  destroy() {
    this.stopAnimation();
    this.element.textContent = this.originalText;
  }
}

// Auto-initialize elements with data-decrypt attribute
document.addEventListener('DOMContentLoaded', function() {
  const elements = document.querySelectorAll('[data-decrypt]');

  elements.forEach(element => {
    const options = {
      speed: parseInt(element.dataset.decryptSpeed) || 50,
      maxIterations: parseInt(element.dataset.decryptIterations) || 10,
      sequential: element.dataset.decryptSequential === 'true',
      revealDirection: element.dataset.decryptDirection || 'start',
      animateOn: element.dataset.decryptTrigger || 'view'
    };

    new DecryptedText(element, options);
  });
});
