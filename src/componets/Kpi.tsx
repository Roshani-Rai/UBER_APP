"use client"
import React, { useEffect, useRef } from 'react'

const KPI_CONFIG: Record<string, {
  iconBg: string
  iconColor: string
  borderColor: string
  hoverBorder: string
  badgeColor: string
  glowColor: string
  countColor: string
  hoverBg: string
}> = {
  totalPartners: {
    iconBg: "bg-purple-50",
    iconColor: "text-purple-700",
    borderColor: "border-purple-100",
    hoverBorder: "hover:border-purple-300",
    badgeColor: "text-purple-700 bg-purple-50",
    glowColor: "rgba(139,92,246,0.15)",
    countColor: "#7c3aed",
    hoverBg: "#faf5ff",
  },
  approved: {
    iconBg: "bg-blue-50",
    iconColor: "text-blue-800",
    borderColor: "border-blue-100",
    hoverBorder: "hover:border-blue-300",
    badgeColor: "text-blue-700 bg-blue-50",
    glowColor: "rgba(59,130,246,0.15)",
    countColor: "#1d4ed8",
    hoverBg: "#eff6ff",
  },
  pending: {
    iconBg: "bg-amber-50",
    iconColor: "text-amber-800",
    borderColor: "border-amber-100",
    hoverBorder: "hover:border-amber-300",
    badgeColor: "text-amber-700 bg-amber-50",
    glowColor: "rgba(245,158,11,0.15)",
    countColor: "#d97706",
    hoverBg: "#fffbeb",
  },
  rejected: {
    iconBg: "bg-red-50",
    iconColor: "text-red-800",
    borderColor: "border-red-100",
    hoverBorder: "hover:border-red-300",
    badgeColor: "text-red-700 bg-red-50",
    glowColor: "rgba(239,68,68,0.15)",
    countColor: "#dc2626",
    hoverBg: "#fff1f2",
  },
}

interface KpiProps {
  label: string
  value: number | undefined
  icon: React.ReactNode
  variant: keyof typeof KPI_CONFIG
  badge?: string
  index?: number
}

function useCountUp(target: number | undefined, duration = 1200) {
  const [count, setCount] = React.useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (target === undefined) return
    const start = performance.now()

    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(target * eased))
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])

  return count
}

function Kpi({ label, value, icon, variant, badge, index = 0 }: KpiProps) {
  const cfg = KPI_CONFIG[variant]
  const count = useCountUp(value)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = cardRef.current
    if (!el) return

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) / (rect.width / 2)
      const dy = (e.clientY - cy) / (rect.height / 2)
      el.style.transform = `perspective(600px) rotateY(${dx * 6}deg) rotateX(${-dy * 6}deg) translateY(-4px)`
    }

    const onLeave = () => {
      el.style.transform = `perspective(600px) rotateY(0deg) rotateX(0deg) translateY(0px)`
    }

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <div
      ref={cardRef}
      className={`
        relative rounded-2xl border ${cfg.borderColor} ${cfg.hoverBorder}
        p-5 flex flex-col gap-4 cursor-default select-none
      `}
      style={{
        backgroundColor: 'white',
        transition: 'transform 0.15s ease, box-shadow 0.2s ease, border-color 0.2s ease, background-color 0.2s ease',
        animation: `kpiFadeUp 0.5s ease both`,
        animationDelay: `${index * 80}ms`,
        willChange: 'transform',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.boxShadow = `0 8px 32px ${cfg.glowColor}, 0 2px 8px rgba(0,0,0,0.06)`
        el.style.backgroundColor = cfg.hoverBg
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.boxShadow = 'none'
        el.style.backgroundColor = 'white'
      }}
    >
      {/* Radial glow overlay */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: `radial-gradient(circle at 30% 40%, ${cfg.glowColor}, transparent 70%)` }}
        aria-hidden
      />

      {/* Icon */}
      <div
        className={`relative w-10 h-10 rounded-xl ${cfg.iconBg} ${cfg.iconColor} flex items-center justify-center flex-shrink-0`}
      >
        {React.cloneElement(icon as React.ReactElement, { size: 18, strokeWidth: 2 })}
      </div>

      {/* Value + Label */}
      <div className="space-y-0.5 relative">
        <p
          className="text-2xl font-bold tabular-nums leading-none"
          style={{ color: value !== undefined ? cfg.countColor : '#111827', transition: 'color 0.3s' }}
        >
          {value !== undefined ? count : (
            <span className="inline-block w-12 h-7 rounded-md bg-gray-100 animate-pulse" />
          )}
        </p>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
      </div>

      {badge && (
        <span className={`self-start text-xs font-medium px-2 py-0.5 rounded-full ${cfg.badgeColor}`}>
          {badge}
        </span>
      )}

      <style>{`
        @keyframes kpiFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default Kpi