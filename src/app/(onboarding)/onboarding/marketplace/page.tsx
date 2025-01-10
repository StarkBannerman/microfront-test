'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Laptop } from 'lucide-react'

const platforms = [
  {
    id: 'shopify',
    name: 'Shopify',
    appUrl: 'https://apps.shopify.com/mercuri-ai-copilot',
    logo: 'https://static.wixstatic.com/media/94f2c6_cccbbcb71e93466785e6ea963d764f6f~mv2.png',
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    appUrl:
      'https://teams.microsoft.com/l/app/d5ebe090-aa87-4b62-8167-3945cbcca963?source=app-details-dialog',
    logo: 'https://static.wixstatic.com/media/6d91dc_40f9589b6e5b4f128bad1b44d9099936~mv2.jpeg',
  },
  {
    id: 'pipedrive',
    name: 'Pipedrive',
    logo: 'https://static.wixstatic.com/media/94f2c6_855b1462022c4d0e8594880882e355b4~mv2.webp',
    appUrl:
      'https://oauth.pipedrive.com/oauth/authorize?client_id=62896db00e661e59&redirect_uri=https%3A%2F%2Fapp.mercuri.cx%2Fcommon%2Fpipedrive%2Fauth',
  },
  {
    id: 'wix',
    name: 'Wix',
    appUrl: 'https://www.wix.com/app-market/mercuri-ai-with-chatgpt',
    logo: 'https://static.wixstatic.com/media/6d91dc_d7078de961fd4a5fb47f2ef99fda4723~mv2.jpeg',
  },
  {
    id: 'hubspot',
    name: 'Hubspot',
    appUrl:
      'https://app.hubspot.com/oauth/authorize?client_id=08248a21-52bd-494c-bbe3-e2d5b821717a&redirect_uri=https://app.mercuri.cx/common/hubspot/auth&scope=crm.objects.users.read%20crm.objects.contacts.write%20crm.objects.users.write%20crm.objects.companies.write%20crm.objects.companies.read%20crm.objects.deals.read%20crm.objects.deals.write%20crm.objects.contacts.read',
    logo: 'https://static.wixstatic.com/shapes/6d91dc_e3f38918758e4b13a286efbb3e6faca5.svg',
  },
  {
    id: 'other',
    name: 'Other',
    appUrl: '/auth/signup',
    logo: null,
  },
]

export default function PlatformSelection() {
  const [selectedPlatform, setSelectedPlatform] = useState('')
  const router = useRouter()

  const handlePlatformSelect = (platformId: string) => {
    setSelectedPlatform(platformId)
    const platform = platforms.find((p) => p.id === platformId)
    if (platform) {
      router.push(platform.appUrl)
    }
  }

  return (
    <div className="container mx-auto max-w-4xl py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Select Your Website Platform
          </CardTitle>
          <CardDescription className="text-center">
            Choose the platform you used to build your website. If it's not
            listed, select "Other".
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap justify-center gap-6">
            {platforms.map((platform) => (
              <Button
                key={platform.id}
                variant="outline"
                className="w-[calc(50%-12px)] md:w-[calc(25%-18px)] h-auto flex flex-col items-center justify-center p-4 hover:bg-accent"
                onClick={() => handlePlatformSelect(platform.id)}
              >
                <div className="w-32 h-32 relative mb-4 flex items-center justify-center">
                  {platform.logo ? (
                    <Image
                      src={platform.logo}
                      alt={`${platform.name} logo`}
                      fill
                      style={{ objectFit: 'contain' }}
                    />
                  ) : (
                    <Laptop className="w-24 h-24 text-gray-400" />
                  )}
                </div>
                <span className="text-sm font-medium">{platform.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
