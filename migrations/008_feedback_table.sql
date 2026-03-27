-- =====================================================
-- Migration: 008_feedback_table.sql
-- Description: Creates feedback table to store user feedback and bug reports
-- Run this in: Supabase Dashboard > SQL Editor
-- Depends on: 001_initial_schema.sql
-- =====================================================

-- Create feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- User reference (nullable - allows anonymous feedback)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Feedback classification
  category TEXT NOT NULL CHECK (category IN (
    'Feature Issue',
    'Recommendation',
    'Suggest a Feature',
    'Report a Bug',
    'Performance Issue',
    'Design/UI Feedback',
    'Other'
  )),

  -- Context information
  page_name TEXT, -- Page where feedback was submitted
  description TEXT NOT NULL,

  -- Supporting images
  primary_supporting_image_url TEXT,
  secondary_supporting_image_url TEXT,

  -- Status tracking
  status TEXT DEFAULT 'open' NOT NULL CHECK (status IN (
    'open',
    'in_review',
    'in_progress',
    'resolved',
    'closed',
    'wont_fix'
  )),

  -- Priority (can be set by admin)
  priority TEXT DEFAULT 'medium' CHECK (priority IN (
    'low',
    'medium',
    'high',
    'urgent'
  )),

  -- Admin response
  admin_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS feedback_user_id_idx ON public.feedback(user_id);
CREATE INDEX IF NOT EXISTS feedback_category_idx ON public.feedback(category);
CREATE INDEX IF NOT EXISTS feedback_status_idx ON public.feedback(status);
CREATE INDEX IF NOT EXISTS feedback_priority_idx ON public.feedback(priority);
CREATE INDEX IF NOT EXISTS feedback_created_at_idx ON public.feedback(created_at DESC);

-- Attach updated_at trigger
DROP TRIGGER IF EXISTS set_updated_at_feedback ON public.feedback;
CREATE TRIGGER set_updated_at_feedback
  BEFORE UPDATE ON public.feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own feedback
CREATE POLICY "Users can view their own feedback"
  ON public.feedback
  FOR SELECT
  USING (
    auth.uid() = user_id
  );

-- Policy: Users can insert their own feedback
CREATE POLICY "Users can insert feedback"
  ON public.feedback
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR user_id IS NULL
  );

-- Policy: Users can update their own open feedback
CREATE POLICY "Users can update their own open feedback"
  ON public.feedback
  FOR UPDATE
  USING (
    auth.uid() = user_id
    AND status = 'open'
  )
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'open'
  );

-- Policy: Admins can view all feedback
CREATE POLICY "Admins can view all feedback"
  ON public.feedback
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.accounts
      WHERE user_id = auth.uid()
      AND user_type = 'admin'
    )
  );

-- Policy: Admins can update all feedback
CREATE POLICY "Admins can update all feedback"
  ON public.feedback
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.accounts
      WHERE user_id = auth.uid()
      AND user_type = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.accounts
      WHERE user_id = auth.uid()
      AND user_type = 'admin'
    )
  );

-- Policy: Admins can delete feedback
CREATE POLICY "Admins can delete feedback"
  ON public.feedback
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.accounts
      WHERE user_id = auth.uid()
      AND user_type = 'admin'
    )
  );

-- =====================================================
-- Views for Admin Dashboard
-- =====================================================

-- View: Open feedback items
CREATE OR REPLACE VIEW public.open_feedback AS
SELECT
  f.*,
  a.first_name,
  a.last_name,
  u.email
FROM public.feedback f
LEFT JOIN public.accounts a ON f.user_id = a.user_id
LEFT JOIN auth.users u ON f.user_id = u.id
WHERE f.status IN ('open', 'in_review', 'in_progress')
ORDER BY
  CASE f.priority
    WHEN 'urgent' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    WHEN 'low' THEN 4
  END,
  f.created_at DESC;

-- View: Feedback summary by category
CREATE OR REPLACE VIEW public.feedback_summary AS
SELECT
  category,
  COUNT(*) AS total_count,
  COUNT(*) FILTER (WHERE status = 'open') AS open_count,
  COUNT(*) FILTER (WHERE status = 'in_review') AS in_review_count,
  COUNT(*) FILTER (WHERE status = 'in_progress') AS in_progress_count,
  COUNT(*) FILTER (WHERE status = 'resolved') AS resolved_count,
  COUNT(*) FILTER (WHERE status = 'closed') AS closed_count
FROM public.feedback
GROUP BY category
ORDER BY total_count DESC;

-- =====================================================
-- Notes:
-- - Supports both authenticated and anonymous feedback (user_id nullable)
-- - Categories match frontend FEEDBACK_CATEGORIES array
-- - Images are stored in Supabase Storage bucket 'feedback', folder 'images'
-- - Status workflow: open -> in_review -> in_progress -> resolved/closed
-- - RLS policies allow users to manage their own open feedback
-- - Admins can view and manage all feedback
-- - Views provide quick access to open items and category summaries
-- - Priority can be set by admins for triage
-- - Tracks resolution details (resolved_at, resolved_by, admin_notes)
-- =====================================================
