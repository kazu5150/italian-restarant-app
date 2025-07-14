# Database Files

このディレクトリには、Bella Vista Italian Restaurantプロジェクトのデータベース関連ファイルが含まれています。

## ディレクトリ構造

```
database/
├── setup/              # 初期セットアップ用SQLファイル
├── migrations/         # データベース変更用SQLファイル
├── seeds/              # サンプルデータ投入用SQLファイル
└── README.md          # このファイル
```

## セットアップ手順

### 1. 初期セットアップ (`setup/`)

以下の順序でSupabase SQL エディターで実行してください：

1. **`01-schema.sql`** - 基本テーブル構造の作成
   - `tables`, `menu_categories`, `menu_items`, `orders`, `order_items`テーブルを作成
   - 外部キー制約とインデックスを設定

2. **`02-rls-policies.sql`** - 開発用RLSポリシーの設定
   - 開発環境用の許可的なRow Level Security (RLS) ポリシー
   - 本番環境では適切な認証ベースのポリシーに変更が必要

3. **`03-storage-setup.sql`** - 画像アップロード用ストレージの設定
   - `menu-images`バケットの作成
   - 画像アップロード用のRLSポリシーの設定

### 2. マイグレーション (`migrations/`)

データベーススキーマに変更が必要な場合：

1. **`01-fix-tables-schema.sql`** - テーブルスキーマの修正
   - "capacity does not exist" エラーが発生した場合に実行

### 3. サンプルデータ (`seeds/`)

開発・テスト用のサンプルデータを投入する場合：

1. **`01-add-menu-images.sql`** - 基本メニューデータの追加
2. **`02-update-all-menu-images.sql`** - 全メニューアイテムの画像URLを更新
3. **`03-update-antipasti-images.sql`** - 前菜カテゴリの画像URLを更新

## 使用方法

### 新規セットアップ
```bash
# 1. Supabaseプロジェクトを作成
# 2. 以下のSQLファイルを順番に実行：
database/setup/01-schema.sql
database/setup/02-rls-policies.sql
database/setup/03-storage-setup.sql
```

### 既存プロジェクトの修正
```bash
# 必要に応じて以下を実行：
database/migrations/01-fix-tables-schema.sql
```

### サンプルデータの投入
```bash
# 開発・テスト用データが必要な場合：
database/seeds/01-add-menu-images.sql
database/seeds/02-update-all-menu-images.sql
database/seeds/03-update-antipasti-images.sql
```

## 注意事項

- **本番環境**では`02-rls-policies.sql`を適切な認証ベースのポリシーに変更してください
- SQLファイルは記載された順序で実行することが重要です
- エラーが発生した場合は、依存関係を確認してから再実行してください

## トラブルシューティング

- **"capacity does not exist"エラー**: `migrations/01-fix-tables-schema.sql`を実行
- **RLSポリシー違反**: `setup/02-rls-policies.sql`が実行されているか確認
- **外部キー制約エラー**: テーブル作成順序を確認し、`setup/01-schema.sql`を再実行