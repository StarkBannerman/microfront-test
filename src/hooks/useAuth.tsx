import { useSession } from 'next-auth/react'

export function useAuth() {
  const { data: session, status } = useSession()
  const isAuthenticated = status === 'authenticated'

  return {
    session,
    isAuthenticated,
    user: session?.user,
  }
}