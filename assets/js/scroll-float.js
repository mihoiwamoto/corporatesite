/**
 * ScrollFloat - Vanilla JS implementation
 * Based on React Bits ScrollFloat component
 * Requires GSAP and ScrollTrigger
 */
class ScrollFloat {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      scrollContainerRef: options.scrollContainerRef || null,
      animationDuration: options.animationDuration || 1,
      ease: options.ease || 'back.inOut(2)',
      scrollStart: options.scrollStart || 'center bottom+=50%',
      scrollEnd: options.scrollEnd || 'bottom bottom-=40%',
      stagger: options.stagger || 0.03
    };

    this.init();
  }

  init() {
    // Check if GSAP is available
    if (typeof gsap === 'undefined') {
      console.error('GSAP is required for ScrollFloat');
      return;
    }

    // Get original HTML content
    const originalHTML = this.element.innerHTML;

    // Add scroll-float class
    this.element.classList.add('scroll-float');

    // Create wrapper span
    const wrapper = document.createElement('span');
    wrapper.className = 'scroll-float-text';

    // Process HTML content to handle line breaks
    const lines = this.parseHTMLToLines(originalHTML);

    lines.forEach((line, lineIndex) => {
      if (lineIndex > 0) {
        // Add line break
        wrapper.appendChild(document.createElement('br'));
      }

      const lineSpan = document.createElement('span');
      lineSpan.className = 'scroll-float-line';

      // Split line text into characters
      line.forEach(segment => {
        if (segment.type === 'text') {
          segment.text.split('').forEach(char => {
            const charSpan = document.createElement('span');
            charSpan.className = 'char';
            charSpan.textContent = char === ' ' ? ' ' : char;
            lineSpan.appendChild(charSpan);
          });
        } else if (segment.type === 'html') {
          // Handle HTML elements like <span class="vision-accent">
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = segment.html;
          const elem = tempDiv.firstElementChild;

          if (elem) {
            const innerText = elem.textContent;
            elem.textContent = '';

            innerText.split('').forEach(char => {
              const charSpan = document.createElement('span');
              charSpan.className = 'char';
              charSpan.textContent = char === ' ' ? ' ' : char;
              elem.appendChild(charSpan);
            });

            lineSpan.appendChild(elem);
          }
        }
      });

      wrapper.appendChild(lineSpan);
    });

    // Replace element content
    this.element.innerHTML = '';
    this.element.appendChild(wrapper);

    // Initialize GSAP animation
    this.initAnimation();
  }

  parseHTMLToLines(html) {
    // Split by <br> tags
    const parts = html.split(/<br\s*\/?>/i);

    return parts.map(part => {
      const segments = [];
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = part.trim();

      // Process child nodes
      Array.from(tempDiv.childNodes).forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent.trim();
          if (text) {
            segments.push({ type: 'text', text });
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          segments.push({ type: 'html', html: node.outerHTML });
        }
      });

      return segments;
    });
  }

  initAnimation() {
    const charElements = this.element.querySelectorAll('.char');

    console.log('ScrollFloat: Initializing animation for', charElements.length, 'characters');

    // Integrate with Lenis smooth scroll if available
    if (window.__lenis) {
      console.log('ScrollFloat: Integrating with Lenis');
      window.__lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.lagSmoothing(0);
    }

    // Set initial state immediately
    gsap.set(charElements, {
      opacity: 0,
      scale: 0.3,
      z: -300,
      transformOrigin: '50% 50%'
    });

    gsap.to(charElements, {
      duration: this.options.animationDuration,
      ease: this.options.ease,
      opacity: 1,
      scale: 1,
      z: 0,
      stagger: this.options.stagger,
      scrollTrigger: {
        trigger: this.element,
        start: this.options.scrollStart,
        end: this.options.scrollEnd,
        scrub: true,
        markers: true, // Enable markers for debugging
        onEnter: () => console.log('ScrollFloat: Animation started'),
        onUpdate: (self) => console.log('ScrollFloat: Progress', self.progress)
      }
    });
  }

  destroy() {
    // Kill ScrollTrigger instances
    ScrollTrigger.getAll().forEach(trigger => {
      if (trigger.trigger === this.element) {
        trigger.kill();
      }
    });
  }
}

// Auto-initialize on elements with data-scroll-float attribute
console.log('ScrollFloat: Script loaded');

window.addEventListener('load', () => {
  console.log('ScrollFloat: Window loaded');

  // Wait for GSAP and Lenis to be available
  const initScrollFloat = () => {
    console.log('ScrollFloat: initScrollFloat called');
    console.log('ScrollFloat: gsap available?', typeof gsap !== 'undefined');
    console.log('ScrollFloat: ScrollTrigger available?', typeof ScrollTrigger !== 'undefined');

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.error('GSAP and ScrollTrigger are required for ScrollFloat');
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    console.log('ScrollFloat: ScrollTrigger registered');

    // Wait for Lenis to be ready
    const setupScrollFloat = () => {
      console.log('ScrollFloat: setupScrollFloat called');
      const elements = document.querySelectorAll('[data-scroll-float]');
      console.log('ScrollFloat: Found', elements.length, 'elements with data-scroll-float');

      elements.forEach((element, index) => {
        console.log('ScrollFloat: Processing element', index, element);
        const options = {
          animationDuration: element.hasAttribute('data-animation-duration')
            ? parseFloat(element.getAttribute('data-animation-duration'))
            : 1,
          ease: element.getAttribute('data-ease') || 'back.inOut(2)',
          scrollStart: element.getAttribute('data-scroll-start') || 'center bottom+=50%',
          scrollEnd: element.getAttribute('data-scroll-end') || 'bottom bottom-=40%',
          stagger: element.hasAttribute('data-stagger')
            ? parseFloat(element.getAttribute('data-stagger'))
            : 0.03
        };

        console.log('ScrollFloat: Options for element', index, options);
        new ScrollFloat(element, options);
      });

      // Refresh ScrollTrigger after initialization
      setTimeout(() => {
        console.log('ScrollFloat: Refreshing ScrollTrigger');
        ScrollTrigger.refresh();
      }, 100);
    };

    // If Lenis is available, wait for it to be ready
    console.log('ScrollFloat: Lenis available?', !!window.__lenis);
    if (window.__lenis) {
      setTimeout(setupScrollFloat, 200);
    } else {
      setupScrollFloat();
    }
  };

  // Check if GSAP is already loaded
  if (typeof gsap !== 'undefined') {
    initScrollFloat();
  } else {
    // Wait a bit for GSAP to load
    console.log('ScrollFloat: GSAP not loaded yet, waiting...');
    setTimeout(initScrollFloat, 100);
  }
});
