'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Plus, Minus, Trash2, UtensilsCrossed, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

export default function CartPage() {
  const params = useParams()
  const router = useRouter()
  const tableId = params.id as string
  
  const [cart, setCart] = useState<CartItem[]>([])
  const [specialRequests, setSpecialRequests] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // In a real app, this would come from context or localStorage
    // For demo purposes, we'll create some sample cart items
    const sampleCart: CartItem[] = [
      { id: '1', name: 'マルゲリータ / Margherita', price: 1680, quantity: 1 },
      { id: '2', name: 'カルボナーラ / Carbonara', price: 1580, quantity: 2 },
    ]
    setCart(sampleCart)
  }, [])

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeItem(itemId)
      return
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    )
  }

  const removeItem = (itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId))
    toast.success('商品をカートから削除しました')
  }

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const formatPrice = (price: number) => {
    return `¥${price.toLocaleString()}`
  }

  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      toast.error('カートが空です')
      return
    }

    setLoading(true)
    
    try {
      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          table_id: tableId,
          total_amount: getTotalAmount(),
          special_requests: specialRequests || null,
          status: 'pending'
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = cart.map(item => ({
        order_id: orderData.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        unit_price: item.price
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      toast.success('ご注文を承りました！')
      router.push(`/table/${tableId}/order/${orderData.id}`)
      
    } catch (error) {
      console.error('Error submitting order:', error)
      toast.error('注文の送信に失敗しました')
    } finally {
      setLoading(false)
    }
  }

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
                onClick={() => router.push(`/table/${tableId}/menu`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                メニューに戻る
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5 text-primary" />
              <span className="font-medium">テーブル {tableId}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="space-y-6">
          {/* Page Title */}
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">注文確認</h1>
            <p className="text-muted-foreground">
              ご注文内容をご確認ください
            </p>
          </div>

          {/* Cart Items */}
          <Card>
            <CardHeader>
              <CardTitle>ご注文商品</CardTitle>
              <CardDescription>
                {getTotalItems()}点の商品
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">カートが空です</p>
                  <Button onClick={() => router.push(`/table/${tableId}/menu`)}>
                    メニューを見る
                  </Button>
                </div>
              ) : (
                cart.map((item, index) => (
                  <div key={item.id}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatPrice(item.price)} × {item.quantity}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-right mt-1">
                      <span className="font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                    
                    {index < cart.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Special Requests */}
          <Card>
            <CardHeader>
              <CardTitle>特別なご要望</CardTitle>
              <CardDescription>
                アレルギーや調理方法のご希望がございましたらご記入ください
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="special-requests">ご要望・備考</Label>
                <Textarea
                  id="special-requests"
                  placeholder="例：辛さ控えめ、アレルギー対応など"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>お会計</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>小計</span>
                <span>{formatPrice(getTotalAmount())}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>消費税（10%）</span>
                <span>{formatPrice(Math.floor(getTotalAmount() * 0.1))}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>合計</span>
                <span className="text-primary">
                  {formatPrice(getTotalAmount() + Math.floor(getTotalAmount() * 0.1))}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="space-y-4">
            <Button
              onClick={handleSubmitOrder}
              disabled={loading || cart.length === 0}
              className="w-full h-12 text-lg"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  注文を送信中...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  注文を確定する
                </div>
              )}
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              注文確定後のキャンセル・変更はスタッフまでお声がけください
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}