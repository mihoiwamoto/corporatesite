// AI Section Scroll Animation
// 紙芝居風の上から下へのスクロールアニメーション

document.addEventListener('DOMContentLoaded', function() {
  const aiSection = document.querySelector('.ai-section-wrapper');
  if (!aiSection) return;

  // アニメーション対象の要素を取得
  const titleSection = aiSection.querySelector('.ai-strength-section');
  const cards = aiSection.querySelectorAll('.ai-card');
  const footerLine = aiSection.querySelector('.ai-footer-line');
  const footerText = aiSection.querySelector('.ai-footer-text');

  // 初期状態を設定
  const elements = [titleSection, ...cards, footerLine, footerText].filter(Boolean);
  elements.forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(60px)';
    el.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
  });

  // Intersection Observerの設定
  const observerOptions = {
    root: null,
    rootMargin: '-100px 0px -100px 0px',
    threshold: 0.1
  };

  let animationTriggered = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animationTriggered) {
        animationTriggered = true;

        // 順番にアニメーションを実行
        elements.forEach((el, index) => {
          setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          }, index * 150); // 150msずつ遅延
        });
      }
    });
  }, observerOptions);

  // AI セクション全体を監視
  observer.observe(aiSection);
});
