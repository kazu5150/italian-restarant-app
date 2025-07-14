# 🍝 Bella Vista - イタリアンレストラン QRコード注文システム

Next.js 14、Supabase、shadcn/uiで構築された、モダンでモバイルファーストなQRコードベースの注文システムです。お客様はテーブルのQRコードをスキャンするだけで、スマートフォンから簡単に注文できます。

## 🌟 主な機能

### お客様向け機能
- **QRコードスキャン**: テーブルのQRコードをスキャンしてメニューにアクセス
- **デジタルメニュー**: 画像と説明付きのカテゴリ別メニュー表示
- **ショッピングカート**: アイテムの追加、数量調整、注文管理
- **リアルタイム注文追跡**: 注文状況のライブ更新
- **モバイル最適化**: スマートフォン向けレスポンシブデザイン
- **特別リクエスト**: 注文時にアレルギーや要望を記載可能
- **手動入力対応**: QRコードが読み取れない場合はテーブル番号を手動入力

### スタッフ向け機能
- **リアルタイム注文管理**: 受注のライブダッシュボード
- **注文ステータス更新**: 注文状況の変更（保留中 → 確認済み → 調理中 → 準備完了 → 提供済み → 完了）
- **テーブル管理**: テーブル状況管理とQRコード生成
- **メニュー管理**: カテゴリ別メニューアイテムの完全なCRUD操作（追加・編集・削除・並び替え）
- **売上レポート**: 日別・月別の売上統計と人気メニューランキング
- **カテゴリ管理**: メニューカテゴリの追加・編集・並び替え
- **アレルゲン管理**: 各メニューアイテムのアレルゲン情報設定

### 技術的特徴
- **リアルタイム更新**: Supabaseリアルタイム購読
- **モダンUI**: カスタムイタリアンレストランテーマのshadcn/ui
- **型安全性**: 完全なTypeScript実装
- **レスポンシブデザイン**: モバイルファーストアプローチ
- **QRコード生成**: テーブル用自動QRコード作成

## 🛠 技術スタック

- **フロントエンド**: Next.js 14 (App Router), React, TypeScript
- **バックエンド**: Supabase (PostgreSQL, リアルタイム, 認証)
- **UI**: shadcn/ui, Tailwind CSS
- **QRコード**: react-qr-code, qr-scanner
- **アイコン**: Lucide React
- **通知**: Sonner

## 🚀 セットアップ

### 前提条件

- Node.js 18+ 
- npm または yarn
- Supabaseアカウント

### インストール手順

1. **リポジトリをクローン**
   ```bash
   git clone <repository-url>
   cd italian-restarant-app
   ```

2. **依存関係をインストール**
   ```bash
   npm install
   ```

