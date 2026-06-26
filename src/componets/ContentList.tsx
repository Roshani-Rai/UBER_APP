"use client"
import React, { useState ,useEffect} from 'react'
import { motion } from "motion/react"
import { CheckCircle2, Clock, FileText, Truck, Video, Users, XCircle, ArrowRight } from 'lucide-react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useDispatch,useSelector } from 'react-redux'
import { setUserData } from '@/redux/userSlice';
import { RootState } from '@/redux/store';



const TYPE_CONFIG = {
  partner: {
    emptyIcon: <Users size={36} strokeWidth={1.5} />,
    emptyTitle: "No pending partner reviews",
    emptyDesc: "All partner applications have been reviewed. Check back later.",
    accentColor: "#7c3aed",
    accentBg: "#faf5ff",
    accentBorder: "#e9d5ff",
  },
  kyc: {
    emptyIcon: <Video size={36} strokeWidth={1.5} />,
    emptyTitle: "No pending KYC reviews",
    emptyDesc: "All video KYC submissions have been processed.",
    accentColor: "#1d4ed8",
    accentBg: "#eff6ff",
    accentBorder: "#bfdbfe",
  },
  vehicle: {
    emptyIcon: <Truck size={36} strokeWidth={1.5} />,
    emptyTitle: "No pending vehicle reviews",
    emptyDesc: "All vehicle submissions are up to date.",
    accentColor: "#d97706",
    accentBg: "#fffbeb",
    accentBorder: "#fde68a",
  },
}

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase()
  if (s === 'approved') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700">
        <CheckCircle2 size={11} /> Approved
      </span>
    )
  }
  if (s === 'rejected') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-700">
        <XCircle size={11} /> Rejected
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
      <Clock size={11} /> Pending
    </span>
  )
}

