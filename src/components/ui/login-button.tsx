import { Button } from '@/components/ui/button'
import { Facebook } from 'lucide-react'

interface LoginButtonProps {
  provider: 'facebook'
  onClick: () => void
  children: React.ReactNode
}

export function LoginButton({ provider, onClick, children }: LoginButtonProps) {
  return (
    <Button
      className="w-full bg-[#1877F2] hover:bg-[#166fe5] text-white"
      onClick={onClick}
    >
      {provider === 'facebook' && <Facebook className="mr-2 h-4 w-4" />}
      {children}
    </Button>
  )
}
