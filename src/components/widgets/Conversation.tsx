'use client'

import React from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { AvatarGroup } from '@/components/ui/avatar-group'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Send } from 'lucide-react'

interface Agent {
  name: string
  redirectNumber: string
}

interface WidgetConfig {
  greeting: string
  redirectNumber: string
}

interface ConversationProps {
  widgetConfig: WidgetConfig
  agentsEnabled: boolean
  enabledAgents: Agent[]
  setViewAgents: (value: boolean) => void
  message: string
  setMessage: (value: string) => void
  handleSendMessage: (redirectNumber: string, forward: boolean) => void
}

function stringToLightColor(string: string): string {
  let hash = 0
  for (let i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash)
  }
  let color = '#'
  for (let i = 0; i < 3; i += 1) {
    const value = (((hash >> (i * 8)) & 0xffffff) % 150) + 100 // Restricting to lighter colors
    color += `00${value.toString(16)}`.slice(-2)
  }
  return color
}

function isDark(color: string): boolean {
  const hex = color.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness < 128
}

function stringAvatar(name: string) {
  if (typeof name !== 'string' || name.trim() === '') {
    return {
      style: {
        backgroundColor: '#CCCCCC',
        color: '#000000',
        fontFamily: 'DM Sans',
        border: 'none',
        fontSize: '14px',
        letterSpacing: '1px',
      },
      children: '',
    }
  }
  const names = name.trim().split(' ')
  const initials =
    names.length > 1
      ? `${names[0][0].toUpperCase()}${names[1][0].toUpperCase()}`
      : names[0][0].toUpperCase()

  const backgroundColor = stringToLightColor(name)
  const color = isDark(backgroundColor) ? '#FFFFFF' : '#000000'

  return {
    style: {
      backgroundColor,
      color,
      fontFamily: 'DM Sans',
      border: 'none',
      fontSize: '14px',
      letterSpacing: '1px',
    },
    children: initials,
  }
}

export default function Conversation({
  widgetConfig,
  agentsEnabled,
  enabledAgents,
  setViewAgents,
  message,
  setMessage,
  handleSendMessage,
}: ConversationProps) {
  return (
    <>
      {widgetConfig?.greeting && (
        <div className="absolute inset-0 overflow-y-auto scrollbar-hide mt-5">
          <div className="flex flex-col flex-grow pt-10 pb-25 pl-4 scrollbar-hide">
            <div className="bg-white rounded-[0px_16px_16px_16px] p-2 max-w-[60%] mt-3 shadow-md">
              <p className="text-[14px] whitespace-pre-wrap">
                {widgetConfig.greeting}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-2 flex flex-col">
        {agentsEnabled && enabledAgents.length > 0 && (
          <div className="flex flex-row justify-center items-center">
            <div className="w-full flex flex-row justify-start items-center min-h-[70px] bg-white -mt-4 border border-[#D0FFF6] rounded-[10px] px-2 gap-2">
              <AvatarGroup
                items={enabledAgents.map((agent) => {
                  const avatarProps = stringAvatar(agent.name || 'Agent')
                  return {
                    children: (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Avatar
                              className="w-10 h-10 cursor-pointer"
                              style={avatarProps.style}
                              onClick={() =>
                                handleSendMessage(agent?.redirectNumber, false)
                              }
                            >
                              <AvatarFallback style={avatarProps.style}>
                                {avatarProps.children}
                              </AvatarFallback>
                            </Avatar>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{agent.name || 'Agent'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ),
                  }
                })}
                limit={3}
              />
              <span className="text-[16px] font-bold text-[#008169]">
                Chat with an Agent
              </span>
              <Button
                variant="default"
                size="sm"
                className="ml-auto min-w-[100px] bg-[#008169] text-white hover:bg-[#008169] hover:text-white"
                onClick={() => setViewAgents(true)}
              >
                Start
              </Button>
            </div>
          </div>
        )}
        <div className="pt-2 pb-2 flex flex-row">
          <Input
            className="rounded-[30px] pl-2 bg-white"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button
            size="icon"
            className="bg-[#25D467] w-[40px] h-[40px] ml-2 hover:bg-[#25D467]/90"
            onClick={() =>
              handleSendMessage(widgetConfig?.redirectNumber, true)
            }
          >
            <Send className="h-5 w-5 text-white" />
          </Button>
        </div>
      </div>
    </>
  )
}
