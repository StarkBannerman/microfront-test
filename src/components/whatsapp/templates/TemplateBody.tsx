import React, { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Bold, Italic, Strikethrough, Code, Smile } from 'lucide-react'
import EmojiPicker from 'emoji-picker-react'
import {
  BodyComponent,
  TextFormatter,
  WhatsappTemplate,
} from '@/lib/templateUtils'

interface TemplateBodyProps {
  pageMode: 'view' | 'edit' | 'create'
  template: WhatsappTemplate
  templateVariables: Array<{ text: string; value: string }>
  errors: any
  handleTextChange: (type: string, value: string) => void
  handleAddVariable: (componentType: string) => void
  handleMappingValueChange: (type: string, key: string, value: string) => void
  handleSubstitutionValueChange: (
    type: string,
    index: number,
    value: string,
  ) => void
  handleTextFormattersClick: (type: string, formatter: TextFormatter) => void
}

export default function TemplateBody({
  pageMode,
  template,
  templateVariables,
  errors,
  handleTextChange,
  handleAddVariable,
  handleMappingValueChange,
  handleSubstitutionValueChange,
  handleTextFormattersClick,
}: TemplateBodyProps) {
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false)

  const bodyComponent = template.components.find((c) => c?.type === 'BODY') as
    | BodyComponent
    | undefined

  if (!bodyComponent) return null

  const handleEmojiClick = (emojiObject: any) => {
    handleTextChange('BODY', bodyComponent.text + emojiObject.emoji)
    setIsEmojiPickerOpen(false)
  }

  const applyTextFormat = (type: string, formatter: string) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text: string = bodyComponent.text as string

    let formatterTags = {
      bold: '*',
      italics: '_',
      strikethrough: '~',
      monospace: '```',
    }[formatter]

    if (!formatterTags) return

    // If no text is selected, insert placeholder
    if (start === end) {
      const newText =
        text.slice(0, start) +
        `${formatterTags}text${formatterTags}` +
        text.slice(end)
      handleTextChange('BODY', newText)
      return
    }

    // If text is selected, wrap it with formatter tags
    const selectedText = text.slice(start, end)
    const newText =
      text.slice(0, start) +
      `${formatterTags}${selectedText}${formatterTags}` +
      text.slice(end)
    handleTextChange('BODY', newText)
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold">Body</h3>
      <div className="space-y-2">
        <div className="relative">
          <Textarea
            id="input-component-BODY"
            placeholder="Body Text"
            value={bodyComponent.text}
            onChange={(e) => handleTextChange('BODY', e.target.value)}
            disabled={pageMode === 'view'}
            rows={6}
            className="pr-20" // Add padding to prevent text overlap with counter
          />
          <div className="absolute right-0 bottom-0 flex items-center space-x-2 p-2">
            <span className="text-sm text-muted-foreground">
              {(bodyComponent.text as string).length}/1024
            </span>
          </div>
        </div>
        <div className="flex justify-end items-center space-x-2">
          <Button
            size="icon"
            variant="outline"
            onClick={() => applyTextFormat('BODY', 'bold')}
            disabled={pageMode === 'view'}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={() => applyTextFormat('BODY', 'italics')}
            disabled={pageMode === 'view'}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={() => applyTextFormat('BODY', 'strikethrough')}
            disabled={pageMode === 'view'}
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={() => applyTextFormat('BODY', 'monospace')}
            disabled={pageMode === 'view'}
          >
            <Code className="h-4 w-4" />
          </Button>
          <Popover open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                disabled={pageMode === 'view'}
              >
                <Smile className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </PopoverContent>
          </Popover>
          <Button
            onClick={() => handleAddVariable('BODY')}
            disabled={pageMode === 'view'}
          >
            Add Variable
          </Button>
        </div>
      </div>

      {/* Rest of the component remains the same */}
      {(bodyComponent.text?.length ?? 0) >= 896 &&
        (bodyComponent.substitutions?.length ?? 0) > 0 && (
          <Alert>
            <AlertDescription>
              This template message might face issues due to the long text and
              the number of variables. Please note that the maximum text size
              should be 1024 characters, including the actual variable values.
              Consider shortening the text, reducing the number of variables, or
              shortening URLs (if any) to ensure the final template does not
              exceed 1024 characters. URLs that are included as variables will
              be shortened by us before sending out.
            </AlertDescription>
          </Alert>
        )}

      {bodyComponent.mappings &&
        Object.keys(bodyComponent.mappings).length > 0 && (
          <Card>
            <CardContent className="space-y-4">
              <h4 className="font-semibold">Variables</h4>
              {Object.entries(bodyComponent.mappings).map(
                ([key, value], index) => (
                  <div key={key} className="flex items-center space-x-2">
                    <span>{`{{${key}}}`}</span>
                    <Select
                      value={value}
                      onValueChange={(newValue) =>
                        handleMappingValueChange('BODY', key, newValue)
                      }
                      disabled={pageMode === 'view'}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select value" />
                      </SelectTrigger>
                      <SelectContent>
                        {templateVariables.map((variable) => (
                          <SelectItem
                            key={variable.value}
                            value={variable.value}
                          >
                            {variable.text}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={
                        (bodyComponent.substitutions?.[index] as string) || ''
                      }
                      onChange={(e) =>
                        handleSubstitutionValueChange(
                          'BODY',
                          index,
                          e.target.value,
                        )
                      }
                      disabled={pageMode === 'view'}
                      placeholder="Sample value"
                    />
                  </div>
                ),
              )}
            </CardContent>
          </Card>
        )}

      {errors.body && (
        <Alert variant="destructive">
          <AlertDescription>{errors.body}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
