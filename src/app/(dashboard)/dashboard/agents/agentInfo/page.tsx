'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  BarChart2,
  Users,
  FileText,
  MessageSquare,
  Settings,
  CreditCard,
} from 'lucide-react'

type Permission = {
  read: boolean
  write: boolean
}

type ChannelAccess = {
  templates: Permission
  numbers: { [numberId: string]: Permission }
}

type AccessScope = {
  instanceId: string
  instanceName: string
  scopes: {
    dashboard: Permission
    contacts: Permission
    segments: Permission
    campaigns: Permission
    settings: Array<{ settingType: string } & Permission>
    channels: {
      sms: ChannelAccess
      whatsapp: ChannelAccess
    }
  }
}

type Agent = {
  id?: string
  username: string
  firstName: string
  lastName: string
  email: string
  accessScopes: AccessScope[]
}

const APP_INSTANCES = [
  { id: 'instance1', name: 'Main App' },
  { id: 'instance2', name: 'Test Environment' },
  { id: 'instance3', name: 'Development Instance' },
  { id: 'instance4', name: 'Staging Environment' },
]

const CONNECTED_NUMBERS = [
  { id: 'num1', number: '+1234567890', channel: 'sms' },
  { id: 'num2', number: '+9876543210', channel: 'whatsapp' },
  { id: 'num3', number: '+1122334455', channel: 'sms' },
  { id: 'num4', number: '+5566778899', channel: 'whatsapp' },
]

const defaultAccessScope = (instance: {
  id: string
  name: string
}): AccessScope => ({
  instanceId: instance.id,
  instanceName: instance.name,
  scopes: {
    dashboard: { read: false, write: false },
    contacts: { read: false, write: false },
    segments: { read: false, write: false },
    campaigns: { read: false, write: false },
    settings: [
      { settingType: 'Billing', read: false, write: false },
      { settingType: 'Users', read: false, write: false },
    ],
    channels: {
      sms: {
        templates: { read: false, write: false },
        numbers: CONNECTED_NUMBERS.filter(
          (num) => num.channel === 'sms',
        ).reduce(
          (acc, num) => {
            acc[num.id] = { read: false, write: false }
            return acc
          },
          {} as { [numberId: string]: Permission },
        ),
      },
      whatsapp: {
        templates: { read: false, write: false },
        numbers: CONNECTED_NUMBERS.filter(
          (num) => num.channel === 'whatsapp',
        ).reduce(
          (acc, num) => {
            acc[num.id] = { read: false, write: false }
            return acc
          },
          {} as { [numberId: string]: Permission },
        ),
      },
    },
  },
})

