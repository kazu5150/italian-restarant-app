'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import AdminLayout from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Clock,
  Download,
  Filter
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface ReportData {
  dailySales: Array<{
    date: string
    revenue: number
    orders: number
  }>
  popularItems: Array<{
    name: string
    quantity: number
    revenue: number
  }>
  hourlyData: Array<{
    hour: number
    orders: number
    revenue: number
  }>
  averageOrderTime: number
  customerSatisfaction: number
}

interface ReportFilters {
  startDate: string
  endDate: string
  period: 'today' | 'week' | 'month' | 'custom'
}

export default function AdminReports() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [, setLoading] = useState(true)
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    period: 'week'
  })

  const fetchReportData = useCallback(async () => {
    setLoading(true)
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          created_at,
          status,
          order_items (
            quantity,
            unit_price,
            menu_items (
              name
            )
          )
        `)
        .gte('created_at', `${filters.startDate}T00:00:00`)
        .lte('created_at', `${filters.endDate}T23:59:59`)
        .neq('status', 'cancelled')

      if (ordersError) throw ordersError

      // Process data for reports
      const dailySales = processDailySales(ordersData || [])
      const popularItems = processPopularItems(ordersData || [])
      const hourlyData = processHourlyData(ordersData || [])
      const averageOrderTime = 18 // Mock data
      const customerSatisfaction = 4.6 // Mock data

      setReportData({
        dailySales,
        popularItems,
        hourlyData,
        averageOrderTime,
        customerSatisfaction
      })
    } catch {
      // Error handled silently
    } finally {
      setLoading(false)
    }
  }, [filters.startDate, filters.endDate])

  useEffect(() => {
    fetchReportData()
  }, [fetchReportData])

  const processDailySales = (orders: Array<{created_at: string, total_amount: number}>) => {
    const salesByDate: { [key: string]: { revenue: number; orders: number } } = {}
    
    orders.forEach(order => {
      const date = new Date(order.created_at).toLocaleDateString('ja-JP')
      if (!salesByDate[date]) {
        salesByDate[date] = { revenue: 0, orders: 0 }
      }
      salesByDate[date].revenue += order.total_amount
      salesByDate[date].orders += 1
    })

    return Object.entries(salesByDate).map(([date, data]) => ({
      date,
      revenue: data.revenue,
      orders: data.orders
    }))
  }

  const processPopularItems = (orders: Array<{order_items?: Array<{menu_items: {name: string}[], quantity: number, unit_price: number}>}>) => {
    const itemStats: { [key: string]: { quantity: number; revenue: number } } = {}
    
    orders.forEach(order => {
      order.order_items?.forEach((item) => {
        const name = item.menu_items?.[0]?.name || 'Unknown'
        if (!itemStats[name]) {
          itemStats[name] = { quantity: 0, revenue: 0 }
        }
        itemStats[name].quantity += item.quantity
        itemStats[name].revenue += item.unit_price * item.quantity
      })
    })

    return Object.entries(itemStats)
      .map(([name, stats]) => ({
        name,
        quantity: stats.quantity,
        revenue: stats.revenue
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10)
  }

  const processHourlyData = (orders: Array<{created_at: string, total_amount: number}>) => {
    const hourlyStats: { [key: number]: { orders: number; revenue: number } } = {}
    
    for (let hour = 0; hour < 24; hour++) {
      hourlyStats[hour] = { orders: 0, revenue: 0 }
    }
    
    orders.forEach(order => {
      const hour = new Date(order.created_at).getHours()
      hourlyStats[hour].orders += 1
      hourlyStats[hour].revenue += order.total_amount
    })

    return Object.entries(hourlyStats).map(([hour, data]) => ({
      hour: parseInt(hour),
      orders: data.orders,
      revenue: data.revenue
    }))
  }

  const handlePeriodChange = (period: ReportFilters['period']) => {
    const now = new Date()
    let startDate: Date
    
    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      default:
        return
    }
    
    setFilters({
      ...filters,
      period,
      startDate: startDate.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0]
    })
  }

  const totalRevenue = reportData?.dailySales.reduce((sum, day) => sum + day.revenue, 0) || 0
  const totalOrders = reportData?.dailySales.reduce((sum, day) => sum + day.orders, 0) || 0
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">売上レポート</h3>
              <p className="text-sm text-muted-foreground">
                売上データの分析と傾向
              </p>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              エクスポート
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                フィルター
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-end gap-4">
                <div className="space-y-2">
                  <Label>期間</Label>
                  <div className="flex gap-2">
                    {[
                      { key: 'today', label: '今日' },
                      { key: 'week', label: '1週間' },
                      { key: 'month', label: '1ヶ月' },
                      { key: 'custom', label: 'カスタム' }
                    ].map(({ key, label }) => (
                      <Button
                        key={key}
                        variant={filters.period === key ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePeriodChange(key as ReportFilters['period'])}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
                
                {filters.period === 'custom' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="start-date">開始日</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                        className="w-40"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-date">終了日</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                        className="w-40"
                      />
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">総売上</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPrice(totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  前期比 +12.5%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">注文数</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalOrders}</div>
                <p className="text-xs text-muted-foreground">
                  前期比 +8.2%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">平均注文額</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPrice(averageOrderValue)}</div>
                <p className="text-xs text-muted-foreground">
                  前期比 +4.1%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">平均調理時間</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData?.averageOrderTime || 0}分</div>
                <p className="text-xs text-muted-foreground">
                  前期比 -2.3分
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Tables */}
          <Tabs defaultValue="daily" className="space-y-4">
            <TabsList>
              <TabsTrigger value="daily">日別売上</TabsTrigger>
              <TabsTrigger value="items">人気商品</TabsTrigger>
              <TabsTrigger value="hourly">時間別分析</TabsTrigger>
            </TabsList>

            <TabsContent value="daily" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>日別売上推移</CardTitle>
                  <CardDescription>売上と注文数の推移</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData?.dailySales.map((day, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{day.date}</p>
                          <p className="text-sm text-muted-foreground">{day.orders}件の注文</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatPrice(day.revenue)}</p>
                          <p className="text-sm text-muted-foreground">
                            平均: {formatPrice(day.orders > 0 ? day.revenue / day.orders : 0)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {(!reportData || reportData.dailySales.length === 0) && (
                      <div className="text-center py-8 text-muted-foreground">
                        データがありません
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="items" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>人気商品ランキング</CardTitle>
                  <CardDescription>注文数の多い商品トップ10</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reportData?.popularItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                            {index + 1}
                          </Badge>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">{item.quantity}回注文</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatPrice(item.revenue)}</p>
                          <p className="text-sm text-muted-foreground">
                            単価: {formatPrice(item.revenue / item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {(!reportData || reportData.popularItems.length === 0) && (
                      <div className="text-center py-8 text-muted-foreground">
                        データがありません
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="hourly" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>時間別注文分析</CardTitle>
                  <CardDescription>営業時間中の注文パターン</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reportData?.hourlyData
                      .filter(hour => hour.hour >= 11 && hour.hour <= 22) // 営業時間のみ
                      .map((hour) => (
                      <div key={hour.hour} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{hour.hour}:00 - {hour.hour + 1}:00</p>
                          <p className="text-sm text-muted-foreground">{hour.orders}件の注文</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatPrice(hour.revenue)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminLayout>
  )
}