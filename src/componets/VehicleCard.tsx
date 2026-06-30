"use client"
import { IVehicle } from '@/app/modals/vehicle.modals'
import { motion } from 'motion/react'
import { Bike, Car, Truck, Clock, Gauge, ArrowLeftRight, ArrowRight } from 'lucide-react'

const ICONS: any = {
  bike: Bike,
  auto: Car,
  car: Car,
  truck: Truck,
  loading: Truck,
}

interface Props {
  vehicle: IVehicle & { _id: string }
  km?: number
  onBook: (vehicle: any) => void
}

export default function VehicleCard({ vehicle, km, onBook }: Props) {
  const Icon = ICONS[vehicle.type?.toLowerCase()] || Car
  const estimated = km && vehicle.pricePerKm
    ? Math.round(km * vehicle.pricePerKm + (vehicle.baseFare ?? 0))
    : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onBook(vehicle)}
      className='w-full bg-white rounded-3xl overflow-hidden shadow-sm border border-zinc-100 cursor-pointer flex flex-col'
    >
      {/* Image area - square grid background */}
      <div
        className='relative w-full h-36 sm:h-48 flex items-center justify-center'
        style={{
          backgroundImage: `
            linear-gradient(to right, #d4d4d8 1px, transparent 1px),
            linear-gradient(to bottom, #d4d4d8 1px, transparent 1px)
          `,
          backgroundSize: '18px 18px',
          backgroundColor: '#fafafa',
        }}
      >
        {vehicle.imageUrl ? (
          <img
            src={vehicle.imageUrl}
            alt={vehicle.vehicleModel}
            className='h-28 sm:h-36 w-full object-contain px-4 drop-shadow-md hover:scale-105 transition-transform duration-200'
          />
        ) : (
          <motion.div
            animate={{ y: [-4, 4, -4] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          >
            <Icon size={64} className='text-zinc-300' strokeWidth={1} />
          </motion.div>
        )}

         {/* Rating - bottom left */}
        <div className='absolute bottom-3 left-3 flex items-center gap-1 bg-white rounded-full px-2.5 py-1 shadow-sm border border-zinc-100'>
          <span className='text-yellow-400 text-xs'>★</span>
          <span className='text-xs font-bold text-zinc-800'>4.8</span>
        </div>

        {/* Type badge - bottom right */}
        <div className='absolute bottom-3 right-3 flex items-center gap-1.5 bg-zinc-900 text-white rounded-full px-3 py-1.5'>
          <Icon size={11} />
          <span className='text-[11px] font-bold uppercase tracking-wide'>
            {vehicle.type}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className='p-4 sm:p-5 flex flex-col gap-3'>

        {/* Name + number row */}
        <div className='flex items-start justify-between gap-2'>
          <div className='min-w-0'>
            <p className='font-black text-zinc-900 text-base sm:text-lg leading-tight truncate'>
              {vehicle.vehicleModel}
            </p>
            <div className='mt-1.5 inline-flex items-center bg-zinc-100 rounded-lg px-2.5 py-1'>
              <span className='text-xs font-semibold text-zinc-600 tracking-widest'>
                {vehicle.number}
              </span>
            </div>
          </div>
          <div className='w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0'>
            <Icon size={16} className='text-zinc-500' />
          </div>
        </div>

        {/* Divider */}
        <div className='border-t border-zinc-100' />

        {/* Per km + waiting */}
        <div className='flex gap-4 sm:gap-6'>
          <div className='flex items-center gap-1.5'>
            <Gauge size={13} className='text-zinc-400' />
            <div>
              <p className='text-[10px] text-zinc-400 uppercase tracking-wider font-semibold'>Per KM</p>
              <p className='text-sm font-black text-zinc-900'>₹{vehicle.pricePerKm ?? '—'}</p>
            </div>
          </div>
          <div className='flex items-center gap-1.5'>
            <Clock size={13} className='text-zinc-400' />
            <div>
              <p className='text-[10px] text-zinc-400 uppercase tracking-wider font-semibold'>Waiting</p>
              <p className='text-sm font-black text-zinc-900'>
                ₹{vehicle.waitingCharge ?? '—'}/min
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className='border-t border-zinc-100' />

        {/* Est fare + Book button */}
        <div className='flex items-center justify-between gap-2 px-1 sm:p-2'>
          <div>
            <p className='text-[10px] text-zinc-400 uppercase tracking-wider font-semibold mb-0.5'>
              Est. Fare
            </p>
            <p className='text-2xl sm:text-3xl font-black text-zinc-900'>
              {estimated ? `₹${estimated}` : '—'}
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.04 }}
            onClick={onBook}
            className='flex items-center gap-2 bg-zinc-900 hover:bg-black text-white text-sm font-black px-6 py-3.5 rounded-2xl transition-colors shadow-md flex-shrink-0'
          >
            Book
           <motion.div
            initial={{x:0}}
            whileHover={{x:3}}
            transition={{duration:0.2}}
           >
            <ArrowRight size={14} />
            </motion.div>
          </motion.button>
        </div>

      </div>
    </motion.div>
  )
}