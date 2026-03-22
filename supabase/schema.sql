-- ============================================================
-- PLANNING POKER HORNET — Schema completo
-- Execute este arquivo uma única vez no SQL Editor do Supabase
-- Consolida: 001_initial_schema + 002_room_sharing_rls + 003_issue_sprint_fields
-- ============================================================


-- ========================================
-- PROFILES (extends Supabase auth.users)
-- ========================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);


-- ========================================
-- JIRA CONNECTIONS
-- ========================================
CREATE TABLE public.jira_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cloud_id TEXT NOT NULL,
  site_name TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, cloud_id)
);


-- ========================================
-- ROOMS
-- ========================================
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  deck_type TEXT NOT NULL DEFAULT 'hours',
  custom_deck JSONB,
  settings JSONB DEFAULT '{
    "timer_seconds": 120,
    "auto_reveal": false,
    "allow_spectators": true,
    "show_average": true,
    "coffee_break_enabled": true
  }'::jsonb,
  status TEXT DEFAULT 'waiting',
  jira_sprint_id TEXT,
  jira_board_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);


-- ========================================
-- ROOM PARTICIPANTS
-- ========================================
CREATE TABLE public.room_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'voter',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(room_id, user_id)
);


-- ========================================
-- ISSUES
-- (inclui campos de sprint da migration 003)
-- ========================================
CREATE TABLE public.issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  jira_issue_key TEXT,
  jira_issue_id TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending',
  final_estimate NUMERIC,
  estimate_unit TEXT DEFAULT 'hours',
  round_count INTEGER DEFAULT 0,

  -- Campos de sprint (migration 003)
  jira_status    TEXT,        -- Status no Jira (Análise Técnica, Em desenvolvimento, etc.)
  issue_type     TEXT,        -- Bug, Melhoria, Task, Story
  classification TEXT,        -- Interna, Externa, Legislação, Cliente/externo
  criticality    TEXT,        -- Prioridade Jira (Blocker, Critical, Major, Minor)
  assignee_name  TEXT,        -- Desenvolvedor (assignee no Jira)
  reporter_name  TEXT,        -- Analista (reporter no Jira)
  deadline       DATE,        -- Prazo (duedate no Jira)
  spent_hours    NUMERIC,     -- Horas gastas (timespent do Jira em horas)
  impedimento    TEXT,        -- Descrição do impedimento/bloqueio

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);


-- ========================================
-- VOTES
-- ========================================
CREATE TABLE public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  value NUMERIC,
  round INTEGER NOT NULL DEFAULT 1,
  voted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(issue_id, user_id, round)
);


-- ========================================
-- SESSION HISTORY
-- ========================================
CREATE TABLE public.session_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id),
  completed_at TIMESTAMPTZ DEFAULT now(),
  total_issues INTEGER,
  total_estimated INTEGER,
  average_rounds NUMERIC,
  total_hours_estimated NUMERIC,
  summary JSONB
);


-- ========================================
-- ROW LEVEL SECURITY
-- ========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jira_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_history ENABLE ROW LEVEL SECURITY;

-- Profiles
-- (migration 002: qualquer autenticado pode ver perfis — necessário para exibir nomes na sala)
CREATE POLICY "Authenticated users view profiles" ON public.profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Rooms
-- (migration 002: qualquer autenticado pode ver salas — necessário para acessar via link de convite)
CREATE POLICY "Authenticated users can view rooms" ON public.rooms
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Creator manages room" ON public.rooms
  FOR ALL USING (created_by = auth.uid());

-- Room participants
CREATE POLICY "Participants view room members" ON public.room_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.room_participants rp
      WHERE rp.room_id = room_participants.room_id AND rp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users join rooms" ON public.room_participants
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Issues
CREATE POLICY "Participants view issues" ON public.issues
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.room_participants
      WHERE room_id = issues.room_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Facilitator manages issues" ON public.issues
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.room_participants
      WHERE room_id = issues.room_id AND user_id = auth.uid() AND role = 'facilitator'
    )
  );

-- Votes: anônimos até o reveal
CREATE POLICY "Own votes always visible" ON public.votes
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "All votes visible after reveal" ON public.votes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.issues
      WHERE issues.id = votes.issue_id AND issues.status = 'revealed'
    )
  );

CREATE POLICY "Users cast own votes" ON public.votes
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Jira
CREATE POLICY "Own jira connections" ON public.jira_connections
  FOR ALL USING (user_id = auth.uid());

-- Session history
CREATE POLICY "Participants view session history" ON public.session_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.room_participants
      WHERE room_id = session_history.room_id AND user_id = auth.uid()
    )
  );


-- ========================================
-- INDEXES
-- ========================================
CREATE INDEX idx_room_participants_room ON public.room_participants(room_id);
CREATE INDEX idx_room_participants_user ON public.room_participants(user_id);
CREATE INDEX idx_issues_room ON public.issues(room_id);
CREATE INDEX idx_votes_issue ON public.votes(issue_id);
CREATE INDEX idx_rooms_slug ON public.rooms(slug);


-- ========================================
-- REALTIME
-- ========================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.issues;
ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_participants;


-- ========================================
-- TRIGGER: auto-criar profile após signup
-- ========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
