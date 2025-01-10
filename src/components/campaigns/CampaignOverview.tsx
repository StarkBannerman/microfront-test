import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, MessageSquare, Calendar, Phone, Send } from 'lucide-react'

interface CampaignOverviewProps {
  data: {
    channel: string
    campaignName: string
    audiences: Array<{ id: number; name: string; count: number }>
    content: string
    contentType: 'template' | 'freeform'
    selectedTemplate?: number
    schedule: string | null
    scheduleType: 'now' | 'later' | null
  }
}

export function CampaignOverview({ data }: CampaignOverviewProps) {
  const totalAudience = data.audiences.reduce(
    (sum, audience) => sum + audience.count,
    0,
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-sm py-1 px-2">
                  {data.channel === 'sms' ? (
                    <MessageSquare className="w-4 h-4 mr-1" />
                  ) : (
                    <Phone className="w-4 h-4 mr-1" />
                  )}
                  {data.channel.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="text-sm py-1 px-2">
                  <Users className="w-4 h-4 mr-1" />
                  {totalAudience} Recipients
                </Badge>
                <Badge variant="outline" className="text-sm py-1 px-2">
                  <Calendar className="w-4 h-4 mr-1" />
                  {data.scheduleType === 'now' ? 'Immediate' : 'Scheduled'}
                </Badge>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Campaign Name</h3>
                <p>{data.campaignName}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Audience Segments
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  {data.audiences.map((audience) => (
                    <li key={audience.id}>
                      {audience.name} ({audience.count} recipients)
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Schedule</h3>
                <p>
                  {data.scheduleType === 'now'
                    ? 'Send immediately'
                    : `Scheduled for: ${data.schedule}`}
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute top-0 right-0 bottom-0 left-0 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg"></div>
              <div className="relative p-4">
                <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm mx-auto">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <Send className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="ml-3">
                        <p className="font-semibold">Campaign Preview</p>
                        <p className="text-sm text-gray-500">
                          {data.channel === 'sms' ? 'SMS' : 'WhatsApp'} Message
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <p className="text-sm whitespace-pre-wrap">
                      {data.content}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
