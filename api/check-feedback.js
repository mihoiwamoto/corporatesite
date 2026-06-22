/**
 * 既存フィードバックデータ確認用の簡易スクリプト
 *
 * 使い方:
 * node api/check-feedback.js
 *
 * または、ブラウザで直接APIにアクセス:
 * /api/feedback
 */

const { createClient } = require('@supabase/supabase-js');

async function checkFeedback() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error('環境変数が設定されていません');
    console.log('SUPABASE_URL:', url ? '設定済み' : '未設定');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', key ? '設定済み' : '未設定');
    return;
  }

  const supabase = createClient(url, key);

  console.log('\n📊 既存フィードバックデータの確認\n');
  console.log('=' .repeat(60));

  // 全フィードバックを取得
  const { data, error } = await supabase
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ エラー:', error.message);
    return;
  }

  if (!data || data.length === 0) {
    console.log('⚠️  フィードバックデータが見つかりません');
    return;
  }

  console.log(`✅ 全 ${data.length} 件のフィードバックが見つかりました\n`);

  // データをテーブル形式で表示
  data.forEach((item, index) => {
    console.log(`\n[${index + 1}] ID: ${item.id}`);
    console.log(`    ページ: ${item.page || '未設定'}`);
    console.log(`    箇所: ${item.label || '未設定'}`);
    console.log(`    内容: ${item.suggestion?.substring(0, 50) || ''}${item.suggestion?.length > 50 ? '...' : ''}`);
    console.log(`    投稿者: ${item.author || '匿名'}`);
    console.log(`    ステータス: ${item.status || '未対応'}`);
    console.log(`    作成日: ${new Date(item.created_at).toLocaleString('ja-JP')}`);
    console.log(`    -`.repeat(60));
  });

  // 統計情報
  console.log('\n📈 統計情報');
  console.log('=' .repeat(60));

  const statusCounts = data.reduce((acc, item) => {
    const status = item.status || '未対応';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  console.log('ステータス別:');
  Object.entries(statusCounts).forEach(([status, count]) => {
    console.log(`  ${status}: ${count}件`);
  });

  const pageCounts = data.reduce((acc, item) => {
    const page = item.page || '未設定';
    acc[page] = (acc[page] || 0) + 1;
    return acc;
  }, {});

  console.log('\nページ別:');
  Object.entries(pageCounts).forEach(([page, count]) => {
    console.log(`  ${page}: ${count}件`);
  });

  console.log('\n✅ データは安全に保存されています');
  console.log('💡 管理画面でも確認できます: /review-admin.html\n');
}

// スクリプトとして実行された場合
if (require.main === module) {
  // .env.local を読み込む
  require('dotenv').config({ path: '.env.local' });
  checkFeedback().catch(console.error);
}

// Vercel Functions として実行される場合
module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  const { createClient } = require('@supabase/supabase-js');
  const url = process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const supabase = createClient(url, key);

  const { data, error } = await supabase
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const statusCounts = data.reduce((acc, item) => {
    const status = item.status || '未対応';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  return res.status(200).json({
    total: data.length,
    items: data,
    statistics: {
      byStatus: statusCounts,
    },
  });
};
