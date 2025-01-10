'use client'

import React, { useState } from 'react'
import Conversation from './Conversation'
import ConversationHeader from './ConversationHeader'
import AgentsHeader from './AgentsHeader'
import AgentsList from './AgentsList'
import { phone } from 'phone'

interface Agent {
  enabled: boolean
  name: string
  redirectNumber: string
}

interface WidgetConfig {
  messageStarterText: string
  logo: string
  heading: string
  greeting: string
  redirectNumber: string
}

interface WidgetInfo {
  agents: Agent[]
  widgetConfig: WidgetConfig
  agentsEnabled: boolean
}
export const whatsappDoodleBackground =
  'https://static.wixstatic.com/media/94f2c6_de1e871473ef4822ae91520e358e781e~mv2.jpeg'

export default function Widget({ widgetInfo }: { widgetInfo: WidgetInfo }) {
  const enabledAgents = widgetInfo.agents.filter((agent) => agent.enabled)
  const [viewAgents, setViewAgents] = useState(false)
  const [message, setMessage] = useState(
    widgetInfo?.widgetConfig?.messageStarterText,
  )

  const handleSendMessage = (redirectNumber = '', forward = true) => {
    try {
      const phoneNumber = phone(redirectNumber)
      if (phoneNumber.isValid) {
        const sanitizedNumber = phoneNumber.phoneNumber.slice(1)
        const url =
          forward && message
            ? `https://api.whatsapp.com/send/?phone=${sanitizedNumber}&text=${encodeURIComponent(message)}&type=phone_number`
            : `https://api.whatsapp.com/send/?phone=${sanitizedNumber}&text&type=phone_number`
        window.open(url)
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="flex flex-col h-[90%] w-[80%] min-h-[530px] min-w-[320px] rounded-[15px] overflow-x-hidden overflow-y-auto scrollbar-hide">
      {viewAgents ? (
        <>
          <AgentsHeader setViewAgents={setViewAgents} />
          <AgentsList
            enabledAgents={enabledAgents}
            handleSendMessage={handleSendMessage}
          />
        </>
      ) : (
        <div className="relative flex flex-col bg-white flex-grow bg-[url('/whatsapp-doodle-background.png')] bg-repeat bg-[length:400px]">
          <ConversationHeader widgetConfig={widgetInfo.widgetConfig} />
          <div
            className="flex-grow overflow-y-auto scrollbar-hide"
            style={{
              backgroundImage: `url(${whatsappDoodleBackground})`,
              backgroundSize: '400px',
              backgroundRepeat: 'repeat',
            }}
          >
            <Conversation
              widgetConfig={widgetInfo.widgetConfig}
              agentsEnabled={widgetInfo.agentsEnabled}
              enabledAgents={enabledAgents}
              setViewAgents={setViewAgents}
              message={message}
              setMessage={setMessage}
              handleSendMessage={handleSendMessage}
            />
          </div>
        </div>
      )}
    </div>
  )
}
