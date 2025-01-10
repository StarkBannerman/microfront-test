'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Phone,
  MessageSquare,
  Edit2,
  Check,
  X,
  MessageCircle,
  MessageSquareOff,
  AlertCircle,
} from 'lucide-react'
// import { useToast } from '@/components/ui/use-toast'
import { useToast } from '@/hooks/use-toast'
import type {
  SmsAccount,
  SmsNumber,
  WhatsappBusinessAccount,
  WhatsappNumber,
  App,
  ChannelConfiguration,
} from '@/lib/channelTypes'
import axiosInstance from '@/lib/axios'

interface KeywordInputProps {
  keywords: string[]
  onChange: (keywords: string[]) => void
  placeholder?: string
}

function KeywordInput({ keywords, onChange, placeholder }: KeywordInputProps) {
  const [inputValue, setInputValue] = useState('')

  const handleAddKeyword = () => {
    if (inputValue.trim()) {
      onChange([...keywords, inputValue.trim()])
      setInputValue('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddKeyword()
    }
  }

  const handleRemoveKeyword = (indexToRemove: number) => {
    onChange(keywords.filter((_, index) => index !== indexToRemove))
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleAddKeyword}
          disabled={!inputValue.trim()}
        >
          Add
        </Button>
      </div>
      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {keywords.map((keyword, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {keyword}
              <button
                onClick={() => handleRemoveKeyword(index)}
                className="ml-1 hover:text-destructive focus:outline-none"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

interface NumberCardProps {
  number: SmsNumber | WhatsappNumber
  type: 'sms' | 'whatsapp'
  onUpdate: (updatedNumber: SmsNumber | WhatsappNumber) => void
  apps: App[]
  channelConfiguration?: ChannelConfiguration
  onAssignInstance: (
    number: SmsNumber | WhatsappNumber,
    instanceId: string,
  ) => void
}

function NumberCard({
  number,
  type,
  onUpdate,
  apps,
  channelConfiguration,
  onAssignInstance,
}: NumberCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedNumber, setEditedNumber] = useState(number)
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(
    null,
  )

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setEditedNumber((prev) => ({ ...prev, [name]: value }))
  }

  const handleKeywordsChange =
    (field: 'optInKeywords' | 'optOutKeywords') => (keywords: string[]) => {
      setEditedNumber((prev) => ({ ...prev, [field]: keywords }))
    }

  const handleSwitchChange = (name: string) => (checked: boolean) => {
    setEditedNumber((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSave = () => {
    onUpdate(editedNumber)
    setIsEditing(false)
  }

  const handleAssignInstance = () => {
    if (selectedInstanceId) {
      onAssignInstance(number, selectedInstanceId)
    }
  }

  const assignedApp = channelConfiguration
    ? apps.find((app) => app.instanceId === channelConfiguration.instanceId)
    : null

  return (
    <Card className="mb-4 overflow-hidden">
      <CardContent className="p-0">
        <div className="bg-muted p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{number.phoneNumber}</h3>
              <p className="text-sm text-muted-foreground">
                {type === 'sms'
                  ? (number as SmsNumber).numberType
                  : (number as WhatsappNumber).verifiedName}
              </p>
              {assignedApp ? (
                <Badge variant="outline" className="mt-2">
                  Assigned to: {assignedApp.businessName}
                </Badge>
              ) : (
                <div className="mt-2 flex items-center">
                  <select
                    className="text-sm border rounded p-1 mr-2"
                    value={selectedInstanceId || ''}
                    onChange={(e) => setSelectedInstanceId(e.target.value)}
                  >
                    <option value="">Select an app</option>
                    {apps.map((app) => (
                      <option key={app.instanceId} value={app.instanceId}>
                        {app.businessName}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAssignInstance}
                    disabled={!selectedInstanceId}
                  >
                    Assign
                  </Button>
                </div>
              )}
            </div>
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                  <DialogTitle>Edit Number Settings</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto px-6">
                  <div className="grid gap-4 py-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="opt-in-enabled" className="text-sm">
                        Opt-In Enabled
                      </Label>
                      <Switch
                        id="opt-in-enabled"
                        checked={editedNumber.optInEnabled}
                        onCheckedChange={handleSwitchChange('optInEnabled')}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="opt-out-enabled" className="text-sm">
                        Opt-Out Enabled
                      </Label>
                      <Switch
                        id="opt-out-enabled"
                        checked={editedNumber.optOutEnabled}
                        onCheckedChange={handleSwitchChange('optOutEnabled')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="opt-in-keywords" className="text-sm">
                        Opt-In Keywords
                      </Label>
                      <KeywordInput
                        keywords={editedNumber.optInKeywords || []}
                        onChange={handleKeywordsChange('optInKeywords')}
                        placeholder="Enter keyword and press Add or Enter"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="opt-in-reply" className="text-sm">
                        Opt-In Reply
                      </Label>
                      <Textarea
                        id="opt-in-reply"
                        name="optInReplyText"
                        value={editedNumber.optInReplyText}
                        onChange={handleInputChange}
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="opt-out-keywords" className="text-sm">
                        Opt-Out Keywords
                      </Label>
                      <KeywordInput
                        keywords={editedNumber.optOutKeywords || []}
                        onChange={handleKeywordsChange('optOutKeywords')}
                        placeholder="Enter keyword and press Add or Enter"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="opt-out-reply" className="text-sm">
                        Opt-Out Reply
                      </Label>
                      <Textarea
                        id="opt-out-reply"
                        name="optOutReplyText"
                        value={editedNumber.optOutReplyText}
                        onChange={handleInputChange}
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t flex-shrink-0">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>Save Changes</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex space-x-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">Opt-In</span>
              </div>
              <div className="pl-7">
                <p className="text-sm font-medium">
                  Status:
                  <span
                    className={
                      number.optInEnabled
                        ? 'text-green-500 ml-1'
                        : 'text-red-500 ml-1'
                    }
                  >
                    {number.optInEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </p>
                <div className="mt-1 flex items-center">
                  <span className="text-sm font-medium">Keywords:</span>
                  <div className="flex flex-wrap gap-1 ml-1">
                    {number.optInKeywords && number.optInKeywords.length > 0 ? (
                      number.optInKeywords.map((keyword, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {keyword}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        No keywords set
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <MessageSquareOff className="h-5 w-5 text-red-500" />
                <span className="font-medium">Opt-Out</span>
              </div>
              <div className="pl-7">
                <p className="text-sm font-medium">
                  Status:
                  <span
                    className={
                      number.optOutEnabled
                        ? 'text-green-500 ml-1'
                        : 'text-red-500 ml-1'
                    }
                  >
                    {number.optOutEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </p>
                <div className="mt-1 flex items-center">
                  <span className="text-sm font-medium">Keywords:</span>
                  <div className="flex flex-wrap gap-1 ml-1">
                    {number.optOutKeywords &&
                    number.optOutKeywords.length > 0 ? (
                      number.optOutKeywords.map((keyword, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {keyword}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        No keywords set
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Separator />
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium mb-1">Opt-In Reply</h4>
              <p className="text-sm bg-muted p-2 rounded">
                {number.optInReplyText}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">Opt-Out Reply</h4>
              <p className="text-sm bg-muted p-2 rounded">
                {number.optOutReplyText}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface AccountCardProps {
  account: SmsAccount | WhatsappBusinessAccount
  numbers: (SmsNumber | WhatsappNumber)[]
  type: 'sms' | 'whatsapp'
  onUpdate: (updatedNumber: SmsNumber | WhatsappNumber) => void
  apps: App[]
  channelConfigurations: ChannelConfiguration[]
  onAssignInstance: (
    number: SmsNumber | WhatsappNumber,
    instanceId: string,
  ) => void
}

function AccountCard({
  account,
  numbers,
  type,
  onUpdate,
  apps,
  channelConfigurations,
  onAssignInstance,
}: AccountCardProps) {
  const phoneNumbers = numbers || []

  return (
    <Card className="mb-4">
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{account.accountName}</CardTitle>
          <Badge
            variant={
              (type === 'sms' ? (account as SmsAccount).status : 'active') ===
              'active'
                ? 'default'
                : 'secondary'
            }
          >
            {type === 'sms' ? (account as SmsAccount).status : 'active'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {type === 'sms'
            ? `Provider: ${(account as SmsAccount).serviceProvider}`
            : `Currency: ${(account as WhatsappBusinessAccount).currency}`}
        </p>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        {phoneNumbers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No associated numbers</p>
        ) : (
          phoneNumbers.map((number) => {
            const channelConfig = channelConfigurations.find(
              (config) =>
                config.phoneNumberId === number.phoneNumberId &&
                config.channel === type,
            )
            return (
              <NumberCard
                key={number.phoneNumberId}
                number={number}
                type={type}
                onUpdate={onUpdate}
                apps={apps}
                channelConfiguration={channelConfig}
                onAssignInstance={onAssignInstance}
              />
            )
          })
        )}
      </CardContent>
    </Card>
  )
}

function NoAccountsCard({
  type,
  onboardRoute,
}: {
  type: 'SMS' | 'WhatsApp'
  onboardRoute: string
}) {
  const router = useRouter()

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertCircle className="mr-2 h-5 w-5 text-yellow-500" />
          No {type} Accounts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">
          You haven't onboarded any {type} accounts yet. To get started with{' '}
          {type}, please onboard a {type.toLowerCase()} channel.
        </p>
        <Button onClick={() => router.push(onboardRoute)}>
          Onboard {type} Channel
        </Button>
      </CardContent>
    </Card>
  )
}

export default function ChannelConfigurations() {
  const router = useRouter()
  const [smsAccounts, setSmsAccounts] = useState<SmsAccount[]>([])
  const [whatsAppAccounts, setWhatsAppAccounts] = useState<
    WhatsappBusinessAccount[]
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [apps, setApps] = useState<App[]>([])
  const [channelConfigurations, setChannelConfigurations] = useState<
    ChannelConfiguration[]
  >([])
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState<'sms' | 'whatsapp'>(
    whatsAppAccounts.length > 0 && smsAccounts.length === 0
      ? 'whatsapp'
      : 'sms',
  )

  const handleTabChange = (value: string) => {
    if (value === 'sms' || value === 'whatsapp') {
      setActiveTab(value as 'sms' | 'whatsapp')
    }
  }

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        setError(null)
        const response = await axiosInstance.post(
          '/api/channels/channelConfigurations/get-configurations',
        )
        const data = response.data

        if (!data) {
          throw new Error('No data received from the API')
        }

        setSmsAccounts(data.smsAccounts || [])
        setWhatsAppAccounts(data.whatsAppAccounts || [])
        setApps(data.apps || [])
        setChannelConfigurations(data.channelConfigurations || [])

        // Set the initial active tab based on account existence
        if (
          data.whatsAppAccounts?.length > 0 &&
          (!data.smsAccounts || data.smsAccounts.length === 0)
        ) {
          setActiveTab('whatsapp')
        }
      } catch (error) {
        console.error('Error fetching channel configurations:', error)
        setError('Failed to load channel configurations. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleNumberUpdate = async (
    updatedNumber: SmsNumber | WhatsappNumber,
  ) => {
    try {
      const updateData = {
        phoneNumberId: updatedNumber.phoneNumberId,
        accountId: updatedNumber.accountId,
        optInEnabled: updatedNumber.optInEnabled,
        optOutEnabled: updatedNumber.optOutEnabled,
        optInKeywords: updatedNumber.optInKeywords,
        optOutKeywords: updatedNumber.optOutKeywords,
        optInReplyText: updatedNumber.optInReplyText,
        optOutReplyText: updatedNumber.optOutReplyText,
      }

      let response
      if ('numberType' in updatedNumber) {
        // SMS number update
        response = await axiosInstance.post(
          '/api/channels/channelConfigurations/update-smsnumber-configuration',
          { updateData },
        )
      } else {
        // WhatsApp number update
        response = await axiosInstance.post(
          '/api/channels/channelConfigurations/update-whatsappnumber-configuration',
          { updateData },
        )
      }

      if (response.status === 200) {
        if ('numberType' in updatedNumber) {
          setSmsAccounts((prevAccounts) =>
            prevAccounts.map((account) =>
              account.accountId === updatedNumber.accountId
                ? {
                    ...account,
                    smsNumbers: account.smsNumbers.map((number) =>
                      number.phoneNumberId === updatedNumber.phoneNumberId
                        ? { ...number, ...updateData }
                        : number,
                    ),
                  }
                : account,
            ),
          )
        } else {
          setWhatsAppAccounts((prevAccounts) =>
            prevAccounts.map((account) =>
              account.accountId === updatedNumber.accountId
                ? {
                    ...account,
                    whatsappNumbers: account.whatsappNumbers.map((number) =>
                      number.phoneNumberId === updatedNumber.phoneNumberId
                        ? { ...number, ...updateData }
                        : number,
                    ),
                  }
                : account,
            ),
          )
        }
        toast({
          title: 'Success',
          description: 'Number configuration updated successfully.',
          variant: 'default',
        })
      } else {
        throw new Error('Failed to update number configuration')
      }
    } catch (error) {
      console.error('Error updating number:', error)
      toast({
        title: 'Error',
        description: 'Failed to update number configuration. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleAssignInstance = async (
    number: SmsNumber | WhatsappNumber,
    instanceId: string,
  ) => {
    try {
      const response = await axiosInstance.post(
        '/api/channels/channelConfigurations/assign-instance',
        {
          phoneNumberId: number.phoneNumberId,
          instanceId,
          channel: 'numberType' in number ? 'sms' : 'whatsapp',
        },
      )

      if (response.status === 200) {
        // Update the local state with the new channel configuration
        setChannelConfigurations((prevConfigs) => [
          ...prevConfigs,
          {
            channelId: response.data.channelId,
            instanceId,
            organizationId: response.data.organizationId,
            channel: 'numberType' in number ? 'sms' : 'whatsapp',
            phoneNumberId: number.phoneNumberId,
            createdAt: new Date(response.data.createdAt),
            updatedAt: new Date(response.data.updatedAt),
            useAsDefaultInstanceForConversations:
              response.data.useAsDefaultInstanceForConversations ?? false,
          } as ChannelConfiguration,
        ])

        toast({
          title: 'Success',
          description: 'Number assigned to instance successfully.',
          variant: 'default',
        })
      } else {
        throw new Error('Failed to assign number to instance')
      }
    } catch (error) {
      console.error('Error assigning number to instance:', error)
      toast({
        title: 'Error',
        description: 'Failed to assign number to instance. Please try again.',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-base text-muted-foreground">
          Loading configurations...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-base text-destructive">{error}</p>
      </div>
    )
  }

  // Check if both SMS and WhatsApp accounts are empty
  if (smsAccounts.length === 0 && whatsAppAccounts.length === 0) {
    return (
      <div className="p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="mr-2 h-5 w-5 text-yellow-500" />
              No Messaging Channels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              You haven't onboarded any messaging channels yet. To get started,
              please onboard a channel.
            </p>
            <Button
              onClick={() => router.push('/onboarding/messaging-platforms')}
            >
              Onboard a Channel
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4 flex items-center">
        <Phone className="mr-2 h-6 w-6" />
        Channel Configurations
      </h1>
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-2 h-11 p-1 bg-muted">
          {whatsAppAccounts.length > 0 && smsAccounts.length === 0 ? (
            <>
              <TabsTrigger
                value="whatsapp"
                className="flex items-center justify-center text-base data-[state=active]:bg-background"
              >
                <Phone className="mr-2 h-4 w-4" />
                WhatsApp
              </TabsTrigger>
              <TabsTrigger
                value="sms"
                className="flex items-center justify-center text-base data-[state=active]:bg-background"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                SMS
              </TabsTrigger>
            </>
          ) : (
            <>
              <TabsTrigger
                value="sms"
                className="flex items-center justify-center text-base data-[state=active]:bg-background"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                SMS
              </TabsTrigger>
              <TabsTrigger
                value="whatsapp"
                className="flex items-center justify-center text-base data-[state=active]:bg-background"
              >
                <Phone className="mr-2 h-4 w-4" />
                WhatsApp
              </TabsTrigger>
            </>
          )}
        </TabsList>
        {whatsAppAccounts.length > 0 && smsAccounts.length === 0 ? (
          <>
            <TabsContent value="whatsapp" className="space-y-3">
              <div className="space-y-1">
                <h2 className="text-xl font-medium">WhatsApp Channel</h2>
                <p className="text-sm text-muted-foreground">
                  View and manage your WhatsApp business accounts and numbers.
                </p>
              </div>
              {whatsAppAccounts.map((account) => (
                <AccountCard
                  key={account.accountId}
                  account={account}
                  numbers={account.whatsappNumbers || []}
                  type="whatsapp"
                  onUpdate={handleNumberUpdate}
                  apps={apps}
                  channelConfigurations={channelConfigurations}
                  onAssignInstance={handleAssignInstance}
                />
              ))}
            </TabsContent>
            <TabsContent value="sms" className="space-y-3">
              <div className="space-y-1">
                <h2 className="text-xl font-medium">SMS Channel</h2>
                <p className="text-sm text-muted-foreground">
                  View and manage your SMS accounts and numbers.
                </p>
              </div>
              <NoAccountsCard type="SMS" onboardRoute="/onboarding/sms" />
            </TabsContent>
          </>
        ) : (
          <>
            <TabsContent value="sms" className="space-y-3">
              <div className="space-y-1">
                <h2 className="text-xl font-medium">SMS Channel</h2>
                <p className="text-sm text-muted-foreground">
                  View and manage your SMS accounts and numbers.
                </p>
              </div>
              {smsAccounts.length === 0 ? (
                <NoAccountsCard type="SMS" onboardRoute="/onboarding/sms" />
              ) : (
                smsAccounts.map((account) => (
                  <AccountCard
                    key={account.accountId}
                    account={account}
                    numbers={account.smsNumbers || []}
                    type="sms"
                    onUpdate={handleNumberUpdate}
                    apps={apps}
                    channelConfigurations={channelConfigurations}
                    onAssignInstance={handleAssignInstance}
                  />
                ))
              )}
            </TabsContent>
            <TabsContent value="whatsapp" className="space-y-3">
              <div className="space-y-1">
                <h2 className="text-xl font-medium">WhatsApp Channel</h2>
                <p className="text-sm text-muted-foreground">
                  View and manage your WhatsApp business accounts and numbers.
                </p>
              </div>
              {whatsAppAccounts.length === 0 ? (
                <Card className="w-full max-w-md mx-auto">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertCircle className="mr-2 h-5 w-5 text-yellow-500" />
                      No WhatsApp Accounts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">
                      You haven't onboarded any WhatsApp accounts yet. To get
                      started with WhatsApp, please onboard a WhatsApp channel.
                    </p>
                    <Button
                      onClick={() =>
                        router.push(
                          '/onboarding/messaging-platforms?onboardchannel=whatsapp',
                        )
                      }
                    >
                      Onboard WhatsApp Channel
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                whatsAppAccounts.map((account) => (
                  <AccountCard
                    key={account.accountId}
                    account={account}
                    numbers={account.whatsappNumbers || []}
                    type="whatsapp"
                    onUpdate={handleNumberUpdate}
                    apps={apps}
                    channelConfigurations={channelConfigurations}
                    onAssignInstance={handleAssignInstance}
                  />
                ))
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  )
}
