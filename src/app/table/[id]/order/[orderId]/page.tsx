'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase, type Order, type OrderItem, type MenuItem } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircle, 
  Clock, 
  ChefHat, 
  Truck, 
  UtensilsCrossed,
  ArrowLeft,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

interface OrderWithItems extends Order {
  order_items: (OrderItem & {
    menu_items: MenuItem
  })[]
}

interface StatusStep {
  status: Order['status']
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  completed: boolean
  current: boolean
}

export default function OrderStatusPage() {
  const params = useParams()
  const tableId = params.id as string
  const orderId = params.orderId as string
  
  const [order, setOrder] = useState<OrderWithItems | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            menu_items (*)
          )
        `)
        .eq('id', orderId)
        .single()

      if (error) throw error
      setOrder(data as OrderWithItems)
    } catch (error) {
      console.error('Error fetching order:', error)
      toast.error('注文情報の取得に失敗しました')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchOrder()

    // Subscribe to real-time updates
    const subscription = supabase
      .channel(`order_${orderId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
        (payload) => {
          setOrder(prev => prev ? { ...prev, ...payload.new } : null)
          toast.success('注文状況が更新されました')
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [orderId])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchOrder()
  }

  const formatPrice = (price: number) => {
    return `¥${price.toLocaleString()}`
  }

  const getStatusSteps = (currentStatus: Order['status']): StatusStep[] => {
    const statusOrder: Order['status'][] = ['pending', 'confirmed', 'preparing', 'ready', 'served']
    const currentIndex = statusOrder.indexOf(currentStatus)

    return [
      {
        status: 'pending',
        label: '注文受付',
        description: 'ご注文を受け付けました',
        icon: CheckCircle,
        completed: currentIndex >= 0,
        current: currentStatus === 'pending'
      },
      {
        status: 'confirmed',
        label: '注文確定',
        description: 'ご注文を確認しました',
        icon: CheckCircle,
        completed: currentIndex >= 1,
        current: currentStatus === 'confirmed'
      },
      {
        status: 'preparing',
        label: '調理中',
        description: 'シェフが調理を開始しました',
        icon: ChefHat,
        completed: currentIndex >= 2,
        current: currentStatus === 'preparing'
      },
      {
        status: 'ready',
        label: '提供準備完了',
        description: 'お料理の準備ができました',
        icon: Truck,
        completed: currentIndex >= 3,
        current: currentStatus === 'ready'
      },
      {
        status: 'served',
        label: '提供完了',
        description: 'お料理をお楽しみください',
        icon: UtensilsCrossed,
        completed: currentIndex >= 4,
        current: currentStatus === 'served'
      }
    ]
  }

  const getEstimatedTime = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'ご注文を確認中です'
      case 'confirmed':
        return '5分以内に調理開始予定'
      case 'preparing':
        return '15-20分で完成予定'
      case 'ready':
        return 'まもなくお席にお持ちします'
      case 'served':
        return 'ごゆっくりお楽しみください'
      default:
        return ''
    }
  }

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'preparing':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'ready':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'served':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <UtensilsCrossed className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>注文情報を読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">注文が見つかりません</p>
          <Button onClick={() => window.history.back()}>
            戻る
          </Button>
        </div>
      </div>
    )
  }

  const statusSteps = getStatusSteps(order.status)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                戻る
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
              <UtensilsCrossed className="h-5 w-5 text-primary" />
              <span className="font-medium">テーブル {tableId}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="space-y-6">
          {/* Order Header */}
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">注文状況</h1>
            <p className="text-muted-foreground">
              注文番号: {orderId.slice(-8).toUpperCase()}
            </p>
            <p className="text-sm text-muted-foreground">
              {new Date(order.created_at).toLocaleString('ja-JP')}
            </p>
          </div>

          {/* Current Status */}
          <Card>
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Badge className={getStatusColor(order.status)}>
                  {statusSteps.find(step => step.current)?.label}
                </Badge>
              </div>
              <CardTitle className="text-lg">
                {getEstimatedTime(order.status)}
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>進捗状況</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statusSteps.map((step, index) => {
                  const Icon = step.icon
                  return (
                    <div key={step.status} className="flex items-center gap-4">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        step.completed 
                          ? 'bg-primary text-primary-foreground' 
                          : step.current
                          ? 'bg-primary/20 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-medium ${
                            step.completed || step.current ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {step.label}
                          </h3>
                          {step.completed && !step.current && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                          {step.current && (
                            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                          )}
                        </div>
                        <p className={`text-sm ${
                          step.completed || step.current ? 'text-muted-foreground' : 'text-muted-foreground/60'
                        }`}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>ご注文内容</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.order_items.map((item, index) => (
                <div key={item.id}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium">{item.menu_items.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(item.unit_price)} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-medium">
                        {formatPrice(item.unit_price * item.quantity)}
                      </span>
                    </div>
                  </div>
                  {index < order.order_items.length - 1 && <Separator className="mt-3" />}
                </div>
              ))}
              
              <Separator />
              
              <div className="flex justify-between font-bold text-lg">
                <span>合計</span>
                <span className="text-primary">{formatPrice(order.total_amount)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Special Requests */}
          {order.special_requests && (
            <Card>
              <CardHeader>
                <CardTitle>特別なご要望</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{order.special_requests}</p>
              </CardContent>
            </Card>
          )}

          {/* Additional Actions */}
          <div className="space-y-3">
            {order.status === 'served' && (
              <Button
                className="w-full"
                onClick={() => window.location.href = `/table/${tableId}/menu`}
              >
                追加注文する
              </Button>
            )}
            
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.href = `/table/${tableId}/menu`}
            >
              メニューに戻る
            </Button>
            
            <div className="text-center space-y-1">
              <p className="text-xs text-muted-foreground">
                この画面は自動的に更新されます
              </p>
              <p className="text-xs text-muted-foreground">
                ご不明な点がございましたらスタッフまでお声がけください
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}