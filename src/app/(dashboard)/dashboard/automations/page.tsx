'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Pencil,
  ShoppingCart,
  Utensils,
  Calendar,
  UserPlus,
  ClipboardList,
  AlertCircle,
  Loader2,
  XCircle,
  CheckCircle,
  Clock,
  Plus,
} from 'lucide-react'
import axiosInstance from '@/lib/axios'
import { useRouter } from 'next/navigation'

interface MessagingConfigurationComponent {
  componentId: string
  configId: string
  channel: 'sms' | 'whatsapp'
  accountId: string
  phoneNumberId: string
  templateId: string
  isComponentEnabled: boolean
  createdAt: string
  updatedAt: string
}

interface MessagingConfiguration {
  configId: string
  organizationId: string
  instanceId: string
  configType: string
  isEnabled: boolean
  createdAt: string
  updatedAt: string
  messagingConfigurationComponents: MessagingConfigurationComponent[]
}

interface GroupedConfigurations {
  [key: string]: MessagingConfiguration[]
}

interface AutomationInfo {
  label: string
  description: string
}

const getAutomationInfo = (configType: string): AutomationInfo => {
  const automationTypes: { [key: string]: AutomationInfo } = {
    orderCreated: {
      label: 'Order Created',
      description: 'Triggered when a new order is placed',
    },
    orderCanceled: {
      label: 'Order Canceled',
      description: 'Triggered when an order is canceled',
    },
    restaurantsTableReservationCreated: {
      label: 'Table Reservation Created',
      description: 'Triggered when a new table reservation is made',
    },
    restaurantsOrderFulfilled: {
      label: 'Order Fulfilled',
      description: 'Triggered when a restaurant order is fulfilled',
    },
    restaurantsOrderAccepted: {
      label: 'Order Accepted',
      description: 'Triggered when a restaurant accepts an order',
    },
    restaurantsPickupOrderCreated: {
      label: 'Pickup Order Created',
      description: 'Triggered when a new pickup order is placed',
    },
    restaurantsDeliveryOrderCreated: {
      label: 'Delivery Order Created',
      description: 'Triggered when a new delivery order is placed',
    },
    restaurantsTableReservationCanceled: {
      label: 'Table Reservation Canceled',
      description: 'Triggered when a table reservation is canceled',
    },
    restaurantsOrderCanceled: {
      label: 'Restaurant Order Canceled',
      description: 'Triggered when a restaurant order is canceled',
    },
    bookingConfirmed: {
      label: 'Booking Confirmed',
      description: 'Triggered when a booking is confirmed',
    },
    bookingRescheduled: {
      label: 'Booking Rescheduled',
      description: 'Triggered when a booking is rescheduled',
    },
    bookingCanceled: {
      label: 'Booking Canceled',
      description: 'Triggered when a booking is canceled',
    },
    newCustomerSignUp: {
      label: 'New Customer Sign Up',
      description: 'Triggered when a new customer signs up',
    },
    cartAbandoned: {
      label: 'Cart Abandoned',
      description: 'Triggered when a customer abandons their cart',
    },
    formSubmitted: {
      label: 'Form Submitted',
      description: 'Triggered when a form is submitted',
    },
    fulfilmentCreated: {
      label: 'Fulfilment Created',
      description: 'Triggered when a new fulfilment is created',
    },
  }

  return (
    automationTypes[configType] || {
      label: configType,
      description: 'Custom automation type',
    }
  )
}

const getAutomationIcon = (configType: string) => {
  switch (configType.toLowerCase()) {
    case 'ordercreated':
    case 'ordercanceled':
    case 'cartabandoned':
    case 'fulfilmentcreated':
      return <ShoppingCart className="h-5 w-5 text-blue-500" />
    case 'restaurantstablereservationcreated':
    case 'restaurantstablereservationcanceled':
      return <Calendar className="h-5 w-5 text-purple-500" />
    case 'restaurantsorderfulfilled':
    case 'restaurantsorderaccepted':
    case 'restaurantspickupordercreated':
    case 'restaurantsdeliveryordercreated':
    case 'restaurantsordercanceled':
      return <Utensils className="h-5 w-5 text-green-500" />
    case 'bookingconfirmed':
    case 'bookingrescheduled':
    case 'bookingcanceled':
      return <Calendar className="h-5 w-5 text-purple-500" />
    case 'newcustomersignup':
      return <UserPlus className="h-5 w-5 text-green-500" />
    case 'formsubmitted':
      return <ClipboardList className="h-5 w-5 text-blue-500" />
    default:
      return <AlertCircle className="h-5 w-5 text-yellow-500" />
  }
}

