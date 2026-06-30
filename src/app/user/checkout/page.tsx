'use client'
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  MapPin,
  Navigation,
  Clock,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Bike,
  Car,
  Truck,
  X,
  Wallet,
  Check,
} from 'lucide-react'
import axios from 'axios'
import { toast } from 'react-toastify'

const ICONS: any = {
  bike: Bike,
  auto: Car,
  car: Car,
  truck: Truck,
  loading: Truck,
}

type status = 'idle' | 'requested' | 'awaiting_payment' | 'rejected' | 'expired' | 'cancelled' | 'payment' | 'confirmed'
type paymentMethod = 'cash' | 'online'

function Page() {
  const router = useRouter()
  const params = useSearchParams()
  const [booking, setBooking] = useState<any>(null)
  const [confirming, setConfirming] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [status, setStatus] = useState<status>('idle')
  const [cancelling, setCancelling] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<paymentMethod>('online')
  const [paying, setPaying] = useState(false)

  const driverId = params.get('driverId')
  const vehicleId = params.get('vehicleId')
  const vehicleType = params.get('vehicleType') || ''
  const pickup = params.get('pickup') || ''
  const drop = params.get('drop') || ''
  const mobile = params.get('mobile') || ''
  const pickupLat = params.get('pickuplat')
  const pickupLon = params.get('pickuplon')
  const dropLat = params.get('droplat')
  const dropLon = params.get('droplon')
  const price = params.get('price')

  const Icon = ICONS[vehicleType?.toLowerCase()] || Car

  const handleConfirm = async () => {
    setConfirming(true)
    try {
      const { data, status: httpStatus } = await axios.post('/api/auth/booking/create', {
        vehicleId,
        driverId,
        pickUpAddress: pickup,
        dropAddress: drop,
        pickUpLocation: {
          type: 'Point',
          coordinates: [Number(pickupLon), Number(pickupLat)],
        },
        dropLocation: {
          type: 'Point',
          coordinates: [Number(dropLon), Number(dropLat)],
        },
        fare: price,
        mobileNumber: mobile,
      })

      if (httpStatus === 200 && data?._id) {
        setConfirmed(true)
        setBooking(data)
        setStatus(data.bookingStatus || 'requested')
        toast.success('Booking Requested Successfully!!')
      }
    } catch (err: any) {
      console.log(err)
      toast.error(err.message)
    } finally {
      setConfirming(false)
    }
  }

  const fetchActiveBooking = async () => {
    try {
      const { data } = await axios.get('/api/auth/booking/active')
      setBooking(data.booking)

      if (data?.booking?.bookingStatus) {
        setStatus(data.booking.bookingStatus)
      } else {
        setStatus('idle')
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleCancel = async () => {
    if (!booking?._id) return
    try {
      setCancelling(true)
      await axios.post(`/api/auth/booking/${booking._id}/cancel`)
      setStatus('idle')
      setBooking(null)
      setConfirmed(false)
      setConfirming(false)
      toast.success('Ride request cancelled')
    } catch (error) {
      console.log(error)
      toast.error('Could not cancel request')
    } finally {
      setCancelling(false)
    }
  }

  const handleProceedToPayment = async () => {
    if (!booking?._id) return
    try {
      setPaying(true)
      await axios.post(`/api/auth/booking/${booking._id}/pay`, {
        method: paymentMethod,
      })
      setStatus('confirmed')
      toast.success('Payment successful!')
    } catch (error: any) {
      console.log(error)
      toast.error(error?.message || 'Payment failed')
    } finally {
      setPaying(false)
    }
  }

  useEffect(() => {
    if (status !== 'awaiting_payment') return
    const t = setTimeout(() => {
      setStatus('payment')
    }, 2000)
    return () => {
      clearTimeout(t)
    }
  }, [status])

  useEffect(() => {
    fetchActiveBooking()
  }, [])

  // Poll while waiting for a driver to respond
  useEffect(() => {
    if (status !== 'requested') return
    const interval = setInterval(fetchActiveBooking, 4000)
    return () => clearInterval(interval)
  }, [status])

  // Success screen
  if (status === 'confirmed') {
    return (
      <div className='min-h-screen bg-zinc-100 flex items-center justify-center px-4'>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className='bg-white rounded-3xl border border-zinc-200 shadow-[0_4px_24px_rgba(0,0,0,0.07)] p-6 sm:p-10 flex flex-col items-center text-center max-w-sm w-full'
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className='w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-5'
          >
            <CheckCircle2 size={36} className='text-emerald-500' />
          </motion.div>
          <h2 className='text-xl sm:text-2xl font-black text-zinc-900 mb-2'>Booking Confirmed!</h2>
          <p className='text-zinc-400 text-sm mb-8'>Your ride has been booked. Driver will contact you shortly.</p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/')}
            className='w-full bg-zinc-900 text-white py-4 rounded-2xl font-black text-sm hover:bg-black transition-colors'
          >
            Back to Home
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-zinc-100 px-4 py-8 sm:py-12'>
      <div className='relative max-w-5xl mx-auto z-10'>

        {/* Back button */}
        <motion.div
          whileTap={{ scale: 0.88 }}
          onClick={() => router.back()}
          className='w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border border-zinc-200 shadow-md flex items-center justify-center mb-6 sm:mb-8 cursor-pointer hover:bg-zinc-50 transition-colors'
        >
          <ArrowLeft size={18} className='text-zinc-900' />
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className='mb-6 sm:mb-8'
        >
          <div className='flex items-center gap-2 mb-2'>
            <div className='h-px w-8 bg-zinc-900' />
            <span className='text-[10px] font-black uppercase tracking-[0.2rem] text-zinc-400'>Booking</span>
          </div>
          <h1 className='text-3xl sm:text-4xl font-black tracking-tight text-zinc-900'>Checkout</h1>
          <p className='text-zinc-400 text-sm mt-1.5 font-medium'>Review your ride and confirm</p>
        </motion.div>

        {/* Two column layout */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch'>

          {/* LEFT: vehicle + route + fare combined card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className='bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.07)] h-full flex flex-col'
          >
            <div className='h-1 bg-zinc-900' />

            <div className='p-5 sm:p-6 flex flex-col gap-5 sm:gap-6 flex-1'>

              {/* Vehicle row */}
              <div className='flex items-start justify-between'>
                <div>
                  <p className='text-[10px] text-zinc-400 uppercase tracking-widest font-semibold mb-1'>Selected Vehicle</p>
                  <p className='text-xl sm:text-2xl font-black text-zinc-900 leading-tight capitalize'>
                    {vehicleType || '—'}
                  </p>
                </div>
                <div className='w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-zinc-900 flex items-center justify-center flex-shrink-0'>
                  <Icon size={24} className='text-white' strokeWidth={1.75} />
                </div>
              </div>

              {/* Route */}
              <div className='flex flex-col gap-0 border-t border-zinc-100 pt-5'>
                <div className='flex gap-3 pb-3'>
                  <div className='flex flex-col items-center pt-1 flex-shrink-0'>
                    <div className='w-2.5 h-2.5 rounded-full bg-zinc-900' />
                    <div className='w-px flex-1 bg-zinc-300 my-1' style={{ minHeight: 18 }} />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-[10px] text-zinc-400 uppercase tracking-widest font-semibold mb-0.5'>Pickup</p>
                    <p className='text-sm text-zinc-900 font-semibold leading-snug truncate'>{pickup || '—'}</p>
                  </div>
                  <MapPin size={14} className='text-zinc-400 flex-shrink-0 mt-1' />
                </div>
                <div className='flex gap-3 pt-1'>
                  <div className='flex flex-col items-center pt-1 flex-shrink-0'>
                    <div className='w-2.5 h-2.5 rounded-full bg-zinc-900' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-[10px] text-zinc-400 uppercase tracking-widest font-semibold mb-0.5'>Drop</p>
                    <p className='text-sm text-zinc-900 font-semibold leading-snug truncate'>{drop || '—'}</p>
                  </div>
                  <Navigation size={14} className='text-zinc-400 flex-shrink-0 mt-1' />
                </div>
              </div>

              {/* Total fare */}
              <div className='flex items-center justify-between border-t border-zinc-100 pt-5 mt-auto'>
                <div>
                  <p className='text-[10px] text-zinc-400 uppercase tracking-widest font-semibold mb-0.5'>Total Fare</p>
                  <p className='text-xs text-zinc-400 font-medium'>Includes base + distance charges</p>
                </div>
                <span className='text-3xl sm:text-4xl font-black text-zinc-900'>₹{price ?? '—'}</span>
              </div>
            </div>
          </motion.div>

          {/* RIGHT: confirm / waiting / awaiting-payment / payment panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className='bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.07)] h-full flex flex-col'
          >
            <div className='h-1 bg-zinc-900' />

            <AnimatePresence mode='wait'>
              {status === 'idle' && (
                /* ---- IDLE: confirm panel ---- */
                <motion.div
                  key='idle'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className='p-5 sm:p-6 flex flex-col gap-5 sm:gap-6 flex-1'
                >
                  <div>
                    <p className='text-[10px] text-zinc-400 uppercase tracking-widest font-semibold mb-1'>Ready To Go?</p>
                    <h2 className='text-xl sm:text-2xl font-black text-zinc-900 leading-tight'>Confirm Your Ride</h2>
                  </div>

                  <div className='flex flex-col gap-4'>
                    <div className='flex items-center gap-3'>
                      <div className='w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center flex-shrink-0'>
                        <Clock size={16} className='text-zinc-600' />
                      </div>
                      <span className='text-sm font-semibold text-zinc-700'>Driver will respond within 2 minutes</span>
                    </div>
                    <div className='flex items-center gap-3'>
                      <div className='w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center flex-shrink-0'>
                        <ShieldCheck size={16} className='text-zinc-600' />
                      </div>
                      <span className='text-sm font-semibold text-zinc-700'>Verified &amp; insured drivers only</span>
                    </div>
                    <div className='flex items-center gap-3'>
                      <div className='w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center flex-shrink-0'>
                        <CreditCard size={16} className='text-zinc-600' />
                      </div>
                      <span className='text-sm font-semibold text-zinc-700'>Pay after driver accepts</span>
                    </div>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: 1.01 }}
                    onClick={handleConfirm}
                    disabled={confirming}
                    className='w-full bg-zinc-900 hover:bg-black text-white py-4 rounded-2xl font-black text-base transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-auto'
                  >
                    {confirming ? (
                      <span className='flex items-center justify-center gap-2'>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                          className='inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full'
                        />
                        Confirming...
                      </span>
                    ) : (
                      <>
                        Request Ride
                        <ArrowLeft size={16} className='rotate-180' />
                      </>
                    )}
                  </motion.button>
                </motion.div>
              )}

              {status === 'requested' && (
                /* ---- REQUESTED: finding driver, bubble radar animation ---- */
                <motion.div
                  key='waiting'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className='p-5 sm:p-6 flex-1 flex flex-col items-center justify-center text-center gap-1'
                >
                  {/* Radar / bubble pulse */}
                  <div className='relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center mb-6'>
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className='absolute inset-0 rounded-full border-2 border-zinc-300'
                        initial={{ scale: 0.4, opacity: 0.6 }}
                        animate={{ scale: 1.6, opacity: 0 }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeOut',
                          delay: i * 0.6,
                        }}
                      />
                    ))}
                    <div className='relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-zinc-100 flex items-center justify-center'>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        className='w-8 h-8 sm:w-9 sm:h-9 rounded-full border-[3px] border-zinc-200 border-t-zinc-900'
                      />
                    </div>
                  </div>

                  <h2 className='text-lg sm:text-xl font-black text-zinc-900'>Finding Your Driver</h2>
                  <p className='text-zinc-400 text-sm mb-7'>Waiting for driver to accept...</p>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={handleCancel}
                    disabled={cancelling}
                    className='cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 text-sm font-bold hover:bg-black hover:text-white hover:scale-105 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    <X size={15} />
                    {cancelling ? 'Cancelling...' : 'Cancel Request'}
                  </motion.button>
                </motion.div>
              )}

              {status === 'awaiting_payment' && (
                /* ---- AWAITING PAYMENT: driver accepted, loading bar ---- */
                <motion.div
                  key='awaiting_payment'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className='p-5 sm:p-6 flex-1 flex flex-col items-center justify-center text-center gap-1'
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className='w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mb-5'
                  >
                    <Check size={28} className='text-zinc-900' strokeWidth={3} />
                  </motion.div>

                  <h2 className='text-lg sm:text-xl font-black text-zinc-900'>Driver Accepted</h2>
                  <p className='text-zinc-400 text-sm mb-6'>Preparing payment options...</p>

                  <div className='w-full max-w-[220px] h-[3px] bg-zinc-100 rounded-full overflow-hidden'>
                    <motion.div
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut' }}
                      className='w-full h-full bg-zinc-900 rounded-full'
                    />
                  </div>
                </motion.div>
              )}

              {status === 'payment' && (
                /* ---- PAYMENT: select payment method ---- */
                <motion.div
                  key='payment'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className='p-5 sm:p-6 flex flex-col gap-5 sm:gap-6 flex-1'
                >
                  <div>
                    <p className='text-[10px] text-zinc-400 uppercase tracking-widest font-semibold mb-1'>Almost There</p>
                    <h2 className='text-xl sm:text-2xl font-black text-zinc-900 leading-tight'>Select Payment Method</h2>
                  </div>

                  <div className='flex flex-col gap-3'>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setPaymentMethod('cash')}
                      className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-colors ${
                        paymentMethod === 'cash'
                          ? 'border-zinc-900 bg-zinc-900 text-white'
                          : 'border-zinc-200 hover:bg-zinc-50'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          paymentMethod === 'cash' ? 'bg-white/10' : 'bg-zinc-100'
                        }`}
                      >
                        <Wallet size={18} className={paymentMethod === 'cash' ? 'text-white' : 'text-zinc-700'} />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className={`text-sm font-bold ${paymentMethod === 'cash' ? 'text-white' : 'text-zinc-900'}`}>
                          Cash
                        </p>
                        <p className={`text-xs font-medium ${paymentMethod === 'cash' ? 'text-zinc-300' : 'text-zinc-400'}`}>
                          Pay driver after ride
                        </p>
                      </div>
                      {paymentMethod === 'cash' && (
                        <CheckCircle2 size={18} className='text-white flex-shrink-0' />
                      )}
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setPaymentMethod('online')}
                      className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-colors ${
                        paymentMethod === 'online'
                          ? 'border-zinc-900 bg-zinc-900 text-white'
                          : 'border-zinc-200 hover:bg-zinc-50'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          paymentMethod === 'online' ? 'bg-white/10' : 'bg-zinc-100'
                        }`}
                      >
                        <CreditCard size={18} className={paymentMethod === 'online' ? 'text-white' : 'text-zinc-700'} />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className={`text-sm font-bold ${paymentMethod === 'online' ? 'text-white' : 'text-zinc-900'}`}>
                          Online Payment
                        </p>
                        <p className={`text-xs font-medium ${paymentMethod === 'online' ? 'text-zinc-300' : 'text-zinc-400'}`}>
                          UPI · Card · Netbanking
                        </p>
                      </div>
                      {paymentMethod === 'online' && (
                        <CheckCircle2 size={18} className='text-white flex-shrink-0' />
                      )}
                    </motion.button>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: 1.01 }}
                    onClick={handleProceedToPayment}
                    disabled={paying}
                    className='w-full bg-zinc-900 hover:bg-black text-white py-4 rounded-2xl font-black text-base transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-auto'
                  >
                    {paying ? (
                      <span className='flex items-center justify-center gap-2'>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                          className='inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full'
                        />
                        Processing...
                      </span>
                    ) : (
                      <>
                        Proceed to Payment
                        <ArrowLeft size={16} className='rotate-180' />
                      </>
                    )}
                  </motion.button>
                </motion.div>
              )}

            </AnimatePresence>
          </motion.div>

        </div>
      </div>
    </div>
  )
}

export default Page