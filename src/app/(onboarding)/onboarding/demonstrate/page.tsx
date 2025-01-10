'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Send, Smartphone } from 'lucide-react'

interface Message {
  id: number
  text: string
  sent: boolean
  time: string
}

// Reusable hook for scrolling to the bottom
const useScrollToBottom = (
  messages: Message[],
  ref: React.RefObject<HTMLDivElement | null>,
) => {
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, ref])
}

export default function AppDemonstration() {
  const [phoneMessages, setPhoneMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Hi, I need to reschedule my massage.',
      sent: true,
      time: '10:30 AM',
    },
    {
      id: 2,
      text: 'Of course, when would you like to reschedule?',
      sent: false,
      time: '10:32 AM',
    },
  ])
  const [phoneInputText, setPhoneInputText] = useState('')

  const [inboxMessages, setInboxMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Hi, I need to reschedule my massage.',
      sent: false,
      time: '10:30 AM',
    },
    {
      id: 2,
      text: 'Of course, when would you like to reschedule?',
      sent: true,
      time: '10:32 AM',
    },
  ])
  const [inboxInputText, setInboxInputText] = useState('')

  const phoneMessagesEndRef = useRef<HTMLDivElement | null>(null)
  const inboxMessagesEndRef = useRef<HTMLDivElement | null>(null)

  useScrollToBottom(phoneMessages, phoneMessagesEndRef)
  useScrollToBottom(inboxMessages, inboxMessagesEndRef)

  const handlePhoneSend = () => {
    if (phoneInputText.trim()) {
      const newMessage = {
        id: Date.now(), // Use a unique ID
        text: phoneInputText,
        sent: true,
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      }
      setPhoneMessages([...phoneMessages, newMessage])
      setPhoneInputText('')

      setTimeout(() => {
        setInboxMessages((prev) => [
          ...prev,
          {
            id: Date.now(), // Use a unique ID
            text: phoneInputText,
            sent: false,
            time: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
        ])
      }, 500)
    }
  }

  const handleInboxSend = () => {
    if (inboxInputText.trim()) {
      const newMessage = {
        id: Date.now(), // Use a unique ID
        text: inboxInputText,
        sent: true,
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      }
      setInboxMessages([...inboxMessages, newMessage])
      setInboxInputText('')

      setTimeout(() => {
        setPhoneMessages((prev) => [
          ...prev,
          {
            id: Date.now(), // Use a unique ID
            text: inboxInputText,
            sent: false,
            time: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
        ])
      }, 500)
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h2 className="text-2xl font-bold text-center mb-4">App Demo</h2>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Phone Interface */}
        <Card className="w-full max-w-[250px] mx-auto sm:max-w-full">
          <CardContent className="p-2">
            <div className="border-2 border-gray-800 rounded-lg overflow-hidden">
              <div className="bg-gray-800 text-white p-1 flex items-center justify-between text-xs">
                <Smartphone className="w-3 h-3" />
                <span>Client's Phone</span>
              </div>
              <div className="bg-gray-100 h-[300px] flex flex-col">
                <ScrollArea className="flex-grow p-2">
                  {phoneMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sent ? 'justify-end' : 'justify-start'} mb-2`}
                    >
                      <div
                        className={`max-w-[80%] rounded-md p-2 text-xs ${
                          msg.sent ? 'bg-blue-500 text-white' : 'bg-white'
                        }`}
                      >
                        <p>{msg.text}</p>
                        <span className="text-[10px] opacity-70 mt-1 block">
                          {msg.time}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div ref={phoneMessagesEndRef} />
                </ScrollArea>
                <div className="p-1 bg-white border-t">
                  <div className="flex gap-1">
                    <Input
                      value={phoneInputText}
                      onChange={(e) => setPhoneInputText(e.target.value)}
                      placeholder="Type..."
                      onKeyPress={(e) => e.key === 'Enter' && handlePhoneSend()}
                      className="text-xs h-8"
                    />
                    <Button
                      size="sm"
                      onClick={handlePhoneSend}
                      className="h-8 w-8 p-0"
                    >
                      <Send className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mercuri Inbox */}
        <Card className="w-full">
          <CardContent className="p-2">
            <div className="flex flex-col h-[350px]">
              <div className="border-b p-2 flex flex-col bg-background">
                <h3 className="font-semibold text-sm mb-1">Mercuri Inbox</h3>
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage
                      src={`/placeholder.svg?height=24&width=24`}
                      alt="Alice Johnson"
                    />
                    <AvatarFallback>AJ</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs font-medium">Alice Johnson</p>
                    <p className="text-[10px] text-muted-foreground">
                      VIP Client
                    </p>
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-grow p-2">
                {inboxMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sent ? 'justify-end' : 'justify-start'} mb-2`}
                  >
                    <div
                      className={`max-w-[80%] ${message.sent ? 'bg-primary text-primary-foreground' : 'bg-accent'} rounded-md p-2 text-xs`}
                    >
                      <p>{message.text}</p>
                      <span className="text-[10px] opacity-70 mt-1 block">
                        {message.time}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={inboxMessagesEndRef} />
              </ScrollArea>

              <div className="p-2 border-t bg-background">
                <div className="flex gap-1">
                  <Input
                    value={inboxInputText}
                    onChange={(e) => setInboxInputText(e.target.value)}
                    placeholder="Type a message..."
                    onKeyPress={(e) => e.key === 'Enter' && handleInboxSend()}
                    className="text-xs h-8"
                  />
                  <Button
                    size="sm"
                    onClick={handleInboxSend}
                    className="h-8 w-8 p-0"
                  >
                    <Send className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
