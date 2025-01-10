'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  ArrowLeft,
  MessageSquare,
  Phone,
  Loader2,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  Check,
} from 'lucide-react'
import axiosInstance from '@/lib/axios'
import {
  SmsNumber,
  SmsAccount,
  WhatsappNumber,
  WhatsappBusinessAccount,
  App,
} from '@/lib/channelTypes'
import { Badge } from '@/components/ui/badge'

interface Channel {
  id: string
  type: 'sms' | 'whatsapp'
  accountId: string
  templateIds: string[]
}

interface WhatsAppTemplate {
  templateId: string
  accountId: string
  organizationId: string
  name: string
  language: string
  components: any // Json type
  category: string // whatsappTemplateCategory
  status: string // whatsappTemplateStatus
  hasErrors: boolean
  createdAt: string
  updatedAt: string
}

interface SMSTemplate {
  templateId: string
  organizationId: string
  name: string
  type: string // smsTemplateTypes
  text: string
  mappings: any // Json type
  createdAt: string
  updatedAt: string
}

type Template = WhatsAppTemplate | SMSTemplate

interface Configuration {
  configId: string
  configType: string
  isEnabled: boolean
  createdAt: string
  updatedAt: string
  messagingConfigurationComponents: Array<{
    componentId: string
    channel: 'sms' | 'whatsapp'
    accountId: string
    phoneNumberId: string
    templateId: string
    isComponentEnabled: boolean
  }>
}

const allAutomationTypes = [
  'orderCreated',
  'orderCanceled',
  'restaurantsTableReservationCreated',
  'restaurantsOrderFulfilled',
  'restaurantsOrderAccepted',
  'restaurantsPickupOrderCreated',
  'restaurantsDeliveryOrderCreated',
  'restaurantsTableReservationCanceled',
  'restaurantsOrderCanceled',
  'bookingConfirmed',
  'bookingRescheduled',
  'bookingCanceled',
  'newCustomerSignUp',
  'cartAbandoned',
  'formSubmitted',
  'fulfilmentCreated',
]

