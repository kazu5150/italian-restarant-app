-- Update Antipasti images with new PNG files
-- Run this in your Supabase SQL Editor

-- Update Bruschetta image
UPDATE menu_items 
SET image_url = '/images/menu/antipasti/Bruschetta.png' 
WHERE name LIKE '%ブルスケッタ%' OR name LIKE '%Bruschetta%';

-- Update Prosciutto image
UPDATE menu_items 
SET image_url = '/images/menu/antipasti/Prosciutto.png' 
WHERE name LIKE '%プロシュート%' OR name LIKE '%Prosciutto%';

-- Verify the updates
SELECT name, image_url FROM menu_items 
WHERE category_id = (SELECT id FROM menu_categories WHERE name LIKE '%前菜%' OR name LIKE '%Antipasti%');