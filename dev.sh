#!/usr/bin/env bash
# ローカルでフィードバックAPI込みで動かす起動スクリプト。
# .env.local の環境変数を読み込んでから vercel dev を起動する。
# 使い方: bash dev.sh   （ブラウザは http://localhost:3000 を開く）
# 同一ネットワークの他PCからは http://<このPCのIP>:3000 でアクセス可能
set -euo pipefail
cd "$(dirname "$0")"
set -a
. ./.env.local
set +a

# このPCのローカルIPを表示
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "不明")
echo "--------------------------------------------"
echo "  ローカル:    http://localhost:3000"
echo "  同一NW他PC:  http://${LOCAL_IP}:3000"
echo "--------------------------------------------"

exec vercel dev --listen 0.0.0.0:3000
