import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface CampaignReviewProps {
  data: {
    channel: string
    audience: { name: string; count: number } | null
    content: string
    schedule: string | null
  }
}

export function CampaignReview({ data }: CampaignReviewProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Campaign Review</h2>
      <Card>
        <CardHeader>
          <CardTitle>Campaign Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <strong>Channel:</strong> {data.channel}
          </p>
          <p>
            <strong>Audience:</strong>{' '}
            {data.audience
              ? `${data.audience.name} (${data.audience.count} contacts)`
              : 'Not selected'}
          </p>
          <p>
            <strong>Content:</strong> {data.content || 'Not selected'}
          </p>
          <p>
            <strong>Schedule:</strong>{' '}
            {data.schedule
              ? new Date(data.schedule).toLocaleString()
              : 'Send immediately'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
