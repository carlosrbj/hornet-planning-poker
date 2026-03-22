const BASE = (cloudId: string) =>
  `https://api.atlassian.com/ex/jira/${cloudId}/rest`

async function jiraFetch<T>(
  cloudId: string,
  token: string,
  path: string
): Promise<T> {
  const res = await fetch(`${BASE(cloudId)}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Jira API ${res.status}: ${text}`)
  }

  return res.json() as Promise<T>
}

export interface JiraBoard {
  id: number
  name: string
  type: string
}

export interface JiraSprint {
  id: number
  name: string
  state: 'active' | 'future' | 'closed'
  startDate?: string
  endDate?: string
}

export interface JiraIssue {
  id: string
  key: string
  fields: {
    summary: string
    description?: unknown
    issuetype: { name: string; iconUrl: string }
    status: { name: string }
    priority?: { name: string } | null
    assignee?: { displayName: string; emailAddress?: string } | null
    reporter?: { displayName: string; emailAddress?: string } | null
    duedate?: string | null
    timespent?: number | null
    story_points?: number
    // Preenchidos por getSprintIssues após descoberta de campos customizados
    _developerName?: string | null
    _resolvedDeadline?: string | null
  }
}

export async function getBoards(cloudId: string, token: string): Promise<JiraBoard[]> {
  const data = await jiraFetch<{ values: JiraBoard[] }>(
    cloudId,
    token,
    '/agile/1.0/board?maxResults=50'
  )
  return data.values
}

export async function getSprints(
  cloudId: string,
  token: string,
  boardId: number
): Promise<JiraSprint[]> {
  const data = await jiraFetch<{ values: JiraSprint[] }>(
    cloudId,
    token,
    `/agile/1.0/board/${boardId}/sprint?state=active,future&maxResults=20`
  )
  return data.values
}

export async function getSprintIssues(
  cloudId: string,
  token: string,
  sprintId: number
): Promise<JiraIssue[]> {
  // expand=names retorna mapa fieldId → label para descobrir campos customizados
  const data = await jiraFetch<{ issues: Array<JiraIssue & { fields: Record<string, unknown> }>; names?: Record<string, string> }>(
    cloudId,
    token,
    `/agile/1.0/sprint/${sprintId}/issue?maxResults=100&expand=names&fields=*all`
  )

  // Descobre os IDs dos campos "Desenvolvedor" e "Prazo de Entrega" a partir dos nomes
  const names = data.names ?? {}
  let devFieldId: string | null = null
  let deadlineFieldId: string | null = null
  for (const [fieldId, fieldName] of Object.entries(names)) {
    const lc = fieldName.toLowerCase()
    if (lc === 'desenvolvedor') devFieldId = fieldId
    if (lc === 'prazo de entrega' || lc === 'prazo' || lc === 'data de entrega') deadlineFieldId = fieldId
  }

  return data.issues.map((issue) => {
    let developerName = issue.fields.assignee?.displayName ?? null
    let resolvedDeadline = issue.fields.duedate ?? null

    if (devFieldId && issue.fields[devFieldId]) {
      const v = issue.fields[devFieldId] as { displayName?: string } | string
      developerName = typeof v === 'string' ? v : (v.displayName ?? developerName)
    }
    if (deadlineFieldId && issue.fields[deadlineFieldId]) {
      const v = issue.fields[deadlineFieldId]
      if (typeof v === 'string') resolvedDeadline = v
    }

    return {
      ...issue,
      fields: {
        ...issue.fields,
        _developerName: developerName,
        _resolvedDeadline: resolvedDeadline,
      },
    }
  })
}

export async function updateIssueEstimate(
  cloudId: string,
  token: string,
  issueId: string,
  hours: number
): Promise<void> {
  const seconds = Math.round(hours * 3600)
  const res = await fetch(
    `${BASE(cloudId)}/api/3/issue/${issueId}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        update: {
          timetracking: [
            { edit: { originalEstimate: `${hours}h` } },
          ],
        },
      }),
    }
  )

  if (!res.ok && res.status !== 204) {
    const text = await res.text()
    throw new Error(`Jira update ${res.status}: ${text}`)
  }
}
