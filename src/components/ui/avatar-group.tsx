import * as React from 'react'
import { Avatar } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  items: Array<React.ComponentProps<typeof Avatar>>
  limit?: number
}

export function AvatarGroup({
  items,
  limit = 3,
  className,
  ...props
}: AvatarGroupProps) {
  const itemsToShow = limit ? items.slice(0, limit) : items
  const remainingCount = items.length - itemsToShow.length

  return (
    <div className={cn('flex -space-x-4', className)} {...props}>
      {itemsToShow.map((item, index) => (
        <Avatar key={index} {...item} className="border-2 border-background" />
      ))}
      {remainingCount > 0 && (
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted text-muted-foreground text-sm font-medium border-2 border-background">
          +{remainingCount}
        </div>
      )}
    </div>
  )
}
