-- =====================================================
-- Migration: 009_tickets_table.sql
-- Description: Creates tickets table for customer support ticket system
-- Run this in: Supabase Dashboard > SQL Editor
-- Depends on: 001_initial_schema.sql, 002_admin_accounts_security.sql
-- =====================================================

-- Create tickets table
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- User who submitted the ticket (nullable - allows anonymous submissions)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Ticket content from the form
  subject TEXT NOT NULL,
  message TEXT NOT NULL,

  -- Admin assignment
  assigned_to UUID REFERENCES public.admin_accounts(id) ON DELETE SET NULL,

  -- Status tracking via timestamps (instead of enum)
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE,
  in_review_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Admin notes and resolution
  admin_notes TEXT,
  resolution TEXT,

  -- Priority (can be set by admin)
  priority TEXT DEFAULT 'medium' CHECK (priority IN (
    'low',
    'medium',
    'high',
    'urgent'
  )),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  -- Constraints: If any status timestamp exists (except submitted), assigned_to must exist
  CONSTRAINT ticket_assigned_required CHECK (
    (assigned_at IS NULL AND in_review_at IS NULL AND completed_at IS NULL)
    OR
    (assigned_to IS NOT NULL)
  ),

  -- Logical constraints: timestamps should be in order
  CONSTRAINT ticket_timeline_order CHECK (
    (assigned_at IS NULL OR assigned_at >= submitted_at)
    AND (in_review_at IS NULL OR in_review_at >= COALESCE(assigned_at, submitted_at))
    AND (completed_at IS NULL OR completed_at >= COALESCE(in_review_at, assigned_at, submitted_at))
  )
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS tickets_user_id_idx ON public.tickets(user_id);
CREATE INDEX IF NOT EXISTS tickets_assigned_to_idx ON public.tickets(assigned_to);
CREATE INDEX IF NOT EXISTS tickets_submitted_at_idx ON public.tickets(submitted_at DESC);
CREATE INDEX IF NOT EXISTS tickets_priority_idx ON public.tickets(priority);
CREATE INDEX IF NOT EXISTS tickets_completed_at_idx ON public.tickets(completed_at);

-- Composite index for finding unassigned tickets
CREATE INDEX IF NOT EXISTS tickets_unassigned_idx ON public.tickets(submitted_at DESC)
  WHERE assigned_to IS NULL AND completed_at IS NULL;

-- Composite index for finding active tickets by admin
CREATE INDEX IF NOT EXISTS tickets_active_by_admin_idx ON public.tickets(assigned_to, submitted_at DESC)
  WHERE completed_at IS NULL;

-- Attach updated_at trigger
DROP TRIGGER IF EXISTS set_updated_at_tickets ON public.tickets;
CREATE TRIGGER set_updated_at_tickets
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own tickets
CREATE POLICY "Users can view their own tickets"
  ON public.tickets
  FOR SELECT
  USING (
    auth.uid() = user_id
  );

-- Policy: Users can insert their own tickets
CREATE POLICY "Users can insert tickets"
  ON public.tickets
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR user_id IS NULL
  );

-- Policy: Admins can view all tickets
CREATE POLICY "Admins can view all tickets"
  ON public.tickets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.accounts
      WHERE user_id = auth.uid()
      AND user_type = 'admin'
    )
  );

-- Policy: Admins can update all tickets
CREATE POLICY "Admins can update all tickets"
  ON public.tickets
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

-- Policy: Admins can delete tickets
CREATE POLICY "Admins can delete tickets"
  ON public.tickets
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

-- View: Unassigned tickets
CREATE OR REPLACE VIEW public.unassigned_tickets AS
SELECT
  t.*,
  a.first_name AS user_first_name,
  a.last_name AS user_last_name,
  u.email AS user_email
FROM public.tickets t
LEFT JOIN public.accounts a ON t.user_id = a.user_id
LEFT JOIN auth.users u ON t.user_id = u.id
WHERE t.assigned_to IS NULL
  AND t.completed_at IS NULL
ORDER BY
  CASE t.priority
    WHEN 'urgent' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    WHEN 'low' THEN 4
  END,
  t.submitted_at ASC;

-- View: Active tickets (not completed)
CREATE OR REPLACE VIEW public.active_tickets AS
SELECT
  t.*,
  a.first_name AS user_first_name,
  a.last_name AS user_last_name,
  u.email AS user_email,
  aa.first_name AS admin_first_name,
  aa.last_name AS admin_last_name,
  aa.email AS admin_email
