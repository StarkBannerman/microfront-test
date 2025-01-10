'use client'

import { useState, useEffect } from 'react'
import { Switch } from '@/components/ui/switch'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Globe, MessageSquare, Phone, MessageCircleMore } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import axiosInstance from '@/lib/axios'

interface SmsNumber {
  phoneNumberId: string
  accountId: string
  organizationId: string
  messagingServiceId: string
  phoneNumber: string
  numberType: string
  capabilities: {
    fax: boolean
    voice: boolean
    sms: boolean
    mms: boolean
  }
  optInEnabled: boolean
  optOutEnabled: boolean
  optInKeywords: string[]
  optInReplyText: string
  optOutKeywords: string[]
  optOutReplyText: string
  initialFee: string
  monthlyFee: string
  createdAt: string
  updatedAt: string
}

interface SmsAccount {
  accountId: string
  organizationId: string
  ownerAccountId: string
  authToken: string
  accountName: string
  serviceProvider: string
  status: string
  createdAt: string
  updatedAt: string
  smsNumbers: SmsNumber[]
}

interface WhatsappNumber {
  phoneNumberId: string
  accountId: string
  organizationId: string
  pin: string
  verifiedName: string
  phoneNumber: string
  registrationStatus: string
  connectionStatus: string
  qualityRating: string
  createdAt: string
  updatedAt: string
  optInEnabled: boolean
  optOutEnabled: boolean
  optInKeywords: string[] | null
  optInReplyText: string
  optOutKeywords: string[] | null
  optOutReplyText: string
}

interface WhatsAppAccount {
  accountId: string
  organizationId: string
  accountName: string
  currency: string
  timezoneId: string
  createdAt: string
  updatedAt: string
  whatsappNumbers: WhatsappNumber[]
}

interface MessagingSetting {
  instanceId: string
  organizationId: string
  smsEnabled: boolean
  smsDefaultNumber: string
  whatsappEnabled: boolean
  whatsappDefaultNumber: string
  createdAt: string
  updatedAt: string
}

interface App {
  instanceId: string
  organizationId: string
  platform: string
  website: string
  businessName: string
  isAppInstalled: boolean
}

interface MessagingData {
  messagingsettings: MessagingSetting[]
  smsAccounts: SmsAccount[]
  whatsAppAccounts: WhatsAppAccount[]
  apps: App[]
}

async function getMessagingSettings(): Promise<MessagingData> {
  try {
    const response = await axiosInstance.post(
      '/api/messaging-settings/get-settings',
    )
    return response.data
  } catch (error) {
    console.error('Error fetching messaging settings:', error)
    return {
      messagingsettings: [],
      smsAccounts: [],
      whatsAppAccounts: [],
      apps: [],
    }
  }
}

