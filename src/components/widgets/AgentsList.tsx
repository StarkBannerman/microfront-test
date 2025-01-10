'use client'

import React from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

interface Agent {
  name: string
  redirectNumber: string
}

function isDark(color: string): boolean {
  const hex = color.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness < 128
}

function stringToLightColor(string: string): string {
  let hash = 0
  for (let i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash)
  }
  let color = '#'
  for (let i = 0; i < 3; i += 1) {
    const value = (((hash >> (i * 8)) & 0xffffff) % 150) + 100 // Restricting the range to lighter colors
    color += `00${value.toString(16)}`.slice(-2)
  }
  return color
}

function stringAvatar(name: string): {
  style: React.CSSProperties
  children: string
} {
  if (typeof name !== 'string' || name.trim() === '') {
    return {
      style: {
        fontFamily: 'DM Sans',
        border: 'none',
        fontSize: '14px',
        letterSpacing: '1px',
        backgroundColor: '#CCCCCC',
        color: '#000000',
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
      fontFamily: 'DM Sans',
      border: 'none',
      fontSize: '14px',
      letterSpacing: '1px',
      backgroundColor,
      color,
    },
    children: initials,
  }
}

function AgentsList({
  enabledAgents,
  handleSendMessage,
}: {
  enabledAgents: Agent[]
  handleSendMessage: (redirectNumber: string, forward: boolean) => void
}) {
  return (
    <div className="relative flex flex-col bg-white flex-grow">
      <div className="absolute inset-0 overflow-y-auto scrollbar-hide">
        <div className="flex flex-col">
          {enabledAgents.map((agent, index) => {
            const avatarProps = stringAvatar(agent.name)
            return (
              <div
                key={index}
                className="flex items-center gap-4 p-4 border-b border-[#E5E5E5]"
              >
                <div className="relative">
                  <Avatar
                    className="w-10 h-10 cursor-pointer transition-transform hover:scale-105"
                    style={avatarProps.style}
                    onClick={() =>
                      handleSendMessage(agent?.redirectNumber, false)
                    }
                  >
                    <AvatarFallback
                      className="text-sm font-medium"
                      style={avatarProps.style}
                    >
                      {avatarProps.children}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#2CC84A] border-2 border-white" />
                </div>
                <span className="text-[16px] text-[#008169] font-medium">
                  {agent.name}
                </span>
                <Button
                  variant="default"
                  size="sm"
                  className="ml-auto min-w-[80px] bg-[#008169] text-white hover:bg-[#008169]/90"
                  onClick={() =>
                    handleSendMessage(agent?.redirectNumber, false)
                  }
                >
                  Chat
                </Button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default AgentsList
