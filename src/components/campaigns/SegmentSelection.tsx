import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

interface SegmentSelectionProps {
  selectedSegment: string
  onSelect: (segment: string) => void
}

export function SegmentSelection({
  selectedSegment,
  onSelect,
}: SegmentSelectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Select Segment</h3>
      <RadioGroup value={selectedSegment} onValueChange={onSelect}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="all" id="all" />
          <Label htmlFor="all">All Contacts</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="segment" id="segment" />
          <Label htmlFor="segment">Created Segment</Label>
        </div>
      </RadioGroup>
    </div>
  )
}
