'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import axiosInstance from '@/lib/axios'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from 'recharts'

interface SMSTemplate {
  templateId: string
  name: string
  type: string
  text: string
  updatedAt: string
}

interface SMSTemplateCardProps {
  template: SMSTemplate
  onView: (id: string) => void
  onEdit: (id: string) => void
  onDeleteClick: (id: string) => void
}

function SMSTemplateCard({
  template,
  onView,
  onEdit,
  onDeleteClick,
}: SMSTemplateCardProps) {
  return (
    <Card className="w-full rounded-lg h-[250px] flex flex-col">
      <CardContent className="p-5 flex flex-col flex-grow">
        <div className="space-y-3 flex-grow">
          <h3 className="font-medium text-base">{template.name}</h3>
          <p className="text-sm text-gray-600 line-clamp-3">{template.text}</p>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Type: {template.type}</span>
            <span>
              Updated: {new Date(template.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <div className="flex-grow"></div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(template.templateId)}
          >
            View
          </Button>
          <Button size="sm" onClick={() => onEdit(template.templateId)}>
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDeleteClick(template.templateId)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function SMSTemplatesPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [templates, setTemplates] = useState<SMSTemplate[]>([])
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null)

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await axiosInstance.post(
          '/api/channels/sms/twilio/getAllTemplates',
        )
        const mappedTemplates = response.data.map((template: any) => ({
          templateId: template.templateId,
          name: template.name,
          type: template.type,
          text: template.text,
          updatedAt: template.updatedAt,
        }))
        setTemplates(mappedTemplates)
      } catch (error) {
        console.error('Failed to fetch templates:', error)
      }
    }

    fetchTemplates()
  }, [])

  const handleView = (id: string) => {
    router.push(`/dashboard/sms/template?templateId=${id}&mode=view`)
  }

  const handleEdit = (id: string) => {
    router.push(`/dashboard/sms/template?templateId=${id}&mode=edit`)
  }

  const handleDeleteClick = (id: string) => {
    setTemplateToDelete(id)
    setIsModalOpen(true)
  }

  const handleDelete = async () => {
    if (templateToDelete) {
      try {
        await axiosInstance.post('/api/channels/sms/twilio/deleteTemplate', {
          templateId: templateToDelete,
        })
        setTemplates((prevTemplates) =>
          prevTemplates.filter(
            (template) => template.templateId !== templateToDelete,
          ),
        )
        setTemplateToDelete(null)
        setIsModalOpen(false)
      } catch (error) {
        console.error('Failed to delete template:', error)
      }
    }
  }
  const handleCreateTemplate = () => {
    router.push('/dashboard/sms/template?mode=create')
  }

  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.type.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="container mx-auto py-4">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">SMS Templates</h1>
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={handleCreateTemplate}>
            <Plus className="mr-2 h-4 w-4" /> Create Template
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTemplates.map((template) => (
            <SMSTemplateCard
              key={template.templateId}
              template={template}
              onView={handleView}
              onEdit={handleEdit}
              onDeleteClick={handleDeleteClick}
            />
          ))}
        </div>
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-white rounded-lg shadow-lg w-full max-w-md">
          <DialogHeader>
            <DialogTitle>Do you want to delete the template?</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-center col-span-4">
                Please confirm your action.
              </Label>
            </div>
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button onClick={handleDelete} className="bg-green-500 text-white">
              Yes
            </Button>
            <Button
              onClick={handleCloseModal}
              className="bg-red-500 text-white"
            >
              No
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