function ChannelCard({
  icon,
  title,
  onClick,
  disabled,
  selected,
}: {
  icon: React.ReactNode
  title: string
  onClick: () => void
  disabled: boolean
  selected?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative flex items-center gap-2 rounded-lg border p-4 hover:bg-accent transition-colors ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${selected ? 'border-primary' : 'border-input'}`}
    >
      {icon}
      <span className="font-medium">{title}</span>
      {selected && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 rounded border-2 border-primary bg-primary" />
        </div>
      )}
    </button>
  )
}

function TemplateCard({
  template,
  isSelected,
  onClick,
  onDeselect,
}: {
  template: Template
  isSelected: boolean
  onClick: () => void
  onDeselect?: () => void
}) {
  const isWhatsAppTemplate = 'language' in template

  return (
    <Card
      className={`cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex flex-col h-full">
          <h4 className="font-medium text-sm truncate">{template.name}</h4>
          <div className="mt-1 flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {isWhatsAppTemplate ? template.language : template.type}
            </Badge>
            {isSelected && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  onDeselect?.()
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface TemplateSelectorProps {
  templates: Template[]
  selectedTemplateIds: string[]
  onSelectTemplates: (templateIds: string[]) => void
  onCreateTemplate: () => void
  type: 'sms' | 'whatsapp'
}

function TemplateSelector({
  templates,
  selectedTemplateIds,
  onSelectTemplates,
  onCreateTemplate,
  type,
}: TemplateSelectorProps) {
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isSelectingMore, setIsSelectingMore] = useState(false)
  const templatesPerPage = 9

  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(search.toLowerCase()),
  )

  const totalPages = Math.ceil(filteredTemplates.length / templatesPerPage)
  const startIndex = (currentPage - 1) * templatesPerPage
  const endIndex = startIndex + templatesPerPage
  const currentTemplates = filteredTemplates.slice(startIndex, endIndex)

  const handleTemplateSelect = (templateId: string) => {
    if (selectedTemplateIds.includes(templateId)) {
      onSelectTemplates(selectedTemplateIds.filter((id) => id !== templateId))
    } else {
      const newSelection = [...selectedTemplateIds, templateId].slice(0, 5)
      onSelectTemplates(newSelection)
      setIsSelectingMore(false)
    }
  }

  const handleRemoveTemplate = (templateId: string) => {
    onSelectTemplates(selectedTemplateIds.filter((id) => id !== templateId))
  }

  if (selectedTemplateIds.length > 0 && !isSelectingMore) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {type === 'whatsapp' ? 'WhatsApp' : 'SMS'} Template
          </h3>
          {selectedTemplateIds.length < 5 && (
            <Button
              onClick={(e) => {
                e.preventDefault()
                setIsSelectingMore(true)
              }}
              variant="outline"
              size="sm"
              type="button"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add More Templates
            </Button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {selectedTemplateIds.map((id) => {
            const template = templates.find((t) => t.templateId === id)
            if (!template) return null
            return (
              <TemplateCard
                key={id}
                template={template}
                isSelected={true}
                onClick={() => {}}
                onDeselect={() => handleRemoveTemplate(id)}
              />
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {type === 'whatsapp' ? 'WhatsApp' : 'SMS'} Template
        </h3>
        <Button
          onClick={(e) => {
            e.preventDefault()
            onCreateTemplate()
          }}
          variant="default"
          size="sm"
          type="button"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      <ScrollArea className="h-[320px]">
        <div className="grid grid-cols-3 gap-3">
          {currentTemplates.map((template) => (
            <TemplateCard
              key={template.templateId}
              template={template}
              isSelected={selectedTemplateIds.includes(template.templateId)}
              onClick={() => handleTemplateSelect(template.templateId)}
              onDeselect={() => handleRemoveTemplate(template.templateId)}
            />
          ))}
        </div>
      </ScrollArea>

      <div className="flex items-center justify-between pt-2">
        <p className="text-sm text-muted-foreground">
          Showing {startIndex + 1} -{' '}
          {Math.min(endIndex, filteredTemplates.length)} of{' '}
          {filteredTemplates.length}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isSelectingMore && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setIsSelectingMore(false)}
        >
          Cancel
        </Button>
      )}
    </div>
  )
}

export default function CreateAutomationPage() {
  const router = useRouter()
  const [progress, setProgress] = useState(1)
  const [automationType, setAutomationType] = useState<string>('')
  const [isEnabled, setIsEnabled] = useState(true)
  const [channels, setChannels] = useState<Channel[]>([])
  const [apps, setApps] = useState<App[]>([])
  const [selectedApp, setSelectedApp] = useState<string>('')
  const [smsAccounts, setSmsAccounts] = useState<SmsAccount[]>([])
  const [whatsAppAccounts, setWhatsAppAccounts] = useState<
    WhatsappBusinessAccount[]
  >([])
  const [smsTemplates, setSmsTemplates] = useState<SMSTemplate[]>([])
  const [whatsAppTemplates, setWhatsAppTemplates] = useState<{
    [accountId: string]: WhatsAppTemplate[]
  }>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [configurations, setConfigurations] = useState<Configuration[]>([])
  const [availableAutomationTypes, setAvailableAutomationTypes] = useState<
    string[]
  >([])

  useEffect(() => {
    fetchChannelData()
  }, [])

  useEffect(() => {
    const createdAutomationTypes = configurations.map(
      (config) => config.configType,
    )
    const availableTypes = allAutomationTypes.filter(
      (type) => !createdAutomationTypes.includes(type),
    )
    setAvailableAutomationTypes(availableTypes)
  }, [configurations])

  const fetchChannelData = async () => {
    try {
      setIsLoading(true)
      const response = await axiosInstance.post('/api/automations/get-channels')
      const { apps, smsAccounts, whatsAppAccounts, configurations } =
        response.data

      setApps(apps)
      setSmsAccounts(smsAccounts)
      setWhatsAppAccounts(whatsAppAccounts)
      setConfigurations(configurations)

      // Auto-select app if only one exists
      if (apps.length === 1) {
        setSelectedApp(apps[0].instanceId)
      }

      // Auto-select accounts for existing channels
      setChannels((prevChannels) =>
        prevChannels.map((channel) => {
          if (channel.type === 'sms') {
            const allSmsNumbers: SmsNumber[] = smsAccounts.flatMap(
              (account: SmsAccount) => account.smsNumbers,
            )
            if (allSmsNumbers.length === 1 && !channel.accountId) {
              return { ...channel, accountId: allSmsNumbers[0].phoneNumberId }
            }
          } else if (channel.type === 'whatsapp') {
            const allWhatsAppNumbers: WhatsappNumber[] =
              whatsAppAccounts.flatMap(
                (account: WhatsappBusinessAccount) => account.whatsappNumbers,
              )
            if (allWhatsAppNumbers.length === 1 && !channel.accountId) {
              const phoneNumberId = allWhatsAppNumbers[0].phoneNumberId
              fetchWhatsAppTemplates(phoneNumberId)
              return { ...channel, accountId: phoneNumberId }
            }
          }
          return channel
        }),
      )

      await fetchSmsTemplates()
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching channel data:', error)
      setIsLoading(false)
    }
  }

  const fetchSmsTemplates = async () => {
    try {
      setIsLoadingTemplates(true)
      const response = await axiosInstance.post(
        '/api/automations/get-sms-templates',
      )
      setSmsTemplates(response.data.templates)
      setIsLoadingTemplates(false)
    } catch (error) {
      console.error('Error fetching SMS templates:', error)
      setIsLoadingTemplates(false)
    }
  }

  const fetchWhatsAppTemplates = async (phoneNumberId: string) => {
    try {
      setIsLoadingTemplates(true)
      const matchingAccount = whatsAppAccounts.find((acc) =>
        acc.whatsappNumbers.some((num) => num.phoneNumberId === phoneNumberId),
      )
      if (!matchingAccount) {
        throw new Error('WhatsApp account not found')
      }
      const response = await axiosInstance.post(
        '/api/automations/get-whatsapptemplates-by-account',
        { accountId: matchingAccount.accountId },
      )
      setWhatsAppTemplates((prev) => ({
        ...prev,
        [phoneNumberId]: response.data.templates,
      }))
      setIsLoadingTemplates(false)
    } catch (error) {
      console.error('Error fetching WhatsApp templates:', error)
      setIsLoadingTemplates(false)
    }
  }

  const handleAddChannel = (type: 'sms' | 'whatsapp') => {
    if (
      channels.length < 2 &&
      !channels.some((channel) => channel.type === type)
    ) {
      const newChannel = {
        id: Date.now().toString(),
        type,
        accountId: '',
        templateIds: [],
      }

      if (type === 'sms') {
        const allSmsNumbers = smsAccounts.flatMap(
          (account) => account.smsNumbers,
        )
        if (allSmsNumbers.length === 1) {
          newChannel.accountId = allSmsNumbers[0].phoneNumberId
        }
      } else if (type === 'whatsapp') {
        const allWhatsAppNumbers = whatsAppAccounts.flatMap(
          (account) => account.whatsappNumbers,
        )
        if (allWhatsAppNumbers.length === 1) {
          const phoneNumberId = allWhatsAppNumbers[0].phoneNumberId
          fetchWhatsAppTemplates(phoneNumberId)
          newChannel.accountId = phoneNumberId
        }
      }

      setChannels([...channels, newChannel])
    }
  }

  const handleRemoveChannel = (id: string) => {
    setChannels(channels.filter((channel) => channel.id !== id))
  }

  const handleChannelChange = async (
    id: string,
    field: 'accountId' | 'templateIds',
    value: string | string[],
  ) => {
    const updatedChannels = channels.map((channel) => {
      if (channel.id === id) {
        if (field === 'templateIds') {
          const updatedTemplateIds = Array.isArray(value) ? value : [value]
          return { ...channel, [field]: updatedTemplateIds.slice(0, 5) }
        }
        if (field === 'accountId') {
          const updatedChannel = { ...channel, accountId: value as string }
          if (updatedChannel.type === 'whatsapp') {
            fetchWhatsAppTemplates(updatedChannel.accountId)
            updatedChannel.templateIds = []
          }
          return updatedChannel
        }
      }
      return channel
    })
    setChannels(updatedChannels)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)

      const payload = {
        configType: automationType,
        isEnabled,
        instanceId: selectedApp || apps[0]?.instanceId,
        messagingConfigurationComponents: channels.flatMap((channel) => {
          const account =
            channel.type === 'sms'
              ? smsAccounts.find((acc) =>
                  acc.smsNumbers.some(
                    (num) => num.phoneNumberId === channel.accountId,
                  ),
                )
              : whatsAppAccounts.find((acc) =>
                  acc.whatsappNumbers.some(
                    (num) => num.phoneNumberId === channel.accountId,
                  ),
                )

          return channel.templateIds.map((templateId) => ({
            channel: channel.type,
            accountId: account?.accountId || '',
            phoneNumberId: channel.accountId,
            templateId: templateId,
            isComponentEnabled: true,
          }))
        }),
      }

      const response = await axiosInstance.post(
        '/api/automations/create-automation',
        payload,
      )

      if (response.data) {
        router.push('/dashboard/automations')
      }
    } catch (error) {
      console.error('Error creating automation:', error)
      // You might want to add toast notification here for error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateTemplate = () => {
    // This would typically navigate to template creation page
    console.log('Navigate to template creation')
  }

  const nextProgress = () => {
    setProgress((prev) => Math.min(prev + 1, 3))
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <Button
        variant="ghost"
        onClick={() => router.push('/dashboard/automations')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Automations
      </Button>
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold">
            Create New Automation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="w-[400px]">
                <Label className="mb-2 block" htmlFor="automationType">
                  Automation Type
                </Label>
                <Select
                  value={automationType}
                  onValueChange={(value) => {
                    setAutomationType(value)
                    nextProgress()
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select automation type" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAutomationTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-2 block" htmlFor="isEnabled">
                  Enabled
                </Label>
                <Switch
                  id="isEnabled"
                  checked={isEnabled}
                  onCheckedChange={setIsEnabled}
                />
              </div>
            </div>
            {apps.length > 1 && (
              <div className="space-y-2">
                <Label htmlFor="app">Select App</Label>
                <Select value={selectedApp} onValueChange={setSelectedApp}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select app" />
                  </SelectTrigger>
                  <SelectContent>
                    {apps.map((app) => (
                      <SelectItem key={app.instanceId} value={app.instanceId}>
                        {app.businessName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {progress >= 2 && (
              <div className="space-y-4">
                <Label>Channels</Label>
                <div className="grid grid-cols-2 gap-4 max-w-md">
                  <ChannelCard
                    icon={<MessageSquare className="h-5 w-5" />}
                    title="WhatsApp"
                    onClick={() => {
                      handleAddChannel('whatsapp')
                      nextProgress()
                    }}
                    disabled={
                      channels.some((channel) => channel.type === 'whatsapp') ||
                      channels.length >= 2
                    }
                    selected={channels.some(
                      (channel) => channel.type === 'whatsapp',
                    )}
                  />
                  <ChannelCard
                    icon={<Phone className="h-5 w-5" />}
                    title="SMS"
                    onClick={() => {
                      handleAddChannel('sms')
                      nextProgress()
                    }}
                    disabled={
                      channels.some((channel) => channel.type === 'sms') ||
                      channels.length >= 2
                    }
                    selected={channels.some(
                      (channel) => channel.type === 'sms',
                    )}
                  />
                </div>
                {channels.map((channel) => (
                  <Card key={channel.id}>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">
                            {channel.type === 'sms' ? 'SMS' : 'WhatsApp'}{' '}
                            Channel
                          </h3>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveChannel(channel.id)}
                            className="h-8 w-8"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <Select
                          value={channel.accountId}
                          onValueChange={(value) =>
                            handleChannelChange(channel.id, 'accountId', value)
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select account" />
                          </SelectTrigger>
                          <SelectContent>
                            {channel.type === 'sms'
                              ? smsAccounts.flatMap((account) =>
                                  account.smsNumbers.map((number) => (
                                    <SelectItem
                                      key={number.phoneNumberId}
                                      value={number.phoneNumberId}
                                    >
                                      {`${account.accountName} - ${number.phoneNumber}`}
                                    </SelectItem>
                                  )),
                                )
                              : whatsAppAccounts.flatMap((account) =>
                                  account.whatsappNumbers.map((number) => (
                                    <SelectItem
                                      key={number.phoneNumberId}
                                      value={number.phoneNumberId}
                                    >
                                      {`${account.accountName} - ${number.phoneNumber}`}
                                    </SelectItem>
                                  )),
                                )}
                          </SelectContent>
                        </Select>
                        <div className="space-y-4">
                          <h4 className="text-md font-semibold">
                            {channel.type === 'sms' ? 'SMS' : 'WhatsApp'}{' '}
                            Template
                          </h4>
                          {isLoadingTemplates ? (
                            <div className="flex justify-center">
                              <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                          ) : (
                            <TemplateSelector
                              templates={
                                channel.type === 'sms'
                                  ? smsTemplates
                                  : whatsAppTemplates[channel.accountId] || []
                              }
                              selectedTemplateIds={channel.templateIds}
                              onSelectTemplates={(templateIds) =>
                                handleChannelChange(
                                  channel.id,
                                  'templateIds',
                                  templateIds,
                                )
                              }
                              onCreateTemplate={handleCreateTemplate}
                              type={channel.type}
                            />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={
                  !automationType ||
                  channels.length === 0 ||
                  channels.some(
                    (channel) =>
                      !channel.accountId || channel.templateIds.length === 0,
                  ) ||
                  isSubmitting
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Automation'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
