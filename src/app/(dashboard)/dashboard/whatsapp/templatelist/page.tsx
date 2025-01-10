'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Eye,
  Edit,
  Trash2,
  Search,
  Plus,
  Tag,
  CheckCircle,
  Globe,
  Clock,
  XCircle,
  HelpCircle,
  Calendar,
} from 'lucide-react'
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
import { WhatsAppTemplateModal } from '@/components/common/WhatsAppAccountModal'

const whatsappBusinessAccounts = [
  {
    accountId: 'all',
    accountName: 'All Accounts',
  },
  {
    accountId: '375972745604042',
    organizationId: '1b177626-d8a0-43f1-a59b-ddbc032e7506',
    accountName: 'Main Business Account',
    currency: 'USD',
    timezoneId: 'America/New_York',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    accountId: '123456789012345',
    organizationId: '1b177626-d8a0-43f1-a59b-ddbc032e7506',
    accountName: 'Secondary Business Account',
    currency: 'EUR',
    timezoneId: 'Europe/London',
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
]

interface WhatsAppTemplate {
  accountId: string
  templateId: string
  name: string
  language: string
  category: string
  status: string
  components: Array<{
    type: string
    text?: string
  }>
  updatedAt: string
}

interface WhatsAppTemplateCardProps {
  template: WhatsAppTemplate
  onView: (id: string) => void
  onEdit: (id: string) => void
  onDeleteClick: (id: string) => void
}

function getStatusColor(status: string) {
  switch (status.toUpperCase()) {
    case 'PENDING':
      return 'text-yellow-500'
    case 'APPROVED':
      return 'text-green-500'
    case 'REJECTED':
      return 'text-red-500'
    default:
      return 'text-blue-500'
  }
}

function getStatusIcon(status: string) {
  switch (status.toUpperCase()) {
    case 'PENDING':
      return <Clock className={`h-4 w-4 ${getStatusColor(status)}`} />
    case 'APPROVED':
      return <CheckCircle className={`h-4 w-4 ${getStatusColor(status)}`} />
    case 'REJECTED':
      return <XCircle className={`h-4 w-4 ${getStatusColor(status)}`} />
    default:
      return <HelpCircle className={`h-4 w-4 ${getStatusColor(status)}`} /> // Default icon for other statuses
  }
}

function WhatsAppTemplateCard({
  template,
  onView,
  onEdit,
  onDeleteClick,
}: WhatsAppTemplateCardProps) {
  const bodyText =
    template.components.find((c) => c.type === 'BODY')?.text || ''

  return (
    <Card className="w-full rounded-lg h-[250px] flex flex-col">
      <CardContent className="p-5 flex flex-col flex-grow">
        <div className="space-y-3 flex-grow">
          <h3 className="font-medium text-base">{template.name}</h3>
          <p className="text-sm text-gray-600 line-clamp-3">{bodyText}</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <Tag className="h-4 w-4" />
                <span>{template.category}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {getStatusIcon(template.status)}
                <span
                  className={`font-medium ${getStatusColor(template.status)}`}
                >
                  {template.status}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="h-4 w-4" />
                <span>{template.language.toUpperCase()}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>{new Date(template.updatedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0"
                    onClick={() => onView(template.templateId)}
                    aria-label="View template"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0"
                    onClick={() => onEdit(template.templateId)}
                    aria-label="Edit template"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0"
                    onClick={() => onDeleteClick(template.templateId)}
                    aria-label="Delete template"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function WhatsAppTemplatesPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAccount, setSelectedAccount] = useState('all')
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([])
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null)
  const [businessAccounts, setBusinessAccounts] = useState<
    { accountId: string; accountName: string }[]
  >([])

  const fetchTemplates = async (accountId: string) => {
    try {
      if (accountId === 'all') {
        const response = await axiosInstance.post(
          '/api/channels/whatsapp/getAllTemplates',
        )
        setTemplates(response.data)
      } else {
        const response = await axiosInstance.post(
          '/api/channels/whatsapp/getAccountTemplates',
          { accountId },
        )
        setTemplates(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    }
  }

  const fetchData = async () => {
    try {
      const accountsResponse = await axiosInstance.post(
        '/api/channels/whatsapp/getAccountDetails',
      )
      const accounts = accountsResponse.data.info
      setBusinessAccounts([
        { accountId: 'all', accountName: 'All Accounts' },
        ...accounts,
      ])
      await fetchTemplates('all')
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAccountChange = (accountId: string) => {
    setSelectedAccount(accountId)
    fetchTemplates(accountId)
  }

  const handleView = (id: string) => {
    router.push(`/dashboard/whatsapp/template?templateId=${id}&mode=view`)
  }

  const handleEdit = (id: string) => {
    router.push(`/dashboard/whatsapp/template?templateId=${id}&mode=edit`)
  }

  const handleDeleteClick = (id: string) => {
    setTemplateToDelete(id)
    setIsModalOpen(true)
  }

  const handleDelete = async () => {
    if (templateToDelete) {
      try {
        await axiosInstance.post('/api/channels/whatsapp/deleteTemplate', {
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

  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }
  const [isOpen, setIsOpen] = useState(false)
  const handleCreateTemplate = () => {
    setIsOpen(true)
  }

  const filteredTemplates = templates.filter(
    (template) =>
      (selectedAccount === 'all' || template.accountId === selectedAccount) &&
      (template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.components.some((c) =>
          c.text?.toLowerCase().includes(searchQuery.toLowerCase()),
        ) ||
        template.category.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div className="container mx-auto py-4">
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">WhatsApp Templates</h1>
          <WhatsAppTemplateModal open={isOpen} onOpenChange={setIsOpen} />
          <Select value={selectedAccount} onValueChange={handleAccountChange}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Select a business account" />
            </SelectTrigger>
            <SelectContent>
              {businessAccounts.map((account) => (
                <SelectItem key={account.accountId} value={account.accountId}>
                  {account.accountName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between gap-4 mb-4">
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
            <WhatsAppTemplateCard
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
