const { createClient } = require('@supabase/supabase-js');

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return createClient(url, key);
}

/**
 * メール通知API
 *
 * POST /api/notify
 * {
 *   feedback_id: number,
 *   type: 'status_change' | 'new_comment' | 'assigned',
 *   recipients: string[], // メールアドレスの配列
 *   comment_body?: string, // new_comment の場合
 *   old_status?: string,   // status_change の場合
 *   new_status?: string    // status_change の場合
 * }
 *
 * 環境変数が必要:
 * - RESEND_API_KEY: Resend APIキー
 * - NOTIFICATION_FROM_EMAIL: 送信元メールアドレス（例: noreply@lanstech.co.jp）
 * - SITE_URL: サイトのベースURL（例: https://lanstech.co.jp）
 */
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { feedback_id, type, recipients, comment_body, old_status, new_status } = req.body || {};

  // バリデーション
  if (!feedback_id) {
    return res.status(400).json({ error: 'feedback_id is required' });
  }
  if (!type || !['status_change', 'new_comment', 'assigned'].includes(type)) {
    return res.status(400).json({ error: 'Invalid notification type' });
  }
  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({ error: 'recipients array is required' });
  }

  // 環境変数チェック
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.NOTIFICATION_FROM_EMAIL || 'noreply@lanstech.co.jp';
  const siteUrl = process.env.SITE_URL || 'https://lanstech.co.jp';

  if (!resendApiKey) {
    console.error('RESEND_API_KEY is not set');
    return res.status(500).json({ error: 'Email service not configured' });
  }

  const supabase = getSupabase();

  // フィードバック情報を取得
  const { data: feedback, error: feedbackError } = await supabase
    .from('feedback')
    .select('id, page, label, suggestion, author, type, status')
    .eq('id', feedback_id)
    .single();

  if (feedbackError || !feedback) {
    return res.status(404).json({ error: 'Feedback not found' });
  }

  // メール本文を生成
  let subject = '';
  let htmlBody = '';
  let textBody = '';

  const feedbackUrl = `${siteUrl}/my-feedback.html?id=${feedback_id}`;
  const feedbackTypeLabel = {
    bug: 'バグ報告',
    feature: '機能リクエスト',
    question: '質問',
    feedback: 'フィードバック'
  }[feedback.type] || 'フィードバック';

  if (type === 'status_change') {
    subject = `[ランステック] フィードバックのステータスが更新されました`;
    textBody = `
${feedback.author} 様

ご投稿いただいたフィードバックのステータスが更新されました。

【フィードバック】
${feedback.label || '（タイトル未設定）'} - ${feedback.page || ''}

【タイプ】
${feedbackTypeLabel}

【ステータス】
${old_status || '未対応'} → ${new_status || '未対応'}

詳細はこちら:
${feedbackUrl}

---
株式会社ランステック
${siteUrl}
`.trim();

    htmlBody = `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <p>${feedback.author} 様</p>
  <p>ご投稿いただいたフィードバックのステータスが更新されました。</p>
  <div style="background: #f5f5f5; border-left: 4px solid #E07898; padding: 16px; margin: 20px 0;">
    <p style="margin: 0 0 8px;"><strong>【フィードバック】</strong></p>
    <p style="margin: 0 0 12px;">${feedback.label || '（タイトル未設定）'} - ${feedback.page || ''}</p>
    <p style="margin: 0 0 8px;"><strong>【タイプ】</strong></p>
    <p style="margin: 0 0 12px;">${feedbackTypeLabel}</p>
    <p style="margin: 0 0 8px;"><strong>【ステータス】</strong></p>
    <p style="margin: 0;">${old_status || '未対応'} → ${new_status || '未対応'}</p>
  </div>
  <p>
    <a href="${feedbackUrl}" style="display: inline-block; background: #E07898; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
      詳細を確認する
    </a>
  </p>
  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 32px 0;">
  <p style="color: #999; font-size: 12px;">株式会社ランステック<br>${siteUrl}</p>
</div>
`.trim();
  }

  if (type === 'new_comment') {
    subject = `[ランステック] フィードバックに新しいコメントが投稿されました`;
    const commentPreview = comment_body && comment_body.length > 100
      ? comment_body.substring(0, 100) + '...'
      : comment_body || '';

    textBody = `
${feedback.author} 様

ご投稿いただいたフィードバックに新しいコメントが投稿されました。

【フィードバック】
${feedback.label || '（タイトル未設定）'} - ${feedback.page || ''}

【タイプ】
${feedbackTypeLabel}

【コメント】
${commentPreview}

詳細はこちら:
${feedbackUrl}

---
株式会社ランステック
${siteUrl}
`.trim();

    htmlBody = `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <p>${feedback.author} 様</p>
  <p>ご投稿いただいたフィードバックに新しいコメントが投稿されました。</p>
  <div style="background: #f5f5f5; border-left: 4px solid #E07898; padding: 16px; margin: 20px 0;">
    <p style="margin: 0 0 8px;"><strong>【フィードバック】</strong></p>
    <p style="margin: 0 0 12px;">${feedback.label || '（タイトル未設定）'} - ${feedback.page || ''}</p>
    <p style="margin: 0 0 8px;"><strong>【タイプ】</strong></p>
    <p style="margin: 0 0 12px;">${feedbackTypeLabel}</p>
    <p style="margin: 0 0 8px;"><strong>【コメント】</strong></p>
    <p style="margin: 0; white-space: pre-wrap; background: #fff; padding: 12px; border-radius: 4px;">${commentPreview}</p>
  </div>
  <p>
    <a href="${feedbackUrl}" style="display: inline-block; background: #E07898; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
      詳細を確認する
    </a>
  </p>
  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 32px 0;">
  <p style="color: #999; font-size: 12px;">株式会社ランステック<br>${siteUrl}</p>
</div>
`.trim();
  }

  if (type === 'assigned') {
    subject = `[ランステック] フィードバックが担当としてアサインされました`;
    textBody = `
フィードバックが担当としてアサインされました。

【フィードバック】
${feedback.label || '（タイトル未設定）'} - ${feedback.page || ''}

【タイプ】
${feedbackTypeLabel}

【ステータス】
${feedback.status || '未対応'}

【内容】
${feedback.suggestion || ''}

詳細はこちら:
${feedbackUrl}

---
株式会社ランステック
${siteUrl}
`.trim();

    htmlBody = `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <p>フィードバックが担当としてアサインされました。</p>
  <div style="background: #f5f5f5; border-left: 4px solid #E07898; padding: 16px; margin: 20px 0;">
    <p style="margin: 0 0 8px;"><strong>【フィードバック】</strong></p>
    <p style="margin: 0 0 12px;">${feedback.label || '（タイトル未設定）'} - ${feedback.page || ''}</p>
    <p style="margin: 0 0 8px;"><strong>【タイプ】</strong></p>
    <p style="margin: 0 0 12px;">${feedbackTypeLabel}</p>
    <p style="margin: 0 0 8px;"><strong>【ステータス】</strong></p>
    <p style="margin: 0 0 12px;">${feedback.status || '未対応'}</p>
    <p style="margin: 0 0 8px;"><strong>【内容】</strong></p>
    <p style="margin: 0; white-space: pre-wrap; background: #fff; padding: 12px; border-radius: 4px;">${feedback.suggestion || ''}</p>
  </div>
  <p>
    <a href="${feedbackUrl}" style="display: inline-block; background: #E07898; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
      詳細を確認する
    </a>
  </p>
  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 32px 0;">
  <p style="color: #999; font-size: 12px;">株式会社ランステック<br>${siteUrl}</p>
</div>
`.trim();
  }

  // Resend APIでメール送信
  const results = [];
  for (const recipient of recipients) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [recipient],
          subject,
          text: textBody,
          html: htmlBody,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // 通知履歴に記録（成功）
        await supabase.from('feedback_notifications').insert({
          feedback_id,
          recipient_email: recipient,
          type,
          subject,
          body: textBody,
          status: 'sent',
        });

        results.push({ recipient, status: 'sent', id: result.id });
      } else {
        // 通知履歴に記録（失敗）
        await supabase.from('feedback_notifications').insert({
          feedback_id,
          recipient_email: recipient,
          type,
          subject,
          body: textBody,
          status: 'failed',
          error_message: result.message || 'Unknown error',
        });

        results.push({ recipient, status: 'failed', error: result.message });
      }
    } catch (error) {
      console.error(`Error sending email to ${recipient}:`, error);

      // 通知履歴に記録（失敗）
      await supabase.from('feedback_notifications').insert({
        feedback_id,
        recipient_email: recipient,
        type,
        subject,
        body: textBody,
        status: 'failed',
        error_message: error.message,
      });

      results.push({ recipient, status: 'failed', error: error.message });
    }
  }

  const allSent = results.every(r => r.status === 'sent');

  return res.status(allSent ? 200 : 207).json({
    ok: allSent,
    results,
  });
};
