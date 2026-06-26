"use client"

import React, { useRef, useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import Image from 'next/image';
import { Video, VideoOff, Shield, Wifi, Clock, Mic, MicOff, CheckCircle2, XCircle, PhoneOff, AlertTriangle } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { setUserData } from '@/redux/userSlice';
import axios from 'axios';
import { toast } from 'react-toastify';

const hasJoined = { current: false }

function Page() {
  const router = useRouter()
  const { userData } = useSelector((state: RootState) => state.user)
  const params = useParams()
  const roomId = params?.roomId as string
  const dispatch = useDispatch()
  const [join, setJoin] = useState(false)
  const [camOn, setCamOn] = useState(true)
  const [micOn, setMicOn] = useState(true)
  const [callStarted, setCallStarted] = useState(false)
  const [modal, setModal] = useState<'approve' | 'reject' | 'end' | null>(null)
  const [reason, setReason] = useState('')
  const [aloading, setAloading] = useState(false)
  const [rloading, setRloading] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const previewVideoRef = useRef<HTMLVideoElement>(null)
  const localStreamRef = useRef<MediaStream | null>(null)

  const displayName = userData?.role === 'admin'
    ? "Admin"
    : `${userData?.name} (${userData?.email})`

  const isAdmin = userData?.role === 'admin'

  useEffect(() => {
    let stream: MediaStream | null = null
    let cancelled = false

    const startPreview = async () => {
      try {
        await new Promise(res => setTimeout(res, 300))
        if (cancelled) return

        const constraints = isAdmin
          ? { video: false, audio: true }
          : { video: true, audio: true }

        stream = await navigator.mediaDevices.getUserMedia(constraints)
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return }

        localStreamRef.current = stream
        if (previewVideoRef.current && !isAdmin) {
          previewVideoRef.current.srcObject = stream
        }
      } catch (err) {
        console.error("Camera access denied", err)
      }
    }

    startPreview()

    return () => {
      cancelled = true
      stream?.getTracks().forEach(t => t.stop())
      localStreamRef.current?.getTracks().forEach(t => t.stop())
      localStreamRef.current = null
      if (previewVideoRef.current) previewVideoRef.current.srcObject = null
    }
  }, [])

  const toggleCam = () => {
    const videoTrack = localStreamRef.current?.getVideoTracks()[0]
    if (videoTrack) { videoTrack.enabled = !videoTrack.enabled; setCamOn(prev => !prev) }
  }

  const toggleMic = () => {
    const audioTrack = localStreamRef.current?.getAudioTracks()[0]
    if (audioTrack) { audioTrack.enabled = !audioTrack.enabled; setMicOn(prev => !prev) }
  }

  const startCall = async () => {
    if (hasJoined.current || callStarted) return
    hasJoined.current = true
    setCallStarted(true)
    try {
      if (!containerRef.current) return

      // ✅ stop preview stream before zego takes over
      localStreamRef.current?.getTracks().forEach(t => t.stop())
      localStreamRef.current = null
      if (previewVideoRef.current) previewVideoRef.current.srcObject = null
      await new Promise(res => setTimeout(res, 500))

      // ✅ import only here — browser only, never server
      const { ZegoUIKitPrebuilt } = await import('@zegocloud/zego-uikit-prebuilt')

      const appId = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID)
      const appSecret = process.env.NEXT_PUBLIC_ZEGO_APP_SECRET

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appId, appSecret!, roomId,
        userData?._id?.toString()!, displayName
      )

      const zp = ZegoUIKitPrebuilt.create(kitToken)
      setJoin(true)

      zp.joinRoom({
        container: containerRef.current,
        scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall },
        showPreJoinView: false,
        turnOnCameraWhenJoining: camOn,
        turnOnMicrophoneWhenJoining: micOn,
      })
    } catch (error) {
      hasJoined.current = false
      setCallStarted(false)
      console.error(error)
    }
  }

  const handleApproveConfirm = async () => {
    setAloading(true)
    try {
      const { data } = await axios.post('/api/auth/admin/video-kyc/complete', { roomId, action: "approved" })
      if (data?.success === false) { toast.error(data.message); return }
      toast.success("Video KYC Approved successfully!")
      dispatch(setUserData({ ...userData, partnerStep: 6, videoKycStatus: 'approved', videoKycRejectionReason: undefined, videoKycRoomId:''}))
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong")
    } finally {
      setAloading(false)
      router.push('/')
      setModal(null)
    }
  }

  const handleRejectConfirm = async () => {
    if (!reason.trim()) return
    setRloading(true)
    try {
      const { data } = await axios.post('/api/auth/admin/video-kyc/complete', { roomId, action: "rejected", reason })
      if (data?.success === false) { toast.error(data.message); return }
      toast.success("Video KYC Rejected successfully!")
      dispatch(setUserData({ ...userData, videoKycStatus: 'rejected', videoKycRejectionReason: reason }))
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong")
    } finally {
      setRloading(false)
      router.push('/')
      setModal(null)
      setReason('')
    }
  }

  const handleEndCall = () => {
    setModal(null)
  }

  return (
    <div className='min-h-screen bg-black text-white flex flex-col overflow-hidden'>

      {/* Header */}
      <div className='px-4 py-3 border-b border-white/10 flex justify-between items-center flex-shrink-0'>
        <div className='flex items-center gap-3'>
          <Image src="/logo.jpg" alt="Logo" width={36} height={36} className='rounded-xl' />
          <div>
            <p className='text-sm font-semibold text-white'>VideoKYC</p>
            <p className='text-xs text-gray-400'>
              {isAdmin ? "Admin Verification Panel" : "Partner Video KYC"}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-2 text-xs text-green-400 bg-green-400/10 px-3 py-1.5 rounded-full border border-green-400/20'>
          <Wifi size={11} />
          <span className='hidden sm:inline'>Secure Connection</span>
        </div>
      </div>

      {/* Pre-join */}
      <div className={`flex-1 flex items-center justify-center px-4 py-8 ${join ? 'hidden' : 'flex'}`}>
        <div className='w-full max-w-md flex flex-col items-center gap-5'>

          <div className='relative w-full aspect-video rounded-2xl overflow-hidden bg-zinc-900 border border-white/10'>
            {isAdmin ? (
              <div className='absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-500'>
                <Video size={32} strokeWidth={1.5} />
                <p className='text-sm'>Admin view — no camera preview</p>
              </div>
            ) : (
              <>
                <video
                  ref={previewVideoRef}
                  autoPlay muted playsInline
                  className={`w-full h-full object-cover scale-x-[-1] ${camOn ? 'block' : 'hidden'}`}
                />
                {!camOn && (
                  <div className='absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-500'>
                    <VideoOff size={32} strokeWidth={1.5} />
                    <p className='text-sm'>Camera is off</p>
                  </div>
                )}
              </>
            )}
            <div className='absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-xs text-white px-3 py-1 rounded-full'>
              {displayName}
            </div>
            {!micOn && (
              <div className='absolute top-3 right-3 bg-red-500/80 backdrop-blur-sm p-1.5 rounded-full'>
                <MicOff size={11} className='text-white' />
              </div>
            )}
          </div>

          <div className='flex items-center gap-3'>
            <button onClick={toggleMic} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${micOn ? 'bg-white/10 border-white/20 text-white' : 'bg-red-500/20 border-red-500/40 text-red-400'}`}>
              {micOn ? <Mic size={14} /> : <MicOff size={14} />}
              {micOn ? 'Mic On' : 'Mic Off'}
            </button>
            {!isAdmin && (
              <button onClick={toggleCam} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${camOn ? 'bg-white/10 border-white/20 text-white' : 'bg-red-500/20 border-red-500/40 text-red-400'}`}>
                {camOn ? <Video size={14} /> : <VideoOff size={14} />}
                {camOn ? 'Cam On' : 'Cam Off'}
              </button>
            )}
          </div>

          <div className='w-full flex flex-col gap-2'>
            {[
              { icon: <Shield size={13} />, text: "End-to-end encrypted session" },
              { icon: <Clock size={13} />, text: "Typically takes 3–5 minutes" },
              { icon: <Video size={13} />, text: "Camera and microphone required" },
            ].map((item, i) => (
              <div key={i} className='flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-400'>
                <span className='text-white/40'>{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>

          <button
            onClick={startCall}
            disabled={callStarted}
            className={`w-full py-3.5 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
              callStarted
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-white text-black hover:bg-gray-100 active:scale-95'
            }`}
          >
            <Video size={16} />
            {callStarted ? 'Joining...' : isAdmin ? "Start Verification Call" : "Join Video KYC"}
          </button>

          <p className='text-xs text-gray-600 text-center'>
            By joining, you consent to this session being recorded for compliance purposes.
          </p>
        </div>
      </div>

      {/* Call view */}
      <div className={`flex-1 flex flex-col ${join ? 'flex' : 'hidden'}`} style={{ height: 'calc(100vh - 61px)' }}>
        <div ref={containerRef} className='flex-1 w-full min-h-0' />

        <div className='flex-shrink-0 border-t border-white/10 bg-zinc-950 px-4 py-3 flex items-center justify-center gap-3 flex-wrap'>
          <button
            onClick={() => {
              setModal('end')
              router.push('/')
            }}
            className='flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-all active:scale-95'
          >
            <PhoneOff size={15} />
            End Call
          </button>
          {isAdmin && (
            <>
              <button
                onClick={() =>{ 
                  setModal('reject')
                 
                }}
                className='flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-400 hover:bg-red-500 border border-white/20 text-white text-sm font-semibold transition-all active:scale-95'
              >
                <XCircle size={15} />
                Reject
              </button>
              <button
                onClick={() => {
                  setModal('approve')
                 
                }}
                className='flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-all active:scale-95'
              >
                <CheckCircle2 size={15} />
                Approve
              </button>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {modal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm'>
          <div className='w-full max-w-sm bg-zinc-900 border border-white/10 rounded-2xl p-6 flex flex-col gap-5 shadow-2xl'>

            {modal === 'approve' && (
              <>
                <div className='flex flex-col items-center gap-3 text-center'>
                  <div className='w-14 h-14 rounded-2xl bg-green-500/15 border border-green-500/30 flex items-center justify-center'>
                    <CheckCircle2 size={28} className='text-green-400' />
                  </div>
                  <h2 className='text-lg font-bold text-white'>Approve KYC?</h2>
                  <p className='text-sm text-gray-400'>This will mark the partner's video KYC as approved and move them to the next step.</p>
                </div>
                <div className='flex gap-3'>
                  <button onClick={() => setModal(null)} className='flex-1 py-2.5 rounded-xl border border-white/20 text-sm font-medium text-gray-300 hover:bg-white/5 transition-all'>Cancel</button>
                  <button onClick={handleApproveConfirm} className='flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-sm font-semibold text-white transition-all active:scale-95'>
                    {aloading ? "Processing..." : 'Yes, Approve'}
                  </button>
                </div>
              </>
            )}

            {modal === 'reject' && (
              <>
                <div className='flex flex-col items-center gap-3 text-center'>
                  <div className='w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center'>
                    <XCircle size={28} className='text-red-400' />
                  </div>
                  <h2 className='text-lg font-bold text-white'>Reject KYC?</h2>
                  <p className='text-sm text-gray-400'>Please provide a reason. This will be shared with the partner.</p>
                </div>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder='e.g. Face not clearly visible, ID not matching...'
                  rows={3}
                  className='w-full rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 resize-none transition'
                />
                <div className='flex gap-3'>
                  <button onClick={() => { setModal(null); setReason('') }} className='flex-1 py-2.5 rounded-xl border border-white/20 text-sm font-medium text-gray-300 hover:bg-white/5 transition-all'>Cancel</button>
                  <button onClick={handleRejectConfirm} disabled={!reason.trim()} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-95 ${reason.trim() ? 'bg-red-600 hover:bg-red-700' : 'bg-red-900/40 cursor-not-allowed text-red-400'}`}>
                    {rloading ? "Processing..." : "Yes, Reject"}
                  </button>
                </div>
              </>
            )}

            {modal === 'end' && (
              <>
                <div className='flex flex-col items-center gap-3 text-center'>
                  <div className='w-14 h-14 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center'>
                    <AlertTriangle size={28} className='text-orange-400' />
                  </div>
                  <h2 className='text-lg font-bold text-white'>End Call?</h2>
                  <p className='text-sm text-gray-400'>
                    Are you sure you want to leave?
                    {isAdmin && " Make sure to approve or reject before ending."}
                  </p>
                </div>
                <div className='flex gap-3'>
                  <button onClick={() => setModal(null)} className='flex-1 py-2.5 rounded-xl border border-white/20 text-sm font-medium text-gray-300 hover:bg-white/5 transition-all'>Stay</button>
                  <button onClick={handleEndCall} className='flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-sm font-semibold text-white transition-all active:scale-95'>End Call</button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  )
}

export default Page