const groupConfigurations = (
  configurations: MessagingConfiguration[],
): GroupedConfigurations => {
  const groups: GroupedConfigurations = {
    'E-commerce': [],
    Restaurants: [],
    'Restaurant Table Reservations': [],
    Bookings: [],
    Customers: [],
    Forms: [],
    Other: [],
  }

  configurations.forEach((config) => {
    const type = config.configType.toLowerCase()
    if (type.includes('restaurants') && type.includes('tablereservation')) {
      groups['Restaurant Table Reservations'].push(config)
    } else if (
      type.includes('order') ||
      type.includes('cart') ||
      type.includes('fulfilment')
    ) {
      if (type.includes('restaurants')) {
        groups['Restaurants'].push(config)
      } else {
        groups['E-commerce'].push(config)
      }
    } else if (type.includes('booking')) {
      groups['Bookings'].push(config)
    } else if (type.includes('customer')) {
      groups['Customers'].push(config)
    } else if (type.includes('form')) {
      groups['Forms'].push(config)
    } else {
      groups['Other'].push(config)
    }
  })

  // Remove empty groups
  Object.keys(groups).forEach((key) => {
    if (groups[key].length === 0) {
      delete groups[key]
    }
  })

  return groups
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export default function AutomationsPage() {
  const router = useRouter()
  const [configurations, setConfigurations] = useState<
    MessagingConfiguration[]
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        const response = await axiosInstance.post(
          '/api/automations/get-automations',
        )
        console.log('API Response:', response.data)

        if (response.data && Array.isArray(response.data.configurations)) {
          setConfigurations(response.data.configurations)
          setError(null)
        } else {
          throw new Error('API response does not contain configurations array')
        }
      } catch (error) {
        console.error('Error fetching automations:', error)
        setError('Failed to load automations. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="container mx-auto py-20 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-600" />
        <p className="mt-4 text-lg text-gray-600">Loading automations...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 text-gray-800 text-center">
        {error}
      </div>
    )
  }

  const groupedConfigurations = groupConfigurations(configurations)

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Automations</h1>
        <Button
          className="bg-black hover:bg-gray-800 text-white"
          onClick={() => router.push('/dashboard/automations/create')}
        >
          <Plus className="h-5 w-5 mr-2" /> Create Automation
        </Button>
      </div>
      <div className="space-y-8">
        {Object.entries(groupedConfigurations).map(([group, configs]) => (
          <div key={group} className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {group}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {configs.map((config) => {
                const automationInfo = getAutomationInfo(config.configType)
                return (
                  <Card
                    key={config.configId}
                    className="flex flex-col border-gray-200"
                  >
                    <CardContent className="flex-1 p-4 space-y-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center">
                          {getAutomationIcon(config.configType)}
                          <h2 className="text-sm font-medium ml-2 text-gray-800">
                            {automationInfo.label}
                          </h2>
                        </div>
                        <Badge
                          variant="outline"
                          className={`${config.isEnabled ? 'bg-gray-100 text-gray-800' : 'bg-gray-200 text-gray-600'} border-0 whitespace-nowrap`}
                        >
                          {config.isEnabled ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>

                      <p className="text-xs text-gray-600">
                        {automationInfo.description}
                      </p>

                      <div className="flex items-center gap-2">
                        <h3 className="text-xs text-gray-500 whitespace-nowrap">
                          Channels:
                        </h3>
                        <div className="flex flex-wrap gap-1">
                          {config.messagingConfigurationComponents.map(
                            (component) => (
                              <Badge
                                key={component.componentId}
                                variant="secondary"
                                className="bg-gray-100 text-gray-800 text-xs whitespace-nowrap"
                              >
                                {component.channel}
                              </Badge>
                            ),
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>{formatDate(config.updatedAt)}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 p-1"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
