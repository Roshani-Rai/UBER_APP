"use client"
import React, { useRef } from 'react'

interface TapButtonProps {
  active: boolean
  count: number
  onClick: () => void
  icon: React.ReactNode
  children: React.ReactNode
}

function TapButton({ active, count, onClick, icon, children }: TapButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = btnRef.current
    if (!el || active) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    el.style.setProperty('--rx', `${((y / rect.height) - 0.5) * -8}deg`)
    el.style.setProperty('--ry', `${((x / rect.width) - 0.5) * 8}deg`)
    el.style.transform = `perspective(400px) rotateX(var(--rx)) rotateY(var(--ry)) scale(1.02)`
  }

  const handleMouseLeave = () => {
    const el = btnRef.current
    if (!el) return
    el.style.transform = `perspective(400px) rotateX(0deg) rotateY(0deg) scale(1)`
  }

  const handleMouseDown = () => {
    const el = btnRef.current
    if (!el) return
    el.style.transform = `perspective(400px) rotateX(0deg) rotateY(0deg) scale(0.96)`
  }

  const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    handleMouseMove(e)
  }

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className={`
        relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
        transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-offset-1
        ${active
          ? 'bg-black text-white shadow-md focus-visible:ring-black'
          : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50 focus-visible:ring-gray-400'
        }
      `}
      style={{ willChange: 'transform', transition: 'transform 0.12s ease, background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease' }}
    >
      {/* Ripple layer for active state */}
      {active && (
        <span
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.08), transparent 70%)',
            animation: 'tabRipple 0.3s ease forwards',
          }}
          aria-hidden
        />
      )}

      {/* Icon */}
      <span className={`flex-shrink-0 transition-transform duration-200 ${active ? 'scale-110' : 'scale-100'}`}>
        {React.cloneElement(icon as React.ReactElement, {
          size: 15,
          strokeWidth: active ? 2.5 : 2,
        })}
      </span>

      {/* Label */}
      <span className="whitespace-nowrap">{children}</span>

      {/* Count badge */}
      {count > 0 && (
        <span
          className={`
            flex-shrink-0 text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center
            transition-all duration-200
            ${active
              ? 'bg-white text-black'
              : 'bg-red-400 text-white'
            }
          `}
          style={{ animation: count > 0 ? 'badgePop 0.3s cubic-bezier(0.34,1.56,0.64,1) both' : 'none' }}
        >
          {count}
        </span>
      )}

      <style>{`
        @keyframes tabRipple {
          from { opacity: 0; transform: scale(0.9); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes badgePop {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </button>
  )
}

export default TapButton