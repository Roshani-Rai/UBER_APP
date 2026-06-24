"use client"
import React, { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, CreditCard, Landmark, Phone, QrCode, Clock, CircleDashed } from 'lucide-react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { setUserData } from '@/redux/userSlice'

function page() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { userData } = useSelector((state: RootState) => state.user)

  const [accountHolder, setAccountHolder] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [ifsc, setIfsc] = useState("")
  const [phone, setPhone] = useState("")
  const [upiId, setUpiId] = useState("")
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  // ✅ Fetch existing bank data on mount
  useEffect(() => {
    const fetchBank = async () => {
      try {
        const { data } = await axios.get("/api/auth/partner/onboarding/bank")
        if (data.success && data.partnerBank) {
          setAccountHolder(data.partnerBank.accountHolder || "")
          setAccountNumber(data.partnerBank.accountNumber || "")
          setIfsc(data.partnerBank.ifsc || "")
          setUpiId(data.partnerBank.upi || "")
        }
        // ✅ phone is stored on user model not partnerBank
        if (userData?.mobileNumber) {
          setPhone(userData.mobileNumber)
        }
      } catch (error) {
        console.log(error)
      } finally {
        setFetching(false)
      }
    }
    fetchBank()
  }, [])

  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/
  const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/

  const sanitizeIfsc = ifsc.trim().toUpperCase()
  const isNameValid = accountHolder.trim().length >= 3
  const isAccountValid = accountNumber.trim().length >= 9
  const isIfscValid = ifscRegex.test(sanitizeIfsc)
  const isMobileValid = phone.trim().length === 10
  const isUpiValid = upiId.trim() === "" || upiRegex.test(upiId.trim())

  const canContinue = isNameValid && isAccountValid && isIfscValid && isMobileValid && isUpiValid

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const fieldClass = (isValid: boolean, field: string, isEmpty: boolean) => {
    const base = 'w-full rounded-xl border pl-10 pr-4 py-3 text-sm text-black placeholder:text-gray-400 outline-none transition'
    if (!touched[field] || isEmpty) return `${base} border-gray-200 focus:border-black focus:ring-2 focus:ring-black/10`
    if (!isValid) return `${base} border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-red-50`
    return `${base} border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-100`
  }

  const ErrorMsg = ({ show, message }: { show: boolean; message: string }) =>
    show ? <p className='text-xs text-red-500 mt-1 ml-1'>{message}</p> : null

  const handleSubmit = async () => {
    setTouched({
      accountHolder: true,
      accountNumber: true,
      ifsc: true,
      phone: true,
      upiId: true,
    })

    if (!canContinue) return

    setLoading(true)
    try {
      const { data } = await axios.post("/api/auth/partner/onboarding/bank", {
        accountHolder,
        accountNumber,
        ifsc,
        mobileNumber: phone,
        upi: upiId,
      })

      if (data?.success === false) {
        toast.error(data.message)
        return
      }

      toast.success("Bank details saved successfully")
      dispatch(setUserData({
        ...userData,
        partnerStep: 4,
        mobileNumber: phone,  // ✅ update phone in redux too
      }))

    } catch (error: any) {
      console.log(error)
      toast.error(error?.response?.data?.message || "Something went wrong")
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

          <p className='text-xs text-gray-500 font-medium'>Step 3 of 3</p>
          <h1 className='text-2xl font-bold mt-1 text-black'>Bank & Payout Setup</h1>
          <p className='text-sm text-gray-500 mt-2'>Used for partner payouts</p>

          <div className='flex gap-1.5 justify-center mt-4'>
            {[0, 1, 2].map((i) => (
              <div key={i} className='h-1.5 w-8 rounded-full bg-black' />
            ))}
          </div>
        </div>

        <div className='mt-8 space-y-5'>

          {/* Account Holder */}
          <div>
            <label className='block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide'>
              Account Holder Name
            </label>
            <div className='relative'>
              <User size={16} className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
              <input
                type="text"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                onBlur={() => handleBlur("accountHolder")}
                placeholder="As per bank records"
                className={fieldClass(isNameValid, "accountHolder", accountHolder.trim() === "")}
              />
            </div>
            <ErrorMsg
              show={touched.accountHolder && accountHolder.trim() !== "" && !isNameValid}
              message="Name must be at least 3 characters"
            />
          </div>

          {/* Account Number */}
          <div>
            <label className='block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide'>
              Account Number
            </label>
            <div className='relative'>
              <CreditCard size={16} className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
              <input
                type="text"
                inputMode="numeric"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                onBlur={() => handleBlur("accountNumber")}
                placeholder="e.g. 123456789012"
                className={fieldClass(isAccountValid, "accountNumber", accountNumber.trim() === "")}
              />
            </div>
            <ErrorMsg
              show={touched.accountNumber && accountNumber.trim() !== "" && !isAccountValid}
              message="Account number must be at least 9 digits"
            />
          </div>

          {/* IFSC */}
          <div>
            <label className='block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide'>
              IFSC Code
            </label>
            <div className='relative'>
              <Landmark size={16} className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
              <input
                type="text"
                value={ifsc}
                onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                onBlur={() => handleBlur("ifsc")}
                placeholder="e.g. SBIN0001234"
                className={fieldClass(isIfscValid, "ifsc", ifsc.trim() === "")}
              />
            </div>
            <ErrorMsg
              show={touched.ifsc && ifsc.trim() !== "" && !isIfscValid}
              message="Invalid IFSC code (e.g. SBIN0001234)"
            />
          </div>

          {/* Phone */}
          <div>
            <label className='block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide'>
              Phone Number
            </label>
            <div className='relative'>
              <Phone size={16} className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                onBlur={() => handleBlur("phone")}
                placeholder="e.g. 9876543210"
                className={fieldClass(isMobileValid, "phone", phone.trim() === "")}
              />
            </div>
            <ErrorMsg
              show={touched.phone && phone.trim() !== "" && !isMobileValid}
              message="Enter a valid 10 digit mobile number"
            />
          </div>

          {/* UPI */}
          <div>
            <label className='block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide'>
              UPI ID <span className='font-normal text-gray-400'>(optional)</span>
            </label>
            <div className='relative'>
              <QrCode size={16} className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                onBlur={() => handleBlur("upiId")}
                placeholder="e.g. name@okaxis"
                className={fieldClass(isUpiValid, "upiId", upiId.trim() === "")}
              />
            </div>
            <ErrorMsg
              show={touched.upiId && upiId.trim() !== "" && !isUpiValid}
              message="Invalid UPI ID format (e.g. name@okaxis)"
            />
          </div>

          <div className='flex items-center justify-center gap-2 text-center text-xs text-gray-500 pt-1'>
            <Clock size={14} className='shrink-0' />
            <span>Bank details are verified before your first payout. This usually takes 24–48 hours.</span>
          </div>

          <motion.button
            type="button"
            disabled={loading}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            className={`w-full flex items-center justify-center rounded-xl py-3 text-xs font-semibold transition-colors ${
              canContinue
                ? 'bg-black text-white hover:bg-gray-900'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? <CircleDashed size={16} className='text-white animate-spin' /> : "Save Changes"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}

export default page