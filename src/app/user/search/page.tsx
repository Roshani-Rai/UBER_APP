"use client"
import { IVehicle } from '@/app/modals/vehicle.modals'
import Search from '@/componets/Search'
import VehicleCard from '@/componets/VehicleCard'
import axios from 'axios'
import { ArrowLeft, MapPin, Navigation, Search as SearchIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

function page() {
  const router = useRouter()
  const params = useSearchParams()
  const [km, setKm] = useState<number>()
  const [pickup, setPickup] = useState(params.get('pickup') || '')
  const [drop, setDrop] = useState(params.get('drop') || '')
  const mobile = params.get('mobile')
  const pickupLat = Number(params.get('pickuplat'))
  const pickupLon = Number(params.get('pickuplon'))
  const dropLat = Number(params.get('droplat'))
  const dropLon = Number(params.get('droplon'))
  const vehicle = params.get('vehicle') || ''
  const [vehicles, setVehicles] = useState<IVehicle[]>([])
  const [loading, setLoading] = useState(false)

  const VEHICLE_META: any = {
    bike: { label: 'Bike' },
    auto: { label: 'Auto' },
    car: { label: 'Car' },
    loading: { label: 'Loading' },
    truck: { label: 'Truck' },
  }
  const meta = VEHICLE_META[vehicle]

  const getNearByVehicles = async (
    latitude: number,
    longitude: number,
    vehicleType: string | null
  ) => {
    setLoading(true)
    try {
      const { data } = await axios.post('/api/auth/vehicles/near-by', {
        latitude,
        longitude,
        vehicleType,
      })
      console.log(data)
      setVehicles( data)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getNearByVehicles(pickupLat, pickupLon, vehicle)
  }, [pickupLon, pickupLat])

  return (
    <div className='min-h-screen bg-zinc-100 text-zinc-900 overflow-x-hidden'>

      {/* Back button */}
      <div className='absolute top-5 left-5 z-50'>
        <motion.div
          whileTap={{ scale: 0.88 }}
          onClick={() => router.back()}
          className='w-11 h-11 rounded-full bg-white border border-zinc-200 shadow-md flex items-center justify-center hover:bg-zinc-50 transition-colors'
        >
          <ArrowLeft size={18} className='text-zinc-900' />
        </motion.div>
      </div>

      {/* Map */}
      <div className='relative w-full h-[48vh] z-0'>
        <Search
          pickup={pickup}
          drop={drop}
          onChange={(p, d) => { setPickup(p); setDrop(d) }}
          onDistance={setKm}
        />
      </div>

      {/* Bottom sheet */}
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 160, damping: 22 }}
        className='relative z-20 -mt-2 bg-white rounded-t-[28px] border-t border-zinc-200 shadow-[0_-8px_40px_rgba(0,0,0,0.08)] pt-5 pb-24 min-h-[53vh]'
      >
        <div className='px-5 lg:px-8 max-w-6xl mx-auto'>

          {/* Pickup / Drop */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className='bg-zinc-50 border border-zinc-200 rounded-2xl overflow-hidden mb-5'
          >
            <div className='flex gap-3 px-4 py-3 border-b border-zinc-100'>
              <div className='flex flex-col items-center pt-1.5 flex-shrink-0'>
                <div className='w-2.5 h-2.5 rounded-full bg-zinc-900' />
                <div className='w-px flex-1 bg-zinc-300 my-1' style={{ minHeight: 14 }} />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-[10px] text-zinc-400 uppercase tracking-widest font-semibold mb-0.5'>Pickup</p>
                <p className='text-sm text-zinc-900 font-semibold leading-snug truncate'>{pickup || '—'}</p>
              </div>
              <MapPin size={14} className='text-zinc-400 flex-shrink-0 mt-1.5' />
            </div>
            <div className='flex gap-3 px-4 py-3'>
              <div className='flex flex-col items-center pt-1.5 flex-shrink-0'>
               <div className='w-2.5 h-2.5 rounded-full bg-zinc-900' />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-[10px] text-zinc-400 uppercase tracking-widest font-semibold mb-0.5'>Drop</p>
                <p className='text-sm text-zinc-900 font-semibold leading-snug truncate'>{drop || '—'}</p>
              </div>
              <Navigation size={14} className='text-zinc-400 flex-shrink-0 mt-1.5' />
            </div>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className='flex items-center justify-between mb-5'
          >
            <div>
              <h2 className='text-zinc-900 text-lg font-black tracking-tight'>
                {loading
                  ? 'Finding vehicles...'
                  : vehicles.length > 0
                  ? 'Available'
                  : 'No vehicles found'}
              </h2>
              {meta && (
                <p className='text-zinc-400 text-xs mt-0.5'>
                  {meta.label} rides near your pickup
                  {km ? ` · ${km.toFixed(1)} km` : ''}
                </p>
              )}
            </div>

            {/* Live badge - only when vehicles found */}
            {vehicles.length > 0 && !loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className='flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5'
              >
                <span className='relative flex h-2 w-2'>
                  <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75' />
                  <span className='relative inline-flex rounded-full h-2 w-2 bg-emerald-500' />
                </span>
                <span className='text-xs font-bold text-emerald-600'>Live</span>
              </motion.div>
            )}
          </motion.div>

          {/* Content */}
          <AnimatePresence mode='wait'>

            {/* Skeleton */}
            {loading && (
              <motion.div
                key='skeleton'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className='grid grid-cols-1 sm:grid-cols-2 gap-4'
              >
                {[1, 2].map(i => (
                  <div key={i} className='bg-zinc-100 rounded-3xl h-80 animate-pulse' />
                ))}
              </motion.div>
            )}

            {/* Empty state */}
            {!loading && vehicles.length === 0 && (
              <motion.div
                key='empty'
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className='flex flex-col items-center justify-center py-20 text-center'
              >
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                  className='w-20 h-20 rounded-full bg-zinc-100 flex items-center justify-center mb-5'
                >
                  <SearchIcon size={32} className='text-zinc-400' />
                </motion.div>
                <p className='text-zinc-800 font-black text-lg'>No vehicles found</p>
                <p className='text-zinc-400 text-sm mt-1 mb-6'>
                  No {meta?.label || 'vehicles'} available near your pickup
                </p>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => getNearByVehicles(pickupLat, pickupLon, vehicle)}
                  className='bg-zinc-900 text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-zinc-700 transition-colors'
                >
                  Search Again
                </motion.button>
              </motion.div>
            )}

            {/* Vehicle grid */}
            {!loading && vehicles.length > 0 && (
              <motion.div
                key='grid'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-wrap gap-3 p-4"
              >
                {vehicles.map((v: any, i) => (
                  <motion.div
                    key={v._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <VehicleCard
                      vehicle={v}
                      km={km}
                      onBook={(v) =>
                        router.push(
                          `/user/checkout?vehicleType=${vehicle}&driverId=${v.owner}&vehicleId=${v._id}&pickup=${encodeURIComponent(pickup)}&drop=${encodeURIComponent(drop)}&mobile=${mobile}&pickuplat=${pickupLat}&pickuplon=${pickupLon}&droplat=${dropLat}&droplon=${dropLon}&price=${Math.round(v.baseFare + (km ?? 0) * v.pricePerKm)}`
                        )
                      }
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

export default page