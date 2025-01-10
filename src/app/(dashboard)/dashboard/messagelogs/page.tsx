'use client'

import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Search,
  Download,
  RefreshCw,
  ChevronDown,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  X,
} from 'lucide-react'
import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import axiosInstance from '@/lib/axios'

const channels = ['whatsapp', 'sms']
const statuses = ['read', 'sent', 'delivered', 'failed', 'queued']

const getChannelStyle = (channel: string) => {
  switch (channel.toLowerCase()) {
    case 'whatsapp':
      return 'bg-green-100 text-green-800'
    case 'sms':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case 'read':
      return 'bg-green-100 text-green-800'
    case 'sent':
      return 'bg-blue-100 text-blue-800'
    case 'delivered':
      return 'bg-purple-100 text-purple-800'
    case 'failed':
      return 'bg-red-100 text-red-800'
    case 'queued':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

interface MessageLog {
  _id: string
  messageId: string
  instanceId: string
  foreignId: string
  phoneNumber: string
  channel: string
  text: string
  messageType: string
  credits: string
  status: string
  timestamp: string
}

export default function LogsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })
  const [logs, setLogs] = useState<MessageLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState('10')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [exportDateRange, setExportDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await axiosInstance.post('/api/logs/get-message-logs', {
        page: currentPage,
        limit: Number(pageSize),
        search: searchQuery,
        channels: selectedChannels,
        statuses: selectedStatuses,
        dateFrom: dateRange.from?.toISOString(),
        dateTo: dateRange.to?.toISOString(),
        sortBy: 'timestamp',
        sortOrder: sortDirection,
      })

      const {
        logs,
        currentPage: responsePage,
        totalPages,
        totalItems,
      } = response.data
      setLogs(logs)
      setCurrentPage(responsePage)
      setTotalPages(totalPages)
      setTotalItems(totalItems)
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setIsLoading(false)
    }
  }, [
    currentPage,
    pageSize,
    searchQuery,
    selectedChannels,
    selectedStatuses,
    dateRange,
    sortDirection,
  ])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const refresh = () => {
    fetchData()
  }

  const handleChannelChange = (checked: boolean, channel: string) => {
    setSelectedChannels((prev) => {
      if (channel === 'All') {
        return checked ? [] : channels
      } else {
        if (checked) {
          return [...prev, channel]
        } else {
          const newChannels = prev.filter((c) => c !== channel)
          return newChannels.length === 0 ? [] : newChannels
        }
      }
    })
    setCurrentPage(1)
  }

  const handleStatusChange = (checked: boolean, status: string) => {
    setSelectedStatuses((prev) => {
      if (status === 'All') {
        return checked ? [] : statuses
      } else {
        if (checked) {
          return [...prev, status]
        } else {
          const newStatuses = prev.filter((s) => s !== status)
          return newStatuses.length === 0 ? [] : newStatuses
        }
      }
    })
    setCurrentPage(1)
  }

  const toggleSort = () => {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    setCurrentPage(1)
  }

  const handleTimeRangeSelect = (range: string) => {
    setDateFilter(range)
    const now = new Date()

    let from: Date | undefined
    let to: Date | undefined

    switch (range) {
      case '7':
        from = new Date(now)
        from.setDate(from.getDate() - 7)
        from.setHours(0, 0, 0, 0)
        to = new Date(now)
        to.setHours(23, 59, 59, 999)
        break
      case '30':
        from = new Date(now)
        from.setDate(from.getDate() - 30)
        from.setHours(0, 0, 0, 0)
        to = new Date(now)
        to.setHours(23, 59, 59, 999)
        break
      case 'all':
        from = undefined
        to = undefined
        break
      case 'custom':
        return
      default:
        from = undefined
        to = undefined
    }

    setDateRange({ from, to })
    setCurrentPage(1)
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchData()
  }

  const exportLogs = async () => {
    try {
      const response = await axiosInstance.post(
        '/api/logs/export-message-logs',
        {
          search: searchQuery,
          channels: selectedChannels,
          statuses: selectedStatuses,
          dateFrom: exportDateRange.from?.toISOString(),
          dateTo: exportDateRange.to?.toISOString(),
          sortBy: 'timestamp',
          sortOrder: sortDirection,
        },
        { responseType: 'blob' },
      )

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'message_logs.csv')
      document.body.appendChild(link)
      link.click()
      link.remove()
      setIsExportDialogOpen(false)
    } catch (error) {
      console.error('Error exporting logs:', error)
    }
  }

  const clearAllFilters = () => {
    setSearchQuery('')
    setSelectedChannels([])
    setSelectedStatuses([])
    setDateRange({ from: undefined, to: undefined })
    setDateFilter('all')
    setCurrentPage(1)
    setSortDirection('desc')
  }

  const isAnyFilterApplied = () => {
    return (
      searchQuery !== '' ||
      selectedChannels.length > 0 ||
      selectedStatuses.length > 0 ||
      dateFilter !== 'all' ||
      dateRange.from !== undefined ||
      dateRange.to !== undefined
    )
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Message Logs</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={refresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Dialog
            open={isExportDialogOpen}
            onOpenChange={setIsExportDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Export Logs</DialogTitle>
                <DialogDescription>
                  Choose a date range for the logs you want to export.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="from" className="text-right">
                    From
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="from"
                        variant={'outline'}
                        className={`w-[280px] justify-start text-left font-normal col-span-3 ${
                          !exportDateRange.from && 'text-muted-foreground'
                        }`}
                      >
                        {exportDateRange.from ? (
                          format(exportDateRange.from, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={exportDateRange.from}
                        onSelect={(date) =>
                          setExportDateRange((prev) => ({
                            ...prev,
                            from: date,
                          }))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="to" className="text-right">
                    To
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="to"
                        variant={'outline'}
                        className={`w-[280px] justify-start text-left font-normal col-span-3 ${
                          !exportDateRange.to && 'text-muted-foreground'
                        }`}
                      >
                        {exportDateRange.to ? (
                          format(exportDateRange.to, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={exportDateRange.to}
                        onSelect={(date) =>
                          setExportDateRange((prev) => ({ ...prev, to: date }))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={exportLogs}>
                  Export CSV
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search messages, phone numbers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </form>
        <div className="flex flex-wrap gap-2 justify-end">
          {['all', '7', '30'].map((range) => (
            <Button
              key={range}
              variant={dateFilter === range ? 'default' : 'outline'}
              onClick={() => handleTimeRangeSelect(range)}
              size="sm"
              className="px-2 sm:px-3 text-xs sm:text-sm"
            >
              {range === 'all'
                ? 'All time'
                : range === '7'
                  ? '7 days'
                  : '30 days'}
            </Button>
          ))}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={dateFilter === 'custom' ? 'default' : 'outline'}
                size="sm"
                className="px-2 sm:px-3 text-xs sm:text-sm"
              >
                {dateFilter === 'custom' && dateRange.from && dateRange.to
                  ? `${format(dateRange.from, 'MMM dd, yyyy')} - ${format(dateRange.to, 'MMM dd, yyyy')}`
                  : 'Custom'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={(newDateRange) => {
                  if (newDateRange) {
                    const from = newDateRange.from
                      ? new Date(newDateRange.from)
                      : undefined
                    const to = newDateRange.to
                      ? new Date(newDateRange.to)
                      : undefined

                    if (from) from.setHours(0, 0, 0, 0)
                    if (to) to.setHours(23, 59, 59, 999)

                    setDateRange({ from, to })
                    if (from && to) {
                      setDateFilter('custom')
                      setCurrentPage(1)
                    }
                  }
                }}
                numberOfMonths={2}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {isAnyFilterApplied() && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="px-2 sm:px-3 text-xs sm:text-sm"
            >
              <X className="mr-2 h-4 w-4" />
              Clear All Filters
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <Card className="w-full overflow-hidden max-w-full">
          <div className="overflow-x-auto max-w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="py-4 px-6 cursor-pointer hover:bg-muted/50"
                    onClick={toggleSort}
                  >
                    <div className="flex items-center gap-2">
                      <span>Date</span>
                      {sortDirection === 'asc' ? (
                        <ArrowUp className="h-4 w-4 text-primary" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        Channel
                        <DropdownMenu>
                          <DropdownMenuTrigger className="ml-1">
                            <ChevronDown className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuCheckboxItem
                              checked={selectedChannels.length === 0}
                              onCheckedChange={(checked) =>
                                handleChannelChange(checked, 'All')
                              }
                            >
                              All
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuSeparator />
                            {channels.map((channel) => (
                              <DropdownMenuCheckboxItem
                                key={channel}
                                checked={selectedChannels.includes(channel)}
                                onCheckedChange={(checked) =>
                                  handleChannelChange(checked, channel)
                                }
                              >
                                {channel === 'whatsapp'
                                  ? 'WhatsApp'
                                  : channel.toUpperCase()}
                              </DropdownMenuCheckboxItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      {selectedChannels.length > 0 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className="h-5 px-1.5">
                                <Filter className="h-3 w-3 mr-1" />
                                {selectedChannels.length}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Selected: {selectedChannels.join(', ')}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="py-4 px-6">Message</TableHead>
                  <TableHead className="py-4 px-6">Message Type</TableHead>
                  <TableHead className="py-4 px-6">Phone Number</TableHead>
                  <TableHead className="py-4 px-6">Credits</TableHead>
                  <TableHead className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        Status
                        <DropdownMenu>
                          <DropdownMenuTrigger className="ml-1">
                            <ChevronDown className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuCheckboxItem
                              checked={selectedStatuses.length === 0}
                              onCheckedChange={(checked) =>
                                handleStatusChange(checked, 'All')
                              }
                            >
                              All
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuSeparator />
                            {statuses.map((status) => (
                              <DropdownMenuCheckboxItem
                                key={status}
                                checked={selectedStatuses.includes(status)}
                                onCheckedChange={(checked) =>
                                  handleStatusChange(checked, status)
                                }
                              >
                                {status}
                              </DropdownMenuCheckboxItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      {selectedStatuses.length > 0 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className="h-5 px-1.5">
                                <Filter className="h-3 w-3 mr-1" />
                                {selectedStatuses.length}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Selected: {selectedStatuses.join(', ')}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No records found
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log._id}>
                      <TableCell className="py-4 px-6">
                        {typeof log.timestamp === 'number'
                          ? new Date(log.timestamp).toLocaleString()
                          : new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <Badge
                          variant="secondary"
                          className={getChannelStyle(log.channel)}
                        >
                          {log.channel === 'whatsapp'
                            ? 'WhatsApp'
                            : log.channel.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[100px] sm:max-w-[150px] md:max-w-[200px] lg:max-w-[300px] truncate py-4 px-6">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-help">{log.text}</span>
                            </TooltipTrigger>
                            <TooltipContent side="top" align="start">
                              <p className="max-w-xs break-words">{log.text}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        {log.messageType}
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        {log.phoneNumber || ''}
                      </TableCell>
                      <TableCell className="py-4 px-6">{log.credits}</TableCell>
                      <TableCell className="py-4 px-6">
                        <Badge
                          variant="secondary"
                          className={getStatusStyle(log.status)}
                        >
                          {log.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-end gap-4 px-4 sm:px-6 py-4 border-t">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Rows per page
              </span>
              <Select
                value={pageSize}
                onValueChange={(value) => {
                  setPageSize(value)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * Number(pageSize) + 1}-
              {Math.min(currentPage * Number(pageSize), totalItems)} of{' '}
              {totalItems}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
