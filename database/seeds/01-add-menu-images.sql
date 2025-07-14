-- SQL commands to add image URLs to existing menu items
-- Run this in your Supabase SQL Editor after adding image files

-- Update Antipasti images
UPDATE menu_items 
SET image_url = '/images/menu/antipasti/bruschetta.svg' 
WHERE name LIKE '%ブルスケッタ%' OR name LIKE '%Bruschetta%';

UPDATE menu_items 
SET image_url = '/images/menu/antipasti/prosciutto-melon.svg' 
WHERE name LIKE '%プロシュート%' OR name LIKE '%Prosciutto%';

-- Update Pasta images
UPDATE menu_items 
SET image_url = '/images/menu/pasta/carbonara.svg' 
WHERE name LIKE '%カルボナーラ%' OR name LIKE '%Carbonara%';

UPDATE menu_items 
SET image_url = '/images/menu/pasta/amatriciana.svg' 
WHERE name LIKE '%アマトリチャーナ%' OR name LIKE '%Amatriciana%';

-- Update Pizza images
UPDATE menu_items 
SET image_url = '/images/menu/pizza/margherita.svg' 
WHERE name LIKE '%マルゲリータ%' OR name LIKE '%Margherita%';

UPDATE menu_items 
SET image_url = '/images/menu/pizza/quattro-formaggi.svg' 
WHERE name LIKE '%クアトロ%' OR name LIKE '%Quattro%';

-- Update Main Course images
UPDATE menu_items 
SET image_url = '/images/menu/main/ossobuco.svg' 
WHERE name LIKE '%オソブッコ%' OR name LIKE '%Ossobuco%';

-- Update Dessert images
UPDATE menu_items 
SET image_url = '/images/menu/dessert/tiramisu.svg' 
WHERE name LIKE '%ティラミス%' OR name LIKE '%Tiramisu%';

-- Update Beverage images
UPDATE menu_items 
SET image_url = '/images/menu/beverages/espresso.svg' 
WHERE name LIKE '%エスプレッソ%' OR name LIKE '%Espresso%';

UPDATE menu_items 
SET image_url = '/images/menu/beverages/chianti.svg' 
WHERE name LIKE '%キャンティ%' OR name LIKE '%Chianti%';

-- Verify the updates
SELECT name, image_url FROM menu_items WHERE image_url IS NOT NULL;