'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
  Loader2,
  UndoIcon,
  PlusIcon,
  SmileIcon,
  MessageSquare,
} from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import EmojiPicker from 'emoji-picker-react'
import {
  findDifferences,
  isTemplateValid,
  serializeTextMappings,
} from '@/lib/smsTemplateUtils'
import { getTemplate, createTemplate, updateTemplate } from '@/lib/smsServices'
import { Toaster } from '@/components/ui/toaster'
import { useAuth } from '@/hooks/useAuth'

type User = {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  firstName?: string
  lastName?: string
  credits?: number
  instanceId?: string
}

type TemplateDetails ={
  name: string
  text: string
  mappings: Record<string, string>
  type: string
}

const customVariables = [
  { text: 'Business Name', value: 'businessName' },
  { text: 'First Name', value: 'firstName' },
  { text: 'Last Name', value: 'lastName' },
  { text: 'Phone', value: 'phone' },
  { text: 'Email', value: 'email' },
  { text: 'Phone Number', value: 'phoneNumber' },
  { text: 'Customer Name', value: 'customerName' },
  { text: 'Coupon Code', value: 'couponCode' },
]

const PreviewMessage: React.FC<{
  text: string
  mappings: Record<string, string>
}> = ({ text, mappings }) => {
  const replaceMappings = (content: string) => {
    return content.replace(/\{#var#\}(\w+)/g, (match, key) => {
      return mappings[key] || match
    })
  }

  const previewText = replaceMappings(text)

  return (
    <div className="bg-purple-50/50 p-8 rounded-xl">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 flex items-center gap-3">
          <div className="bg-gray-100 p-2 rounded-full">
            <MessageSquare className="w-5 h-5 text-gray-600" />
          </div>
          <div className="text-sm text-gray-500">SMS Preview</div>
        </div>
        <div className="px-4 pb-4">
          <div className="bg-gray-50 p-4 rounded-lg text-gray-900 break-words whitespace-pre-wrap overflow-hidden">
            {previewText}
          </div>
        </div>
      </div>
    </div>
  )
}