function Avatar({ name }: { name: string }) {
  const initials =
    name
      ?.split(' ')
      .map((w: string) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?'
  return (
    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-gray-600">
      {initials}
    </div>
  )
}

function PartnerCard({
  item,
  index,
  onRefresh,
}: {
  item: any
  index: number
  onRefresh?: () => void
}) {
  const router = useRouter()
  const [loading, setLoading] = React.useState<'approve' | 'reject' | null>(null)

  const handleAction = async (action: 'approve' | 'reject') => {
    setLoading(action)
    try {
      await axios.post(`/api/auth/admin/partner/${action}`, { id: item._id ?? item.id })
      onRefresh?.()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(null)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.05, ease: 'easeOut' }}
      className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-purple-200 hover:shadow-md transition-all duration-200"
    >
      <Avatar name={item.name ?? item.fullName ?? 'Partner'} />

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-0.5">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {item.name ?? item.fullName ?? 'Unnamed Partner'}
          </p>
          <StatusBadge status={item.status ?? 'pending'} />
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
          {item.email && <span>{item.email}</span>}
          {item.phone && <span>{item.phone}</span>}
          {item.city && <span>{item.city}</span>}
          {item.createdAt && (
            <span>
              {new Date(item.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
       <motion.div
       whileTap={{scale:0.96}}
       onClick={()=>{
       router.push(`/admin/reviews/partner/${item._id}`)
        
       }}
       className='cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-sm font-semibold transition-colors'
       >
        Review <ArrowRight size={15} />
       </motion.div>
      </div>
    </motion.div>
  )
}

function KycCard({ item, index }: { item: any; index: number }) {
  const router = useRouter()
  const dispatch = useDispatch()
 const { userData } = useSelector((state: RootState) => state.user)

  const handleStartKyc = async () => {
    try {
      const { data } = await axios.get(`/api/auth/admin/video-kyc/start/${item._id}`)
      dispatch(setUserData({...userData,videKycRoomId:data.roomId}))
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.05, ease: 'easeOut' }}
      className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-blue-200 hover:shadow-md transition-all duration-200"
    >
      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600">
        <Video size={18} strokeWidth={1.8} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-0.5">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {item.name ?? item.fullName ?? 'Unknown User'}
          </p>
          <StatusBadge status={item.kycStatus ?? 'pending'} />
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
          {item.email && <span>{item.email}</span>}
          {item.submittedAt && (
            <span>
              Submitted{' '}
              {new Date(item.submittedAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
              })}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
  {item.videoKycStatus === 'pending' ? (
    <motion.div
      whileTap={{ scale: 0.96 }}
      onClick={handleStartKyc}
      className='cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-sm font-semibold transition-colors'
    >
      Start Video KYC <ArrowRight size={15} />
    </motion.div>
  ) : item.videoKycStatus === 'in_progress' ? (
    <motion.div
      whileTap={{ scale: 0.96 }}
      onClick={() => router.push(`/video-kyc/${item.videoKycRoomId}`)}
      className='cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-sm font-semibold transition-colors'
    >
      Join Call <ArrowRight size={15} />
    </motion.div>
  ) : (
    <motion.div
      whileTap={{ scale: 0.96 }}
      className='cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-sm font-semibold transition-colors'
    >
      Review <ArrowRight size={15} />
    </motion.div>
  )}
</div>
       
    </motion.div>
  )
}

function VehicleCard({ item, index }: { item: any; index: number }) {
  const router = useRouter()
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.05, ease: 'easeOut' }}
      className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-amber-200 hover:shadow-md transition-all duration-200"
    >
      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0 text-amber-600">
        <Truck size={18} strokeWidth={1.8} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-0.5">
          <p className="text-sm font-semibold text-gray-900 truncate">
           {item.owner.name ?? item.fullName ?? 'Unnamed Partner'}
          </p>
          <StatusBadge status={item.status ?? 'pending'} />
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
           {item.owner.email && <span>{item.owner.email}</span>}
          {item.owner.phone && <span>{item.owner.phone}</span>}
          {item.owner.city && <span>{item.owner.city}</span>}
          {item.createdAt && (
            <span>
              {new Date(item.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <motion.div
       whileTap={{scale:0.96}}
      onClick={()=>router.push(`/admin/reviews/vehicle/${item._id}`)}
       className='cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-sm font-semibold transition-colors'
       >
        Review <ArrowRight size={15} />
       </motion.div>
      </div>
    </motion.div>
  )
}

function ContentList({
  data,
  type,
  onRefresh,
}: {
  data: any[]
  type: 'partner' | 'kyc' | 'vehicle'
  onRefresh?: () => void
}) {
  const cfg = TYPE_CONFIG[type]

  if (!data || data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="bg-white rounded-2xl py-20 text-center border border-dashed border-gray-200 shadow-sm"
      >
        <motion.div
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="flex flex-col items-center gap-3"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-1"
            style={{
              background: cfg.accentBg,
              color: cfg.accentColor,
              border: `1px solid ${cfg.accentBorder}`,
            }}
          >
            {cfg.emptyIcon}
          </div>
          <p className="text-base font-semibold text-gray-800">{cfg.emptyTitle}</p>
          <p className="text-sm text-gray-400 max-w-xs">{cfg.emptyDesc}</p>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <p className="text-sm font-medium text-gray-500">
          Showing{' '}
          <span className="text-gray-900 font-semibold">{data.length}</span>{' '}
          result{data.length !== 1 ? 's' : ''}
        </p>
      </div>
      <div className="space-y-3">
        {data.map((item, index) => {
          if (type === 'partner') {
            return (
              <PartnerCard
                key={item._id ?? item.id ?? index}
                item={item}
                index={index}
                onRefresh={onRefresh}
              />
            )
          }
          if (type === 'kyc') {
            return (
              <KycCard
                key={item._id ?? item.id ?? index}
                item={item}
                index={index}
              />
            )
          }
          if (type === 'vehicle') {
            return (
              <VehicleCard
                key={item._id ?? item.id ?? index}
                item={item}
                index={index}
              />
            )
          }
          return null
        })}
      </div>
    </div>
  )
}

export default ContentList