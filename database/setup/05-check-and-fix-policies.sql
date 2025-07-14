-- Check existing storage policies and fix if needed
-- This will help diagnose and fix storage permission issues

-- First, check what policies currently exist
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
    AND tablename = 'objects'
    AND policyname LIKE '%menu%';

-- Drop existing policies if they exist (to recreate them)
DROP POLICY IF EXISTS "Anyone can view menu images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload menu images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update menu images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete menu images" ON storage.objects;
DROP POLICY IF EXISTS "Development: Anyone can upload menu images" ON storage.objects;
DROP POLICY IF EXISTS "Development: Anyone can update menu images" ON storage.objects;
DROP POLICY IF EXISTS "Development: Anyone can delete menu images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload menu images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update menu images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete menu images" ON storage.objects;

-- Create new policies for development (allow anonymous access)
CREATE POLICY "Anyone can view menu images" ON storage.objects
    FOR SELECT USING (bucket_id = 'menu-images');

CREATE POLICY "Anyone can upload menu images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'menu-images');

CREATE POLICY "Anyone can update menu images" ON storage.objects
    FOR UPDATE USING (bucket_id = 'menu-images');

CREATE POLICY "Anyone can delete menu images" ON storage.objects
    FOR DELETE USING (bucket_id = 'menu-images');

-- Verify the new policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
    AND tablename = 'objects'
    AND policyname LIKE '%menu%';

-- Also check if we can list buckets (this might be the real issue)
SELECT * FROM storage.buckets WHERE id = 'menu-images';