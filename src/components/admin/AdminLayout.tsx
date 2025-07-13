'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  UtensilsCrossed,
  LayoutDashboard,
  ShoppingCart,
  Menu,
  Users,
  Settings,
  BarChart3,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
}

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const navigation: NavigationItem[] = [
    {
      name: 'ダッシュボード',
      href: '/admin',
      icon: LayoutDashboard
    },
    {
      name: '注文管理',
      href: '/admin/orders',
      icon: ShoppingCart,
      // Note: Badge count could be dynamically loaded from pending orders
    },
    {
      name: 'メニュー管理',
      href: '/admin/menu',
      icon: Menu
    },
    {
      name: 'テーブル管理',
      href: '/admin/tables',
      icon: Users
    },
    {
      name: 'レポート',
      href: '/admin/reports',
      icon: BarChart3
    },
    {
      name: '設定',
      href: '/admin/settings',
      icon: Settings
    }
  ]

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-card border-r transition-all duration-200 flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="h-6 w-6 text-primary" />
                <div>
                  <h1 className="font-bold text-lg">Bella Vista</h1>
                  <p className="text-xs text-muted-foreground">管理画面</p>
                </div>
              </div>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="ml-auto"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            
            return (
              <Link key={item.href} href={item.href}>
                <div className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                  ${active 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }
                `}>
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1">{item.name}</span>
                      {item.badge && item.badge > 0 && (
                        <Badge variant="destructive" className="h-5 w-5 text-xs p-0 flex items-center justify-center">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* User Actions */}
        <div className="p-4 border-t space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className={`w-full ${sidebarCollapsed ? 'px-2' : 'justify-start'}`}
          >
            <Bell className="h-4 w-4" />
            {!sidebarCollapsed && <span className="ml-2">通知</span>}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className={`w-full ${sidebarCollapsed ? 'px-2' : 'justify-start'}`}
            onClick={() => {
              // Simple logout - redirect to homepage
              window.location.href = '/'
            }}
          >
            <LogOut className="h-4 w-4" />
            {!sidebarCollapsed && <span className="ml-2">ログアウト</span>}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-card border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                {navigation.find(item => isActive(item.href))?.name || 'Bella Vista 管理画面'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long'
                })}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" asChild>
                <Link href="/">
                  顧客画面を見る
                </Link>
              </Button>
              
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <UtensilsCrossed className="h-4 w-4 text-primary" />
                </div>
                <div className="text-sm">
                  <div className="font-medium">管理者</div>
                  <div className="text-muted-foreground">Admin</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  )
}