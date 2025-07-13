# 🖼️ Menu Images Guide - Bella Vista

メニュー画像の管理と最適化ガイド

## 📁 現在の画像構成

```
public/images/menu/
├── antipasti/
│   ├── bruschetta.svg          🍞 ブルスケッタ
│   └── prosciutto-melon.svg    🍈 プロシュート&メロン
├── pasta/
│   ├── carbonara.svg           🍝 カルボナーラ
│   └── amatriciana.svg         🍝 アマトリチャーナ
├── pizza/
│   ├── margherita.svg          🍕 マルゲリータ
│   └── quattro-formaggi.svg    🍕 クアトロフォルマッジ
├── main/
│   └── ossobuco.svg            🥩 オソブッコ
├── dessert/
│   └── tiramisu.svg            🍰 ティラミス
└── beverages/
    ├── espresso.svg            ☕ エスプレッソ
    └── chianti.svg             🍷 キャンティ
```

## 🚀 画像を有効にする手順

### 1. データベースに画像URLを設定

Supabaseの SQL Editor で以下を実行：

```sql
-- add-menu-images.sql の内容をコピー&ペースト
-- または以下のコマンドを個別実行

UPDATE menu_items 
SET image_url = '/images/menu/pizza/margherita.svg' 
WHERE name LIKE '%マルゲリータ%' OR name LIKE '%Margherita%';
```

### 2. 開発サーバーを起動

```bash
npm run dev
```

### 3. メニューページで確認

- 顧客画面: `http://localhost:3000/table/1/menu`
- 管理画面: `http://localhost:3000/admin/menu`

## 🎨 現在のプレースホルダー画像

- **形式**: SVG (軽量、スケーラブル)
- **サイズ**: 400x300px
- **スタイル**: 料理カテゴリに応じた背景色 + 絵文字
- **目的**: デモ・開発用

## 📸 本格運用用の画像推奨

### 高品質画像サイト
1. **[Unsplash](https://unsplash.com/)**
   - キーワード: "italian food", "pizza margherita", "pasta carbonara"
   - 無料、商用利用可能

2. **[Pexels](https://www.pexels.com/)**
   - 高解像度、無料
   - プロ品質の料理写真多数

3. **[Foodiesfeed](https://www.foodiesfeed.com/)**
   - 料理専門の無料ストックフォト

### 推奨仕様
- **形式**: JPG (写真), WebP (最適化)
- **サイズ**: 800x600px または 1200x900px
- **アスペクト比**: 4:3 (メニューカード最適)
- **ファイルサイズ**: 500KB以下
- **品質**: 鮮明、明るい、食欲をそそる

## 🔄 画像の置き換え方法

### 方法1: 管理画面から (推奨)
1. `/admin/menu` にアクセス
2. メニューアイテムの編集ボタンをクリック
3. 「画像URL」フィールドに新しいパスを入力
4. プレビューで確認して保存

### 方法2: ファイル直接置き換え
1. 新しい画像を適切なフォルダに配置
2. 既存のSVGファイルと同じ名前で保存 (拡張子は変更可能)
3. 必要に応じてデータベースのimage_urlを更新

### 方法3: SQLで一括更新
```sql
-- 例: マルゲリータピザの画像を更新
UPDATE menu_items 
SET image_url = '/images/menu/pizza/margherita-hq.jpg' 
WHERE name LIKE '%マルゲリータ%';
```

## 🎯 画像最適化のヒント

### Next.js Image コンポーネントの活用
- 自動的に最適化される
- WebP形式への変換
- レスポンシブサイズ調整
- 遅延読み込み (lazy loading)

### SEO最適化
- ファイル名: `margherita-pizza.jpg` (説明的)
- Alt属性: メニューコンポーネントで自動設定
- 適切なサイズ: 不要に大きすぎない

## 🛠️ トラブルシューティング

### 画像が表示されない場合
1. ファイルパスが正確か確認
2. ファイルが実際に存在するか確認
3. ファイル権限を確認
4. ブラウザのキャッシュをクリア

### 画像が小さすぎる/大きすぎる場合
- CSS または Next.js Image コンポーネントで調整
- 元画像のアスペクト比を確認

### 読み込みが遅い場合
- 画像ファイルサイズを確認 (500KB以下推奨)
- WebP形式への変換を検討
- CDN の使用を検討

## 📝 今後の拡張

### 追加可能な機能
- 画像のアップロード機能
- 自動リサイズ
- 複数画像対応 (ギャラリー)
- 画像の A/B テスト

### プロ向け
- Cloudinary などの画像CDN連携
- 自動最適化パイプライン
- AI による画像品質チェック

---

現在のプレースホルダーは**デモ用**です。実際の運用では、魅力的な料理写真に置き換えることを強く推奨します！ 🍝✨