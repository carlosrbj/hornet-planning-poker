-- Allow any authenticated user to read rooms.
-- This is required so a user following an invite link can load the room
-- before being inserted into room_participants.
-- Rooms use random slugs ("adjective-noun-number") so security-by-obscurity applies.

DROP POLICY IF EXISTS "Participants view rooms" ON public.rooms;

CREATE POLICY "Authenticated users can view rooms" ON public.rooms
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Also allow participants to see other participants' profiles
-- (needed for displaying names in room UI beyond realtime Presence).
DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;

CREATE POLICY "Authenticated users view profiles" ON public.profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);
