'use client'

import { useState, useEffect } from 'react'
import { supabase, type Order } from '@/lib/supabase'
import AdminLayout from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft,
  RefreshCw,
  Clock,
  ChefHat,
  CheckCircle,
  UtensilsCrossed,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface OrderWithTable extends Order {
  tables: {
    table_number: number
  } | null
  order_items: {
    id: string
    quantity: number
    menu_items: {
      name: string
    }
  }[]
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderWithTable[]>([])
  const [filteredOrders, setFilteredOrders] = useState<OrderWithTable[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    fetchOrders()
    
    // Subscribe to real-time order updates
    const subscription = supabase
      .channel('admin_orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchOrders()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, activeTab])

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          tables (table_number),
          order_items (
            id,
            quantity,
            menu_items (name)
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data as OrderWithTable[])
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('注文データの取得に失敗しました')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const filterOrders = () => {
    let filtered = orders
    
    switch (activeTab) {
      case 'pending':
        filtered = orders.filter(order => order.status === 'pending')
        break
      case 'preparing':
        filtered = orders.filter(order => order.status === 'preparing')
        break
      case 'ready':
        filtered = orders.filter(order => order.status === 'ready')
        break
      case 'completed':
        filtered = orders.filter(order => order.status === 'completed')
        break
      default:
        filtered = orders
    }
    
    setFilteredOrders(filtered)
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchOrders()
  }

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error
      
      toast.success('注文ステータスを更新しました')
      fetchOrders()
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error('ステータスの更新に失敗しました')
    }
  }

  const formatPrice = (price: number) => {
    return `¥${price.toLocaleString()}`
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> 受付中</Badge>
      case 'preparing':
        return <Badge className="bg-blue-100 text-blue-800 gap-1"><ChefHat className="h-3 w-3" /> 調理中</Badge>
      case 'ready':
        return <Badge className="bg-orange-100 text-orange-800 gap-1"><AlertCircle className="h-3 w-3" /> 完成</Badge>
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 gap-1"><CheckCircle className="h-3 w-3" /> 提供済み</Badge>
      case 'cancelled':
        return <Badge variant="destructive">キャンセル</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getItemsSummary = (orderItems: OrderWithTable['order_items']) => {
    const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0)
    const firstItem = orderItems[0]?.menu_items.name
    
    if (orderItems.length === 1) {
      return `${firstItem} × ${orderItems[0].quantity}`
    } else if (orderItems.length > 1) {
      return `${firstItem} 他${orderItems.length - 1}品`
    }
    return ''
  }

  const getTabCount = (status: string) => {
    switch (status) {
      case 'pending':
        return orders.filter(order => order.status === 'pending').length
      case 'preparing':
        return orders.filter(order => order.status === 'preparing').length
      case 'ready':
        return orders.filter(order => order.status === 'ready').length
      case 'completed':
        return orders.filter(order => order.status === 'completed').length
      default:
        return orders.length
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <UtensilsCrossed className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>注文データを読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">注文管理</h3>
              <p className="text-sm text-muted-foreground">
                リアルタイム注文状況の管理
              </p>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              更新
            </Button>
          </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all" className="relative">
              すべて
              <Badge variant="secondary" className="ml-2 text-xs">
                {getTabCount('all')}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="pending" className="relative">
              受付中
              <Badge variant="secondary" className="ml-2 text-xs">
                {getTabCount('pending')}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="preparing" className="relative">
              調理中
              <Badge variant="secondary" className="ml-2 text-xs">
                {getTabCount('preparing')}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="ready" className="relative">
              完成
              <Badge variant="secondary" className="ml-2 text-xs">
                {getTabCount('ready')}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className="relative">
              提供済み
              <Badge variant="secondary" className="ml-2 text-xs">
                {getTabCount('completed')}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {filteredOrders.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <UtensilsCrossed className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">該当する注文がありません</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <Card key={order.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div>
                            <h3 className="text-lg font-semibold">
                              テーブル {order.tables?.table_number || 'N/A'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              注文時刻: {formatTime(order.created_at)}
                            </p>
                          </div>
                          {getStatusBadge(order.status)}
                        </div>
                        
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">
                            {formatPrice(order.total_amount)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            注文ID: {order.id.slice(-8).toUpperCase()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium mb-1">注文内容</p>
                          <p className="text-sm text-muted-foreground">
                            {getItemsSummary(order.order_items)}
                          </p>
                          {order.special_requests && (
                            <p className="text-sm text-orange-600 mt-1">
                              要望: {order.special_requests}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Select
                            value={order.status}
                            onValueChange={(value) => updateOrderStatus(order.id, value as Order['status'])}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">受付中</SelectItem>
                              <SelectItem value="preparing">調理中</SelectItem>
                              <SelectItem value="ready">完成</SelectItem>
                              <SelectItem value="completed">提供済み</SelectItem>
                              <SelectItem value="cancelled">キャンセル</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/orders/${order.id}`}>
                              詳細
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </AdminLayout>
  )
}