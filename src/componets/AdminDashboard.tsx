import axios from 'axios'
import { CheckCircle2, Clock, Truck, User, Users, Users2, Video, XCircle } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import Kpi from './Kpi'
import TapButton from './TapButton'
import { AnimatePresence ,motion} from 'motion/react'
import ContentList from './ContentList'


type Stats ={
  totalApprovedPartners:number,
  totalPartners:number,
  totalPendingPartners:number,
  totalRejectedPartners:number,
}

type tab ="partner" |"kyc" |  "vehicle"


function AdminDashboard() {

const [stats,setStats] = useState<Stats | null>()
const [active,setActive] = useState<tab>("partner")
const [partnerReviews, setPartnerReviews] = useState<any[]>([])
const [pendingKyc, setPendingKyc] = useState<any[]>([])
const [vehicleReviews, setVehicleReviews] = useState<any[]>([])

 const handleData = async()=>{
  try {
    const {data} = await axios.get("/api/auth/admin/dashboard")
    setStats(data.stats)
    setPartnerReviews(data.pendingPartnerForReviews)
    setVehicleReviews(data.pendingVehicles)
  } catch (error) {
    console.log(error)
  }
 }

 const handleGetPendingKYC = async()=>{
  try {
    const {data} = await axios.get("/api/auth/admin/video-kyc/pending")
    setPendingKyc(data)

  } catch (error) {
    console.log(error)
  }
 }

  useEffect(()=>{
   handleData()
   handleGetPendingKYC()
  },[])

  return (
    <div className='min-h-screen bg-linear-to-br from-gray-100 to-gray-200'>
      <div className='sticky top-0 bg-white/80 backdrop-blur-lg border-b z-40'>
         <div className='max-w-7xl mx-auto h-16 px-6 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
               <Image src={"/logo.jpg"} alt="" width={44} height={44} priority />
               
            </div>
            <div className='flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-black text-white'>
                   <User size={14} />
                   Admin Dashboard
            </div>
         </div>

      </div>

      <main className='max-w-7xl mx-auto px-6 py-12 space-y-16'>
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-6'>
           <Kpi label="Total Partners" value={stats?.totalPartners} icon={<Users2/>} variant={"totalPartners"}/>
          <Kpi label=" Approved Partners" value={stats?.totalApprovedPartners} icon={<CheckCircle2/>} variant={"approved"} />
          <Kpi label="Pending Partners" value={stats?.totalPendingPartners} icon={<Clock/>}  variant={"pending"}/>
          <Kpi label=" Rejected Partners" value={stats?.totalRejectedPartners} icon={<XCircle/>}  variant={"rejected"}/>
        </div>

        <div className='bg-white rounded-2xl p-2 shadow-lg border border-gray-100 flex flex-wrap gap-2'>
          <TapButton active={active == "partner"} 
          count={partnerReviews.length ?? 0}
           icon={<Users size={15}/>}
           onClick={()=>setActive("partner")}
          >
           Pending Partner Reviews
            </TapButton>

          <TapButton active={active == "kyc"} 
          count={pendingKyc.length ?? 0}
           icon={<Video size={15} />}
           onClick={()=>setActive("kyc")}
          >
          Pending Video KYC 
            </TapButton>

          <TapButton active={active == "vehicle"} 
          count={vehicleReviews.length ?? 0}
           icon={<Truck size= {15} />}
           onClick={()=>setActive("vehicle")}
          >
           Pending Vehicle Reviews
            </TapButton>

        </div>

        <AnimatePresence mode='wait'>
        <motion.div
         key={active}
         initial={{opacity:0,y:16}}
         animate={{opacity:1,y:0}}
         exit={{opacity:0,y:-8}}
         transition={{duration:0.2,ease:"easeOut"}}
         className='space-y-3'
        >
          {active=='partner' && <ContentList data={partnerReviews ?? []} type={"partner"} />}
           {active=='kyc' && <ContentList data={pendingKyc ?? []} type={"kyc"} />}
            {active=='vehicle' && <ContentList data={vehicleReviews ??[]} type={"vehicle"} />}
        </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

export default AdminDashboard
