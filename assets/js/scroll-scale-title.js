// Scroll Scale Title Animation
// スクロールに応じてタイトルが縮小するアニメーション（font-size変更方式）

document.addEventListener('DOMContentLoaded', function() {
  const title = document.querySelector('.scroll-scale-title');
  if (!title) return;

  const aiSection = document.querySelector('.ai-section-wrapper');
  if (!aiSection) return;

  // スマホ・タブレットではスクロール縮小演出を無効化する。
  // （font-size をインラインで書き換えるため、モバイルのフォント指定や
  //   タイトル表示アニメーションと競合してタイトルが見えなくなるのを防ぐ）
  if (window.matchMedia('(max-width: 768px)').matches) return;

  // 初期のフォントサイズを保存
  const initialFontSize = parseFloat(window.getComputedStyle(title).fontSize);
  const minFontSize = initialFontSize * 0.5; // 50%まで縮小

  let ticking = false;

  function updateFontSize() {
    // AIセクションの位置を取得
    const sectionRect = aiSection.getBoundingClientRect();
    const sectionTop = sectionRect.top;
    const windowHeight = window.innerHeight;

    // スクロールの進行度を計算
    // セクションが画面上部に到達してから縮小を開始
    const startScroll = windowHeight * 0.5; // 画面の半分の位置から開始
    const scrollDistance = startScroll; // 縮小する距離

    // 進行度（0〜1）
    let progress = 0;
    if (sectionTop < startScroll) {
      progress = Math.max(0, Math.min(1, (startScroll - sectionTop) / scrollDistance));
    }

    // フォントサイズを計算
    const currentFontSize = initialFontSize - ((initialFontSize - minFontSize) * progress);

    // スタイルを適用
    title.style.fontSize = `${currentFontSize}px`;
    title.style.transition = 'font-size 0.05s linear';

    ticking = false;
  }

  function requestTick() {
    if (!ticking) {
      requestAnimationFrame(updateFontSize);
      ticking = true;
    }
  }

  // スクロールイベント
  window.addEventListener('scroll', requestTick, { passive: true });

  // 初期状態を設定
  updateFontSize();
});
