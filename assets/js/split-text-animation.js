/**
 * SplitText Animation using GSAP
 * Animates text by splitting into characters with stagger animation
 */

(function() {
  // GSAPとScrollTriggerが必要
  if (typeof gsap === 'undefined') {
    console.warn('GSAP is not loaded. SplitText animation will not work.');
    return;
  }

  if (typeof ScrollTrigger === 'undefined') {
    console.warn('ScrollTrigger is not loaded. SplitText animation will not work.');
    return;
  }

  /**
   * テキストを文字ごとに分割してspanで囲む
   * @param {HTMLElement} element - 分割する要素
   * @returns {Array<HTMLElement>} - 分割された文字のspan要素の配列
   */
  function splitTextToChars(element) {
    const chars = [];
    const originalHTML = element.innerHTML;

    // 一時的なdiv要素を作成して内容を解析
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = originalHTML;

    function processNode(node, parentElement) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          const span = document.createElement('span');
          span.className = 'split-char';
          span.textContent = char;
          span.style.display = 'inline-block';

          if (char === ' ') {
            span.innerHTML = '&nbsp;';
          }

          chars.push(span);
          parentElement.appendChild(span);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // 既存の要素（span.vision-accent, brなど）をクローン
        const clone = node.cloneNode(false);
        parentElement.appendChild(clone);

        // 子ノードを再帰的に処理
        Array.from(node.childNodes).forEach(child => {
          processNode(child, clone);
        });
      }
    }

    // 元の内容をクリア
    element.innerHTML = '';

    // 全ての子ノードを処理
    Array.from(tempDiv.childNodes).forEach(node => {
      processNode(node, element);
    });

    return chars;
  }

  // SplitText アニメーションを初期化
  function initSplitTextAnimation() {
    // フォントが読み込まれるまで待つ
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        applySplitAnimation();
      });
    } else {
      // フォールバック：即座に実行
      applySplitAnimation();
    }
  }

  function applySplitAnimation() {
    const visionTitle = document.querySelector('.vision-title');

    if (!visionTitle) {
      console.warn('Vision title element not found');
      return;
    }

    // 既に分割済みの場合はスキップ
    if (visionTitle.querySelector('.split-char')) {
      console.log('Already split, skipping');
      return;
    }

    console.log('Starting split text animation');

    // テキストを文字ごとに分割
    const chars = splitTextToChars(visionTitle);

    console.log('Split chars count:', chars.length);

    if (chars.length === 0) {
      console.warn('No characters to animate');
      return;
    }

    // 初期状態を設定
    gsap.set(chars, {
      opacity: 0,
      y: 40,
      willChange: 'transform, opacity'
    });

    // ScrollTriggerでアニメーション開始
    gsap.to(chars, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power3.out',
      stagger: 0.02,
      scrollTrigger: {
        trigger: visionTitle,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          console.log('ScrollTrigger activated - animation starting');
        }
      },
      onComplete: () => {
        console.log('Animation complete');
        gsap.set(chars, { clearProps: 'willChange' });
      }
    });
  }

  // ページ読み込み後に実行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSplitTextAnimation);
  } else {
    initSplitTextAnimation();
  }
})();
