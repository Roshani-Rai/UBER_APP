import React from 'react'
import { AlertCircle } from 'lucide-react'

function RejectionCard({ title, reason, actionLabel, onAction }: any) {
  return (
    <div className="w-full rounded-2xl border border-red-100 bg-red-50 p-5 flex flex-col gap-4">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <AlertCircle size={18} className="text-red-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-red-700">{title}</p>
          <p className="text-xs text-red-400 mt-0.5">Your application was reviewed and rejected</p>
        </div>
      </div>

      {/* Reason */}
      <div className="rounded-xl border border-red-100 bg-white px-4 py-3 flex flex-col gap-1">
        <span className="text-xs text-gray-400 font-medium">Rejection Reason</span>
        <p className="text-sm text-gray-700 font-medium leading-relaxed">
          {reason }
        </p>
      </div>

      {/* Action */}
      {actionLabel && onAction && (
        <button
  onClick={onAction}
  className="self-start px-5 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition active:scale-95"
>
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default RejectionCard