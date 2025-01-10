'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

// Declare global FB object
declare global {
  interface Window {
    FB: any
    fbAsyncInit: () => void
  }
}

// Load the JavaScript SDK asynchronously
if (typeof window !== 'undefined') {
  ;(function (d, s, id) {
    var js,
      fjs = d.getElementsByTagName(s)[0]
    if (d.getElementById(id)) return
    js = d.createElement(s) as HTMLScriptElement
    js.id = id
    js.src = 'https://connect.facebook.net/en_US/sdk.js'
    fjs.parentNode?.insertBefore(js, fjs)
  })(document, 'script', 'facebook-jssdk')

  // Facebook SDK initialization
  window.fbAsyncInit = function () {
    window.FB.init({
      appId: process.env.NEXT_PUBLIC_FB_APP_ID,
      cookie: true,
      xfbml: true,
      version: 'v19.0',
    })
    window.FB.AppEvents.logPageView()
  }
}

async function launchWhatsAppSignup(
  setCode: (code: string | null) => void,
  setAccessToken: (token: string | null) => void,
) {
  if (typeof window !== 'undefined' && window.FB) {
    window.FB.login(
      function (response: any) {
        if (response.authResponse?.code) {
          setCode(response.authResponse.code)
        }
        if (response.authResponse?.accessToken) {
          setAccessToken(response.authResponse.accessToken)
        }
      },
      {
        config_id: process.env.NEXT_PUBLIC_FB_CONFIG_ID,
        response_type: 'code',
        override_default_response_type: true,
        extras: {
          sessionInfoVersion: 2,
        },
      },
    )
  }
}

const sessionInfoListener = (
  event: MessageEvent,
  setSignupData: (data: any) => void,
) => {
  if (event.origin !== 'https://www.facebook.com') return
  try {
    const data = JSON.parse(event.data)
    if (data.type === 'WA_EMBEDDED_SIGNUP') {
      if (data.event === 'FINISH') {
        const { phone_number_id, waba_id } = data.data
        setSignupData({
          phoneNumberId: phone_number_id,
          whatsappBusinessAccountId: waba_id,
        })
      } else {
        const { current_step } = data.data
        // Handle current step if needed
      }
    }
  } catch {
    console.log('Non JSON Response')
  }
}

interface FacebookLoginComponentProps {
  instanceId: string
}

const FacebookLoginComponent: React.FC<FacebookLoginComponentProps> = ({
  instanceId,
}) => {
  const [code, setCode] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [signupData, setSignupData] = useState<any>({})

  const handleSignupComplete = async () => {
    try {
      const response = await fetch('/api/common/whatsapp/requestAccessToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instanceId, code, ...signupData }),
      })
      if (!response.ok) {
        throw new Error('Failed to request access token')
      }
    } catch (error) {
      console.error('Error in handleSignupComplete:', error)
    }
  }

  const handleDebug = async () => {
    try {
      const response = await fetch('/api/common/whatsapp/debugToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instanceId, accessToken, ...signupData }),
      })
      if (!response.ok) {
        throw new Error('Failed to debug token')
      }
    } catch (error) {
      console.error('Error in handleDebug:', error)
    }
  }

  useEffect(() => {
    const listener = (event: MessageEvent) => {
      sessionInfoListener(event, setSignupData)
    }
    window.addEventListener('message', listener)
    return () => {
      window.removeEventListener('message', listener)
    }
  }, [])

  useEffect(() => {
    if (code) {
      handleSignupComplete()
    }
  }, [code])

  useEffect(() => {
    if (accessToken) {
      handleDebug()
    }
  }, [accessToken])

  return (
    <Button
      onClick={() => launchWhatsAppSignup(setCode, setAccessToken)}
      className="h-10 min-w-[180px] rounded-xl bg-[#1877F2] font-bold text-white hover:bg-[#1877F2] hover:text-white"
    >
      Launch WhatsApp Signup
    </Button>
  )
}

export default FacebookLoginComponent