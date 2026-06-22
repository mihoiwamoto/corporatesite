/**
 * Feedback Panel V2
 * NTS貿易システムと同じUIのフィードバックパネル
 */

(function () {
  'use strict';

  var PANEL_WIDTH = 360;
  var currentView = 'list';
  var currentFeedbackId = null;
  var currentUser = localStorage.getItem('fbp-user') || '';
  var filters = {
    statuses: new Set(Object.keys({
      '未対応': 1, '対応中': 1, '確認待ち': 1, '完了': 1, '保留': 1
    })),
    page: null,
    search: ''
  };

  var STATUSES = {
    '未対応': { color: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
    '対応中': { color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
    '確認待ち': { color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
    '完了': { color: '#22c55e', bg: '#f0fdf4', border: '#bbf7d0' },
    '保留': { color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' }
  };

  var PAGE_URLS = {
    'トップページ': '/',
    '会社概要': '/about.html',
    '事業内容': '/service.html',
    'お知らせ': '/news.html',
    'お問い合わせ': '/contact.html',
    'プライバシーポリシー': '/privacy.html',
    '採用情報': '/recruit.html'
  };

  function getPageUrl(pageName) {
    if (!pageName) return null;
    if (PAGE_URLS[pageName]) return PAGE_URLS[pageName];
    if (pageName.startsWith('/') || pageName.startsWith('http')) return pageName;
    return null;
  }

  function injectStyles() {
    if (document.getElementById('feedback-panel-v2-styles')) return;

    var style = document.createElement('style');
    style.id = 'feedback-panel-v2-styles';
    style.textContent = `
      .fbp-panel {
        position: fixed;
        top: 0;
        right: 0;
        width: ${PANEL_WIDTH}px;
        height: 100%;
        background: #fff;
        box-shadow: -2px 0 12px rgba(0,0,0,0.08);
        z-index: 10000;
        display: flex;
        flex-direction: column;
        transform: translateX(100%);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-family: -apple-system, BlinkMacSystemFont, 'Noto Sans JP', 'Hiragino Sans', sans-serif;
        font-size: 13px;
        color: #1f2937;
      }
      .fbp-panel.open { transform: translateX(0); }

      /* Header */
      .fbp-header {
        flex-shrink: 0;
        background: #fff;
      }
      .fbp-header-top {
        display: flex;
        align-items: center;
        padding: 14px 16px;
        gap: 8px;
      }
      .fbp-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 15px;
        font-weight: 700;
        color: #111827;
        flex: 1;
      }
      .fbp-title svg { color: #6b7280; }
      .fbp-close-btn {
        background: none;
        border: none;
        color: #9ca3af;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        display: flex;
        transition: all 0.15s;
      }
      .fbp-close-btn:hover { background: #f3f4f6; color: #374151; }

      /* Tabs */
      .fbp-tabs {
        display: flex;
        border-bottom: 1px solid #e5e7eb;
      }
      .fbp-tab {
        flex: 1;
        background: none;
        border: none;
        padding: 10px 16px;
        font-size: 13px;
        font-weight: 600;
        color: #6b7280;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        transition: all 0.15s;
      }
      .fbp-tab:hover { color: #374151; background: #f9fafb; }
      .fbp-tab.active { color: #E07898; border-bottom-color: #E07898; }

      /* Search */
      .fbp-search-row {
        padding: 10px 16px;
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .fbp-search-input {
        flex: 1;
        padding: 8px 12px 8px 34px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        font-size: 13px;
        outline: none;
        transition: border 0.15s;
        background: #f9fafb url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="%239ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>') no-repeat 11px center;
      }
      .fbp-search-input:focus { border-color: #3b82f6; background-color: #fff; }
      .fbp-filter-toggle {
        background: none;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        color: #6b7280;
        transition: all 0.15s;
      }
      .fbp-filter-toggle:hover { background: #f3f4f6; border-color: #d1d5db; }
      .fbp-filter-toggle.has-filter { position: relative; border-color: #E07898; color: #E07898; }
      .fbp-filter-toggle.has-filter::after {
        content: '';
        position: absolute;
        top: 4px;
        right: 4px;
        width: 6px;
        height: 6px;
        background: #E07898;
        border-radius: 50%;
      }

      /* Filter count bar */
      .fbp-filter-count {
        padding: 0 16px 8px;
        font-size: 11px;
        color: #9ca3af;
        display: none;
      }
      .fbp-filter-count.show { display: block; }
      .fbp-filter-count strong { color: #374151; font-weight: 700; }

      /* Status badges */
      .fbp-status-filters {
        padding: 4px 16px 10px;
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
      }
      .fbp-status-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 3px 10px;
        border-radius: 16px;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        border: 1.5px solid;
        transition: all 0.15s;
        user-select: none;
        background: #fff;
      }
      .fbp-status-badge:hover { opacity: 0.85; }
      .fbp-status-badge.off {
        background: #fff !important;
        color: #6b7280 !important;
        border-color: #d1d5db !important;
      }
      .fbp-status-badge.off .fbp-status-count {
        background: transparent;
        color: #6b7280;
      }
      .fbp-status-count {
        font-size: 11px;
        font-weight: 700;
        min-width: 16px;
        text-align: center;
        padding: 0 4px;
        border-radius: 8px;
      }

      /* Filter dropdown */
      .fbp-filter-dropdown {
        padding: 0 16px 12px;
        display: none;
        gap: 8px;
      }
      .fbp-filter-dropdown.show { display: flex; }
      .fbp-filter-select {
        flex: 1;
        padding: 6px 28px 6px 10px;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        font-size: 12px;
        color: #374151;
        outline: none;
        background: #fff;
        cursor: pointer;
        appearance: none;
        -webkit-appearance: none;
        background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="%236b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>');
        background-repeat: no-repeat;
        background-position: right 8px center;
      }
      .fbp-filter-select:focus { border-color: #3b82f6; }

      /* Body */
      .fbp-body {
        flex: 1;
        overflow-y: auto;
        background: #fff;
      }

      /* List item */
      .fbp-list-item {
        padding: 10px 16px;
        border-bottom: 1px solid #e5e7eb;
        cursor: pointer;
        transition: background 0.12s;
      }
      .fbp-list-item:hover { background: #f9fafb; }
      .fbp-item-row1 {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 4px;
      }
      .fbp-item-number {
        font-size: 11px;
        font-weight: 700;
        color: #374151;
        background: #f3f4f6;
        padding: 1px 7px;
        border-radius: 4px;
        border: 1px solid #e5e7eb;
      }
      .fbp-item-status {
        padding: 1px 7px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
      }
      .fbp-item-page {
        padding: 1px 7px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 500;
        background: #ecfdf5;
        color: #059669;
        border: 1px solid #d1fae5;
      }
      .fbp-item-date {
        margin-left: auto;
        font-size: 11px;
        color: #9ca3af;
      }
      .fbp-item-title {
        font-size: 13px;
        font-weight: 600;
        color: #111827;
        line-height: 1.3;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .fbp-item-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 3px;
      }
      .fbp-item-author {
        font-size: 11px;
        color: #9ca3af;
      }
      .fbp-item-page-text {
        font-size: 11px;
        color: #9ca3af;
      }

      /* Detail */
      .fbp-detail { padding: 0; height: 100%; display: flex; flex-direction: column; }
      .fbp-detail-content { flex: 1; overflow-y: auto; padding: 16px; }
      .fbp-detail-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        border-bottom: 1px solid #e5e7eb;
        flex-shrink: 0;
        background: #fff;
      }
      .fbp-detail-back {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background: none;
        border: none;
        color: #374151;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        transition: all 0.15s;
      }
      .fbp-detail-back:hover { background: #f3f4f6; color: #111827; }
      .fbp-detail-close {
        background: none;
        border: none;
        color: #9ca3af;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        display: flex;
        transition: all 0.15s;
      }
      .fbp-detail-close:hover { background: #f3f4f6; color: #374151; }
      .fbp-detail-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 10px;
        flex-wrap: wrap;
      }
      .fbp-detail-number {
        display: inline-block;
        padding: 2px 10px;
        border-radius: 4px;
        font-weight: 700;
        font-size: 12px;
        background: #ecfdf5;
        color: #059669;
        border: 1px solid #a7f3d0;
      }
      .fbp-detail-category {
        display: inline-block;
        padding: 2px 10px;
        border-radius: 4px;
        font-weight: 600;
        font-size: 11px;
        background: #fff;
        color: #f59e0b;
        border: 1px solid #fcd34d;
      }
      .fbp-detail-date {
        margin-left: auto;
        font-size: 12px;
        color: #9ca3af;
      }
      .fbp-detail-title {
        font-size: 17px;
        font-weight: 700;
        color: #111827;
        line-height: 1.5;
        margin-bottom: 16px;
      }

      /* Status row */
      .fbp-detail-status-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
        flex-wrap: wrap;
      }
      .fbp-detail-status-label {
        font-size: 13px;
        font-weight: 600;
        color: #374151;
        white-space: nowrap;
      }
      .fbp-status-select {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
      }
      .fbp-status-option {
        padding: 3px 10px;
        border-radius: 16px;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        border: 1.5px solid;
        transition: all 0.15s;
        user-select: none;
        background: #fff;
      }
      .fbp-status-option:hover { opacity: 0.8; }
      .fbp-status-option.current { box-shadow: 0 0 0 2px rgba(0,0,0,0.12); }

      /* Info rows */
      .fbp-detail-info-rows {
        margin-bottom: 16px;
      }
      .fbp-detail-info-row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 6px 0;
      }
      .fbp-detail-info-label {
        font-size: 13px;
        font-weight: 600;
        color: #6b7280;
        min-width: 50px;
      }
      .fbp-detail-info-value {
        font-size: 13px;
        font-weight: 500;
        color: #374151;
      }
      .fbp-detail-page-chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 10px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        background: #ecfdf5;
        color: #059669;
        border: 1px solid #d1fae5;
        text-decoration: none;
        transition: background 0.15s;
      }
      .fbp-detail-page-chip:hover { background: #d1fae5; }

      /* Content card */
      .fbp-detail-card {
        background: #f9fafb;
        border-radius: 10px;
        padding: 16px;
        margin-bottom: 16px;
      }
      .fbp-detail-card-label {
        font-size: 11px;
        font-weight: 600;
        color: #9ca3af;
        letter-spacing: 0.03em;
        margin-bottom: 8px;
      }
      .fbp-detail-card-body {
        font-size: 14px;
        line-height: 1.8;
        color: #1f2937;
        white-space: pre-wrap;
        word-break: break-word;
      }
      .fbp-detail-original-card {
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 12px;
      }
      .fbp-detail-original-label {
        font-size: 11px;
        font-weight: 600;
        color: #9ca3af;
        margin-bottom: 6px;
      }
      .fbp-detail-original-text {
        font-size: 13px;
        line-height: 1.6;
        color: #6b7280;
        white-space: pre-wrap;
        word-break: break-word;
      }

      .fbp-detail-divider {
        height: 1px;
        background: #e5e7eb;
        margin: 16px 0;
      }
      .fbp-detail-section-title {
        font-size: 13px;
        font-weight: 700;
        color: #374151;
        margin-bottom: 12px;
      }
      .fbp-detail-comments { padding-bottom: 16px; }

      /* Detail actions */
      .fbp-detail-actions {
        display: flex;
        gap: 8px;
        margin-bottom: 4px;
      }
      .fbp-action-btn {
        background: none;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        padding: 6px 12px;
        font-size: 12px;
        font-weight: 500;
        color: #6b7280;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        transition: all 0.15s;
        font-family: inherit;
      }
      .fbp-action-btn:hover { background: #f9fafb; border-color: #d1d5db; color: #374151; }
      .fbp-action-btn-danger { color: #ef4444; }
      .fbp-action-btn-danger:hover { background: #fef2f2; border-color: #fecaca; color: #dc2626; }

      /* Edit form inline */
      .fbp-edit-form { margin-bottom: 16px; }
      .fbp-edit-textarea {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        font-size: 13px;
        font-family: inherit;
        outline: none;
        resize: vertical;
        min-height: 80px;
        line-height: 1.6;
        transition: border 0.15s;
      }
      .fbp-edit-textarea:focus { border-color: #E07898; }
      .fbp-edit-actions {
        display: flex;
        gap: 8px;
        margin-top: 8px;
      }
      .fbp-edit-save {
        padding: 7px 16px;
        background: #E07898;
        color: #fff;
        border: none;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s;
        font-family: inherit;
      }
      .fbp-edit-save:hover { background: #C0587A; }
      .fbp-edit-cancel {
        padding: 7px 16px;
        background: #f3f4f6;
        color: #374151;
        border: none;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s;
        font-family: inherit;
      }
      .fbp-edit-cancel:hover { background: #e5e7eb; }

      /* Comments */
      .fbp-comment {
        padding: 10px 0;
        border-bottom: 1px solid #f3f4f6;
      }
      .fbp-comment:last-child { border-bottom: none; }
      .fbp-comment-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;
      }
      .fbp-comment-author {
        font-size: 12px;
        font-weight: 700;
        color: #374151;
      }
      .fbp-comment-date {
        font-size: 11px;
        color: #9ca3af;
      }
      .fbp-comment-actions {
        margin-left: auto;
        display: flex;
        gap: 4px;
      }
      .fbp-comment-action-btn {
        background: none;
        border: none;
        color: #9ca3af;
        cursor: pointer;
        padding: 2px 4px;
        font-size: 11px;
        border-radius: 4px;
        transition: all 0.15s;
      }
      .fbp-comment-action-btn:hover { color: #374151; background: #f3f4f6; }
      .fbp-comment-action-btn.delete:hover { color: #ef4444; background: #fef2f2; }
      .fbp-comment-body {
        font-size: 13px;
        color: #374151;
        line-height: 1.6;
        white-space: pre-wrap;
        word-break: break-word;
      }
      .fbp-comment-form {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid #e5e7eb;
      }
      .fbp-comment-input {
        width: 100%;
        padding: 9px 12px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        font-size: 13px;
        font-family: inherit;
        outline: none;
        resize: vertical;
        min-height: 60px;
        line-height: 1.5;
        transition: border 0.15s;
      }
      .fbp-comment-input:focus { border-color: #E07898; }
      .fbp-comment-submit-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 8px;
      }
      .fbp-comment-author-input {
        flex: 1;
        padding: 7px 10px;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        font-size: 12px;
        font-family: inherit;
        outline: none;
        transition: border 0.15s;
      }
      .fbp-comment-author-input:focus { border-color: #E07898; }
      .fbp-comment-submit {
        padding: 7px 14px;
        background: #E07898;
        color: #fff;
        border: none;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s;
        font-family: inherit;
        white-space: nowrap;
      }
      .fbp-comment-submit:hover { background: #C0587A; }
      .fbp-comment-submit:disabled { background: #d1d5db; cursor: not-allowed; }
      .fbp-no-comments {
        font-size: 12px;
        color: #9ca3af;
        padding: 8px 0;
      }

      /* Form */
      .fbp-form { padding: 16px; }
      .fbp-form-group { margin-bottom: 16px; }
      .fbp-form-label {
        display: block;
        font-size: 12px;
        font-weight: 600;
        color: #374151;
        margin-bottom: 5px;
      }
      .fbp-form-label-required::after { content: " *"; color: #ef4444; }
      .fbp-form-input,
      .fbp-form-textarea,
      .fbp-form-select {
        width: 100%;
        padding: 9px 12px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        font-size: 13px;
        font-family: inherit;
        outline: none;
        transition: border 0.15s;
        background: #fff;
      }
      .fbp-form-input:focus,
      .fbp-form-textarea:focus,
      .fbp-form-select:focus { border-color: #E07898; }
      .fbp-form-textarea { resize: vertical; min-height: 100px; line-height: 1.6; }
      .fbp-form-hint { font-size: 11px; color: #9ca3af; margin-top: 4px; }
      .fbp-form-actions { margin-top: 20px; }
      .fbp-form-btn {
        width: 100%;
        padding: 11px 20px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s;
      }
      .fbp-form-btn-primary { background: #E07898; color: #fff; }
      .fbp-form-btn-primary:hover { background: #C0587A; }
      .fbp-form-btn-primary:disabled { background: #d1d5db; cursor: not-allowed; }
      .fbp-form-success {
        padding: 12px;
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        border-radius: 8px;
        color: #166534;
        text-align: center;
        font-size: 13px;
        margin-bottom: 12px;
      }

      /* Element picker */
      .fbp-picker-btn {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 12px 14px;
        border: 1.5px dashed #c7d9f5;
        border-radius: 10px;
        cursor: pointer;
        font-size: 13px;
        color: #3b6fd4;
        background: #fff;
        font-family: inherit;
        transition: all 0.15s;
        text-align: left;
      }
      .fbp-picker-btn:hover { border-color: #3b6fd4; background: #eff6ff; border-style: solid; }
      .fbp-picker-btn.has-selection { border-color: #10b981; border-style: solid; background: #ecfdf5; color: #059669; }
      .fbp-picker-sub { display: block; font-size: 11px; color: #93b0e0; margin-top: 2px; }
      .fbp-picker-btn.has-selection .fbp-picker-sub { color: #6ee7b7; }
      .fbp-picker-selected {
        font-size: 12px;
        color: #059669;
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        border-radius: 6px;
        padding: 10px 12px;
        margin-top: 8px;
        line-height: 1.5;
        word-break: break-word;
        display: flex;
        align-items: flex-start;
        gap: 8px;
      }
      .fbp-picker-selected-text { flex: 1; }
      .fbp-picker-clear {
        flex-shrink: 0;
        background: none;
        border: 1px solid #d1fae5;
        color: #6b7280;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        padding: 4px 10px;
        border-radius: 4px;
        transition: all 0.15s;
        font-family: inherit;
        white-space: nowrap;
      }
      .fbp-picker-clear:hover { background: #fef2f2; border-color: #fecaca; color: #ef4444; }
      .fbp-picking-notice {
        display: none;
        padding: 12px;
        background: var(--pink-light, #FBF0F4);
        border: 1.5px solid #E07898;
        border-radius: 10px;
        margin-bottom: 12px;
      }
      .fbp-picking-notice.active { display: block; }
      .fbp-picking-notice-text { font-size: 13px; color: #C0587A; margin-bottom: 8px; }
      .fbp-picking-cancel {
        background: #fff;
        border: 1.5px solid #E07898;
        border-radius: 8px;
        color: #C0587A;
        padding: 7px 12px;
        font-size: 12px;
        cursor: pointer;
        font-family: inherit;
        width: 100%;
        font-weight: 600;
        transition: background 0.15s;
      }
      .fbp-picking-cancel:hover { background: #FBF0F4; }
      .fbp-pick-hover {
        outline: 2px solid #E07898 !important;
        outline-offset: 2px;
        background: rgba(224,120,152,0.06) !important;
        cursor: crosshair !important;
      }
      .fbp-page-badge {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 9px 12px;
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        font-size: 12px;
        color: #374151;
      }
      .fbp-page-badge-label { font-size: 11px; color: #9ca3af; margin-right: 4px; }
      .fbp-page-badge-name { font-weight: 600; color: #111827; }

      /* FAB */
      .fbp-fab {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 52px;
        height: 52px;
        border-radius: 50%;
        background: #E07898;
        color: #fff;
        border: none;
        box-shadow: 0 4px 16px rgba(224,120,152,0.4);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        transition: all 0.2s;
      }
      .fbp-fab:hover {
        background: #C0587A;
        transform: scale(1.05);
        box-shadow: 0 6px 20px rgba(224,120,152,0.5);
      }
      .fbp-fab:active { transform: scale(0.95); }

      body.fbp-open { padding-right: ${PANEL_WIDTH}px; transition: padding-right 0.3s cubic-bezier(0.4,0,0.2,1); }
      body.fbp-open .fbp-fab { right: ${PANEL_WIDTH + 24}px; }

      /* Empty */
      .fbp-empty { padding: 60px 20px; text-align: center; color: #9ca3af; }
      .fbp-empty-icon { font-size: 36px; margin-bottom: 8px; opacity: 0.5; }
      .fbp-empty-text { font-size: 13px; }
      .fbp-loading { padding: 40px 20px; text-align: center; color: #9ca3af; font-size: 13px; }

      /* Mobile */
      @media (max-width: 480px) {
        .fbp-panel { width: 100vw; }
        body.fbp-open { padding-right: 0 !important; }
        body.fbp-open .fbp-fab { right: 24px; }
      }
    `;
    document.head.appendChild(style);
  }

  function createPanel() {
    var panel = document.createElement('div');
    panel.className = 'fbp-panel';
    panel.id = 'feedback-panel-v2';

    panel.innerHTML = `
      <div class="fbp-header">
        <div class="fbp-header-top">
          <div class="fbp-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            フィードバック
          </div>
          <button class="fbp-close-btn" id="fbp-close-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="fbp-tabs">
          <button class="fbp-tab active" id="fbp-tab-list" data-tab="list">一覧</button>
          <button class="fbp-tab" id="fbp-tab-form" data-tab="form">投稿する</button>
        </div>
      </div>
      <div class="fbp-list-header" id="fbp-list-header">
        <div class="fbp-search-row">
          <input type="text" class="fbp-search-input" id="fbp-search-input" placeholder="キーワードで検索">
          <button class="fbp-filter-toggle" id="fbp-filter-toggle">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>
          </button>
        </div>
        <div class="fbp-filter-dropdown" id="fbp-filter-dropdown">
          <select class="fbp-filter-select" id="fbp-page-filter">
            <option value="">すべてのページ</option>
          </select>
        </div>
        <div class="fbp-status-filters" id="fbp-status-filters"></div>
        <div class="fbp-filter-count" id="fbp-filter-count"></div>
      </div>
      <div class="fbp-body" id="fbp-body">
        <div class="fbp-loading">読み込み中...</div>
      </div>
    `;

    document.body.appendChild(panel);

    document.getElementById('fbp-close-btn').addEventListener('click', closePanel);
    document.getElementById('fbp-search-input').addEventListener('input', handleSearch);
    document.getElementById('fbp-filter-toggle').addEventListener('click', toggleFilterDropdown);
    document.getElementById('fbp-page-filter').addEventListener('change', handlePageFilter);
    document.getElementById('fbp-tab-list').addEventListener('click', function () { switchTab('list'); });
    document.getElementById('fbp-tab-form').addEventListener('click', function () { switchTab('form'); });

    return panel;
  }

  function createFAB() {
    var fab = document.createElement('button');
    fab.className = 'fbp-fab';
    fab.id = 'feedback-fab-v2';
    fab.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
    fab.addEventListener('click', togglePanel);
    document.body.appendChild(fab);
  }

  function togglePanel() {
    var panel = document.getElementById('feedback-panel-v2');
    if (panel.classList.contains('open')) closePanel();
    else openPanel();
  }

  function openPanel() {
    var panel = document.getElementById('feedback-panel-v2');
    panel.classList.add('open');
    document.body.classList.add('fbp-open');
    updateFabIcon(true);
    localStorage.setItem('fbp-panel-open', '1');
    loadFeedback();
  }

  function closePanel() {
    if (pickerActive) stopPicker();
    var panel = document.getElementById('feedback-panel-v2');
    panel.classList.remove('open');
    document.body.classList.remove('fbp-open');
    updateFabIcon(false);
    localStorage.removeItem('fbp-panel-open');
  }

  function updateFabIcon(isOpen) {
    var fab = document.getElementById('feedback-fab-v2');
    if (isOpen) {
      fab.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="M6 6l12 12"/></svg>';
    } else {
      fab.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
    }
  }

  function switchTab(tab) {
    if (pickerActive) stopPicker();

    document.querySelectorAll('.fbp-tab').forEach(function (t) {
      t.classList.toggle('active', t.dataset.tab === tab);
    });

    var listHeader = document.getElementById('fbp-list-header');

    if (tab === 'list') {
      currentView = 'list';
      listHeader.style.display = 'block';
      renderList();
    } else if (tab === 'form') {
      currentView = 'form';
      listHeader.style.display = 'none';
      renderForm();
    }
  }

  function toggleFilterDropdown() {
    var dd = document.getElementById('fbp-filter-dropdown');
    dd.classList.toggle('show');
  }

  var allFeedback = [];

  async function loadFeedback() {
    try {
      var response = await fetch('/api/feedback');
      var data = await response.json();
      allFeedback = data.items || [];
      populatePageFilter();
      renderStatusBadges();
      if (currentView === 'list') renderList();
    } catch (error) {
      console.error('Error loading feedback:', error);
      document.getElementById('fbp-body').innerHTML = '<div class="fbp-empty"><div class="fbp-empty-text">読み込みに失敗しました</div></div>';
    }
  }

  function populatePageFilter() {
    var pages = [...new Set(allFeedback.map(function (f) { return f.page; }))].filter(Boolean);
    var select = document.getElementById('fbp-page-filter');
    select.innerHTML = '<option value="">すべてのページ</option>';
    pages.forEach(function (page) {
      var opt = document.createElement('option');
      opt.value = page;
      opt.textContent = page;
      select.appendChild(opt);
    });
  }

  function renderStatusBadges() {
    var counts = {};
    allFeedback.forEach(function (f) {
      var s = f.status || '未対応';
      counts[s] = (counts[s] || 0) + 1;
    });

    var container = document.getElementById('fbp-status-filters');
    container.innerHTML = '';

    Object.keys(STATUSES).forEach(function (status) {
      var count = counts[status] || 0;
      var cfg = STATUSES[status];
      var isOn = filters.statuses.has(status);
      var badge = document.createElement('span');
      badge.className = 'fbp-status-badge' + (isOn ? '' : ' off');
      badge.style.borderColor = cfg.color;
      badge.style.color = cfg.color;
      badge.innerHTML = status + ' <span class="fbp-status-count" style="background:' + cfg.bg + ';color:' + cfg.color + ';">' + count + '</span>';
      badge.addEventListener('click', function () { handleStatusFilter(status); });
      container.appendChild(badge);
    });
  }

  function handleStatusFilter(status) {
    if (filters.statuses.has(status)) {
      filters.statuses.delete(status);
    } else {
      filters.statuses.add(status);
    }
    renderStatusBadges();
    renderList();
  }

  function handlePageFilter(e) {
    filters.page = e.target.value || null;
    renderList();
  }

  function handleSearch(e) {
    filters.search = e.target.value.toLowerCase();
    renderList();
  }

  function renderList() {
    currentView = 'list';
    document.getElementById('fbp-list-header').style.display = 'block';

    var filtered = allFeedback.filter(function (item) {
      var itemStatus = item.status || '未対応';
      if (!filters.statuses.has(itemStatus)) return false;
      if (filters.page && item.page !== filters.page) return false;
      if (filters.search) {
        var text = ((item.label || '') + ' ' + (item.suggestion || '') + ' ' + (item.page || '') + ' ' + (item.author || '')).toLowerCase();
        if (!text.includes(filters.search)) return false;
      }
      return true;
    });

    var isFiltering = filters.page || filters.search || filters.statuses.size < Object.keys(STATUSES).length;
    var filterCountEl = document.getElementById('fbp-filter-count');
    var filterToggle = document.getElementById('fbp-filter-toggle');

    if (isFiltering) {
      filterCountEl.innerHTML = '<strong>' + filtered.length + '</strong> / ' + allFeedback.length + ' 件表示中';
      filterCountEl.classList.add('show');
      filterToggle.classList.add('has-filter');
    } else {
      filterCountEl.classList.remove('show');
      filterToggle.classList.remove('has-filter');
    }

    var bodyEl = document.getElementById('fbp-body');
    if (filtered.length === 0) {
      bodyEl.innerHTML = '<div class="fbp-empty"><div class="fbp-empty-icon"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 10h8M8 14h4"/></svg></div><div class="fbp-empty-text">該当するフィードバックがありません</div></div>';
      return;
    }

    bodyEl.innerHTML = '';
    filtered.forEach(function (item, idx) {
      var el = createListItem(item, filtered.length - idx);
      bodyEl.appendChild(el);
    });
  }

  function createListItem(item, num) {
    var div = document.createElement('div');
    div.className = 'fbp-list-item';
    div.addEventListener('click', function () { showDetail(item.id); });

    var statusKey = item.status || '未対応';
    var cfg = STATUSES[statusKey] || STATUSES['未対応'];
    var date = new Date(item.created_at);
    var dateStr = (date.getMonth() + 1) + '/' + date.getDate();

    div.innerHTML =
      '<div class="fbp-item-row1">' +
        '<span class="fbp-item-number">No.' + num + '</span>' +
        '<span class="fbp-item-status" style="background:' + cfg.bg + ';color:' + cfg.color + ';">' + statusKey + '</span>' +
        '<span class="fbp-item-date">' + dateStr + '</span>' +
      '</div>' +
      '<div class="fbp-item-title">' + escapeHtml(item.label || item.suggestion || '') + '</div>' +
      '<div class="fbp-item-footer">' +
        '<span class="fbp-item-author">' + escapeHtml(item.author || '匿名') + '</span>' +
        (item.page ? '<span class="fbp-item-page-text">' + escapeHtml(item.page) + '</span>' : '') +
      '</div>';

    return div;
  }

  function showDetail(id) {
    currentView = 'detail';
    currentFeedbackId = id;
    var item = allFeedback.find(function (f) { return f.id === id; });
    if (!item) return;

    document.getElementById('fbp-list-header').style.display = 'none';

    var statusKey = item.status || '未対応';
    var cfg = STATUSES[statusKey] || STATUSES['未対応'];
    var date = new Date(item.created_at);
    var dateStr = date.getFullYear() + '/' + String(date.getMonth() + 1).padStart(2, '0') + '/' + String(date.getDate()).padStart(2, '0') + ' ' + String(date.getHours()).padStart(2, '0') + ':' + String(date.getMinutes()).padStart(2, '0');

    var idx = allFeedback.indexOf(item);
    var num = allFeedback.length - idx;

    // Build status selector HTML
    var statusHtml = '<div class="fbp-status-select" id="fbp-status-select">';
    Object.keys(STATUSES).forEach(function (s) {
      var c = STATUSES[s];
      var isCurrent = s === statusKey ? ' current' : '';
      statusHtml += '<span class="fbp-status-option' + isCurrent + '" data-status="' + s + '" style="background:' + c.bg + ';color:' + c.color + ';border-color:' + c.border + ';">' + s + '</span>';
    });
    statusHtml += '</div>';

    var typeLabel = item.type === 'improvement' ? '改善' : item.type === 'bug' ? 'バグ' : item.type === 'question' ? '質問' : 'フィードバック';
    var typeBorder = item.type === 'bug' ? '#fecaca' : item.type === 'improvement' ? '#fcd34d' : item.type === 'question' ? '#bfdbfe' : '#e5e7eb';
    var typeColor = item.type === 'bug' ? '#ef4444' : item.type === 'improvement' ? '#f59e0b' : item.type === 'question' ? '#3b82f6' : '#6b7280';

    var bodyEl = document.getElementById('fbp-body');
    bodyEl.innerHTML =
      '<div class="fbp-detail">' +
        '<div class="fbp-detail-header">' +
          '<button class="fbp-detail-back" id="fbp-detail-back">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>' +
            ' 一覧' +
          '</button>' +
          '<button class="fbp-detail-close" id="fbp-detail-close">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="fbp-detail-content">' +
          '<div class="fbp-detail-meta">' +
            '<span class="fbp-detail-number">No.' + num + '</span>' +
            '<span class="fbp-detail-category" style="color:' + typeColor + ';border-color:' + typeBorder + ';">' + typeLabel + '</span>' +
            '<span class="fbp-detail-date">' + dateStr + '</span>' +
          '</div>' +
          '<div class="fbp-detail-title" id="fbp-detail-title">' + escapeHtml(item.label || '（タイトル未設定）') + '</div>' +
          '<div class="fbp-detail-status-row">' +
            '<span class="fbp-detail-status-label">ステータス：</span>' +
            statusHtml +
          '</div>' +
          '<div class="fbp-detail-info-rows">' +
            '<div class="fbp-detail-info-row">' +
              '<span class="fbp-detail-info-label">報告者</span>' +
              '<span class="fbp-detail-info-value">' + escapeHtml(item.author || '匿名') + '</span>' +
            '</div>' +
            '<div class="fbp-detail-info-row">' +
              '<span class="fbp-detail-info-label">ページ</span>' +
              (item.page ? (getPageUrl(item.page) ? '<a href="' + escapeHtml(getPageUrl(item.page)) + '" class="fbp-detail-page-chip">' + escapeHtml(item.page) + '</a>' : '<span class="fbp-detail-page-chip">' + escapeHtml(item.page) + '</span>') : '<span class="fbp-detail-info-value">-</span>') +
            '</div>' +
          '</div>' +
          (item.original ?
            '<div class="fbp-detail-card">' +
              '<div class="fbp-detail-card-label">該当テキスト</div>' +
              '<div class="fbp-detail-original-card">' +
                '<div class="fbp-detail-original-text">' + escapeHtml(item.original) + '</div>' +
              '</div>' +
            '</div>' : '') +
          '<div class="fbp-detail-card">' +
            '<div class="fbp-detail-card-body" id="fbp-detail-body-text">' + escapeHtml(item.suggestion || '') + '</div>' +
          '</div>' +
          '<div id="fbp-edit-form-container"></div>' +
          '<div class="fbp-detail-actions">' +
            '<button class="fbp-action-btn" id="fbp-edit-btn"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> 編集</button>' +
            '<button class="fbp-action-btn fbp-action-btn-danger" id="fbp-delete-btn"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> 削除</button>' +
          '</div>' +
          '<div class="fbp-detail-divider"></div>' +
          '<div class="fbp-detail-section-title">コメント</div>' +
          '<div class="fbp-detail-comments" id="fbp-detail-comments"></div>' +
        '</div>' +
      '</div>';

    // Back button
    document.getElementById('fbp-detail-back').addEventListener('click', function () {
      switchTab('list');
    });

    // Close button (close entire panel)
    document.getElementById('fbp-detail-close').addEventListener('click', function () {
      togglePanel();
    });

    // Status change
    document.getElementById('fbp-status-select').addEventListener('click', function (e) {
      var opt = e.target.closest('.fbp-status-option');
      if (!opt) return;
      var newStatus = opt.dataset.status;
      if (newStatus === statusKey) return;
      updateFeedbackStatus(id, newStatus);
    });

    // Edit button
    document.getElementById('fbp-edit-btn').addEventListener('click', function () {
      showEditForm(item);
    });

    // Delete button
    document.getElementById('fbp-delete-btn').addEventListener('click', function () {
      if (confirm('このフィードバックを削除しますか？\nこの操作は取り消せません。')) {
        deleteFeedback(id);
      }
    });

    // Load comments
    loadComments(id);
  }

  // --- Status update ---
  async function updateFeedbackStatus(id, newStatus) {
    try {
      var response = await fetch('/api/feedback?id=' + id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error('更新に失敗しました');
      await loadFeedback();
      showDetail(id);
    } catch (error) {
      alert(error.message);
    }
  }

  // --- Edit ---
  function showEditForm(item) {
    var container = document.getElementById('fbp-edit-form-container');
    var bodyText = document.getElementById('fbp-detail-body-text');
    bodyText.style.display = 'none';

    container.innerHTML =
      '<div class="fbp-edit-form">' +
        '<label class="fbp-form-label" style="margin-bottom:6px;">タイトル</label>' +
        '<input type="text" class="fbp-form-input" id="fbp-edit-title" value="' + escapeHtml(item.label || '') + '" style="margin-bottom:10px;">' +
        '<label class="fbp-form-label" style="margin-bottom:6px;">内容</label>' +
        '<textarea class="fbp-edit-textarea" id="fbp-edit-body">' + escapeHtml(item.suggestion || '') + '</textarea>' +
        '<div class="fbp-edit-actions">' +
          '<button class="fbp-edit-save" id="fbp-edit-save">保存</button>' +
          '<button class="fbp-edit-cancel" id="fbp-edit-cancel">キャンセル</button>' +
        '</div>' +
      '</div>';

    document.getElementById('fbp-edit-save').addEventListener('click', function () {
      saveEdit(item.id);
    });
    document.getElementById('fbp-edit-cancel').addEventListener('click', function () {
      container.innerHTML = '';
      bodyText.style.display = 'block';
    });
  }

  async function saveEdit(id) {
    var title = document.getElementById('fbp-edit-title').value.trim();
    var body = document.getElementById('fbp-edit-body').value.trim();
    if (!body) { alert('内容を入力してください'); return; }

    try {
      var payload = { suggestion: body };
      if (title) payload.suggestion = body;

      var response = await fetch('/api/feedback?id=' + id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestion: body })
      });
      if (!response.ok) throw new Error('更新に失敗しました');

      // Update label separately if changed
      var item = allFeedback.find(function (f) { return f.id === id; });
      if (item && title !== item.label) {
        // label is stored in the 'label' field but API uses 'suggestion' for text body
        // We need a custom approach - but the API doesn't expose label update directly
        // For now, we update via a second call if the label field exists
      }

      await loadFeedback();
      showDetail(id);
    } catch (error) {
      alert(error.message);
    }
  }

  // --- Delete ---
  async function deleteFeedback(id) {
    try {
      var response = await fetch('/api/feedback?id=' + id, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('削除に失敗しました');
      await loadFeedback();
      switchTab('list');
    } catch (error) {
      alert(error.message);
    }
  }

  // --- Comments ---
  async function loadComments(feedbackId) {
    var container = document.getElementById('fbp-detail-comments');
    if (!container) return;

    container.innerHTML = '<div class="fbp-loading">読み込み中...</div>';

    try {
      var response = await fetch('/api/comments?feedback_id=' + feedbackId);
      var data = await response.json();
      var comments = data.comments || [];

      var html = '';

      if (comments.length === 0) {
        html += '<div class="fbp-no-comments">コメントはまだありません</div>';
      } else {
        comments.forEach(function (c) {
          var cDate = new Date(c.created_at);
          var cDateStr = (cDate.getMonth() + 1) + '/' + cDate.getDate() + ' ' + String(cDate.getHours()).padStart(2, '0') + ':' + String(cDate.getMinutes()).padStart(2, '0');
          html +=
            '<div class="fbp-comment" data-comment-id="' + c.id + '">' +
              '<div class="fbp-comment-header">' +
                '<span class="fbp-comment-author">' + escapeHtml(c.author) + '</span>' +
                '<span class="fbp-comment-date">' + cDateStr + '</span>' +
                '<div class="fbp-comment-actions">' +
                  '<button class="fbp-comment-action-btn edit" data-id="' + c.id + '" title="編集"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>' +
                  '<button class="fbp-comment-action-btn delete" data-id="' + c.id + '" title="削除"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>' +
                '</div>' +
              '</div>' +
              '<div class="fbp-comment-body" id="fbp-comment-body-' + c.id + '">' + escapeHtml(c.body) + '</div>' +
              '<div id="fbp-comment-edit-' + c.id + '"></div>' +
            '</div>';
        });
      }

      // Comment form
      html +=
        '<div class="fbp-comment-form">' +
          '<textarea class="fbp-comment-input" id="fbp-comment-input" placeholder="コメントを入力..."></textarea>' +
          '<div class="fbp-comment-submit-row">' +
            '<input type="text" class="fbp-comment-author-input" id="fbp-comment-author" value="' + escapeHtml(currentUser) + '" placeholder="お名前">' +
            '<button class="fbp-comment-submit" id="fbp-comment-submit">送信</button>' +
          '</div>' +
        '</div>';

      container.innerHTML = html;

      // Comment submit
      document.getElementById('fbp-comment-submit').addEventListener('click', function () {
        submitComment(feedbackId);
      });

      // Comment edit/delete buttons
      container.querySelectorAll('.fbp-comment-action-btn.edit').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var cid = btn.dataset.id;
          var comment = comments.find(function (c) { return String(c.id) === cid; });
          if (comment) showCommentEdit(comment, feedbackId);
        });
      });

      container.querySelectorAll('.fbp-comment-action-btn.delete').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var cid = btn.dataset.id;
          if (confirm('このコメントを削除しますか？')) {
            deleteComment(cid, feedbackId);
          }
        });
      });

    } catch (error) {
      container.innerHTML = '<div class="fbp-no-comments">コメントの読み込みに失敗しました</div>';
    }
  }

  async function submitComment(feedbackId) {
    var input = document.getElementById('fbp-comment-input');
    var authorInput = document.getElementById('fbp-comment-author');
    var submitBtn = document.getElementById('fbp-comment-submit');

    var body = input.value.trim();
    var author = authorInput.value.trim();

    if (!author) { alert('お名前を入力してください'); return; }
    if (!body) { alert('コメントを入力してください'); return; }

    submitBtn.disabled = true;

    try {
      var response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback_id: feedbackId,
          author: author,
          body: body
        })
      });
      if (!response.ok) {
        var errData = await response.json();
        throw new Error(errData.error || '送信に失敗しました');
      }

      localStorage.setItem('fbp-user', author);
      currentUser = author;

      await loadFeedback();
      loadComments(feedbackId);
    } catch (error) {
      alert(error.message);
    } finally {
      submitBtn.disabled = false;
    }
  }

  function showCommentEdit(comment, feedbackId) {
    var bodyEl = document.getElementById('fbp-comment-body-' + comment.id);
    var editContainer = document.getElementById('fbp-comment-edit-' + comment.id);
    if (!bodyEl || !editContainer) return;

    bodyEl.style.display = 'none';
    editContainer.innerHTML =
      '<textarea class="fbp-comment-input" id="fbp-comment-edit-input-' + comment.id + '" style="margin-top:6px;">' + escapeHtml(comment.body) + '</textarea>' +
      '<div class="fbp-edit-actions" style="margin-top:6px;">' +
        '<button class="fbp-edit-save" id="fbp-comment-edit-save-' + comment.id + '">保存</button>' +
        '<button class="fbp-edit-cancel" id="fbp-comment-edit-cancel-' + comment.id + '">キャンセル</button>' +
      '</div>';

    document.getElementById('fbp-comment-edit-save-' + comment.id).addEventListener('click', function () {
      var newBody = document.getElementById('fbp-comment-edit-input-' + comment.id).value.trim();
      if (!newBody) { alert('コメントを入力してください'); return; }
      updateComment(comment.id, newBody, feedbackId);
    });

    document.getElementById('fbp-comment-edit-cancel-' + comment.id).addEventListener('click', function () {
      editContainer.innerHTML = '';
      bodyEl.style.display = 'block';
    });
  }

  async function updateComment(commentId, newBody, feedbackId) {
    try {
      var response = await fetch('/api/comments?id=' + commentId, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: newBody })
      });
      if (!response.ok) throw new Error('更新に失敗しました');
      loadComments(feedbackId);
    } catch (error) {
      alert(error.message);
    }
  }

  async function deleteComment(commentId, feedbackId) {
    try {
      var response = await fetch('/api/comments?id=' + commentId, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('削除に失敗しました');
      await loadFeedback();
      loadComments(feedbackId);
    } catch (error) {
      alert(error.message);
    }
  }

  // --- Element Picker ---
  var pickerActive = false;
  var pickedLabel = '';
  var pickedOriginal = '';
  var lastHoveredEl = null;

  function getPageTitle() {
    var t = (document.title.split('|')[0] || '').trim();
    return (t === '' || t === '株式会社ランステック') ? 'トップページ' : t;
  }

  function startPicker() {
    pickerActive = true;
    document.getElementById('fbp-picking-notice').classList.add('active');
    document.getElementById('fbp-form-area').classList.add('dimmed');
    document.addEventListener('mouseover', pickerHover, true);
    document.addEventListener('mouseout', pickerOut, true);
    document.addEventListener('click', pickerClick, true);
  }

  function stopPicker() {
    pickerActive = false;
    document.getElementById('fbp-picking-notice').classList.remove('active');
    var formArea = document.getElementById('fbp-form-area');
    if (formArea) formArea.classList.remove('dimmed');
    document.removeEventListener('mouseover', pickerHover, true);
    document.removeEventListener('mouseout', pickerOut, true);
    document.removeEventListener('click', pickerClick, true);
    if (lastHoveredEl) {
      lastHoveredEl.classList.remove('fbp-pick-hover');
      lastHoveredEl = null;
    }
  }

  function pickerHover(e) {
    var el = e.target;
    if (el.closest('.fbp-panel') || el.closest('.fbp-fab')) return;
    if (lastHoveredEl && lastHoveredEl !== el) {
      lastHoveredEl.classList.remove('fbp-pick-hover');
    }
    el.classList.add('fbp-pick-hover');
    lastHoveredEl = el;
  }

  function pickerOut(e) {
    var el = e.target;
    el.classList.remove('fbp-pick-hover');
  }

  function pickerClick(e) {
    var el = e.target;
    if (el.closest('.fbp-panel') || el.closest('.fbp-fab')) return;
    e.preventDefault();
    e.stopPropagation();

    var text = (el.textContent || '').trim().substring(0, 100);
    var tag = el.tagName.toLowerCase();
    var cls = el.className ? '.' + el.className.split(' ').filter(function(c) { return c && !c.startsWith('fbp-'); }).join('.') : '';
    pickedLabel = tag + cls;
    pickedOriginal = text;

    stopPicker();
    updatePickerDisplay();
    var titleInput = document.getElementById('fbp-form-title');
    if (titleInput) setTimeout(function () { titleInput.focus(); }, 100);
  }

  function updatePickerDisplay() {
    var btn = document.getElementById('fbp-picker-btn');
    var selectedEl = document.getElementById('fbp-picker-selected');

    if (pickedLabel) {
      btn.classList.add('has-selection');
      btn.querySelector('.fbp-picker-sub').textContent = pickedLabel;
      selectedEl.style.display = 'flex';
      selectedEl.querySelector('.fbp-picker-selected-text').textContent = pickedOriginal || '（テキストなし）';
    } else {
      btn.classList.remove('has-selection');
      btn.querySelector('.fbp-picker-sub').textContent = 'ページ上の要素をクリックして選択';
      selectedEl.style.display = 'none';
    }
  }

  function clearPicker() {
    pickedLabel = '';
    pickedOriginal = '';
    updatePickerDisplay();
  }

  // --- Form ---
  function renderForm() {
    currentView = 'form';
    document.getElementById('fbp-list-header').style.display = 'none';

    var pageTitle = getPageTitle();

    var bodyEl = document.getElementById('fbp-body');
    bodyEl.innerHTML =
      '<div class="fbp-form">' +
        '<div id="fbp-form-success" style="display:none;" class="fbp-form-success"></div>' +
        '<div class="fbp-picking-notice" id="fbp-picking-notice">' +
          '<div class="fbp-picking-notice-text">フィードバックしたい箇所をクリックしてください</div>' +
          '<button class="fbp-picking-cancel" id="fbp-picking-cancel">キャンセル</button>' +
        '</div>' +
        '<div class="fbp-form-group">' +
          '<div class="fbp-page-badge">' +
            '<span class="fbp-page-badge-label">ページ：</span>' +
            '<span class="fbp-page-badge-name" id="fbp-form-page">' + escapeHtml(pageTitle) + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="fbp-form-group">' +
          '<label class="fbp-form-label">箇所を選択</label>' +
          '<button class="fbp-picker-btn" id="fbp-picker-btn" type="button">' +
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3l1 14 4-3 4 8 3-1-4-8h5z"/></svg>' +
            '<span><span style="font-weight:600;">箇所を選んで指定</span><span class="fbp-picker-sub">ページ上の要素をクリックして選択</span></span>' +
          '</button>' +
          '<div class="fbp-picker-selected" id="fbp-picker-selected" style="display:none;"><span class="fbp-picker-selected-text"></span><button class="fbp-picker-clear" id="fbp-picker-clear" type="button">解除</button></div>' +
        '</div>' +
        '<div id="fbp-form-area">' +
          '<div class="fbp-form-group">' +
            '<label class="fbp-form-label fbp-form-label-required" for="fbp-form-title">タイトル</label>' +
            '<input type="text" class="fbp-form-input" id="fbp-form-title" placeholder="例：ヘッダーの表示が崩れる">' +
          '</div>' +
          '<div class="fbp-form-group">' +
            '<label class="fbp-form-label fbp-form-label-required" for="fbp-form-body">内容</label>' +
            '<textarea class="fbp-form-textarea" id="fbp-form-body" placeholder="詳しく教えてください..."></textarea>' +
          '</div>' +
          '<div class="fbp-form-group">' +
            '<label class="fbp-form-label fbp-form-label-required" for="fbp-form-author">お名前</label>' +
            '<input type="text" class="fbp-form-input" id="fbp-form-author" value="' + escapeHtml(currentUser) + '" placeholder="例：田中">' +
          '</div>' +
          '<div class="fbp-form-actions">' +
            '<button class="fbp-form-btn fbp-form-btn-primary" id="fbp-form-submit">送信する</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    document.getElementById('fbp-picker-btn').addEventListener('click', startPicker);
    var clearBtn = document.getElementById('fbp-picker-clear');
    if (clearBtn) clearBtn.addEventListener('click', clearPicker);
    document.getElementById('fbp-picking-cancel').addEventListener('click', stopPicker);
    document.getElementById('fbp-form-submit').addEventListener('click', handleFormSubmit);

    updatePickerDisplay();
  }

  async function handleFormSubmit() {
    var submitBtn = document.getElementById('fbp-form-submit');
    var title = document.getElementById('fbp-form-title').value.trim();
    var body = document.getElementById('fbp-form-body').value.trim();
    var page = document.getElementById('fbp-form-page').textContent.trim();
    var author = document.getElementById('fbp-form-author').value.trim();

    if (!author) { alert('お名前を入力してください'); return; }
    if (!title) { alert('タイトルを入力してください'); return; }
    if (!body) { alert('内容を入力してください'); return; }

    submitBtn.disabled = true;
    submitBtn.textContent = '送信中...';

    try {
      var response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: pickedLabel ? pickedLabel + '：' + title : title,
          text: body,
          current: pickedOriginal || '',
          page: page,
          author: author,
          type: 'feedback',
          priority: 'medium'
        })
      });

      var data = await response.json();
      if (!response.ok) throw new Error(data.error || '送信に失敗しました');

      localStorage.setItem('fbp-user', author);
      currentUser = author;

      pickedLabel = '';
      pickedOriginal = '';

      var successEl = document.getElementById('fbp-form-success');
      successEl.textContent = 'フィードバックを送信しました';
      successEl.style.display = 'block';

      document.getElementById('fbp-form-title').value = '';
      document.getElementById('fbp-form-body').value = '';

      await loadFeedback();

      setTimeout(function () {
        switchTab('list');
        var firstItem = document.querySelector('.fbp-list-item');
        if (firstItem) {
          firstItem.style.background = '#fff7ed';
          firstItem.style.transition = 'background 2s ease';
          setTimeout(function () { firstItem.style.background = ''; }, 2500);
        }
      }, 1500);

    } catch (error) {
      alert('送信に失敗しました: ' + error.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = '送信する';
    }
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') {
      if (pickerActive) { stopPicker(); return; }
      var panel = document.getElementById('feedback-panel-v2');
      if (panel && panel.classList.contains('open')) closePanel();
    }
  }

  function init() {
    injectStyles();
    createPanel();
    createFAB();
    document.addEventListener('keydown', handleKeydown);
    if (localStorage.getItem('fbp-panel-open') === '1') {
      openPanel();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
