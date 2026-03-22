import { create } from 'zustand'
import type { Database } from '@/lib/types/database'

type Room = Database['public']['Tables']['rooms']['Row']
type Issue = Database['public']['Tables']['issues']['Row']
type Vote = Database['public']['Tables']['votes']['Row']

export interface OnlineUser {
  user_id: string
  display_name: string
  avatar_url: string | null
  role: 'facilitator' | 'voter' | 'spectator'
  hasVoted: boolean
}

interface RoomState {
  room: Room | null
  issues: Issue[]
  currentIssueId: string | null
  votes: Vote[]
  onlineUsers: OnlineUser[]
  selectedCard: number | string | null

  setRoom: (room: Room) => void
  setIssues: (issues: Issue[]) => void
  setCurrentIssueId: (id: string | null) => void
  setVotes: (votes: Vote[]) => void
  setOnlineUsers: (users: OnlineUser[]) => void
  setSelectedCard: (value: number | string | null) => void
  updateIssue: (id: string, updates: Partial<Issue>) => void
  addIssue: (issue: Issue) => void
  removeIssue: (id: string) => void
  addVote: (vote: Vote) => void
}

export const useRoomStore = create<RoomState>((set) => ({
  room: null,
  issues: [],
  currentIssueId: null,
  votes: [],
  onlineUsers: [],
  selectedCard: null,

  setRoom: (room) => set({ room }),
  setIssues: (issues) => set({ issues }),
  setCurrentIssueId: (id) => set({ currentIssueId: id }),
  setVotes: (votes) => set({ votes }),
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  setSelectedCard: (value) => set({ selectedCard: value }),
  updateIssue: (id, updates) =>
    set((state) => ({
      issues: state.issues.map((issue) =>
        issue.id === id ? { ...issue, ...updates } : issue
      ),
    })),
  addIssue: (issue) =>
    set((state) => ({
      // Avoid duplicates and keep sorted by position
      issues: state.issues.some((i) => i.id === issue.id)
        ? state.issues
        : [...state.issues, issue].sort((a, b) => a.position - b.position),
    })),
  removeIssue: (id) =>
    set((state) => ({ issues: state.issues.filter((i) => i.id !== id) })),
  addVote: (vote) =>
    set((state) => ({
      votes: [
        ...state.votes.filter(
          (v) => !(v.issue_id === vote.issue_id && v.user_id === vote.user_id && v.round === vote.round)
        ),
        vote,
      ],
    })),
}))
