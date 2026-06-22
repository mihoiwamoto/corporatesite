const { createClient } = require('@supabase/supabase-js');

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return createClient(url, key);
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const supabase = getSupabase();

  if (req.method === 'POST') {
    const { page, label, current, text, author, type, priority, email, notify_on_update, tags } = req.body || {};
    if (!text) return res.status(400).json({ error: 'text is required' });

    const insertData = {
      page,
      label,
      original: current,
      suggestion: text,
      author: author || '匿名',
      type: type || 'feedback',
      priority: priority || 'medium',
      email: email || null,
      notify_on_update: notify_on_update !== undefined ? notify_on_update : true,
      tags: tags || [],
    };

    const { data, error } = await supabase
      .from('feedback')
      .insert(insertData)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true, id: data.id });
  }

  if (req.method === 'GET') {
    const isAdmin = req.query.key === process.env.ADMIN_KEY;
    const { type, priority, assignee, tags, author_email, page } = req.query;

    let query = supabase
      .from('feedback')
      .select('id, page, label, original, suggestion, author, email, type, priority, assignee, tags, status, created_at, updated_at, notify_on_update');

    // フィルタリング
    if (type) query = query.eq('type', type);
    if (priority) query = query.eq('priority', priority);
    if (assignee) query = query.eq('assignee', assignee);
    if (author_email) query = query.eq('email', author_email);
    if (page) query = query.eq('page', page);
    if (tags) {
      // タグ検索（配列に含まれるかチェック）
      query = query.contains('tags', [tags]);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) return res.status(500).json({ error: error.message });

    // コメント数を各フィードバックに追加
    const feedbackIds = data.map(item => item.id);
    const { data: comments } = await supabase
      .from('feedback_comments')
      .select('feedback_id')
      .in('feedback_id', feedbackIds);

    const commentCounts = {};
    if (comments) {
      comments.forEach(c => {
        commentCounts[c.feedback_id] = (commentCounts[c.feedback_id] || 0) + 1;
      });
    }

    const itemsWithComments = data.map(item => ({
      ...item,
      comment_count: commentCounts[item.id] || 0,
    }));

    return res.status(200).json({ items: itemsWithComments, isAdmin });
  }

  if (req.method === 'PATCH') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'id required' });

    const { suggestion, status, type, priority, assignee, tags, email, notify_on_update } = req.body || {};
    const updates = { updated_at: new Date().toISOString() };

    if (suggestion !== undefined) updates.suggestion = suggestion;
    if (status !== undefined) updates.status = status;
    if (type !== undefined) updates.type = type;
    if (priority !== undefined) updates.priority = priority;
    if (assignee !== undefined) updates.assignee = assignee;
    if (tags !== undefined) updates.tags = tags;
    if (email !== undefined) updates.email = email;
    if (notify_on_update !== undefined) updates.notify_on_update = notify_on_update;

    if (Object.keys(updates).length === 1) {
      return res.status(400).json({ error: 'no fields to update' });
    }

    // 更新前の値を取得（ステータス変更の通知用）
    const { data: oldData } = await supabase
      .from('feedback')
      .select('status, email, notify_on_update')
      .eq('id', id)
      .single();

    const { error } = await supabase.from('feedback').update(updates).eq('id', id);
    if (error) return res.status(500).json({ error: error.message });

    // ステータス変更時にメール通知を送信
    if (status !== undefined && oldData && oldData.status !== status && oldData.email && oldData.notify_on_update) {
      // TODO: /api/notify を呼び出してメール送信
      // fetch('/api/notify', { method: 'POST', body: JSON.stringify({...}) })
    }

    return res.status(200).json({ ok: true });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'id required' });

    const { error } = await supabase.from('feedback').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).end();
};
