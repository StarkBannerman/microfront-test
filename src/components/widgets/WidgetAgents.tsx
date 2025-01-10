import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { CountryCodeSelect } from '@/components/common/CountryCodeSelector'
import { isValidPhoneNumber, parsePhoneNumber } from '@/lib/templateUtils'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Plus, Trash2 } from 'lucide-react'

interface Agent {
  name: string
  redirectNumber: string
  enabled: boolean
  countryCode: string
  number: string
}

interface WidgetConfig {
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

interface WidgetInfo {
  widgetId: string | null
  enabled: boolean
  widgetConfig: WidgetConfig
  agentsEnabled: boolean
  agents: Agent[]
}

interface WidgetAgentsProps {
  widgetInfo: WidgetInfo
  setWidgetInfo: React.Dispatch<React.SetStateAction<WidgetInfo>>
}

export default function WidgetAgents({
  widgetInfo,
  setWidgetInfo,
}: WidgetAgentsProps) {
  const [openSnackBar, setOpenSnackBar] = useState(false)
  const [message, setMessage] = useState('')
  const [severity, setSeverity] = useState<'success' | 'error'>('success')

  const handleAgentChange = (
    index: number,
    field: keyof Agent,
    value: string | boolean,
  ) => {
    setWidgetInfo((prev) => {
      const updatedAgents = [...prev.agents]
      updatedAgents[index] = { ...updatedAgents[index], [field]: value }

      if (field === 'countryCode' || field === 'number') {
        const { countryCode, number } = updatedAgents[index]
        updatedAgents[index].redirectNumber = `${countryCode}${number}`
      }

      return { ...prev, agents: updatedAgents }
    })
  }

  const addAgent = () => {
    if (widgetInfo.agents.length < 10) {
      setWidgetInfo((prev) => ({
        ...prev,
        agents: [
          ...prev.agents,
          {
            name: '',
            redirectNumber: '',
            enabled: true,
            countryCode: '',
            number: '',
          },
        ],
      }))
    } else {
      setMessage('Maximum 10 agents allowed')
      setSeverity('error')
      setOpenSnackBar(true)
    }
  }

  const removeAgent = (index: number) => {
    setWidgetInfo((prev) => ({
      ...prev,
      agents: prev.agents.filter((_, i) => i !== index),
    }))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Agents</h2>
        <div className="flex items-center space-x-2">
          {widgetInfo.agentsEnabled && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={addAgent}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add an Agent</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <Switch
            checked={widgetInfo.agentsEnabled}
            onCheckedChange={(checked) =>
              setWidgetInfo((prev) => ({
                ...prev,
                agentsEnabled: checked,
              }))
            }
            className="bg-muted border-2 border-input data-[state=checked]:bg-foreground data-[state=checked]:border-foreground"
          />
        </div>
      </div>
      {widgetInfo.agentsEnabled && widgetInfo.agents.length > 0 && (
        <Accordion type="multiple" className="w-full">
          {widgetInfo.agents.map((agent: Agent, index: number) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger>
                {agent.name || `Agent ${index + 1}`}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`agent-${index}-name`}>Name</Label>
                    <Input
                      id={`agent-${index}-name`}
                      value={agent.name}
                      onChange={(e) =>
                        handleAgentChange(index, 'name', e.target.value)
                      }
                      placeholder="Agent Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`agent-${index}-number`}>
                      Redirect Number
                    </Label>
                    <div className="flex gap-2">
                      <CountryCodeSelect
                        value={agent.countryCode}
                        onChange={(value) =>
                          handleAgentChange(index, 'countryCode', value)
                        }
                        onBlur={() => {}}
                        name={`agent-${index}-country-code`}
                        className="w-[140px]"
                      />
                      <Input
                        id={`agent-${index}-number`}
                        value={agent.number}
                        onChange={(e) =>
                          handleAgentChange(
                            index,
                            'number',
                            e.target.value.replace(/\D/g, ''),
                          )
                        }
                        placeholder="Phone Number"
                        className={
                          !isValidPhoneNumber(agent.redirectNumber)
                            ? 'border-red-500'
                            : ''
                        }
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`agent-${index}-enabled`}
                        checked={agent.enabled}
                        onCheckedChange={(checked) =>
                          handleAgentChange(index, 'enabled', checked)
                        }
                        className="bg-muted border-2 border-input data-[state=checked]:bg-foreground data-[state=checked]:border-foreground"
                      />
                      <Label htmlFor={`agent-${index}-enabled`}>
                        {agent.enabled ? 'Agent Enabled' : 'Agent Disabled'}
                      </Label>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeAgent(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete Agent</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  )
}
