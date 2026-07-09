// AIセクションのタイトルアニメーション
document.addEventListener('DOMContentLoaded', function() {
  const aiTitle = document.querySelector('.ai-strength-title');

  if (!aiTitle) return;

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.3
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  observer.observe(aiTitle);
});