FROM public.tickets t
LEFT JOIN public.accounts a ON t.user_id = a.user_id
LEFT JOIN auth.users u ON t.user_id = u.id
LEFT JOIN public.admin_accounts aa ON t.assigned_to = aa.id
WHERE t.completed_at IS NULL
ORDER BY
  CASE t.priority
    WHEN 'urgent' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    WHEN 'low' THEN 4
  END,
  t.submitted_at ASC;

-- View: Completed tickets
CREATE OR REPLACE VIEW public.completed_tickets AS
SELECT
  t.*,
  a.first_name AS user_first_name,
  a.last_name AS user_last_name,
  u.email AS user_email,
  aa.first_name AS admin_first_name,
  aa.last_name AS admin_last_name,
  aa.email AS admin_email
FROM public.tickets t
LEFT JOIN public.accounts a ON t.user_id = a.user_id
LEFT JOIN auth.users u ON t.user_id = u.id
LEFT JOIN public.admin_accounts aa ON t.assigned_to = aa.id
WHERE t.completed_at IS NOT NULL
ORDER BY t.completed_at DESC;

-- View: Tickets by admin
CREATE OR REPLACE VIEW public.tickets_by_admin AS
SELECT
  aa.id AS admin_id,
  aa.first_name AS admin_first_name,
  aa.last_name AS admin_last_name,
  aa.email AS admin_email,
  COUNT(*) AS total_tickets,
  COUNT(*) FILTER (WHERE t.completed_at IS NULL) AS active_tickets,
  COUNT(*) FILTER (WHERE t.completed_at IS NOT NULL) AS completed_tickets,
  COUNT(*) FILTER (WHERE t.in_review_at IS NOT NULL AND t.completed_at IS NULL) AS in_review_tickets,
  AVG(
    EXTRACT(EPOCH FROM (COALESCE(t.completed_at, NOW()) - t.submitted_at)) / 3600
  )::NUMERIC(10,2) AS avg_resolution_hours
FROM public.admin_accounts aa
LEFT JOIN public.tickets t ON aa.id = t.assigned_to
WHERE aa.is_active = true
GROUP BY aa.id, aa.first_name, aa.last_name, aa.email
ORDER BY total_tickets DESC;

-- View: Ticket statistics
CREATE OR REPLACE VIEW public.ticket_statistics AS
SELECT
  COUNT(*) AS total_tickets,
  COUNT(*) FILTER (WHERE assigned_to IS NULL) AS unassigned_tickets,
  COUNT(*) FILTER (WHERE assigned_to IS NOT NULL AND completed_at IS NULL) AS assigned_tickets,
  COUNT(*) FILTER (WHERE in_review_at IS NOT NULL AND completed_at IS NULL) AS in_review_tickets,
  COUNT(*) FILTER (WHERE completed_at IS NOT NULL) AS completed_tickets,
  COUNT(*) FILTER (WHERE priority = 'urgent') AS urgent_tickets,
  COUNT(*) FILTER (WHERE priority = 'high') AS high_priority_tickets,
  COUNT(*) FILTER (WHERE priority = 'medium') AS medium_priority_tickets,
  COUNT(*) FILTER (WHERE priority = 'low') AS low_priority_tickets,
  AVG(
    EXTRACT(EPOCH FROM (completed_at - submitted_at)) / 3600
  )::NUMERIC(10,2) AS avg_completion_hours
FROM public.tickets;

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function: Get current ticket status as text
CREATE OR REPLACE FUNCTION public.get_ticket_status(ticket_row public.tickets)
RETURNS TEXT AS $$
BEGIN
  IF ticket_row.completed_at IS NOT NULL THEN
    RETURN 'completed';
  ELSIF ticket_row.in_review_at IS NOT NULL THEN
    RETURN 'in_review';
  ELSIF ticket_row.assigned_at IS NOT NULL THEN
    RETURN 'assigned';
  ELSE
    RETURN 'submitted';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- Notes:
-- - Supports both authenticated and anonymous ticket submissions (user_id nullable)
-- - Status is tracked via timestamps instead of enum for better audit trail
-- - Timeline constraints ensure logical progression of ticket states
-- - assigned_to references admin_accounts table for admin assignment
-- - Constraint ensures tickets cannot be assigned/reviewed/completed without an admin
-- - RLS policies allow users to view their own tickets
-- - Admins (user_type = 'admin') can view and manage all tickets
-- - Views provide:
--   * unassigned_tickets: New tickets waiting for assignment
--   * active_tickets: All tickets not yet completed
--   * completed_tickets: Resolved tickets
--   * tickets_by_admin: Performance metrics per admin
--   * ticket_statistics: Overall system metrics
-- - Helper function get_ticket_status() returns current status as text
-- - Priority can be set by admins for triage (default: medium)
-- - Includes resolution and admin_notes fields for tracking outcomes
-- =====================================================
