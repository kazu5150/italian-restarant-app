-- Supabase Storage setup for menu images
-- This file should be executed in Supabase SQL Editor after the schema setup
-- IMPORTANT: This must be run by a user with sufficient privileges (service_role or admin)

-- First, enable the storage extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Method 1: Using INSERT (requires proper RLS policies)
-- Create storage bucket for menu images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'menu-images',
  'menu-images',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Method 2: Alternative using Supabase Dashboard
-- If the above fails, create the bucket manually in the Supabase Dashboard:
-- 1. Go to Storage section in Supabase Dashboard
-- 2. Click "Create bucket"
-- 3. Name: menu-images
-- 4. Public: true
-- 5. File size limit: 5MB
-- 6. Allowed MIME types: image/jpeg, image/png, image/webp, image/gif

-- Verify bucket creation
SELECT * FROM storage.buckets WHERE id = 'menu-images';

-- Create RLS policies for the storage bucket
CREATE POLICY "Anyone can view menu images" ON storage.objects
  FOR SELECT USING (bucket_id = 'menu-images');

CREATE POLICY "Authenticated users can upload menu images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'menu-images' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can update menu images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'menu-images' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can delete menu images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'menu-images' AND
    auth.role() = 'authenticated'
  );

-- For development: Allow anonymous access (remove in production)
CREATE POLICY "Development: Anyone can upload menu images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'menu-images');

CREATE POLICY "Development: Anyone can update menu images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'menu-images');

CREATE POLICY "Development: Anyone can delete menu images" ON storage.objects
  FOR DELETE USING (bucket_id = 'menu-images');