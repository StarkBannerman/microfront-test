'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Plus,
  Minus,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  Info,
  ArrowUpDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'

import {
  Button as TypeButton,
  templateButtonsDictionary,
  buttonsGroupings,
  maxTemplateButtons,
  urlTypes,
  callToActionButtons,
  quickReplyButtons,
  WhatsappTemplate,
  Component,
  ButtonComponent,
} from '@/lib/templateUtils'

import { CountryCodeSelect } from '@/components/common/CountryCodeSelector'

interface ButtonType {
  type: string
  text: string
  url?: string
  urlType?: string
  mappings?: Record<string, string>
  country?: string
  number?: string
  codeType?: string
  substitutions?: string[]
  textEditable?: boolean
}

interface TemplateButtonProps {
  pageMode: 'view' | 'edit' | 'create'
  template: WhatsappTemplate
  templateVariables: Array<{ text: string; value: string }>
  errors: any[]
  handleAddButton: (firstGroup: string, type: string) => void
  handleRemoveButton: (
    currentGroup: string,
    removableGroup: string,
    buttonIndex: number,
  ) => void
  handleMoveButtonInDirection: (
    currentGroup: string,
    movableGroup: string,
    buttonIndex: number,
    direction: number,
  ) => void
  handleSwapButtonGroup: (currentGroup: string) => void
  handleButtonTypeChange: (
    group: string,
    buttonIndex: number,
    newType: string,
  ) => void
  handleButtonFieldChange: (
    group: string,
    buttonIndex: number,
    field: string,
    newFieldValue: string,
  ) => void
  handleButtonMappingValueChange: (
    group: string,
    buttonIndex: number,
    newValue: string,
  ) => void
  handleButtonSubstitutionValueChange: (
    group: string,
    buttonIndex: number,
    newValue: string,
  ) => void
}

