import React from 'react'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent } from '@/components/ui/dialog'

interface FileUploadProgressProps {
  isOpen: boolean
  value: number
}

const FileUploadProgress: React.FC<FileUploadProgressProps> = ({
  isOpen,
  value,
}) => {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Uploading File</h2>
          <Progress value={value} className="w-full" />
          <p className="text-sm text-muted-foreground">{value}% complete</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default FileUploadProgress
