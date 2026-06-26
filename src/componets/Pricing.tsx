"use client"
import { AnimatePresence, motion } from 'motion/react'
import { IVehicle } from '@/app/modals/vehicle.modals'
import React, { useRef, useState, useEffect } from 'react'
import { ImagePlus, X, Car, IndianRupee, Clock, Gauge, CircleDashed, CheckCircle2, Bike } from 'lucide-react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { setUserData } from '@/redux/userSlice'

type Props = {
  open: boolean
  onClose: (a: boolean) => void
  data: IVehicle | null
}

function Pricing({ open, onClose, data }: Props) {
  const dispatch = useDispatch()
  const { userData } = useSelector((state: RootState) => state.user)

  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [baseFare, setBaseFare] = useState('')
  const [pricePerKm, setPricePerKm] = useState('')
  const [waitingCharge, setWaitingCharge] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [isUpdate, setIsUpdate] = useState(false)  
  const inputRef = useRef<HTMLInputElement>(null)

  // ✅ Fetch existing pricing when modal opens
  useEffect(() => {
    if (!open) return
    const fetchPricing = async () => {
      setFetching(true)
      try {
        const { data: res } = await axios.get('/api/auth/partner/onboarding/pricing')
        if (res?.success && res?.vehicle) {
          const v = res.vehicle
          if (v.pricingUpdated) {
            setBaseFare(v.baseFare?.toString() || '')
            setPricePerKm(v.pricePerKm?.toString() || '')
            setWaitingCharge(v.waitingCharge?.toString() || '')
            if (v.imageUrl) setPreview(v.imageUrl)
            setIsUpdate(true)  // ✅ already has pricing
          }
        }
      } catch {
        // no pricing yet, ignore
      } finally {
        setFetching(false)
      }
    }
    fetchPricing()
  }, [open])  // ✅ runs every time modal opens

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setImage(file)
    if (file) setPreview(URL.createObjectURL(file))
  }

  // ✅ on update: image optional (keep existing), on first submit: image required
  const canSubmit = isUpdate
  ? !!(image || baseFare || pricePerKm || waitingCharge)  // at least one
  : !!(image && baseFare && pricePerKm && waitingCharge) 

  const handleSubmit = async () => {
    if (!canSubmit) {
      toast.error(isUpdate ? "Please fill all fields" : "Please fill all fields and upload a vehicle photo")
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      if (image) formData.append('image', image as File)  // ✅ only append if new image selected
      formData.append('baseFare', baseFare)
      formData.append('pricePerKm', pricePerKm)
      formData.append('waitingCharge', waitingCharge)

      const { data: res } = await axios.post('/api/auth/partner/onboarding/pricing', formData)

      if (res?.success === false) {
        toast.error(res.message)
        return
      }

      toast.success(isUpdate ? "Pricing updated successfully!" : "Pricing saved successfully!")
      dispatch(setUserData({ ...userData, partnerStep: Math.max(userData?.partnerStep ?? 0, 7) }))
      onClose(false)

    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  // ✅ reset state when modal closes
  const handleClose = () => {
    setImage(null)
    setPreview(null)
    setBaseFare('')
    setPricePerKm('')
    setWaitingCharge('')
    setIsUpdate(false)
    onClose(false)
  }

  const model = data?.type
 

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 px-0 sm:px-4'
        >
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className='bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col'
          >
            {/* Header */}
            <div className='flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 flex-shrink-0'>
              <div>
                <h2 className='text-lg font-bold text-black'>
                  {isUpdate ? 'Update Pricing' : 'Pricing & Vehicle Image'}
                </h2>
                <p className='text-xs text-gray-400 mt-0.5'>
                  {isUpdate ? 'Update your fare or vehicle photo' : 'Set your fare and upload vehicle photo'}
                </p>
              </div>
              <button
                onClick={handleClose}
                className='w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition'
              >
                <X size={15} />
              </button>
            </div>

            {/* Loading state */}
            {fetching ? (
              <div className='flex-1 flex items-center justify-center py-16'>
                <CircleDashed size={28} className='animate-spin text-gray-400' />
              </div>
            ) : (
              <>
                {/* Scrollable body */}
                <div className='overflow-y-auto flex-1 px-6 py-5 space-y-5'>

                  {/* Already submitted badge */}
                  {isUpdate && (
                    <div className='flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-50 border border-green-100 text-green-700 text-xs font-medium'>
                      <CheckCircle2 size={14} />
                      Pricing already submitted — you can update below
                    </div>
                  )}

                  {/* Vehicle info pill */}
                  {data && (
                    <div className='flex items-center gap-3 px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100'>
                      <div className='w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center flex-shrink-0'>
                        <Bike size={16} />
                      </div>
                      <div>
                        <p className='text-sm font-semibold text-black'>{(data as any).number ?? 'Vehicle'}</p>
                        <p className='text-xs text-gray-400'>{(data as any).type ?? ''}</p>
                      </div>
                    </div>
                  )}

                  {/* Image upload */}
                  <div>
                    <p className='text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide'>
                      Vehicle Photo {isUpdate && <span className='normal-case text-gray-400 font-normal'>(optional — keep existing if not changed)</span>}
                    </p>
                    <button
                      type='button'
                      onClick={() => inputRef.current?.click()}
                      className={`w-full rounded-2xl border-2 border-dashed overflow-hidden transition-all ${
                        preview ? 'border-black' : 'border-gray-200 hover:border-black'
                      }`}
                    >
                      {preview ? (
                        <div className='relative w-full h-44'>
                          <img src={preview} alt='Vehicle' className='w-full h-full object-cover' />
                          <div className='absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition'>
                            <p className='text-white text-xs font-semibold'>Change Photo</p>
                          </div>
                        </div>
                      ) : (
                        <div className='flex flex-col items-center justify-center gap-2 py-10 text-gray-400'>
                          <ImagePlus size={28} strokeWidth={1.5} />
                          <p className='text-sm font-medium'>Upload vehicle photo</p>
                          <p className='text-xs text-gray-300'>JPG, PNG up to 5MB</p>
                        </div>
                      )}
                    </button>
                    <input
                      ref={inputRef}
                      type='file'
                      accept='image/*'
                      className='hidden'
                      onChange={handleImage}
                    />
                  </div>

                  {/* Pricing fields */}
                  <div>
                    <p className='text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide'>Fare Details</p>
                    <div className='space-y-3'>

                      <div className='flex items-center gap-3 px-4 py-3 rounded-2xl border border-gray-200 focus-within:border-black transition'>
                        <div className='w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0'>
                          <IndianRupee size={14} className='text-gray-500' />
                        </div>
                        <div className='flex-1'>
                          <p className='text-[12px] text-gray-400 font-medium'>Base Fare</p>
                          <input
                            type='number'
                            placeholder='e.g. 50'
                            value={baseFare}
                            onChange={e => setBaseFare(e.target.value)}
                            className='w-full text-sm font-semibold text-black outline-none placeholder:text-gray-300 bg-transparent'
                          />
                        </div>
                        <span className='text-xs text-gray-400'>₹</span>
                      </div>

                      <div className='flex items-center gap-3 px-4 py-3 rounded-2xl border border-gray-200 focus-within:border-black transition'>
                        <div className='w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0'>
                          <Gauge size={14} className='text-gray-500' />
                        </div>
                        <div className='flex-1'>
                          <p className='text-[12px] text-gray-400 font-medium'>Price per KM</p>
                          <input
                            type='number'
                            placeholder='e.g. 12'
                            value={pricePerKm}
                            onChange={e => setPricePerKm(e.target.value)}
                            className='w-full text-sm font-semibold text-black outline-none placeholder:text-gray-300 bg-transparent'
                          />
                        </div>
                        <span className='text-xs text-gray-400'>₹/km</span>
                      </div>

                      <div className='flex items-center gap-3 px-4 py-3 rounded-2xl border border-gray-200 focus-within:border-black transition'>
                        <div className='w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0'>
                          <Clock size={14} className='text-gray-500' />
                        </div>
                        <div className='flex-1'>
                          <p className='text-[12px] text-gray-400 font-medium'>Waiting Charge</p>
                          <input
                            type='number'
                            placeholder='e.g. 2'
                            value={waitingCharge}
                            onChange={e => setWaitingCharge(e.target.value)}
                            className='w-full text-sm font-semibold text-black outline-none placeholder:text-gray-300 bg-transparent'
                          />
                        </div>
                        <span className='text-xs text-gray-400'>₹/min</span>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className='px-6 py-4 border-t border-gray-100 flex-shrink-0 flex gap-3'>
                  <button
                    type='button'
                    onClick={handleClose}
                    className='flex-1 py-3 rounded-2xl border border-gray-200 text-black text-sm font-semibold hover:bg-gray-100 active:scale-95 transition-all'
                  >
                    Cancel
                  </button>
                  <button
                    type='button'
                    onClick={handleSubmit}
                    disabled={!canSubmit || loading}
                    className={`flex-1 py-3 rounded-2xl text-sm font-semibold active:scale-95 transition-all flex items-center justify-center ${
                      canSubmit && !loading
                        ? 'bg-black text-white hover:bg-gray-900'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {loading
                      ? <CircleDashed size={17} className='animate-spin' />
                      : isUpdate ? 'Update Pricing' : 'Save & Continue'
                    }
                  </button>
                </div>
              </>
            )}

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Pricing