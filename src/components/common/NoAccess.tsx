import { ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function NoAccess() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-gray-50">
      <div className="max-w-md w-full space-y-6 text-center px-4">
        <div className="flex flex-col items-center">
          <ShieldAlert className="h-20 w-20 text-red-500 mb-4" />
          <h2 className="text-3xl font-bold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-sm text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            If you believe this is an error, please contact your administrator
            or try logging in again.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/auth/signin">Log In Again</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
