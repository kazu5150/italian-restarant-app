-- Storage RLS policies for menu-images bucket
-- This should be executed after creating the bucket
-- NOTE: Skip bucket table policies if you get permission errors

-- Create policy to allow anyone to read menu images
CREATE POLICY "Anyone can view menu images" ON storage.objects
    FOR SELECT USING (bucket_id = 'menu-images');

-- Create policy to allow anyone to upload menu images (for development)
CREATE POLICY "Anyone can upload menu images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'menu-images');

-- Create policy to allow anyone to update menu images (for development)  
CREATE POLICY "Anyone can update menu images" ON storage.objects
    FOR UPDATE USING (bucket_id = 'menu-images');

-- Create policy to allow anyone to delete menu images (for development)
CREATE POLICY "Anyone can delete menu images" ON storage.objects
    FOR DELETE USING (bucket_id = 'menu-images');

-- Verify policies
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
    AND tablename IN ('buckets', 'objects')
    AND policyname LIKE '%menu%';