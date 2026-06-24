import React from 'react'

function StatusCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="w-full rounded-2xl border border-emerald-100 bg-emerald-50 p-5 flex items-start gap-4">
      
      {/* Icon */}
      <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600">
        {icon}
      </div>

      {/* Text */}
      <div>
        <p className="text-sm font-semibold text-emerald-800">{title}</p>
        <p className="text-xs text-emerald-600 mt-0.5 leading-relaxed">{desc}</p>
      </div>

    </div>
  )
}

export default StatusCard