export default function MessagingSettingsPage() {
  const [data, setData] = useState<MessagingData>({
    messagingsettings: [],
    smsAccounts: [],
    whatsAppAccounts: [],
    apps: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const responseData = await getMessagingSettings()
      setData(responseData)
      setIsLoading(false)
    }
    fetchData()
  }, [])

  const handleToggle = async (
    instanceId: string,
    field: 'smsEnabled' | 'whatsappEnabled',
  ) => {
    try {
      const updatedSettings = data.messagingsettings.map((setting) => {
        if (setting.instanceId === instanceId) {
          return { ...setting, [field]: !setting[field] }
        }
        return setting
      })

      // Make API call to update the server
      await axiosInstance.post('/api/messaging-settings/update-settings', {
        instanceId,
        [field]: !data.messagingsettings.find(
          (s) => s.instanceId === instanceId,
        )?.[field],
      })

      // Update local state after successful API call
      setData((prev) => ({ ...prev, messagingsettings: updatedSettings }))
    } catch (error) {
      console.error('Error updating settings:', error)
      // Optionally, show an error message to the user
    }
  }

  const handleDefaultNumberChange = async (
    instanceId: string,
    phoneNumberId: string,
    type: 'sms' | 'whatsapp',
  ) => {
    try {
      const field =
        type === 'sms' ? 'smsDefaultNumber' : 'whatsappDefaultNumber'
      const updatedSettings = data.messagingsettings.map((setting) => {
        if (setting.instanceId === instanceId) {
          return { ...setting, [field]: phoneNumberId }
        }
        return setting
      })

      // Make API call to update the server
      await axiosInstance.post('/api/messaging-settings/update-settings', {
        instanceId,
        [field]: phoneNumberId,
      })

      // Update local state after successful API call
      setData((prev) => ({ ...prev, messagingsettings: updatedSettings }))
    } catch (error) {
      console.error('Error updating default number:', error)
      // Optionally, show an error message to the user
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">Messaging Settings</h1>
      <div className="space-y-8">
        {data.messagingsettings.map((setting) => {
          const app = data.apps.find(
            (app) => app.instanceId === setting.instanceId,
          )
          const smsNumbers = data.smsAccounts.flatMap(
            (account) => account.smsNumbers,
          )
          const whatsappNumbers = data.whatsAppAccounts.flatMap(
            (account) => account.whatsappNumbers,
          )

          const currentSmsNumber = smsNumbers.find(
            (num) => num.phoneNumberId === setting.smsDefaultNumber,
          )
          const currentWhatsappNumber = whatsappNumbers.find(
            (num) => num.phoneNumberId === setting.whatsappDefaultNumber,
          )

          return (
            <Card key={setting.instanceId} className="overflow-hidden">
              <CardHeader className="bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      {app?.businessName || 'Unknown App'}
                    </CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Globe className="w-4 h-4 mr-1" />
                      {app?.website || 'No website available'}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={app?.isAppInstalled ? 'secondary' : 'destructive'}
                  >
                    {app?.isAppInstalled ? 'Installed' : 'Not Installed'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <MessageSquare className="w-5 h-5 mr-2" />
                        SMS Channel
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-semibold">SMS Enabled</span>
                        <Switch
                          checked={setting.smsEnabled}
                          onCheckedChange={() =>
                            handleToggle(setting.instanceId, 'smsEnabled')
                          }
                        />
                      </div>
                      {setting.smsEnabled && (
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              <span className="font-medium">Number:</span>
                            </div>
                            {smsNumbers.length > 1 ? (
                              <Select
                                value={setting.smsDefaultNumber}
                                onValueChange={(value) =>
                                  handleDefaultNumberChange(
                                    setting.instanceId,
                                    value,
                                    'sms',
                                  )
                                }
                              >
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue>
                                    {currentSmsNumber?.phoneNumber}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  {smsNumbers.map((number) => (
                                    <SelectItem
                                      key={number.phoneNumberId}
                                      value={number.phoneNumberId}
                                    >
                                      {number.phoneNumber}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span>{currentSmsNumber?.phoneNumber}</span>
                                <Badge className="bg-primary hover:bg-primary text-primary-foreground">
                                  Default
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <MessageCircleMore className="w-5 h-5 mr-2" />
                        WhatsApp Channel
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-semibold">WhatsApp Enabled</span>
                        <Switch
                          checked={setting.whatsappEnabled}
                          onCheckedChange={() =>
                            handleToggle(setting.instanceId, 'whatsappEnabled')
                          }
                        />
                      </div>
                      {setting.whatsappEnabled && (
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              <span className="font-medium">Number:</span>
                            </div>
                            {whatsappNumbers.length > 1 ? (
                              <Select
                                value={setting.whatsappDefaultNumber}
                                onValueChange={(value) =>
                                  handleDefaultNumberChange(
                                    setting.instanceId,
                                    value,
                                    'whatsapp',
                                  )
                                }
                              >
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue>
                                    {currentWhatsappNumber?.phoneNumber}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  {whatsappNumbers.map((number) => (
                                    <SelectItem
                                      key={number.phoneNumberId}
                                      value={number.phoneNumberId}
                                    >
                                      {number.phoneNumber}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span>
                                  {currentWhatsappNumber?.phoneNumber}
                                </span>
                                <Badge className="bg-primary hover:bg-primary text-primary-foreground">
                                  Default
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
