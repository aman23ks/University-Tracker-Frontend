"use client"

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/providers/AuthProvider'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Home, 
  Search,
  Settings,
  LogOut,
  User,
  Table,
  Crown,
  Users,
  Database,
  BarChart,
  Building,
  MessageCircle
} from 'lucide-react'

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  
  const adminRoutes = [
    {
      href: '/dashboard/admin',
      label: 'Dashboard',
      icon: Home
    },
    {
      href: '/dashboard/admin/universities',
      label: 'Universities',
      icon: Database
    },
    // {
    //   href: '/dashboard/admin/users',
    //   label: 'Users',
    //   icon: Users
    // },
    {
      href: '/dashboard/admin/analytics',
      label: 'Analytics',
      icon: BarChart
    },
    {
      href: '/dashboard/admin/feedback',
      label: 'Feedback',
      icon: MessageCircle
    }
    // {
    //   href: '/dashboard/admin/settings',
    //   label: 'Settings',
    //   icon: Settings
    // }
  ]
  
  const userRoutes = [
    {
      href: '/dashboard/user',
      label: 'Dashboard',
      icon: Home
    },
    {
      href: '/dashboard/user/universities',
      label: 'Universities',
      icon: Building
    },
    // {
    //   href: '/dashboard/user/search',
    //   label: 'Search',
    //   icon: Search
    // },
    {
      href: '/dashboard/user/feedback',
      label: 'Feedback & Support',
      icon: MessageCircle
    },
    {
      href: '/dashboard/user/profile',
      label: 'Profile',
      icon: User
    },
    // {
    //   href: '/dashboard/user/settings',
    //   label: 'Settings',
    //   icon: Settings
    // }
  ]
  
  const routes = user?.is_admin ? adminRoutes : userRoutes
  
  return (
    <div className="flex h-screen flex-col bg-gray-900 w-64">
      <div className="p-6">
        <Link 
          href={user?.is_admin ? '/dashboard/admin' : '/dashboard/user'} 
          className="flex items-center gap-2 text-white mb-8"
        >
          <Table className="h-8 w-8" />
          <span className="text-xl font-bold">UniTracker</span>
          {user?.is_admin && (
            <span className="text-xs bg-blue-500 px-2 py-1 rounded">Admin</span>
          )}
        </Link>
        
        <nav className="space-y-2">
          {routes.map((route) => {
            const Icon = route.icon
            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-white hover:bg-gray-800",
                  pathname === route.href && "bg-gray-800 text-white"
                )}
              >
                <Icon className="h-4 w-4" />
                {route.label}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="mt-auto p-6">
        {!user?.is_admin && !user?.is_premium && (
          <Button
            className="w-full mb-4"
            variant="premium"
            onClick={() => {}}
          >
            <Crown className="h-4 w-4 mr-2" />
            Upgrade to Premium
          </Button>
        )}
        
        <div className="mb-4 px-3 py-2 text-sm text-gray-400">
          <div>Signed in as</div>
          <div className="font-medium text-white">{user?.email}</div>
        </div>

        <Button
          variant="ghost"
          className="w-full text-gray-300 hover:text-white hover:bg-gray-800"
          onClick={logout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  )
}