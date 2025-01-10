import { Card, CardContent } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Check, MessageSquare, Phone } from 'lucide-react'

interface Channel {
  label: string
  value: string
}

interface ChannelSelectionProps {
  channels: Channel[]
  data: {
    channel: string
  }
  updateData: (key: string, value: any) => void
}

export function ChannelSelection({
  channels,
  data,
  updateData,
}: ChannelSelectionProps) {
  return (
    <div className="flex justify-center w-full">
      <RadioGroup
        value={data.channel}
        onValueChange={(value) => updateData('channel', value)}
        className="grid gap-6 grid-cols-2 max-w-2xl"
      >
        {channels.map((channel) => (
          <Label
            key={channel.value}
            htmlFor={`channel-${channel.value}`}
            className="cursor-pointer"
          >
            <Card
              className={`relative transition-colors hover:bg-accent ${data.channel === channel.value ? 'border-primary' : ''}`}
            >
              <CardContent className="flex items-center p-6">
                <RadioGroupItem
                  value={channel.value}
                  id={`channel-${channel.value}`}
                  className="sr-only"
                />
                {channel.value === 'sms' ? (
                  <MessageSquare className="h-5 w-5 mr-3" />
                ) : (
                  <Phone className="h-5 w-5 mr-3" />
                )}
                <span className="font-medium">{channel.label}</span>
                {data.channel === channel.value && (
                  <div className="absolute top-2 right-2 h-5 w-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                )}
              </CardContent>
            </Card>
          </Label>
        ))}
      </RadioGroup>
    </div>
  )
}
