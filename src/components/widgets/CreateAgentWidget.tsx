'use client'

import React, { useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { X, Check, ChevronDown } from 'lucide-react'
import { phone } from 'phone'
import { CountryCodeSelect } from '../common/CountryCodeSelector'
import { isValidPhoneNumber } from '@/lib/templateUtils'

interface CreateAgentWidgetProps {
  setCreateAgent: (value: boolean) => void
  widgetInfo: any
  setWidgetInfo: (value: any) => void
  //   setOpenSnackBar: (value: boolean) => void
  //   setMessage: (value: string) => void
  //   setSeverity: (value: string) => void
}

export default function CreateAgentWidget({
  setCreateAgent,
  widgetInfo,
  setWidgetInfo,
  //   setOpenSnackBar,
  //   setMessage,
  //   setSeverity,
}: CreateAgentWidgetProps) {
  const [name, setName] = useState('')
  const [numberObject, setNumberObject] = useState({
    countryCode: '',
    number: '',
  })
  const [redirectNumber, setRedirectNumber] = useState('')
  const [numberError, setNumberError] = useState(false)
  const [numberErrorMsg, setNumberErrorMsg] = useState('')
  const [enabled, setEnabled] = useState(false)

  const handleCreateAgent = () => {
    try {
      if (redirectNumber.trim() !== '' && name.trim() !== '') {
        if (phone(redirectNumber).isValid) {
          setWidgetInfo((prev: any) => ({
            ...prev,
            agents: [
              ...prev.agents,
              {
                name: name,
                redirectNumber: redirectNumber,
                enabled: enabled,
                ...numberObject,
              },
            ],
          }))
          setCreateAgent(false)
        } else {
          setNumberError(true)
          setNumberErrorMsg('Enter a valid phone number')
        }
      } else {
        // setSeverity('error')
        // setMessage('Enter all details to create agent')
        // setOpenSnackBar(true)
      }
    } catch (error) {
      //   setSeverity('error')
      //   setMessage('Error while creating agent')
      //   setOpenSnackBar(true)
    }
  }

  const handleNumberObjectChange = (field: string, value: string) => {
    setNumberObject((prev) => {
      const newNumberObject = {
        ...prev,
        [field]: value,
      }
      const updatedRedirectNumber = `${newNumberObject.countryCode}${newNumberObject.number}`
      validateRedirectNumber(updatedRedirectNumber)
      setRedirectNumber(updatedRedirectNumber)
      return newNumberObject
    })
  }

  const validateRedirectNumber = (updatedRedirectNumber: string) => {
    setNumberError(false)
    if (
      updatedRedirectNumber.length > 5 &&
      !phone(updatedRedirectNumber).isValid
    ) {
      setNumberError(true)
      setNumberErrorMsg('Number is Invalid')
    } else if (
      updatedRedirectNumber === widgetInfo.widgetConfig?.redirectNumber
    ) {
      setNumberError(true)
      setNumberErrorMsg('Agent cannot have the same main redirect number')
    } else if (
      widgetInfo.agents.findIndex(
        (agent: any) => agent.redirectNumber === updatedRedirectNumber,
      ) !== -1
    ) {
      setNumberError(true)
      setNumberErrorMsg('Agent already exists with this number')
    } else {
      setNumberError(false)
      setNumberErrorMsg('')
    }
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>
          <div className="flex justify-between w-full">
            <span className="font-medium">Enter Details</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="ml-auto"
                    onClick={() => setCreateAgent(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click to exit</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                placeholder="Name"
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="redirectNumber">Redirect Number</Label>
              <div className="flex space-x-2">
                <CountryCodeSelect
                  value={numberObject.countryCode}
                  onChange={(value) =>
                    handleNumberObjectChange('countryCode', value)
                  }
                  onBlur={() => {}}
                  name="countryCode"
                  className="w-[140px]"
                />
                <Input
                  id="redirectNumber"
                  value={numberObject.number}
                  placeholder="Phone Number"
                  onChange={(e) =>
                    handleNumberObjectChange(
                      'number',
                      e.target.value.replace(/\D/g, ''),
                    )
                  }
                  maxLength={20}
                  className={
                    !isValidPhoneNumber(redirectNumber) ? 'border-red-500' : ''
                  }
                />
              </div>
              {numberError && (
                <p className="text-sm text-red-500 mt-1">{numberErrorMsg}</p>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="agent-enabled"
                  checked={enabled}
                  onCheckedChange={setEnabled}
                />
                <Label htmlFor="agent-enabled">
                  {enabled ? 'Agent Enabled' : 'Agent Disabled'}
                </Label>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCreateAgent}
                      disabled={numberError}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Click to create agent</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
