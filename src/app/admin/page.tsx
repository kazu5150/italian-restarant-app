'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import AdminLayout from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp,
  Clock,
  ChefHat,
  CheckCircle,
  UtensilsCrossed,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

interface DashboardStats {
  totalOrders: number
  pendingOrders: number
  preparingOrders: number
  readyOrders: number
  completedOrders: number
  totalRevenue: number
  averageOrderValue: number
}

interface RecentOrder {
  id: string
  table_id: string
  status: string
  total_amount: number
  created_at: string
  table_number?: number
}

interface OrderWithTable {
  id: string
  table_id: string
  status: string
  total_amount: number
  created_at: string
  tables?: {
    table_number: number
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    preparingOrders: 0,
    readyOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0
  })
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
    
    // Subscribe to real-time order updates
    const subscription = supabase
      .channel('admin_dashboard')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchDashboardData()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Get today's date range (Japan timezone)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      // Fetch all orders for today
      const { data: todayOrdersData, error: todayOrdersError } = await supabase
        .from('orders')
        .select(`
          id,
          table_id,
          status,
          total_amount,
          created_at,
          tables!inner(table_number)
        `)
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString())
        .order('created_at', { ascending: false })

      if (todayOrdersError) throw todayOrdersError

      // Fetch recent orders (not limited to today)
      const { data: recentOrdersData, error: recentOrdersError } = await supabase
        .from('orders')
        .select(`
          id,
          table_id,
          status,
          total_amount,
          created_at,
          tables!inner(table_number)
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      if (recentOrdersError) throw recentOrdersError

      // Calculate stats from today's orders only
      const totalOrders = todayOrdersData.length
      const pendingOrders = todayOrdersData.filter(order => order.status === 'pending').length
      const preparingOrders = todayOrdersData.filter(order => order.status === 'preparing').length
      const readyOrders = todayOrdersData.filter(order => order.status === 'ready').length
      const completedOrders = todayOrdersData.filter(order => order.status === 'completed').length
      const totalRevenue = todayOrdersData.reduce((sum, order) => sum + order.total_amount, 0)
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

      setStats({
        totalOrders,
        pendingOrders,
        preparingOrders,
        readyOrders,
        completedOrders,
        totalRevenue,
        averageOrderValue
      })

      // Format recent orders (from all orders, not just today)
      const formattedOrders: RecentOrder[] = (recentOrdersData as unknown as OrderWithTable[]).map(order => ({
        id: order.id,
        table_id: order.table_id,
        status: order.status,
        total_amount: order.total_amount,
        created_at: order.created_at,
        table_number: order.tables?.table_number
      }))

      setRecentOrders(formattedOrders)
    } catch {
      // Error handled silently
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">受付中</Badge>
      case 'preparing':
        return <Badge className="bg-blue-100 text-blue-800">調理中</Badge>
      case 'ready':
        return <Badge className="bg-orange-100 text-orange-800">完成</Badge>
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">提供済み</Badge>
      case 'cancelled':
        return <Badge variant="destructive">キャンセル</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <UtensilsCrossed className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>ダッシュボードを読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="space-y-6">
          {/* Quick Actions Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">ダッシュボード概要</h3>
              <p className="text-sm text-muted-foreground">
                最終更新: {new Date().toLocaleTimeString('ja-JP')}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchDashboardData()}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              更新
            </Button>
          </div>

          {/* Alert Section */}
          {(stats.pendingOrders > 5 || stats.readyOrders > 3) && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-orange-800">注意が必要です</p>
                    <p className="text-sm text-orange-700">
                      {stats.pendingOrders > 5 && `${stats.pendingOrders}件の注文が受付待ちです。`}
                      {stats.readyOrders > 3 && ` ${stats.readyOrders}件の料理が配膳待ちです。`}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" asChild className="ml-auto">
                    <Link href="/admin/orders">対応する</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">本日の注文数</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.pendingOrders + stats.preparingOrders + stats.readyOrders} 件処理中
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">本日の売上</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  平均注文額: {formatPrice(stats.averageOrderValue)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">受付待ち</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</div>
                <p className="text-xs text-muted-foreground">要対応</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">調理中</CardTitle>
                <ChefHat className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.preparingOrders}</div>
                <p className="text-xs text-muted-foreground">キッチン作業中</p>
              </CardContent>
            </Card>
          </div>

          {/* Order Status Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>最近の注文</CardTitle>
                <CardDescription>直近の注文状況</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">
                            テーブル {order.table_number || 'N/A'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString('ja-JP', {
                              month: 'numeric',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{formatPrice(order.total_amount)}</span>
                        {getStatusBadge(order.status)}
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/orders/${order.id}`}>
                            詳細
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {recentOrders.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">注文がありません</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-4">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/admin/orders">すべての注文を見る</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>注文状況</CardTitle>
                <CardDescription>現在の注文ステータス</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">受付待ち</span>
                  </div>
                  <span className="font-bold text-yellow-600">{stats.pendingOrders}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ChefHat className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">調理中</span>
                  </div>
                  <span className="font-bold text-blue-600">{stats.preparingOrders}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-orange-600" />
                    <span className="text-sm">完成・配膳待ち</span>
                  </div>
                  <span className="font-bold text-orange-600">{stats.readyOrders}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">提供済み</span>
                  </div>
                  <span className="font-bold text-green-600">{stats.completedOrders}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>クイックアクション</CardTitle>
              <CardDescription>よく使用する機能へのショートカット</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                  <Link href="/admin/orders">
                    <ShoppingCart className="h-6 w-6" />
                    注文管理
                  </Link>
                </Button>
                
                <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                  <Link href="/admin/menu">
                    <UtensilsCrossed className="h-6 w-6" />
                    メニュー管理
                  </Link>
                </Button>
                
                <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                  <Link href="/admin/tables">
                    <Users className="h-6 w-6" />
                    テーブル管理
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}