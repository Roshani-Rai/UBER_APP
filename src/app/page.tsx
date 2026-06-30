// NO "use client" here
import { auth } from '@/auth'
import connectDb from './lib/db'
import User from './modals/user.modals'
import HomeClient from '@/componets/HomeClient'


export default async function Home() {
  const session = await auth()
  await connectDb()
  const user = await User.findOne({ email: session?.user?.email }).lean()

  return (
    <HomeClient
      userId={user?._id?.toString()}
      role={user?.role}
    />
  )
}