-- =============================================
-- Supabase RLS ポリシー設定 (開発用)
-- 本番環境では適切な認証ベースのポリシーに変更してください
-- =============================================

-- すべてのテーブルでRLSを有効化
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- =============================================
-- TABLES テーブル
-- =============================================

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Anyone can view tables" ON tables;
DROP POLICY IF EXISTS "Anyone can insert tables" ON tables;
DROP POLICY IF EXISTS "Anyone can update tables" ON tables;
DROP POLICY IF EXISTS "Anyone can delete tables" ON tables;

-- 開発用: 全ユーザーに完全なCRUDアクセスを許可
CREATE POLICY "Dev: Allow all operations on tables" ON tables
FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- MENU_CATEGORIES テーブル
-- =============================================

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Anyone can view menu categories" ON menu_categories;
DROP POLICY IF EXISTS "Anyone can insert menu categories" ON menu_categories;
DROP POLICY IF EXISTS "Anyone can update menu categories" ON menu_categories;
DROP POLICY IF EXISTS "Anyone can delete menu categories" ON menu_categories;

-- 開発用: 全ユーザーに完全なCRUDアクセスを許可
CREATE POLICY "Dev: Allow all operations on menu_categories" ON menu_categories
FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- MENU_ITEMS テーブル
-- =============================================

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Anyone can view menu items" ON menu_items;
DROP POLICY IF EXISTS "Anyone can insert menu items" ON menu_items;
DROP POLICY IF EXISTS "Anyone can update menu items" ON menu_items;
DROP POLICY IF EXISTS "Anyone can delete menu items" ON menu_items;

-- 開発用: 全ユーザーに完全なCRUDアクセスを許可
CREATE POLICY "Dev: Allow all operations on menu_items" ON menu_items
FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- ORDERS テーブル
-- =============================================

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Anyone can view orders" ON orders;
DROP POLICY IF EXISTS "Anyone can insert orders" ON orders;
DROP POLICY IF EXISTS "Anyone can update orders" ON orders;
DROP POLICY IF EXISTS "Anyone can delete orders" ON orders;

-- 開発用: 全ユーザーに完全なCRUDアクセスを許可
CREATE POLICY "Dev: Allow all operations on orders" ON orders
FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- ORDER_ITEMS テーブル
-- =============================================

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Anyone can view order items" ON order_items;
DROP POLICY IF EXISTS "Anyone can insert order items" ON order_items;
DROP POLICY IF EXISTS "Anyone can update order items" ON order_items;
DROP POLICY IF EXISTS "Anyone can delete order items" ON order_items;

-- 開発用: 全ユーザーに完全なCRUDアクセスを許可
CREATE POLICY "Dev: Allow all operations on order_items" ON order_items
FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- 現在のポリシー確認
-- =============================================

-- すべてのポリシーを確認
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =============================================
-- 開発用補助関数とビュー
-- =============================================

-- 注文統計ビュー
CREATE OR REPLACE VIEW order_statistics AS
SELECT 
    DATE(created_at) as order_date,
    COUNT(*) as total_orders,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as avg_order_value,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
    COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_orders,
    COUNT(CASE WHEN status = 'preparing' THEN 1 END) as preparing_orders,
    COUNT(CASE WHEN status = 'ready' THEN 1 END) as ready_orders,
    COUNT(CASE WHEN status = 'served' THEN 1 END) as served_orders,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders
FROM orders 
GROUP BY DATE(created_at)
ORDER BY order_date DESC;

-- 人気商品ビュー
CREATE OR REPLACE VIEW popular_menu_items AS
SELECT 
    mi.id,
    mi.name,
    mi.price,
    mc.name as category_name,
    SUM(oi.quantity) as total_quantity_ordered,
    COUNT(DISTINCT oi.order_id) as order_count,
    SUM(oi.quantity * oi.unit_price) as total_revenue
FROM menu_items mi
JOIN order_items oi ON mi.id = oi.menu_item_id
JOIN orders o ON oi.order_id = o.id
JOIN menu_categories mc ON mi.category_id = mc.id
WHERE o.status != 'cancelled'
GROUP BY mi.id, mi.name, mi.price, mc.name
ORDER BY total_quantity_ordered DESC;

-- テーブル使用状況ビュー  
CREATE OR REPLACE VIEW table_usage AS
SELECT 
    t.id,
    t.table_number,
    t.capacity,
    t.status,
    COUNT(o.id) as total_orders,
    SUM(o.total_amount) as total_revenue,
    MAX(o.created_at) as last_order_time
FROM tables t
LEFT JOIN orders o ON t.id = o.table_id
GROUP BY t.id, t.table_number, t.capacity, t.status
ORDER BY t.table_number;

-- =============================================
-- 開発用テストデータ挿入関数
-- =============================================

-- テストデータ挿入関数
CREATE OR REPLACE FUNCTION insert_test_data()
RETURNS void AS $$
BEGIN
    -- テーブルが空の場合のみテストデータを挿入
    IF NOT EXISTS (SELECT 1 FROM menu_categories LIMIT 1) THEN
        -- カテゴリ挿入
        INSERT INTO menu_categories (name, description, display_order) VALUES
        ('前菜 / Antipasti', '新鮮な前菜をお楽しみください', 1),
        ('パスタ / Pasta', '手作り生パスタ', 2),
        ('ピザ / Pizza', '薪窯で焼いた本格ピザ', 3),
        ('メイン / Main', 'メイン料理', 4),
        ('デザート / Dessert', '自家製デザート', 5),
        ('ドリンク / Beverages', 'お飲み物', 6);
        
        RAISE NOTICE 'Test categories inserted successfully';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM tables LIMIT 1) THEN
        -- テーブル挿入
        INSERT INTO tables (table_number, capacity, status) VALUES
        (1, 4, 'available'),
        (2, 2, 'available'),
        (3, 6, 'available'),
        (4, 4, 'occupied'),
        (5, 8, 'available');
        
        RAISE NOTICE 'Test tables inserted successfully';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- テストデータ挿入実行
SELECT insert_test_data();

-- =============================================
-- 権限確認
-- =============================================

-- 現在のユーザーの権限を確認
SELECT 
    table_name,
    privilege_type
FROM information_schema.role_table_grants 
WHERE grantee = current_user
    AND table_schema = 'public'
    AND table_name IN ('tables', 'menu_categories', 'menu_items', 'orders', 'order_items')
ORDER BY table_name, privilege_type;

-- RLS状態を確認
SELECT 
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
    AND tablename IN ('tables', 'menu_categories', 'menu_items', 'orders', 'order_items');

COMMIT;