/**
 * TrueFocus - Vanilla JS implementation
 * Based on React Bits TrueFocus component
 */
class TrueFocus {
  constructor(containerElement, options = {}) {
    this.container = containerElement;
    this.options = {
      sentence: options.sentence || 'True Focus',
      separator: options.separator !== undefined ? options.separator : ' ',
      manualMode: options.manualMode || false,
      blurAmount: options.blurAmount || 5,
      borderColor: options.borderColor || 'green',
      glowColor: options.glowColor || 'rgba(0, 255, 0, 0.6)',
      animationDuration: options.animationDuration || 0.5,
      pauseBetweenAnimations: options.pauseBetweenAnimations || 1
    };

    this.currentIndex = 0;
    this.lastActiveIndex = null;
    this.intervalId = null;
    this.wordElements = [];
    this.focusFrame = null;
    this.containerRef = null;
    this.focusRect = { x: 0, y: 0, width: 0, height: 0 };

    this.init();
  }

  init() {
    // Save the container as containerRef
    this.containerRef = this.container;

    // Clear existing content
    const originalContent = this.container.innerHTML;
    this.container.innerHTML = '';
    this.container.classList.add('focus-container');

    // Split sentence by separator
    const words = this.options.separator === ''
      ? this.options.sentence.split('')
      : this.options.sentence.split(this.options.separator);

    // Create word spans
    words.forEach((word, index) => {
      const span = document.createElement('span');
      span.className = `focus-word ${this.options.manualMode ? 'manual' : ''}`;
      span.textContent = word;

      const isActive = index === this.currentIndex;
      span.style.filter = isActive ? 'blur(0px)' : `blur(${this.options.blurAmount}px)`;
      span.style.setProperty('--border-color', this.options.borderColor);
      span.style.setProperty('--glow-color', this.options.glowColor);
      span.style.transition = `filter ${this.options.animationDuration}s ease`;

      if (this.options.manualMode) {
        span.addEventListener('mouseenter', () => this.handleMouseEnter(index));
        span.addEventListener('mouseleave', () => this.handleMouseLeave());
      }

      this.wordElements.push(span);
      this.container.appendChild(span);
    });

    // Create focus frame (equivalent to motion.div)
    this.focusFrame = document.createElement('div');
    this.focusFrame.className = 'focus-frame';
    this.focusFrame.style.setProperty('--border-color', this.options.borderColor);
    this.focusFrame.style.setProperty('--glow-color', this.options.glowColor);
    this.focusFrame.style.opacity = '0';
    this.focusFrame.style.transition = `transform ${this.options.animationDuration}s ease, width ${this.options.animationDuration}s ease, height ${this.options.animationDuration}s ease, opacity ${this.options.animationDuration}s ease`;

    // Create corner elements
    const corners = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
    corners.forEach(className => {
      const corner = document.createElement('span');
      corner.className = `corner ${className}`;
      this.focusFrame.appendChild(corner);
    });

    this.container.appendChild(this.focusFrame);

    // Initialize focus rect and start animation
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      this.updateFocusRect(this.currentIndex);

      if (!this.options.manualMode) {
        this.startAutoAnimation();
      }
    });
  }

  updateFocusRect(index) {
    if (index === null || index === -1) return;
    if (!this.wordElements[index] || !this.containerRef) return;

    const parentRect = this.containerRef.getBoundingClientRect();
    const activeRect = this.wordElements[index].getBoundingClientRect();

    this.focusRect = {
      x: activeRect.left - parentRect.left,
      y: activeRect.top - parentRect.top,
      width: activeRect.width,
      height: activeRect.height
    };

    // Update focus frame position and size
    this.focusFrame.style.transform = `translate(${this.focusRect.x}px, ${this.focusRect.y}px)`;
    this.focusFrame.style.width = `${this.focusRect.width}px`;
    this.focusFrame.style.height = `${this.focusRect.height}px`;
    this.focusFrame.style.opacity = index >= 0 ? '1' : '0';
  }

  setCurrentIndex(index) {
    this.currentIndex = index;

    // Update word blur states
    this.wordElements.forEach((word, i) => {
      const isActive = i === index;
      word.style.filter = isActive ? 'blur(0px)' : `blur(${this.options.blurAmount}px)`;

      if (isActive && !this.options.manualMode) {
        word.classList.add('active');
      } else {
        word.classList.remove('active');
      }
    });

    // Update focus frame
    this.updateFocusRect(index);
  }

  startAutoAnimation() {
    if (!this.options.manualMode) {
      this.intervalId = setInterval(() => {
        const nextIndex = (this.currentIndex + 1) % this.wordElements.length;
        this.setCurrentIndex(nextIndex);
      }, (this.options.animationDuration + this.options.pauseBetweenAnimations) * 1000);
    }
  }

  handleMouseEnter(index) {
    if (this.options.manualMode) {
      this.lastActiveIndex = index;
      this.setCurrentIndex(index);
    }
  }

  handleMouseLeave() {
    if (this.options.manualMode) {
      this.setCurrentIndex(this.lastActiveIndex);
    }
  }

  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.container.innerHTML = '';
  }
}

// Auto-initialize on elements with data-truefocus attribute
document.addEventListener('DOMContentLoaded', () => {
  const elements = document.querySelectorAll('[data-truefocus]');

  elements.forEach(element => {
    const options = {
      sentence: element.getAttribute('data-sentence') || element.textContent.trim(),
      separator: element.hasAttribute('data-separator') ? element.getAttribute('data-separator') : ' ',
      manualMode: element.getAttribute('data-manual-mode') === 'true',
      blurAmount: element.hasAttribute('data-blur-amount') ? parseFloat(element.getAttribute('data-blur-amount')) : 5,
      borderColor: element.getAttribute('data-border-color') || 'green',
      glowColor: element.getAttribute('data-glow-color') || 'rgba(0, 255, 0, 0.6)',
      animationDuration: element.hasAttribute('data-animation-duration') ? parseFloat(element.getAttribute('data-animation-duration')) : 0.5,
      pauseBetweenAnimations: element.hasAttribute('data-pause-between-animations') ? parseFloat(element.getAttribute('data-pause-between-animations')) : 1
    };

    new TrueFocus(element, options);
  });
});
