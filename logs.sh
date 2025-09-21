#!/bin/bash

# Laravelログ確認用スクリプト

echo "Laravel Log Viewer"
echo "=================="
echo ""

# ログファイルの存在確認
if ! docker compose exec backend test -f storage/logs/laravel.log; then
    echo "❌ ログファイルが見つかりません"
    echo "   ログファイルを作成しています..."
    docker compose exec backend touch storage/logs/laravel.log
    docker compose exec backend chmod 664 storage/logs/laravel.log
    docker compose exec backend chown www-data:www-data storage/logs/laravel.log
fi

echo "📋 利用可能なコマンド:"
echo "  1. 最新のログを表示"
echo "  2. リアルタイムでログを監視"
echo "  3. エラーログのみ表示"
echo "  4. ログファイルをクリア"
echo "  5. ログファイルのサイズを表示"
echo ""

read -p "選択してください (1-5): " choice

case $choice in
    1)
        echo "📄 最新のログを表示中..."
        docker compose exec backend tail -n 50 storage/logs/laravel.log
        ;;
    2)
        echo "👀 リアルタイムでログを監視中... (Ctrl+C で停止)"
        docker compose exec backend tail -f storage/logs/laravel.log
        ;;
    3)
        echo "🚨 エラーログのみ表示中..."
        docker compose exec backend grep -i "error\|exception\|fatal" storage/logs/laravel.log | tail -n 20
        ;;
    4)
        echo "🗑️  ログファイルをクリア中..."
        docker compose exec backend truncate -s 0 storage/logs/laravel.log
        echo "✅ ログファイルをクリアしました"
        ;;
    5)
        echo "📊 ログファイルの情報:"
        docker compose exec backend ls -lh storage/logs/laravel.log
        docker compose exec backend wc -l storage/logs/laravel.log
        ;;
    *)
        echo "❌ 無効な選択です"
        exit 1
        ;;
esac

