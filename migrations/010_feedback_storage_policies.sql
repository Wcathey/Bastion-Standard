-- =====================================================
-- Migration: 010_feedback_storage_policies.sql
-- Description: Creates RLS policies for feedback storage bucket
-- Run this in: Supabase Dashboard > SQL Editor
-- Depends on: 008_feedback_table.sql
-- =====================================================

-- Note: The storage bucket 'feedback' should already be created manually
-- This migration only creates the RLS policies for the bucket

-- =====================================================
-- Storage RLS Policies for 'feedback' bucket
-- =====================================================

-- Policy: Allow authenticated users to upload images to feedback/images/ folder
CREATE POLICY "Authenticated users can upload feedback images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'feedback'
    AND (storage.foldername(name))[1] = 'images'
  );

-- Policy: Users can view their own uploaded images
CREATE POLICY "Users can view their own feedback images"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'feedback'
    AND (storage.foldername(name))[1] = 'images'
    AND owner = auth.uid()
  );

-- Policy: Admins can view all feedback images
CREATE POLICY "Admins can view all feedback images"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'feedback'
    AND (storage.foldername(name))[1] = 'images'
    AND EXISTS (
      SELECT 1 FROM public.accounts
      WHERE user_id = auth.uid()
      AND user_type = 'admin'
    )
  );

-- Policy: Admins can update feedback images
CREATE POLICY "Admins can update feedback images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'feedback'
    AND (storage.foldername(name))[1] = 'images'
    AND EXISTS (
      SELECT 1 FROM public.accounts
      WHERE user_id = auth.uid()
      AND user_type = 'admin'
    )
  )
  WITH CHECK (
    bucket_id = 'feedback'
    AND (storage.foldername(name))[1] = 'images'
  );

-- Policy: Admins can delete feedback images
CREATE POLICY "Admins can delete feedback images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'feedback'
    AND (storage.foldername(name))[1] = 'images'
    AND EXISTS (
      SELECT 1 FROM public.accounts
      WHERE user_id = auth.uid()
      AND user_type = 'admin'
    )
  );

-- =====================================================
-- Notes:
-- - The 'feedback' bucket must be created manually before running this migration
-- - The bucket should be set to PRIVATE (not public)
-- - These policies allow:
--   * Authenticated users to upload images to feedback/images/ folder
--   * Users to view their own uploaded images (based on owner column)
--   * Admins to view, update, and delete all images in the bucket
-- - Images are automatically owned by the user who uploads them (owner = auth.uid())
-- - This ensures users can see their own feedback images while keeping others' images private
-- - Admins have full access to all images for review purposes
-- - The folder structure is enforced: only images/ folder is allowed
-- =====================================================
