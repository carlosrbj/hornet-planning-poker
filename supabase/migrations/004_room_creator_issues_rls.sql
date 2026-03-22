-- =====================================================================
-- FIX: infinite recursion in room_participants RLS policies
-- =====================================================================
-- The root cause is that "Participants view room members" does a
-- SELECT on room_participants itself, triggering the same policy
-- recursively. We fix this by:
--
-- 1. Creating a SECURITY DEFINER helper that checks membership
--    WITHOUT triggering RLS (bypasses it).
-- 2. Rewriting all policies that referenced room_participants
--    to use this helper instead.
-- =====================================================================

-- 1) Helper function: checks if current user is a member of a room.
--    SECURITY DEFINER = runs with the function owner's privileges,
--    so the inner SELECT bypasses RLS on room_participants.
CREATE OR REPLACE FUNCTION public.is_room_member(p_room_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM room_participants
    WHERE room_id = p_room_id AND user_id = auth.uid()
  );
$$;

-- 2) Fix room_participants own SELECT policy (was self-referencing → recursion)
DROP POLICY IF EXISTS "Participants view room members" ON public.room_participants;
CREATE POLICY "Participants view room members" ON public.room_participants
  FOR SELECT USING (public.is_room_member(room_id));

-- 3) Fix issues SELECT policy
DROP POLICY IF EXISTS "Participants view issues" ON public.issues;
CREATE POLICY "Participants view issues" ON public.issues
  FOR SELECT USING (public.is_room_member(room_id));

-- 4) Fix issues ALL policy — allow room CREATOR to manage issues
--    (uses rooms.created_by, no room_participants dependency)
DROP POLICY IF EXISTS "Facilitator manages issues" ON public.issues;
DROP POLICY IF EXISTS "Room creator manages issues" ON public.issues;
CREATE POLICY "Room creator manages issues" ON public.issues
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.rooms
      WHERE rooms.id = issues.room_id AND rooms.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.rooms
      WHERE rooms.id = issues.room_id AND rooms.created_by = auth.uid()
    )
  );

-- 5) Fix votes SELECT policies
DROP POLICY IF EXISTS "All votes visible after reveal" ON public.votes;
CREATE POLICY "All votes visible after reveal" ON public.votes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.issues
      WHERE issues.id = votes.issue_id AND issues.status = 'revealed'
    )
  );

-- 6) Fix session_history SELECT policy
DROP POLICY IF EXISTS "Participants view session history" ON public.session_history;
CREATE POLICY "Participants view session history" ON public.session_history
  FOR SELECT USING (public.is_room_member(room_id));
