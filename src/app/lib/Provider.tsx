// app/providers.tsx — "use client" isolated to just this file
"use client"

import { SessionProvider } from 'next-auth/react'
 

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      
        {children}
    
    </SessionProvider>
  )
}