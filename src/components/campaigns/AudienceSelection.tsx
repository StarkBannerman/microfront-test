'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Search,
  Users,
  UserPlus,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import axiosInstance from '@/lib/axios'

interface Audience {
  id: number
  name: string
  count: number
  createdAt: string
  type: 'segment' | 'all'
}

interface AudienceSelectionProps {
  data: { audiences: Audience[] }
  updateData: (key: string, value: Audience[]) => void
}

export function AudienceSelection({
  data,
  updateData,
}: AudienceSelectionProps) {
  const [audiences, setAudiences] = useState<Audience[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  const fetchSegmentsAndContacts = async () => {
    setLoading(true)
    try {
      const [segmentsResponse, contactsResponse] = await Promise.all([
        axiosInstance.post('/common/segments/get-segments'),
        axiosInstance.post('/common/contacts/get-phone-contacts-count'),
      ])

      const segments = segmentsResponse.data.map((segment: any) => ({
        id: segment.segmentId,
        name: segment.segmentName,
        count: segment.segmentSize,
        createdAt: segment.date_created,
        type: 'segment',
      }))

      const allContacts = {
        id: 'all',
        name: 'All Contacts',
        count: contactsResponse.data.count,
        createdAt: new Date().toISOString(),
        type: 'all',
      }
      setAudiences([allContacts, ...segments])
    } catch (error) {
      console.log('Error fetching segments or contacts count:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSegmentsAndContacts()
  }, [])

  const filteredAudiences = useMemo(
    () =>
      audiences.filter((audience) =>
        audience.name.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [audiences, searchTerm],
  )

  const paginatedAudiences = useMemo(() => {
    const allContacts = filteredAudiences.find((a) => a.type === 'all')
    const segments = filteredAudiences.filter((a) => a.type === 'segment')
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedSegments = segments.slice(
      startIndex,
      startIndex + itemsPerPage - 1,
    )
    return allContacts ? [allContacts, ...paginatedSegments] : paginatedSegments
  }, [filteredAudiences, currentPage])

  const totalPages = Math.ceil(
    (filteredAudiences.length - 1) / (itemsPerPage - 1),
  )

  const handleSelect = useCallback(
    (audience: Audience) => {
      if (audience.type === 'all') {
        updateData('audiences', [audience])
      } else {
        const newAudiences = data.audiences.some((a) => a.id === audience.id)
          ? data.audiences.filter((a) => a.id !== audience.id)
          : [...data.audiences.filter((a) => a.type !== 'all'), audience]
        updateData('audiences', newAudiences)
      }
    },
    [data.audiences, updateData],
  )

  const handleClearSelection = useCallback(() => {
    updateData('audiences', [])
  }, [updateData])

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }, [])

  const AudienceCard = useCallback(
    ({ audience }: { audience: Audience }) => (
      <Card
        className={`cursor-pointer transition-colors hover:bg-accent ${
          data.audiences.some((a) => a.id === audience.id)
            ? 'border-primary'
            : ''
        } h-full flex flex-col`}
        onClick={() => handleSelect(audience)}
      >
        <CardHeader className="p-3 flex-grow">
          <CardTitle className="text-sm font-medium flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={data.audiences.some((a) => a.id === audience.id)}
                onCheckedChange={() => handleSelect(audience)}
              />
              <span>{audience.name}</span>
            </div>
            <Badge variant={audience.type === 'all' ? 'secondary' : 'default'}>
              {audience.type === 'all' ? 'All' : 'Segment'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-1" />
            <span>{audience.count.toLocaleString()} contacts</span>
          </div>
          {audience.type !== 'all' && (
            <div className="text-xs text-muted-foreground mt-1">
              Created: {new Date(audience.createdAt).toLocaleDateString()}
            </div>
          )}
        </CardContent>
      </Card>
    ),
    [data.audiences, handleSelect],
  )

  const startIndex = (currentPage - 1) * (itemsPerPage - 1)
  const endIndex = Math.min(
    startIndex + paginatedAudiences.length,
    filteredAudiences.length,
  )

  const selectedSegments = data.audiences.filter((a) => a.type === 'segment')
  const hasSelectedSegments = selectedSegments.length > 0
  const totalSelectedContacts = data.audiences.reduce(
    (sum, audience) => sum + audience.count,
    0,
  )

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div>Loading...</div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-grow max-w-md">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Search audiences..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-8"
                />
              </div>
              {hasSelectedSegments && (
                <div className="text-sm text-muted-foreground">
                  {selectedSegments.length} segment
                  {selectedSegments.length !== 1 ? 's' : ''} •{' '}
                  {totalSelectedContacts.toLocaleString()} contacts
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {hasSelectedSegments && (
                <Button
                  onClick={handleClearSelection}
                  variant="outline"
                  size="sm"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedAudiences.map((audience) => (
              <AudienceCard key={audience.id} audience={audience} />
            ))}
          </div>
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} - {endIndex} of{' '}
              {filteredAudiences.length} audiences
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous page</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next page</span>
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
