'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  MessageSquare,
  PuzzleIcon,
  DollarSign,
  Users,
  Menu,
  Store,
  ChevronDown,
  Building2,
  Bell,
  ChevronLeft,
  MoreHorizontal,
} from 'lucide-react'
import { Wallet } from 'lucide-react'
import { Contact } from 'lucide-react'
import { BarChartIcon as ChartNoAxesCombined } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useAuth } from '@/hooks/useAuth'
import { useEffect } from 'react'
import { SignOutButton } from '@/components/auth/SignOutButton'
import { useSession } from 'next-auth/react'
import type { Session } from 'next-auth'

const basePath = 'dashboard'

interface StoreType {
  instanceId: string
  platform: string
  businessName: string
  website: string
  permissions: Record<string, any>
}

interface NavItem {
  name: string
  icon: React.ElementType
  path: string
  children?: NavItem[]
}

interface UserType {
  accountInfo?: {
    firstName?: string
    lastName?: string
    email?: string
  }
  credits?: number
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const { isAuthenticated, user } = useAuth() as {
    isAuthenticated: boolean
    user: any
  }

  console.log(user)
  const { data: session, status } = useSession() as {
    data: Session | null
    status: 'loading' | 'authenticated' | 'unauthenticated'
  }
  const [stores, setStores] = React.useState<StoreType[]>([])
  const [selectedStore, setSelectedStore] = React.useState<StoreType | null>(
    null,
  )
  const router = useRouter()
  const pathname = usePathname()
  const isConversationsPage = pathname.includes('/conversations')

  const permissions = session?.permissions
  const isMainAccount = session?.isMainAccount
  const sideBarItems: NavItem[] = []

  // Add the SideBar Icons based on Permissions
  if (permissions?.DASHBOARD?.VIEW_DASHBOARD || isMainAccount) {
    sideBarItems.push({
      name: 'Dashboard',
      icon: LayoutDashboard,
      path: `/${basePath}/overview`,
    })
  }

  if (permissions?.CONTACTS?.VIEW_CONTACTS || isMainAccount) {
    sideBarItems.push({
      name: 'Contacts',
      icon: Contact,
      path: `/${basePath}/contacts`,
    })
  }

  if (isMainAccount) {
    sideBarItems.push({
      name: 'Agents',
      icon: Users,
      path: `/${basePath}/agents`,
    })
  }

  if (permissions?.SETTINGS?.BILLING?.VIEW_BILLING_LOGS || isMainAccount) {
    sideBarItems.push({
      name: 'Billing',
      icon: Wallet,
      path: `/${basePath}/billing`,
    })
  }

  if (permissions?.INTEGRATIONS?.VIEW_INTEGRATIONS || isMainAccount) {
    sideBarItems.push({
      name: 'Integrations',
      icon: PuzzleIcon,
      path: `/${basePath}/integrations`,
    })
  }

  if (permissions?.SETTINGS?.LOGS?.VIEW_LOGS || isMainAccount) {
    sideBarItems.push({
      name: 'Logs',
      icon: ChartNoAxesCombined,
      path: `/${basePath}/messagelogs`,
    })
  }

  useEffect(() => {
    if (!isAuthenticated) {
      // router.push('/auth/signin')
    }

    if (session?.connectedInstances && session.connectedInstances.length > 0) {
      setStores(session.connectedInstances)
      setSelectedStore(session.connectedInstances[0])
    }
  }, [isAuthenticated, router, session])

  if (!isAuthenticated) {
    return null
  }

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const NavItem = ({
    item,
    isCollapsed,
  }: {
    item: NavItem
    isCollapsed: boolean
  }) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const isActive =
      pathname === item.path ||
      (item.children && item.children.some((child) => pathname === child.path))

