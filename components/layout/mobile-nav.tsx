'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function MobileNav() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  const routes = [
    {
      href: '/dashboard/user',
      label: 'Dashboard',
      active: pathname === '/dashboard/user',
    },
    {
      href: '/dashboard/user/universities',
      label: 'Universities',
      active: pathname === '/dashboard/user/universities',
    },
    {
      href: '/dashboard/user/profile',
      label: 'Profile',
      active: pathname === '/dashboard/user/profile',
    },
    {
      href: '/dashboard/user/settings',
      label: 'Settings',
      active: pathname === '/dashboard/user/settings',
    },
    ...(user?.is_admin
      ? [
          {
            href: '/dashboard/admin',
            label: 'Admin',
            active: pathname === '/dashboard/admin',
          },
        ]
      : []),
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pl-1 pr-0">
        <div className="px-7">
          <Link
            href="/"
            className="flex items-center"
            onClick={() => setOpen(false)}
          >
            <span className="font-bold">Admit Bridge</span>
          </Link>
        </div>
        <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          <div className="flex flex-col space-y-3">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'text-muted-foreground hover:text-primary',
                  route.active && 'text-primary'
                )}
              >
                {route.label}
              </Link>
            ))}
          </div>
          {!user?.is_premium && (
            <div className="mt-4 pt-4 border-t">
              <Button className="w-full" variant="premium">
                Upgrade to Premium
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}