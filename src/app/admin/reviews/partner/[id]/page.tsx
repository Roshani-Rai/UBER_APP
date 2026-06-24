"use client"

import axios from 'axios'
import { motion, AnimatePresence } from 'motion/react'
import {
  ArrowLeft, BadgeCheck, Ban, Building2, Car,
  Mail, Phone, Shield, User, Clock, CheckCircle2, XCircle, FileText
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { setUserData } from '@/redux/userSlice'

// ─── types ───────────────────────────────────────────────────────────────────
interface PartnerData {
  partner: {
    _id: string
    name: string
    email: string
    mobileNumber: string
    partnerStatus: string
    partnerStep: number
    isEmailVerified: boolean
    createdAt: string
  }
  vehicle: {
    _id: string
    number: string
    type: string
    vehicleModel: string
    status: string
    createdAt: string
  }
  documents: {
    _id: string
    aadharUrl: string
    licenseUrl: string
    rcUrl: string
    status: string
  }
  bank: {
    _id: string
    accountHolder: string
    accountNumber: string
    ifsc: string
    upi: string
    status: string
  }
}

// ─── Toast ───────────────────────────────────────────────────────────────────
type ToastType = 'success' | 'error'
interface Toast { id: number; message: string; type: ToastType }

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.95 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-xs font-medium
              ${t.type === 'success'
                ? 'bg-emerald-600 text-white'
                : 'bg-red-600 text-white'
              }`}
          >
            {t.type === 'success'
              ? <CheckCircle2 size={14} />
              : <XCircle size={14} />
            }
            {t.message}
            <button
              onClick={() => onRemove(t.id)}
              className="ml-1 opacity-70 hover:opacity-100 transition"
            >✕</button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (message: string, type: ToastType = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }

  const removeToast = (id: number) =>
    setToasts(prev => prev.filter(t => t.id !== id))

  return { toasts, addToast, removeToast }
}

// ─── helpers ─────────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: string }) {
  const s = status?.toLowerCase()
  if (s === 'approved' || s === 'verified') return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
      <CheckCircle2 size={11} /> {status}
    </span>
  )
  if (s === 'rejected') return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
      <XCircle size={11} /> {status}
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
      <Clock size={11} /> {status}
    </span>
  )
}

function SectionCard({
  title, icon, children, index = 0, action,
}: {
  title: string; icon: React.ReactNode; children: React.ReactNode
  index?: number; action?: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07, ease: 'easeOut' }}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-md shadow-gray-200/70"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center">
            {icon}
          </div>
          <span className="text-sm font-semibold text-gray-900 underline underline-offset-2">{title}</span>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </motion.div>
  )
}

function InfoRow({ label, value }: { label: string; value?: string | React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400 font-medium w-36 flex-shrink-0">{label}</span>
      <span className="text-xs text-gray-800 font-medium text-right flex-1">{value ?? '—'}</span>
    </div>
  )
}


function DocViewer({ label, url }: { label: string; url?: string }) {
  const [open, setOpen] = React.useState(false)
  const [iframeKey, setIframeKey] = React.useState(0)

  const isPdf = !!url && (
    url.toLowerCase().includes('.pdf') ||
    url.toLowerCase().includes('/raw/') ||
    url.toLowerCase().includes('application/pdf')
  )

  if (!url) return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-gray-400 font-medium underline underline-offset-2">{label}</span>
      <div className="w-full h-36 rounded-xl border border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-1.5">
        <FileText size={20} className="text-gray-300" />
        <span className="text-xs text-gray-300">Not uploaded</span>
      </div>
    </div>
  )

  if (isPdf) return (
    <>
      <div className="flex flex-col gap-2">
        <span className="text-xs text-gray-400 font-medium underline underline-offset-2">{label}</span>
        <button
          onClick={() => { setIframeKey(k => k + 1); setOpen(true) }}
          className="relative w-full h-36 rounded-xl overflow-hidden border border-blue-100 hover:border-blue-300 transition-all duration-200 group bg-blue-50 flex flex-col items-center justify-center gap-2"
        >
          <FileText size={28} className="text-blue-400 group-hover:scale-110 transition-transform duration-200" />
          <span className="text-xs font-medium text-blue-400">PDF Document</span>
          <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-medium bg-blue-400/80 px-3 py-1 rounded-full transition-opacity duration-200">
            View PDF
          </span>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-4xl h-[90vh] rounded-2xl overflow-hidden bg-white flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white flex-shrink-0">
                <div className="flex items-center gap-2">
                  <FileText size={15} className="text-blue-400" />
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                </div>
                <div className="flex items-center gap-2">
                  
                   <a href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="text-xs text-blue-500 hover:underline flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-blue-50 transition"
                  >
                    <FileText size={11} /> Open in new tab
                  </a>
                  <button
                    onClick={() => setOpen(false)}
                    className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-sm hover:bg-gray-200 transition"
                  >✕</button>
                </div>
              </div>

              {/* iframe */}
              <iframe
                key={iframeKey}
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`}
                className="w-full flex-1 border-0"
                title={label}
              />

              {/* Fallback footer */}
              <div className="flex items-center justify-center py-2 border-t border-gray-100 bg-gray-50 flex-shrink-0">
                <span className="text-xs text-gray-400">
                  Not loading?{' '}
                  
                 <a   href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Download PDF
                  </a>
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )

  // ── Image viewer ──
  return (
    <>
      <div className="flex flex-col gap-2">
        <span className="text-xs text-gray-400 font-medium underline underline-offset-2">{label}</span>
        <button
          onClick={() => setOpen(true)}
          className="relative w-full h-36 rounded-xl overflow-hidden border border-gray-100 hover:border-gray-300 transition-all duration-200 group"
        >
          <Image src={url} alt={label} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-medium bg-black/60 px-3 py-1 rounded-full transition-opacity duration-200">
              View Full
            </span>
          </div>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-2xl w-full h-[80vh] rounded-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <Image src={url} alt={label} fill className="object-contain" />
              <button
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center text-sm hover:bg-black/80 transition"
              >✕</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────
// ✅ Clean: no API calls here. Just collects input and calls onConfirm/onCancel.
function ConfirmModal({
  type,
  onConfirm,
  onCancel,
  loading,
}: {
  type: 'approve' | 'reject'
  onConfirm: (reason?: string) => void   // ← parent handles the actual API call
  onCancel: () => void
  loading: boolean
}) {
  const [reason, setReason] = useState('')

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={e => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-4"
        >
          {/* Icon */}
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${type === 'approve' ? 'bg-emerald-50' : 'bg-red-50'}`}>
            {type === 'approve'
              ? <BadgeCheck size={22} className="text-emerald-600" />
              : <Ban size={22} className="text-red-500" />
            }
          </div>

          {/* Title & desc */}
          <div className="text-center">
            <h2 className="text-base font-bold text-gray-900">
              {type === 'approve' ? 'Approve Partner?' : 'Reject Partner?'}
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              {type === 'approve'
                ? 'Are you sure you want to approve this partner? This action will grant them full access.'
                : 'Please provide a reason for rejection so the partner can take corrective action.'}
            </p>
          </div>

          {/* Reject reason input */}
          {type === 'reject' && (
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Enter rejection reason…"
              rows={3}
              className="w-full text-xs text-gray-800 border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 placeholder:text-gray-300"
            />
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-1">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 text-xs font-semibold py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            {/* ✅ Fixed: calls onConfirm with the reason. Parent does the API call. */}
            <button
              onClick={() => onConfirm(type === 'reject' ? reason : undefined)}
              disabled={loading || (type === 'reject' && !reason.trim())}
              className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 rounded-xl transition disabled:opacity-50
                ${type === 'approve'
                  ? 'bg-gray-900 text-white hover:bg-gray-700'
                  : 'bg-red-600 text-white hover:bg-red-700'
                }`}
            >
              {loading
                ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : type === 'approve' ? <BadgeCheck size={13} /> : <Ban size={13} />
              }
              {type === 'approve' ? 'Yes, Approve' : 'Reject'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── main page ───────────────────────────────────────────────────────────────
export default function PartnerReviewPage() {
  const { id } = useParams()
  const router = useRouter()
  const [data, setData] = useState<PartnerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [modal, setModal] = useState<'approve' | 'reject' | null>(null)
  const { toasts, addToast, removeToast } = useToast()
  const { userData  } = useSelector((state: RootState) => state.user)
 const dispatch = useDispatch()


  const fetchPartner = async () => {
    try {
      const { data: res } = await axios.get(`/api/auth/admin/reviews/partner/${id}`)
      setData(res)
    } catch (err) {
      console.error(err)
      addToast('Failed to load partner details.', 'error')
    } finally {
      setLoading(false)
    }
  }

  // ✅ This is the single place where approve/reject API calls happen.
  //    ConfirmModal just calls this via onConfirm — clean separation.
  const handleConfirm = async (reason?: string) => {
    if (!modal) return
    setActionLoading(true)
    try {
      if (modal === 'approve') {
        await axios.get(`/api/auth/admin/reviews/partner/${id}/approve`)
        dispatch(setUserData({ ...userData, partnerStatus: 'approved', rejectionReason: '' }))
        addToast('Partner approved successfully!', 'success')
      } else {
        await axios.post(`/api/auth/admin/reviews/partner/${id}/reject`, { reason })
         dispatch(setUserData({ ...userData, partnerStatus: 'rejected', rejectionReason: reason ?? '' }))
        addToast('Partner rejected.', 'success')
      }
      await fetchPartner()
      setModal(null)
    } catch (err) {
      console.error(err)
      addToast(`Failed to ${modal} partner. Please try again.`, 'error')
    } finally {
      setActionLoading(false)
    }
  }

  useEffect(() => { fetchPartner() }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="w-10 h-10 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Loading partner details…</p>
        </motion.div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
        Partner not found.
      </div>
    )
  }

  const { partner, vehicle, documents, bank } = data
  const initials = partner.name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

      {/* ── Toasts ── */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* ── Modal ── */}
      {modal && (
        <ConfirmModal
          type={modal}
          onConfirm={handleConfirm}
          onCancel={() => setModal(null)}
          loading={actionLoading}
        />
      )}

      {/* ── Navbar ── */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition active:scale-95"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">{partner.name}</p>
            <p className="text-xs text-gray-400 truncate">{partner.email}</p>
          </div>
          <StatusPill status={partner.partnerStatus} />
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-5">

        {/* ── Hero card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="bg-gray-900 rounded-2xl p-6 text-white flex flex-col sm:flex-row sm:items-center gap-5 shadow-lg shadow-gray-900/20"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-xl font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-lg font-bold">{partner.name}</h1>
              {partner.isEmailVerified && (
                <span className="inline-flex items-center gap-1 text-xs bg-white/10 border border-white/20 px-2 py-0.5 rounded-full">
                  <BadgeCheck size={11} /> Verified
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/60">
              <span className="flex items-center gap-1"><Mail size={11} />{partner.email}</span>
              <span className="flex items-center gap-1"><Phone size={11} />{partner.mobileNumber}</span>
              <span className="flex items-center gap-1">
                <Clock size={11} />
                Joined {new Date(partner.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        </motion.div>

        {/* ── 2-col grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

          {/* Vehicle */}
          <SectionCard
            title="Vehicle Details"
            icon={<Car size={14} />}
            index={1}
            action={<StatusPill status={vehicle?.status ?? 'pending'} />}
          >
            <InfoRow label="Registration No." value={vehicle?.number} />
            <InfoRow label="Model" value={vehicle?.vehicleModel} />
            <InfoRow label="Type" value={vehicle?.type?.charAt(0).toUpperCase() + vehicle?.type?.slice(1)} />
            <InfoRow
              label="Submitted"
              value={vehicle?.createdAt
                ? new Date(vehicle.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                : undefined}
            />
          </SectionCard>

          {/* Bank */}
          <SectionCard
            title="Bank Details"
            icon={<Building2 size={14} />}
            index={2}
            action={<StatusPill status={bank?.status ?? 'pending'} />}
          >
            <InfoRow label="Account Holder" value={bank?.accountHolder} />
            <InfoRow
              label="Account No."
              value={bank?.accountNumber
                ? `•••• •••• ${bank.accountNumber.slice(-4)}`
                : undefined}
            />
            <InfoRow label="IFSC Code" value={bank?.ifsc} />
            <InfoRow label="UPI" value={bank?.upi || '—'} />
          </SectionCard>
        </div>

        {/* Documents */}
        <SectionCard
          title="KYC Documents"
          icon={<Shield size={14} />}
          index={3}
          action={<StatusPill status={documents?.status ?? 'pending'} />}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <DocViewer label="Aadhaar Card" url={documents?.aadharUrl} />
            <DocViewer label="Driving License" url={documents?.licenseUrl} />
            <DocViewer label="Vehicle RC" url={documents?.rcUrl} />
          </div>
        </SectionCard>

        {/* Partner info */}
        <SectionCard
          title="Account Info"
          icon={<User size={14} />}
          index={4}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
            <InfoRow label="Partner ID" value={partner._id} />
            <InfoRow label="Onboarding Step" value={`Step ${partner.partnerStep} of 3`} />
            <InfoRow label="Email Verified" value={partner.isEmailVerified ? 'Yes' : 'No'} />
            <InfoRow label="Role" value="Partner" />
          </div>
        </SectionCard>

        {/* ── Final Decision ── */}
        {(() => {
          const status = partner.partnerStatus?.toLowerCase()
          const isSettled = status === 'approved' || status === 'rejected'

          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.35, ease: 'easeOut' }}
              className={`rounded-2xl border shadow-md shadow-gray-200/70 p-6 flex flex-col sm:flex-row items-center justify-between gap-4
                ${status === 'approved'
                  ? 'bg-emerald-50 border-emerald-100'
                  : status === 'rejected'
                  ? 'bg-red-50 border-red-100'
                  : 'bg-white border-gray-100'
                }`}
            >
              {/* Left: label */}
              <div className="flex items-center gap-3">
                {status === 'approved' && (
                  <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <BadgeCheck size={18} className="text-emerald-600" />
                  </div>
                )}
                {status === 'rejected' && (
                  <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <Ban size={18} className="text-red-500" />
                  </div>
                )}
                <div>
                  <p className={`text-sm font-semibold
                    ${status === 'approved' ? 'text-emerald-800'
                    : status === 'rejected' ? 'text-red-700'
                    : 'text-gray-900'}`}
                  >
                    {status === 'approved'
                      ? 'Partner Approved'
                      : status === 'rejected'
                      ? 'Partner Rejected'
                      : 'Final Decision'}
                  </p>
                  <p className={`text-xs mt-0.5
                    ${status === 'approved' ? 'text-emerald-600'
                    : status === 'rejected' ? 'text-red-400'
                    : 'text-gray-400'}`}
                  >
                    {status === 'approved'
                      ? 'This partner has been approved and has full access.'
                      : status === 'rejected'
                      ? 'This partner application has been rejected.'
                      : 'Approve or reject this partner application after reviewing all details.'}
                  </p>
                </div>
              </div>

              {/* Right: buttons only when still pending */}
              {!isSettled && (
                <div className="flex gap-3 flex-shrink-0">
                  <button
                    onClick={() => setModal('approve')}
                    className="flex items-center gap-1.5 text-xs font-semibold px-5 py-2.5 rounded-xl bg-gray-900 text-white hover:bg-gray-700 transition active:scale-95"
                  >
                    <BadgeCheck size={13} /> Approve
                  </button>
                  <button
                    onClick={() => setModal('reject')}
                    className="flex items-center gap-1.5 text-xs font-semibold px-5 py-2.5 rounded-xl bg-white text-red-600 border border-red-200 hover:bg-red-50 transition active:scale-95"
                  >
                    <Ban size={13} /> Reject
                  </button>
                </div>
              )}
            </motion.div>
          )
        })()}


       
      </main>
    </div>
  )
}