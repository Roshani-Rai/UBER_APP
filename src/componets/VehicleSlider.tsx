"use client"
import { Bike, Bus, Car, CarTaxiFront, ChevronLeft, ChevronRight, Truck } from 'lucide-react'
import React, { useRef, useState } from 'react'
import { motion } from 'motion/react'

const VEHICLE = [
  { title: "All Vehicles", desc: "Browse the full fleet", Icon: CarTaxiFront, tag: "Popular" },
  { title: "Bikes", desc: "Fast and affordable rides", Icon: Bike, tag: "Quick" },
  { title: "Cars", desc: "Comfortable city travel", Icon: Car, tag: "Comfort" },
  { title: "SUVs", desc: "Premium & spacious", Icon: Car, tag: "Premium" },
  { title: "Vans", desc: "Family & group transport", Icon: Bus, tag: "Family" },
  { title: "Trucks", desc: "Heavy & commercial transport", Icon: Truck, tag: "Cargo" },
]

const STATS = [
  { value: "6+", label: "Categories" },
  { value: "10+", label: "Vehicle types" },
  { value: "24/7", label: "Availability" },
]

function VehicleSlider() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const checkScrollPos = () => {
    const el = trackRef.current
    if (!el) return
    setAtStart(el.scrollLeft <= 4)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4)
  }

  const scrollByCard = (dir: "left" | "right") => {
    const el = trackRef.current
    if (!el) return
    const amount = el.clientWidth * 0.8
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" })
  }

  return (
    <div className='w-full bg-white py-20 px-4 overflow-hidden'>
      <div className='max-w-7xl mx-auto'>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className='flex items-end justify-between mb-10'
        >
          <div>
            <div className='flex items-center gap-2 mb-3'>
              <span className='block w-6 h-[2px] bg-[#0B0B0B]' />
              <span className='text-xs font-semibold uppercase tracking-widest text-[#0B0B0B]'>
                Fleet
              </span>
            </div>

            <h2 className='text-3xl md:text-5xl font-extrabold text-[#0B0B0B] leading-tight'>
              Vehicles <br />
              <span className='relative inline-block'>
                Categories
                <span className='absolute left-0 -bottom-1 w-full h-[3px] bg-[#0B0B0B]' />
              </span>
            </h2>

            <p className='mt-5 text-sm text-gray-500 italic'>
              Choose the ride that fits your journey
            </p>
          </div>

          <div className='hidden md:flex items-center gap-3'>
            <button
              onClick={() => scrollByCard("left")}
              disabled={atStart}
              aria-label="Scroll left"
              className='w-10 h-10 rounded-full bg-[#0B0B0B] text-white flex items-center justify-center transition disabled:opacity-30 hover:bg-black/80'
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scrollByCard("right")}
              disabled={atEnd}
              aria-label="Scroll right"
              className='w-10 h-10 rounded-full bg-[#0B0B0B] text-white flex items-center justify-center transition disabled:opacity-30 hover:bg-black/80'
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </motion.div>

        {/* Slider */}
        <div
          ref={trackRef}
          onScroll={checkScrollPos}
          className='no-scrollbar flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2'
        >
          {VEHICLE.map((v, index) => {
            const { Icon } = v
            return (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className='group snap-start shrink-0 w-[78%] sm:w-[46%] md:w-[280px] lg:w-[300px] rounded-3xl border border-gray-200 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white hover:bg-[#0B0B0B] cursor-pointer'
              >
                <div className='flex items-start justify-between mb-6'>
                  <div className='w-12 h-12 rounded-full bg-[#0B0B0B] group-hover:bg-white text-white group-hover:text-[#0B0B0B] flex items-center justify-center transition-colors duration-300'>
                    <Icon size={22} />
                  </div>
                  <span className='text-[11px] font-semibold uppercase tracking-wide bg-gray-100 group-hover:bg-white/10 text-gray-600 group-hover:text-white px-3 py-1 rounded-full transition-colors duration-300'>
                    {v.tag}
                  </span>
                </div>

                <h3 className='text-lg font-bold text-[#0B0B0B] group-hover:text-white mb-1 transition-colors duration-300'>
                  {v.title}
                </h3>
                <p className='text-sm text-gray-500 group-hover:text-gray-300 transition-colors duration-300'>
                  {v.desc}
                </p>
              </motion.div>
            )
          })}
        </div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className='mt-14 flex items-center gap-8 md:gap-16 flex-wrap'
        >
          {STATS.map((stat, i) => (
            <div key={stat.label} className='flex items-baseline gap-2'>
              <span className='text-2xl md:text-3xl font-extrabold text-[#0B0B0B]'>
                {stat.value}
              </span>
              <span className='text-sm md:text-base text-gray-400 font-medium'>
                {stat.label}
              </span>
              {i < STATS.length - 1 && (
                <span className='ml-6 md:ml-12 text-gray-200 text-xl select-none'>·</span>
              )}
            </div>
          ))}
        </motion.div>

      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { scrollbar-width: none; }
      `}</style>
    </div>
  )
}

export default VehicleSlider