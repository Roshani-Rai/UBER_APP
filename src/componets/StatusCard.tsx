import React from 'react'

function StatusCard({ icon, title, desc, status }: { 
  icon: React.ReactNode
  title: string
  desc: string
  status?: 'approved' | 'pending' | 'default'
}) {
  const isApproved = status === 'approved'

  return (
    <div className={`w-full rounded-2xl border p-5 flex items-start gap-4 ${
      isApproved ? 'border-green-200 bg-green-50' : 'border-neutral-200 bg-white'
    }`}>

      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
        isApproved ? 'bg-green-600 text-white' : 'bg-black text-white'
      }`}>
        {icon}
      </div>

      <div>
        <p className={`text-sm font-semibold ${isApproved ? 'text-green-800' : 'text-neutral-900'}`}>
          {title}
        </p>
        <p className={`text-xs mt-0.5 leading-relaxed ${isApproved ? 'text-green-600' : 'text-neutral-500'}`}>
          {desc}
        </p>
      </div>

    </div>
  )
}

export default StatusCard