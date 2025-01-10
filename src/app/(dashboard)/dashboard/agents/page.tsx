'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  PlusIcon,
  UsersIcon,
  UserIcon,
  Trash2Icon,
  ChevronDownIcon,
} from 'lucide-react'
import axiosInstance from '@/lib/axios'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { NoAccess } from '@/components/common/NoAccess'

// Types
type AppInstance = {
  id: string
  name: string
  organizationId: string
  platform: string
  website: string
}

type Permissions = {
  DASHBOARD: {
    VIEW_DASHBOARD: boolean
    MANAGE_DASHBOARD: boolean
  }
  CONTACTS: {
    VIEW_CONTACTS: boolean
    MANAGE_CONTACTS: boolean
    UPLOAD_CONTACTS: boolean
    DOWNLOAD_CONTACTS: boolean
    MANAGE_CONTACTS_LABELS: boolean
    VIEW_CONTACT_LIST: boolean
    MANAGE_CONTACT_LIST: boolean
  }
  INTEGRATIONS: {
    VIEW_INTEGRATIONS: boolean
    MANAGE_INTEGRATIONS: boolean
  }
  MARKETING: {
    SEGMENTS: {
      VIEW_SEGMENTS: boolean
      MANAGE_SEGMENTS: boolean
    }
    CAMPAIGNS: {
      VIEW_CAMPAIGNS: boolean
      MANAGE_CAMPAIGNS: boolean
    }
    WORKFLOWS: {
      VIEW_WORKFLOWS: boolean
      MANAGE_WORKFLOWS: boolean
    }
  }
  SETTINGS: {
    BILLING: {
      VIEW_BILLING_LOGS: boolean
      MANAGE_BILLING: boolean
    }
    USERS: {
      VIEW_USERS: boolean
      MANAGE_USERS: boolean
    }
    LOGS: {
      VIEW_LOGS: boolean
    }
  }
  CONVERSATIONS: {
    [phoneNumberId: string]: {
      VIEW_MESSAGES: boolean
      REPLY_MESSAGES: boolean
      MANAGE_CONVERSATIONS: boolean
      MANAGE_CONTACTS: boolean
    }
  }
}

type AccessScope = {
  instanceId: string
  instanceName: string
  permissions: Permissions
  permissionId?: string
}

type User = {
  id: string
  username: string
  firstName: string
  lastName: string
  email: string
  role: string
  accountStatus: string
  accessScopes: AccessScope[]
}

const INITIAL_PERMISSIONS: Permissions = {
  DASHBOARD: {
    VIEW_DASHBOARD: false,
    MANAGE_DASHBOARD: false,
  },
  CONTACTS: {
    VIEW_CONTACTS: false,
    MANAGE_CONTACTS: false,
    UPLOAD_CONTACTS: false,
    DOWNLOAD_CONTACTS: false,
    MANAGE_CONTACTS_LABELS: false,
    VIEW_CONTACT_LIST: false,
    MANAGE_CONTACT_LIST: false,
  },
  INTEGRATIONS: {
    VIEW_INTEGRATIONS: false,
    MANAGE_INTEGRATIONS: false,
  },
  MARKETING: {
    SEGMENTS: {
      VIEW_SEGMENTS: false,
      MANAGE_SEGMENTS: false,
    },
    CAMPAIGNS: {
      VIEW_CAMPAIGNS: false,
      MANAGE_CAMPAIGNS: false,
    },
    WORKFLOWS: {
      VIEW_WORKFLOWS: false,
      MANAGE_WORKFLOWS: false,
    },
  },
  SETTINGS: {
    BILLING: {
      VIEW_BILLING_LOGS: false,
      MANAGE_BILLING: false,
    },
    USERS: {
      VIEW_USERS: false,
      MANAGE_USERS: false,
    },
    LOGS: {
      VIEW_LOGS: false,
    },
  },
  CONVERSATIONS: {},
}

