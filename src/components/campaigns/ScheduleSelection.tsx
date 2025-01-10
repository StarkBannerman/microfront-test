'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CalendarIcon, Clock, SendIcon } from 'lucide-react'

interface ScheduleSelectionProps {
  data: { schedule: string | null; scheduleType: 'now' | 'later' | null }
  updateData: (key: string, value: any) => void
}

export function ScheduleSelection({
  data,
  updateData,
}: ScheduleSelectionProps) {
  const [scheduledDate, setScheduledDate] = useState(data.schedule || '')

  const handleScheduleTypeChange = useCallback(
    (type: 'now' | 'later') => {
      const defaultDate = new Date()
      defaultDate.setHours(defaultDate.getHours() + 1)
      defaultDate.setMinutes(0)
      const defaultDateString = defaultDate.toISOString().slice(0, 16)
      updateData('scheduleType', type)
      if (type === 'now') {
        updateData('schedule', defaultDateString)
      } else if (type === 'later' && !scheduledDate) {
        setScheduledDate(defaultDateString)
        updateData('schedule', defaultDateString)
      }
    },
    [updateData, scheduledDate],
  )

  const handleDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDate = e.target.value
      setScheduledDate(newDate)
      updateData('schedule', newDate)
      updateData('scheduleType', 'later')
    },
    [updateData],
  )

  const isScheduleComplete =
    data.scheduleType === 'now' ||
    (data.scheduleType === 'later' && !!data.schedule)

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium">Schedule Campaign</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          className={`cursor-pointer transition-all hover:bg-accent/50 ${
            data.scheduleType === 'now' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => handleScheduleTypeChange('now')}
        >
          <CardContent className="flex items-start gap-4 p-6">
            <SendIcon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="space-y-1.5">
              <h3 className="font-medium">Send Immediately</h3>
              <p className="text-sm text-muted-foreground">
                Your campaign will be sent as soon as you submit it.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:bg-accent/50 ${
            data.scheduleType === 'later' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => handleScheduleTypeChange('later')}
        >
          <CardContent className="flex items-start gap-4 p-6">
            <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="space-y-1.5">
              <h3 className="font-medium">Schedule for Later</h3>
              <p className="text-sm text-muted-foreground">
                Choose a specific date and time to send your campaign.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {data.scheduleType === 'later' && (
        <div className="space-y-3">
          <Label htmlFor="schedule-date">Select Date and Time</Label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              id="schedule-date"
              type="datetime-local"
              value={scheduledDate}
              onChange={handleDateChange}
              className="pl-10"
            />
          </div>
        </div>
      )}
    </div>
  )
}
