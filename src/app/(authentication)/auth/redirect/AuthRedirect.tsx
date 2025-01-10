'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { signIn, useSession } from 'next-auth/react'
import AppExtensionsSDK from '@pipedrive/app-extensions-sdk'
import { Loader2 } from 'lucide-react'

export default function AuthRedirectContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const appPlatform = searchParams.get('platform')
  const [receivedToken, setReceivedToken] = useState(searchParams.get('token'))

  const initializeSdk = async () => {
    const sdk = await new AppExtensionsSDK({
      identifier: searchParams.get('id') ?? undefined,
    }).initialize({ size: { height: 600, width: 700 } })
  }

  const authenticate = async (exchangeToken: string) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_APP_BASE_URL}/sharedInbox/auth/authExchange`,
        {},
        { headers: { exchangeToken } },
      )

      if (response.status === 200) {
        const result = await signIn('credentials', {
          redirect: false,
          token: response.data?.authToken,
          userState: JSON.stringify(response.data?.userState),
        })

        if (result?.ok) {
          const currentParams = new URLSearchParams(searchParams.toString())
          currentParams.set('view', 'iframe')
          router.push(`/conversation?${currentParams.toString()}`)
        } else {
          router.push('/login')
        }
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Error authenticating exchange token:', error)
      router.push('/login')
    }
  }

  useEffect(() => {
    if (appPlatform === 'pipedrive') {
      console.log('Initializing Pipedrive Instance')
      initializeSdk()
    }

    const handleMessage = (event: MessageEvent) => {
      const allowedOrigins = [
        process.env.NEXT_PUBLIC_APP_BASE_URL,
        process.env.NEXT_PUBLIC_TEAMS_APP_BASE_URL,
      ]

      if (!allowedOrigins.includes(event.origin)) return

      console.log('Inside Handle Message')
      const { token } = event.data
      if (token) {
        setReceivedToken(token)
      }
    }

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [appPlatform, searchParams])

  useEffect(() => {
    if (receivedToken && status === 'unauthenticated') {
      authenticate(receivedToken)
    }
  }, [receivedToken, status])

  if (status === 'loading') {
    return (
      <div className="flex flex-col justify-center items-center w-screen h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  if (status === 'authenticated') {
    const currentParams = new URLSearchParams(searchParams.toString())
    currentParams.set('view', 'iframe')
    router.push(`/conversation?${currentParams.toString()}`)
    return null
  }

  return null
}

