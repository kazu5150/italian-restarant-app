-- Fix bucket access for development
-- This allows the application to list buckets

-- Check current bucket policies
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
    AND tablename = 'buckets';

-- Create a policy to allow listing buckets for development
-- Note: This might fail if you don't have sufficient permissions
-- In that case, try the alternative approach below

-- Method 1: Create bucket read policy (may require admin permissions)
CREATE POLICY "Allow bucket listing for development" ON storage.buckets
    FOR SELECT USING (true);

-- Method 2: Alternative - Skip bucket existence check
-- If Method 1 fails, we'll modify the code to skip the bucket check