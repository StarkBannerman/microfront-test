'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { phone } from 'phone'
import { X, Check, Undo, Copy, PhoneIcon as WhatsappIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import Widget from '@/components/widgets/Widget'
import WidgetAgents from '@/components/widgets/WidgetAgents'
import { CountryCodeSelect } from '@/components/common/CountryCodeSelector'

import {
  findDifferences,
  isValidPhoneNumber,
  parsePhoneNumber,
} from '@/lib/templateUtils'
import axiosInstance from '@/lib/axios'

type WidgetConfig = {
  background: string
  color: string
  greeting: string
  logo: string
  location: string
  redirectNumber: string
  heading: string
  countryCode: string
  number: string
  messageStarterText: string
}

interface Agent {
  name: string
  redirectNumber: string
  enabled: boolean
  countryCode: string
  number: string
}

type WidgetInfo = {
  widgetId: string | null
  enabled: boolean
  widgetConfig: WidgetConfig
  agentsEnabled: boolean
  agents: Agent[]
}

const SOCKET_BASE_URL = process.env.NEXT_PUBLIC_SOCKET_BASE_URL



const fields = [
  { label: 'Name of your Business', name: 'heading' },
  { label: 'Greeting Text', name: 'greeting' },
  { label: 'Enter Your Whatsapp Number', name: 'redirectNumber' },
  { label: 'Message Starter Text', name: 'messageStarterText' },
] as const

export default function WhatsappWidgetSettings() {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [widgetExists, setWidgetExists] = useState(false)
  const [hasChanged, setHasChanged] = useState(false)

  const defaultWidgetInfo: WidgetInfo = {
    widgetId: null,
    enabled: false,
    widgetConfig: {
      background: '#085E56',
      color: '#FFFFFF',
      greeting: '',
      logo: 'default',
      location: 'right',
      redirectNumber: '',
      heading: '',
      countryCode: '',
      number: '',
      messageStarterText: '',
    },
    agentsEnabled: false,
    agents: [],
  }

  const [logo, setLogo] = useState<File | null>(null)
  const [oldWidgetInfo, setOldWidgetInfo] = useState<WidgetInfo>({
    ...defaultWidgetInfo,
  })
  const [widgetInfo, setWidgetInfo] = useState<WidgetInfo>(defaultWidgetInfo)

  const handleConfigChange = (field: keyof WidgetConfig, value: string) => {
    setWidgetInfo((prev) => {
      let updatedConfig = {
        ...prev.widgetConfig,
        [field]: value,
      }
      if (field === 'countryCode' || field === 'number') {
        const countryCode = updatedConfig.countryCode || ''
        const number = updatedConfig.number || ''
        updatedConfig.redirectNumber =
          phone(countryCode + number)?.phoneNumber ?? countryCode + number
      }
      return {
        ...prev,
        widgetConfig: updatedConfig,
      }
    })
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      if (file.size <= 700 * 1024 && file.type.startsWith('image/')) {
        setLogo(file)
        const reader = new FileReader()
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            handleConfigChange('logo', reader.result)
          }
        }
        reader.readAsDataURL(file)
      } else {
        toast({
          title: 'Error',
          description: 'Please select an image file less than 700 KB',
          variant: 'destructive',
        })
      }
    }
  }

  const handleLogoRemove = () => {
    setLogo(null)
    handleConfigChange('logo', 'default')
  }

  const getProfileImage = () => {
    return widgetInfo.widgetConfig?.logo === 'default'
      ? '/whatsapp-logo.png'
      : widgetInfo.widgetConfig?.logo
  }

  function createWhatsappWidget() {
    setWidgetExists(true)
    setWidgetInfo({
      ...defaultWidgetInfo,
      widgetId: null, // Ensure this is null for a new widget
    })
    setLoading(false)
  }

  async function getWidgetInfo() {
    try {
      const { status, data } = await axiosInstance.post(
        '/api/widgets/getWhatsappWidget',
      )
      if (status === 200) {
        if (data && data.widgetInfo) {
          const widgetConfig = data.widgetInfo.widgetConfig
          const widget = {
            ...data.widgetInfo,
            widgetConfig: {
              ...widgetConfig,
              ...parsePhoneNumber(widgetConfig.redirectNumber),
            },
            agents: data.widgetInfo?.agents?.map((agent: Agent) => ({
              ...agent,
              ...parsePhoneNumber(agent.redirectNumber),
            })),
          }
          setWidgetExists(true)
          setOldWidgetInfo(widget)
          setWidgetInfo(widget)
          setLogo(data.widgetInfo.widgetConfig?.logo)
          setLoading(false)
        }
      } else if (status === 204) {
        setLoading(false)
        setWidgetExists(false)
      }
    } catch (error) {
      setLoading(false)
      toast({
        title: 'Error',
        description: 'Internal Server Error',
        variant: 'destructive',
      })
    }
  }

  async function updateWhatsappWidget() {
    try {
      const response = await axiosInstance.post(
        '/api/widgets/updateWhatsappWidget',
        {
          widgetInfo,
        },
      )
      if (response.status === 200) {
        setOldWidgetInfo(widgetInfo)
        setHasChanged(false)
        toast({
          title: 'Success',
          description: 'Widget Updated!',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Internal Server Error',
        variant: 'destructive',
      })
    }
  }

  async function embedWidget() {
    try {
      const response = await axiosInstance.post(
        '/api/widgets/embedWhatsappWidget',
        {
          widgetId: widgetInfo.widgetId,
        },
      )
      if (response.status === 200) {
        setWidgetInfo((prev) => ({ ...prev, enabled: true }))
        setOldWidgetInfo((prev) => ({ ...prev, enabled: true }))
        if (response.data.url) {
          window.open(response.data.url)
        }
        toast({
          title: 'Success',
          description: 'Widget embedded on website.',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Internal Server Error',
        variant: 'destructive',
      })
    }
  }

  async function disableWidget() {
    try {
      const response = await axiosInstance.post(
        '/api/widgets/disableWhatsappWidget',
        {
          widgetId: widgetInfo.widgetId,
        },
      )
      if (response.status === 200) {
        setWidgetInfo((prev) => ({ ...prev, enabled: false }))
        setOldWidgetInfo((prev) => ({ ...prev, enabled: false }))
        toast({
          title: 'Success',
          description: 'Widget Disabled!',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Internal Server Error',
        variant: 'destructive',
      })
    }
  }

  function handleReset() {
    setWidgetInfo({ ...oldWidgetInfo })
  }

  async function handleSave() {
    try {
      const redirectNumberValid = phone(
        widgetInfo.widgetConfig?.redirectNumber,
      ).isValid
      const allFieldsFilled =
        widgetInfo.widgetConfig?.heading &&
        widgetInfo.widgetConfig?.greeting &&
        widgetInfo.widgetConfig?.location
      const agentsValid =
        widgetInfo.agents &&
        widgetInfo.agents.every((agent) => phone(agent.redirectNumber).isValid)
      const uniqueRedirectNumbers =
        widgetInfo.agents &&
        widgetInfo.agents.length ===
          new Set(widgetInfo.agents.map((agent) => agent.redirectNumber)).size
      const noAgentWithMainRedirectNumber =
        widgetInfo.agents &&
        widgetInfo.agents.every(
          (agent) =>
            agent.redirectNumber !== widgetInfo.widgetConfig?.redirectNumber,
        )

      if (!redirectNumberValid) {
        toast({
          title: 'Error',
          description: 'Enter a Valid Number.',
          variant: 'destructive',
        })
      } else if (!allFieldsFilled) {
        toast({
          title: 'Error',
          description: 'Enter All Fields.',
          variant: 'destructive',
        })
      } else if (!agentsValid) {
        toast({
          title: 'Error',
          description: 'All agents must have valid redirect numbers.',
          variant: 'destructive',
        })
      } else if (!uniqueRedirectNumbers) {
        toast({
          title: 'Error',
          description: 'All agents must have unique redirect numbers.',
          variant: 'destructive',
        })
      } else if (!noAgentWithMainRedirectNumber) {
        toast({
          title: 'Error',
          description:
            'An agent cannot have the same redirect number as the main redirect number',
          variant: 'destructive',
        })
      } else {
        if (widgetInfo.widgetId) {
          await updateWhatsappWidget()
        } else {
          const response = await axiosInstance.post(
            '/api/widgets/createWhatsappWidget',
            {
              widgetInfo,
            },
          )
          if (response.status === 200) {
            setWidgetInfo(response.data.widgetInfo)
            setOldWidgetInfo(response.data.widgetInfo)
            toast({
              title: 'Success',
              description: 'Widget Created!',
            })
          }
        }
      }
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error',
        description: 'Failed to save widget',
        variant: 'destructive',
      })
    }
  }

  const scriptTag = `<script id="mercuri-whatsapp-widget" defer src="${SOCKET_BASE_URL}/cdn/whatsapp/${widgetInfo.widgetId}"></script>`
  const copyScriptTagToClipboard = async (tag: string) => {
    await navigator.clipboard.writeText(tag)
    toast({
      title: 'Copied',
      description: 'Script tag copied to clipboard',
    })
  }

  useEffect(() => {
    getWidgetInfo()
  }, [])

  const checkForChanges = () => {
    const differences = findDifferences(oldWidgetInfo, widgetInfo)
    return Object.keys(differences).length > 0
  }

  useEffect(() => {
    if (!loading && widgetExists) {
      const isChanged = checkForChanges()
      setHasChanged(isChanged)
    }
  }, [loading, widgetInfo])

  if (loading) {
    return (
      <div className="h-full w-full grid place-items-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!widgetExists) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <WhatsappIcon className="h-12 w-12 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Whatsapp Widget</h2>
        <p className="text-center mb-4">
          Create a whatsapp widget and add it to your website
        </p>
        <Button onClick={createWhatsappWidget}>Create Widget</Button>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white/95 rounded-lg p-6">
        <div className="space-y-8">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>{field.label}</Label>
              {field.name === 'redirectNumber' ? (
                <div className="flex gap-2">
                  <CountryCodeSelect
                    value={widgetInfo.widgetConfig.countryCode}
                    onChange={(value) =>
                      handleConfigChange('countryCode', value)
                    }
                    onBlur={() => {}}
                    name="countryCode"
                  />
                  <Input
                    id={field.name}
                    value={widgetInfo.widgetConfig.number}
                    onChange={(e) =>
                      handleConfigChange(
                        'number',
                        e.target.value.replace(/\D/g, ''),
                      )
                    }
                    placeholder="Phone Number"
                    className={
                      !isValidPhoneNumber(
                        widgetInfo.widgetConfig.redirectNumber,
                      )
                        ? 'border-red-500'
                        : ''
                    }
                    maxLength={20}
                  />
                </div>
              ) : field.name === 'greeting' ? (
                <Textarea
                  id={field.name}
                  value={widgetInfo.widgetConfig[field.name]}
                  onChange={(e) =>
                    handleConfigChange(field.name, e.target.value)
                  }
                  placeholder={field.label}
                  rows={3}
                />
              ) : (
                <Input
                  id={field.name}
                  value={widgetInfo.widgetConfig[field.name]}
                  onChange={(e) =>
                    handleConfigChange(field.name, e.target.value)
                  }
                  placeholder={field.label}
                />
              )}
            </div>
          ))}

          <div className="space-y-2">
            <Label>Upload Your Logo</Label>
            <Card>
              <CardContent className="flex items-center justify-between p-4">
                {widgetInfo.widgetConfig.logo !== 'default' ? (
                  <div className="flex items-center gap-4 w-full">
                    <Image
                      src={getProfileImage()}
                      alt="Logo Preview"
                      width={70}
                      height={70}
                      className="rounded-lg"
                    />
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <p className="text-sm font-medium truncate flex-1">
                        {logo?.name}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogoRemove}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="w-[70px] h-[70px] bg-gray-200 rounded-lg" />
                )}
                <Button variant="outline" asChild>
                  <label>
                    Upload
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleLogoChange}
                    />
                  </label>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-2">
            <Label>Whatsapp Widget Location</Label>
            <RadioGroup
              value={widgetInfo.widgetConfig?.location}
              onValueChange={(value) => handleConfigChange('location', value)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="left" id="left" />
                <Label htmlFor="left">Left Align</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="right" id="right" />
                <Label htmlFor="right">Right Align</Label>
              </div>
            </RadioGroup>
          </div>

          <WidgetAgents widgetInfo={widgetInfo} setWidgetInfo={setWidgetInfo} />
        </div>

        <div className="space-y-8">
          <div className="flex flex-col items-center">
            <Widget widgetInfo={widgetInfo} />

            <h3 className="text-xl font-bold mt-8 mb-4">Script {}</h3>
            {widgetInfo?.widgetId && (
              <Card className="w-full">
                <CardContent className="p-4">
                  <div className="flex justify-end mb-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyScriptTagToClipboard(scriptTag)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Paste this code on the head tag of your website</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <pre className="whitespace-pre-wrap break-words overflow-hidden text-sm">
                    {scriptTag}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 left-0 right-0 bg-white p-4 border-t flex items-center justify-between mt-8">
        {hasChanged && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  <Undo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset changes</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <div className="flex gap-4 ml-auto">
          {hasChanged && (
            <Button variant="outline" onClick={handleSave}>
              Save
            </Button>
          )}
          <Button onClick={widgetInfo?.enabled ? disableWidget : embedWidget}>
            {widgetInfo?.enabled ? 'Unpublish' : 'Publish'}
          </Button>
        </div>
      </div>
    </div>
  )
}
