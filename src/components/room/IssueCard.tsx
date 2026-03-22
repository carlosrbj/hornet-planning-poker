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
  Bug: 'text-[#ff4466] bg-[rgba(255,68,102,0.12)]',
  Melhoria: 'text-[#8ea0ff] bg-[rgba(95,121,255,0.12)]',
  Story: 'text-[#c084ff] bg-[rgba(170,54,255,0.12)]',
  Task: 'text-[#22d9f0] bg-[rgba(25,199,217,0.12)]',
  Epic: 'text-[#fb923c] bg-[rgba(251,146,60,0.12)]',
}

export default function IssueCard({ issue, issueNumber, totalIssues, jiraSiteName }: IssueCardProps) {
  const jiraUrl =
    issue.jira_issue_key && jiraSiteName
      ? `https://${jiraSiteName}.atlassian.net/browse/${issue.jira_issue_key}`
      : null

  const typeColor = issue.issue_type ? (ISSUE_TYPE_COLOR[issue.issue_type] ?? 'text-[#b4bcc8] bg-white/[0.07]') : null

  return (
    <motion.div
      key={issue.id}
      variants={fadeSlideUp}
      initial="hidden"
      animate="visible"
      className="rounded-[24px] border border-white/[0.06] p-6 w-full max-w-xl flex flex-col min-h-[280px] sm:min-h-[330px]"
      style={{
        background: 'radial-gradient(circle at top right, rgba(255,214,10,0.08), transparent 30%), linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03)), #0d1020',
        boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
      }}
    >
      {/* Header: contador + chave Jira + botão abrir */}
      <div className="flex items-center justify-between mb-3 gap-3">
        <span className="text-sm text-[var(--muted)]">
          Issue {issueNumber} de {totalIssues}
        </span>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {issue.jira_issue_key && (
            <span className="inline-flex items-center min-h-[26px] rounded-[10px] px-[9px] text-[0.78rem] font-extrabold text-[#8ea0ff] bg-[rgba(95,121,255,0.12)]">
              {issue.jira_issue_key}
            </span>
          )}
          {jiraUrl && (
            <a
              href={jiraUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Abrir no Jira"
              className="inline-flex items-center min-h-[26px] rounded-[10px] px-[9px] text-[0.78rem] font-extrabold text-[var(--accent)] bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 transition-colors gap-1"
            >
              ↗ Jira
            </a>
          )}
        </div>
      </div>

      {/* Título */}
      <h2 className="text-2xl sm:text-[clamp(1.4rem,2.2vw,2rem)] font-bold leading-[1.18] tracking-[-0.05em] max-w-[26ch] mb-4">
        {issue.title}
      </h2>

      {/* Chips: tipo + criticidade + status Jira */}
      {(issue.issue_type || issue.criticality || issue.jira_status) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {issue.issue_type && typeColor && (
            <span className={`rounded-[10px] px-[10px] py-2 text-[0.8rem] font-bold border border-white/5 ${typeColor}`}>
              {issue.issue_type}
            </span>
          )}
          {issue.criticality && (
            <span className="rounded-[10px] px-[10px] py-2 text-[0.8rem] font-bold border border-white/5 text-[var(--accent)] bg-[var(--accent)]/10">
              ⚡ {issue.criticality}
            </span>
          )}
          {issue.jira_status && (
            <span className="rounded-[10px] px-[10px] py-2 text-[0.8rem] font-bold border border-white/5 text-[#b4bcc8] bg-white/[0.07]">
              {issue.jira_status}
            </span>
          )}
        </div>
      )}

      {/* Descrição */}
      {issue.description && (
        <p className="text-[var(--muted)] text-sm leading-[1.75] max-w-[60ch] mb-4 line-clamp-4">
          {issue.description}
        </p>
      )}

      <div className="flex-1" />

      {/* Metadados: analista, dev, prazo */}
      {(issue.reporter_name || issue.assignee_name || issue.classification || issue.deadline) && (
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/[0.06]">
          {issue.reporter_name && (
            <div>
              <span className="block text-[var(--muted)] text-[0.82rem] mb-1.5">Analista</span>
              <strong className="text-[0.94rem] leading-snug block truncate">{issue.reporter_name}</strong>
            </div>
          )}
          {issue.assignee_name && (
            <div>
              <span className="block text-[var(--muted)] text-[0.82rem] mb-1.5">Desenvolvedor</span>
              <strong className="text-[0.94rem] leading-snug block truncate">{issue.assignee_name}</strong>
            </div>
          )}
          {issue.deadline && (
            <div>
              <span className="block text-[var(--muted)] text-[0.82rem] mb-1.5">Prazo</span>
              <strong className="text-[0.94rem]">
                {new Date(issue.deadline).toLocaleDateString('pt-BR')}
              </strong>
            </div>
          )}
          {!issue.deadline && issue.classification && (
            <div>
              <span className="block text-[var(--muted)] text-[0.82rem] mb-1.5">Classificação</span>
              <strong className="text-[0.94rem] block truncate">{issue.classification}</strong>
            </div>
          )}
        </div>
      )}

      {issue.round_count > 1 && (
        <p className="text-xs text-[var(--accent)] mt-3">
          🔄 Round {issue.round_count}
        </p>
      )}
    </motion.div>
  )
}
