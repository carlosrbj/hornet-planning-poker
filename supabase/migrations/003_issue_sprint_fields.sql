-- Etapa 1: Campos de sprint para rastreamento de demandas (equivalente à planilha gerencial)
ALTER TABLE issues
  ADD COLUMN IF NOT EXISTS jira_status    text,        -- Status no Jira (Análise Técnica, Em desenvolvimento, etc.)
  ADD COLUMN IF NOT EXISTS issue_type     text,        -- Bug, Melhoria, Task, Story
  ADD COLUMN IF NOT EXISTS classification text,        -- Interna, Externa, Legislação, Cliente/externo
  ADD COLUMN IF NOT EXISTS criticality    text,        -- Prioridade Jira (Blocker, Critical, Major, Minor)
  ADD COLUMN IF NOT EXISTS assignee_name  text,        -- Desenvolvedor (assignee no Jira)
  ADD COLUMN IF NOT EXISTS reporter_name  text,        -- Analista (reporter no Jira)
  ADD COLUMN IF NOT EXISTS deadline       date,        -- Prazo (duedate no Jira)
  ADD COLUMN IF NOT EXISTS spent_hours    numeric,     -- Horas gastas (timespent do Jira em horas)
  ADD COLUMN IF NOT EXISTS impedimento    text;        -- Descrição do impedimento/bloqueio
