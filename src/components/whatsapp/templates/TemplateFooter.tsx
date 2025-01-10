import React from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  ComponentBase,
  FooterComponent,
  templateFooterFormats,
  ValidationResult,
  WhatsappTemplate,
} from '@/lib/templateUtils'

interface TemplateFooterProps {
  pageMode: 'view' | 'edit' | 'create'
  template: WhatsappTemplate
  errors: ValidationResult[]
  handleFormatChange: (type: string, value: string) => void
  handleTextChange: (type: string, value: string) => void
}

function TemplateFooter({
  pageMode,
  template,
  errors,
  handleFormatChange,
  handleTextChange,
}: TemplateFooterProps) {
  return (
    <React.Fragment>
      <div className="mt-1">
        <div className="flex flex-row gap-2 items-center mb-2">
          <h3 className="text-2xl font-bold">Footer</h3>
          <Badge variant="secondary">Optional</Badge>
        </div>
        <p className="text-sm">
          Add a short line of text to the bottom of your message template.
        </p>
      </div>
      <div className="mt-1 mb-1">
        {template.components.filter((component) => component?.type === 'FOOTER')
          .length > 0 ? (
          template.components
            .filter((component): component is FooterComponent => component?.type === 'FOOTER')
            .map((footerComponent: FooterComponent, fcIndex:number) => (
              <div key={fcIndex} className="grid grid-cols-12 gap-2">
                <div className="col-span-12 sm:col-span-2">
                  <Select
                    value={footerComponent.format}
                    onValueChange={(value) =>
                      handleFormatChange('FOOTER', value)
                    }
                    disabled={!(pageMode === 'edit' || pageMode === 'create')}
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      {templateFooterFormats.map((format, i) => (
                        <SelectItem
                          key={i}
                          value={format.value}
                          className="text-sm"
                        >
                          {format.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {footerComponent.format === 'TEXT' && (
                  <div className="col-span-12 sm:col-span-10">
                    <div className="relative">
                      <Input
                        value={footerComponent.text}
                        onChange={(e) =>
                          handleTextChange('FOOTER', e.target.value)
                        }
                        disabled={
                          !(pageMode === 'edit' || pageMode === 'create')
                        }
                        maxLength={60}
                        id="type-FOOTER"
                        className={`h-9 pr-16 text-sm ${
                          (footerComponent?.variables?.length ?? 0) > 0
                            ? 'border-red-500'
                            : ''
                        }`}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                        {(footerComponent.text as string).length}/60
                      </span>
                    </div>
                  </div>
                )}
                {errors.map(
                  (error) =>
                    error.type === 'FOOTER' &&
                    error.isValid === false && (
                      <div
                        key={`error-${fcIndex}`}
                        className="col-span-12 mt-2"
                      >
                        <Alert variant="destructive">
                          <AlertDescription>
                            {!error.extras.isTextValid &&
                              `Template Footer with format = Text cannot be empty. Select Footer as None if you don't need footer.`}
                          </AlertDescription>
                        </Alert>
                      </div>
                    ),
                )}
                {(footerComponent?.variables?.length ?? 0) > 0 && (
                  <div className="col-span-12">
                    <Alert variant="destructive">
                      <AlertDescription>
                        Footer Cannot have Variables
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </div>
            ))
        ) : (
          <Select
            defaultValue="NONE"
            onValueChange={(value) => handleFormatChange('FOOTER', value)}
            disabled={pageMode !== 'edit'}
          >
            <SelectTrigger className="w-40 h-9">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              {templateFooterFormats.map((format, i) => (
                <SelectItem key={i} value={format.value} className="text-sm">
                  {format.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </React.Fragment>
  )
}

export default TemplateFooter
