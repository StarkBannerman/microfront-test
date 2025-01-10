'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'
import axiosInstance from '@/lib/axios'

interface WhatsAppAccount {
  accountId: string
  accountName: string
}

interface WhatsAppTemplateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WhatsAppTemplateModal({
  open,
  onOpenChange,
}: WhatsAppTemplateModalProps) {
  const [accounts, setAccounts] = useState<WhatsAppAccount[]>([])
  const [selectedAccount, setSelectedAccount] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const accountsResponse = await axiosInstance.post(
          '/api/channels/whatsapp/getAccountDetails',
        )
        const accounts = accountsResponse.data.info
        setAccounts(accounts)
      } catch (error) {
        console.error('Error fetching WhatsApp accounts:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAccounts()
  }, [])

  const handleCreateTemplate = () => {
    if (selectedAccount) {
      router.push(
        `/dashboard/whatsapp/template?accountId=${selectedAccount}&mode=create`,
      )
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create WhatsApp Template</DialogTitle>
          <DialogDescription>
            Select a WhatsApp Business Account to create a new template.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Select
              disabled={isLoading}
              onValueChange={(value) => setSelectedAccount(value)}
            >
              <SelectTrigger className="col-span-4">
                <SelectValue placeholder="Select a WhatsApp account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.accountId} value={account.accountId}>
                    {account.accountName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleCreateTemplate} disabled={!selectedAccount}>
            Create Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
