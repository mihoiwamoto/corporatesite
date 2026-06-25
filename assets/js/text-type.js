/**
 * TextType — タイピング（文字入力）アニメーション
 * React Bits の <TextType /> をバニラJSへ移植（React/gsap 不要）。
 *
 * 使い方A（宣言的）: 要素に data-text-type を付与し、data-* で設定。
 *   <h1 data-text-type
 *       data-text='["企画から運用まで。","分業しない、一貫体制。","Happy coding!"]'
 *       data-typing-speed="75" data-pause-duration="1500"></h1>
 *
 * 使い方B（プログラム）:
 *   new TextType(el, { text: ["a","b"], typingSpeed: 75, pauseDuration: 1500 });
 *
 * 完了通知: 各文の削除完了時に CustomEvent 'sentencecomplete'
 *   (detail: { sentence, index }) を要素から発火。
 */
(function (global) {
  'use strict';

  function parseJSON(value, fallback) {
    if (value == null) return fallback;
    try { return JSON.parse(value); } catch (e) { return value; }
  }
  function toNum(v) { return v == null || v === '' ? undefined : Number(v); }
  function toBool(v) { return v == null ? undefined : (v === '' || v === 'true'); }

  // 指定語だけ <span class> で包んだHTMLを返す（特定単語の着色用）。Xss防止のためエスケープ。
  function escapeHTML(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function highlightHTML(text, word, cls) {
    var esc = escapeHTML(text);
    if (!word) return esc;
    var escWord = escapeHTML(word);
    return esc.split(escWord).join('<span class="' + cls + '">' + escWord + '</span>');
  }

  function TextType(el, options) {
    if (!el) return;
    var o = options || {};

    this.el = el;
    this.texts = Array.isArray(o.text) ? o.text.slice() : [o.text != null ? o.text : ''];
    this.typingSpeed = o.typingSpeed != null ? o.typingSpeed : 50;
    this.initialDelay = o.initialDelay != null ? o.initialDelay : 0;
    this.pauseDuration = o.pauseDuration != null ? o.pauseDuration : 2000;
    this.deletingSpeed = o.deletingSpeed != null ? o.deletingSpeed : 30;
    this.loop = o.loop != null ? o.loop : true;
    this.showCursor = o.showCursor != null ? o.showCursor : true;
    this.hideCursorWhileTyping = o.hideCursorWhileTyping || false;
    this.cursorCharacter = o.cursorCharacter != null ? o.cursorCharacter : '|';
    this.cursorBlinkDuration = o.cursorBlinkDuration != null ? o.cursorBlinkDuration : 0.5;
    this.cursorClassName = o.cursorClassName || '';
    this.textColors = o.textColors || [];
    this.variableSpeed = o.variableSpeed || null;
    this.startOnVisible = o.startOnVisible || false;
    this.reverseMode = o.reverseMode || false;
    this.highlight = o.highlight || '';                         // 着色する単語
    this.highlightClass = o.highlightClass || 'text-type__hl';  // その単語に付与するクラス
    this.onSentenceComplete = typeof o.onSentenceComplete === 'function' ? o.onSentenceComplete : null;

    this.textIndex = 0;
    this.charIndex = 0;
    this.isDeleting = false;
    this.displayed = '';
    this._timer = null;
    this._destroyed = false;

    this._build();

    var reduce = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { this._renderStatic(); return; }

    if (this.startOnVisible && 'IntersectionObserver' in global) {
      var self = this;
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { observer.disconnect(); self.start(); }
        });
      }, { threshold: 0.1 });
      observer.observe(this.el);
    } else {
      this.start();
    }
  }

  TextType.prototype._build = function () {
    this.el.innerHTML = '';
    this.el.classList.add('text-type');

    this.content = document.createElement('span');
    this.content.className = 'text-type__content';
    this.el.appendChild(this.content);

    if (this.showCursor) {
      this.cursor = document.createElement('span');
      this.cursor.className = 'text-type__cursor' + (this.cursorClassName ? ' ' + this.cursorClassName : '');
      this.cursor.setAttribute('aria-hidden', 'true');
      this.cursor.textContent = this.cursorCharacter;
      // gsap の yoyo（フェード往復）に合わせ、点滅一周期 = blinkDuration * 2
      this.cursor.style.setProperty('--cursor-blink-duration', (this.cursorBlinkDuration * 2) + 's');
      this.el.appendChild(this.cursor);
    }
    this._applyColor();
  };

  TextType.prototype._applyColor = function () {
    this.content.style.color = this.textColors.length
      ? this.textColors[this.textIndex % this.textColors.length]
      : '';
  };

  TextType.prototype._renderStatic = function () {
    // モーション低減設定時はアニメーションせず先頭の文を表示
    this.displayed = this.texts[0] || '';
    if (this.highlight) {
      this.content.innerHTML = highlightHTML(this.displayed, this.highlight, this.highlightClass);
    } else {
      this.content.textContent = this.displayed;
    }
  };

  TextType.prototype._speed = function () {
    if (!this.variableSpeed) return this.typingSpeed;
    var min = this.variableSpeed.min, max = this.variableSpeed.max;
    return Math.random() * (max - min) + min;
  };

  TextType.prototype._render = function () {
    if (this.highlight) {
      this.content.innerHTML = highlightHTML(this.displayed, this.highlight, this.highlightClass);
    } else {
      this.content.textContent = this.displayed;
    }
    if (this.cursor && this.hideCursorWhileTyping) {
      var len = (this.texts[this.textIndex] || '').length;
      var typing = this.charIndex < len || this.isDeleting;
      this.cursor.classList.toggle('text-type__cursor--hidden', typing);
    }
  };

  TextType.prototype.start = function () {
    var self = this;
    clearTimeout(this._timer);
    this._timer = setTimeout(function () { self._tick(); }, this.initialDelay);
  };

  TextType.prototype._tick = function () {
    if (this._destroyed) return;
    var self = this;
    var current = this.texts[this.textIndex] || '';
    var processed = this.reverseMode ? current.split('').reverse().join('') : current;

    if (this.isDeleting) {
      if (this.displayed === '') {
        this.isDeleting = false;
        if (this.textIndex === this.texts.length - 1 && !this.loop) return;

        var finished = this.texts[this.textIndex];
        var finishedIndex = this.textIndex;
        if (this.onSentenceComplete) this.onSentenceComplete(finished, finishedIndex);
        this.el.dispatchEvent(new CustomEvent('sentencecomplete', {
          detail: { sentence: finished, index: finishedIndex }
        }));

        this.textIndex = (this.textIndex + 1) % this.texts.length;
        this.charIndex = 0;
        this._applyColor();
        this._timer = setTimeout(function () { self._tick(); }, this.pauseDuration);
      } else {
        this._timer = setTimeout(function () {
          self.displayed = self.displayed.slice(0, -1);
          self._render();
          self._tick();
        }, this.deletingSpeed);
      }
    } else {
      if (this.charIndex < processed.length) {
        this._timer = setTimeout(function () {
          self.displayed += processed.charAt(self.charIndex);
          self.charIndex += 1;
          self._render();
          self._tick();
        }, this._speed());
      } else {
        if (!this.loop && this.textIndex === this.texts.length - 1) { this._render(); return; }
        this._timer = setTimeout(function () {
          self.isDeleting = true;
          self._tick();
        }, this.pauseDuration);
      }
    }
  };

  TextType.prototype.destroy = function () {
    this._destroyed = true;
    clearTimeout(this._timer);
  };

  function fromDataset(el) {
    var d = el.dataset;
    var fallbackText = (el.textContent || '').trim();
    var opts = {
      text: d.text != null ? parseJSON(d.text, d.text) : (fallbackText || ''),
      typingSpeed: toNum(d.typingSpeed),
      initialDelay: toNum(d.initialDelay),
      pauseDuration: toNum(d.pauseDuration),
      deletingSpeed: toNum(d.deletingSpeed),
      loop: toBool(d.loop),
      showCursor: toBool(d.showCursor),
      hideCursorWhileTyping: toBool(d.hideCursorWhileTyping),
      cursorCharacter: d.cursorCharacter,
      cursorBlinkDuration: toNum(d.cursorBlinkDuration),
      cursorClassName: d.cursorClass,
      textColors: d.textColors != null ? parseJSON(d.textColors, []) : undefined,
      variableSpeed: d.variableSpeed != null ? parseJSON(d.variableSpeed, undefined) : undefined,
      startOnVisible: toBool(d.startOnVisible),
      reverseMode: toBool(d.reverseMode),
      highlight: d.highlight,
      highlightClass: d.highlightClass
    };
    Object.keys(opts).forEach(function (k) { if (opts[k] === undefined) delete opts[k]; });
    return new TextType(el, opts);
  }

  function init(root) {
    (root || document).querySelectorAll('[data-text-type]').forEach(function (el) {
      if (el.__textType) return;
      el.__textType = fromDataset(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { init(); });
  } else {
    init();
  }

  TextType.init = init;
  global.TextType = TextType;
})(window);
