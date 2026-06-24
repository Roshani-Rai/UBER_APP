"use client"
import React, { useState, useRef } from 'react'
import { AnimatePresence, motion } from "motion/react"
import { CircleDashed, Lock, Mail, User, X } from 'lucide-react'
import Image from 'next/image'
import axios from 'axios'
import { toast } from "react-toastify";
import { signIn } from 'next-auth/react'

type propType = {
  open: boolean,
  onClose: () => void
}

type stepType = "login" | "signup" | "otp"

function AuthModal({ open, onClose }: propType) {
  const [step, setStep] = useState<stepType>("login")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  const clearFields = () => {
    setName("")
    setEmail("")
    setPassword("")
  }

  const clearOtp = () => {
    setOtp(["", "", "", "", "", ""])
    otpRefs.current[0]?.focus()
  }

  const handleOtp = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return
    const updated = [...otp]
    updated[index] = value
    setOtp(updated)

    if (value && index < otp.length - 1) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, otp.length)
    if (!pasted) return

    const updated = [...otp]
    pasted.split("").forEach((char, i) => {
      updated[i] = char
    })
    setOtp(updated)

    const nextIndex = pasted.length < otp.length ? pasted.length : otp.length - 1
    otpRefs.current[nextIndex]?.focus()
  }

  const handleVerifyOtp = async () => {
  const code = otp.join("")
  if (code.length < 6) {
    toast.error("Please enter the complete 6-digit code")
    return
  }
  try {
    setLoading(true)
    const { data } = await axios.post("/api/auth/verify-email", {
      email,
      otp: code, // <-- was `code`, now matches the API's expected key
    })
    if (data.success) {
      toast.success(data.message || "Verified successfully")
      clearOtp()
      setEmail("")
      setStep("login")
    } else {
       clearOtp()
      toast.error(data.message || "Invalid code, please try again")
    }
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      toast.error(error.response?.data?.message || "Something went wrong")
    } else {
      toast.error("Something went wrong")
    }
  } finally {
    setLoading(false)
  }
}
  const handleGoogle = async () => {
    await signIn("google")
  }

  const handleStepChange = (newStep: stepType) => {
    clearFields()
    setStep(newStep)
  }
