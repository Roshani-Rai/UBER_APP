"use client"

import { useSession } from 'next-auth/react'
import React from 'react'
import UseGetMe from './hooks/UseGetMe'

function InitUser() {
 
  const {status} = useSession()
    UseGetMe(status == "authenticated")
  
  return null
}

export default InitUser