export default function AgentInfoPage() {
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<'create' | 'edit'>('create')
  const [agent, setAgent] = useState<Agent>({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    accessScopes: APP_INSTANCES.map(defaultAccessScope),
  })

  useEffect(() => {
    const modeParam = searchParams.get('mode')
    const agentId = searchParams.get('agentId')

    if (modeParam === 'edit' && agentId) {
      setMode('edit')
      fetchAgent(agentId)
    }
  }, [searchParams])

  const fetchAgent = async (id: string) => {
    // Simulating API call
    const response = await new Promise<Agent>((resolve) => {
      setTimeout(() => {
        resolve({
          id,
          username: 'johndoe',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          accessScopes: APP_INSTANCES.map(defaultAccessScope),
        })
      }, 500)
    })
    setAgent(response)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setAgent((prev) => ({ ...prev, [name]: value }))
  }

  const handlePermissionChange = (
    instanceId: string,
    category: string,
    subCategory: string | null,
    type: 'read' | 'write',
    checked: boolean,
  ) => {
    setAgent((prev) => ({
      ...prev,
      accessScopes: prev.accessScopes.map((scope) => {
        if (scope.instanceId !== instanceId) return scope

        const updatedScope = JSON.parse(JSON.stringify(scope))
        let target = updatedScope.scopes

        if (category === 'settings') {
          target = target[category].find(
            (s: any) => s.settingType === subCategory,
          )
        } else if (category === 'channels') {
          const [channelType, subType] = subCategory!.split('.')
          target = target[category][channelType]
          if (subType === 'templates') {
            target = target.templates
          } else {
            target = target.numbers[subType]
          }
        } else {
          target = target[category]
        }

        if (target) {
          target[type] = checked
        }

        return updatedScope
      }),
    }))
  }

  const renderPermissionItem = (
    instanceId: string,
    category: string,
    permission: Permission,
    label: string,
    icon: React.ReactNode,
    readLabel: string,
    writeLabel?: string,
    subCategory?: string,
  ) => (
    <div className="py-4 border-b border-gray-200 last:border-b-0">
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="space-y-2 ml-8">
        <div className="flex items-center justify-between">
          <Label
            htmlFor={`${instanceId}-${category}-${subCategory || ''}-read`}
            className="text-sm text-muted-foreground"
          >
            {readLabel}
          </Label>
          <Switch
            id={`${instanceId}-${category}-${subCategory || ''}-read`}
            checked={permission.read}
            onCheckedChange={(checked) =>
              handlePermissionChange(
                instanceId,
                category,
                subCategory || null,
                'read',
                checked,
              )
            }
            className="data-[state=checked]:bg-primary"
          />
        </div>
        {writeLabel && (
          <div className="flex items-center justify-between">
            <Label
              htmlFor={`${instanceId}-${category}-${subCategory || ''}-write`}
              className="text-sm text-muted-foreground"
            >
              {writeLabel}
            </Label>
            <Switch
              id={`${instanceId}-${category}-${subCategory || ''}-write`}
              checked={permission.write}
              onCheckedChange={(checked) =>
                handlePermissionChange(
                  instanceId,
                  category,
                  subCategory || null,
                  'write',
                  checked,
                )
              }
              className="data-[state=checked]:bg-primary"
            />
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold mb-2 sm:mb-0">
          {mode === 'create' ? 'Create New Agent' : 'Edit Agent'}
        </h1>
        <Badge
          variant="default"
          className="text-sm py-1 px-3 self-start sm:self-auto"
        >
          {mode === 'create' ? 'New Agent' : 'Editing'}
        </Badge>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="w-full mb-6 flex flex-wrap">
          <TabsTrigger value="info" className="flex-1">
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex-1">
            Permissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={agent.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={agent.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    value={agent.username}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={agent.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions">
          <Tabs defaultValue={agent.accessScopes[0].instanceId}>
            <ScrollArea className="w-full rounded-md border">
              <TabsList className="w-full p-1 h-auto flex flex-wrap">
                {agent.accessScopes.map((scope) => (
                  <TabsTrigger
                    key={scope.instanceId}
                    value={scope.instanceId}
                    className="flex-grow basis-[calc(50%-0.5rem)] sm:basis-[calc(33.333%-0.5rem)] md:basis-[calc(25%-0.75rem)] lg:basis-[calc(20%-0.8rem)] m-1"
                  >
                    {scope.instanceName}
                  </TabsTrigger>
                ))}
              </TabsList>
            </ScrollArea>
            {agent.accessScopes.map((scope) => (
              <TabsContent key={scope.instanceId} value={scope.instanceId}>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      {renderPermissionItem(
                        scope.instanceId,
                        'dashboard',
                        scope.scopes.dashboard,
                        'Dashboard',
                        <BarChart2 className="w-5 h-5" />,
                        'View Dashboard',
                      )}
                      {renderPermissionItem(
                        scope.instanceId,
                        'contacts',
                        scope.scopes.contacts,
                        'Contacts',
                        <Users className="w-5 h-5" />,
                        'View Contacts',
                        'Create Contacts',
                      )}
                      {renderPermissionItem(
                        scope.instanceId,
                        'segments',
                        scope.scopes.segments,
                        'Segments',
                        <FileText className="w-5 h-5" />,
                        'View Segments',
                        'Create Segments',
                      )}
                      {renderPermissionItem(
                        scope.instanceId,
                        'campaigns',
                        scope.scopes.campaigns,
                        'Campaigns',
                        <MessageSquare className="w-5 h-5" />,
                        'View Campaigns',
                        'Create Campaigns',
                      )}

                      <div className="py-4">
                        <div className="flex items-center gap-3 mb-4">
                          <Settings className="w-5 h-5" />
                          <span className="text-sm font-medium">Settings</span>
                        </div>
                        <div className="space-y-2 ml-8">
                          {scope.scopes.settings.map((setting, idx) => (
                            <div key={idx}>
                              {renderPermissionItem(
                                scope.instanceId,
                                'settings',
                                setting,
                                setting.settingType,
                                setting.settingType === 'Billing' ? (
                                  <CreditCard className="w-5 h-5" />
                                ) : (
                                  <Users className="w-5 h-5" />
                                ),
                                setting.settingType === 'Billing'
                                  ? 'View Logs'
                                  : 'View Users',
                                setting.settingType === 'Billing'
                                  ? 'Pay Bills'
                                  : 'Manage Users',
                                setting.settingType,
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="py-4">
                        <div className="flex items-center gap-3 mb-4">
                          <MessageSquare className="w-5 h-5" />
                          <span className="text-sm font-medium">Channels</span>
                        </div>
                        {Object.entries(scope.scopes.channels).map(
                          ([channelType, channel]) => (
                            <div key={channelType} className="ml-8 space-y-2">
                              <h4 className="text-sm font-medium mb-2 capitalize">
                                {channelType}
                              </h4>
                              {renderPermissionItem(
                                scope.instanceId,
                                'channels',
                                channel.templates,
                                'Templates',
                                <FileText className="w-5 h-5" />,
                                'View Templates',
                                'Create Templates',
                                `${channelType}.templates`,
                              )}
                              <h5 className="text-sm font-medium mt-4 mb-2">
                                Numbers
                              </h5>
                              <div className="space-y-2">
                                {Object.entries(channel.numbers).map(
                                  ([numberId, permission]) => (
                                    <div key={numberId}>
                                      {renderPermissionItem(
                                        scope.instanceId,
                                        'channels',
                                        permission,
                                        CONNECTED_NUMBERS.find(
                                          (n) => n.id === numberId,
                                        )?.number || '',
                                        <MessageSquare className="w-5 h-5" />,
                                        'Read Messages',
                                        'Send Messages',
                                        `${channelType}.${numberId}`,
                                      )}
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end mt-6">
        <Button type="submit" size="lg">
          {mode === 'create' ? 'Create Agent' : 'Update Agent'}
        </Button>
      </div>
    </div>
  )
}
