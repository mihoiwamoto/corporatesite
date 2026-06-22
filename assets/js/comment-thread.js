/**
 * CommentThread - コメントスレッドコンポーネント
 *
 * 貿易システムと同じUIのコメント機能
 * 名前入力式（ログイン不要）
 */

(function (global) {
  'use strict';

  function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'たった今';
    if (minutes < 60) return `${minutes}分前`;
    if (hours < 24) return `${hours}時間前`;
    if (days < 7) return `${days}日前`;

    return date.toLocaleDateString('ja-JP', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  class CommentThread {
    constructor(container, options) {
      this.container = container;
      this.feedbackId = options.feedbackId;
      this.currentUser = options.currentUser || '';
      this.onCommentAdded = options.onCommentAdded || (() => {});
      this.readOnly = options.readOnly || false;

      this.comments = [];
      this.isLoading = false;
      this.editingCommentId = null;

      this.init();
    }

    init() {
      this.container.innerHTML = '';
      this.container.className = 'comment-thread';

      if (!document.getElementById('comment-thread-styles')) {
        this.injectStyles();
      }

      this.listContainer = document.createElement('div');
      this.listContainer.className = 'ct-list';
      this.container.appendChild(this.listContainer);

      if (!this.readOnly) {
        this.formContainer = document.createElement('div');
        this.formContainer.className = 'ct-form-container';
        this.container.appendChild(this.formContainer);
        this.renderForm();
      }

      this.loadComments();
    }

    injectStyles() {
      const style = document.createElement('style');
      style.id = 'comment-thread-styles';
      style.textContent = `
        .comment-thread {
          font-family: 'Noto Sans JP', 'Hiragino Sans', sans-serif;
        }

        /* コメントリスト */
        .ct-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
        }

        .ct-empty {
          text-align: center;
          padding: 24px 16px;
          color: #9ca3af;
          font-size: 13px;
        }

        /* コメントアイテム */
        .ct-item {
          display: flex;
          gap: 12px;
          padding: 12px;
          background: #f9fafb;
          border-radius: 8px;
          position: relative;
        }

        .ct-item-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #E07898;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .ct-item-content {
          flex: 1;
          min-width: 0;
        }

        .ct-item-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }

        .ct-item-author {
          font-size: 13px;
          font-weight: 600;
          color: #111827;
        }

        .ct-item-date {
          font-size: 11px;
          color: #9ca3af;
        }

        .ct-item-actions {
          display: flex;
          gap: 6px;
          margin-left: auto;
        }

        .ct-item-action-btn {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.15s;
        }

        .ct-item-action-btn:hover {
          color: #374151;
          background: #e5e7eb;
        }

        .ct-item-body {
          font-size: 13px;
          line-height: 1.6;
          color: #374151;
          white-space: pre-wrap;
          word-break: break-word;
        }

        /* 編集フォーム（アイテム内） */
        .ct-edit-form {
          margin-top: 8px;
        }

        .ct-edit-textarea {
          width: 100%;
          padding: 8px 10px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 13px;
          font-family: inherit;
          line-height: 1.5;
          resize: vertical;
          min-height: 60px;
          outline: none;
        }

        .ct-edit-textarea:focus {
          border-color: #E07898;
        }

        .ct-edit-actions {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }

        .ct-edit-btn {
          padding: 6px 12px;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
        }

        .ct-edit-btn-save {
          background: #E07898;
          color: #fff;
        }

        .ct-edit-btn-save:hover {
          background: #c0587a;
        }

        .ct-edit-btn-cancel {
          background: #f3f4f6;
          color: #374151;
        }

        .ct-edit-btn-cancel:hover {
          background: #e5e7eb;
        }

        /* 新規投稿フォーム */
        .ct-form-container {
          border-top: 1px solid #e5e7eb;
          padding-top: 16px;
          margin-bottom: 20px;
        }

        .ct-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .ct-form-row {
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }

        .ct-form-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #E07898;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .ct-form-fields {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .ct-form-name-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 13px;
          font-family: inherit;
          outline: none;
          transition: border 0.15s;
        }

        .ct-form-name-input:focus {
          border-color: #E07898;
        }

        .ct-form-textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 13px;
          font-family: inherit;
          line-height: 1.5;
          resize: vertical;
          min-height: 80px;
          outline: none;
          transition: border 0.15s;
        }

        .ct-form-textarea:focus {
          border-color: #E07898;
        }

        .ct-form-submit {
          align-self: flex-end;
          padding: 8px 20px;
          background: #E07898;
          color: #fff;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
        }

        .ct-form-submit:hover {
          background: #c0587a;
        }

        .ct-form-submit:disabled {
          background: #d1d5db;
          cursor: not-allowed;
        }

        .ct-loading {
          text-align: center;
          padding: 20px;
          color: #9ca3af;
          font-size: 13px;
        }
      `;
      document.head.appendChild(style);
    }

    renderForm() {
      const nameInitial = this.currentUser ? this.currentUser.charAt(0) : '花';

      this.formContainer.innerHTML = `
        <div class="ct-form">
          <div class="ct-form-row">
            <div class="ct-form-avatar">${escapeHtml(nameInitial)}</div>
            <div class="ct-form-fields">
              <input
                type="text"
                class="ct-form-name-input"
                placeholder="お名前"
                value="${escapeHtml(this.currentUser)}"
                id="ct-name-${this.feedbackId}"
              >
              <textarea
                class="ct-form-textarea"
                placeholder="コメントを入力してください"
                id="ct-body-${this.feedbackId}"
              ></textarea>
            </div>
          </div>
          <button class="ct-form-submit" id="ct-submit-${this.feedbackId}">
            コメントを送信
          </button>
        </div>
      `;

      const nameInput = document.getElementById(`ct-name-${this.feedbackId}`);
      const submitBtn = document.getElementById(`ct-submit-${this.feedbackId}`);

      // 名前入力でアバターの頭文字を更新
      nameInput.addEventListener('input', (e) => {
        const initial = e.target.value.trim().charAt(0) || '花';
        this.formContainer.querySelector('.ct-form-avatar').textContent = initial;
      });

      submitBtn.addEventListener('click', () => this.handleSubmit());

      // Cmd/Ctrl+Enterで送信
      document.getElementById(`ct-body-${this.feedbackId}`).addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
          e.preventDefault();
          this.handleSubmit();
        }
      });
    }

    async loadComments() {
      this.isLoading = true;
      this.listContainer.innerHTML = '<div class="ct-loading">読み込み中...</div>';

      try {
        const response = await fetch(`/api/comments?feedback_id=${this.feedbackId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || '取得に失敗しました');
        }

        this.comments = data.comments || [];
        this.renderComments();
      } catch (error) {
        console.error('Error loading comments:', error);
        this.listContainer.innerHTML = '<div class="ct-empty">コメントの読み込みに失敗しました</div>';
      } finally {
        this.isLoading = false;
      }
    }

    renderComments() {
      if (this.comments.length === 0) {
        this.listContainer.innerHTML = '<div class="ct-empty">まだコメントはありません。</div>';
        return;
      }

      this.listContainer.innerHTML = '';

      this.comments.forEach(comment => {
        const item = this.createCommentItem(comment);
        this.listContainer.appendChild(item);
      });
    }

    createCommentItem(comment) {
      const div = document.createElement('div');
      div.className = 'ct-item';
      div.dataset.commentId = comment.id;

      const authorInitial = (comment.author || '匿名').charAt(0);
      const isEditing = this.editingCommentId === comment.id;

      div.innerHTML = `
        <div class="ct-item-avatar">${escapeHtml(authorInitial)}</div>
        <div class="ct-item-content">
          <div class="ct-item-header">
            <span class="ct-item-author">${escapeHtml(comment.author || '匿名')}</span>
            <span class="ct-item-date">${formatDate(comment.created_at)}</span>
            <div class="ct-item-actions">
              <button class="ct-item-action-btn ct-edit-btn" data-id="${comment.id}" title="編集">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="ct-item-action-btn ct-delete-btn" data-id="${comment.id}" title="削除">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
          <div class="ct-item-body">${escapeHtml(comment.body)}</div>
        </div>
      `;

      // 編集ボタン
      div.querySelector('.ct-edit-btn').addEventListener('click', () => {
        this.startEdit(comment);
      });

      // 削除ボタン
      div.querySelector('.ct-delete-btn').addEventListener('click', () => {
        this.handleDelete(comment.id);
      });

      return div;
    }

    startEdit(comment) {
      this.editingCommentId = comment.id;

      const itemEl = this.listContainer.querySelector(`[data-comment-id="${comment.id}"]`);
      const contentEl = itemEl.querySelector('.ct-item-content');
      const bodyEl = contentEl.querySelector('.ct-item-body');

      bodyEl.innerHTML = `
        <div class="ct-edit-form">
          <textarea class="ct-edit-textarea" id="ct-edit-textarea-${comment.id}">${escapeHtml(comment.body)}</textarea>
          <div class="ct-edit-actions">
            <button class="ct-edit-btn ct-edit-btn-save" id="ct-edit-save-${comment.id}">保存</button>
            <button class="ct-edit-btn ct-edit-btn-cancel" id="ct-edit-cancel-${comment.id}">キャンセル</button>
          </div>
        </div>
      `;

      document.getElementById(`ct-edit-save-${comment.id}`).addEventListener('click', () => {
        this.handleEditSave(comment.id);
      });

      document.getElementById(`ct-edit-cancel-${comment.id}`).addEventListener('click', () => {
        this.cancelEdit();
      });

      document.getElementById(`ct-edit-textarea-${comment.id}`).focus();
    }

    cancelEdit() {
      this.editingCommentId = null;
      this.renderComments();
    }

    async handleEditSave(commentId) {
      const textarea = document.getElementById(`ct-edit-textarea-${commentId}`);
      const newBody = textarea.value.trim();

      if (!newBody) {
        alert('コメント内容を入力してください');
        return;
      }

      try {
        const response = await fetch(`/api/comments?id=${commentId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ body: newBody })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || '更新に失敗しました');
        }

        this.editingCommentId = null;
        await this.loadComments();
      } catch (error) {
        console.error('Error updating comment:', error);
        alert('更新に失敗しました: ' + error.message);
      }
    }

    async handleDelete(commentId) {
      if (!confirm('このコメントを削除しますか？')) {
        return;
      }

      try {
        const response = await fetch(`/api/comments?id=${commentId}`, {
          method: 'DELETE'
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || '削除に失敗しました');
        }

        await this.loadComments();
        this.onCommentAdded();
      } catch (error) {
        console.error('Error deleting comment:', error);
        alert('削除に失敗しました: ' + error.message);
      }
    }

    async handleSubmit() {
      const nameInput = document.getElementById(`ct-name-${this.feedbackId}`);
      const bodyInput = document.getElementById(`ct-body-${this.feedbackId}`);
      const submitBtn = document.getElementById(`ct-submit-${this.feedbackId}`);

      const author = nameInput.value.trim() || '匿名';
      const body = bodyInput.value.trim();

      if (!body) {
        alert('コメント内容を入力してください');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = '送信中...';

      try {
        const response = await fetch('/api/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            feedback_id: this.feedbackId,
            author: author,
            body: body
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || '送信に失敗しました');
        }

        bodyInput.value = '';
        this.currentUser = author;

        await this.loadComments();
        this.onCommentAdded(data.comment);

      } catch (error) {
        console.error('Error posting comment:', error);
        alert('送信に失敗しました: ' + error.message);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'コメントを送信';
      }
    }
  }

  global.CommentThread = CommentThread;

})(window);
