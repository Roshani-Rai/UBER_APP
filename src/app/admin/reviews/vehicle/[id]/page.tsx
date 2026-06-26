"use client"
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Check, X, Clock, Car, Gauge, IndianRupee, AlertTriangle, CheckCircle2, XCircle, ChevronLeft } from 'lucide-react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useRouter, useParams } from 'next/navigation'

type VehicleData = {
  _id: string
  type: string
  number: string
  vehicleModel: string
  imageUrl?: string
  baseFare?: number
  pricePerKm?: number
  waitingCharge?: number
  status: string
  pricingUpdated: boolean
  owner: {
    _id: string
    name: string
    email: string
    mobileNumber?: string
  }
}

function Page() {
  const router = useRouter()
  const params = useParams()
  const vehicleId = params?.id as string  // ✅ get id from URL

  const [vehicle, setVehicle] = useState<VehicleData | null>(null)
  const [fetching, setFetching] = useState(true)
  const [modal, setModal] = useState<'approve' | 'reject' | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [loading, setLoading] = useState(false)

  // ✅ fetch single vehicle by id
  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const { data } = await axios.get(`/api/auth/admin/reviews/vehicle/${vehicleId}`)
        if (data.success === false) {
          toast.error(data.message)
          return
        }
        setVehicle(data)
      } catch {
        toast.error("Failed to fetch vehicle data")
      } finally {
        setFetching(false)
      }
    }
    if (vehicleId) fetchVehicle()
  }, [vehicleId])

  const closeModal = () => {
    setModal(null)
    setRejectReason('')
  }

  const handleApprove = async () => {
    if (!vehicle) return
    setLoading(true)
    try {
      const { data } = await axios.get(`/api/auth/admin/reviews/vehicle/${vehicle._id}/approve`)
      if (data.success === false) { toast.error(data.message); return }
      toast.success("Pricing approved successfully!")
      closeModal()
      router.back()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!vehicle || !rejectReason.trim()) return
    setLoading(true)
    try {
      const { data } = await axios.post(`/api/auth/admin/reviews/vehicle/${vehicle._id}/reject`, {
        reason: rejectReason.trim()
      })
      if (data.success === false) { toast.error(data.message); return }
      toast.success("Pricing rejected successfully!!.")
      closeModal()
      router.back()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const vehicleTypeLabel: Record<string, string> = {
    bike: '🏍️ Bike', auto: '🛺 Auto', car: '🚗 Car',
    loading: '📦 Loading', truck: '🚛 Truck'
  }

  if (fetching) return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
      <div className='flex flex-col items-center gap-3'>
        <div className='w-10 h-10 rounded-full border-2 border-black border-t-transparent animate-spin' />
        <p className='text-sm text-gray-500'>Loading vehicle data...</p>
      </div>
    </div>
  )

  if (!vehicle) return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
      <div className='text-center'>
        <p className='text-lg font-bold text-black'>Vehicle not found</p>
        <button onClick={() => router.back()} className='mt-4 text-sm text-gray-500 underline'>Go back</button>
      </div>
    </div>
  )

  return (
    <div className='min-h-screen bg-gray-50 px-4 py-8'>
      <div className='max-w-2xl mx-auto space-y-6'>

        {/* Header */}
        <div className='flex items-center gap-4'>
          <button
            onClick={() => router.back()}
            className='w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition flex-shrink-0'
          >
            <ChevronLeft size={18} />
          </button>
          <div className='flex-1'>
            <p className='text-xs text-gray-500 font-medium'>Admin Panel</p>
            <h1 className='text-2xl sm:text-3xl font-bold text-black'>Pricing Review</h1>
          </div>
          <span className='flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200'>
            <Clock size={12} /> Pending
          </span>
        </div>

        {/* Vehicle card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden'
        >
          {/* Vehicle image */}
          <div className='relative w-full h-56 bg-gray-100'>
            {vehicle.imageUrl ? (
              <img src={vehicle.imageUrl} alt='Vehicle' className='w-full h-full object-cover' />
            ) : (
              <div className='w-full h-full flex items-center justify-center text-gray-300'>
                <Car size={56} strokeWidth={1} />
              </div>
            )}
            <div className='absolute top-3 right-3 flex items-center gap-1.5 bg-yellow-500 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full'>
              <Clock size={10} /> Pending Review
            </div>
            <div className='absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full'>
              {vehicleTypeLabel[vehicle.type] ?? vehicle.type}
            </div>
          </div>

          <div className='p-5 space-y-4'>

            {/* Partner info */}
            <div className='flex items-center gap-3 pb-4 border-b border-gray-100'>
              <div className='w-11 h-11 rounded-2xl bg-black text-white flex items-center justify-center font-bold text-sm flex-shrink-0'>
                {vehicle.owner?.name?.[0]?.toUpperCase() ?? 'P'}
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-bold text-black truncate'>{vehicle.owner?.name ?? 'Partner'}</p>
                <p className='text-xs text-gray-400 truncate'>{vehicle.owner?.email}</p>
              </div>
              {vehicle.owner?.mobileNumber && (
                <p className='text-xs text-gray-500 font-medium flex-shrink-0'>{vehicle.owner.mobileNumber}</p>
              )}
            </div>

            {/* Vehicle details */}
            <div className='grid grid-cols-2 gap-2'>
              {[
                { label: 'Vehicle Number', value: vehicle.number },
                { label: 'Model', value: vehicle.vehicleModel },
              ].map(item => (
                <div key={item.label} className='bg-gray-50 rounded-2xl px-3 py-2.5'>
                  <p className='text-[10px] text-gray-400 font-medium'>{item.label}</p>
                  <p className='text-sm font-bold text-black mt-0.5'>{item.value}</p>
                </div>
              ))}
            </div>

            {/* Pricing */}
            <div className='grid grid-cols-3 gap-2'>
              <div className='bg-blue-50 border border-blue-100 rounded-2xl px-3 py-3 text-center'>
                <div className='flex items-center justify-center gap-1 text-blue-500 mb-1'>
                  <IndianRupee size={11} />
                  <span className='text-[10px] font-semibold'>Base Fare</span>
                </div>
                <p className='text-base font-bold text-black'>₹{vehicle.baseFare ?? '—'}</p>
              </div>
              <div className='bg-purple-50 border border-purple-100 rounded-2xl px-3 py-3 text-center'>
                <div className='flex items-center justify-center gap-1 text-purple-500 mb-1'>
                  <Gauge size={11} />
                  <span className='text-[10px] font-semibold'>Per KM</span>
                </div>
                <p className='text-base font-bold text-black'>₹{vehicle.pricePerKm ?? '—'}</p>
              </div>
              <div className='bg-orange-50 border border-orange-100 rounded-2xl px-3 py-3 text-center'>
                <div className='flex items-center justify-center gap-1 text-orange-500 mb-1'>
                  <Clock size={11} />
                  <span className='text-[10px] font-semibold'>Wait/min</span>
                </div>
                <p className='text-base font-bold text-black'>₹{vehicle.waitingCharge ?? '—'}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className='flex gap-3 pt-1'>
              <button
                onClick={() => setModal('reject')}
                className='flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-red-200 bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition active:scale-95'
              >
                <XCircle size={16} /> Reject
              </button>
              <button
                onClick={() => setModal('approve')}
                className='flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-black text-white text-sm font-semibold hover:bg-gray-800 transition active:scale-95'
              >
                <CheckCircle2 size={16} /> Approve
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm'
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className='w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden'
              onClick={e => e.stopPropagation()}
            >
              {modal === 'approve' && (
                <>
                  <div className='px-6 pt-8 pb-6 flex flex-col items-center text-center gap-4'>
                    <div className='w-16 h-16 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center'>
                      <CheckCircle2 size={32} className='text-green-500' />
                    </div>
                    <div>
                      <h2 className='text-xl font-bold text-black'>Approve Pricing?</h2>
                      <p className='text-sm text-gray-400 mt-2'>
                        You're about to approve pricing for
                        <span className='font-semibold text-black'> {vehicle.owner?.name}</span>.
                        This will move them to the final step.
                      </p>
                    </div>
                    <div className='w-full grid grid-cols-3 gap-2'>
                      <div className='bg-gray-50 rounded-2xl px-2 py-2.5 text-center'>
                        <p className='text-[10px] text-gray-400'>Base</p>
                        <p className='text-sm font-bold text-black'>₹{vehicle.baseFare}</p>
                      </div>
                      <div className='bg-gray-50 rounded-2xl px-2 py-2.5 text-center'>
                        <p className='text-[10px] text-gray-400'>Per KM</p>
                        <p className='text-sm font-bold text-black'>₹{vehicle.pricePerKm}</p>
                      </div>
                      <div className='bg-gray-50 rounded-2xl px-2 py-2.5 text-center'>
                        <p className='text-[10px] text-gray-400'>Wait</p>
                        <p className='text-sm font-bold text-black'>₹{vehicle.waitingCharge}</p>
                      </div>
                    </div>
                  </div>
                  <div className='px-6 pb-6 flex gap-3'>
                    <button onClick={closeModal} className='flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition'>
                      Cancel
                    </button>
                    <button
                      onClick={handleApprove}
                      disabled={loading}
                      className='flex-1 py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60'
                    >
                      {loading
                        ? <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                        : <><Check size={16} /> Yes, Approve</>
                      }
                    </button>
                  </div>
                </>
              )}

              {modal === 'reject' && (
                <>
                  <div className='px-6 pt-8 pb-4 flex flex-col items-center text-center gap-4'>
                    <div className='w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center'>
                      <AlertTriangle size={32} className='text-red-500' />
                    </div>
                    <div>
                      <h2 className='text-xl font-bold text-black'>Reject Pricing?</h2>
                      <p className='text-sm text-gray-400 mt-2'>
                        Provide a reason for
                        <span className='font-semibold text-black'> {vehicle.owner?.name}</span>.
                        They'll be able to resubmit.
                      </p>
                    </div>
                  </div>
                  <div className='px-6 pb-2'>
                    <textarea
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                      placeholder='e.g. Base fare is too high for this area...'
                      rows={3}
                      className='w-full rounded-2xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-black placeholder:text-gray-400 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 resize-none transition'
                    />
                  </div>
                  <div className='px-6 pb-6 flex gap-3 mt-2'>
                    <button onClick={closeModal} className='flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition'>
                      Cancel
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={!rejectReason.trim() || loading}
                      className={`flex-1 py-3 rounded-2xl text-white text-sm font-semibold transition active:scale-95 flex items-center justify-center gap-2 ${
                        rejectReason.trim() && !loading ? 'bg-red-600 hover:bg-red-700' : 'bg-red-200 cursor-not-allowed'
                      }`}
                    >
                      {loading
                        ? <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                        : <><X size={16} /> Yes, Reject</>
                      }
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Page