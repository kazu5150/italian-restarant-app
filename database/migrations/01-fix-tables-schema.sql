-- =============================================
-- テーブル構造の確認と修正
-- =============================================

-- 現在のtablesテーブル構造を確認
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'tables'
ORDER BY ordinal_position;

-- capacityカラムが存在しない場合は追加
DO $$ 
BEGIN
    -- capacityカラムの存在確認
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'tables' 
          AND column_name = 'capacity'
    ) THEN
        -- capacityカラムを追加
        ALTER TABLE tables ADD COLUMN capacity INTEGER DEFAULT 4;
        RAISE NOTICE 'Added capacity column to tables';
    ELSE
        RAISE NOTICE 'Capacity column already exists';
    END IF;

    -- statusカラムの存在確認
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'tables' 
          AND column_name = 'status'
    ) THEN
        -- statusカラムを追加
        ALTER TABLE tables ADD COLUMN status VARCHAR(20) DEFAULT 'available';
        RAISE NOTICE 'Added status column to tables';
    ELSE
        RAISE NOTICE 'Status column already exists';
    END IF;
END $$;

-- テーブル構造を再確認
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'tables'
ORDER BY ordinal_position;

-- =============================================
-- 修正されたRLSポリシー設定
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
DROP POLICY IF EXISTS "Dev: Allow all operations on tables" ON tables;

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
DROP POLICY IF EXISTS "Dev: Allow all operations on menu_categories" ON menu_categories;

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
DROP POLICY IF EXISTS "Dev: Allow all operations on menu_items" ON menu_items;

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
DROP POLICY IF EXISTS "Dev: Allow all operations on orders" ON orders;

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
DROP POLICY IF EXISTS "Dev: Allow all operations on order_items" ON order_items;

-- 開発用: 全ユーザーに完全なCRUDアクセスを許可
CREATE POLICY "Dev: Allow all operations on order_items" ON order_items
FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- 修正された統計ビュー（capacityカラムを考慮）
-- =============================================

-- 既存のビューを削除
DROP VIEW IF EXISTS table_usage;

-- テーブル使用状況ビュー（capacityカラムの存在を確認してから作成）
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'tables' 
          AND column_name = 'capacity'
    ) THEN
        -- capacityカラムがある場合
        EXECUTE 'CREATE OR REPLACE VIEW table_usage AS
        SELECT 
            t.id,
            t.table_number,
            t.capacity,
            t.status,
            COUNT(o.id) as total_orders,
            COALESCE(SUM(o.total_amount), 0) as total_revenue,
            MAX(o.created_at) as last_order_time
        FROM tables t
        LEFT JOIN orders o ON t.id = o.table_id
        GROUP BY t.id, t.table_number, t.capacity, t.status
        ORDER BY t.table_number';
    ELSE
        -- capacityカラムがない場合
        EXECUTE 'CREATE OR REPLACE VIEW table_usage AS
        SELECT 
            t.id,
            t.table_number,
            4 as capacity,
            COALESCE(t.status, ''available'') as status,
            COUNT(o.id) as total_orders,
            COALESCE(SUM(o.total_amount), 0) as total_revenue,
            MAX(o.created_at) as last_order_time
        FROM tables t
        LEFT JOIN orders o ON t.id = o.table_id
        GROUP BY t.id, t.table_number, t.status
        ORDER BY t.table_number';
    END IF;
    
    RAISE NOTICE 'Table usage view created successfully';
END $$;

-- =============================================
-- その他のビューを作成
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

-- =============================================
-- テストデータ挿入関数
-- =============================================

CREATE OR REPLACE FUNCTION insert_test_data()
RETURNS void AS $$
BEGIN
    -- カテゴリテストデータ
    IF NOT EXISTS (SELECT 1 FROM menu_categories LIMIT 1) THEN
        INSERT INTO menu_categories (name, description, display_order) VALUES
        ('前菜 / Antipasti', '新鮮な前菜をお楽しみください', 1),
        ('パスタ / Pasta', '手作り生パスタ', 2),
        ('ピザ / Pizza', '薪窯で焼いた本格ピザ', 3),
        ('メイン / Main', 'メイン料理', 4),
        ('デザート / Dessert', '自家製デザート', 5),
        ('ドリンク / Beverages', 'お飲み物', 6);
        
        RAISE NOTICE 'Test categories inserted successfully';
    END IF;
    
    -- テーブルテストデータ
    IF NOT EXISTS (SELECT 1 FROM tables LIMIT 1) THEN
        -- capacityカラムの存在確認
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
              AND table_name = 'tables' 
              AND column_name = 'capacity'
        ) THEN
            -- capacityカラムがある場合
            INSERT INTO tables (table_number, capacity, status) VALUES
            (1, 4, 'available'),
            (2, 2, 'available'),
            (3, 6, 'available'),
            (4, 4, 'occupied'),
            (5, 8, 'available');
        ELSE
            -- capacityカラムがない場合
            INSERT INTO tables (table_number) VALUES (1), (2), (3), (4), (5);
        END IF;
        
        RAISE NOTICE 'Test tables inserted successfully';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- テストデータ挿入実行
SELECT insert_test_data();

-- =============================================
-- 最終確認
-- =============================================

-- 全テーブルの構造を確認
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('tables', 'menu_categories', 'menu_items', 'orders', 'order_items')
ORDER BY table_name, ordinal_position;

-- ポリシー確認
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

COMMIT;