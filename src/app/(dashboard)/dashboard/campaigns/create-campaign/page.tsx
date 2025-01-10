'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChannelSelection } from '@/components/campaigns/ChannelSelection'
import { AudienceSelection } from '@/components/campaigns/AudienceSelection'
import { ContentSelection } from '@/components/campaigns/ContentSelection'
import { ScheduleSelection } from '@/components/campaigns/ScheduleSelection'
import { CampaignOverview } from '@/components/campaigns/CampaignOverview'
import { Card } from '@/components/ui/card'
import { Check, ArrowLeft, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from 'recharts'
import axiosInstance from '@/lib/axios'
import { useRouter } from 'next/navigation'

interface Channel {
  label: string
  value: string
}

interface Audience {
  id: number
  name: string
  count: number
  createdAt: string
  type: 'segment' | 'all'
}

interface Template {
  id: number
  name: string
  content: string
}

interface CampaignData {
  channel: string
  audiences: Audience[]
  content: string
  campaignName: string
  contentType: 'template' | 'freeform'
  selectedTemplate: number | undefined
  schedule: string | null
  scheduleType: 'now' | 'later' | null
}

interface TabProps {
  data: CampaignData
  updateData: (key: string, value: any) => void
}

interface ChannelSelectionProps extends TabProps {
  channels: Channel[]
}

interface ContentSelectionProps extends TabProps {
  getTemplateContent: (templateId: number | undefined) => string
}

type TabComponent = React.ComponentType<
  TabProps | ChannelSelectionProps | ContentSelectionProps
>

interface Tab {
  id: string
  title: string
  component: TabComponent
  props: () => Partial<ChannelSelectionProps | ContentSelectionProps>
  isCompleted: () => boolean
}

const getAvailableChannels = (): Channel[] => {
  return [
    { label: 'SMS', value: 'sms' },
    { label: 'WhatsApp', value: 'whatsapp' },
  ]
}

const templates: Template[] = [
  {
    id: 1,
    name: 'teenbaan_sale',
    content:
      "🌟 Weekend Special🌟 We've got something exciting just for you!🎉✨ Flash Sale - Enjoy a 60% Discount and free shipping this weekend 🛍️ Buy any 2 and get a 10% additional discount ⚡️ Hurry, the offer ends soon! Don't miss out! Tap the link to claim your offer now.",
  },
  {
    id: 2,
    name: 'diwali_26_oct',
    content:
      "📱 *Diwali Festive Sale!* 🤝✨ Get up to *65% OFF* 🎊 Enjoy up to *Rs.250 cashback* 🛍️ Buy 2 items and grab an extra *5% OFF!* 📦 Fast delivery in just 4 days, plus *FREE shipping!* 💰 Cash on delivery available. 🤳🏻 Don't miss out on the biggest savings this festive season! 👞 🛍️Choose from sandals, shoes, slippers, sneakers, flip-flops, heels...",
  },
  {
    id: 3,
    name: 'summer_clearance',
    content:
      "☀️ SUMMER CLEARANCE SALE ☀️ Up to 70% OFF on all summer essentials! 👕👗👒 Refresh your wardrobe now before stocks run out. Shop online or in-store. Use code SUMMER70 at checkout. Offer valid until [DATE]. Don't miss out! 🏖️🛍️",
  },
]

export default function CreateCampaignPage() {
  const router = useRouter()
  const availableChannels = useMemo(() => getAvailableChannels(), [])

  const [campaignData, setCampaignData] = useState<CampaignData>(() => ({
    channel: '',
    audiences: [],
    content: '',
    campaignName: '',
    contentType: 'template',
    selectedTemplate: undefined,
    schedule: null,
    scheduleType: null,
  }))

  const [activeTab, setActiveTab] = useState('channel')

  const updateCampaignData = useCallback((key: string, value: any) => {
    setCampaignData((prev) => ({ ...prev, [key]: value }))
  }, [])

  const getTemplateContent = useCallback((templateId: number | undefined) => {
    if (templateId === undefined) return ''
    return templates.find((t) => t.id === templateId)?.content || ''
  }, [])

  const handleSendCampaign = async () => {
    const audience = campaignData.audiences[0]
    const campaignContent =
      campaignData.contentType === 'template'
        ? getTemplateContent(campaignData.selectedTemplate)
        : campaignData.content
    const data = {
      channel: campaignData.channel,
      segmentId: audience?.id,
      segmentName: audience?.name,
      totalContacts: audience?.count,
      campaignName: campaignData.campaignName,
      campaignText: campaignContent,
      campaignTimestamp: campaignData.schedule,
      scheduleType: campaignData.scheduleType,
      schedule: campaignData.schedule,
    }
    axiosInstance
      .post(`/common/campaigns/send-campaign-sms`, { data })
      .then(function (response) {
        if (response.status === 200) {
          setIsModalOpen(false)
          router.push(`/dashboard/campaigns`)
        }
      })
  }

  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const tabs = useMemo(
    () => [
      {
        id: 'channel',
        title: 'Channel',
        component: ChannelSelection as TabComponent,
        props: () => ({ channels: availableChannels }),
        isCompleted: () => !!campaignData.channel,
      },
      {
        id: 'audience',
        title: 'Audience',
        component: AudienceSelection as TabComponent,
        props: () => ({}),
        isCompleted: () => campaignData.audiences.length > 0,
      },
      {
        id: 'content',
        title: 'Content',
        component: ContentSelection as TabComponent,
        props: () => ({ getTemplateContent }),
        isCompleted: () =>
          !!campaignData.content && !!campaignData.campaignName,
      },
      {
        id: 'schedule',
        title: 'Schedule',
        component: ScheduleSelection as TabComponent,
        props: () => ({}),
        isCompleted: () => campaignData.scheduleType !== null,
      },
      {
        id: 'overview',
        title: 'Overview',
        component: CampaignOverview as TabComponent,
        props: () => ({}),
        isCompleted: () => true,
      },
    ],
    [availableChannels, campaignData, getTemplateContent],
  )

  const handleSubmit = () => {
    setIsModalOpen(true)
  }

  const currentTabIndex = tabs.findIndex((tab) => tab.id === activeTab)
  const isFirstTab = currentTabIndex === 0
  const isLastTab = currentTabIndex === tabs.length - 1

  const handleNext = () => {
    if (!isLastTab) {
      setActiveTab(tabs[currentTabIndex + 1].id)
    } else if (isLastTab) {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (!isFirstTab) {
      setActiveTab(tabs[currentTabIndex - 1].id)
    }
  }

  const isAllCompleted = tabs.slice(0, -1).every((tab) => tab.isCompleted())

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-screen-lg mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold mb-2">Create Campaign</h1>
          <p className="text-sm text-muted-foreground">
            Complete all tabs to create your campaign
          </p>
        </div>

        <Card className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList
              className="grid w-full"
              style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}
            >
              {tabs.map((tab, index) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="relative data-[state=active]:bg-background"
                >
                  <span className="flex items-center">
                    <span className="mr-2 text-sm font-medium">
                      {index + 1}.
                    </span>
                    <span>{tab.title}</span>
                  </span>
                  {tab.isCompleted() && index !== tabs.length - 1 && (
                    <div
                      className={cn(
                        'absolute right-2 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full',
                        activeTab === tab.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
            {tabs.map((tab, index) => (
              <TabsContent
                key={tab.id}
                value={tab.id}
                className="mt-6 focus-visible:outline-none focus-visible:ring-0"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">
                      <span className="mr-2">{index + 1}.</span>
                      {tab.title}
                    </h2>
                    {tab.isCompleted() && index !== tabs.length - 1 && (
                      <span className="text-sm text-muted-foreground">
                        ✓ Completed
                      </span>
                    )}
                  </div>
                  <tab.component
                    data={campaignData}
                    updateData={updateCampaignData}
                    {...tab.props()}
                  />
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </Card>

        <div className="mt-6 flex justify-between">
          <Button onClick={handleBack} disabled={isFirstTab} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          {isLastTab ? (
            <Button onClick={handleSubmit} disabled={!isAllCompleted} size="lg">
              Send Campaign
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!tabs[currentTabIndex].isCompleted()}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="bg-white rounded-lg shadow-lg w-full max-w-md">
              <DialogHeader>
                <DialogTitle>Do you want to send out the campaign?</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-center col-span-4">
                    Please confirm your action.
                  </Label>
                </div>
              </div>
              <DialogFooter className="flex justify-end gap-2">
                <Button
                  onClick={handleSendCampaign}
                  className="bg-green-500 text-white"
                >
                  Yes
                </Button>
                <Button
                  onClick={handleCloseModal}
                  className="bg-red-500 text-white"
                >
                  No
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
