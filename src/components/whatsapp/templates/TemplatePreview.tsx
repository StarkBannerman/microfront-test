'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Play,
  ChevronDown,
  Phone,
  ArrowUpRight,
  Copy,
  SquareArrowOutUpRight,
  ArrowLeft,
  ImageIcon,
  FileText,
  Video,
} from 'lucide-react'
import {
  WhatsappTemplate,
  HeaderComponent,
  BodyComponent,
  FooterComponent,
  ButtonComponent,
  Substitution,
} from '@/lib/templateUtils'

interface TemplatePreviewProps {
  template: {
    components: WhatsappTemplate['components']
  }
}

export function TemplatePreview({ template }: TemplatePreviewProps) {
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)
  const headerComponent = template.components.find(
    (c) => c.type === 'HEADER',
  ) as HeaderComponent | undefined
  const bodyComponent = template.components.find((c) => c.type === 'BODY') as
    | BodyComponent
    | undefined
  const footerComponent = template.components.find(
    (c) => c.type === 'FOOTER',
  ) as FooterComponent | undefined
  const buttonsComponent = template.components.find(
    (c) => c.type === 'BUTTONS',
  ) as ButtonComponent | undefined

  useEffect(() => {
    if (
      headerComponent?.format === 'MEDIA' &&
      headerComponent.substitutions?.[0]
    ) {
      const fileOrBlob = headerComponent.substitutions[0] as File
      const url = URL.createObjectURL(fileOrBlob)
      setMediaUrl(url)
      return () => {
        URL.revokeObjectURL(url)
      }
    } else {
      setMediaUrl(null)
    }
  }, [headerComponent?.format, headerComponent?.substitutions])

  const replaceVariablesWithSamples = (
    text: string,
    mappings?: Record<string, string> | null,
    substitutions?: Substitution[],
  ) => {
    if (!text || !mappings || !substitutions) return text
    let replacedText = text
    Object.keys(mappings).forEach((key, index) => {
      const variable = `{{${key}}}`
      const sampleValue = substitutions[index] as string
      if (sampleValue) {
        replacedText = replacedText.replace(variable, sampleValue)
      }
    })

    // Handle bold formatting
    replacedText = replacedText.replace(/\*(.*?)\*/g, '<strong>$1</strong>')

    // Handle italic formatting
    replacedText = replacedText.replace(/_(.*?)_/g, '<em>$1</em>')

    // Handle strikethrough formatting
    replacedText = replacedText.replace(/~(.*?)~/g, '<del>$1</del>')

    // Handle monospace formatting
    replacedText = replacedText.replace(/```(.*?)```/g, '<code>$1</code>')

    return replacedText
  }

  const renderFormattedText = (text: string) => {
    return <span dangerouslySetInnerHTML={{ __html: text }} />
  }

  const getMediaIcon = (subFormat?: string) => {
    switch (subFormat) {
      case 'IMAGE':
        return <ImageIcon className="h-8 w-8 text-muted-foreground" />
      case 'VIDEO':
        return <Video className="h-8 w-8 text-muted-foreground" />
      case 'DOCUMENT':
        return <FileText className="h-8 w-8 text-muted-foreground" />
      default:
        return null
    }
  }

  const getButtonIcon = (buttonType: string) => {
    switch (buttonType) {
      case 'URL':
        return <SquareArrowOutUpRight className="h-4 w-4" />
      case 'PHONE_NUMBER':
        return <Phone className="h-4 w-4" />
      case 'QUICK_REPLY':
        return <ArrowUpRight className="h-4 w-4" />
      case 'COPY_CODE':
        return <Copy className="h-4 w-4" />
      default:
        return <ArrowLeft className="h-4 w-4 rotate-180" />
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="bg-white p-4 rounded-t-lg border-b flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-700">Template preview</h3>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Play className="h-4 w-4" />
        </Button>
      </div>

      {/* Message Container */}
      <div className="bg-[#E5DDD5] p-4 min-h-[500px]">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden max-w-[95%] mx-auto">
          {/* Header Text or Media */}
          {headerComponent?.format === 'TEXT' && (
            <div className="p-4 border-b">
              <p className="font-medium">
                {renderFormattedText(
                  replaceVariablesWithSamples(
                    headerComponent.text || '',
                    headerComponent.mappings,
                    headerComponent.substitutions,
                  ),
                )}
              </p>
            </div>
          )}

          {headerComponent?.format === 'MEDIA' && headerComponent.subFormat && (
            <div className="border-b">
              <div className="bg-muted flex items-center justify-center">
                {mediaUrl ? (
                  headerComponent.subFormat === 'IMAGE' ? (
                    <img
                      src={mediaUrl}
                      alt="Header media"
                      className="w-full h-auto object-contain"
                    />
                  ) : headerComponent.subFormat === 'VIDEO' ? (
                    <video
                      src={mediaUrl}
                      controls
                      className="w-full h-auto object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 p-4">
                      {getMediaIcon(headerComponent.subFormat)}
                      <span className="text-sm text-muted-foreground">
                        {headerComponent.substitutions?.[0] instanceof File
                          ? (headerComponent.substitutions[0] as File).name
                          : 'No name'}
                      </span>
                    </div>
                  )
                ) : (
                  <div className="p-4">
                    <span className="text-sm text-muted-foreground">
                      No {headerComponent.subFormat.toLowerCase()} selected
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Body */}
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              {bodyComponent && (
                <p className="text-[15px] text-gray-800 whitespace-pre-wrap">
                  {renderFormattedText(
                    replaceVariablesWithSamples(
                      bodyComponent.text || '',
                      bodyComponent.mappings,
                      bodyComponent.substitutions,
                    ),
                  )}
                </p>
              )}
            </div>

            {/* Footer */}
            {footerComponent?.format === 'TEXT' && (
              <p className="text-sm text-gray-500">
                {renderFormattedText(
                  replaceVariablesWithSamples(
                    footerComponent.text || '',
                    footerComponent.mappings,
                    footerComponent.substitutions,
                  ),
                )}
              </p>
            )}

            {/* Timestamp */}
            <div className="flex justify-end">
              <span className="text-xs text-gray-400">09:56</span>
            </div>
          </div>

          {/* Buttons */}
          {buttonsComponent?.buttons && buttonsComponent.buttons.length > 0 && (
            <div className="border-t divide-y">
              {/* Show only first two buttons */}
              {buttonsComponent.buttons.slice(0, 2).map((button, index) => (
                <button
                  key={index}
                  className="w-full p-3 text-[#0288D1] hover:bg-gray-50 flex items-center justify-center gap-2 text-sm font-medium"
                >
                  {getButtonIcon(button.type)}
                  {renderFormattedText(
                    replaceVariablesWithSamples(
                      button.text || `Button ${index + 1}`,
                      button.mappings,
                      button.substitutions,
                    ),
                  )}
                </button>
              ))}

              {/* Show "See all options" if there are more than 2 buttons */}
              {buttonsComponent.buttons.length > 2 && (
                <button className="w-full p-3 text-[#0288D1] hover:bg-gray-50 flex items-center justify-center gap-2 text-sm font-medium">
                  <ChevronDown className="h-4 w-4" />
                  See all options
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
