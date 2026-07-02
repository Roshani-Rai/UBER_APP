'use client'
import { IBooking } from '@/app/modals/booking.modals'
import axios from 'axios'
import { motion, AnimatePresence } from 'motion/react'
import { MapPin, Navigation, Clock, Inbox, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { getSocket } from '@/app/lib/socket'
import { Preahvihear } from 'next/font/google'

function page() {
  const router = useRouter()
  const [pending, setPending] = useState<IBooking[]>([])
  const [loading, setLoading] = useState(false)
  const [acceptingId, setAcceptingId] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)

  const fetchPendingRequests = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('/api/auth/partner/bookings/pending')
      setPending(Array.isArray(data) ? data : [])
    } catch (error) {
      console.log(error)
      toast.error('Could not load ride requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=>{
    const socket = getSocket()
    socket.on('new-booking',(data)=>{
      setPending((prev)=>[...prev,data])
    })
    return ()=>{
      socket.off('new-booking')
    }

  })
  const handleAccept = async (id: string) => {
    try {
      setAcceptingId(id)
      const { data } = await axios.get(`/api/auth/partner/bookings/${id}/accept`)
      toast.success('Booking accepted successfully!!')
      setPending((prev) => prev.filter((b) => b._id !== id))
      router.push('/partner/bookings')
    } catch (error) {
      console.log(error)
      toast.error('Could not accept this ride')
    } finally {
      setAcceptingId(null)
    }
  }

  const handleReject = async (id: string) => {
    try {
      setRejectingId(id)
      const { data } = await axios.get(`/api/auth/partner/bookings/${id}/reject`)
      toast.success('Booking rejected successfully!!')
      setPending((prev) => prev.filter((b) => b._id !== id))
     window.location.reload()
    } catch (error) {
      console.log(error)
      toast.error('Could not reject this ride')
    } finally {
      setRejectingId(null)
    }
  }

  useEffect(() => {
    fetchPendingRequests()
  }, [])

  return (
    <div className='min-h-screen bg-zinc-100 px-4 py-10 sm:py-14'>
      <div className='max-w-3xl mx-auto'>

        {/* Back button */}
        <motion.div
          whileTap={{ scale: 0.88 }}
          onClick={() => router.back()}
          className='w-11 h-11 rounded-full bg-white border border-zinc-200 shadow-md flex items-center justify-center mb-6 cursor-pointer hover:bg-zinc-50 transition-colors'
        >
          <ArrowLeft size={18} className='text-zinc-900' />
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className='mb-8'
        >
          <div className='flex items-center gap-2 mb-2'>
            <div className='h-px w-8 bg-zinc-900' />
            <span className='text-[10px] font-black uppercase tracking-[0.2rem] text-zinc-400'>Partner</span>
          </div>
          <h1 className='text-3xl sm:text-4xl font-black tracking-tight text-zinc-900'>Ride Requests</h1>
          <p className='text-zinc-400 text-sm mt-1.5 font-medium'>Manage incoming ride requests and respond in real time.</p>
        </motion.div>

        {/* Loading skeleton */}
        {loading && (
          <div className='flex flex-col gap-4'>
            {[1, 2].map((i) => (
              <div key={i} className='bg-white rounded-3xl border border-zinc-200 h-40 animate-pulse' />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && pending.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className='bg-white rounded-3xl border border-zinc-200 flex flex-col items-center justify-center text-center py-20 px-6'
          >
            <div className='w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mb-5'>
              <Inbox size={26} className='text-zinc-400' />
            </div>
            <p className='text-zinc-900 font-black text-lg'>No ride requests right now</p>
            <p className='text-zinc-400 text-sm mt-1'>New requests will show up here the moment they come in.</p>
          </motion.div>
        )}

        {/* Requests list */}
        <div className='flex flex-col gap-4'>
          <AnimatePresence mode='popLayout'>
            {!loading && pending.map((b: any, i: number) => (
              <motion.div
                key={b._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className='bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.06)]'
              >
                <div className='h-1 bg-zinc-900' />

                <div className='p-5 sm:p-6 flex flex-col gap-5'>

                  {/* Route + Fare */}
                  <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4'>
                    <div className='flex-1 min-w-0'>
                      <div className='flex gap-3 pb-3'>
                        <MapPin size={16} className='text-zinc-400 flex-shrink-0 mt-0.5' />
                        <div className='flex flex-col items-center pt-1 flex-shrink-0'>
                          <div className='w-2.5 h-2.5 rounded-full bg-zinc-900' />
                          <div className='w-px flex-1 bg-zinc-300 my-1' style={{ minHeight: 16 }} />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className='text-[10px] text-zinc-400 uppercase tracking-widest font-semibold mb-0.5'>Pickup Location</p>
                          <p className='text-sm text-zinc-900 font-semibold leading-snug'>{b.pickUpAddress || '—'}</p>
                        </div>
                      </div>
                      <div className='flex gap-3'>
                        <Navigation size={16} className='text-zinc-400 flex-shrink-0 mt-0.5' />
                        <div className='flex flex-col items-center pt-1 flex-shrink-0'>
                          <div className='w-2.5 h-2.5 rounded-full bg-zinc-900' />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className='text-[10px] text-zinc-400 uppercase tracking-widest font-semibold mb-0.5'>Drop Location</p>
                          <p className='text-sm text-zinc-900 font-semibold leading-snug'>{b.dropAddress || '—'}</p>
                        </div>
                      </div>
                    </div>

                    <div className='flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 sm:gap-0 sm:text-right border-t sm:border-t-0 border-zinc-100 pt-3 sm:pt-0'>
                      <p className='text-[10px] text-zinc-400 uppercase tracking-widest font-semibold'>Estimated Fare</p>
                      <p className='text-3xl font-black text-zinc-900'>₹{b.fare ?? '—'}</p>
                    </div>
                  </div>

                  {/* Time + Actions */}
                  <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-zinc-100 pt-4'>
                    <div className='flex items-center gap-1.5 text-zinc-400 text-xs font-medium'>
                      <Clock size={13} />
                      {b.createdAt
                        ? new Date(b.createdAt).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—'}
                    </div>

                    <div className='flex items-center gap-2 w-full sm:w-auto'>
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleReject(b._id)}
                        disabled={acceptingId === b._id || rejectingId === b._id}
                        className='flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 text-sm font-bold hover:bg-zinc-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                      >
                        {rejectingId === b._id ? 'Rejecting...' : 'Reject'}
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleAccept(b._id)}
                        disabled={acceptingId === b._id || rejectingId === b._id}
                        className='flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                      >
                        {acceptingId === b._id ? 'Accepting...' : 'Accept Ride'}
                      </motion.button>
                    </div>
                  </div>

                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default page