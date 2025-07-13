# 🛠️ Supabase CRUD設定ガイド

開発中にSupabaseでフルCRUD操作を有効にするための設定手順

## 📋 設定手順

### 1. Supabase SQLエディターでRLSポリシー適用

1. Supabaseプロジェクトにログイン
2. SQL Editor にアクセス
3. `supabase-rls-policies.sql` の内容をコピー&ペースト
4. 実行してRLSポリシーを適用

### 2. 環境変数確認

`.env.local` ファイルが正しく設定されていることを確認:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. CRUD操作テスト

開発サーバーを起動して以下のページでテスト:

```bash
npm run dev
```

- **テストページ**: `http://localhost:3000/admin/test-crud`
- **管理ダッシュボード**: `http://localhost:3000/admin`

## 🔧 実装されたCRUD操作

### ✅ 作成 (CREATE)
- ✅ メニューカテゴリ作成
- ✅ メニューアイテム作成  
- ✅ テーブル作成
- ✅ 注文作成

### ✅ 読み取り (READ)
- ✅ 全データの一覧表示
- ✅ フィルタリング機能
- ✅ リアルタイム更新
- ✅ 統計情報取得

### ✅ 更新 (UPDATE)
- ✅ メニューカテゴリ更新
- ✅ メニューアイテム更新
- ✅ テーブル情報更新
- ✅ 注文ステータス更新
- ✅ 在庫状況切り替え

### ✅ 削除 (DELETE)
- ✅ 安全な削除（関連データチェック）
- ✅ 論理削除（販売停止など）
- ✅ 完全削除（テスト用）

## 🎯 利用可能な管理者機能

### 📊 **ダッシュボード** (`/admin`)
- リアルタイム統計表示
- 注文状況の概要
- クイックアクション

### 📈 **レポート** (`/admin/reports`)
- 売上分析（期間別）
- 人気商品ランキング
- 時間別注文分析

### 🍝 **メニュー管理** (`/admin/menu`)
- メニューアイテムの追加・編集・削除
- カテゴリ管理
- 在庫状況管理

### 🍽️ **注文管理** (`/admin/orders`)
- 注文一覧表示
- ステータス更新
- リアルタイム通知

### 🪑 **テーブル管理** (`/admin/tables`)
- テーブル設定
- QRコード生成
- 使用状況確認

### ⚙️ **設定** (`/admin/settings`)
- レストラン基本情報
- 営業時間設定
- システム設定

### 🧪 **CRUD テスト** (`/admin/test-crud`)
- 全CRUD操作のテスト
- データベース接続確認
- パフォーマンステスト

## 🔒 セキュリティに関する注意

### ⚠️ 開発環境での設定

現在の設定は**開発専用**です:

```sql
-- 開発用: 全ユーザーに完全なCRUDアクセスを許可
CREATE POLICY "Dev: Allow all operations" ON table_name
FOR ALL USING (true) WITH CHECK (true);
```

### 🛡️ 本番環境での推奨設定

本番環境では以下のような認証ベースのポリシーに変更:

```sql
-- 本番用: 認証されたユーザーのみアクセス許可
CREATE POLICY "Authenticated users only" ON table_name
FOR ALL USING (auth.role() = 'authenticated');

-- 管理者のみ変更可能
CREATE POLICY "Admin only updates" ON table_name
FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');
```

## 🚀 次のステップ

1. **認証システム実装**
   - Supabase Auth の設定
   - 管理者ロール管理
   - ログイン・ログアウト機能

2. **本番用ポリシー適用**
   - 適切なRLSポリシーの実装
   - ユーザー権限の細分化

3. **監査ログ実装**
   - データ変更履歴の記録
   - 管理者操作ログ

4. **バックアップ設定**
   - 定期バックアップ
   - データ復旧手順

## 🆘 トラブルシューティング

### よくある問題

1. **「new row violates row-level security policy」エラー**
   - RLSポリシーが正しく適用されていない
   - `supabase-rls-policies.sql` を再実行

2. **接続エラー**
   - 環境変数を確認
   - SupabaseプロジェクトのURLとキーを再確認

3. **権限エラー**
   - anon キーの権限を確認
   - テーブルのRLS設定を確認

### デバッグ方法

1. **CRUD テストページ**を使用
2. **ブラウザのデベロッパーツール**でネットワークタブを確認
3. **Supabaseダッシュボード**でログを確認

---

これで開発中にSupabaseの完全なCRUD操作が可能になります！ 🎉