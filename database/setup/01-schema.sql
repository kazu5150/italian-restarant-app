-- Italian Restaurant QR Code Ordering System Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tables (restaurant tables)
CREATE TABLE tables (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    table_number INTEGER UNIQUE NOT NULL,
    qr_code TEXT NOT NULL,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'cleaning')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menu Categories
CREATE TABLE menu_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    display_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menu Items
CREATE TABLE menu_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category_id UUID REFERENCES menu_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    allergens TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    table_id UUID REFERENCES tables(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
    total_amount DECIMAL(10,2) NOT NULL,
    special_requests TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Public read access for tables
CREATE POLICY "Public read access for tables" ON tables FOR SELECT USING (true);

-- Public read access for menu categories
CREATE POLICY "Public read access for menu_categories" ON menu_categories FOR SELECT USING (true);

-- Public read access for menu items
CREATE POLICY "Public read access for menu_items" ON menu_items FOR SELECT USING (true);

-- Public access for orders (customers can create and read their orders)
CREATE POLICY "Public access for orders" ON orders FOR ALL USING (true);

-- Public access for order items
CREATE POLICY "Public access for order_items" ON order_items FOR ALL USING (true);

-- Indexes for performance
CREATE INDEX idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX idx_orders_table_id ON orders(table_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_tables_status ON tables(status);

-- Insert initial data
INSERT INTO menu_categories (name, display_order) VALUES
('前菜 / Antipasti', 1),
('パスタ / Pasta', 2),
('ピザ / Pizza', 3),
('メイン / Main Courses', 4),
('デザート / Dessert', 5),
('ドリンク / Beverages', 6);

-- Sample menu items
INSERT INTO menu_items (category_id, name, description, price, is_available, allergens) VALUES
-- Antipasti
((SELECT id FROM menu_categories WHERE name = '前菜 / Antipasti'), 
 'ブルスケッタ / Bruschetta', 'トマトとバジルの香り豊かなブルスケッタ / Fresh tomato and basil bruschetta', 890, true, '{"gluten"}'),
 
((SELECT id FROM menu_categories WHERE name = '前菜 / Antipasti'), 
 'プロシュート / Prosciutto', '18ヶ月熟成プロシュートとメロン / 18-month aged prosciutto with melon', 1680, true, '{}'),

-- Pasta
((SELECT id FROM menu_categories WHERE name = 'パスタ / Pasta'), 
 'カルボナーラ / Carbonara', '卵とペコリーノチーズの伝統的カルボナーラ / Traditional carbonara with egg and pecorino', 1580, true, '{"gluten", "eggs", "dairy"}'),
 
((SELECT id FROM menu_categories WHERE name = 'パスタ / Pasta'), 
 'アマトリチャーナ / Amatriciana', 'グアンチャーレとトマトの力強いパスタ / Robust pasta with guanciale and tomato', 1480, true, '{"gluten"}'),

-- Pizza
((SELECT id FROM menu_categories WHERE name = 'ピザ / Pizza'), 
 'マルゲリータ / Margherita', 'トマト、モッツァレラ、バジルの王道ピザ / Classic pizza with tomato, mozzarella, and basil', 1680, true, '{"gluten", "dairy"}'),
 
((SELECT id FROM menu_categories WHERE name = 'ピザ / Pizza'), 
 'クアトロ フォルマッジ / Quattro Formaggi', '4種のチーズの贅沢ピザ / Luxurious four-cheese pizza', 2180, true, '{"gluten", "dairy"}'),

-- Main Courses
((SELECT id FROM menu_categories WHERE name = 'メイン / Main Courses'), 
 'オソブッコ / Ossobuco', 'ミラノ風仔牛すね肉の煮込み / Milanese-style braised veal shank', 3280, true, '{}'),

-- Dessert
((SELECT id FROM menu_categories WHERE name = 'デザート / Dessert'), 
 'ティラミス / Tiramisu', '自家製マスカルポーネのティラミス / Homemade mascarpone tiramisu', 780, true, '{"eggs", "dairy"}'),

-- Beverages
((SELECT id FROM menu_categories WHERE name = 'ドリンク / Beverages'), 
 'エスプレッソ / Espresso', 'イタリア直輸入豆のエスプレッソ / Espresso with beans imported from Italy', 480, true, '{}'),
 
((SELECT id FROM menu_categories WHERE name = 'ドリンク / Beverages'), 
 'キャンティ / Chianti', 'トスカーナ産キャンティ（グラス）/ Tuscan Chianti (glass)', 980, true, '{}');

-- Sample tables
INSERT INTO tables (table_number, qr_code, status) VALUES
(1, 'https://your-app.com/table/1', 'available'),
(2, 'https://your-app.com/table/2', 'available'),
(3, 'https://your-app.com/table/3', 'available'),
(4, 'https://your-app.com/table/4', 'available'),
(5, 'https://your-app.com/table/5', 'available'),
(6, 'https://your-app.com/table/6', 'available'),
(7, 'https://your-app.com/table/7', 'available'),
(8, 'https://your-app.com/table/8', 'available');