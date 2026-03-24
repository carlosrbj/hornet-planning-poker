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
import type { RoomLastSession } from '@/components/dashboard/RoomCard'

type Room = Database['public']['Tables']['rooms']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

interface DashboardClientProps {
  userId: string
  profile: Profile | null
  ownRooms: Room[]
  joinedRooms: Room[]
  roomLastSession: Record<string, RoomLastSession>
}

export default function DashboardClient({ userId, profile, ownRooms: initialOwnRooms, joinedRooms, roomLastSession }: DashboardClientProps) {
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
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f7fb] font-sans selection:bg-[#ffd60a]/20 selection:text-[#ffd60a] relative overflow-x-hidden">
      {/* Background Mask */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{
          backgroundSize: '40px 40px',
          backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)'
        }}
      />
      {/* Radial Glows */}
      <div 
        className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(255,214,10,0.08), transparent 70%)' }}
      />
      <div 
        className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[100px] pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.03), transparent 70%)' }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar
          userDisplayName={profile?.display_name}
          userAvatarUrl={profile?.avatar_url}
        />

        <main className="flex-1 w-full max-w-[1180px] mx-auto px-4 md:px-6 pt-[42px] pb-[64px]">
          {/* Hero */}
          <section className="grid grid-cols-1 xl:grid-cols-[1.1fr_auto] gap-6 items-end mb-[28px]">
            <motion.div variants={fadeSlideUp} initial="hidden" animate="visible">
              <h1 className="text-[clamp(2.2rem,4vw,3.4rem)] leading-[0.98] tracking-[-0.05em] mb-2.5 font-bold">
                Olá, {profile?.display_name || 'Usuário'}
              </h1>
              <p className="text-[#9aa0aa] text-[1rem] leading-[1.7] max-w-[60ch]">
                Aqui você pode criar novas sessões, acessar salas recentes ou iniciar novos rituais de poker de forma ágil e descomplicada.
              </p>
            </motion.div>
          </section>

          {/* Stats */}
          <motion.section 
            variants={staggerContainer} initial="hidden" animate="visible"
            className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-[22px] max-w-[720px] mb-10"
          >
            <motion.div variants={fadeSlideUp} className="rounded-[14px] p-[16px_18px] border border-white/5 bg-white/[0.03]">
              <strong className="block text-[#ffd60a] text-[1.25rem] mb-1.5 font-bold">{ownRooms.length + joinedRooms.length}</strong>
              <span className="text-[#9aa0aa] text-[0.92rem]">Salas ativas</span>
            </motion.div>
            <motion.div variants={fadeSlideUp} className="rounded-[14px] p-[16px_18px] border border-white/5 bg-white/[0.03]">
              <strong className="block text-[#ffd60a] text-[1.25rem] mb-1.5 font-bold">{joinedRooms.length}</strong>
              <span className="text-[#9aa0aa] text-[0.92rem]">Participações</span>
            </motion.div>
            <motion.div variants={fadeSlideUp} className="rounded-[14px] p-[16px_18px] border border-white/5 bg-white/[0.03]">
              <strong className="block text-[#ffd60a] text-[1.25rem] mb-1.5 font-bold">{ownRooms.length}</strong>
              <span className="text-[#9aa0aa] text-[0.92rem]">Salas criadas</span>
            </motion.div>
          </motion.section>

          {/* Join Card */}
          <motion.section 
            variants={fadeSlideUp} initial="hidden" animate="visible"
            className="mb-[34px] rounded-[28px] border border-[#ffd60a]/10 p-6 relative overflow-hidden backdrop-blur-xl shadow-[0_24px_60px_rgba(0,0,0,0.45)]"
            style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03)), rgba(10,10,10,0.9)' }}
          >
            <div 
              className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full pointer-events-none opacity-50 blur-[80px]"
              style={{ background: 'radial-gradient(circle, rgba(255,214,10,0.15), transparent 70%)' }}
            />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-[18px]">
              <div>
                <span className="inline-block py-1 px-2.5 rounded-full border border-white/10 bg-white/5 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-[#9aa0aa] mb-3">
                  Acesso rápido
                </span>
                <h2 className="text-[1.5rem] tracking-[-0.03em] font-semibold mb-1">Entrar em uma sala</h2>
                <p className="text-[#9aa0aa] text-[0.95rem]">Cole o código de convite ou link abaixo</p>
              </div>
            </div>
            <div className="relative z-10 w-full max-w-[500px]">
              <JoinRoomInput />
            </div>
          </motion.section>

          {/* Salas criadas */}
          {ownRooms.length > 0 ? (
            <section className="mb-[34px]">
              <div className="flex items-center justify-between mb-[20px]">
                <h2 className="text-[1.2rem] tracking-[-0.03em] font-semibold text-[#f5f7fb]">Minhas salas recentes</h2>
              </div>
              <motion.div
                variants={staggerContainer} initial="hidden" animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[18px]"
              >
                {ownRooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    lastSession={roomLastSession[room.id]}
                    onDelete={() => handleDeleteRoom(room.id)}
                  />
                ))}
              </motion.div>
            </section>
          ) : (
            <motion.div
              variants={fadeSlideUp} initial="hidden" animate="visible"
              className="text-center py-16 text-[#9aa0aa]"
            >
              <div className="text-5xl mb-4">🃏</div>
              <p className="text-lg font-medium text-[#f5f7fb]">Nenhuma sala criada ainda</p>
              <p className="text-sm mt-1">Crie uma sala usando o botão flutuante</p>
            </motion.div>
          )}

          {/* Salas que participa */}
          {joinedRooms.length > 0 && (
            <section className="mb-[34px]">
              <div className="flex items-center justify-between mb-[20px]">
                <h2 className="text-[1.2rem] tracking-[-0.03em] font-semibold text-[#f5f7fb]">Você é participante</h2>
              </div>
              <motion.div
                variants={staggerContainer} initial="hidden" animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[18px]"
              >
                {joinedRooms.map((room) => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </motion.div>
            </section>
          )}
        </main>
      </div>

      <CreateRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={userId}
      />

      {/* FAB - Nova Sala */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-[30px] right-[30px] w-[64px] h-[64px] rounded-full flex items-center justify-center text-[2.5rem] text-[#111] shadow-[0_16px_32px_rgba(255,214,10,0.25)] transition-all duration-[0.25s] ease-out hover:-translate-y-[4px] hover:scale-[1.05] z-50 group before:absolute before:inset-0 before:w-full before:h-full before:rounded-full before:opacity-0 before:transition-opacity before:duration-[0.25s] hover:before:opacity-100 pb-1.5 font-light"
        style={{
          background: 'linear-gradient(135deg, #ffd60a, #ffc300)'
        }}
      >
        <style dangerouslySetInnerHTML={{__html: `
          .group::before { box-shadow: 0 0 40px rgba(255,214,10,0.6); }
        `}} />
        +
      </button>
    </div>
  )
}
