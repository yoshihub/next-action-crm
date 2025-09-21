# Next Action CRM

「フォロー漏れゼロ」を目的としたミニ CRM システムです。

## 技術スタック

### バックエンド

- Laravel 12
- PHP 8.2+
- MySQL 8.0
- Redis 7
- Laravel Fortify (認証)
- Laravel Sanctum (API 認証)
- Pest (テスト)

### フロントエンド

- React 19
- TypeScript
- Vite
- Tailwind CSS
- @tanstack/react-query
- React Hook Form
- Zod
- @dnd-kit (ドラッグ&ドロップ)
- React Router

### インフラ

- Docker & Docker Compose
- Nginx

## 機能

### 受信箱

- 今日のタスク
- 遅延タスク
- 今週のタスク
- タスクの完了・延期操作

### 連絡先管理

- 個人・企業の連絡先登録
- タグ管理
- スコアリング
- 次回フォロー日の自動タスク生成

### 商談パイプライン

- カンバン形式の商談管理
- ドラッグ&ドロップでのステージ移動
- ギャップ法による順序管理
- 確度の自動調整

### タスク管理

- 優先度設定
- 担当者割り当て
- 連絡先・商談との紐付け

### 活動ログ

- 通話・面談・メール・ノートの記録
- 連絡先・商談との紐付け

## セットアップ

### 前提条件

- Docker & Docker Compose
- Node.js 18+ (フロントエンド開発用)

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd next-action-crm
```

### 2. 環境変数の設定

```bash
# バックエンド
cp backend/.env.example backend/.env

# フロントエンド
cp frontend/.env.example frontend/.env
```

### 3. Docker コンテナの起動

```bash
docker compose up -d
```

### 4. データベースのマイグレーションとシーディング

```bash
docker compose exec backend php artisan migrate --seed
```

### 5. フロントエンドの依存関係インストール

```bash
docker compose exec frontend npm install
```

### 6. フロントエンドの開発サーバー起動

```bash
docker compose exec frontend npm run dev
```

## アクセス

- フロントエンド: http://localhost:5173
- バックエンド API: http://localhost/api
- データベース: localhost:3306

## テストアカウント

- メールアドレス: test@example.com
- パスワード: password

## テスト実行

```bash
# バックエンドテスト
docker compose exec backend php artisan test

# フロントエンドテスト
docker compose exec frontend npm test
```

## 主要なビジネスルール

### 次回フォロー日 → タスク自動生成

連絡先の`next_action_on`を更新すると、同名の未完了タスクが存在しない場合に「次回フォロー」タスクが自動作成されます。

### 商談パイプラインのギャップ法

商談の順序管理にギャップ法（10 刻み）を使用し、D&D 時の順序変更を効率的に行います。

### ステージ遷移時の確度調整

- `won`ステージ: 確度 100%
- `lost`ステージ: 確度 0%

### チームスコープ

すべてのデータは`team_id`で分離され、チーム外のデータにはアクセスできません。

## 開発

### バックエンド開発

```bash
docker compose exec backend php artisan serve
```

### フロントエンド開発

```bash
docker compose exec frontend npm run dev
```

### コード品質チェック

```bash
# バックエンド
docker compose exec backend ./vendor/bin/pint

# フロントエンド
docker compose exec frontend npm run lint
```

## ライセンス

MIT License

