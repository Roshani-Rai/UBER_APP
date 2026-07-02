'use client'
import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'motion/react'
import {
  Car,
  Bike,
  Truck,
  MapPin,
  Navigation,
  Calendar,
  Phone,
  ChevronDown,
  ChevronRight,
  User as UserIcon,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

// ---- Types ----
type BookingStatus =
  | 'requested'
  | 'awaiting_payment'
  | 'confirmed'
  | 'started'
  | 'completed'
  | 'cancelled'
  | 'rejected'
  | 'expired'

interface IBooking {
  _id: string
  bookingStatus: BookingStatus
  paymentStatus: string
  fare: number
  pickUpAddress: string
  dropAddress: string
  userMobileNumber: string
  createdAt: string
  user?: { name?: string }
  vehicle?: {
    type?: string
    vehicleModel?: string
    number?: string
  }
}

const VEHICLE_ICONS: any = {
  bike: Bike,
  auto: Car,
  car: Car,
  truck: Truck,
  loading: Truck,
}

// ---- Status visual config ----
const STATUS_CONFIG: Record<BookingStatus, { label: string; dot: string; text: string; bg: string }> = {
  requested: { label: 'Requested', dot: 'bg-blue-500', text: 'text-blue-600', bg: 'bg-blue-50' },
  awaiting_payment: { label: 'Awaiting Payment', dot: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-50' },
  confirmed: { label: 'Confirmed', dot: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50' },
  started: { label: 'Started', dot: 'bg-violet-500', text: 'text-violet-600', bg: 'bg-violet-50' },
  completed: { label: 'Completed', dot: 'bg-teal-500', text: 'text-teal-600', bg: 'bg-teal-50' },
  cancelled: { label: 'Cancelled', dot: 'bg-rose-500', text: 'text-rose-600', bg: 'bg-rose-50' },
  rejected: { label: 'Rejected', dot: 'bg-red-500', text: 'text-red-600', bg: 'bg-red-50' },
  expired: { label: 'Expired', dot: 'bg-zinc-400', text: 'text-zinc-500', bg: 'bg-zinc-100' },
}

const FILTERS: { label: string; value: 'all' | BookingStatus }[] = [
  { label: 'All', value: 'all' },
  { label: 'Requested', value: 'requested' },
  { label: 'Awaiting Payment', value: 'awaiting_payment' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Started', value: 'started' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Expired', value: 'expired' },
]

function StatusBadge({ status }: { status: BookingStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.expired
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${cfg.bg} ${cfg.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

function PaymentPill({ paymentStatus }: { paymentStatus: string }) {
  const map: Record<string, { text: string; bg: string; label: string }> = {
    paid: { text: 'text-emerald-700', bg: 'bg-emerald-100', label: 'Paid' },
    pending: { text: 'text-amber-700', bg: 'bg-amber-100', label: 'Pending' },
    cash_pending: { text: 'text-amber-700', bg: 'bg-amber-100', label: 'Cash Pending' },
    failed: { text: 'text-red-700', bg: 'bg-red-100', label: 'Failed' },
  }
  const cfg = map[paymentStatus] ?? { text: 'text-zinc-600', bg: 'bg-zinc-100', label: paymentStatus || '—' }
  return (
    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  )
}

function BookingCard({ booking, index }: { booking: IBooking; index: number }) {
  const Icon = VEHICLE_ICONS[booking.vehicle?.type?.toLowerCase() || ''] || Car
  const dateStr = new Date(booking.createdAt).toLocaleString('en-IN', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

   const statusCfg = STATUS_CONFIG[booking.bookingStatus] ?? STATUS_CONFIG.expired
const router = useRouter()
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className='bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.06)]'
    >
      {/* Header row */}
      <div className={`flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-zinc-100 ${statusCfg.bg}`}>
        <div className='flex items-center gap-3 min-w-0'>
          <div className='w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-zinc-200 flex items-center justify-center flex-shrink-0'>
            <UserIcon size={18} className='text-zinc-600' />
          </div>
          <div className='min-w-0'>
            <p className='font-black text-zinc-900 text-sm sm:text-base leading-tight truncate'>
              {booking.user?.name || 'Unknown Rider'}
            </p>
            <div className='flex items-center gap-1 text-zinc-400 text-xs font-medium mt-0.5'>
              <Phone size={11} />
              <span className='truncate'>{booking.userMobileNumber || '—'}</span>
            </div>
          </div>
        </div>
        <div className='flex-shrink-0'>
          <StatusBadge status={booking.bookingStatus} />
        </div>
      </div>
      
         <div className='bg-black rounded-full width-full h-[1px]'/>
      {/* Vehicle */}
      <div className='px-4 sm:px-6 bg-zinc-50 py-3 flex items-center gap-2 text-xs sm:text-sm font-semibold text-zinc-500 border-b border-zinc-100'>
        <Icon size={15} className='text-zinc-400' />
        <span className='capitalize'>{booking.vehicle?.vehicleModel || booking.vehicle?.type || '—'}</span>
        <span className='text-zinc-300'>•</span>
        <span>{booking.vehicle?.number || '—'}</span>
      </div>

      {/* Route */}
      <div className='px-4 sm:px-6 py-4 flex flex-col gap-3 border-b border-zinc-100'>
        <div className='flex gap-3'>
          <div className='flex flex-col items-center pt-0.5 flex-shrink-0'>
            <MapPin size={14} className='text-emerald-500' />
          </div>
          <div className='min-w-0'>
            <p className='text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-0.5'>Pick Up</p>
            <p className='text-sm text-zinc-800 font-semibold leading-snug break-words'>{booking.pickUpAddress}</p>
          </div>
        </div>
        <div className='flex gap-3'>
          <div className='flex flex-col items-center pt-0.5 flex-shrink-0'>
            <Navigation size={14} className='text-rose-500' />
          </div>
          <div className='min-w-0'>
            <p className='text-[10px] font-bold uppercase tracking-widest text-rose-600 mb-0.5'>Drop</p>
            <p className='text-sm text-zinc-800 font-semibold leading-snug break-words'>{booking.dropAddress}</p>
          </div>
        </div>
      </div>

      {/* Date + Fare */}
      <div className='px-4 sm:px-6 bg-zinc-50 py-3 flex items-center justify-between border-b border-zinc-100'>
        <div className='flex items-center gap-1.5 text-zinc-400 text-xs sm:text-sm font-medium'>
          <Calendar size={13} />
          {dateStr}
        </div>
        <span className='text-lg sm:text-xl font-black text-zinc-900'>₹{booking.fare}</span>
      </div>

      {/* Footer */}
      <div className='px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3'>
        <div className='flex items-center gap-2 text-xs sm:text-sm font-semibold text-zinc-500'>
          Payment:
          <PaymentPill paymentStatus={booking.paymentStatus} />
        </div>
        <button
         onClick={()=>router.push('/partner/active-ride')}
        className='cursor-pointer rounded-full hover:scale:105 flex items-center gap-1 text-sm font-bold bg-blue-100 px-3 py-1 text-blue-600 hover:text-blue-700 transition-colors flex-shrink-0'>
          Details
          <ChevronRight size={15} />
        </button>
      </div>
    </motion.div>
  )
}

function BookingCardSkeleton() {
  return (
    <div className='bg-white rounded-3xl border border-zinc-200 overflow-hidden animate-pulse'>
      <div className='h-16 bg-zinc-100' />
      <div className='h-10 bg-zinc-50' />
      <div className='h-24 bg-zinc-50' />
      <div className='h-12 bg-zinc-50' />
      <div className='h-14 bg-zinc-50' />
    </div>
  )
}

function Page() {
  const [bookings, setBookings] = useState<IBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | BookingStatus>('all')
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true)
        const { data } = await axios.get('/api/auth/partner/bookings')
        setBookings(Array.isArray(data) ? data : [])
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }
    fetchBookings()
  }, [])

  const filteredBookings = useMemo(() => {
    if (filter === 'all') return bookings
    return bookings.filter((b) => b.bookingStatus === filter)
  }, [bookings, filter])

  const activeFilterLabel = FILTERS.find((f) => f.value === filter)?.label || 'All'

  return (
    <div className='min-h-screen bg-zinc-100 px-4 sm:px-6 py-8 sm:py-12'>
      <div className='max-w-3xl mx-auto'>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className='flex items-center gap-3 mb-8'
        >
          <div className='w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-zinc-900 flex items-center justify-center flex-shrink-0'>
            <Car size={22} className='text-white' />
          </div>
          <div>
            <h1 className='text-2xl sm:text-3xl font-black tracking-tight text-zinc-900'>Partner Bookings</h1>
            <p className='text-zinc-400 text-sm font-medium'>
              {bookings.length} ride{bookings.length !== 1 ? 's' : ''} assigned to you
            </p>
          </div>
        </motion.div>

        {/* Filter row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className='flex items-center justify-between gap-3 mb-5 relative'
        >
          <p className='text-sm font-semibold text-zinc-500'>
            Showing {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}
          </p>

          <div className='relative'>
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className='flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-zinc-200 text-sm font-bold text-zinc-800 hover:bg-zinc-50 transition-colors shadow-sm'
            >
              {activeFilterLabel}
              <ChevronDown size={15} className={`text-zinc-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <>
                  {/* backdrop to close on outside click */}
                  <div
                    className='fixed inset-0 z-10'
                    onClick={() => setDropdownOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className='absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-zinc-200 shadow-xl overflow-hidden z-20 max-h-80 overflow-y-auto'
                  >
                    {FILTERS.map((f) => (
                      <button
                        key={f.value}
                        onClick={() => {
                          setFilter(f.value)
                          setDropdownOpen(false)
                        }}
                        className={`w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm font-semibold transition-colors ${
                          filter === f.value ? 'bg-zinc-900 text-white' : 'text-zinc-700 hover:bg-zinc-50'
                        }`}
                      >
                        {f.value !== 'all' && (
                          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[f.value as BookingStatus].dot}`} />
                        )}
                        {f.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* List */}
        <div className='flex flex-col gap-4'>
          {loading ? (
            <>
              <BookingCardSkeleton />
              <BookingCardSkeleton />
            </>
          ) : filteredBookings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='bg-white rounded-3xl border border-zinc-200 py-16 px-6 flex flex-col items-center text-center gap-2'
            >
              <div className='w-14 h-14 rounded-full bg-zinc-100 flex items-center justify-center mb-2'>
                <Car size={22} className='text-zinc-400' />
              </div>
              <p className='font-black text-zinc-900'>No bookings found</p>
              <p className='text-zinc-400 text-sm max-w-xs'>
                {filter === 'all'
                  ? "You don't have any rides assigned yet."
                  : `No bookings with "${activeFilterLabel}" status right now.`}
              </p>
            </motion.div>
          ) : (
            filteredBookings.map((booking, i) => (
              <BookingCard key={booking._id} booking={booking} index={i} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Page