const handleLogin = async () => {
  if (!email || !password) {
    toast.error("Please fill in all fields")
    return
  }
  try {
    setLoading(true)
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (res?.error) {
      // ✅ Check error first — not just ok
      toast.error("Invalid email or password")
      return
    }

    if (res?.ok) {
      toast.success("Login successfully!!")
      clearFields()
      onClose()
    }

  } catch (error) {
    toast.error("Something went wrong")
  } finally {
    setLoading(false)
  }
}
  const handleSignUp = async () => {
    if (!name || !email || !password) {
      toast.error("Please fill in all fields")
      return
    }
    try {
      setLoading(true)
      const { data } = await axios.post("/api/auth/register", {
        name, email, password
      })
      if (data.success) {
        setStep("otp")
      } else {
        toast.error(data.message || "Unexpected error, please try again")
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Something went wrong")
      } else {
        toast.error("Something went wrong")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className='fixed inset-0 z-[90] bg-black/80 backdrop-blur-md flex items-center justify-center px-4'
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className='relative w-full max-w-md rounded-3xl bg-white border border-black/10 shadow-[0_40px_100px_rgba(0,0,0,0.35)] p-6 sm:p-8'
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className='absolute right-4 top-5 font-bold text-black hover:text-black transition'
            >
              <X size={20} />
            </button>

            <div className='mb-6 text-center'>
              <h1 className='text-3xl font-extrabold tracking-widest'>RYDEX</h1>
              <p className='mt-1 text-xs text-gray-500'>Premium Vehicle Booking</p>
            </div>

            {step !== "otp" && (
              <>
                <button
                  type="button"
                  onClick={handleGoogle}
                  className='w-full h-11 rounded-xl border border-black/20 flex items-center justify-center gap-3 text-sm font-semibold hover:bg-black hover:text-white transition'
                >
                  <Image src={"/google.png"} alt="Google" width={20} height={20} />
                  Continue with Google
                </button>

                <div className='flex items-center gap-4 my-6'>
                  <div className='flex-1 h-px bg-black/10' />
                  <div className='text-xs text-gray-500'>Or</div>
                  <div className='flex-1 h-px bg-black/10' />
                </div>
              </>
            )}

            <AnimatePresence mode="wait">
              {step === "login" && (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className='space-y-4'
                >
                  <h2 className='text-lg text-center font-bold'>Welcome Back</h2>

                  <div className='relative'>
                    <Mail size={18} className='absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400' />
                    <input
                      type="email"
                      placeholder="Email"
                      aria-label="Email"
                      onChange={(e) => setEmail(e.target.value)}
                      value={email}
                      className='w-full h-11 rounded-xl border border-black/20 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-black/10'
                    />
                  </div>

                  <div className='relative'>
                    <Lock size={18} className='absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400' />
                    <input
                      type="password"
                      placeholder="Password"
                      aria-label="Password"
                      onChange={(e) => setPassword(e.target.value)}
                      value={password}
                      className='w-full h-11 rounded-xl border border-black/20 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-black/10'
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleLogin}
                    disabled={loading}
                    className='w-full flex justify-center items-center cursor-pointer h-11 rounded-xl bg-black text-white text-sm font-semibold hover:bg-black/90 transition disabled:opacity-60 disabled:cursor-not-allowed'
                  >
                    {!loading ? "Login" : <CircleDashed size={18} className='text-white animate-spin' />}
                  </button>

                  <p className='text-center text-xs text-gray-500'>
                    Don&apos;t have an account?{" "}
                    <span
                      onClick={() => handleStepChange("signup")}
                      className='font-semibold text-black cursor-pointer hover:underline'
                    >
                      Create an account
                    </span>
                  </p>
                </motion.div>
              )}

              {step === "signup" && (
                <motion.div
                  key="signup"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className='space-y-4'
                >
                  <h2 className='text-lg text-center font-bold'>Create your account</h2>

                  <div className='relative'>
                    <User size={18} className='absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400' />
                    <input
                      type="text"
                      placeholder="Full name"
                      aria-label="Full name"
                      onChange={(e) => setName(e.target.value)}
                      value={name}
                      className='w-full h-11 rounded-xl border border-black/20 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-black/10'
                    />
                  </div>

                  <div className='relative'>
                    <Mail size={18} className='absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400' />
                    <input
                      type="email"
                      placeholder="Email"
                      aria-label="Email"
                      onChange={(e) => setEmail(e.target.value)}
                      value={email}
                      className='w-full h-11 rounded-xl border border-black/20 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-black/10'
                    />
                  </div>

                  <div className='relative'>
                    <Lock size={18} className='absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400' />
                    <input
                      type="password"
                      placeholder="Password"
                      aria-label="Password"
                      onChange={(e) => setPassword(e.target.value)}
                      value={password}
                      className='w-full h-11 rounded-xl border border-black/20 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-black/10'
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSignUp}
                    disabled={loading}
                    className='w-full h-11 cursor-pointer rounded-xl bg-black text-white text-sm font-semibold hover:bg-black/90 transition flex justify-center items-center disabled:opacity-60 disabled:cursor-not-allowed'
                  >
                    {!loading ? "Send otp" : <CircleDashed size={18} className='text-white animate-spin' />}
                  </button>

                  <p className='text-center text-xs text-gray-500'>
                    Already have an account?{" "}
                    <span
                      onClick={() => handleStepChange("login")}
                      className='font-semibold text-black cursor-pointer hover:underline'
                    >
                      Log in
                    </span>
                  </p>
                </motion.div>
              )}

              {step === "otp" && (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className='space-y-4'
                >
                  <h2 className='text-lg font-bold text-center'>Verify your email</h2>
                  <p className='text-center text-xs text-gray-500'>
                    Enter the 6-digit code we sent to {email || "your email"}
                  </p>
                  <div className='flex justify-center gap-2'>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { otpRefs.current[i] = el }}
                        value={digit}
                        onChange={(e) => handleOtp(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        onPaste={handleOtpPaste}
                        maxLength={1}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        aria-label={`Digit ${i + 1}`}
                        className='w-10 h-12 rounded-xl border border-black/20 text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-black/10'
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={loading}
                    className='w-full flex justify-center items-center cursor-pointer h-11 rounded-xl bg-black text-white text-sm font-semibold hover:bg-black/90 transition disabled:opacity-60 disabled:cursor-not-allowed'
                  >
                    {!loading ? "Verify and create account" : <CircleDashed size={18} className='text-white animate-spin' />}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AuthModal