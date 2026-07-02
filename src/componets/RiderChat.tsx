'use client'
import React from 'react'

function RiderChat({currentRole,bookingId,userName,driverName}:any) {
    const othername = currentRole=="user"?driverName:userName
    const myName=currentRole=="user"?userName:driverName
  return (
    <div className='flex flex-col h-full min-h-0 bg-white rounded-2xl overflow-hidden border border-zinc-100'>
      <div className='flex-shrink-0 flex items-center gap-3 px-4 py-3 bg-white border'>

      </div>
    </div>
  )
}

export default RiderChat
