'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { CalendarIcon } from '@radix-ui/react-icons'
import { addDays, format } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Mail,
  Users,
  UserCheck,
  UserMinus,
  TrendingUp,
  Tag,
  CalendarPlus2Icon as CalendarIcon2,
  Users2,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  ArrowRight,
  PlusCircle,
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import axiosInstance from '@/lib/axios'
import { useRouter } from 'next/navigation'

interface Campaign {
  campaignId: string
  campaignName: string
  campaignText: string
  segmentName: string
  totalDelivered: string
  totalContacts: string
  campaignTimestamp: string
}

export default function CampaignsPage() {
  const router = useRouter()
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [selectedTimeRange, setSelectedTimeRange] = useState<string | null>(
    null,
  )

  const recentOrders = [
    {
      id: 'ORD001',
      name: 'Olivia Martin',
      email: 'olivia.martin@email.com',
      amount: 1999.0,
    },
    {
      id: 'ORD002',
      name: 'Jackson Lee',
      email: 'jackson.lee@email.com',
      amount: 39.0,
    },
    {
      id: 'ORD003',
      name: 'Isabella Nguyen',
      email: 'isabella.nguyen@email.com',
      amount: 299.0,
    },
    {
      id: 'ORD004',
      name: 'William Chen',
      email: 'william.chen@email.com',
      amount: 99.0,
    },
    {
      id: 'ORD005',
      name: 'Sofia Rodriguez',
      email: 'sofia.rodriguez@email.com',
      amount: 599.0,
    },
  ]

  const revenueMetrics = [
    {
      title: 'Total Revenue',
      value: '$150,000',
      icon: DollarSign,
      change: '+12.3%',
      trend: 'up',
    },
    {
      title: 'Total Spent',
      value: '$50,000',
      icon: ArrowUpRight,
      change: '+5.6%',
      trend: 'up',
    },
    {
      title: 'ROI',
      value: '200%',
      icon: Percent,
      change: '+15.2%',
      trend: 'up',
    },
    {
      title: 'Avg. Order Value',
      value: '$75',
      icon: ArrowDownRight,
      change: '-2.5%',
      trend: 'down',
    },
  ]

  const customerStats = [
    { title: 'Total Contacts', value: '20,000', icon: Users },
    { title: 'Total Contacts Reached', value: '15,000', icon: Mail },
    { title: 'Total Conversions', value: '3,000', icon: UserCheck },
    { title: 'Total Unsubscribers', value: '500', icon: UserMinus },
  ]

  const bestPerformers = {
    segments: [
      { name: 'High-value customers', roi: '350%' },
      { name: 'New customers', roi: '280%' },
    ],
    coupons: [
      { code: 'SUMMER25', roi: '400%' },
      { code: 'NEWCUST10', roi: '320%' },
    ],
  }

  const handleTimeRangeSelect = (range: string) => {
    setSelectedTimeRange(range)
    setDateRange(undefined)
    setShowDatePicker(false)
  }

  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  const getAllCampaignsData = async () => {
    axiosInstance
      .post(`/common/campaigns/get-all-campaigns-data`)
      .then(function (response) {
        if (response.status === 200) {
          setCampaigns(response.data)
        }
      })
      .catch(function (error) {
        console.log(error)
      })
  }

  useEffect(() => {
    getAllCampaignsData()
  }, [])

  return (
    <div className="p-4 space-y-4 sm:p-6 lg:p-8">
      {/* Header Section */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Campaigns</h2>
          <p className="text-sm text-muted-foreground">
            Manage and track your campaign performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* <Button variant="outline" className="h-8 text-xs sm:text-sm">
            <CalendarIcon2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Filter
          </Button> */}
          <Button
            variant="default"
            className="h-8 text-xs sm:text-sm"
            onClick={() => router.push('/dashboard/campaigns/create-campaign')}
          >
            <Users2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Create Campaign
          </Button>
        </div>
      </div>

      {/* Time Range Selection */}
      {/* <div className="flex flex-wrap gap-2 justify-end">
        {['all', '7days', '30days'].map((range) => (
          <Button
            key={range}
            variant={selectedTimeRange === range ? 'default' : 'outline'}
            onClick={() => handleTimeRangeSelect(range)}
            size="sm"
            className="px-2 sm:px-3 text-xs sm:text-sm"
          >
            {range === 'all'
              ? 'All time'
              : range === '7days'
                ? '7 days'
                : '30 days'}
          </Button>
        ))}
        <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
          <PopoverTrigger asChild>
            <Button
              variant={selectedTimeRange === 'custom' ? 'default' : 'outline'}
              onClick={() => {
                setSelectedTimeRange('custom')
                setShowDatePicker(true)
              }}
              size="sm"
              className="px-2 sm:px-3 text-xs sm:text-sm"
            >
              {dateRange?.from &&
              dateRange?.to &&
              selectedTimeRange === 'custom'
                ? `${format(dateRange.from, 'LLL dd, y')} - ${format(dateRange.to, 'LLL dd, y')}`
                : 'Custom'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from || new Date()}
              selected={dateRange}
              onSelect={(newDateRange) => {
                setDateRange(newDateRange)
                if (newDateRange?.from && newDateRange?.to) {
                  setShowDatePicker(false)
                }
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div> */}

      {/* Revenue Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {revenueMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <div className="p-1.5 sm:p-2 bg-primary/10 rounded-full">
                    <metric.icon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                      {metric.title}
                    </p>
                    <p className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold">
                      {metric.value}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={metric.trend === 'up' ? 'default' : 'destructive'}
                  className="text-xs sm:text-sm"
                >
                  {metric.change}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Customer Stats, Best Performers, and Recent Orders */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Customer Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Customer Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {customerStats.map((stat, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-1.5 sm:p-2 rounded-lg border"
              >
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                  <div className="p-1 sm:p-1.5 bg-primary/10 rounded-full">
                    <stat.icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium">
                    {stat.title}
                  </span>
                </div>
                <span className="text-xs sm:text-sm font-semibold">
                  {stat.value}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Best Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              Best Performers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Top Segments */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Top Segments</h4>
              <div className="space-y-2">
                {bestPerformers.segments.map((segment, index) => (
                  <div key={index} className="p-2 sm:p-3 rounded-lg border">
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                      <div className="flex items-center space-x-1.5 sm:space-x-2">
                        <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-green-500" />
                        <span className="text-xs sm:text-sm font-medium">
                          {segment.name}
                        </span>
                      </div>
                      <Badge className="text-xs">ROI: {segment.roi}</Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs sm:text-sm"
                    >
                      <PlusCircle className="mr-1.5 h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      Create campaign
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Coupon Codes */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Top Coupon Codes</h4>
              <div className="space-y-2">
                {bestPerformers.coupons.map((coupon, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 sm:p-3 rounded-lg border"
                  >
                    <div className="flex items-center space-x-2">
                      <Tag className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                      <span className="text-xs sm:text-sm font-medium">
                        {coupon.code}
                      </span>
                    </div>
                    <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 text-xs">
                      ROI: {coupon.roi}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={`https://api.dicebear.com/6.x/initials/svg?seed=${order.name}`}
                      />
                      <AvatarFallback>
                        {order.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs sm:text-sm font-medium">
                        {order.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.email}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm font-medium">
                    ${order.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full text-xs sm:text-sm">
              View all orders
              <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Recent Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Recent Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Name</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Segment
                  </TableHead>
                  <TableHead>Delivered</TableHead>
                  <TableHead>Contacts</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.campaignId}>
                    <TableCell className="font-medium">
                      <div>
                        <p className="font-medium text-xs sm:text-sm">
                          {campaign.campaignName}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-xs sm:text-sm">
                      {campaign.segmentName}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {campaign.totalDelivered}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {campaign.totalContacts}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs sm:text-sm">
                      {new Date(
                        parseInt(campaign.campaignTimestamp),
                      ).toUTCString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="default"
                        className="h-8 text-xs sm:text-sm"
                        onClick={() =>
                          (window.location.href = `/dashboard/campaigns/campaign-details?campaignId=${campaign.campaignId}`)
                        }
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" className="w-full text-xs sm:text-sm">
            View all campaigns
            <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
