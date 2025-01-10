'use client'

import React, { ReactElement, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Image, Video, FileText, MapPin, Plus, X, Info } from 'lucide-react'

// Assuming these are imported from a separate file
import {
  templateHeaderMediaSubFormats,
  templateHeaderFormats,
  urlTypes,
  isFileSizeAccepted,
  isFileTypeAccepted,
  getFileTypeInstructions,
  getAcceptableFormats,
  getMaxSize,
  WhatsappTemplate,
  HeaderComponent,
  TemplateValidationResult,
  ValidationResult,
  Substitution,
} from '@lib/templateUtils'

type IconComponent = React.ComponentType<any>

type Icons = {
  [key: string]: IconComponent
}
const icons: Icons = {
  IMAGE: Image,
  VIDEO: Video,
  DOCUMENT: FileText,
  LOCATION: MapPin,
}

interface TemplateHeaderProps {
  pageMode: 'view' | 'edit' | 'create'
  template: WhatsappTemplate
  templateVariables: Array<{ text: string; value: string }>
  errors: ValidationResult[]
  handleFormatChange: (type: string, value: string) => void
  handleSubFormatChange: (componentType: string) => void
  handleHeaderFormatTypeChange: (componentType: string) => void
  handleTextChange: (type: string, value: string) => void
  handleAddVariable: (type: string) => void
  handleMappingValueChange: (type: string, key: string, value: string) => void
  handleSubstitutionValueChange: (
    type: string,
    index: number,
    value: Substitution,
  ) => void
  handleHeaderSubstitutionValueChangeOnFileRemove: () => void
  file: File | null
  setFile: (file: File | null) => void
}

