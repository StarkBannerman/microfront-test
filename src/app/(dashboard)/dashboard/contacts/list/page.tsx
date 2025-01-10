'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import axiosInstance from '@/lib/axios'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface Contact {
  contactId: string
  firstName: string
  lastName: string
  phone: string
  email: string
  createdDate: string
  subscriptionStatus: string
}

interface Segment {
  _id: string
  segmentId: string
  instanceId: string
  segmentName: string
  segmentSize: number
  date_created: string
  date_updated: string
  contactIds: string[]
}

interface CustomSession {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  expires: string
  permissions?: {
    CONTACTS?: {
      VIEW_CONTACT_LIST?: boolean
    }
    MARKETING?: {
      SEGMENTS?: {
        [key: string]: boolean
      }
    }
  }
  isMainAccount?: boolean
}

export default function ViewContactList() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [segment, setSegment] = useState<Segment | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const router = useRouter()
  const searchParams = useSearchParams()
  const listId = searchParams.get('listId')
  const { data: session, status } = useSession() as {
    data: CustomSession | null
    status: string
  }
  const contactPermissions = session?.permissions?.CONTACTS
  const segmentPermissions = session?.permissions?.MARKETING?.SEGMENTS
  const isMainAccount = session?.isMainAccount

  const contactsPerPage = 10

  useEffect(() => {
    if (isMainAccount || contactPermissions?.VIEW_CONTACT_LIST) {
      fetchContacts()
    }
  }, [isMainAccount, contactPermissions])

  const fetchContacts = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.post(
        '/api/contacts/get-contacts-by-segment',
        {
          segmentId: listId,
        },
      )

      console.log(response)
      if (response.status === 200) {
        setSegment(response.data.segment)
        setContacts(response.data.contacts)
      }
    } catch (error) {
      console.error('Error fetching contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalPages = useMemo(
    () => Math.ceil(contacts.length / contactsPerPage),
    [contacts, contactsPerPage],
  )

  const currentContacts = useMemo(() => {
    const startIndex = (currentPage - 1) * contactsPerPage
    return contacts.slice(startIndex, startIndex + contactsPerPage)
  }, [contacts, currentPage, contactsPerPage])

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <header className="mb-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1.5">
            {segment && (
              <>
                <h1 className="text-2xl font-semibold tracking-tight">
                  {segment.segmentName}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Created on{' '}
                  {new Date(segment.date_created).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </>
            )}
          </div>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center"
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </div>
      </header>

      <Card className="w-full overflow-hidden mb-4">
        <CardContent className="p-0">
          <div className="w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[15%]">First Name</TableHead>
                  <TableHead className="w-[15%]">Last Name</TableHead>
                  <TableHead className="w-[20%]">Phone</TableHead>
                  <TableHead className="w-[25%]">Email</TableHead>
                  <TableHead className="w-[15%]">Created Date</TableHead>
                  <TableHead className="w-[10%]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : currentContacts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No contacts found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentContacts.map((contact) => (
                    <TableRow key={contact.contactId}>
                      <TableCell className="font-medium">
                        {contact.firstName}
                      </TableCell>
                      <TableCell>{contact.lastName}</TableCell>
                      <TableCell>{contact.phone}</TableCell>
                      <TableCell>{contact.email}</TableCell>
                      <TableCell>
                        {new Date(contact.createdDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            contact.subscriptionStatus.toLowerCase() ===
                            'subscribed'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {contact.subscriptionStatus}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4 px-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {contacts.length > 0 &&
                `Showing ${(currentPage - 1) * contactsPerPage + 1}-${Math.min(currentPage * contactsPerPage, contacts.length)} of ${contacts.length}`}
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous page</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next page</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
