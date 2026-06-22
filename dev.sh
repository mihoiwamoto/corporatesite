#!/usr/bin/env bash
# ローカルでフィードバックAPI込みで動かす起動スクリプト。
# .env.local の環境変数を読み込んでから vercel dev を起動する。
# 使い方: bash dev.sh   （ブラウザは http://localhost:3000 を開く）
set -euo pipefail
cd "$(dirname "$0")"
set -a
. ./.env.local
set +a
exec vercel dev --listen 3000