function TemplateHeader({
  pageMode,
  template,
  templateVariables,
  errors,
  handleFormatChange,
  handleSubFormatChange,
  handleHeaderFormatTypeChange,
  handleTextChange,
  handleAddVariable,
  handleMappingValueChange,
  handleSubstitutionValueChange,
  handleHeaderSubstitutionValueChangeOnFileRemove,
  file,
  setFile,
}: TemplateHeaderProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleFileChange = (
    format: string,
    i: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setErrorMessage(null)

    const files = e.target.files
    const file = files ? files[0] : null

    setTimeout(() => {
      if (e.target) {
        e.target.value = ''
      }
    }, 100)

    if (!file) return

    if (!isFileTypeAccepted(format, file.type)) {
      const acceptedTypes = getAcceptableFormats(format)
      setErrorMessage(
        `Invalid file type. Please upload a file with one of the following types: ${acceptedTypes}.`,
      )
      return
    }

    if (!isFileSizeAccepted(format, file.size)) {
      const maxSizeMB = getMaxSize(format, file)
      setErrorMessage(
        `File size exceeds the maximum allowed size of ${maxSizeMB} MB.`,
      )
      return
    }

    setFile(file)
    handleSubstitutionValueChange('HEADER', i, file)
  }

  const handleCardClick = (subFormat: string) => {
    if (pageMode === 'edit' || pageMode === 'create') {
      handleSubFormatChange(subFormat)
    }
  }

  const renderLocationFields = (headerComponent: HeaderComponent) => {
    const locationVariables = ['LATITUDE', 'LONGITUDE', 'NAME', 'ADDRESS']

    return (
      <div className="space-y-4">
        <div className="w-[200px]">
          <Label>Type</Label>
          <Select
            disabled={!(pageMode === 'edit' || pageMode === 'create')}
            value={headerComponent.formatType}
            onValueChange={handleHeaderFormatTypeChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {urlTypes.map((urlType, i) => (
                <SelectItem key={i} value={urlType.value}>
                  {urlType.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4">
          <div className="grid grid-cols-[200px_1fr] md:grid-cols-[200px_1fr_1fr] items-center gap-4">
            <div className="font-medium">Variable</div>
            {headerComponent.formatType === 'DYNAMIC' && (
              <div className="font-medium">Value</div>
            )}
            <div className="font-medium">Sample Value</div>
          </div>

          {locationVariables.map((variable, i) => (
            <div
              key={variable}
              className="grid grid-cols-[200px_1fr] md:grid-cols-[200px_1fr_1fr] items-center gap-4"
            >
              <div className="font-medium">{`{{${variable}}}`}</div>

              {headerComponent.formatType === 'DYNAMIC' ? (
                <>
                  <Select
                    disabled={!(pageMode === 'edit' || pageMode === 'create')}
                    value={headerComponent?.mappings?.[variable.toLowerCase()]}
                    onValueChange={(value) =>
                      handleMappingValueChange(
                        'HEADER',
                        variable.toLowerCase(),
                        value,
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select value" />
                    </SelectTrigger>
                    <SelectContent>
                      {templateVariables.map((templateVar, j) => (
                        <SelectItem key={j} value={templateVar.value}>
                          {templateVar.text}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    disabled={!(pageMode === 'edit' || pageMode === 'create')}
                    value={
                      (headerComponent?.substitutions?.[i] as string) || ''
                    }
                    onChange={(e) =>
                      handleSubstitutionValueChange('HEADER', i, e.target.value)
                    }
                    placeholder={`Enter ${variable.toLowerCase()}`}
                  />
                </>
              ) : (
                <Input
                  className="md:col-span-2"
                  disabled={!(pageMode === 'edit' || pageMode === 'create')}
                  value={(headerComponent?.substitutions?.[i] as string) || ''}
                  onChange={(e) =>
                    handleSubstitutionValueChange('HEADER', i, e.target.value)
                  }
                  placeholder={`Enter ${variable.toLowerCase()}`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">
          {pageMode === 'edit' ? 'Edit Template' : 'Template Components'}
        </h2>
      </div>
      <div>
        <div className="flex items-center space-x-2">
          <h3 className="text-xl font-bold">Header</h3>
          <Badge variant="secondary">Optional</Badge>
        </div>
        <p className="text-sm text-gray-500">
          Add a title or choose which type of media you'll use for this header.
        </p>
      </div>
      <div>
        {template.components.filter((component) => component?.type === 'HEADER')
          .length > 0 ? (
          template.components
            .filter((component):component is HeaderComponent => component?.type === 'HEADER')
            .map((headerComponent, headerComponentIndex) => (
              <div key={headerComponentIndex} className="space-y-4">
                <Select
                  disabled={!(pageMode === 'edit' || pageMode === 'create')}
                  value={headerComponent.format}
                  onValueChange={(value) => handleFormatChange('HEADER', value)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    {templateHeaderFormats.map((format, i) => (
                      <SelectItem key={i} value={format.value}>
                        {format.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {headerComponent.format === 'TEXT' && (
                  <div className="space-y-2">
                    <Input
                      value={headerComponent.text}
                      disabled={!(pageMode === 'edit' || pageMode === 'create')}
                      onChange={(e) =>
                        handleTextChange('HEADER', e.target.value)
                      }
                      maxLength={60}
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {(headerComponent.text as string).length}/60
                      </span>
                      {(pageMode === 'edit' || pageMode === 'create') && (
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddVariable('HEADER')}
                            disabled={
                              (headerComponent.mappings &&
                                Object.keys(headerComponent?.mappings)
                                  .length === 1) as boolean
                            }
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Variable
                          </Button>
                          {headerComponent.mappings &&
                            Object.keys(headerComponent?.mappings).length ===
                              1 && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Info className="w-4 h-4 text-gray-400" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Your title can't include more than one
                                    variable.
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {headerComponent.format === 'TEXT' &&
                  headerComponent.mappings &&
                  Object.keys(headerComponent.mappings).length > 0 && (
                    <Card>
                      <CardContent className="p-4 space-y-4">
                        <h4 className="font-bold text-lg">
                          Samples for header content
                        </h4>
                        <p className="text-sm text-gray-500">
                          To help us review your content, provide examples of
                          the variables or media in the header. Meta reviews
                          templates and variable parameters to protect the
                          security and integrity of our services.
                        </p>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="font-bold">Variable</div>
                          <div className="font-bold">Value</div>
                          <div className="font-bold">Sample Value</div>
                          {Object.keys(headerComponent.mappings).map(
                            (key, i) => (
                              <React.Fragment key={i}>
                                <div className="font-bold">{`{{${key}}}`}</div>
                                <Select
                                  disabled={
                                    !(
                                      pageMode === 'edit' ||
                                      pageMode === 'create'
                                    )
                                  }
                                  value={
                                    headerComponent.mappings?.[key] as string
                                  }
                                  onValueChange={(value) =>
                                    handleMappingValueChange(
                                      'HEADER',
                                      key,
                                      value,
                                    )
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select value" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {templateVariables.map((variable, i) => (
                                      <SelectItem
                                        key={i}
                                        value={variable.value}
                                      >
                                        {variable.text}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Input
                                  disabled={
                                    !(
                                      pageMode === 'edit' ||
                                      pageMode === 'create'
                                    )
                                  }
                                  value={
                                    headerComponent.substitutions?.[i] as string
                                  }
                                  onChange={(e) =>
                                    handleSubstitutionValueChange(
                                      'HEADER',
                                      i,
                                      e.target.value,
                                    )
                                  }
                                />
                              </React.Fragment>
                            ),
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                {headerComponent.format === 'MEDIA' && (
                  <RadioGroup
                    disabled={!(pageMode === 'edit' || pageMode === 'create')}
                    value={headerComponent?.subFormat}
                    onValueChange={handleSubFormatChange}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                  >
                    {templateHeaderMediaSubFormats.map(
                      (subFormat: string, index: number) => {
                        const Icon = icons[subFormat]
                        return (
                          <div key={index} className="relative">
                            <RadioGroupItem
                              value={subFormat}
                              id={`subformat-${subFormat}`}
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor={`subformat-${subFormat}`}
                              className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                            >
                              {Icon && <Icon className="mb-2 h-6 w-6" />}
                              <span className="text-sm font-medium capitalize">
                                {subFormat.toLowerCase()}
                              </span>
                            </Label>
                          </div>
                        )
                      },
                    )}
                  </RadioGroup>
                )}

                {headerComponent.format === 'MEDIA' &&
                  headerComponent.subFormat &&
                  Object.keys(headerComponent.mappings || {}).length > 0 && (
                    <Card>
                      <CardContent className="p-4 space-y-4">
                        {headerComponent.subFormat === 'LOCATION' ? (
                          renderLocationFields(headerComponent)
                        ) : (
                          <>
                            <div className="space-y-2">
                              <Label>Type</Label>
                              <Select
                                disabled={
                                  !(
                                    pageMode === 'edit' || pageMode === 'create'
                                  )
                                }
                                value={headerComponent.formatType}
                                onValueChange={handleHeaderFormatTypeChange}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {urlTypes.map((urlType, i) => (
                                    <SelectItem key={i} value={urlType.value}>
                                      {urlType.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <h4 className="font-bold text-lg">
                              Samples for header content
                            </h4>
                            <p className="text-sm text-gray-500">
                              To help us review your content, provide examples
                              of the variables or media in the header. Meta
                              reviews templates and variable parameters to
                              protect the security and integrity of our
                              services.
                            </p>
                            {headerComponent.formatType === 'STATIC' ? (
                              <div className="grid grid-cols-2 gap-4">
                                <div className="font-bold">Variable</div>
                                <div className="font-bold">Sample Value</div>
                                {Object.keys(
                                  headerComponent?.mappings || {},
                                ).map((key, i) => (
                                  <React.Fragment key={i}>
                                    <div className="font-bold">{`{{${key}}}`}</div>
                                    <div className="flex items-center space-x-2">
                                      <Button
                                        disabled={
                                          !(
                                            pageMode === 'edit' ||
                                            pageMode === 'create'
                                          )
                                        }
                                        variant="secondary"
                                        asChild
                                        className="w-full max-w-[200px]"
                                      >
                                        <label
                                          htmlFor={`file-upload-${i}`}
                                          className="truncate max-w-[200px]"
                                        >
                                          {headerComponent.file?.originalName ||
                                            (headerComponent.substitutions &&
                                              headerComponent.substitutions.length > 0 &&
                                              typeof headerComponent.substitutions[0] === 'object' &&
                                              headerComponent.substitutions[0] !== null &&
                                              'name' in headerComponent.substitutions[0] &&
                                              headerComponent.substitutions[0].name)
                                            ? headerComponent.file?.originalName ||
                                              (headerComponent.substitutions?.[0] instanceof File &&
                                                (headerComponent.substitutions[0] as File).name)
                                            : `Choose JPEG or PNG file`}
                                        </label>


                                      </Button>
                                      <input
                                        type="file"
                                        id={`file-upload-${i}`}
                                        hidden
                                        accept={getAcceptableFormats(
                                          headerComponent.subFormat as string,
                                        )}
                                        onChange={(e) =>
                                          handleFileChange(
                                            headerComponent.subFormat as string,
                                            i,
                                            e,
                                          )
                                        }
                                      />
                                      {(headerComponent.file?.originalName ||
                                        (headerComponent.substitutions &&
                                          headerComponent.substitutions.length >
                                            0 &&
                                          typeof headerComponent
                                            .substitutions[0] === 'object' &&
                                          headerComponent.substitutions[0] !==
                                            null)) && (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          disabled={
                                            !(
                                              pageMode === 'edit' ||
                                              pageMode === 'create'
                                            )
                                          }
                                          onClick={() => {
                                            handleHeaderSubstitutionValueChangeOnFileRemove()
                                            setFile(null)
                                          }}
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </div>
                                  </React.Fragment>
                                ))}
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="font-bold">Variable</div>
                                {headerComponent.formatType === 'DYNAMIC' && (
                                  <div className="font-bold">Value</div>
                                )}
                                <div className="font-bold">Sample Value</div>
                                {Object.keys(
                                  headerComponent.mappings || {},
                                ).map((key, i) => (
                                  <React.Fragment key={i}>
                                    <div className="font-bold">{`{{${key}}}`}</div>
                                    {headerComponent.formatType ===
                                      'DYNAMIC' && (
                                      <Select
                                        disabled={
                                          !(
                                            pageMode === 'edit' ||
                                            pageMode === 'create'
                                          )
                                        }
                                        value={headerComponent?.mappings?.[key]}
                                        onValueChange={(value) =>
                                          handleMappingValueChange(
                                            'HEADER',
                                            key,
                                            value,
                                          )
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select value" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {templateVariables.map(
                                            (variable, i) => (
                                              <SelectItem
                                                key={i}
                                                value={variable.value}
                                              >
                                                {variable.text}
                                              </SelectItem>
                                            ),
                                          )}
                                        </SelectContent>
                                      </Select>
                                    )}
                                    <div className="flex items-center space-x-2">
                                      <Button
                                        disabled={
                                          !(
                                            pageMode === 'edit' ||
                                            pageMode === 'create'
                                          )
                                        }
                                        variant="outline"
                                        asChild
                                        className="w-full max-w-[200px]"
                                      >
                                        <label
                                          htmlFor={`file-upload-${i}`}
                                          className="truncate max-w-[200px]"
                                        >
                                          {headerComponent.file?.originalName ||
                                            (headerComponent.substitutions &&
                                              headerComponent.substitutions.length > 0 &&
                                              typeof headerComponent.substitutions[0] === 'object' &&
                                              headerComponent.substitutions[0] !== null &&
                                              'name' in headerComponent.substitutions[0] &&
                                              headerComponent.substitutions[0].name)
                                            ? headerComponent.file?.originalName ||
                                              (headerComponent.substitutions?.[0] instanceof File &&
                                                (headerComponent.substitutions?.[0] as File).name)
                                            : `Choose ${getFileTypeInstructions(headerComponent.subFormat as string)} file`}
                                        </label>

                                      </Button>
                                      <input
                                        type="file"
                                        id={`file-upload-${i}`}
                                        hidden
                                        accept={getAcceptableFormats(
                                          headerComponent.subFormat as string,
                                        )}
                                        onChange={(e) =>
                                          handleFileChange(
                                            headerComponent.subFormat as string,
                                            i,
                                            e,
                                          )
                                        }
                                      />
                                      {(headerComponent.file?.originalName ||
                                        (headerComponent.substitutions &&
                                          headerComponent.substitutions.length >
                                            0 &&
                                          typeof headerComponent
                                            .substitutions[0] === 'object' &&
                                          headerComponent.substitutions[0] !==
                                            null)) && (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          disabled={
                                            !(
                                              pageMode === 'edit' ||
                                              pageMode === 'create'
                                            )
                                          }
                                          onClick={() => {
                                            handleHeaderSubstitutionValueChangeOnFileRemove()
                                            setFile(null)
                                          }}
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </div>
                                  </React.Fragment>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </CardContent>
                    </Card>
                  )}

                {errors.map(
                  (error) =>
                    error.type === 'HEADER' &&
                    error.isValid === false && (
                      <Alert variant="destructive" key={error.type}>
                        <AlertDescription>
                          {!error.extras.isMappingsValid && 'Missing Values'}
                          {(!error.extras.isMappingsValid ||
                            !error.extras.isSubstitutionsValid) && (
                            <Separator className="my-2" />
                          )}
                          {!error.extras.isSubstitutionsValid &&
                            'Missing Sample Values'}
                          {!error.extras.isTextValid &&
                            "Template Header with format = Text cannot be empty. Select Header as None if you don't need header."}
                        </AlertDescription>
                      </Alert>
                    ),
                )}
                {errorMessage && (
                  <Alert variant="destructive">
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}
              </div>
            ))
        ) : (
          <Select
            disabled={!(pageMode === 'edit' || pageMode === 'create')}
            onValueChange={(value) => handleFormatChange('HEADER', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              {templateHeaderFormats.map((format, i) => (
                <SelectItem key={i} value={format.value}>
                  {format.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  )
}

export default TemplateHeader
