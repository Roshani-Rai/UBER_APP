import React from 'react'
import { ArrowRight } from 'lucide-react'
import { AnimatePresence,motion } from 'motion/react'

function ActionCard({ icon, title, button, onClick }: { 
  icon: React.ReactNode
  title: string
  button: string
  onClick: () => void 
}) {
  return (
    <AnimatePresence>
    <motion.div
    initial={{opacity:0,y:30}}
    animate={{opacity:1,y:0}}
    className="w-full rounded-2xl border border-blue-100 bg-blue-50 p-5 flex items-center justify-between gap-4">
      
      {/* Left */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600">
          {icon}
        </div>
        <p className="text-sm font-semibold text-blue-800">{title}</p>
      </div>

      {/* Button */}
      <button
        onClick={onClick}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition active:scale-95 flex-shrink-0"
      >
        {button}
        <ArrowRight size={13} />
      </button>

    </motion.div>
    </AnimatePresence>
  )
}

export default ActionCard