// Components
const UserList = ({
  users,
  onSelectUser,
  onDeleteUser,
  selectedUserId,
  onAddUserClick,
  searchTerm,
  onSearchChange,
}: {
  users: User[] | null | undefined
  onSelectUser: (user: User) => void
  onDeleteUser: (userId: string) => void
  selectedUserId?: string
  onAddUserClick: () => void
  searchTerm: string
  onSearchChange: (term: string) => void
}) => (
  <div className="space-y-4">
    <Input
      type="text"
      placeholder="Search users..."
      value={searchTerm}
      onChange={(e) => onSearchChange(e.target.value)}
      className="w-full"
    />
    <ScrollArea className="h-[calc(100vh-20rem)] pr-4">
      {!users || users.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-24rem)]">
          <UsersIcon className="h-12 w-12 text-muted-foreground mb-2" />
          <p className="text-muted-foreground mb-4">No users found</p>
          {!searchTerm && (
            <Button
              onClick={onAddUserClick}
              className="bg-primary hover:bg-primary/90 h-8 text-xs"
            >
              <PlusIcon className="mr-2 h-3 w-3" /> Add User
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              className={`p-2 rounded-md cursor-pointer transition-colors ${
                selectedUserId === user.id ? 'bg-accent' : 'hover:bg-accent/50'
              }`}
              onClick={() => onSelectUser(user)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <UserIcon className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-medium text-sm">{`${user.firstName} ${user.lastName}`}</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2 py-1 text-xs',
                          {
                            'bg-yellow-100 text-yellow-800':
                              user.accountStatus === 'invited',
                            'bg-green-100 text-green-800':
                              user.accountStatus === 'active',
                            'bg-gray-100 text-gray-800':
                              user.accountStatus === 'inactive',
                            'bg-red-100 text-red-800':
                              user.accountStatus === 'suspended',
                            'bg-slate-100 text-slate-800':
                              user.accountStatus === 'deleted',
                          },
                        )}
                      >
                        {user.accountStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ScrollArea>
  </div>
)

const AccessScopesSelector = ({
  accessScopes,
  onChange,
}: {
  accessScopes: AccessScope[]
  onChange: (newScopes: AccessScope[]) => void
}) => {
  const [selectedInstanceId, setSelectedInstanceId] = useState<string>(
    accessScopes[0]?.instanceId || '',
  )

  const handlePermissionChange = (path: string[], value: boolean) => {
    const newScopes = accessScopes.map((scope) => {
      if (scope.instanceId === selectedInstanceId) {
        const updatedScope = JSON.parse(JSON.stringify(scope))
        let current: any = updatedScope.permissions
        for (let i = 0; i < path.length - 1; i++) {
          current = current[path[i]]
        }
        current[path[path.length - 1]] = value
        return updatedScope
      }
      return scope
    })
    onChange(newScopes)
  }

  const currentPermissions = accessScopes.find(
    (scope) => scope.instanceId === selectedInstanceId,
  )?.permissions

  if (!currentPermissions) return null

  const renderPermissions = (permissions: any, basePath: string[] = []) => {
    return Object.entries(permissions).map(([key, value]) => {
      const currentPath = [...basePath, key]
      if (typeof value === 'boolean') {
        return (
          <div key={currentPath.join('-')} className="ml-4 py-1">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={currentPath.join('-')}
                checked={value}
                onCheckedChange={(checked) =>
                  handlePermissionChange(currentPath, checked as boolean)
                }
                className="h-4 w-4"
              />
              <Label htmlFor={currentPath.join('-')} className="text-sm">
                {key.replace(/_/g, ' ')}
              </Label>
            </div>
          </div>
        )
      } else if (typeof value === 'object') {
        return (
          <Collapsible key={currentPath.join('-')} className="py-1">
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-sm px-2 py-2 text-sm font-medium hover:bg-muted">
              <span>{key}</span>
              <ChevronDownIcon className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-2 py-1">
              {renderPermissions(value, currentPath)}
            </CollapsibleContent>
          </Collapsible>
        )
      }
      return null
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="instance-select" className="text-sm font-medium">
          {accessScopes.length === 1 ? 'Instance' : 'Select Instance'}
        </Label>
        {accessScopes.length === 1 ? (
          <div className="mt-1 p-2 bg-muted rounded-md text-sm">
            {accessScopes[0].instanceName}
          </div>
        ) : (
          <Select
            value={selectedInstanceId}
            onValueChange={setSelectedInstanceId}
          >
            <SelectTrigger id="instance-select" className="mt-1">
              <SelectValue placeholder="Select an instance" />
            </SelectTrigger>
            <SelectContent>
              {accessScopes.map((scope) => (
                <SelectItem key={scope.instanceId} value={scope.instanceId}>
                  {scope.instanceName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">Permissions</h3>
        <Card>
          <CardContent className="p-2 max-h-[300px] overflow-y-auto">
            <ScrollArea className="h-[250px] pr-2">
              {renderPermissions(currentPermissions)}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

const UserForm = ({
  user,
  onSubmit,
  appInstances,
  id,
}: {
  user?: User
  onSubmit: (user: User & { _delete?: boolean }) => void
  appInstances: AppInstance[]
  id: string
}) => {
  const [formData, setFormData] = useState<User>({
    id: user?.id || '',
    username: user?.username || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    role: user?.role || '',
    accountStatus: user?.accountStatus || '',
    accessScopes:
      user?.accessScopes ||
      appInstances.map((instance) => ({
        instanceId: instance.id,
        instanceName: instance.name,
        permissions: INITIAL_PERMISSIONS,
      })),
  })

  useEffect(() => {
    if (user) {
      setFormData({
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus,
        accessScopes: user.accessScopes,
      })
    } else {
      setFormData({
        id: '',
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        role: '',
        accountStatus: '',
        accessScopes: appInstances.map((instance) => ({
          instanceId: instance.id,
          instanceName: instance.name,
          permissions: INITIAL_PERMISSIONS,
        })),
      })
    }
  }, [user, appInstances])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" id={id}>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-sm font-medium">
            First Name
          </Label>
          <Input
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="h-8 text-sm focus-visible:ring-1 focus-visible:ring-offset-0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-sm font-medium">
            Last Name
          </Label>
          <Input
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="h-8 text-sm focus-visible:ring-1 focus-visible:ring-offset-0"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="h-8 text-sm focus-visible:ring-1 focus-visible:ring-offset-0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role" className="text-sm font-medium">
            Role
          </Label>
          <Input
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            className="h-8 text-sm focus-visible:ring-1 focus-visible:ring-offset-0"
          />
        </div>
      </div>
      <AccessScopesSelector
        accessScopes={formData.accessScopes}
        onChange={(newScopes) =>
          setFormData({ ...formData, accessScopes: newScopes })
        }
      />
    </form>
  )
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [appInstances, setAppInstances] = useState<AppInstance[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const permissions =
    session && 'permissions' in session ? session.permissions : undefined
  const isMainAccount =
    session && 'isMainAccount' in session ? session.isMainAccount : false

  useEffect(() => {
    if (isMainAccount) {
      fetchUsers()
    }
  }, [isMainAccount])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const response = await axiosInstance.post('/api/users/get-users')
      const usersData = response.data.users.map((user: any) => ({
        id: user.userId,
        username: user.email,
        firstName: user.accountInfo.firstName,
        lastName: user.accountInfo.lastName,
        email: user.email,
        role: user.organizationUserPermissions[0].userType,
        accountStatus: user.accountStatus,
        accessScopes: user.organizationUserPermissions.map(
          (permission: any) => {
            const matchingApp = response.data.apps.find(
              (app: any) => app.instanceId === permission.instanceId,
            )
            return {
              instanceId: permission.instanceId,
              instanceName: matchingApp?.businessName || 'Unknown Instance',
              permissions: permission.permissions,
              permissionId: permission.permissionId,
            }
          },
        ),
      }))
      setUsers(usersData)
      const instances = response.data.apps.map((app: any) => ({
        id: app.instanceId,
        name: app.businessName,
        organizationId: app.organizationId,
        platform: app.platform,
        website: app.website,
      }))
      setAppInstances(instances)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch users. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateUser = async (newUser: User) => {
    try {
      await axiosInstance.post('/api/users/invite-user', newUser)
      setIsCreating(false)
      await fetchUsers()
      toast({
        title: 'Success',
        description: 'User created successfully.',
      })
    } catch (error) {
      console.error('Error creating user:', error)
      toast({
        title: 'Error',
        description: 'Failed to create user. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleUpdateUser = async (
    updatedUser: User & { _delete?: boolean },
  ) => {
    try {
      if (updatedUser._delete) {
        await handleDeleteUser(updatedUser.id)
        return
      }
      await axiosInstance.post(`/api/users/update-user`, {
        userId: updatedUser.id,
        username: updatedUser.username,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        role: updatedUser.role,
        accessScopes: updatedUser.accessScopes.map((scope) => ({
          instanceId: scope.instanceId,
          permissionId: scope.permissionId,
          permissions: scope.permissions,
        })),
      })
      setSelectedUser(null)
      await fetchUsers()
      toast({
        title: 'Success',
        description: 'User updated successfully.',
      })
    } catch (error) {
      console.error('Error updating user:', error)
      toast({
        title: 'Error',
        description: 'Failed to update user. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      await axiosInstance.post(`/api/users/delete-user`, { userId })
      setUsers(users.filter((user) => user.id !== userId))
      if (selectedUser?.id === userId) {
        setSelectedUser(null)
      }
      toast({
        title: 'Success',
        description: 'User deleted successfully.',
      })
    } catch (error) {
      console.error('Error deleting user:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete user. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleAddUserClick = () => {
    setSelectedUser(null)
    setIsCreating(true)
  }

  const handleSelectUser = (user: User) => {
    setIsCreating(false)
    setSelectedUser(user)
  }

  return !isMainAccount ? (
    <NoAccess />
  ) : (
    <div className="flex flex-col p-4 gap-4 h-full">
      <header className="flex justify-between items-center shrink-0">
        <h1 className="text-2xl font-bold text-primary">Manage Users</h1>
        {users.length > 0 && (
          <Button
            onClick={handleAddUserClick}
            className="bg-primary hover:bg-primary/90 h-8 text-xs"
          >
            <PlusIcon className="mr-2 h-3 w-3" /> Add User
          </Button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-0 flex-1">
        <Card className="md:col-span-1 overflow-hidden">
          <CardHeader className="p-4">
            <CardTitle className="text-lg">User List</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <p>Loading users...</p>
              </div>
            ) : (
              <UserList
                users={users.filter(
                  (user) =>
                    user.firstName
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    user.lastName
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    user.email.toLowerCase().includes(searchTerm.toLowerCase()),
                )}
                onSelectUser={handleSelectUser}
                onDeleteUser={handleDeleteUser}
                selectedUserId={selectedUser?.id}
                onAddUserClick={handleAddUserClick}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2 overflow-hidden flex flex-col">
          <CardHeader className="p-4">
            <CardTitle className="text-lg">
              {isCreating
                ? 'Create User'
                : selectedUser
                  ? 'Edit User'
                  : 'User Details'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex-grow overflow-hidden flex flex-col">
            <ScrollArea className="h-[calc(100vh-16rem)] md:h-[calc(100vh-14rem)] flex-grow">
              {isCreating ? (
                <UserForm
                  onSubmit={handleCreateUser}
                  appInstances={appInstances}
                  id="userForm"
                />
              ) : selectedUser ? (
                <UserForm
                  user={selectedUser}
                  onSubmit={handleUpdateUser}
                  appInstances={appInstances}
                  id="userForm"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <UsersIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h2 className="mt-2 text-xl font-semibold">
                      No User Selected
                    </h2>
                    <p className="text-muted-foreground">
                      Select a user to edit or create a new one.
                    </p>
                  </div>
                </div>
              )}
            </ScrollArea>
            {(isCreating || selectedUser) && (
              <div className="pt-4 pb-2 flex justify-end space-x-2">
                {selectedUser && (
                  <Button
                    type="button"
                    variant="destructive"
                    className="h-8 text-xs"
                    onClick={() =>
                      handleUpdateUser({ ...selectedUser, _delete: true })
                    }
                  >
                    Delete User
                  </Button>
                )}
                <Button
                  type="submit"
                  form="userForm"
                  className="bg-primary hover:bg-primary/90 h-8 text-xs"
                >
                  {isCreating ? 'Create User' : 'Update User'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