function SMSTemplateManagement() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { isAuthenticated, user } = useAuth()

  const [pageMode, setPageMode] = useState('view')
  const selectedMode = searchParams.get('mode')
  const templateId = searchParams.get('templateId')

  const [loading, setLoading] = useState(false)
  const [oldTemplate, setOldTemplate] = useState<TemplateDetails>(
    {} as TemplateDetails,
  )
  const [templateDetails, setTemplateDetails] = useState<TemplateDetails>({
    name: '',
    text: '',
    mappings: {},
    type: 'MKT',
  })
  const [segments, setSegments] = useState(0)
  const [hasChanged, setHasChanged] = useState(false)

  const navigateToPageMode = (mode: string) => {
    if (mode === 'create') {
      router.push(`/dashboard/sms/template?mode=create`)
    } else {
      router.push(
        `/dashboard/sms/template?templateId=${templateId}&mode=${mode}`,
      )
    }
  }

  const checkForChanges = () => {
    const differences = findDifferences(oldTemplate, templateDetails)
    return Object.keys(differences).length > 0
  }

  const updateTemplateInfo = async (templateDetails: any) => {
    const isChanged = checkForChanges() //This function needs to be defined elsewhere
    const templateValid = isTemplateValid(templateDetails) //This function needs to be defined elsewhere
    if (!templateValid) {
      toast({
        title: 'Error',
        description: 'Fill in all the fields',
        variant: 'destructive',
      })
      return
    }
    if (isChanged && templateValid && templateId) {
      try {
        const response = await updateTemplate(templateId, templateDetails)
        if (response.status === 200) {
          toast({
            title: 'Success',
            description: 'Template updated successfully',
          })
          router.push(`/dashboard/sms/templatelist`)
        } else {
          throw new Error('Failed to update template')
        }
      } catch (error) {
        console.error('Error updating template:', error)
        toast({
          title: 'Error',
          description: 'Failed to update template',
          variant: 'destructive',
        })
      }
    }
  }
  const createTemplateInfo = async (templateDetails: any) => {
    const templateValid = isTemplateValid(templateDetails)
    if (!templateValid) {
      toast({
        title: 'Error',
        description: 'Fill in all the fields',
        variant: 'destructive',
      })
      return
    }
    if (templateValid) {
      const response = await createTemplate(templateDetails)
      if (response.status === 200) {
        toast({
          title: 'Success',
          description: 'Template created successfully',
        })
        router.push(`/dashboard/sms/templatelist`)
      } else {
        toast({
          title: 'Error',
          description: 'Failed to create template',
          variant: 'destructive',
        })
      }
    }
  }

  const getTemplateInfo = async (templateId: string) => {
    try {
      setLoading(true)
      if (templateId) {
        const { status, data } = await getTemplate(templateId)
        if (status === 200) {
          setTemplateDetails(data.template)
          setOldTemplate(data.template)
          setSMSSegments(data.template?.text ?? '')
        } else {
          toast({
            title: 'Error',
            description: 'Failed to fetch template',
            variant: 'destructive',
          })
        }
      }
    } catch (e) {
      console.error(e)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleValueChange = (
    field: keyof TemplateDetails | string,
    newValue: string,
  ) => {
    setTemplateDetails((prev) => {
      const updatedDetails = { ...prev }
      if (field === 'text') {
        updatedDetails.text = newValue
        setSMSSegments(newValue)
        updatedDetails.mappings = serializeTextMappings(
          newValue,
          updatedDetails.mappings,
        )
      } else if (field in prev.mappings) {
        updatedDetails.mappings = {
          ...prev.mappings,
          [field]: newValue,
        }
      } else {
        ;(updatedDetails as any)[field] = newValue
      }
      return updatedDetails
    })
  }

  const handleEmojiClick = (emojiObject: { emoji: string }) => {
    const tf = document.getElementById(
      `input-component-text`,
    ) as HTMLTextAreaElement
    const pos = tf.selectionStart

    if (templateDetails.text.length + emojiObject.emoji.length > 1024) {
      toast({
        title: 'Error',
        description:
          'Cannot add emoji: Message length would exceed 1024 characters',
        variant: 'destructive',
      })
      return
    }

    const newText =
      templateDetails.text.substring(0, pos) +
      emojiObject.emoji +
      templateDetails.text.substring(pos)
    tf.value = newText
    handleValueChange('text', newText)
    tf.focus()
  }

  const handleAddVariable = () => {
    const tf = document.getElementById(
      `input-component-text`,
    ) as HTMLTextAreaElement
    const pos = tf.selectionStart
    const variableText = '{#var#}'

    if (templateDetails.text.length + variableText.length > 1024) {
      toast({
        title: 'Error',
        description:
          'Cannot add variable: Message length would exceed 1024 characters',
        variant: 'destructive',
      })
      return
    }

    const newText =
      templateDetails.text.substring(0, pos) +
      variableText +
      templateDetails.text.substring(pos)
    tf.value = newText
    handleValueChange('text', newText)
    tf.focus()
  }

  const handleReset = () => {
    setTemplateDetails(oldTemplate)
  }

  const setSMSSegments = (text: string) => {
    const mLength = text.length
    const credit = Math.ceil(mLength / 160)
    setSegments(credit)
  }

  useEffect(() => {
    if (
      selectedMode === 'create' ||
      selectedMode === 'view' ||
      selectedMode === 'edit'
    ) {
      if (pageMode === 'create' && templateId !== null) {
        navigateToPageMode('create')
      } else {
        setPageMode(selectedMode)
        if (templateId != null) {
          getTemplateInfo(templateId)
        }
      }
    } else {
      setPageMode('view')
    }
  }, [searchParams, pageMode])

  useEffect(() => {
    if (!loading && pageMode === 'edit') {
      const isChanged = checkForChanges()
      setHasChanged(isChanged)
    }
  }, [templateDetails])

  if (loading) {
    return (
      <div className="h-full w-full grid place-items-center">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">SMS Templates</h1>
          <p className="text-sm text-muted-foreground">
            Manage your SMS templates efficiently.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={templateDetails.name}
                onChange={(e) => handleValueChange('name', e.target.value)}
                placeholder="Enter the template name"
                maxLength={40}
                disabled={!(pageMode === 'edit' || pageMode === 'create')}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="template-text">Template Text</Label>
              <p className="text-sm text-muted-foreground mb-1.5">
                Enter the text for your message.
              </p>
              <Textarea
                id="input-component-text"
                value={templateDetails.text}
                onChange={(e) => handleValueChange('text', e.target.value)}
                placeholder="Enter your message"
                disabled={!(pageMode === 'edit' || pageMode === 'create')}
                rows={5}
                maxLength={1024}
              />
              <div className="flex justify-between items-center mt-1.5 text-sm text-muted-foreground">
                <span>{templateDetails.text.length}/1024</span>
                {segments > 0 && (
                  <span>
                    {segments === 1
                      ? '1 SMS Segment'
                      : `${segments} SMS Segments`}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon">
                    <SmileIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                </PopoverContent>
              </Popover>
              <Button variant="outline" onClick={handleAddVariable}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Variable
              </Button>
            </div>

            {Object.keys(templateDetails.mappings).length > 0 && (
              <div className="space-y-4 border rounded-lg p-4">
                <h2 className="font-medium">Variable Mappings</h2>
                <div className="space-y-3">
                  {Object.entries(templateDetails.mappings).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="grid grid-cols-2 gap-2 items-center"
                      >
                        <div className="text-sm font-medium">{`{#var#} ${key}`}</div>
                        <select
                          value={value}
                          onChange={(e) =>
                            handleValueChange(key, e.target.value)
                          }
                          disabled={
                            !(pageMode === 'edit' || pageMode === 'create')
                          }
                          className="w-full rounded-md border bg-background px-3 py-1 text-sm"
                        >
                          <option value="">Select a variable</option>
                          {customVariables.map((variable) => (
                            <option key={variable.value} value={variable.value}>
                              {variable.text}
                            </option>
                          ))}
                        </select>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}
          </div>

          <div>
            <PreviewMessage
              text={templateDetails.text}
              mappings={templateDetails.mappings}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          {hasChanged && (
            <Button variant="outline" onClick={handleReset}>
              <UndoIcon className="h-4 w-4 mr-2" />
              Reset
            </Button>
          )}
          {pageMode === 'edit' && (
            <Button
              variant="default"
              disabled={!hasChanged}
              onClick={() => {
                updateTemplateInfo(templateDetails)
              }}
            >
              Save
            </Button>
          )}
          {pageMode === 'create' && (
            <Button
              variant="default"
              onClick={() => {
                createTemplateInfo(templateDetails)
              }}
            >
              Create
            </Button>
          )}
          {pageMode === 'view' && (
            <Button
              variant="default"
              onClick={() => navigateToPageMode('edit')}
            >
              Edit
            </Button>
          )}
        </div>
      </div>
      <Toaster />
    </div>
  )
}


export default function Page() {
  return <SMSTemplateManagement />;
}