export default function TemplateButton({
  pageMode,
  template,
  templateVariables,
  errors,
  handleAddButton,
  handleRemoveButton,
  handleMoveButtonInDirection,
  handleSwapButtonGroup,
  handleButtonTypeChange,
  handleButtonFieldChange,
  handleButtonMappingValueChange,
  handleButtonSubstitutionValueChange,
}: TemplateButtonProps) {
  const [templateButtons, setTemplateButtons] = useState<ButtonType[]>([])
  const [templateQuickReplyButtons, setTemplateQuickReplyButtons] = useState<
    ButtonType[]
  >([])
  const [templateCallToActionButtons, setTemplateCallToActionButtons] =
    useState<ButtonType[]>([])
  const [templateFirstButtonType, setTemplateFirstButtonType] = useState<
    string | null
  >(null)

  useEffect(() => {
    if (template && template.components) {
       const buttonsComponent = template.components.find(
          (c) => c.type === 'BUTTONS',
        ) as ButtonComponent

      const buttonsArray:TypeButton[] = buttonsComponent?.buttons

      const quickReply: ButtonType[] = []
      const callToAction: ButtonType[] = []
      let firstType: string | null = null

      buttonsArray.forEach((button) => {
        if (!firstType) {
          firstType = ['URL', 'PHONE_NUMBER', 'COPY_CODE'].includes(button.type)
            ? 'CALL_TO_ACTION'
            : 'QUICK_REPLY'
        }
        if (button.type === 'QUICK_REPLY') {
          quickReply.push(button)
        } else if (['URL', 'PHONE_NUMBER', 'COPY_CODE'].includes(button.type)) {
          callToAction.push(button)
        }
      })

      setTemplateButtons(buttonsArray)
      setTemplateQuickReplyButtons(quickReply)
      setTemplateCallToActionButtons(callToAction)
      setTemplateFirstButtonType(firstType)
    }
  }, [template])

  const getButtonTypeCount = (type: string) => {
    return templateButtons.filter((tb) => tb.type === type).length
  }

  const RenderButtonGroup = (
    group: string,
    buttons: ButtonType[],
    orderable: boolean,
  ) => (
    <div className="rounded-lg border border-gray-300 p-4 mt-2 mb-2">
      <div className="flex flex-row justify-start items-center gap-2 ml-4">
        {orderable && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    handleSwapButtonGroup(templateFirstButtonType!)
                  }
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Swap</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <h4 className="font-medium">
          {group === 'QUICK_REPLY' ? 'Quick Reply' : 'Call to Action'}
        </h4>
      </div>
      {buttons.map((button, buttonIndex) => (
        <div key={buttonIndex} className="grid grid-cols-12 gap-4 mt-4">
          <div className="col-span-11">
            {group === 'QUICK_REPLY' ? (
              <Card className="shadow-none p-0">
                <CardContent className="rounded-lg border border-gray-300 bg-gray-50 p-4">
                  <div className="space-y-2">
                    <Label className="mb-2">Button text</Label>
                    <div className="relative">
                      <Input
                        className="bg-white pr-16"
                        value={button.text}
                        onChange={(e) =>
                          handleButtonFieldChange(
                            group,
                            buttonIndex,
                            'text',
                            e.target.value,
                          )
                        }
                        disabled={
                          !(pageMode === 'edit' || pageMode === 'create') ||
                          !button.textEditable
                        }
                        maxLength={25}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-sm text-muted-foreground">
                        {button.text.length}/25
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-none p-0">
                <CardContent className="rounded-lg border border-gray-300 bg-gray-50 p-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label
                        className="mb-2"
                        htmlFor={`button-type-${buttonIndex}`}
                      >
                        Type of action
                      </Label>
                      <Select
                        disabled={pageMode === 'view'}
                        value={button.type}
                        onValueChange={(value) =>
                          handleButtonTypeChange(group, buttonIndex, value)
                        }
                      >
                        <SelectTrigger
                          id={`button-type-${buttonIndex}`}
                          className="bg-white"
                        >
                          <SelectValue placeholder="Select button type" />
                        </SelectTrigger>
                        <SelectContent>
                          {(group === 'QUICK_REPLY'
                            ? quickReplyButtons
                            : callToActionButtons
                          ).map((btn) => (
                            <SelectItem
                              key={btn.value}
                              value={btn.value as string}
                              disabled={
                                getButtonTypeCount(btn.value as string) >=
                                (btn.maximum as number)
                              }
                            >
                              {btn.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label
                        className="mb-2"
                        htmlFor={`button-text-${buttonIndex}`}
                      >
                        Button text
                      </Label>
                      <div className="relative">
                        <Input
                          className="bg-white pr-16"
                          id={`button-text-${buttonIndex}`}
                          value={button.text}
                          onChange={(e) =>
                            handleButtonFieldChange(
                              group,
                              buttonIndex,
                              'text',
                              e.target.value,
                            )
                          }
                          disabled={pageMode === 'view' || !button.textEditable}
                          maxLength={25}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-sm text-muted-foreground">
                          {button.text.length}/25
                        </div>
                      </div>
                    </div>
                  </div>
                  {button.type === 'URL' && (
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div>
                        <Label
                          className="mb-2"
                          htmlFor={`button-url-type-${buttonIndex}`}
                        >
                          URL type
                        </Label>
                        <Select
                          disabled={pageMode === 'view'}
                          value={button.urlType}
                          onValueChange={(value) =>
                            handleButtonFieldChange(
                              group,
                              buttonIndex,
                              'urlType',
                              value,
                            )
                          }
                        >
                          <SelectTrigger
                            id={`button-url-type-${buttonIndex}`}
                            className="bg-white"
                          >
                            <SelectValue placeholder="Select URL type" />
                          </SelectTrigger>
                          <SelectContent>
                            {urlTypes.map((urlType) => (
                              <SelectItem
                                key={urlType.value}
                                value={urlType.value}
                              >
                                {urlType.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Label
                          className="mb-2"
                          htmlFor={`button-url-${buttonIndex}`}
                        >
                          Website URL
                        </Label>
                        <div className="relative">
                          <Input
                            className="bg-white pr-20"
                            id={`button-url-${buttonIndex}`}
                            type="url"
                            value={button.url}
                            onChange={(e) =>
                              handleButtonFieldChange(
                                group,
                                buttonIndex,
                                'url',
                                e.target.value,
                              )
                            }
                            disabled={pageMode === 'view'}
                            maxLength={2000}
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-sm text-muted-foreground">
                            {button.url?.length || 0}/2000
                          </div>
                        </div>
                      </div>
                      {button.urlType === 'DYNAMIC' && (
                        <div className="col-span-3 mt-4">
                          <h4 className="font-medium mb-2">Add Sample URL</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            To help us review your message template, please add
                            an example for your dynamic URL. Meta reviews
                            templates and variable parameters to protect the
                            security and integrity of our services.
                          </p>
                          <div className="grid grid-cols-12 gap-2 mt-2">
                            <div className="col-span-2">
                              <Label className="font-medium mb-2">
                                Variable
                              </Label>
                              <div className="flex items-center h-9">
                                <span className="font-medium">{'{{1}}'}</span>
                              </div>
                            </div>
                            <div className="col-span-3">
                              <Label className="font-medium mb-2">Value</Label>
                              <Select
                                disabled={pageMode === 'view'}
                                value={button.mappings?.['1'] || ''}
                                onValueChange={(value) =>
                                  handleButtonMappingValueChange(
                                    group,
                                    buttonIndex,
                                    value,
                                  )
                                }
                              >
                                <SelectTrigger className="bg-white">
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
                            </div>
                            <div className="col-span-7">
                              <Label className="mb-2">Sample URL</Label>
                              <Input
                                className="bg-white"
                                type="url"
                                value={button.substitutions?.[0] || ''}
                                onChange={(e) =>
                                  handleButtonSubstitutionValueChange(
                                    group,
                                    buttonIndex,
                                    e.target.value,
                                  )
                                }
                                disabled={pageMode === 'view'}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {button.type === 'PHONE_NUMBER' && (
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div>
                        <Label
                          className="mb-2"
                          htmlFor={`button-country-code-${buttonIndex}`}
                        >
                          Country Code
                        </Label>
                        <CountryCodeSelect
                          value={button.country}
                          onChange={(value) =>
                            handleButtonFieldChange(
                              group,
                              buttonIndex,
                              'country',
                              value,
                            )
                          }
                          onBlur={() => {}}
                          name={`button-country-code-${buttonIndex}`}
                          className="w-full bg-white"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label
                          className="mb-2"
                          htmlFor={`button-phone-number-${buttonIndex}`}
                        >
                          Phone Number
                        </Label>
                        <Input
                          className="bg-white"
                          id={`button-phone-number-${buttonIndex}`}
                          placeholder="Phone Number"
                          value={button.number}
                          onChange={(e) =>
                            handleButtonFieldChange(
                              group,
                              buttonIndex,
                              'number',
                              e.target.value,
                            )
                          }
                          disabled={pageMode === 'view'}
                        />
                      </div>
                    </div>
                  )}
                  {button.type === 'COPY_CODE' &&
                    button.codeType === 'DYNAMIC' && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">
                          Add Sample Offer Code
                        </h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          To help us review your message template, please add an
                          example for your offer code. Meta reviews templates
                          and variable parameters to protect the security and
                          integrity of our services.
                        </p>
                        <div className="grid grid-cols-12 gap-2 mt-2">
                          <div className="col-span-2">
                            <Label className="font-medium mb-2">Variable</Label>
                            <div className="flex items-center h-9">
                              <span className="font-medium">{'{{1}}'}</span>
                            </div>
                          </div>
                          <div className="col-span-3">
                            <Label className="mb-2">Value</Label>
                            <Select
                              disabled={pageMode === 'view'}
                              value={button.mappings?.['1'] || ''}
                              onValueChange={(value) =>
                                handleButtonMappingValueChange(
                                  group,
                                  buttonIndex,
                                  value,
                                )
                              }
                            >
                              <SelectTrigger className="bg-white">
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
                          </div>
                          <div className="col-span-7">
                            <Label className="mb-2">Sample Offer Code</Label>
                            <div className="relative">
                              <Input
                                className="bg-white pr-16"
                                value={button.substitutions?.[0] || ''}
                                onChange={(e) =>
                                  handleButtonSubstitutionValueChange(
                                    group,
                                    buttonIndex,
                                    e.target.value,
                                  )
                                }
                                disabled={pageMode === 'view'}
                                maxLength={15}
                              />
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-sm text-muted-foreground">
                                {button.substitutions?.[0]?.length || 0}/15
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>
            )}
          </div>
          <div className="col-span-1">
            <div className="flex flex-col items-center justify-center h-full">
              {buttonIndex !== 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleMoveButtonInDirection(
                            templateFirstButtonType!,
                            group,
                            buttonIndex,
                            -1,
                          )
                        }
                        disabled={
                          !(pageMode === 'edit' || pageMode === 'create')
                        }
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Move this button Up</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        handleRemoveButton(
                          templateFirstButtonType!,
                          group,
                          buttonIndex,
                        )
                      }
                      disabled={!(pageMode === 'edit' || pageMode === 'create')}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete this button</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {buttonIndex !== buttons.length - 1 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleMoveButtonInDirection(
                            templateFirstButtonType!,
                            group,
                            buttonIndex,
                            1,
                          )
                        }
                        disabled={
                          !(pageMode === 'edit' || pageMode === 'create')
                        }
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Move this button Down</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <h3 className="text-2xl font-bold">Buttons</h3>
          <Badge variant="secondary">Optional</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Create buttons that let customers respond to your message or take
          action.
        </p>
      </div>
      <div className="mt-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              disabled={
                !(pageMode === 'edit' || pageMode === 'create') ||
                templateButtons.length === maxTemplateButtons
              }
            >
              <Plus className="mr-2 h-4 w-4" /> Add a Button{' '}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuItem disabled>Quick reply buttons</DropdownMenuItem>
            {quickReplyButtons.map((button, i) => (
              <DropdownMenuItem
                key={i}
                onSelect={() =>
                  handleAddButton(
                    templateFirstButtonType!,
                    button.value as string,
                  )
                }
              >
                {button.name}
              </DropdownMenuItem>
            ))}
            <Separator />
            <DropdownMenuItem disabled>Call-to-action buttons</DropdownMenuItem>
            {callToActionButtons.map((button, i) => (
              <DropdownMenuItem
                key={i}
                onSelect={() =>
                  handleAddButton(
                    templateFirstButtonType!,
                    button.value as string,
                  )
                }
                disabled={
                  getButtonTypeCount(button.value as string) >=
                  (button.maximum as number)
                }
              >
                <div>
                  <div>{button.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {button.maximum}{' '}
                    {(button.maximum as number) > 1 ? 'buttons' : 'button'}{' '}
                    maximum
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {templateButtons.length === maxTemplateButtons && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="inline-block ml-2 h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Button Limit Reached</p>
                <p>To add a different button, delete a button first.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="mt-4 mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Info className="h-4 w-4" />
        <p>If you add more than three buttons, they will appear in a list.</p>
      </div>
      <div className="space-y-4">
        {templateFirstButtonType === 'QUICK_REPLY' ? (
          <>
            {templateQuickReplyButtons.length > 0 &&
              RenderButtonGroup(
                'QUICK_REPLY',
                templateQuickReplyButtons,
                templateCallToActionButtons.length > 0,
              )}
            {templateCallToActionButtons.length > 0 &&
              RenderButtonGroup(
                'CALL_TO_ACTION',
                templateCallToActionButtons,
                templateQuickReplyButtons.length > 0,
              )}
          </>
        ) : (
          <>
            {templateCallToActionButtons.length > 0 &&
              RenderButtonGroup(
                'CALL_TO_ACTION',
                templateCallToActionButtons,
                templateQuickReplyButtons.length > 0,
              )}
            {templateQuickReplyButtons.length > 0 &&
              RenderButtonGroup(
                'QUICK_REPLY',
                templateQuickReplyButtons,
                templateCallToActionButtons.length > 0,
              )}
          </>
        )}
      </div>
      {errors.map(
        (error) =>
          error.type === 'BUTTONS' &&
          error.isValid === false && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>
                {!error.extras.isMappingsValid && 'Missing Value'}
                {(!error.extras.isMappingsValid ||
                  !error.extras.isSubstitutionsValid) &&
                  ' ; '}
                {!error.extras.isSubstitutionsValid && 'Missing Sample Value'}
                {!error.extras.isTextValid && 'Button text cannot be empty.'}
              </AlertDescription>
            </Alert>
          ),
      )}
    </>
  )
}
