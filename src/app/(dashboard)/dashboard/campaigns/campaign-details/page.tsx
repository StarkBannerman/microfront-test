'use client'

import React, { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Send,
  CheckCircle,
  XCircle,
  MousePointerClick,
  BookOpen,
} from 'lucide-react'
import axiosInstance from '@/lib/axios'

interface CampaignDetails {
  campaignId: string
  campaignName: string
  channel: string
  campaignContent: string
  campaignTimestamp: number
  totalContacts: number
  totalSent: number
  totalDelivered: number
  campaignStatus: string
  stats: {
    campaignCost: string
    totalOrderAmount: string
    avgOrderValue: string
    roi: string
    orderDetails: any[]
  }
  selectedContactList: {
    segmentId: string
    listName: string
  }
}

export default function CampaignDetails() {
  const urlParams = new URLSearchParams(window.location.search)
  const campaignId = urlParams.get('campaignId')
  const [campaignDetails, setCampaignDetails] = useState<CampaignDetails>({
    campaignId: '',
    campaignName: '',
    campaignContent: '',
    channel: '',
    campaignTimestamp: 0,
    totalContacts: 0,
    totalSent: 0,
    totalDelivered: 0,
    campaignStatus: '',
    stats: {
      campaignCost: '$0.00',
      totalOrderAmount: '$0.00',
      avgOrderValue: '$0.00',
      roi: '0.00%',
      orderDetails: [],
    },
    selectedContactList: {
      segmentId: '',
      listName: '',
    },
  })

  const getCampaignDetails = () => {
    axiosInstance
      .post(
        `/common/campaigns/get-single-campaign-data?campaignId=${campaignId}`,
      )
      .then((response) => {
        if (response.status === 200 && response.data !== null) {
          const campaignData = response.data.campaignData
          const campaignStats = response.data.campaignStats || {
            campaignCost: '$0.00',
            totalOrderAmount: '$0.00',
            avgOrderValue: '$0.00',
            roi: '0.00%',
            orderDetails: [],
          }

          setCampaignDetails({
            campaignId: campaignId as string,
            campaignName: campaignData.campaignName,
            channel: campaignData.channel,
            campaignContent: campaignData.campaignText,
            campaignTimestamp: parseInt(campaignData.campaignTimestamp),
            totalContacts: campaignData.totalContacts,
            totalSent: campaignData.sentCount,
            totalDelivered: campaignData.totalDelivered,
            campaignStatus: campaignData.campaignStatus,
            stats: campaignStats,
            selectedContactList: {
              segmentId: campaignData.segmentId,
              listName: campaignData.segmentName,
            },
          })
        }
      })
      .catch((error) => {
        console.error(error)
      })
  }

  useEffect(() => {
    getCampaignDetails()
  }, [])

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold">
            {campaignDetails.campaignName}
          </h1>
          <div className="flex gap-2">
            <Badge className="bg-emerald-500 hover:bg-emerald-500/90">
              {campaignDetails.campaignStatus}
            </Badge>
            <Badge variant="secondary">{campaignDetails.channel}</Badge>
          </div>
        </div>
        {/* <Button variant="outline" className="w-full sm:w-auto">
          Duplicate Campaign
        </Button> */}
      </header>

      {/* Metrics Section */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
        {[
          {
            title: 'Campaign Cost',
            value: campaignDetails.stats.campaignCost || '₹0.00',
            icon: '💰',
          },
          {
            title: 'Total Revenue',
            value: campaignDetails.stats.totalOrderAmount || '₹0.00',
            icon: '💵',
          },
          {
            title: 'ROI',
            value: campaignDetails.stats.roi || '0.00%',
            icon: '📈',
          },
          {
            title: 'Total Orders',
            value: campaignDetails.stats.orderDetails.length.toString() || '0',
            icon: '📦',
          },
          {
            title: 'Average Order Value',
            value: campaignDetails.stats.avgOrderValue || '₹0.00',
            icon: '🛍️',
          },
        ].map((metric, index) => (
          <Card key={index} className="p-4 sm:p-5 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {metric.title}
                </p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold">
                  {metric.value}
                </p>
              </div>
              <span className="text-2xl sm:text-3xl">{metric.icon}</span>
            </div>
          </Card>
        ))}
      </section>

      {/* Content Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Campaign Details */}
        <Card className="border w-full">
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="font-medium">Segment</p>
              <p className="text-sm text-muted-foreground">
                {campaignDetails.selectedContactList.listName}
              </p>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Campaign Message</h2>
              <div className="bg-muted p-4 rounded-md space-y-3 text-sm">
                <p>{campaignDetails.campaignContent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Campaign Analytics */}
        <Card className="border w-full">
          <CardHeader>
            <CardTitle>Campaign Analytics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                label: 'Total',
                value: campaignDetails.totalContacts,
                icon: Send,
              },
              {
                label: 'Sent',
                value: campaignDetails.totalSent,
                icon: MousePointerClick,
              },
              {
                label: 'Delivered',
                value: campaignDetails.totalDelivered,
                icon: CheckCircle,
              },
              {
                label: 'Failed',
                value:
                  campaignDetails.totalSent - campaignDetails.totalDelivered,
                icon: XCircle,
              },
            ].map((metric, index) => (
              <div key={index} className="p-3 sm:p-4 rounded-md border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <metric.icon className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
                    <span className="text-xs sm:text-sm font-medium">
                      {metric.label}
                    </span>
                  </div>
                  <span className="text-sm sm:text-base lg:text-lg font-semibold">
                    {metric.value}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="border w-full sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[250px] sm:h-[350px] lg:h-[400px]">
              <div className="divide-y">
                {campaignDetails.stats.orderDetails?.map((order, index) => {
                  const initial = order.firstName?.charAt(0).toUpperCase() || ''
                  const formattedDate = new Date(order.date)
                    .toISOString()
                    .split('T')[0] // YYYY-MM-DD format

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs sm:text-sm">
                          {initial}
                        </div>
                        <div>
                          <p className="font-medium text-sm sm:text-base">
                            {order.firstName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.phone}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm sm:text-base">
                          {order.amount}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formattedDate}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
