import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Clock } from 'lucide-react'

interface CampaignMessageProps {
  name: string
  status: string
  channel: string
  segment: string
  sentTime: string
  message: string
}

export default function CampaignMessage({
  name,
  status,
  channel,
  segment,
  sentTime,
  message,
}: CampaignMessageProps) {
  return (
    <Card className="bg-white shadow-lg overflow-hidden">
      <CardHeader className="bg-black text-white p-6">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-bold mb-2">{name}</CardTitle>
            <div className="flex space-x-2">
              <Badge variant="secondary" className="bg-blue-500 text-white">
                {channel}
              </Badge>
              <Badge variant="secondary" className="bg-green-500 text-white">
                {status}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-6 space-y-2">
          <div className="flex text-sm text-gray-600">
            <Users className="mr-2 h-4 w-4 flex-shrink-0 mt-1" />
            <div>
              <span className="font-medium mr-2">Segment:</span>
              <span className="break-words">{segment}</span>
            </div>
          </div>
          <div className="flex text-sm text-gray-600 mt-2">
            <Clock className="mr-2 h-4 w-4 flex-shrink-0 mt-1" />
            <div>
              <span className="font-medium mr-2">Sent:</span>
              <span className="break-words">{sentTime}</span>
            </div>
          </div>
        </div>
        <div className="bg-gray-100 rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            Campaign Message
          </h3>
          <div className="bg-white rounded p-4 shadow-inner">
            <p className="text-sm whitespace-pre-line text-gray-700">
              {message}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
