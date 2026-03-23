-- Migration 006: add issue_key_prefix to jira_connections
-- Allows users to configure a project prefix (e.g. "NMTZ-") so they can
-- type only the number part when adding Jira issues.

ALTER TABLE public.jira_connections
  ADD COLUMN IF NOT EXISTS issue_key_prefix TEXT;
