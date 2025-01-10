'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import axiosInstance from '@/lib/axios'
import { useSession } from 'next-auth/react'
import { NoAccess } from '@/components/common/NoAccess'

interface Integration {
  id: string
  name: string
  logo: string
  connected: boolean
  appUrl: string
  description: string
  category: 'commerce' | 'communication' | 'crm' | 'other'
}

const categories = [
  'all',
  'connected',
  'commerce',
  'communication',
  'crm',
  'other',
]

export default function Integrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const { data: session, status } = useSession()
  const integrationPermissions = (session as any)?.permissions?.INTEGRATIONS
  const isMainAccount = (session as any)?.isMainAccount

  useEffect(() => {
    const fetchIntegrations = async () => {
      try {
        const response = await axiosInstance.post(
          '/api/integrations/fetchIntegrations',
        )
        setIntegrations(response.data)
      } catch (error) {
        console.error('Error fetching integrations:', error)
      }
    }

    fetchIntegrations()
  }, [])

  const filteredIntegrations = integrations.filter(
    (integration) =>
      integration.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (activeFilter === 'all' ||
        integration.category === activeFilter ||
        (activeFilter === 'connected' && integration.connected)),
  )

  return isMainAccount || integrationPermissions?.VIEW_INTEGRATIONS ? (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-[1400px]">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 sm:mb-12"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            Integrations
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Connect your favorite tools and streamline your workflow
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <Input
              type="search"
              placeholder="Search integrations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 sm:pl-10 w-full"
            />
          </div>
          <Tabs
            value={activeFilter}
            onValueChange={setActiveFilter}
            className="w-full lg:w-auto"
          >
            <TabsList className="w-full h-full flex flex-wrap justify-start gap-2 bg-transparent">
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="capitalize px-3 py-1 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredIntegrations.map((integration) => (
            <motion.div
              key={integration.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all"
            >
              <div className="p-5 sm:p-6 flex flex-col min-h-[260px]">
                <div className="flex items-start space-x-3 mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex-shrink-0 flex items-center justify-center p-2">
                    <Image
                      src={integration.logo}
                      alt={`${integration.name} logo`}
                      width={32}
                      height={32}
                      className="object-contain w-6 h-6 sm:w-8 sm:h-8"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold truncate">
                      {integration.name}
                    </h3>
                    {integration.connected && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-xs text-green-600">
                          Connected
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-600 flex-1 mb-4 line-clamp-2">
                  {integration.description}
                </p>

                <div className="space-y-2 mt-auto">
                  <Button
                    variant={integration.connected ? 'outline' : 'default'}
                    className="w-full text-sm h-9"
                    asChild
                  >
                    <Link href={integration.appUrl}>
                      {integration.connected ? 'Manage' : 'Connect'}
                    </Link>
                  </Button>
                  <Link
                    href={`${integration.appUrl}/docs`}
                    className="flex items-center justify-center text-xs text-gray-600 hover:text-black gap-1 transition-colors h-6"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View Documentation
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredIntegrations.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <p className="text-base sm:text-lg text-gray-600">
              No integrations found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  ) : (
    <NoAccess />
  )
}
