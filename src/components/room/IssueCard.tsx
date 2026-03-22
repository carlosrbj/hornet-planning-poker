'use client'

import { motion } from 'framer-motion'
import { fadeSlideUp } from '@/lib/utils/animations'
import type { Database } from '@/lib/types/database'

type Issue = Database['public']['Tables']['issues']['Row']

export interface IssueCardProps {
  issue: Issue
  issueNumber: number
  totalIssues: number
  jiraSiteName?: string | null
}

const ISSUE_TYPE_COLOR: Record<string, string> = {
  Bug: 'bg-red-500/15 text-red-500 border-red-500/30',
  Melhoria: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  Story: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  Task: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  Epic: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
}

const CRITICALITY_COLOR: Record<string, string> = {
  Blocker: 'text-red-500',
  Critical: 'text-orange-500',
  Major: 'text-yellow-500',
  Minor: 'text-muted-foreground',
  Trivial: 'text-muted-foreground',
}

export default function IssueCard({ issue, issueNumber, totalIssues, jiraSiteName }: IssueCardProps) {
  const jiraUrl =
    issue.jira_issue_key && jiraSiteName
      ? `https://${jiraSiteName}.atlassian.net/browse/${issue.jira_issue_key}`
      : null

  const typeColor = issue.issue_type ? (ISSUE_TYPE_COLOR[issue.issue_type] ?? 'bg-muted text-muted-foreground border-border') : null
  const criticalityColor = issue.criticality ? (CRITICALITY_COLOR[issue.criticality] ?? 'text-muted-foreground') : null

  return (
    <motion.div
      key={issue.id}
      variants={fadeSlideUp}
      initial="hidden"
      animate="visible"
      className="bg-card border border-border rounded-2xl p-4 sm:p-6 w-full max-w-xl"
    >
      {/* Header: contador + chave Jira + botão abrir */}
      <div className="flex items-start justify-between mb-3 gap-3">
        <span className="text-xs text-muted-foreground font-medium shrink-0">
          Issue {issueNumber} de {totalIssues}
        </span>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {issue.jira_issue_key && (
            <span className="text-xs bg-muted px-2 py-0.5 rounded font-mono text-muted-foreground">
              {issue.jira_issue_key}
            </span>
          )}
          {jiraUrl && (
            <a
              href={jiraUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Abrir no Jira"
              className="text-xs bg-primary/10 hover:bg-primary/20 text-primary px-2 py-0.5 rounded transition-colors flex items-center gap-1"
            >
              ↗ Jira
            </a>
          )}
        </div>
      </div>

      {/* Título */}
      <h2 className="text-base sm:text-xl font-bold text-foreground leading-snug">{issue.title}</h2>

      {/* Descrição */}
      {issue.description && (
        <p className="text-muted-foreground text-sm mt-3 leading-relaxed line-clamp-4">
          {issue.description}
        </p>
      )}

      {/* Badges: tipo + criticidade */}
      {(issue.issue_type || issue.criticality || issue.jira_status) && (
        <div className="flex flex-wrap gap-2 mt-4">
          {issue.issue_type && typeColor && (
            <span className={`text-xs px-2 py-0.5 rounded border font-medium ${typeColor}`}>
              {issue.issue_type}
            </span>
          )}
          {issue.criticality && (
            <span className={`text-xs font-medium ${criticalityColor}`}>
              ⚡ {issue.criticality}
            </span>
          )}
          {issue.jira_status && (
            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded border border-border">
              {issue.jira_status}
            </span>
          )}
        </div>
      )}

      {/* Metadados: analista, dev, classificação, prazo */}
      {(issue.reporter_name || issue.assignee_name || issue.classification || issue.deadline) && (
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs border-t border-border/50 pt-3">
          {issue.reporter_name && (
            <div>
              <span className="text-muted-foreground">Analista</span>
              <p className="text-foreground font-medium truncate">{issue.reporter_name}</p>
            </div>
          )}
          {issue.assignee_name && (
            <div>
              <span className="text-muted-foreground">Desenvolvedor</span>
              <p className="text-foreground font-medium truncate">{issue.assignee_name}</p>
            </div>
          )}
          {issue.classification && (
            <div>
              <span className="text-muted-foreground">Classificação</span>
              <p className="text-foreground font-medium truncate">{issue.classification}</p>
            </div>
          )}
          {issue.deadline && (
            <div>
              <span className="text-muted-foreground">Prazo</span>
              <p className="text-foreground font-medium">
                {new Date(issue.deadline).toLocaleDateString('pt-BR')}
              </p>
            </div>
          )}
        </div>
      )}

      {issue.round_count > 1 && (
        <p className="text-xs text-primary mt-4">
          🔄 Round {issue.round_count}
        </p>
      )}
    </motion.div>
  )
}
