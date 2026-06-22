const { createClient } = require('@supabase/supabase-js');

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return createClient(url, key);
}

/**
 * コメント機能API
 *
 * GET    /api/comments?feedback_id=123  - 指定したフィードバックのコメント一覧を取得
 * POST   /api/comments                  - 新規コメントを投稿
 * PATCH  /api/comments?id=456           - コメントを編集（本文のみ）
 * DELETE /api/comments?id=456           - コメントを削除
 */
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const supabase = getSupabase();

  // ==========================================
  // GET: コメント一覧取得
  // ==========================================
  if (req.method === 'GET') {
    const { feedback_id } = req.query;

    if (!feedback_id) {
      return res.status(400).json({ error: 'feedback_id is required' });
    }

    const { data, error } = await supabase
      .from('feedback_comments')
      .select('id, feedback_id, author, author_email, body, created_at, updated_at')
      .eq('feedback_id', feedback_id)
      .order('created_at', { ascending: true }); // 古い順（スレッド表示）

    if (error) {
      console.error('Error fetching comments:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ comments: data });
  }

  // ==========================================
  // POST: 新規コメント投稿
  // ==========================================
  if (req.method === 'POST') {
    const { feedback_id, author, author_email, body } = req.body || {};

    // バリデーション
    if (!feedback_id) {
      return res.status(400).json({ error: 'feedback_id is required' });
    }
    if (!author || author.trim() === '') {
      return res.status(400).json({ error: 'author is required' });
    }
    if (!body || body.trim() === '') {
      return res.status(400).json({ error: 'body is required' });
    }

    // まず、対象のフィードバックが存在するか確認
    const { data: feedbackExists, error: checkError } = await supabase
      .from('feedback')
      .select('id')
      .eq('id', feedback_id)
      .single();

    if (checkError || !feedbackExists) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    // コメント投稿
    const { data, error } = await supabase
      .from('feedback_comments')
      .insert({
        feedback_id: feedback_id,
        author: author.trim(),
        author_email: author_email?.trim() || null,
        body: body.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      return res.status(500).json({ error: error.message });
    }

    // TODO: コメント投稿時にメール通知を送信（/api/notifyを呼び出す）
    // フィードバック投稿者と過去のコメント投稿者に通知を送る

    return res.status(200).json({ ok: true, comment: data });
  }

  // ==========================================
  // PATCH: コメント編集
  // ==========================================
  if (req.method === 'PATCH') {
    const { id } = req.query;
    const { body } = req.body || {};

    if (!id) {
      return res.status(400).json({ error: 'id is required' });
    }
    if (!body || body.trim() === '') {
      return res.status(400).json({ error: 'body is required' });
    }

    const { data, error } = await supabase
      .from('feedback_comments')
      .update({
        body: body.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating comment:', error);
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    return res.status(200).json({ ok: true, comment: data });
  }

  // ==========================================
  // DELETE: コメント削除
  // ==========================================
  if (req.method === 'DELETE') {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'id is required' });
    }

    const { error } = await supabase
      .from('feedback_comments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting comment:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
