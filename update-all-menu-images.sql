-- Update ALL menu images with new image files
-- Run this in your Supabase SQL Editor

-- ========================================
-- ANTIPASTI (前菜)
-- ========================================
UPDATE menu_items 
SET image_url = '/images/menu/antipasti/Bruschetta.png' 
WHERE name LIKE '%ブルスケッタ%' OR name LIKE '%Bruschetta%';

UPDATE menu_items 
SET image_url = '/images/menu/antipasti/Prosciutto.png' 
WHERE name LIKE '%プロシュート%' OR name LIKE '%Prosciutto%';

-- ========================================
-- PASTA (パスタ)
-- ========================================
UPDATE menu_items 
SET image_url = '/images/menu/pasta/Carbonara.png' 
WHERE name LIKE '%カルボナーラ%' OR name LIKE '%Carbonara%';

UPDATE menu_items 
SET image_url = '/images/menu/pasta/Amatriciana.png' 
WHERE name LIKE '%アマトリチャーナ%' OR name LIKE '%Amatriciana%';

-- ========================================
-- PIZZA (ピザ)
-- ========================================
UPDATE menu_items 
SET image_url = '/images/menu/pizza/Matgherita.png' 
WHERE name LIKE '%マルゲリータ%' OR name LIKE '%Margherita%';

UPDATE menu_items 
SET image_url = '/images/menu/pizza/Quattro-formaggi.png' 
WHERE name LIKE '%クアトロ%' OR name LIKE '%Quattro%';

-- ========================================
-- MAIN COURSES (メイン)
-- ========================================
UPDATE menu_items 
SET image_url = '/images/menu/main/Ossobuco.png' 
WHERE name LIKE '%オソブッコ%' OR name LIKE '%Ossobuco%';

-- ========================================
-- DESSERT (デザート)
-- ========================================
UPDATE menu_items 
SET image_url = '/images/menu/dessert/Tiramisu.png' 
WHERE name LIKE '%ティラミス%' OR name LIKE '%Tiramisu%';

-- ========================================
-- BEVERAGES (ドリンク)
-- ========================================
UPDATE menu_items 
SET image_url = '/images/menu/beverages/Espresso.png' 
WHERE name LIKE '%エスプレッソ%' OR name LIKE '%Espresso%';

UPDATE menu_items 
SET image_url = '/images/menu/beverages/Chianti.png' 
WHERE name LIKE '%キャンティ%' OR name LIKE '%Chianti%';

-- ========================================
-- VERIFY ALL UPDATES
-- ========================================
SELECT 
    mc.name as category,
    mi.name as item_name,
    mi.image_url,
    CASE 
        WHEN mi.image_url IS NOT NULL THEN '✅ 画像あり'
        ELSE '❌ 画像なし'
    END as status
FROM menu_items mi
JOIN menu_categories mc ON mi.category_id = mc.id
ORDER BY mc.display_order, mi.name;