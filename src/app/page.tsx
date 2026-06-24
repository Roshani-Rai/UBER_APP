"use client"
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import AdminDashboard from "@/componets/AdminDashboard"
import Footer from "@/componets/Footer"
import Nav from "@/componets/Nav"
import PartnerDashboard from "@/componets/PartnerDashboard"
import PublicHome from "@/componets/PublicHome"

export default function Home() {
  const { userData } = useSelector((state: RootState) => state.user)

  return (
    <div className="w-full min-h-screen bg-white">
     
      {userData?.role === 'partner' ? (
        <>
         <Nav />
         <PartnerDashboard />
        </>
       
      ) : userData?.role === 'admin' ? (
        <AdminDashboard />
      ) : (
        <>
        <Nav />
         <PublicHome />
        </>
       
      )}
      <Footer />
    </div>
  )
}