'use client'
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { AxiosInstance } from 'axios'
import axiosInstance from '@/lib/axios'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  X,
} from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { SegmentListBuilder } from '@/components/contacts/ContactList'
import { Progress } from '@/components/ui/progress'
import { VisuallyHidden } from '@/components/ui/visually-hidden'
import { useSession } from 'next-auth/react'
import { NoAccess } from '@/components/common/NoAccess'

interface Contact {
  contactId: string
  firstName: string
  lastName: string
  phone: string
  email: string
  lastActivityDate: string
  subscriptionStatus: string
  source?: string
  notes?: string
  labels?: string[]
}

interface Label {
  labelId: string
  name: string
}

interface Segment {
  segmentId: string
  segmentName: string
  segmentSize: number
  date_created: string
  date_updated: string
}

type ContactPermissions = {
  VIEW_CONTACTS: boolean
  MANAGE_CONTACTS: boolean
  UPLOAD_CONTACTS: boolean
  DOWNLOAD_CONTACTS: boolean
  MANAGE_CONTACTS_LABELS: boolean
  VIEW_CONTACT_LIST: boolean
  MANAGE_CONTACT_LIST: boolean
}

interface CustomSession {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  expires: string
  permissions?: {
    CONTACTS?: ContactPermissions
  }
  isMainAccount?: boolean
}

const ContactRow: React.FC<{
  contact: Contact
  isSelected: boolean
  isMainAccount: boolean
  contactPermissions: ContactPermissions | undefined
  onClick: (contact: Contact) => void
  onSelect: (contactId: string, isSelected: boolean) => void
}> = React.memo(
  ({
    contact,
    isSelected,
    contactPermissions,
    isMainAccount,
    onClick,
    onSelect,
  }) => (
    <TableRow
      className={`transition-colors duration-150 hover:bg-muted/50 cursor-pointer ${
        isSelected ? 'bg-muted' : ''
      }`}
    >
      {(isMainAccount || contactPermissions?.MANAGE_CONTACTS) && (
        <TableCell>
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) =>
              onSelect(contact.contactId, checked as boolean)
            }
            onClick={(e) => e.stopPropagation()}
          />
        </TableCell>
      )}
      <TableCell
        className="truncate max-w-[150px]"
        title={contact.firstName}
        onClick={() => onClick(contact)}
      >
        {contact.firstName ?? ''}
      </TableCell>
      <TableCell
        className="truncate max-w-[150px]"
        title={contact.lastName}
        onClick={() => onClick(contact)}
      >
        {contact.lastName ?? ''}
      </TableCell>
      <TableCell
        className="truncate max-w-[200px]"
        title={contact.phone}
        onClick={() => onClick(contact)}
      >
        {contact.phone ?? ''}
      </TableCell>
      <TableCell
        className="truncate max-w-[300px]"
        title={contact.email}
        onClick={() => onClick(contact)}
      >
        {contact.email ?? ''}
      </TableCell>
      <TableCell
        className="truncate max-w-[180px]"
        title={
          contact.lastActivityDate
            ? new Date(contact.lastActivityDate).toLocaleDateString()
            : ''
        }
        onClick={() => onClick(contact)}
      >
        {contact.lastActivityDate
          ? new Date(contact.lastActivityDate).toLocaleDateString()
          : ''}
      </TableCell>
      <TableCell onClick={() => onClick(contact)}>
        <Badge
          variant={
            contact.subscriptionStatus?.toLowerCase() === 'subscribed'
              ? 'default'
              : contact.subscriptionStatus?.toLowerCase() ===
                  'no_subscription_status'
                ? 'outline'
                : 'secondary'
          }
        >
          {contact.subscriptionStatus?.toLowerCase() ===
          'no_subscription_status'
            ? 'No Status'
            : (contact.subscriptionStatus ?? 'No Status')}
        </Badge>
      </TableCell>
    </TableRow>
  ),
)

async function getSegments(axiosInstance: AxiosInstance): Promise<Segment[]> {
  try {
    const response = await axiosInstance.post('/api/segments/get-segments')
    return response.data
  } catch (error) {
    console.error('Error fetching segments:', error)
    return []
  }
}

