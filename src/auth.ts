import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import connectDb from "./app/lib/db"
import User from "./app/modals/user.modals"
import bcrypt from "bcryptjs"
import Google from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {
          type: "email",
          label: "Email",
          placeholder: "johndoe@gmail.com",
        },
        password: {
          type: "password",
          label: "Password",
          placeholder: "*****",
        },
      },
      async authorize(credentials) {
        if (!credentials.email || !credentials.password) {
          return null
        }

        const email = (credentials.email as string).toLowerCase().trim()
        const password = credentials.password as string

        await connectDb()
        const user = await User.findOne({ email })

        if (!user || !user.password) return null

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) return null

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        // Only auto-link/create when Google has verified the email,
        // otherwise an unverified address could be used to hijack
        // an existing account.
        if (!profile?.email_verified) return false

        await connectDb()
        const email = (user.email as string).toLowerCase().trim()
        let dbUser = await User.findOne({ email })

        if (!dbUser) {
          dbUser = await User.create({
            name: user.name,
            email,
            role: "user",
          })
        }

        user.id = dbUser._id.toString()
        user.role = dbUser.role
      }
      return true
    },

    async jwt({ token, user }) {
      if (user) {
        token.name = user.name
        token.id = user.id
        token.email = user.email
        token.role = user.role
      }
      return token
    },

    async session({ token, session }) {
      if (session.user) {
        session.user.name = token.name as string
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.email = token.email as string
      }
      return session
    },
  },
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 10 * 24 * 60 * 60,
  },
  secret: process.env.AUTH_SECRET,
})