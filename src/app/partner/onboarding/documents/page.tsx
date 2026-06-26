"use client"
import React, { useRef, useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, UploadCloud, CheckCircle2, ShieldCheck, CircleDashed, ArrowRight, Eye } from 'lucide-react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { setUserData } from '@/redux/userSlice'

type DocId = "aadhar" | "license" | "rc"

const DOCUMENTS: { id: DocId; title: string; subtitle: string }[] = [
  { id: "aadhar",  title: "Aadhar / ID Proof", subtitle: "Government issued ID" },
  { id: "license", title: "Driving Licence",   subtitle: "Valid driving licence" },
  { id: "rc",      title: "Vehicle RC",         subtitle: "Registration certificate" },
]

function page() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { userData } = useSelector((state: RootState) => state.user)

  const [files, setFiles] = useState<Record<DocId, File | null>>({
    aadhar: null, license: null, rc: null,
  })
  const [existing, setExisting] = useState<Record<DocId, string | null>>({
    aadhar: null, license: null, rc: null,
  })
  const [previews, setPreviews] = useState<Record<DocId, string | null>>({
    aadhar: null, license: null, rc: null,
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [previewModal, setPreviewModal] = useState<string | null>(null)

  const inputRefs = useRef<Record<DocId, HTMLInputElement | null>>({
    aadhar: null, license: null, rc: null,
  })

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const { data } = await axios.get("/api/auth/partner/onboarding/documents")
        if (data && (data.aadharUrl || data.licenseUrl || data.rcUrl)) {
          setExisting({
            aadhar:  data.aadharUrl  ?? null,
            license: data.licenseUrl ?? null,
            rc:      data.rcUrl      ?? null,
          })
          setSubmitted(true)
        }
      } catch {
        // no docs yet
      } finally {
        setFetching(false)
      }
    }
    fetchDocs()
  }, [])

  const isUpdate = Object.values(existing).some(Boolean)

  const handleFileChange = (id: DocId, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setFiles(prev => ({ ...prev, [id]: file }))
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviews(prev => ({ ...prev, [id]: url }))
    }
    setSubmitted(false)
  }

  const canContinue = isUpdate
    ? DOCUMENTS.some(d => files[d.id] !== null)
    : DOCUMENTS.every(d => files[d.id] !== null)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const formData = new FormData()
      DOCUMENTS.forEach(({ id }) => {
        if (files[id]) formData.append(id, files[id] as File)
      })

      const { data } = await axios.post("/api/auth/partner/onboarding/documents", formData)

      if (data?.success === false) {
        toast.error(data.message)
        return
      }

      toast.success(isUpdate ? "Documents updated successfully" : "Documents submitted for verification")
      setSubmitted(true)
      // update existing with new previews
      setExisting(prev => ({
        aadhar:  previews.aadhar  || prev.aadhar,
        license: previews.license || prev.license,
        rc:      previews.rc      || prev.rc,
      }))
      dispatch(setUserData({
        ...userData,
        partnerStep: Math.max(userData?.partnerStep ?? 0, 3)
      }))

    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Upload failed, try again")
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return (
    <div className='min-h-screen bg-white flex items-center justify-center'>
      <CircleDashed size={28} className='animate-spin text-gray-400' />
    </div>
  )

  return (
    <div className='min-h-screen bg-white flex items-center justify-center px-4 py-10'>

      {/* Preview Modal */}
      {previewModal && (
        <div
          className='fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center px-4'
          onClick={() => setPreviewModal(null)}
        >
          <img
            src={previewModal}
            alt='Document preview'
            className='max-w-full max-h-[90vh] rounded-2xl object-contain shadow-2xl'
          />
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className='w-full max-w-xl bg-white rounded-3xl border border-gray-200 shadow-[0_25px_70px_rgba(0,0,0,0.15)] p-6 sm:p-8'
      >
        <div className='relative text-center'>
          <button
            className='absolute left-0 top-0 w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition'
            onClick={() => router.back()}
          >
            <ArrowLeft size={18} />
          </button>

          <p className='text-xs text-gray-500 font-medium'>Step 2 of 3</p>
          <h1 className='text-2xl font-bold mt-1 text-black'>
            {isUpdate ? 'Update Documents' : 'Upload Documents'}
          </h1>
          <p className='text-sm text-gray-500 mt-2'>
            {isUpdate ? 'Select only the documents you want to replace' : 'Required for verification'}
          </p>

          <div className='flex gap-1.5 justify-center mt-4'>
            {[0, 1, 2].map(i => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${i <= 1 ? 'w-8 bg-black' : 'w-8 bg-gray-200'}`} />
            ))}
          </div>
        </div>

        <div className='mt-8 space-y-4'>
          {DOCUMENTS.map(doc => {
            const newFile = files[doc.id]
            const hasExisting = !!existing[doc.id]
            const previewUrl = previews[doc.id] || existing[doc.id]  // ✅ new preview or existing url
            const isPdf = previewUrl?.endsWith('.pdf') || newFile?.type === 'application/pdf'

            return (
              <div key={doc.id} className='rounded-2xl border border-gray-200 p-4 sm:p-5'>
                <div className='flex items-start gap-4'>

                  {/* ✅ Left: info + upload button */}
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-start justify-between gap-2 mb-3'>
                      <div>
                        <p className='text-sm sm:text-[17px] font-bold text-black'>{doc.title}</p>
                        <p className='text-xs text-gray-500 mt-0.5'>{doc.subtitle}</p>
                      </div>

                      {/* status badge */}
                      {newFile ? (
                        <span className='flex items-center gap-1 text-xs font-medium text-blue-600 shrink-0'>
                          <CheckCircle2 size={13} /> New
                        </span>
                      ) : hasExisting ? (
                        <span className='flex items-center gap-1 text-xs font-medium text-green-600 shrink-0'>
                          <CheckCircle2 size={13} /> Submitted
                        </span>
                      ) : null}
                    </div>

                    <input
                      ref={el => { inputRefs.current[doc.id] = el }}
                      type="file"
                      accept="image/*,.pdf"
                      className='hidden'
                      onChange={e => handleFileChange(doc.id, e)}
                    />

                    <button
                      type="button"
                      onClick={() => inputRefs.current[doc.id]?.click()}
                      className={`w-full flex items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                        newFile
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 text-gray-500 hover:border-black hover:bg-black hover:text-white'
                      }`}
                    >
                      <UploadCloud size={16} />
                      <span className='truncate max-w-[120px] sm:max-w-[200px]'>
                        {newFile ? newFile.name : hasExisting ? 'Replace' : 'Upload'}
                      </span>
                    </button>
                  </div>

                  {/* ✅ Right: small preview thumbnail */}
                  {previewUrl && (
                    <div className='flex-shrink-0'>
                      <p className='text-[10px] text-gray-400 font-medium mb-1.5 text-center'>Preview</p>
                      <button
                        type='button'
                        onClick={() => !isPdf && setPreviewModal(previewUrl)}
                        className='relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-gray-200 hover:border-black transition group'
                      >
                        {isPdf ? (
                          // PDF — show placeholder
                          <div className='w-full h-full bg-red-50 flex flex-col items-center justify-center gap-1'>
                            <span className='text-[10px] font-bold text-red-500'>PDF</span>
                            <span className='text-[9px] text-gray-400'>Uploaded</span>
                          </div>
                        ) : (
                          <>
                            <img
                              src={previewUrl}
                              alt={doc.title}
                              className='w-full h-full object-cover'
                            />
                            {/* hover overlay */}
                            <div className='absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition'>
                              <Eye size={14} className='text-white' />
                            </div>
                          </>
                        )}

                        {/* new file indicator dot */}
                        {newFile && (
                          <div className='absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white' />
                        )}
                      </button>
                    </div>
                  )}

                </div>
              </div>
            )
          })}

          <div className='flex items-center justify-center gap-2 text-center text-xs text-gray-500 pt-1'>
            <ShieldCheck size={14} className='shrink-0' />
            <span>All documents are securely stored and manually verified by our team</span>
          </div>

          {submitted && !Object.values(files).some(Boolean) ? (
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => router.push('bank')}
              className='w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold bg-black text-white hover:bg-gray-900 transition-colors'
            >
              <CheckCircle2 size={17} />
             Move to next step
              <ArrowRight size={17} />
            </motion.button>
          ) : (
            <motion.button
              type="button"
              disabled={!canContinue || loading}
              whileTap={canContinue ? { scale: 0.98 } : undefined}
              onClick={() => { if (!canContinue) return; handleSubmit() }}
              className={`w-full flex items-center justify-center rounded-xl py-3 text-sm font-semibold transition-colors ${
                canContinue
                  ? 'bg-black text-white hover:bg-gray-900'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {loading
                ? <CircleDashed size={17} className='text-white animate-spin' />
                : isUpdate ? 'Update Documents' : 'Continue'
              }
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default page