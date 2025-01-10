'use client'

import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { X } from 'lucide-react'
import { CountryCodeSelect } from '../common/CountryCodeSelector'
//import CountryCodeSelector from "./CountryCodeSelector"
import WidgetAgents from './WidgetAgents'

interface WidgetFormsProps {
  widgetInfo: any
  setWidgetInfo: (value: any) => void
  //   setOpenSnackBar: (value: boolean) => void
  //   setMessage: (value: string) => void
  //   setSeverity: (value: string) => void
}

export default function WidgetForms({
  widgetInfo,
  setWidgetInfo,
  //   setOpenSnackBar,
  //   setMessage,
  //   setSeverity,
}: WidgetFormsProps) {
  const [logo, setLogo] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const fields = [
    { name: 'heading', label: 'Heading' },
    { name: 'greeting', label: 'Greeting' },
    { name: 'messageStarterText', label: 'Message Starter Text' },
    { name: 'redirectNumber', label: 'Redirect Number' },
  ]

  const handleConfigChange = (name: string, value: string) => {
    setWidgetInfo((prev: any) => ({
      ...prev,
      widgetConfig: {
        ...prev.widgetConfig,
        [name]: value,
      },
    }))
  }

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      setLogo(file)
      setLogoPreview(URL.createObjectURL(file))
      handleConfigChange('logo', URL.createObjectURL(file))
    }
  }

  const handleLogoRemove = () => {
    setLogo(null)
    setLogoPreview(null)
    handleConfigChange('logo', 'default')
  }

  return (
    <div className="space-y-6 p-4">
      {fields.map((field) => (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name}>{field.label}</Label>
          {field.name === 'redirectNumber' ? (
            <div className="flex space-x-2">
              <CountryCodeSelect
                value={widgetInfo.widgetConfig.countryCode}
                onChange={(value) => handleConfigChange('countryCode', value)}
                onBlur={() => {}}
                name="widget-country-code"
                className="w-[140px]"
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
              />
            </div>
          ) : field.name === 'greeting' ? (
            <Textarea
              id={field.name}
              value={widgetInfo.widgetConfig[field.name]}
              onChange={(e) => handleConfigChange(field.name, e.target.value)}
              placeholder={field.label}
              rows={6}
            />
          ) : (
            <Input
              id={field.name}
              value={widgetInfo.widgetConfig[field.name]}
              onChange={(e) => handleConfigChange(field.name, e.target.value)}
              placeholder={field.label}
            />
          )}
        </div>
      ))}

      <div className="space-y-2">
        <Label>Upload Your Logo</Label>
        <div className="flex items-center space-x-4 p-4 bg-gray-100 rounded-md">
          {logoPreview ? (
            <div className="flex items-center space-x-2">
              <img
                src={logoPreview}
                alt="Logo Preview"
                className="w-16 h-16 rounded-md object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {logo?.name}
                </p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogoRemove}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Remove logo</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          ) : (
            <div className="w-16 h-16 bg-gray-300 rounded-md" />
          )}
          <Button variant="outline" asChild>
            <label htmlFor="logo-upload" className="cursor-pointer">
              Upload
              <input
                id="logo-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleLogoChange}
              />
            </label>
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Whatsapp Widget Location</Label>
        <RadioGroup
          defaultValue={widgetInfo.widgetConfig.location}
          onValueChange={(value) => handleConfigChange('location', value)}
          className="flex space-x-4"
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

      <WidgetAgents
        widgetInfo={widgetInfo}
        setWidgetInfo={setWidgetInfo}
        // setOpenSnackBar={setOpenSnackBar}
        // setMessage={setMessage}
        // setSeverity={setSeverity}
      />
    </div>
  )
}
