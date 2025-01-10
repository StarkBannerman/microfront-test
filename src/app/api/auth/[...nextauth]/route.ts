import NextAuth, { NextAuthOptions, DefaultSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string
      userId: string
      accountInfo: {
        firstName: string
        lastName: string
        email: string
      }
      credits: string
      connectedInstances: Array<{
        instanceId: string
        platform: string
        businessName: string
        website: string
        permissions: Record<string, any>
      }>
      accessToken: string
      tokenType: string
      isMainAccount: boolean
      permissions: Record<string, any>
    }
    credits: string
    connectedInstances: Array<{
      instanceId: string
      platform: string
      businessName: string
      website: string
      permissions: Record<string, any>
    }>
    accessToken: string
    tokenType: string
    isMainAccount: boolean
    permissions: Record<string, any>
  }

  interface User {
    id: string
    userId: string
    email: string
    accountInfo: {
      firstName: string
      lastName: string
      email: string
    }
    credits: string
    connectedInstances: Array<{
      instanceId: string
      platform: string
      businessName: string
      website: string
      permissions: Record<string, any>
    }>
    accessToken: string
    tokenType: string
    isMainAccount: boolean
    permissions: Record<string, any>
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    userId: string
    email: string
    credits: string
    accountInfo: {
      firstName: string
      lastName: string
      email: string
    }
    connectedInstances: Array<{
      instanceId: string
      platform: string
      businessName: string
      website: string
      permissions: Record<string, any>
    }>
    accessToken: string
    tokenType: string
    isMainAccount: boolean
    permissions: Record<string, any>
  }
}

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/login`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Auth-Email': credentials?.email!,
                'Auth-Password': credentials?.password!,
              },
            },
          )

          const data = await response.json()

          if (!response.ok) {
            console.error('Authentication failed:', data)
            return null
          }

          if (!data.authData || !data.authData.authState) {
            console.error('Unexpected response structure:', data)
            return null
          }

          const { authData } = data
          const { authState, accessToken, tokenType } = authData
          const instancePermissions =
            authState.connectedInstances[0]?.permissions || {}

          return {
            id: authState.userId,
            userId: authState.userId,
            email: credentials?.email!,
            accountInfo: {
              ...authState.accountInfo,
              email: credentials?.email!,
            },
            credits: authState?.credits || '',
            connectedInstances: authState.connectedInstances || [],
            permissions: instancePermissions,
            accessToken: accessToken || '',
            tokenType: tokenType || '',
            isMainAccount: authState.isMainAccount || false,
          }
        } catch (error) {
          console.error('Error during authentication:', error)
          return null
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.userId = user.userId
        token.email = user.email
        token.credits = user.credits
        token.accountInfo = user.accountInfo
        token.connectedInstances = user.connectedInstances
        token.permissions = user.permissions
        token.accessToken = user.accessToken
        token.tokenType = user.tokenType
        token.isMainAccount = user.isMainAccount
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          userId: token.userId,
          accountInfo: {
            ...(token.accountInfo || {
              firstName: '',
              lastName: '',
              email: '',
            }),
            email: token.email,
          },
          credits: token.credits || '',
          connectedInstances: token.connectedInstances || [],
          accessToken: token.accessToken || '',
          tokenType: token.tokenType || '',
          isMainAccount: token.isMainAccount || false,
          permissions: token.permissions || {},
        }
        session.credits = token.credits || ''
        session.connectedInstances = token.connectedInstances || []
        session.accessToken = token.accessToken || ''
        session.tokenType = token.tokenType || ''
        session.isMainAccount = token.isMainAccount || false
        session.permissions = token.permissions || {}
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
