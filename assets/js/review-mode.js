(function () {

  var PANEL_W = 360;

  // 現在のページ名（「会社概要 | 株式会社ランステック」→「会社概要」）
  var pageTitle = (function () {
    var t = document.title.split('|')[0].trim();
    return (t === '株式会社ランステック' || t === '') ? 'トップページ' : t;
  }());

  // ── CSS ───────────────────────────────────────────────────────────────────
  var style = document.createElement('style');
  style.textContent =
    'body{transition:padding-right .3s cubic-bezier(.4,0,.2,1);}' +
    'body.rv-open{padding-right:' + PANEL_W + 'px;}' +
    'body.rv-open .mobile-nav{right:' + PANEL_W + 'px;transition:right .3s cubic-bezier(.4,0,.2,1);}' +

    /* プリセットハイライト */
    '.rv-target{background:#fff3cd!important;outline:2px dashed #f0a500!important;' +
    'outline-offset:3px;border-radius:3px!important;cursor:pointer!important;position:relative;}' +
    '.rv-target::after{content:"→ クリックして入力";position:absolute;top:-26px;left:0;' +
    'background:#1a1a1a;color:#fff;font-size:11px;padding:3px 9px;border-radius:5px;' +
    'white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .15s;z-index:1000;}' +
    '.rv-target:hover{background:#ffe8a0!important;}' +
    '.rv-target:hover::after{opacity:1;}' +
    '.rv-target[data-review]::after{content:attr(data-review) " → クリックして入力";}' +
    '.rv-done{background:#d4edda!important;outline-color:#28a745!important;}' +
    '.rv-done::after{content:"✓ 送信済み"!important;}' +

    /* 任意選択ホバー */
    '.rv-free-hover{outline:2px solid #4a90d9!important;outline-offset:2px;' +
    'background:rgba(74,144,217,.07)!important;cursor:crosshair!important;}' +

    /* パネル */
    '.rv-panel{position:fixed;top:0;right:0;height:100%;width:' + PANEL_W + 'px;' +
    'background:#f7f7f8;box-shadow:-1px 0 0 #e4e4e7,-12px 0 40px rgba(0,0,0,.12);' +
    'z-index:9999;display:flex;flex-direction:column;' +
    'transform:translateX(100%);transition:transform .3s cubic-bezier(.4,0,.2,1);}' +
    '.rv-panel.open{transform:translateX(0);}' +

    /* アクセントライン */
    '.rv-panel-accent{height:3px;background:linear-gradient(90deg,#E07898 0%,#c0587a 100%);flex-shrink:0;}' +

    /* ヘッダー */
    '.rv-panel-head{background:#fff;flex-shrink:0;border-bottom:1px solid #f0f0f0;}' +
    '.rv-head-top{padding:14px 16px 0;display:flex;align-items:center;gap:8px;}' +
    '.rv-head-title{font-size:13px;font-weight:700;flex:1;color:#1a1a1a;letter-spacing:.01em;' +
    'font-family:"Noto Sans JP","Hiragino Sans",sans-serif;}' +
    '.rv-panel-cls{background:none;border:none;color:#c0c0c0;width:28px;height:28px;' +
    'display:flex;align-items:center;justify-content:center;cursor:pointer;' +
    'border-radius:7px;transition:background .15s,color .15s;padding:0;flex-shrink:0;}' +
    '.rv-panel-cls:hover{background:#f3f3f3;color:#555;}' +
    '.rv-panel-cls svg{display:block;}' +

    /* タブ */
    '.rv-tabs{display:flex;padding:0 12px;gap:2px;}' +
    '.rv-tab{flex:1;background:none;border:none;border-bottom:2px solid transparent;' +
    'color:#aaa;font-size:12px;font-weight:700;cursor:pointer;letter-spacing:.03em;' +
    'padding:11px 6px;font-family:inherit;transition:all .15s;}' +
    '.rv-tab:hover{color:#666;}' +
    '.rv-tab.active{color:#E07898;border-bottom-color:#E07898;}' +

    /* タブパネル */
    '.rv-tab-pane{display:none;flex:1;overflow-y:auto;' +
    'font-family:"Noto Sans JP","Hiragino Sans",sans-serif;}' +
    '.rv-tab-pane.active{display:flex;flex-direction:column;}' +

    /* ── 送るタブ ── */
    '.rv-send-body{padding:16px;display:flex;flex-direction:column;gap:12px;}' +

    /* ページバッジ */
    '.rv-page-badge{display:flex;align-items:center;gap:8px;padding:10px 13px;' +
    'background:#fff;border:1px solid #ebebeb;border-radius:10px;font-size:12px;' +
    'box-shadow:0 1px 3px rgba(0,0,0,.04);}' +
    '.rv-page-badge-icon{font-size:14px;flex-shrink:0;}' +
    '.rv-page-badge-lbl{font-size:10px;color:#c0c0c0;margin-right:1px;}' +
    '.rv-page-badge-name{font-weight:700;color:#1a1a1a;}' +

    /* 選択中ノーティス */
    '.rv-notice{display:none;flex-direction:column;gap:10px;padding:13px;' +
    'background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:10px;}' +
    '.rv-notice.active{display:flex;}' +
    '.rv-notice-row{display:flex;align-items:center;gap:8px;font-size:13px;color:#1d4ed8;}' +
    '.rv-notice-icon{font-size:18px;flex-shrink:0;animation:rv-pulse 1.4s ease-in-out infinite;}' +
    '@keyframes rv-pulse{0%,100%{opacity:1}50%{opacity:.4}}' +
    '.rv-notice-txt{line-height:1.55;}' +
    '.rv-notice-cancel{background:#fff;border:1.5px solid #bfdbfe;border-radius:8px;' +
    'color:#1d4ed8;padding:8px 12px;font-size:12px;cursor:pointer;' +
    'font-family:inherit;width:100%;font-weight:700;transition:background .15s;}' +
    '.rv-notice-cancel:hover{background:#dbeafe;}' +

    /* 箇所選択ボタン */
    '.rv-sel-btn{display:flex;align-items:center;gap:10px;padding:12px 14px;' +
    'border:1.5px dashed #c7d9f5;border-radius:10px;cursor:pointer;' +
    'font-size:13px;color:#3b6fd4;background:#fff;width:100%;' +
    'font-family:inherit;transition:all .15s;text-align:left;box-shadow:0 1px 3px rgba(0,0,0,.04);}' +
    '.rv-sel-btn:hover{border-color:#3b6fd4;background:#eff6ff;border-style:solid;}' +
    '.rv-sel-icon{font-size:18px;flex-shrink:0;}' +
    '.rv-sel-sub{display:block;font-size:11px;color:#93b0e0;margin-top:2px;}' +

    /* フォーム */
    '.rv-form-area{display:flex;flex-direction:column;gap:12px;transition:opacity .2s;}' +
    '.rv-form-area.dimmed{opacity:.3;pointer-events:none;}' +
    '.rv-divider{display:flex;align-items:center;gap:8px;font-size:11px;color:#d4d4d4;}' +
    '.rv-divider::before,.rv-divider::after{content:"";flex:1;height:1px;background:#ebebeb;}' +
    '.rv-label{font-size:11px;font-weight:700;color:#999;display:block;margin-bottom:4px;letter-spacing:.04em;}' +
    '.rv-req{color:#E07898;}' +
    '.rv-input{width:100%;border:1.5px solid #e8e8e8;border-radius:9px;padding:10px 12px;' +
    'font-size:13px;font-family:inherit;box-sizing:border-box;' +
    'transition:border .15s,box-shadow .15s;outline:none;color:#1a1a1a;background:#fff;}' +
    '.rv-input:focus{border-color:#E07898;box-shadow:0 0 0 3px rgba(224,120,152,.1);}' +
    '.rv-input.err{border-color:#ef4444!important;box-shadow:0 0 0 3px rgba(239,68,68,.08)!important;}' +
    '.rv-textarea{width:100%;border:1.5px solid #e8e8e8;border-radius:9px;padding:10px 12px;' +
    'font-size:13px;font-family:inherit;resize:vertical;min-height:90px;' +
    'line-height:1.65;box-sizing:border-box;transition:border .15s,box-shadow .15s;outline:none;color:#1a1a1a;background:#fff;}' +
    '.rv-textarea:focus{border-color:#E07898;box-shadow:0 0 0 3px rgba(224,120,152,.1);}' +
    '.rv-textarea.err{border-color:#ef4444!important;box-shadow:0 0 0 3px rgba(239,68,68,.08)!important;}' +
    '.rv-ctx{font-size:12px;color:#999;background:#f7f7f8;border-radius:8px;' +
    'padding:8px 11px;line-height:1.55;word-break:break-all;border:1px solid #ebebeb;}' +
    '.rv-ctx-lbl{font-size:10px;font-weight:700;color:#c8c8c8;letter-spacing:.06em;' +
    'text-transform:uppercase;margin-bottom:4px;display:block;}' +
    '.rv-submit{background:#E07898;color:#fff;border:none;border-radius:10px;' +
    'padding:13px;font-size:13px;font-weight:700;cursor:pointer;width:100%;letter-spacing:.03em;' +
    'font-family:inherit;transition:background .15s,box-shadow .15s;}' +
    '.rv-submit:hover:not(:disabled){background:#d4698a;box-shadow:0 4px 14px rgba(224,120,152,.35);}' +
    '.rv-submit:disabled{opacity:.5;cursor:not-allowed;}' +

    /* ── 一覧タブ ── */
    '.rv-list-head{padding:12px 16px;border-bottom:1px solid #f0f0f0;background:#fff;' +
    'display:flex;align-items:center;justify-content:space-between;flex-shrink:0;}' +
    '.rv-list-count{font-size:12px;color:#b0b0b0;font-weight:500;}' +
    '.rv-list-refresh{background:none;border:1.5px solid #ebebeb;border-radius:8px;' +
    'color:#b0b0b0;padding:5px 11px;font-size:11px;cursor:pointer;font-family:inherit;transition:all .15s;}' +
    '.rv-list-refresh:hover{border-color:#ccc;color:#555;background:#f7f7f8;}' +
    '.rv-list-body{flex:1;overflow-y:auto;padding:10px 12px;}' +
    '.rv-list-loading{padding:48px 16px;text-align:center;color:#ccc;font-size:13px;}' +
    '.rv-list-empty{padding:48px 16px;text-align:center;color:#ccc;font-size:13px;}' +
    '.rv-list-empty-icon{font-size:36px;margin-bottom:12px;opacity:.5;}' +

    /* フィードバックアイテム（カード） */
    '.rv-fb-item{background:#fff;border:1px solid #ebebeb;border-radius:12px;' +
    'margin-bottom:8px;padding:13px 14px;box-shadow:0 1px 3px rgba(0,0,0,.04);' +
    'transition:box-shadow .15s,border-color .15s;}' +
    '.rv-fb-item:hover{box-shadow:0 3px 10px rgba(0,0,0,.08);border-color:#e0e0e0;}' +
    '.rv-fb-label{font-size:12px;font-weight:700;color:#1a1a1a;margin-bottom:8px;' +
    'display:flex;align-items:center;gap:5px;flex-wrap:wrap;line-height:1.4;}' +
    '.rv-fb-page{font-size:10px;font-weight:500;color:#aaa;' +
    'background:#f5f5f5;border-radius:20px;padding:2px 8px;border:1px solid #ebebeb;white-space:nowrap;}' +
    '.rv-type-badge{font-size:16px;margin-right:6px;flex-shrink:0;}' +
    '.rv-priority-badge{font-size:9px;font-weight:700;padding:2px 6px;border-radius:10px;' +
    'margin-left:6px;letter-spacing:.02em;}' +
    '.rv-comment-badge{font-size:10px;font-weight:600;padding:2px 7px;border-radius:10px;' +
    'background:#e3f2fd;color:#0969da;margin-left:6px;white-space:nowrap;}' +
    '.rv-fb-suggestion{font-size:13px;color:#166534;background:#f0fdf4;' +
    'border:1px solid #bbf7d0;padding:9px 11px;border-radius:8px;' +
    'line-height:1.6;margin-bottom:8px;word-break:break-word;}' +
    '.rv-fb-meta{font-size:11px;color:#c8c8c8;display:flex;gap:8px;align-items:center;}' +

    /* FAB */
    '.rv-fab{position:fixed;bottom:24px;right:24px;z-index:10000;' +
    'background:#E07898;color:#fff;border:none;border-radius:50%;' +
    'width:52px;height:52px;padding:0;cursor:pointer;' +
    'box-shadow:0 4px 20px rgba(224,120,152,.4);' +
    'display:flex;align-items:center;justify-content:center;' +
    'transition:right .3s cubic-bezier(.4,0,.2,1),background .2s,transform .15s,box-shadow .2s;' +
    'font-family:"Noto Sans JP","Hiragino Sans",sans-serif;}' +
    '.rv-fab:hover{background:#d4698a;box-shadow:0 6px 24px rgba(224,120,152,.5);}' +
    '.rv-fab:active{transform:scale(.93);}' +
    '.rv-fab svg{width:22px;height:22px;display:block;}' +
    '.rv-page-badge-icon svg,.rv-notice-icon svg,.rv-sel-icon svg{width:1em;height:1em;display:block;}' +
    '.rv-list-empty-icon svg{width:34px;height:34px;display:inline-block;}' +
    '.rv-list-refresh svg,.rv-fb-edit-btn svg,.rv-fb-del-btn svg{width:13px;height:13px;vertical-align:-2px;margin-right:4px;}' +
    'body.rv-open .rv-fab{right:' + (PANEL_W + 16) + 'px;}' +
    /* 画面構成ドキュメントへのFAB（フィードバックFABの真上に積む） */
    '.rv-fab-spec{position:fixed;bottom:88px;right:24px;z-index:10000;' +
    'background:#333;color:#fff;border:none;border-radius:50%;' +
    'width:52px;height:52px;padding:0;cursor:pointer;text-decoration:none;' +
    'box-shadow:0 4px 20px rgba(0,0,0,.22);' +
    'display:flex;align-items:center;justify-content:center;' +
    'transition:right .3s cubic-bezier(.4,0,.2,1),background .2s,transform .15s,box-shadow .2s;' +
    'font-family:"Noto Sans JP","Hiragino Sans",sans-serif;}' +
    '.rv-fab-spec:hover{background:#1a1a1a;box-shadow:0 6px 24px rgba(0,0,0,.3);}' +
    '.rv-fab-spec:active{transform:scale(.93);}' +
    '.rv-fab-spec svg{width:22px;height:22px;display:block;}' +
    'body.rv-open .rv-fab-spec{right:' + (PANEL_W + 16) + 'px;}' +

    /* トースト */
    '.rv-toast{position:fixed;bottom:80px;left:50%;transform:translateX(-50%) translateY(10px);' +
    'background:#1a1a1a;color:#fff;font-size:13px;font-weight:500;padding:11px 20px;border-radius:10px;' +
    'z-index:10001;opacity:0;transition:all .22s;white-space:nowrap;' +
    'box-shadow:0 8px 24px rgba(0,0,0,.18);pointer-events:none;' +
    'font-family:"Noto Sans JP","Hiragino Sans",sans-serif;}' +
    '.rv-toast.show{opacity:1;transform:translateX(-50%) translateY(0);}' +
    '.rv-toast.err{background:#dc2626;}' +

    /* ステータスバッジ（ピル型） */
    '.rv-fb-status{display:inline-block;font-size:10px;font-weight:700;padding:2px 8px;' +
    'border-radius:20px;margin-left:auto;flex-shrink:0;letter-spacing:.02em;}' +
    '.rv-status-todo{background:#f4f4f5;color:#a1a1aa;}' +
    '.rv-status-wip{background:#dbeafe;color:#1d4ed8;}' +
    '.rv-status-done{background:#dcfce7;color:#15803d;}' +
    '.rv-status-skip{background:#fef3c7;color:#b45309;}' +
    '.rv-status-select{margin-left:auto;flex-shrink:0;font-size:10px;font-weight:700;border:1px solid rgba(0,0,0,.12);border-radius:3px;padding:2px 4px;cursor:pointer;font-family:inherit;line-height:1.4;}' +

    /* 編集・削除アクション */
    '.rv-fb-actions{display:flex;gap:6px;margin-top:8px;}' +
    '.rv-fb-edit-btn{background:#f7f7f8;border:1px solid #ebebeb;border-radius:8px;' +
    'padding:4px 11px;font-size:11px;cursor:pointer;font-family:inherit;' +
    'color:#777;font-weight:500;transition:all .15s;}' +
    '.rv-fb-edit-btn:hover{background:#ebebeb;color:#333;border-color:#ddd;}' +
    '.rv-fb-del-btn{background:#fff;border:1px solid #fecdd3;border-radius:8px;' +
    'padding:4px 11px;font-size:11px;cursor:pointer;font-family:inherit;' +
    'color:#dc2626;font-weight:500;transition:all .15s;}' +
    '.rv-fb-del-btn:hover{background:#fff1f2;border-color:#fca5a5;}' +

    /* インライン編集UI */
    '.rv-edit-ta{width:100%;border:1.5px solid #E07898;border-radius:9px;padding:9px 11px;' +
    'font-size:13px;font-family:inherit;resize:vertical;min-height:70px;line-height:1.6;' +
    'box-sizing:border-box;outline:none;margin-bottom:8px;display:block;' +
    'box-shadow:0 0 0 3px rgba(224,120,152,.1);}' +
    '.rv-edit-btns{display:flex;gap:6px;}' +
    '.rv-edit-save{background:#E07898;color:#fff;border:none;border-radius:8px;' +
    'padding:5px 14px;font-size:12px;cursor:pointer;font-family:inherit;font-weight:700;transition:background .15s;}' +
    '.rv-edit-save:hover{background:#d4698a;}' +
    '.rv-edit-cancel{background:#f7f7f8;border:1px solid #ebebeb;border-radius:8px;' +
    'padding:5px 14px;font-size:12px;cursor:pointer;font-family:inherit;color:#777;transition:all .15s;}' +
    '.rv-edit-cancel:hover{background:#ebebeb;}';

  document.head.appendChild(style);

  // ── プリセットターゲット検索 ──────────────────────────────────────────────
  var seen = new Set();
  var targets = [];
  document.querySelectorAll('[data-review]').forEach(function (el) {
    if (!seen.has(el)) { seen.add(el); targets.push(el); }
  });
  var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
  var node;
  while ((node = walker.nextNode())) {
    if (/●|（仮）/.test(node.textContent)) {
      var el = node.parentElement;
      if (el && !['SCRIPT','STYLE','BUTTON','A'].includes(el.tagName) && !seen.has(el)) {
        seen.add(el); targets.push(el);
      }
    }
  }

  // ── DOM 構築 ───────────────────────────────────────────────────────────────
  var panel = document.createElement('div');
  panel.className = 'rv-panel';
  panel.innerHTML =
    '<div class="rv-panel-accent"></div>' +
    '<div class="rv-panel-head">' +
      '<div class="rv-head-top">' +
        '<span class="rv-head-title">フィードバック</span>' +
        '<button class="rv-panel-cls" id="rv-panel-cls" aria-label="閉じる">' +
          '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="rv-tabs">' +
        '<button class="rv-tab active" id="rv-tab-send-btn">送る</button>' +
        '<button class="rv-tab" id="rv-tab-list-btn">一覧を見る</button>' +
      '</div>' +
    '</div>' +

    /* 送るタブ */
    '<div class="rv-tab-pane active" id="rv-pane-send">' +
      '<div class="rv-send-body">' +
        '<div class="rv-page-badge">' +
          '<span class="rv-page-badge-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg></span>' +
          '<span class="rv-page-badge-lbl">現在のページ</span>' +
          '<span class="rv-page-badge-name" id="rv-page-name"></span>' +
        '</div>' +
        '<div class="rv-notice" id="rv-notice">' +
          '<div class="rv-notice-row">' +
            '<span class="rv-notice-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/></svg></span>' +
            '<span class="rv-notice-txt">左側のページ上で<br>箇所をクリックしてください</span>' +
          '</div>' +
          '<button class="rv-notice-cancel" id="rv-notice-cancel">キャンセル</button>' +
        '</div>' +
        '<button class="rv-sel-btn" id="rv-sel-btn">' +
          '<span class="rv-sel-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/></svg></span>' +
          '<span>箇所を選択してコメント' +
            '<span class="rv-sel-sub">ページ上の任意の箇所をクリックして指定</span>' +
          '</span>' +
        '</button>' +
        '<div class="rv-divider" id="rv-divider">または直接入力</div>' +
        '<div class="rv-form-area" id="rv-form-area">' +
          '<div id="rv-loc-wrap">' +
            '<label class="rv-label" for="rv-loc">どの箇所？ <span class="rv-req">*</span></label>' +
            '<input class="rv-input" id="rv-loc" type="text" placeholder="例：採用ページの給与欄">' +
          '</div>' +
          '<div id="rv-ctx-wrap" style="display:none">' +
            '<span class="rv-ctx-lbl">選択した箇所</span>' +
            '<div class="rv-ctx" id="rv-ctx"></div>' +
          '</div>' +
          '<div>' +
            '<label class="rv-label" for="rv-ta">フィードバック内容 <span class="rv-req">*</span></label>' +
            '<textarea class="rv-textarea" id="rv-ta" placeholder="ご意見・修正案などをご記入ください..."></textarea>' +
          '</div>' +
          '<div>' +
            '<label class="rv-label" for="rv-author">お名前（任意）</label>' +
            '<input class="rv-input" id="rv-author" type="text" placeholder="例：山田">' +
          '</div>' +
          '<button class="rv-submit" id="rv-submit">送信する</button>' +
        '</div>' +
      '</div>' +
    '</div>' +

    /* 一覧タブ */
    '<div class="rv-tab-pane" id="rv-pane-list">' +
      '<div class="rv-list-head">' +
        '<span class="rv-list-count" id="rv-list-count"></span>' +
        '<button class="rv-list-refresh" id="rv-list-refresh"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/></svg>更新</button>' +
      '</div>' +
      '<div class="rv-list-body" id="rv-list-body">' +
        '<div class="rv-list-loading">読み込み中...</div>' +
      '</div>' +
    '</div>';

  document.body.appendChild(panel);

  var ICON_FEEDBACK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 0 1-.9-3.8A8.38 8.38 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z"/></svg>';
  var ICON_CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';

  var fab = document.createElement('button');
  fab.className = 'rv-fab';
  fab.innerHTML = ICON_FEEDBACK;
  fab.setAttribute('aria-label', 'フィードバック');
  fab.setAttribute('title', 'フィードバック');
  document.body.appendChild(fab);

  // 画面構成ドキュメント（screens.html）への導線FAB
  var ICON_SPEC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 9v12"/></svg>';
  var specFab = document.createElement('a');
  specFab.className = 'rv-fab-spec';
  specFab.href = '/screens.html';
  specFab.innerHTML = ICON_SPEC;
  specFab.setAttribute('aria-label', '画面構成ドキュメント');
  specFab.setAttribute('title', '画面構成ドキュメント');
  document.body.appendChild(specFab);

  // ── 状態 ──────────────────────────────────────────────────────────────────
  var isFreeMode  = false;
  var freeHoverEl = null;
  var currentEl   = null;
  var currentTab  = 'send';

  document.getElementById('rv-page-name').textContent = pageTitle;

  var notice   = document.getElementById('rv-notice');
  var selBtn   = document.getElementById('rv-sel-btn');
  var formArea = document.getElementById('rv-form-area');

  function isWidget(el) {
    return panel.contains(el) || fab === el || fab.contains(el) || specFab === el || specFab.contains(el);
  }

  // ── タブ切り替え ───────────────────────────────────────────────────────────
  function switchTab(tab) {
    currentTab = tab;
    document.getElementById('rv-tab-send-btn').classList.toggle('active', tab === 'send');
    document.getElementById('rv-tab-list-btn').classList.toggle('active', tab === 'list');
    document.getElementById('rv-pane-send').classList.toggle('active', tab === 'send');
    document.getElementById('rv-pane-list').classList.toggle('active', tab === 'list');
    if (tab === 'list') loadList();
  }

  document.getElementById('rv-tab-send-btn').addEventListener('click', function () { switchTab('send'); });
  document.getElementById('rv-tab-list-btn').addEventListener('click', function () { switchTab('list'); });

  // ── パネル開閉 ─────────────────────────────────────────────────────────────
  function openPanel(tab) {
    panel.classList.add('open');
    document.body.classList.add('rv-open');
    fab.innerHTML = ICON_CLOSE;
    fab.setAttribute('aria-label', '閉じる');
    fab.setAttribute('title', '閉じる');
    if (tab) switchTab(tab);
  }

  function closePanel() {
    panel.classList.remove('open');
    document.body.classList.remove('rv-open');
    fab.innerHTML = ICON_FEEDBACK;
    fab.setAttribute('aria-label', 'フィードバック');
    fab.setAttribute('title', 'フィードバック');
    endFreeMode();
  }

  fab.addEventListener('click', function () {
    panel.classList.contains('open') ? closePanel() : openPanel();
  });
  document.getElementById('rv-panel-cls').addEventListener('click', closePanel);

  // ── フォームリセット・入力 ─────────────────────────────────────────────────
  function resetForm() {
    currentEl = null;
    document.getElementById('rv-loc').value = '';
    document.getElementById('rv-loc').classList.remove('err');
    document.getElementById('rv-ta').value = '';
    document.getElementById('rv-ta').classList.remove('err');
    document.getElementById('rv-author').value = '';
    document.getElementById('rv-ctx-wrap').style.display = 'none';
    document.getElementById('rv-ctx').textContent = '';
    // 手入力モードに戻す（「どの箇所？」欄・区切りを再表示）
    document.getElementById('rv-loc-wrap').style.display = '';
    document.getElementById('rv-divider').style.display = '';
  }

  // 選択した要素から「どの箇所か」を自動で読み取り、読みやすいラベルを作る
  function describeElement(el) {
    var heading = '';
    var secAnc = el.closest('section, header, footer');
    if (secAnc) {
      var h = secAnc.querySelector('h1, h2, h3, .eyebrow, .title');
      if (h) heading = h.textContent.trim().replace(/\s+/g, ' ');
    }
    var own = el.textContent.trim().replace(/\s+/g, ' ');
    var snippet = own ? (own.length > 24 ? own.slice(0, 24) + '…' : own) : '';
    var parts = [];
    if (heading) parts.push(heading);
    if (snippet && snippet !== heading) parts.push('「' + snippet + '」');
    if (!parts.length) parts.push(el.tagName.toLowerCase() + '要素');
    return parts.join(' / ');
  }

  function fillFromElement(el) {
    currentEl = el;
    // data-review があればそれを、無ければ選択箇所から自動生成（送信用ラベル）
    var label = el.dataset.review || describeElement(el);
    var cur   = el.textContent.trim();
    var locEl = document.getElementById('rv-loc');
    locEl.value = label;          // 送信用に保持（欄自体は隠す）
    locEl.classList.remove('err');
    // 選択時は「どの箇所？」の手入力欄・区切りは不要なので隠す
    document.getElementById('rv-loc-wrap').style.display = 'none';
    document.getElementById('rv-divider').style.display = 'none';
    // 選択した箇所を表示（テキストがなければ自動ラベルを表示）
    var ctxText = cur || label;
    document.getElementById('rv-ctx').textContent = ctxText.length > 120 ? ctxText.slice(0,120)+'…' : ctxText;
    document.getElementById('rv-ctx-wrap').style.display = '';
    // コメント入力欄へフォーカス
    setTimeout(function () { document.getElementById('rv-ta').focus(); }, 80);
  }

  // ── 任意選択モード ─────────────────────────────────────────────────────────
  function startFreeMode() {
    isFreeMode = true;
    notice.classList.add('active');
    selBtn.style.display = 'none';
    formArea.classList.add('dimmed');
  }

  function endFreeMode() {
    if (!isFreeMode) return;
    isFreeMode = false;
    notice.classList.remove('active');
    selBtn.style.display = '';
    formArea.classList.remove('dimmed');
    if (freeHoverEl) { freeHoverEl.classList.remove('rv-free-hover'); freeHoverEl = null; }
  }

  selBtn.addEventListener('click', startFreeMode);
  document.getElementById('rv-notice-cancel').addEventListener('click', endFreeMode);

  document.addEventListener('mouseover', function (e) {
    if (!isFreeMode) return;
    var el = e.target;
    if (isWidget(el)) return;
    if (freeHoverEl && freeHoverEl !== el) freeHoverEl.classList.remove('rv-free-hover');
    freeHoverEl = el;
    el.classList.add('rv-free-hover');
  });

  document.addEventListener('mouseout', function (e) {
    if (!isFreeMode || !freeHoverEl) return;
    if (!e.relatedTarget || !freeHoverEl.contains(e.relatedTarget)) {
      freeHoverEl.classList.remove('rv-free-hover');
      freeHoverEl = null;
    }
  });

  document.addEventListener('click', function (e) {
    if (!isFreeMode) return;
    var el = e.target;
    if (isWidget(el)) return;
    e.preventDefault();
    e.stopPropagation();
    if (freeHoverEl) { freeHoverEl.classList.remove('rv-free-hover'); freeHoverEl = null; }
    endFreeMode();
    fillFromElement(el);
    switchTab('send');
    if (!panel.classList.contains('open')) openPanel();
  }, true);

  // ── プリセットターゲットのクリック ────────────────────────────────────────
  targets.forEach(function (el) {
    el.classList.add('rv-target');
    el.addEventListener('click', function (e) {
      if (isFreeMode) return;
      e.stopPropagation();
      resetForm();
      fillFromElement(el);
      switchTab('send');
      openPanel();
    });
  });

  // ── セッションID管理 ───────────────────────────────────────────────────────
  function getSessionIds() {
    try { return JSON.parse(sessionStorage.getItem('rv_session_ids') || '[]'); }
    catch (e) { return []; }
  }
  function addSessionId(id) {
    var ids = getSessionIds();
    if (ids.indexOf(id) === -1) { ids.push(id); sessionStorage.setItem('rv_session_ids', JSON.stringify(ids)); }
  }
  function removeSessionId(id) {
    var ids = getSessionIds().filter(function (i) { return i !== id; });
    sessionStorage.setItem('rv_session_ids', JSON.stringify(ids));
  }

  var STATUSES = ['未対応', '対応中', '対応済み', '見送り'];
  var stClsMap = { '未対応': 'rv-status-todo', '対応中': 'rv-status-wip', '対応済み': 'rv-status-done', '見送り': 'rv-status-skip' };

  // ── 一覧クリックハンドラ（委譲） ──────────────────────────────────────────
  function listClickHandler(e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    var item = btn.closest('.rv-fb-item');
    if (!item) return;
    var id     = item.dataset.id;
    var action = btn.dataset.action;
    var count  = document.getElementById('rv-list-count');

    if (action === 'delete') {
      if (!confirm('このフィードバックを削除しますか？')) return;
      fetch('/api/feedback?id=' + encodeURIComponent(id), { method: 'DELETE' })
        .then(function (res) {
          if (!res.ok) throw new Error();
          item.remove();
          removeSessionId(id);
          var remaining = document.getElementById('rv-list-body').querySelectorAll('.rv-fb-item').length;
          count.textContent = remaining + ' 件';
        })
        .catch(function () { showToast('削除に失敗しました', true); });
    }

    if (action === 'edit') {
      var sugg = item.querySelector('.rv-fb-suggestion');
      var orig = sugg.dataset.original;
      item.querySelector('.rv-fb-actions').style.display = 'none';
      sugg.innerHTML =
        '<textarea class="rv-edit-ta">' + esc(orig) + '</textarea>' +
        '<div class="rv-edit-btns">' +
          '<button class="rv-edit-save" data-action="save">保存</button>' +
          '<button class="rv-edit-cancel" data-action="cancel">キャンセル</button>' +
        '</div>';
      sugg.querySelector('textarea').focus();
    }

    if (action === 'cancel') {
      var sugg = item.querySelector('.rv-fb-suggestion');
      var orig = sugg.dataset.original;
      sugg.innerHTML = esc(orig);
      item.querySelector('.rv-fb-actions').style.display = '';
    }

    if (action === 'save') {
      var sugg = item.querySelector('.rv-fb-suggestion');
      var ta   = sugg.querySelector('textarea');
      var newText = ta.value.trim();
      if (!newText) { ta.style.borderColor = '#d32f2f'; ta.focus(); return; }
      var saveBtn = btn;
      saveBtn.textContent = '保存中...';
      saveBtn.disabled = true;
      fetch('/api/feedback?id=' + encodeURIComponent(id), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestion: newText }),
      })
        .then(function (res) {
          if (!res.ok) throw new Error();
          sugg.dataset.original = newText;
          sugg.innerHTML = esc(newText);
          item.querySelector('.rv-fb-actions').style.display = '';
          showToast('更新しました');
        })
        .catch(function () {
          showToast('更新に失敗しました', true);
          saveBtn.textContent = '保存';
          saveBtn.disabled = false;
        });
    }
  }

  // ── ステータス変更（サーバーは管理者キー一致時のみ許可）─────────────────────
  function statusChangeHandler(e) {
    var sel = e.target.closest('select[data-action="status"]');
    if (!sel) return;
    var item = sel.closest('.rv-fb-item');
    if (!item) return;
    var id = item.dataset.id;
    var newStatus = sel.value;
    var prev = sel.dataset.prev || '';
    if (newStatus === prev) return;
    sel.disabled = true;
    fetch('/api/feedback?id=' + encodeURIComponent(id), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
      .then(function (res) {
        if (!res.ok) throw new Error();
        sel.className = 'rv-status-select ' + (stClsMap[newStatus] || 'rv-status-todo');
        sel.dataset.prev = newStatus;
        showToast('ステータスを更新しました');
      })
      .catch(function () {
        showToast('ステータス更新に失敗しました', true);
        sel.value = prev;
      })
      .finally(function () { sel.disabled = false; });
  }

  // ── フィードバック一覧 ─────────────────────────────────────────────────────
  function loadList() {
    var bodyEl = document.getElementById('rv-list-body');
    var count  = document.getElementById('rv-list-count');

    // ノードを置き換えて古いイベントリスナーを除去
    var newBody = bodyEl.cloneNode(false);
    bodyEl.parentNode.replaceChild(newBody, bodyEl);
    bodyEl = newBody;

    bodyEl.innerHTML = '<div class="rv-list-loading">読み込み中...</div>';
    count.textContent = '';

    var sessionIds  = getSessionIds();

    fetch('/api/feedback')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var items = data.items || [];
        count.textContent = items.length + ' 件';
        if (items.length === 0) {
          bodyEl.innerHTML =
            '<div class="rv-list-empty">' +
            '<div class="rv-list-empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 6.5 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-5.5A2 2 0 0 0 16.8 5H7.2a2 2 0 0 0-1.7 1.5z"/></svg></div>' +
            'まだフィードバックはありません</div>';
          return;
        }
        bodyEl.innerHTML = items.map(function (item) {
          var d = new Date(item.created_at);
          var date = (d.getMonth()+1) + '/' + d.getDate() +
            ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
          var isOwn   = sessionIds.indexOf(item.id) !== -1;
          var stLabel = item.status || '未対応';
          var stCls   = stClsMap[stLabel] || 'rv-status-todo';

          // タイプアイコン
          var typeIcons = { bug: '🐛', feature: '✨', question: '❓', feedback: '💬' };
          var typeLabels = { bug: 'バグ', feature: '機能', question: '質問', feedback: 'FB' };
          var typeIcon = typeIcons[item.type] || '💬';
          var typeLabel = typeLabels[item.type] || 'FB';

          // 優先度バッジ
          var priorityLabels = { urgent: '緊急', high: '高', medium: '中', low: '低' };
          var priorityColors = { urgent: '#dc2626', high: '#ea580c', medium: '#0284c7', low: '#64748b' };
          var priorityLabel = priorityLabels[item.priority] || '中';
          var priorityColor = priorityColors[item.priority] || '#0284c7';

          // コメント数バッジ
          var commentCount = item.comment_count || 0;
          var commentBadge = commentCount > 0
            ? '<span class="rv-comment-badge">💬 ' + commentCount + '</span>'
            : '';

          return '<div class="rv-fb-item" data-id="' + esc(item.id) + '">' +
            '<div class="rv-fb-label">' +
              '<span class="rv-type-badge" title="' + typeLabel + '">' + typeIcon + '</span>' +
              esc(item.label || '（箇所未指定）') +
              '<span class="rv-fb-page">' + esc(item.page || '') + '</span>' +
              '<span class="rv-priority-badge" style="background:' + priorityColor + ';color:#fff;">' + priorityLabel + '</span>' +
              commentBadge +
              '<select class="rv-status-select ' + stCls + '" data-action="status" data-prev="' + esc(stLabel) + '">' +
                STATUSES.map(function (s) { return '<option value="' + s + '"' + (s === stLabel ? ' selected' : '') + '>' + s + '</option>'; }).join('') +
              '</select>' +
            '</div>' +
            '<div class="rv-fb-suggestion" data-original="' + esc(item.suggestion) + '">' + esc(item.suggestion) + '</div>' +
            '<div class="rv-fb-meta">' +
              '<span>' + esc(item.author || '匿名') + '</span>' +
              '<span>' + date + '</span>' +
            '</div>' +
            '<div class="rv-fb-actions">' +
              '<button class="rv-fb-edit-btn" data-action="edit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>編集</button>' +
              '<button class="rv-fb-del-btn" data-action="delete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>削除</button>' +
            '</div>' +
          '</div>';
        }).join('');
        bodyEl.addEventListener('click', listClickHandler);
        bodyEl.addEventListener('change', statusChangeHandler);
      })
      .catch(function () {
        bodyEl.innerHTML = '<div class="rv-list-empty">読み込みに失敗しました</div>';
      });
  }

  document.getElementById('rv-list-refresh').addEventListener('click', loadList);

  function pad(n) { return n < 10 ? '0' + n : String(n); }
  function esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ── 送信 ──────────────────────────────────────────────────────────────────
  function showToast(msg, isErr) {
    var t = document.createElement('div');
    t.className = 'rv-toast' + (isErr ? ' err' : '');
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { t.classList.add('show'); });
    });
    setTimeout(function () {
      t.classList.remove('show');
      setTimeout(function () { t.remove(); }, 300);
    }, 3500);
  }

  document.getElementById('rv-submit').addEventListener('click', function () {
    var locEl = document.getElementById('rv-loc');
    var taEl  = document.getElementById('rv-ta');
    var loc   = locEl.value.trim();
    // 手入力が空でも、箇所を選択していれば自動でラベルを補完
    if (!loc && currentEl) loc = describeElement(currentEl);
    var text  = taEl.value.trim();
    var valid = true;

    if (!loc)  { locEl.classList.add('err'); valid = false; } else { locEl.classList.remove('err'); }
    if (!text) { taEl.classList.add('err');  valid = false; } else { taEl.classList.remove('err'); }
    if (!valid) { (!loc ? locEl : taEl).focus(); return; }

    var btn    = this;
    btn.textContent = '送信中...';
    btn.disabled = true;

    var cur    = currentEl ? currentEl.textContent.trim() : '';
    var author = document.getElementById('rv-author').value.trim() || '匿名';
    var sentEl = currentEl;

    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: pageTitle, label: loc, current: cur, text: text, author: author }),
    })
      .then(function (res) {
        if (!res.ok) { var e = new Error('http'); e.status = res.status; throw e; }
        return res.json();
      })
      .then(function (data) {
        if (data && data.id) addSessionId(data.id);
        if (sentEl && sentEl.classList.contains('rv-target')) sentEl.classList.add('rv-done');
        closePanel();
        showToast('フィードバックを送信しました！ありがとうございます。');
        resetForm();
      })
      .catch(function (err) {
        // 404/501 や通信不達は、APIが動いていない環境（ローカルの静的プレビュー等）
        var apiUnavailable = !err || err.name === 'TypeError' ||
          err.status === 404 || err.status === 405 || err.status === 501;
        showToast(
          apiUnavailable
            ? 'この環境ではフィードバック送信は使えません（本番／プレビュー環境でお試しください）。'
            : '送信に失敗しました。時間をおいて再試行してください。',
          true
        );
      })
      .finally(function () {
        btn.textContent = '送信する';
        btn.disabled = false;
      });
  });

})();
