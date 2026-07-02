'use client'

import React, { useState } from 'react'
import { Phone, Clock, IndianRupee, User, MessageCircle } from 'lucide-react'
import { IBooking, BookingStatus } from '@/app/modals/booking.modals'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import RiderChat from '@/componets/RiderChat'
import { AnimatePresence ,motion} from 'motion/react'

type StatusConfig = {
  label: string
  sublabel: string
  dot: string
}

type PaymentBadge = {
  label: string
  cls: string
}

type Props = {
  isActive: boolean
  canChat: boolean
  displayDistance: number
  displayEta: number
  cfg: StatusConfig
  status: string
  booking: IBooking | null
  paymentStatus?: PaymentBadge
  compact?: boolean
}

function formatEta(minutes: number) {
  if (!minutes || minutes <= 0) return '0 min'
  if (minutes < 60) return `${Math.round(minutes)} min`
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  return `${h}h ${m}m`
}

function formatDistance(meters: number) {
  if (!meters) return '0 m'
  if (meters < 1000) return `${Math.round(meters)} m`
  return `${(meters / 1000).toFixed(1)} km`
}

function PanelContent({ isActive, displayDistance, displayEta, cfg, status, booking, paymentStatus, compact, canChat }: Props) {
  const { userData } = useSelector((state: RootState) => state.user)
  const [chatOpen,setChatOpen] = useState(false)
  // derived during render — no effect needed, always in sync with latest booking/userData
  const currentRole = userData?._id === booking?.driver?._id ? "driver" : "user"

  const customerName = booking?.user?.name ?? 'Rider'
  const driverName = booking?.driver?.name ?? 'Driver'
  const fare = (booking as any)?.fare ?? (booking as any)?.price ?? 0
  const paymentMethod = booking?.paymentStatus ?? 'Pending'
  const badge = paymentStatus ?? { label: paymentMethod, cls: 'bg-zinc-100 text-zinc-700' }

  return (
    <div className={`flex flex-col ${compact ? 'gap-3' : 'gap-5'}`}>
      {/* header */}
      <div className={`flex items-start bg-black rounded-sm justify-between ${compact ? 'p-3' : 'p-4'}`}>
        <div>
          <p className="text-[11px] uppercase tracking-widest text-zinc-200 font-semibold">Driver Panel</p>
          <h2 className={`font-bold text-white mt-0.5 ${compact ? 'text-lg' : 'text-xl'}`}>Active Ride</h2>
        </div>
        <div className="flex items-center gap-1.5 bg-white text-black text-xs font-semibold px-3 py-1.5 rounded-full">
          <span className="text-amber-400">⚡</span>
          {formatEta(displayEta)}
        </div>
      </div>

      {/* status pill */}
      <div className={`flex items-center bg-zinc-100 rounded-sm gap-2 ${compact ? 'p-2.5' : 'p-3'}`}>
        <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
        <div>
          <p className="text-sm font-semibold text-zinc-800">{cfg.label}</p>
          {!compact && <p className="text-xs text-zinc-400">{cfg.sublabel}</p>}
        </div>
      </div>

      {/* ETA / FARE row */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`bg-zinc-200 rounded-2xl flex flex-col gap-1 ${compact ? 'px-3 py-2' : 'px-4 py-3'}`}>
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Clock size={14} />
            <span className="text-[11px] uppercase tracking-wide font-semibold">ETA</span>
          </div>
          <p className={`font-bold text-zinc-900 ${compact ? 'text-base' : 'text-lg'}`}>{formatEta(displayEta)}</p>
          {!compact && <p className="text-[11px] text-zinc-400">{formatDistance(displayDistance)} away</p>}
        </div>

        <div className={`bg-zinc-900 rounded-2xl flex flex-col gap-1 ${compact ? 'px-3 py-2' : 'px-4 py-3'}`}>
          <div className="flex items-center gap-1.5 text-zinc-400">
            <IndianRupee size={14} />
            <span className="text-[11px] uppercase tracking-wide font-semibold">Fare</span>
          </div>
          <p className={`font-bold text-white ${compact ? 'text-base' : 'text-lg'}`}>{fare}</p>
          {!compact && <p className="text-[11px] text-zinc-400 capitalize">{paymentMethod}</p>}
        </div>
      </div>

      {!compact && <div className="h-px bg-zinc-100" />}

      {/* customer card */}
      <div className={`flex items-center justify-between bg-black rounded-2xl ${compact ? 'px-3 py-2.5' : 'px-4 py-3'}`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className={`rounded-full bg-zinc-800 flex items-center justify-center text-white font-semibold ${compact ? 'h-8 w-8' : 'h-10 w-10 text-sm'}`}>
              <User size={compact ? 14 : 16} className='font-bold' />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{customerName}</p>
            <span className={`inline-block text-[11px] font-medium rounded-full px-2 py-0.5 mt-0.5 capitalize ${badge.cls}`}>
              {badge.label}
            </span>
          </div>
        </div>
        <p className="text-sm font-bold text-zinc-900 shrink-0">₹{fare}</p>
      </div>

      {/* action row — Call + RiderChat trigger (RiderChat owns its own open/close state) */}
      <div className="grid grid-cols-2 gap-3">
        {
            isActive &&(
                <a href={`tel:${booking?.userMobileNumber}`}
          className={`flex items-center justify-center gap-2 bg-zinc-800 text-white text-sm font-semibold rounded-xl hover:bg-zinc-800 transition-colors ${compact ? 'py-2' : 'py-2.5'}`}
        >
          <Phone size={16} />
          Call
        </a>
            )
        }


         { canChat && (
            <button
           onClick={() => setChatOpen(prev => !prev)}
            className={`flex-1 flex items-center justify-center gap-2 active:scale-[0.97] transition-all py-3 rounded-xl text-sm font-semibold ${chatOpen ? "bg-zinc-200 text-zinc-900" :"bg-zinc-900 hover:bg-zinc-800 text-white"}`}
            >
            <MessageCircle size={15} />
            {chatOpen ?"Close Chat" :"Message"}
            </button>
         )}
       
      </div>
      <AnimatePresence>
        {chatOpen && canChat &&(
           <motion.div
            key="chat"
            initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}}
            exit={{opacity:0,height:0}} transition={{duration:0.3,ease:[0.22,1,0.36,1]}}
            className='mx-5 lg:mx-6 overflow-hidden'
           >
               <div className='rounded-2xl overflow-hidden border border-zinc-100 h-[460px]'>
                <RiderChat
                currentRole={currentRole}
                userName={customerName}
                driverName={booking?.driver?.name || "Driver"}
                bookingId={booking?._id}
                />
               </div>
           </motion.div>
        ) }
      </AnimatePresence>
    </div>
  )
}

export default PanelContent