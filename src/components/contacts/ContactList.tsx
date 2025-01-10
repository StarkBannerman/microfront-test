'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Eye, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface Segment {
  segmentId: string
  segmentName: string
  segmentSize: number
  date_created: string
  date_updated: string
}

interface ContactPermissions {
  VIEW_CONTACTS: boolean
  MANAGE_CONTACTS: boolean
  UPLOAD_CONTACTS: boolean
  DOWNLOAD_CONTACTS: boolean
  MANAGE_CONTACTS_LABELS: boolean
  VIEW_CONTACT_LIST: boolean
  MANAGE_CONTACT_LIST: boolean
}

export interface SegmentListBuilderProps {
  segments: Segment[]
  getSegments: () => Promise<void>
  contactPermissions?: ContactPermissions
  isMainAccount: boolean
}

export function SegmentListBuilder({
  segments,
  getSegments,
  contactPermissions,
  isMainAccount,
}: SegmentListBuilderProps) {
  const router = useRouter()
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [deleteSegmentId, setDeleteSegmentId] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const itemsPerPage = 5
  const instanceId = 'someInstanceId'

  useEffect(() => {
    if (isMainAccount || contactPermissions?.VIEW_CONTACT_LIST) {
      getSegments()
    }
  }, [isMainAccount, contactPermissions, getSegments])

  const handleOpenDeleteModal = (segmentId: string) => {
    setOpenDeleteModal(true)
    setDeleteSegmentId(segmentId)
  }

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false)
    setDeleteSegmentId('')
  }

  const handleDelete = async () => {
    try {
      const response = await axiosInstance.post(
        '/common/segments/delete-segment',
        { deleteSegmentId },
      )
      if (response.status === 200) {
        handleCloseDeleteModal()
        await getSegments()
      }
    } catch (error) {
      console.error('Error deleting segment:', error)
    }
  }

  const handleViewList = (segmentId: string) => {
    router.push(`/dashboard/contacts/list?listId=${segmentId}`)
  }

  const handlePageChange = useCallback(
    (newPage: number) => {
      const totalPages = Math.ceil(segments.length / itemsPerPage)
      if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage)
      }
    },
    [segments.length],
  )

  const paginatedSegments = segments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  const createPhoneList = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.post(
        `/common/contacts/create-phone-number-list`,
        { instanceId },
      )
      if (response.data) {
        await getSegments()
      }
    } catch (error) {
      console.error('Error creating phone list:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(segments.length / itemsPerPage)

  return (
    <>
      <div className="flex justify-between items-center p-4">
        <h2 className="text-2xl font-bold">Contact Lists</h2>
        {(isMainAccount || contactPermissions?.MANAGE_CONTACT_LIST) && (
          <Button
            variant="default"
            onClick={createPhoneList}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Phone List'}
          </Button>
        )}
      </div>
      <Card className="w-full overflow-hidden">
        <CardContent className="px-4 py-0">
          <div className="w-full h-[400px] max-h-[400px] overflow-hidden flex flex-col">
            <div className="flex-1 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[25%] font-bold text-primary">
                      List Name
                    </TableHead>
                    <TableHead className="w-[15%] font-bold text-primary">
                      No of Contacts
                    </TableHead>
                    <TableHead className="w-[20%] font-bold text-primary">
                      Created On
                    </TableHead>
                    <TableHead className="w-[20%] font-bold text-primary">
                      Updated On
                    </TableHead>
                    <TableHead className="w-[20%] font-bold text-primary">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSegments.map((segment) => (
                    <TableRow key={segment.segmentId}>
                      <TableCell className="font-medium">
                        {segment.segmentName}
                      </TableCell>
                      <TableCell>{segment.segmentSize}</TableCell>
                      <TableCell>
                        {new Date(segment.date_created).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(segment.date_updated).toLocaleDateString()}
                      </TableCell>

                      {(isMainAccount ||
                        contactPermissions?.VIEW_CONTACT_LIST ||
                        contactPermissions?.MANAGE_CONTACT_LIST) && (
                        <TableCell>
                          <div className="flex space-x-2">
                            {(isMainAccount ||
                              contactPermissions?.VIEW_CONTACT_LIST) && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  handleViewList(segment.segmentId)
                                }
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            {(isMainAccount ||
                              contactPermissions?.MANAGE_CONTACT_LIST) && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  handleOpenDeleteModal(segment.segmentId)
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 p-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1}-
                {Math.min(currentPage * itemsPerPage, segments.length)} of{' '}
                {segments.length}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>

        <Dialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Contact List</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this list?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={handleDelete} variant="default">
                Yes, Delete
              </Button>
              <Button onClick={handleCloseDeleteModal} variant="outline">
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </>
  )
}