async function getLabels(axiosInstance: AxiosInstance): Promise<Label[]> {
  try {
    const response = await axiosInstance.post('/api/contacts/get-labels')
    return response?.data?.labels || []
  } catch (error) {
    console.error('Error fetching labels:', error)
    return []
  }
}

export default function ContactsPage() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [selectedContacts, setSelectedContacts] = useState<{
    [page: number]: string[]
  }>({})
  const [isRightNavOpen, setIsRightNavOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalRows, setTotalRows] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [duplicateContacts, setDuplicateContacts] = useState<Contact[]>([])
  const [showDuplicatesBanner, setShowDuplicatesBanner] = useState(true)
  const [segments, setSegments] = useState<Segment[]>([])
  const [isCreateListDialogOpen, setIsCreateListDialogOpen] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [labels, setLabels] = useState<Label[]>([])
  const [currentTab, setCurrentTab] = useState('contacts')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalLoader, setModalLoader] = useState(false)
  const [totalContacts, setTotalContacts] = useState(0)
  const [syncedCount, setSyncedCount] = useState(0)
  const [pollingActive, setPollingActive] = useState(false)
  const [infinityPolling, setInfinityPolling] = useState(false)
  const [showContactsFlag, setShowContactsFlag] = useState(false)
  const { data: session, status } = useSession() as {
    data: CustomSession | null
    status: string
  }
  const contactPermissions = session?.permissions?.CONTACTS
  const isMainAccount = session?.isMainAccount ?? false // Update: Added ?? false

  const contactsPerPage = 10
  const instanceId = 'your-instance-id' // Replace with actual instance ID

  const fetchContacts = useCallback(
    async (page: number) => {
      setIsLoading(true)
      try {
        const response = await axiosInstance.post(
          '/api/contacts/get-contacts',
          {
            page: page,
            limit: contactsPerPage,
          },
        )
        if (
          response.status === 200 &&
          response.data &&
          response.data.response
        ) {
          setContacts(response.data.response.contacts || [])
          setTotalRows(response.data.response.totalRows || 0)
          setTotalPages(response.data.response.totalPages || 1)
          setDuplicateContacts(response.data.duplicateContacts || [])
        } else {
          console.error('Unexpected response structure:', response)
          setContacts([])
          setTotalRows(0)
          setTotalPages(1)
          setDuplicateContacts([])
        }
      } catch (error) {
        console.error('Error fetching contacts:', error)
        setContacts([])
        setTotalRows(0)
        setTotalPages(1)
        setDuplicateContacts([])
      } finally {
        setIsLoading(false)
      }
    },
    [contactsPerPage],
  )

  useEffect(() => {
    const fetchInitialData = async () => {
      const [fetchedSegments, fetchedLabels] = await Promise.all([
        getSegments(axiosInstance),
        getLabels(axiosInstance),
      ])
      setSegments(fetchedSegments)
      setLabels(fetchedLabels)
    }
    if (isMainAccount || contactPermissions?.VIEW_CONTACTS) {
      fetchInitialData()
    }
  }, [isMainAccount, contactPermissions])

  useEffect(() => {
    if (isMainAccount || contactPermissions?.VIEW_CONTACTS) {
      fetchContacts(currentPage)
    }
  }, [currentPage, fetchContacts, isMainAccount, contactPermissions])

  const handleContactClick = useCallback((contact: Contact) => {
    setSelectedContact(contact)
    setIsRightNavOpen(true)
  }, [])

  const handleContactSelect = useCallback(
    (contactId: string, isSelected: boolean) => {
      setSelectedContacts((prev) => ({
        ...prev,
        [currentPage]: isSelected
          ? [...(prev[currentPage] || []), contactId]
          : (prev[currentPage] || []).filter((id) => id !== contactId),
      }))
      // Close the sidebar when a contact is selected
      setIsRightNavOpen(false)
    },
    [currentPage],
  )

  const handleSelectAllOnPage = useCallback(() => {
    const allSelected = contacts.every((contact) =>
      selectedContacts[currentPage]?.includes(contact.contactId),
    )
    setSelectedContacts((prev) => ({
      ...prev,
      [currentPage]: allSelected
        ? []
        : contacts.map((contact) => contact.contactId),
    }))
  }, [contacts, currentPage, selectedContacts])

  const handlePageChange = useCallback(
    (pageNumber: number) => {
      const maxPage = Math.ceil(totalRows / contactsPerPage)
      if (pageNumber >= 1 && pageNumber <= maxPage) {
        setCurrentPage(pageNumber)
      }
    },
    [totalRows, contactsPerPage],
  )

  const memoizedContacts = useMemo(() => contacts, [contacts])

  const handleSyncContacts = async () => {
    try {
      setModalLoader(true)
      const response = await axiosInstance.post(
        `/api/contacts/fetch-platform-contacts`,
        { instanceId },
      )
      if (response.status === 200) {
        const total = response?.data?.totalContacts || 0
        setTotalContacts(total)
        setModalOpen(true)
        response?.data?.totalContacts
          ? setPollingActive(true)
          : setInfinityPolling(true)

        setShowContactsFlag(true)
      }
    } catch (error) {
      console.error('Error syncing contacts:', error)
    } finally {
      setModalLoader(false)
    }
  }

  const getContactCount = async () => {
    try {
      const response = await axiosInstance.post(
        `/api/contacts/get-contacts-count`,
        { instanceId },
      )
      if (response.status === 200) {
        const count = response.data.count
        setSyncedCount(count)
        return count
      }
    } catch (error) {
      console.error('Error getting contact count:', error)
    } finally {
      setIsLoading(false)
    }
    return 0
  }

  const poll = async () => {
    if (pollingActive) {
      const count = await getContactCount()
      setSyncedCount(count)

      if (count >= totalContacts) {
        setPollingActive(false)
        fetchContacts(currentPage)
      } else {
        setTimeout(poll, 10000)
      }
    }
  }

  const infinityPoll = async () => {
    if (infinityPolling) {
      const initialCount = await getContactCount()
      console.log('Initial Count:', initialCount, 'Synced Count:', syncedCount)
      await new Promise((resolve) => setTimeout(resolve, 10000))
      const updatedCount = await getContactCount()
      console.log('Updated Count after 10 seconds:', updatedCount)
      if (updatedCount === initialCount) {
        setInfinityPolling(false)
        setModalOpen(false)
        fetchContacts(currentPage)
      } else {
        setSyncedCount(updatedCount)
        setTimeout(infinityPoll, 10000)
      }
    }
  }

  useEffect(() => {
    if (infinityPolling) {
      infinityPoll()
    }
  }, [infinityPolling])

  useEffect(() => {
    if (pollingActive) {
      poll()
    }
  }, [pollingActive])

  const handleCreateContactList = useCallback(async () => {
    try {
      const allSelectedContactIds = Object.values(selectedContacts).flat()
      if (allSelectedContactIds.length === 0) {
        console.error('No contacts selected')
        return
      }
      const response = await axiosInstance.post(
        '/api/contacts/create-contact-list',
        {
          contactIds: allSelectedContactIds,
          listName: newListName,
        },
      )
      if (response.status === 200) {
        setIsCreateListDialogOpen(false)
        setNewListName('')
        setSelectedContacts({})
        const newSegments = await getSegments(axiosInstance)
        setSegments(newSegments)
        fetchContacts(currentPage)
      }
    } catch (error) {
      console.error('Error creating contact list:', error)
    }
  }, [selectedContacts, newListName, currentPage, fetchContacts])

  const findLabelNameById = useCallback(
    (labelId: string) => {
      const label = labels.find((label) => label?.labelId === labelId)
      return label ? label?.name : 'Unknown'
    },
    [labels],
  )

  const Sidebar: React.FC<{
    contact: Contact | null
    onClose: () => void
    findLabelNameById: (labelId: string) => string
    currentTab: string
  }> = React.memo(({ contact, onClose, findLabelNameById, currentTab }) => {
    if (!contact || currentTab !== 'contacts') return null

    return (
      <div className="fixed inset-y-0 right-0 w-full sm:w-[320px] xl:w-[360px] bg-background border-l border-border overflow-auto z-50 lg:z-auto transition-transform duration-300 ease-in-out transform translate-x-0">
        <div className="p-4">
          <div className="flex justify-end items-center mb-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close sidebar</span>
            </Button>
          </div>
          <Tabs defaultValue="account">
            <TabsList className="hidden">
              <TabsTrigger value="account">Account Info</TabsTrigger>
            </TabsList>
            <TabsContent value="account">
              <ScrollArea className="h-[calc(100vh-80px)]">
                <div className="space-y-4 pr-2">
                  <div className="flex flex-col items-center text-center p-4 bg-muted rounded-lg">
                    <Avatar className="h-16 w-16 border-2 border-primary mb-3">
                      <AvatarImage
                        src="/placeholder.svg?height=64&width=64"
                        alt={`${contact.firstName} ${contact.lastName}`}
                      />
                      <AvatarFallback>
                        {contact.firstName?.[0] ?? ''}
                        {contact.lastName?.[0] ?? ''}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h2 className="text-xl font-bold">
                        {contact.firstName ?? ''} {contact.lastName ?? ''}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {contact.source ?? ''}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 p-4 bg-muted rounded-lg">
                    <h3 className="text-md font-semibold">
                      Contact Information
                    </h3>
                    <div className="grid gap-2">
                      <div className="flex items-center gap-2 break-all">
                        <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <a
                          href={`mailto:${contact.email}`}
                          className="text-sm hover:underline"
                        >
                          {contact.email ?? ''}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 break-all">
                        <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <a
                          href={`tel:${contact.phone}`}
                          className="text-sm hover:underline"
                        >
                          {contact.phone ?? ''}
                        </a>
                      </div>
                    </div>
                  </div>

                  {(isMainAccount ||
                    contactPermissions?.MANAGE_CONTACTS_LABELS) && (
                    <div className="space-y-3 p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between">
                        <h3 className="text-md font-semibold">Tags</h3>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {contact.labels && contact.labels.length > 0 ? (
                          contact.labels.map((labelId) => (
                            <Badge
                              key={labelId}
                              variant="outline"
                              className="px-2 py-0.5 text-xs"
                            >
                              {findLabelNameById(labelId)}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-0 ml-1"
                              >
                                <X className="h-2 w-2" />
                                <span className="sr-only">Remove tag</span>
                              </Button>
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No tags yet.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    )
  })

  return isMainAccount || contactPermissions?.VIEW_CONTACTS ? (
    <div className="w-full max-w-full p-2 sm:p-4">
      <div
        className={`transition-all duration-300 ${
          isRightNavOpen ? 'lg:mr-[320px] xl:mr-[360px]' : ''
        }`}
      >
        <header className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Contacts</h1>
              <p className="text-sm text-muted-foreground">
                Effortlessly manage your contacts in one unified view.
              </p>
            </div>
            {(isMainAccount || contactPermissions?.MANAGE_CONTACTS) && (
              <Button
                variant="outline"
                onClick={handleSyncContacts}
                className="flex items-center"
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Sync Contacts
              </Button>
            )}
          </div>
          {Object.values(selectedContacts).flat().length > 0 && (
            <div className="bg-muted/50 p-4 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {Object.values(selectedContacts).flat().length} contacts
                  selected
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateListDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Contact List
                </Button>
              </div>
            </div>
          )}
        </header>

        {duplicateContacts.length > 0 && showDuplicatesBanner && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Duplicate Contacts Found</AlertTitle>
            <AlertDescription>
              We found {duplicateContacts.length} duplicates in your contacts.{' '}
              <Button
                variant="link"
                className="p-0"
                onClick={() => setShowDuplicatesBanner(false)}
              >
                Manage
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="contacts" onValueChange={setCurrentTab}>
          {(isMainAccount || contactPermissions?.VIEW_CONTACT_LIST) && (
            <TabsList>
              <TabsTrigger value="contacts">Contacts</TabsTrigger>

              {(isMainAccount || contactPermissions?.VIEW_CONTACT_LIST) && (
                <TabsTrigger value="contact-lists">Contact Lists</TabsTrigger>
              )}
            </TabsList>
          )}
          <TabsContent value="contacts">
            <Card className="w-full overflow-hidden mb-8">
              <CardContent className="px-4 py-0">
                <div className="w-full h-[500px] max-h-[500px] overflow-hidden flex flex-col">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <p>Loading contacts...</p>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-auto pb-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {(isMainAccount ||
                              contactPermissions?.MANAGE_CONTACTS) && (
                              <TableHead className="w-[5%]">
                                <Checkbox
                                  checked={
                                    contacts.length > 0 &&
                                    contacts.every((contact) =>
                                      selectedContacts[currentPage]?.includes(
                                        contact.contactId,
                                      ),
                                    )
                                  }
                                  onCheckedChange={handleSelectAllOnPage}
                                />
                              </TableHead>
                            )}
                            <TableHead className="font-bold text-primary flex-1">
                              First Name
                            </TableHead>
                            <TableHead className="font-bold text-primary flex-1">
                              Last Name
                            </TableHead>
                            <TableHead className="font-bold text-primary flex-1">
                              Phone
                            </TableHead>
                            <TableHead className="font-bold text-primary flex-1">
                              Email
                            </TableHead>
                            <TableHead className="font-bold text-primary flex-1">
                              Last Interaction
                            </TableHead>
                            <TableHead className="font-bold text-primary flex-1">
                              Subscription
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {memoizedContacts
                            .slice(0, contactsPerPage)
                            .map((contact) => (
                              <ContactRow
                                key={contact.contactId}
                                contact={contact}
                                isSelected={selectedContacts[
                                  currentPage
                                ]?.includes(contact.contactId)}
                                onClick={handleContactClick}
                                onSelect={handleContactSelect}
                                contactPermissions={contactPermissions}
                                isMainAccount={isMainAccount}
                              />
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                  <div className="flex items-center justify-end space-x-2 p-2 border-t mt-auto">
                    <div className="text-sm text-muted-foreground">
                      Showing {(currentPage - 1) * contactsPerPage + 1}-
                      {Math.min(currentPage * contactsPerPage, totalRows)} of{' '}
                      {totalRows}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || isLoading}
                        aria-label="Previous page"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={
                          currentPage * contactsPerPage >= totalRows ||
                          isLoading
                        }
                        aria-label="Next page"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="contact-lists">
            <SegmentListBuilder
              segments={segments}
              contactPermissions={contactPermissions}
              isMainAccount={isMainAccount}
              getSegments={async () => {
                const newSegments = await getSegments(axiosInstance)
                setSegments(newSegments)
              }}
            />
          </TabsContent>
        </Tabs>
      </div>

      {isRightNavOpen && selectedContact && (
        <Sidebar
          contact={selectedContact}
          onClose={() => setIsRightNavOpen(false)}
          findLabelNameById={findLabelNameById}
          currentTab={currentTab}
        />
      )}

      <Dialog
        open={isCreateListDialogOpen}
        onOpenChange={setIsCreateListDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Contact List</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="list-name" className="text-right">
                List Name
              </Label>
              <Input
                id="list-name"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateContactList}>Create List</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <VisuallyHidden>
              <DialogTitle>Syncing Contacts</DialogTitle>
            </VisuallyHidden>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">
            {modalLoader ? (
              <div className="flex justify-center items-center h-20">
                <div className="loading-dots">
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
              </div>
            ) : totalContacts > 0 ? (
              <>
                <div className="mb-2">
                  <p>
                    Total Contacts Synced: {syncedCount} / {totalContacts}
                  </p>
                </div>
                <Progress
                  value={(syncedCount / totalContacts) * 100}
                  className="w-full"
                />
              </>
            ) : (
              <>
                <div className="mb-2">
                  <p>Total Contacts Synced: {syncedCount}</p>
                </div>
                <Progress value={100} className="w-full" />
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  ) : (
    <NoAccess />
  )
}
