"use client"
import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from "motion/react"
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import AuthModal from './AuthModal'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { Bike, Car, ChevronRight, LogOut, Menu, Truck, X, FileText } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { setUserData } from '@/redux/userSlice'
import { toast } from 'react-toastify'
import axios from 'axios'
import { setUncaughtExceptionCaptureCallback } from 'process'
import { getSocket } from '@/app/lib/socket'


function Nav() {
  const { userData } = useSelector((state: RootState) => state.user)
  const [open, setOpen] = useState(false)
  const [profile, setProfile] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
 const [count,setCount]=useState(0)
  const router = useRouter()
  const pathname = usePathname()
  const navitem = ["Home", "Bookings", "About Us", "Contact Us"]
  const dispatch = useDispatch()
  
  const handleLogout = async () => {
    try {
      await signOut({ redirect: false })
      toast.success("Logout successfully!!")
      dispatch(setUserData(null))
      setProfile(false)
      setMobileOpen(false)
    } catch (error) {
      toast.error("Something went wrong")
    }
  }

  const fetchCount = async()=>{
    try {
      const {data,status} = await axios.get('/api/auth/partner/bookings/pending-requests')
      
        console.log(data)
        setCount(data)
       
    } catch (error) {
      console.log(error)
    }
  }


  
    useEffect(()=>{
      const socket = getSocket()
      socket.on('new-booking',(data)=>{
        setCount(prev=>prev+1)
      })
      return ()=>{
        socket.off('new-booking')
      }
  
    })

  useEffect(()=>{
    if(userData?.role == 'partner')
      fetchCount()
  },[userData?.role=='partner'])
  // ✅ Check if user has completed onboarding (partnerStep >= 3)
  const isPartnerComplete = userData?.partnerStep! >= 1

  return (
    <>
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`fixed top-3 left-1/2 -translate-x-1/2 w-[94%] md:w-[86%] z-50 rounded-full bg-[#0B0B0B] text-white shadow-[0_15px_50px_rgba(0,0,0,0.7)] py-3`}
      >
        <div className='max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between'>
          <Image src={"/logo.jpg"} alt="" width={44} height={44} />

          <div className='hidden md:flex items-center gap-10'>
            {userData?.role =='partner' ?(
              <>
              <Link href={'/'} className='relative text-sm font-medium text-gray-300 hover:text-white transition'>Home</Link>
              <Link href={'/partner/pending-requests'} className='relative text-sm font-medium text-gray-300 hover:text-white transition'>Pending Requests
              <span className='absolute -top-2 -right-5 w-5 h-5 bg-white text-black text-xs rounded-full flex items-center justify-center font-bold'>{count ?? 0}</span>
              </Link>
              <Link href={'/partner/bookings'} className='relative text-sm font-medium text-gray-300 hover:text-white transition'>Booking</Link>
              <Link href={'/partner/active-ride'} className='relative text-sm font-medium text-gray-300 hover:text-white transition'>Active Rides</Link>
              </>
            ):
             navitem.map((i, index) => {
              const href = i === "Home" ? "/" : `/user/${i.toLowerCase()}`
              const active = href === pathname
              return (
                <Link
                  key={index}
                  href={href}
                  className={`text-sm pl-2 font-medium transition ${
                    active ? "text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  {i}
                </Link>
              )
            })}
            
           
          </div>

          <div className='flex items-center gap-3'>
            <div className='relative'>
              {!userData ? (
                <button
                  className='px-4 py-1.5 pb-2 text-semibold rounded-full bg-white text-black text-sm'
                  onClick={() => setOpen(true)}
                >
                  Login
                </button>
              ) : (
                <>
                  <button
                    className='w-11 h-11 rounded-full bg-white text-black font-bold'
                    onClick={() => setProfile((prev) => !prev)}
                  >
                    {userData.name.charAt(0).toUpperCase()}
                  </button>

                  <AnimatePresence>
                    {profile && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className='absolute top-14 right-0 w-[280px] sm:w-[300px] bg-white text-black rounded-2xl shadow-xl border'
                      >
                        <div className='p-5'>
                          <p className='font-semibold text-lg'>{userData.name}</p>
                          <p className='px-1 text-xs uppercase text-gray-500 mb-4'>{userData.role}</p>

                          {/* ✅ Show based on partner completion */}
                          {userData.role !== 'admin' && (
                            <>
                              {isPartnerComplete ? (
                                // ✅ Show View & Update Details
                                <div
                                  className='w-full flex items-center gap-3 py-3 px-2 hover:bg-gray-100 hover:cursor-pointer rounded-xl'
                                  onClick={() => {
                                    router.push("/partner/onboarding/vehicle")
                                    setProfile(false)
                                  }}
                                >
                                  <div className='w-6 h-6 rounded-full bg-black text-white flex items-center justify-center'>
                                    <FileText size={14} />
                                  </div>
                                  <span className='text-sm font-medium'>View & Update Details</span>
                                  <ChevronRight size={16} className='ml-auto' />
                                </div>
                              ) : (
                                // ✅ Show Become a Partner
                                <div
                                  className='w-full flex items-center gap-3 py-3 hover:bg-gray-200 hover:cursor-pointer hover:font-bold rounded-xl'
                                  onClick={() => {
                                    router.push("/partner/onboarding/vehicle")
                                    setProfile(false)
                                  }}
                                >
                                  <div className='flex -space-x-2'>
                                    <div className='w-6 h-6 rounded-full bg-black text-white flex items-center justify-center'><Car size={14} /></div>
                                    <div className='w-6 h-6 rounded-full bg-black text-white flex items-center justify-center'><Bike size={14} /></div>
                                    <div className='w-6 h-6 rounded-full bg-black text-white flex items-center justify-center'><Truck size={14} /></div>
                                  </div>
                                  Become a Partner
                                  <ChevronRight size={16} />
                                </div>
                              )}
                            </>
                          )}

                          <button
                            className='px-3 w-full flex items-center gap-3 py-3 hover:bg-gray-200 font-bold rounded-xl mt-2'
                            onClick={handleLogout}
                          >
                            <LogOut size={16} />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>

            <button
              className='md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-white text-black'
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='fixed inset-0 bg-black/60 z-[55] md:hidden'
              onClick={() => setMobileOpen(false)}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className='fixed top-0 right-0 h-full w-[80%] max-w-sm bg-[#0B0B0B] text-white z-[60] md:hidden flex flex-col'
            >
              <div className='flex items-center justify-between p-5 border-b border-white/10'>
                <Image src={"/logo.jpg"} alt="" width={36} height={36} />
                <button
                  className='w-9 h-9 flex items-center justify-center rounded-full bg-white text-black'
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              <div className='flex flex-col p-5 gap-1'>
                {navitem.map((i, index) => {
                  const href = i === "Home" ? "/" : `/user/${i.toLowerCase()}`
                  const active = href === pathname
                  return (
                    <Link
                      key={index}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={`text-base py-3 px-2 rounded-xl transition ${
                        active ? "text-white bg-white/10" : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {i}
                    </Link>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AuthModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}

export default Nav