'use client'

import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Search, Plus, ChevronLeft, ChevronRight, X } from 'lucide-react'
import axiosInstance from '@/lib/axios'
import { useRouter } from 'next/navigation'
import { WhatsAppTemplateModal } from '../common/WhatsAppAccountModal'

interface Template {
  id: number
  name: string
  content: string
  updatedAt: string
}

interface ContentSelectionProps {
  data: {
    channel: string
    campaignName: string
    content: string
    contentType: 'template' | 'freeform'
    selectedTemplate?: number
  }
  updateData: (key: string, value: any) => void
}

export function ContentSelection({ data, updateData }: ContentSelectionProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [freeformContent, setFreeformContent] = useState(data.content)
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const itemsPerPage = 9

  const filteredTemplates = useMemo(
    () =>
      templates.filter(
        (template) =>
          template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          template.content.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [searchTerm, templates],
  )

  const fetchTemplates = async () => {
    try {
      let route: string
      let transformTemplate

      if (data.channel === 'sms') {
        route = '/api/channels/sms/twilio/getAllTemplates'
        transformTemplate = (template: any) => ({
          id: template.templateId,
          name: template.name,
          content: template.text,
          updatedAt: template.updatedAt || 'N/A',
        })
      } else if (data.channel === 'whatsapp') {
        route = '/api/channels/whatsapp/getAllTemplates'
        transformTemplate = (template: any) => {
          const bodyComponent = template.components.find(
            (component: any) => component.type === 'BODY',
          )
          return {
            id: template.templateId,
            name: template.name,
            content: bodyComponent?.text || 'No content available',
            updatedAt: template.updatedAt || 'N/A',
          }
        }
      } else {
        console.error('Unsupported channel:', data.channel)
        return
      }

      const response = await axiosInstance.post(route)
      const standardizedTemplates = response.data.map(transformTemplate)
      setTemplates(standardizedTemplates)
      setLoading(false)
    } catch (error) {
      console.log('Error fetching templates:', error)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [data.channel])

  const paginatedTemplates = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredTemplates.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredTemplates, currentPage])

  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage)

  const [isOpen, setIsOpen] = useState(false)

  const handleSelectTemplate = useCallback(
    (templateId: number) => {
      const template = templates.find((t) => t.id === templateId)
      if (template) {
        updateData('selectedTemplate', templateId)
        updateData('content', template.content)
        updateData('contentType', 'template')
      }
    },
    [updateData, templates],
  )

  const handleClearSelection = useCallback(() => {
    updateData('selectedTemplate', undefined)
    updateData('content', '')
    updateData('contentType', 'template')
  }, [updateData])

  const handleFreeformContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = e.target.value
      setFreeformContent(newContent)
      updateData('content', newContent)
      updateData('contentType', 'freeform')
    },
    [updateData],
  )

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }, [])

  const handleCreateTemplate = useCallback(() => {
    if (data.channel === 'sms') {
      router.push('/dashboard/sms/template?mode=create')
    } else if (data.channel === 'whatsapp') {
      setIsOpen(true)
    }
  }, [])

  const TemplateCard = useCallback(
    ({ template }: { template: Template }) => {
      const isSelected = data.selectedTemplate === template.id
      return (
        <Card
          className={`cursor-pointer transition-colors hover:bg-accent ${
            isSelected ? 'border-primary bg-primary/10' : ''
          } h-full flex flex-col`}
          onClick={() => handleSelectTemplate(template.id)}
        >
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base font-medium">
              {template.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 flex-grow flex flex-col justify-between">
            <div className="text-sm text-muted-foreground line-clamp-3 mb-4">
              {template.content}
            </div>
            <div className="text-xs text-muted-foreground mt-auto">
              Updated at: {template.updatedAt}
            </div>
          </CardContent>
        </Card>
      )
    },
    [data.selectedTemplate, handleSelectTemplate],
  )

  const TemplateSelection = useMemo(() => {
    if (data.selectedTemplate) {
      const selectedTemplate = templates.find(
        (t) => t.id === data.selectedTemplate,
      )
      if (selectedTemplate) {
        return (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button
                onClick={handleClearSelection}
                variant="outline"
                size="sm"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Selection
              </Button>
            </div>
            <TemplateCard template={selectedTemplate} />
          </div>
        )
      }
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-8"
            />
          </div>
          <Button
            variant="default"
            size="default"
            className="whitespace-nowrap"
            onClick={handleCreateTemplate}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {paginatedTemplates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1} -{' '}
            {Math.min(currentPage * itemsPerPage, filteredTemplates.length)} of{' '}
            {filteredTemplates.length} templates
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
      </div>
    )
  }, [
    data.selectedTemplate,
    paginatedTemplates,
    searchTerm,
    currentPage,
    totalPages,
    filteredTemplates.length,
    TemplateCard,
    handleSearch,
    handleClearSelection,
  ])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div>Loading...</div>
      </div>
    )
  }

  if (data.channel === 'whatsapp') {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold mb-4">Campaign Name</h2>
        <Input
          id="campaign-name"
          value={data.campaignName}
          onChange={(e) => updateData('campaignName', e.target.value)}
          className="col-span-3"
        />
        <h2 className="text-xl font-semibold mb-4">Select WhatsApp Template</h2>
        <WhatsAppTemplateModal open={isOpen} onOpenChange={setIsOpen} />
        {TemplateSelection}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Campaign Name</h2>
      <Input
        id="campaign-name"
        value={data.campaignName}
        onChange={(e) => updateData('campaignName', e.target.value)}
        className="col-span-3"
      />
      <h2 className="text-xl font-semibold mb-4">Select SMS Content</h2>
      <Tabs defaultValue="freeform" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="freeform" className="px-4 py-2">
            Freeform
          </TabsTrigger>
          <TabsTrigger value="template" className="px-4 py-2">
            Template
          </TabsTrigger>
        </TabsList>
        <TabsContent value="freeform">
          <Textarea
            placeholder="Type your SMS content here..."
            value={freeformContent}
            onChange={handleFreeformContentChange}
            className="min-h-[200px] p-3"
          />
        </TabsContent>
        <TabsContent value="template">{TemplateSelection}</TabsContent>
      </Tabs>
    </div>
  )
}
