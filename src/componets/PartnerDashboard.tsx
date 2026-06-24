"use client"
import React, { useEffect, useState } from 'react'
import { motion } from "motion/react"
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { useRouter } from 'next/navigation'
import { Check, Clock, Lock, Video } from 'lucide-react'
import RejectionCard from './RejectionCard'
import StatusCard from './StatusCard'
import ActionCard from './ActionCard'

type Step = {
  id: number
  title: string
  desc: string
  route?: string
}

const STEPS: Step[] = [
  { id: 1, title: "Vehicle",      desc: "Add your vehicle type, number and model",  route: "/partner/onboarding/vehicle" },
  { id: 2, title: "Documents",    desc: "Upload Aadhar, Driving Licence and RC",    route: "/partner/onboarding/documents" },
  { id: 3, title: "Bank",         desc: "Set up your bank account for payouts",     route: "/partner/onboarding/bank" },
  { id: 4, title: "Review",       desc: "Our team will review your profile" },
  { id: 5, title: "Video KYC",    desc: "Complete a quick video verification" },
  { id: 6, title: "Pricing",      desc: "Choose your pricing plan" },
  { id: 7, title: "Final Review", desc: "Final review before going live" },
  { id: 8, title: "Live",         desc: "Your account is activated!" },
]

function PartnerDashboard() {
  const [activeStep, setActiveStep] = useState(1)
  const { userData } = useSelector((state: RootState) => state.user)
  const router = useRouter()

  useEffect(() => {
    if (userData) setActiveStep(userData.partnerStep || 1)
  }, [userData])

  const handleStepClick = (s: Step) => {
    if (s.route) router.push(s.route)
  }

  // ✅ Fix: activeStep is 1-based, STEPS array is 0-indexed, so subtract 1
  const currentStep = STEPS[activeStep - 1]

  return (
    <div className='min-h-screen bg-gray-50 px-4 pt-28 pb-20'>
      <div className='max-w-4xl mx-auto space-y-8'>

        {/* Header */}
        <div className='flex items-center justify-between flex-wrap gap-3'>
          <div>
            <p className='text-sm text-gray-500'>Partner onboarding</p>
            <h1 className='text-3xl font-bold text-black mt-1'>Complete your setup</h1>
          </div>
          <span className='flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-yellow-100 text-yellow-800'>
            <Clock size={13} />
            In progress
          </span>
        </div>

        {/* Steps bar */}
        <div className='bg-white rounded-3xl border border-gray-200 p-8 overflow-x-auto'>
          <div className='flex items-start min-w-[600px]'>
            {STEPS.map((s, i) => {
              // ✅ Fix: done = steps before current, active = current step (no +1)
              const done = s.id < activeStep
              const active = s.id === activeStep
              const clickable = done && !!s.route

              return (
                <div
                  key={s.id}
                  className={`flex flex-col items-center flex-1 ${clickable ? 'cursor-pointer group' : 'cursor-default'}`}
                  onClick={() => clickable && handleStepClick(s)}
                >
                  <div className='flex items-center w-full'>
                    {/* Left line */}
                    {i > 0 && (
                      <div className={`flex-1 h-[2px] -mt-0.5 transition-all ${done || active ? 'bg-black' : 'bg-gray-200'}`} />
                    )}

                    {/* Circle */}
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-medium border-2 flex-shrink-0 transition-all ${
                      done
                        ? 'bg-black border-black text-white group-hover:bg-gray-700 group-hover:border-gray-700'
                        : active
                        ? 'border-black text-black bg-white ring-4 ring-black/10'
                        : 'border-gray-200 text-gray-300 bg-gray-50'
                    }`}>
                      {done
                        ? <Check size={16} />
                        : active
                        ? s.id
                        : <Lock size={13} />
                      }
                    </div>

                    {/* Right line */}
                    {i < STEPS.length - 1 && (
                      <div className={`flex-1 h-[2px] -mt-0.5 transition-all ${done ? 'bg-black' : 'bg-gray-200'}`} />
                    )}
                  </div>

                  {/* Label */}
                  <p className={`text-[11px] mt-2 text-center whitespace-nowrap transition-all ${
                    done || active ? 'text-black font-medium' : 'text-gray-300'
                  }`}>
                    {s.title}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        
       {
        userData?.partnerStep==4 && userData ?.partnerStatus==="pending" && (
          <StatusCard 
             icon ={<Clock size={18} />}
             title={"Waiting for Admin "}
             desc={"Admin will review your documents shortly."}
            />
        )
       }

        {
          userData?.partnerStep==4 && userData ?.partnerStatus==="rejected" && (
            <RejectionCard 
            title="Partner Rejected"
            reason={userData.rejectionReason}
            actionLabel ={`Review and  Update`}
            onAction={()=>{
              router.push("/partner/onboarding/vehicle")
            }}
            />
          )
        }

        {
          userData?.partnerStep ==5 && userData?.partnerStatus === "approved" &&(
            <StatusCard 
             icon ={<Check size={18} />}
             title={"Partner Details approved "}
             desc={"Partner Details approved successfully by our team and now procced next steps"}
            />
          )
        }

        {
          userData?.partnerStep == 6 &&  userData?.videoKycStatus === "approved" ?(
             <StatusCard 
             icon ={<Check size={18} />}
             title={"Video kyc approved "}
             desc={"Video KYC approved successfully by our team .You can now proceed to pricing"}
            />
          ):userData?.partnerStep == 5 && userData?.videoKycStatus === "rejected" ?(
            <RejectionCard 
            title="Video KYC Rejected"
            reason={userData.videoKycRejectionReason}
            actionLabel ={`Request Again`}
            onAction={()=>{
              router.push("")
            }}
            />
          ):userData?.partnerStep == 5 && userData?.videoKycStatus === "in_progress" && userData.videoKycRoomId ?(
           <ActionCard
            icon={<Video size={18} />}
            title={"Admin Started Video KYC"}
            button={"Join Call"}
            onClick={()=>router.push(`video-kyc/${userData.videoKycRoomId}`)}
           />
          ):(
             <StatusCard 
             icon ={<Clock size={18} />}
             title={"Waiting for Admin "}
             desc={"Admin will initiate Video KYC shortly."}
            />
          )
        }
      </div>
    </div>
  )
}

export default PartnerDashboard