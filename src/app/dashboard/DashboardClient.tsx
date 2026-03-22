'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Navbar from '@/components/layout/Navbar'
import RoomCard from '@/components/dashboard/RoomCard'
import CreateRoomModal from '@/components/dashboard/CreateRoomModal'
import JoinRoomInput from '@/components/dashboard/JoinRoomInput'
import { staggerContainer, fadeSlideUp } from '@/lib/utils/animations'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database'

type Room = Database['public']['Tables']['rooms']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

interface DashboardClientProps {
  userId: string
  profile: Profile | null
  ownRooms: Room[]
  joinedRooms: Room[]
}

export default function DashboardClient({ userId, profile, ownRooms: initialOwnRooms, joinedRooms }: DashboardClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [ownRooms, setOwnRooms] = useState<Room[]>(initialOwnRooms)

  const hasAnything = ownRooms.length > 0 || joinedRooms.length > 0

  async function handleDeleteRoom(roomId: string) {
    const supabase = createClient()
    const { error } = await supabase.from('rooms').delete().eq('id', roomId)
    if (!error) {
      setOwnRooms((prev) => prev.filter((r) => r.id !== roomId))
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        userDisplayName={profile?.display_name}
        userAvatarUrl={profile?.avatar_url}
      />

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Minhas Salas</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {!hasAnything
                ? 'Crie ou entre em uma sala para começar'
                : `${ownRooms.length} criada${ownRooms.length !== 1 ? 's' : ''}${joinedRooms.length > 0 ? ` · ${joinedRooms.length} como participante` : ''}`}
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors"
          >
            <span>+</span>
            Nova Sala
          </button>
        </div>

        {/* Join by link */}
        <section className="bg-card border border-border rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Entrar em uma sala</span>
            <span className="text-xs text-muted-foreground">via link ou código de convite</span>
          </div>
          <JoinRoomInput />
        </section>

        {/* Salas criadas */}
        {ownRooms.length > 0 ? (
          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Criadas por mim
            </h2>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {ownRooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onDelete={() => handleDeleteRoom(room.id)}
                />
              ))}
            </motion.div>
          </section>
        ) : (
          <motion.div
            variants={fadeSlideUp}
            initial="hidden"
            animate="visible"
            className="text-center py-16 text-muted-foreground"
          >
            <div className="text-5xl mb-4">🃏</div>
            <p className="text-lg font-medium">Nenhuma sala ainda</p>
            <p className="text-sm mt-1">Crie uma sala ou entre via link de convite</p>
          </motion.div>
        )}

        {/* Salas que participa */}
        {joinedRooms.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Participando
            </h2>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {joinedRooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </motion.div>
          </section>
        )}
      </main>

      <CreateRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={userId}
      />
    </div>
  )
}
