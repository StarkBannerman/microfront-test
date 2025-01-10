import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface TemplateCardProps {
  title: string
  description: string
  onClick: () => void
}

export function TemplateCard({
  title,
  description,
  onClick,
}: TemplateCardProps) {
  return (
    <Card className="w-[250px] flex flex-col">
      <CardContent className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground flex-grow">{description}</p>
        <Button onClick={onClick} className="mt-4 w-full">
          Use Template
        </Button>
      </CardContent>
    </Card>
  )
}
