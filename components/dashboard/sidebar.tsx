'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  Users,
  Package,
  BarChart2,
  Settings,
  CreditCard,
  MessageSquare,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { UiT } from '@/lib/i18n'

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  href: string
  label: string
  icon: React.ElementType
  active: boolean
  onClick?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
        active
          ? 'gradient-primary text-white shadow-md shadow-primary/25'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  )
}

export default function Sidebar({ t }: { t: UiT['nav'] }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = [
    { href: '/dashboard', label: t.dashboard, icon: LayoutDashboard },
    { href: '/invoices', label: t.invoices, icon: FileText },
    { href: '/estimations', label: t.estimations, icon: ClipboardList },
    { href: '/clients', label: t.clients, icon: Users },
    { href: '/products', label: t.products, icon: Package },
    { href: '/analytics', label: t.analytics, icon: BarChart2 },
    { href: '/settings', label: t.settings, icon: Settings },
    { href: '/billing', label: t.billing, icon: CreditCard },
    { href: '/chat', label: t.chat, icon: MessageSquare },
  ]

  const nav = (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => (
        <NavItem
          key={item.href}
          {...item}
          active={pathname === item.href || pathname.startsWith(item.href + '/')}
          onClick={() => setMobileOpen(false)}
        />
      ))}
      <div className="mt-4 border-t border-border pt-4">
        <Link
          href="/logout"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
          onClick={() => setMobileOpen(false)}
        >
          <LogOut className="h-4 w-4" />
          {t.logout}
        </Link>
      </div>
    </nav>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-sidebar p-5 lg:flex">
        <Link href="/" className="mb-7 flex items-center gap-2.5 font-semibold">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-primary">
            <FileText className="h-4 w-4 text-white" />
          </div>
          <span className="tracking-tight text-foreground">Made Me Invoice</span>
        </Link>
        {nav}
      </aside>

      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-border bg-background px-5 py-3.5 lg:hidden">
        <Link href="/" className="flex items-center gap-2.5 font-semibold">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-primary">
            <FileText className="h-4 w-4 text-white" />
          </div>
          <span className="tracking-tight text-foreground">Made Me Invoice</span>
        </Link>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-sidebar p-5 shadow-2xl">
            <div className="mb-7 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2.5 font-semibold">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-primary">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <span className="tracking-tight text-foreground">Made Me Invoice</span>
              </Link>
              <Button variant="ghost" size="icon-sm" onClick={() => setMobileOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {nav}
          </aside>
        </div>
      )}
    </>
  )
}