3. **Supabaseをセットアップ**
   - [supabase.com](https://supabase.com)で新しいSupabaseプロジェクトを作成
   - プロジェクトURLとanon keyをコピー
   - Supabase SQL エディターで以下のSQLファイルを順番に実行:
     1. `database/setup/01-schema.sql` - 基本テーブル構造
     2. `database/setup/02-rls-policies.sql` - 開発用RLSポリシー
     3. `database/setup/03-storage-setup.sql` - 画像アップロード用ストレージ
     4. `database/migrations/01-fix-tables-schema.sql` - テーブルスキーマの修正（必要な場合）

4. **環境変数を設定**
   `.env.local`ファイルを作成（.env.exampleが存在しない場合）:
   
   `.env.local`を編集してSupabaseの認証情報を追加:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

5. **開発サーバーを起動**
   ```bash
   npm run dev
   ```

6. **アプリケーションを開く**
   - お客様インターフェース: [http://localhost:3000](http://localhost:3000)
   - 管理者ダッシュボード: [http://localhost:3000/admin](http://localhost:3000/admin)

## 📱 使用方法

### お客様の場合

1. **QRコードをスキャン**: スマートフォンのカメラでテーブルのQRコードをスキャン
2. **メニューを閲覧**: カテゴリ別に整理されたメニューアイテムを表示
3. **カートに追加**: アイテムと数量を選択
4. **注文確定**: 注文内容を確認して決定
5. **ステータス追跡**: 注文の調理状況をモニター

### スタッフの場合

1. **管理者ダッシュボードにアクセス**: `/admin`に移動
2. **注文管理**: リアルタイムで注文を確認し、ステータスを更新
3. **テーブル管理**: テーブルを追加し、QRコードを生成
4. **メニュー管理**: メニューアイテムの追加・編集・無効化

## 🎨 デザインシステム

### カラーパレット（イタリアンテーマ）
- **プライマリ**（トマトレッド）: `oklch(0.47 0.15 25)`
- **セカンダリ**（バジルグリーン）: `oklch(0.25 0.02 120)`
- **アクセント**（パルメザンイエロー）: `oklch(0.75 0.12 85)`

### タイポグラフィ
- モダンでクリーンな見た目のGeist Sansを使用
- モバイル向けに最適化されたレスポンシブフォントサイズ

## 🗂 プロジェクト構造

```
├── database/              # データベース関連ファイル
│   ├── setup/            # 初期セットアップ用SQLファイル
│   ├── migrations/       # データベース変更用SQLファイル
│   ├── seeds/            # サンプルデータ投入用SQLファイル
│   └── README.md         # データベースセットアップガイド
├── src/
│   ├── app/              # Next.js App Router ページ
│   │   ├── admin/        # 管理者ダッシュボードページ
│   │   ├── table/[id]/   # お客様向けテーブルページ
│   │   │   ├── menu/     # メニュー表示
│   │   │   ├── cart/     # ショッピングカート
│   │   │   └── order/[orderId]/ # 注文ステータス
│   │   ├── layout.tsx    # ルートレイアウト
│   │   └── page.tsx      # ランディングページ
│   ├── components/       # 再利用可能コンポーネント
│   │   ├── ui/          # shadcn/ui コンポーネント
│   │   ├── qr-scanner.tsx # QRコードスキャナー
│   │   └── qr-generator.tsx # QRコード生成器
│   ├── contexts/         # React Context プロバイダー
│   │   ├── CartContext.tsx # カート状態管理
│   │   └── ThemeContext.tsx # テーマ管理
│   └── lib/
│       ├── supabase.ts   # Supabaseクライアント設定
│       ├── supabase-admin.ts # 管理者用CRUD操作
│       └── utils.ts      # 共通ユーティリティ関数
└── public/images/menu/   # メニュー画像ファイル
```

## 🚀 デプロイ

### Vercel（推奨）
1. GitHubリポジトリをVercelに接続
2. Vercelダッシュボードで環境変数を追加
3. プッシュ時に自動デプロイ

## 📋 開発用コマンド

```bash
npm run dev           # 開発サーバー起動 (http://localhost:3000)
npm run build         # 本番用ビルド
npm run start         # 本番サーバー起動
npm run lint          # ESLint実行
npx tsc --noEmit --skipLibCheck  # TypeScript型チェック
```

## 🔧 開発用ツール

### CRUD テストインターフェース
`/admin/test-crud`で以下が可能：
- データベース接続テスト
- CRUD操作の検証
- パフォーマンステスト
- スキーマ検証

### よくある問題と解決方法

1. **「column capacity does not exist」エラー**
   - `database/migrations/01-fix-tables-schema.sql`を実行

2. **RLSポリシー違反**
   - `database/setup/02-rls-policies.sql`が実行されているか確認

3. **QRスキャンが動作しない**
   - カメラ権限を確認（ブラウザ設定）
   - HTTPSまたはlocalhost経由でアクセスしているか確認
   - 別のブラウザ（Chrome推奨）で試す
   - カメラが他のアプリで使用中でないか確認

## 🔒 セキュリティ注意事項

⚠️ **重要**: 現在の設定は開発専用です。本番環境では適切な認証とロールベースのポリシーを実装してください。

## 🎯 機能の特徴

### 実装済みの高度な機能

1. **完全なCRUD操作**
   - メニューアイテム、カテゴリ、テーブル、注文の完全な管理機能
   - 管理画面での直感的な操作インターフェース

2. **リアルタイム同期**
   - Supabaseのリアルタイム機能による即時更新
   - 複数の管理者端末での同時操作対応

3. **カート永続化**
   - React Context + localStorageによるカート状態の保持
   - ページリロード後もカート内容を維持

4. **レスポンシブデザイン**
   - モバイルファーストで設計
   - タブレット・デスクトップにも最適化

5. **エラーハンドリング**
   - 全てのデータベース操作にエラー処理とトースト通知
   - ユーザーフレンドリーなエラーメッセージ

## 🚀 本番環境への準備

1. **認証の実装**: Supabase AuthまたはNext-Authの統合
2. **RLSポリシーの強化**: 本番用のセキュアなRLSポリシーの適用
3. **決済システムの統合**: StripeやPayPalなどの決済ゲートウェイ
4. **多言語対応**: i18nの実装
5. **アナリティクス**: Google AnalyticsやMixpanelの統合

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。