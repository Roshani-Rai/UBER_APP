"use client"
import AdminDashboard from "@/componets/AdminDashboard"
import Footer from "@/componets/Footer"
import Nav from "@/componets/Nav"
import PartnerDashboard from "@/componets/PartnerDashboard"
import PublicHome from "@/componets/PublicHome"
import GeoUpdate from '@/componets/GeoUpdate'

type Props = {
  userId?: string
  role?: string
}

export default function HomeClient({ userId, role }: Props) {
  return (
    <div className="w-full min-h-screen bg-white">
      {userId && <GeoUpdate userId={userId} />}
      {role === 'partner' ? (
        <>
          <Nav />
          <PartnerDashboard />
        </>
      ) : role === 'admin' ? (
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