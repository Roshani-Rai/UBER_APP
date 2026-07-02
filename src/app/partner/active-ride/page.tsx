'use client'

import { IBooking, PaymentStatus } from '@/app/modals/booking.modals'
import LiveRideMap from '@/componets/LiveRideMap'
import PanelContent from '@/componets/PanelContent'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { BookingStatus } from '@/app/modals/booking.modals';

const MAP_STATUS:Record<BookingStatus,"arriving" | "ongoing" | "completed" >={
    requested: "arriving",
    idle:"arriving",
    awaiting_payment:"arriving",
    confirmed:"arriving",
    started:"ongoing",
    completed:"completed" ,
    cancelled:"completed" ,
    rejected:"completed" ,
    expired:"completed" ,
}

const STATUS_LABEL: Record<BookingStatus, { label: string; sublabel: string; dot: string }> = {
    requested:        { label: "Awaiting Confirmation", sublabel: "Booking is being processed", dot: "bg-amber-400" },
    idle:              { label: "Idle",                  sublabel: "Waiting for a ride",          dot: "bg-zinc-400" },
    awaiting_payment: { label: "Payment Pending",        sublabel: "Customer payment is pending", dot: "bg-purple-400" },
    confirmed:        { label: "Heading to Pickup",      sublabel: "Drive to the pickup location", dot: "bg-amber-400" },
    started:          { label: "Ride in Progress",       sublabel: "Heading to drop location",    dot: "bg-emerald-400" },
    completed:        { label: "Ride Completed",         sublabel: "Trip has ended successfully", dot: "bg-zinc-400" },
    cancelled:        { label: "Ride Cancelled",         sublabel: "This ride was cancelled",     dot: "bg-red-400" },
    rejected:         { label: "Ride Rejected",          sublabel: "Ride was rejected",           dot: "bg-red-400" },
    expired:          { label: "Request Expired",        sublabel: "Booking timed out",           dot: "bg-orange-400" },
}
const PAYMENT_BADGE:Record<PaymentStatus,{label:string;cls:string}>={
  pending:{label:"Pending",cls:"bg-amber-100 text-amber-700"},
  paid:{label:"Paid",cls:"bg-emerald-100 text-emerald-700"},
  cash:{label:"Cash",cls:"bg-zinc-100 text-zinc-700"},
  failed:{label:"Failed",cls:"bg-red-100 text-red-700"},
  
}
function Page() {
const [loading,setLoading]=useState(false)
const [booking,setBookings]=useState<IBooking |null>(null)
const [driverPos,setDriverPos] =useState<[Number,Number] | null>(null)
const [pickupPos,setPickupPos] =useState<[Number,Number] | null>(null)
const [dropPos,setDropPos] =useState<[Number,Number]| null>(null)
const [distanceToPickUp,setDistanceToPickUp] = useState(0)
const [distanceToDrop,setDistanceToDrop] = useState(0)
const [etaToPickup,setEtaToPickUp]=useState(0)
const [etaToDrop,setEtaToDrop]=useState(0)
const [status,setStatus] = useState<BookingStatus>('idle')

const fetch = async()=>{
  try {
    setLoading(true)
    const {data} = await axios.get('/api/auth/partner/my-active')
   setBookings(data)
   setStatus(data.bookingStatus)
   setPickupPos([data.pickUpLocation.coordinates[1],data.pickUpLocation.coordinates[0]])
   setDropPos([data.dropLocation.coordinates[1],data.dropLocation.coordinates[0]])
    setLoading(false)
  } catch (error) {
    console.log(error)
    setLoading(false)
  }
}

useEffect(()=>{
  fetch()
},[])


useEffect(()=>{
  if(!navigator.geolocation)return;
  const watchId=navigator.geolocation.watchPosition((pos)=>{
    const lat=pos.coords.latitude
    const lon=pos.coords.longitude
    setDriverPos([lat,lon])
  },
  (error)=>{console.log("gps error")},
  {enableHighAccuracy:true,maximumAge:2000,timeout:10000}
)
return ()=>{navigator.geolocation.clearWatch(watchId)}
},[])

if(loading){
  return (
    <div className="h-screen w-full flex items-center justify-center bg-zinc-100">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 rounded-full border-4 border-zinc-300 border-t-zinc-900 animate-spin" />
        <p className="text-sm text-zinc-500 font-medium">Loading Ride...</p>
      </div>
    </div>
  )
}

const isActive=["confirmed","started"].includes(status)
const displayEta=status==="confirmed" ?etaToPickup:etaToDrop
const displayDistance=status==='confirmed' ?distanceToPickUp:distanceToDrop
const cfg = STATUS_LABEL[booking?.bookingStatus ?? 'idle']
const canChat=booking?.bookingStatus==='confirmed'
const paymentStatus = PAYMENT_BADGE[booking?.paymentStatus ?? 'pending']
  return (
    <div className='h-screen w-full bg-zinc-100 flex flex-col lg:flex-row overflow-hidden'>
      <div className='relative flex-1 h-full z-0'>
        <LiveRideMap 
        onStats={({distanceToPickUp,etaToPickUp,distanceToDrop,etaToDrop})=>{
               setEtaToPickUp(etaToPickUp)
               setDistanceToPickUp(distanceToPickUp)
               setDistanceToDrop(distanceToDrop)
               setEtaToDrop(etaToDrop)
        }}
         driverLocation={driverPos}
         pickUpLocation={pickupPos}
         dropLocation={dropPos}
         mapStatus={MAP_STATUS[booking?.bookingStatus!]}
        />

        {/* floating status pill, top-left over the map */}
        <div className='absolute top-4 left-4 z-10 flex items-center gap-2 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-zinc-100'>
          <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
          <p className='text-sm font-semibold text-zinc-800'>{cfg.label}</p>
        </div>
      </div>

      {/* desktop side panel */}
      <div className='hidden lg:flex lg:w-[380px] xl:w-[420px] h-full bg-white shadow-xl z-10 flex-col p-6 gap-6 overflow-y-auto'>
        <PanelContent
          isActive={isActive}
          displayDistance={displayDistance}
          displayEta={displayEta}
          cfg={cfg}
          status={status}
          booking={booking}
           canChat={canChat}
           paymentStatus={paymentStatus}
        />
      </div>

      {/* mobile bottom sheet */}
      <div className='lg:hidden absolute bottom-0 left-0 right-0 z-10 bg-white rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] px-5 pt-4 pb-6 max-h-[70vh] overflow-y-auto'>
        <div className='mx-auto mb-3 h-1.5 w-10 rounded-full bg-zinc-300' />
        <PanelContent
          isActive={isActive}
          displayDistance={displayDistance}
          displayEta={displayEta}
          cfg={cfg}
          status={status}
          booking={booking}
           canChat={canChat}
            paymentStatus={paymentStatus}
          compact
        />
      </div>
    </div>
  )
}

export default Page