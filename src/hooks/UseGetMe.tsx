"use client"

import { setUserData } from '@/redux/userSlice'
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'

function UseGetMe(enabled: boolean) {
  const dispatch = useDispatch()

  useEffect(() => {
    if (!enabled) return

    const getMe = async () => {
      try {
        const { data } = await axios.get("/api/auth/user")
        dispatch(setUserData(data.user))
      } catch (error: any) {
        toast.error(error?.response?.data?.message || error.message)
      }
    }

    getMe()
  }, [enabled, dispatch])
}

export default UseGetMe