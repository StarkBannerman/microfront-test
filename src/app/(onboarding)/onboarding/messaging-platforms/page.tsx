'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MessageSquare, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import FacebookLoginComponent from '@/components/FacebookLoginComponent'

export default function MessagingPlatforms() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [showWhatsAppSignup, setShowWhatsAppSignup] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const onboardchannel = searchParams.get('onboardchannel')
    if (onboardchannel === 'whatsapp') {
      setSelectedPlatforms((prev) => [...prev, 'whatsapp'])
      setShowWhatsAppSignup(true)
    } else if (onboardchannel === 'sms') {
      setSelectedPlatforms((prev) => [...prev, 'sms'])
      router.push('/onboarding/sms')
    }
  }, [searchParams])

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform],
    )
  }

  const handleContinue = () => {
    if (selectedPlatforms.includes('whatsapp')) {
      setShowWhatsAppSignup(true)
    } else if (selectedPlatforms.includes('sms')) {
      router.push('/onboarding/sms')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Choose Your Messaging Platforms
      </h1>
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Select Platforms</CardTitle>
          <CardDescription>
            Choose one or both messaging platforms for your business
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!showWhatsAppSignup && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedPlatforms.includes('whatsapp')
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200 hover:border-primary'
                  }`}
                  onClick={() => handlePlatformToggle('whatsapp')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <MessageCircle className="w-6 h-6 text-primary" />
                    <Checkbox
                      id="whatsapp"
                      checked={selectedPlatforms.includes('whatsapp')}
                      onCheckedChange={() => handlePlatformToggle('whatsapp')}
                    />
                  </div>
                  <label
                    htmlFor="whatsapp"
                    className="font-medium cursor-pointer"
                  >
                    WhatsApp
                  </label>
                </div>
                <div
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedPlatforms.includes('sms')
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200 hover:border-primary'
                  }`}
                  onClick={() => handlePlatformToggle('sms')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <MessageSquare className="w-6 h-6 text-primary" />
                    <Checkbox
                      id="sms"
                      checked={selectedPlatforms.includes('sms')}
                      onCheckedChange={() => handlePlatformToggle('sms')}
                    />
                  </div>
                  <label htmlFor="sms" className="font-medium cursor-pointer">
                    SMS
                  </label>
                </div>
              </div>
              <Button
                onClick={handleContinue}
                className="w-full"
                disabled={selectedPlatforms.length === 0}
              >
                Continue
              </Button>
            </>
          )}

          {showWhatsAppSignup && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">WhatsApp Onboarding</h3>
              <p>Follow these steps to connect your business to WhatsApp:</p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Click "Launch WhatsApp Signup" below</li>
                <li>Sign in with your Facebook account</li>
                <li>Choose or create a Business Manager</li>
                <li>Select a WhatsApp phone number</li>
                <li>Add a payment method to your Meta account</li>
                <li>Provide necessary tax information</li>
              </ol>
              <FacebookLoginComponent instanceId="whatsapp-instance" />
              {selectedPlatforms.includes('sms') && (
                <Button
                  onClick={() => router.push('/onboarding/sms')}
                  className="w-full mt-4"
                >
                  Continue to SMS Setup
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
