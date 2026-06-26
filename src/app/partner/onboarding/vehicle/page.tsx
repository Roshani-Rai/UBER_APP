"use client"
import React, { useEffect, useState } from 'react'
import { motion } from "motion/react"
import { useRouter } from 'next/navigation'
import { ArrowLeft, Bike, CarTaxiFront, CarFront, Package, Truck, CircleDashed, CheckCircle2, ArrowRight } from 'lucide-react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { setUserData } from '@/redux/userSlice'

const VEHICLES = [
  { id: "bike",    label: "Bike",    icon: Bike,         desc: "2 wheeler" },
  { id: "auto",    label: "Auto",    icon: CarTaxiFront, desc: "3 wheeler" },
  { id: "car",     label: "Car",     icon: CarFront,     desc: "4 wheeler" },
  { id: "loading", label: "Loading", icon: Package,      desc: "Small goods" },
  { id: "truck",   label: "Truck",   icon: Truck,        desc: "Heavy transport" },
]

function page() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { userData } = useSelector((state: RootState) => state.user)

  const [vehicle, setVehicle] = useState("")
  const [vehicleNum, setVehicleNum] = useState("")
  const [vehicleModel, setVehicleModel] = useState("")
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [isUpdate, setIsUpdate] = useState(false)  // ✅ track if already submitted

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const { data } = await axios.get("/api/auth/partner/onboarding/vehicles")
        if (data && data.type) {
          setVehicle(data.type || "")
          setVehicleNum(data.number || "")
          setVehicleModel(data.vehicleModel || "")
          setSubmitted(true)   // ✅ show "Move to Next Step"
          setIsUpdate(true)    // ✅ this is an update
        }
      } catch (error) {
        console.log(error)
      } finally {
        setFetching(false)
      }
    }
    fetchVehicle()
  }, [])

  const canContinue = vehicle !== "" && vehicleNum.trim() !== "" && vehicleModel.trim() !== ""

  const handleVehicle = async () => {
    setLoading(true)
    try {
      const { data } = await axios.post("/api/auth/partner/onboarding/vehicles", {
        type: vehicle,
        number: vehicleNum,
        vehicleModel
      })
      if (data.success) {
        toast.success(data.isUpdate ? "Vehicle updated successfully!" : "Vehicle information saved successfully!")
        setSubmitted(true)
        setIsUpdate(true)
        dispatch(setUserData({ ...userData, partnerStep: 2 }))
      } else {
        toast.error(data.message || "Something went wrong")
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Upload failed, try again")
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return (
    <div className='min-h-screen bg-white flex items-center justify-center'>
      <CircleDashed size={28} className='animate-spin text-gray-400' />
    </div>
  )

  return (
    <div className='min-h-screen bg-white flex items-center justify-center px-4 py-10'>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className='w-full max-w-xl bg-white rounded-3xl border border-gray-200 shadow-[0_25px_70px_rgba(0,0,0,0.15)] p-6 sm:p-8'
      >
        <div className='relative text-center'>
          <button
            className='absolute left-0 top-0 w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition'
            onClick={() => router.back()}
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>

          <p className='text-xs text-gray-500 font-medium'>Step 1 of 3</p>
          <h1 className='text-2xl font-bold mt-1 text-black'>Vehicle Details</h1>
          <p className='text-sm text-gray-500 mt-2'>
            {isUpdate ? 'Update your vehicle information' : 'Add your vehicle information'}
          </p>

          <div className='flex gap-1.5 justify-center mt-4'>
            {[0, 1, 2].map((i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${i === 0 ? 'w-8 bg-black' : 'w-8 bg-gray-200'}`} />
            ))}
          </div>
        </div>

        <div className='mt-8 space-y-6'>

          {/* ✅ Already submitted badge */}
          {isUpdate && (
            <div className='flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-50 border border-green-100 text-green-700 text-xs font-medium'>
              <CheckCircle2 size={14} />
              Vehicle already submitted — you can update below
            </div>
          )}

          <div>
            <p className='text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide'>Vehicle Type</p>
            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3'>
              {VEHICLES.map((v) => {
                const Icon = v.icon
                const active = vehicle === v.id
                return (
                  <motion.button
                    key={v.id}
                    type="button"
                    onClick={() => { setVehicle(v.id); setSubmitted(false) }}
                    aria-pressed={active}
                    whileTap={{ scale: 0.96 }}
                    className={`group flex flex-col items-center justify-center gap-1.5 rounded-2xl border px-3 py-4 text-center transition-colors duration-200 ${
                      active ? 'border-black bg-black' : 'border-gray-200 hover:border-black hover:bg-black'
                    }`}
                  >
                    <Icon size={22} className={`transition-colors duration-200 ${active ? 'text-white' : 'text-gray-700 group-hover:text-white'}`} />
                    <span className={`text-sm font-semibold transition-colors duration-200 ${active ? 'text-white' : 'text-gray-900 group-hover:text-white'}`}>
                      {v.label}
                    </span>
                    <p className={`text-[11px] leading-tight transition-colors duration-200 ${active ? 'text-white/70' : 'text-gray-500 group-hover:text-white/70'}`}>
                      {v.desc}
                    </p>
                  </motion.button>
                )
              })}
            </div>
          </div>

          <div>
            <label htmlFor="vehicleNumber" className='block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide'>
              Vehicle Number
            </label>
            <input
              id="vehicleNumber"
              type="text"
              value={vehicleNum}
              onChange={(e) => { setVehicleNum(e.target.value.toUpperCase()); setSubmitted(false) }}
              placeholder="e.g. UP32AB1234"
              className='w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-black placeholder:text-gray-400 outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition'
            />
          </div>

          <div>
            <label htmlFor="vehicleModel" className='block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide'>
              Vehicle Model
            </label>
            <input
              id="vehicleModel"
              type="text"
              value={vehicleModel}
              onChange={(e) => { setVehicleModel(e.target.value); setSubmitted(false) }}
              placeholder="e.g. Honda Activa"
              className='w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-black placeholder:text-gray-400 outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition'
            />
          </div>

          {submitted ? (
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => router.push('documents')}
              className='w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold bg-black text-white hover:bg-gray-900 transition-colors'
            >
              <CheckCircle2 size={17} />
              Move to Next Step
              <ArrowRight size={17} />
            </motion.button>
          ) : (
            <motion.button
              type="button"
              disabled={!canContinue || loading}
              whileTap={canContinue ? { scale: 0.98 } : undefined}
              onClick={() => { if (!canContinue) return; handleVehicle() }}
              className={`w-full flex flex-row justify-center rounded-xl py-3 text-sm font-semibold transition-colors ${
                canContinue ? 'bg-black text-white hover:bg-gray-900' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {loading
                ? <CircleDashed size={17} className='text-white animate-spin' />
                : isUpdate ? 'Update Vehicle' : 'Save & Continue'
              }
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default page