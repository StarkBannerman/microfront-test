import { Suspense } from 'react'
import AuthRedirectContent from './AuthRedirect'

export default function AuthRedirectPage() {
  return (
    <Suspense 
      fallback={
        <div className="flex flex-col justify-center items-center w-screen h-screen">
          <div className="h-10 w-10 animate-spin border-4 border-primary border-t-transparent rounded-full" />
        </div>
      }
    >
      <AuthRedirectContent />
    </Suspense>
  )
}