    if (item.children) {
      return isCollapsed ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={item.path}
                className={cn(
                  'flex items-center justify-center rounded-md p-2 transition-colors hover:bg-muted',
                  isActive && 'bg-muted font-medium text-primary',
                )}
              >
                <item.icon className="h-5 w-5" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{item.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-between',
                isActive && 'bg-muted font-medium text-primary',
              )}
            >
              <span className="flex items-center">
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform',
                  isOpen && 'rotate-180',
                )}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="ml-4 mt-1 space-y-1">
            {item.children.map((child) => (
              <Link
                key={child.name}
                href={child.path}
                className={cn(
                  'flex items-center rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted',
                  pathname === child.path
                    ? 'bg-muted font-medium text-primary'
                    : 'text-muted-foreground',
                )}
              >
                <child.icon className="mr-2 h-4 w-4" />
                {child.name}
              </Link>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={item.path}
              className={cn(
                'flex items-center rounded-md px-3 py-2 transition-colors hover:bg-muted',
                isActive
                  ? 'bg-muted font-medium text-primary'
                  : 'text-muted-foreground',
                isCollapsed && 'justify-center',
              )}
            >
              <item.icon className={cn('h-5 w-5', !isCollapsed && 'mr-2')} />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          </TooltipTrigger>
          {isCollapsed && (
            <TooltipContent side="right">
              <p>{item.name}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    )
  }

  const renderSidebar = () => (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col border-r transition-all duration-300 bg-background',
          isCollapsed ? 'w-16' : 'w-64',
        )}
      >
        <div className="flex h-14 items-center px-4 justify-between">
          {!isCollapsed && (
            <>
              <Store className="h-6 w-6 text-primary" />
              <h2 className="text-lg font-semibold">MERCURI</h2>
            </>
          )}
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <ChevronLeft
              className={cn(
                'h-4 w-4 transition-transform',
                isCollapsed && 'rotate-180',
              )}
            />
          </Button>
        </div>
        <div className="flex-1 overflow-auto">
          <nav className="space-y-1 p-2">
            {sideBarItems.map((item) => (
              <NavItem key={item.name} item={item} isCollapsed={isCollapsed} />
            ))}
          </nav>
        </div>
        <div
          className={cn(
            'p-4 border-t',
            isCollapsed ? 'flex justify-center' : '',
          )}
        >
          {isCollapsed ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                    <AvatarFallback>
                      {user.accountInfo?.firstName
                        ? user.accountInfo.lastName
                          ? `${user.accountInfo.firstName[0]}${user.accountInfo.lastName[0]}`.toUpperCase()
                          : user.accountInfo.firstName.slice(0, 2).toUpperCase()
                        : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {`${user.accountInfo?.firstName} ${user.accountInfo?.lastName}` ||
                        'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.accountInfo?.email || 'user@example.com'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <SignOutButton />
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                  <AvatarFallback>
                    {user.accountInfo?.firstName
                      ? user.accountInfo.lastName
                        ? `${user.accountInfo.firstName[0]}${user.accountInfo.lastName[0]}`.toUpperCase()
                        : user.accountInfo.firstName.slice(0, 2).toUpperCase()
                      : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="text-sm font-medium">
                    {`${user.accountInfo?.firstName} ${user.accountInfo?.lastName}` ||
                      'User'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user.accountInfo?.email || 'user@example.com'}
                  </p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <SignOutButton />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden absolute top-2 left-2 z-50"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="border-b p-4">
            <SheetTitle className="flex items-center">
              <Store className="mr-2 h-6 w-6" />
              Mercuri
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-auto py-2">
            <nav className="space-y-1 px-2">
              {sideBarItems.map((item) => (
                <NavItem key={item.name} item={item} isCollapsed={false} />
              ))}
            </nav>
          </div>
          <div className="p-4 border-t">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                  <AvatarFallback>
                    {user.accountInfo?.firstName
                      ? user.accountInfo.lastName
                        ? `${user.accountInfo.firstName[0]}${user.accountInfo.lastName[0]}`.toUpperCase()
                        : user.accountInfo.firstName.slice(0, 2).toUpperCase()
                      : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="text-sm font-medium">
                    {`${user.accountInfo?.firstName} ${user.accountInfo?.lastName}` ||
                      'User'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user.accountInfo?.email || 'user@example.com'}
                  </p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <SignOutButton />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )

  const renderHeader = () => (
    <header className="border-b">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <Select
            value={selectedStore?.instanceId || ''}
            onValueChange={(value) =>
              setSelectedStore(
                stores.find((store) => store.instanceId === value) || null,
              )
            }
          >
            <SelectTrigger className="w-[120px] sm:w-[150px] md:w-[180px]">
              <SelectValue>
                {selectedStore ? (
                  <div className="flex items-center">
                    <Building2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="truncate text-xs sm:text-sm">
                      {selectedStore.businessName}
                    </span>
                  </div>
                ) : (
                  'Select a store'
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {stores.map((store) => (
                <SelectItem key={store.instanceId} value={store.instanceId}>
                  <div className="flex items-center">
                    {store.platform === 'shopify' ? (
                      <Store className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    ) : (
                      <MessageSquare className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    )}
                    <span className="text-xs sm:text-sm">
                      {store.businessName}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-muted-foreground">
            Balance: ${user.credits}
          </span>
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )

  return (
    <div className="flex h-screen bg-background">
      {renderSidebar()}
      <div className="flex flex-1 flex-col overflow-hidden">
        {!isConversationsPage && renderHeader()}
        <main
          className={cn(
            'flex-1 overflow-auto',
            isConversationsPage ? 'p-0' : 'p-6',
          )}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
