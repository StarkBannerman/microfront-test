import LocaleSwitcher from '@/components/LocaleSwitcher'
import Link from 'next/link'

export default function Header() {
  return (
    <header className="border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center">
          <h1 className="text-xl font-semibold tracking-tight">Mercuri</h1>
        </Link>
        <div className="flex items-center gap-6">
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  )
}
