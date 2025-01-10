'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { phoneCountryCodes } from '../utils/countryCodes'

interface CountryCodeSelectProps {
  value?: string
  onChange: (value: string) => void
  onBlur: () => void
  name: string
  className?: string
}

export function CountryCodeSelect({
  value,
  onChange,
  onBlur,
  name,
  className,
}: CountryCodeSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState('')

  const filteredCountries = React.useMemo(() => {
    return phoneCountryCodes.filter(
      (country) =>
        country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.dialCode.includes(searchTerm),
    )
  }, [searchTerm])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('h-9 justify-between px-3 text-sm w-full', className)}
          onClick={() => setOpen(!open)}
          onBlur={onBlur}
        >
          {value ? (
            <>
              {phoneCountryCodes.find((country) => country.dialCode === value)
                ?.emoji || ''}{' '}
              {value}
            </>
          ) : (
            'Select...'
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-2">
        <div className="flex items-center border rounded-md px-3 mb-2">
          <Search className="h-4 w-4 text-muted-foreground mr-2" />
          <Input
            className="h-9 border-0 p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="Search country or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <ScrollArea className="h-[300px]">
          {filteredCountries.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No country found.
            </div>
          ) : (
            filteredCountries.map((country) => (
              <div
                key={country.code}
                className={cn(
                  'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
                  value === country.dialCode &&
                    'bg-accent text-accent-foreground',
                )}
                onClick={() => {
                  onChange(country.dialCode)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    value === country.dialCode ? 'opacity-100' : 'opacity-0',
                  )}
                />
                {country.emoji} {country.name} ({country.dialCode})
              </div>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
