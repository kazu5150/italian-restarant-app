'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase, type MenuCategory, type MenuItem } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ShoppingCart, Plus, Minus, UtensilsCrossed, Clock, Heart } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

interface CartItem {
  item: MenuItem
  quantity: number
}

export default function MenuPage() {
  const params = useParams()
  const tableId = params.id as string
  
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('')

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('menu_categories')
          .select('*')
          .order('display_order')

        if (categoriesError) throw categoriesError

        // Fetch menu items
        const { data: itemsData, error: itemsError } = await supabase
          .from('menu_items')
          .select('*')
          .eq('is_available', true)

        if (itemsError) throw itemsError

        setCategories(categoriesData || [])
        setMenuItems(itemsData || [])
        
        if (categoriesData && categoriesData.length > 0) {
          setActiveCategory(categoriesData[0].id)
        }
      } catch (error) {
        console.error('Error fetching menu data:', error)
        toast.error('メニューの読み込みに失敗しました')
      } finally {
        setLoading(false)
      }
    }

    fetchMenuData()
  }, [])

  const addToCart = (item: MenuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.item.id === item.id)
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.item.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      } else {
        return [...prevCart, { item, quantity: 1 }]
      }
    })
    toast.success(`${item.name} をカートに追加しました`)
  }

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => {
      return prevCart.reduce((acc, cartItem) => {
        if (cartItem.item.id === itemId) {
          if (cartItem.quantity > 1) {
            acc.push({ ...cartItem, quantity: cartItem.quantity - 1 })
          }
        } else {
          acc.push(cartItem)
        }
        return acc
      }, [] as CartItem[])
    })
  }

  const getCartItemQuantity = (itemId: string) => {
    const cartItem = cart.find(item => item.item.id === itemId)
    return cartItem ? cartItem.quantity : 0
  }

  const getTotalAmount = () => {
    return cart.reduce((total, cartItem) => {
      return total + (cartItem.item.price * cartItem.quantity)
    }, 0)
  }

  const getTotalItems = () => {
    return cart.reduce((total, cartItem) => total + cartItem.quantity, 0)
  }

  const getCategoryItems = (categoryId: string) => {
    return menuItems.filter(item => item.category_id === categoryId)
  }

  const formatPrice = (price: number) => {
    return `¥${price.toLocaleString()}`
  }

  const getAllergensText = (allergens: string[]) => {
    if (!allergens || allergens.length === 0) return ''
    
    const allergenMap: { [key: string]: string } = {
      'gluten': '小麦',
      'eggs': '卵',
      'dairy': '乳製品',
      'nuts': 'ナッツ',
      'shellfish': '甲殻類',
      'fish': '魚',
      'soy': '大豆'
    }
    
    return allergens.map(allergen => allergenMap[allergen] || allergen).join(', ')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <UtensilsCrossed className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>メニューを読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UtensilsCrossed className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-xl font-bold">Bella Vista</h1>
                <p className="text-sm text-muted-foreground">テーブル {tableId}</p>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              className="relative"
              onClick={() => {
                if (cart.length === 0) {
                  toast.error('カートが空です')
                  return
                }
                // Navigate to cart page
                window.location.href = `/table/${tableId}/cart`
              }}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              カート
              {getTotalItems() > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 text-xs p-0 flex items-center justify-center">
                  {getTotalItems()}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-6">
            {categories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="text-xs lg:text-sm p-2"
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getCategoryItems(category.id).map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    {item.image_url && (
                      <div className="aspect-video relative overflow-hidden">
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    )}
                    
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg leading-tight">{item.name}</CardTitle>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">
                            {formatPrice(item.price)}
                          </div>
                        </div>
                      </div>
                      {item.description && (
                        <CardDescription className="text-sm leading-relaxed">
                          {item.description}
                        </CardDescription>
                      )}
                      
                      {item.allergens && item.allergens.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            アレルギー: {getAllergensText(item.allergens)}
                          </Badge>
                        </div>
                      )}
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        {getCartItemQuantity(item.id) === 0 ? (
                          <Button
                            onClick={() => addToCart(item)}
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            カートに追加
                          </Button>
                        ) : (
                          <div className="flex items-center gap-2 w-full">
                            <Button
                              onClick={() => removeFromCart(item.id)}
                              variant="outline"
                              size="sm"
                              className="flex-shrink-0"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="flex-1 text-center font-medium">
                              {getCartItemQuantity(item.id)}
                            </span>
                            <Button
                              onClick={() => addToCart(item)}
                              variant="outline"
                              size="sm"
                              className="flex-shrink-0"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {getCategoryItems(category.id).length === 0 && (
                <div className="text-center py-8">
                  <Heart className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">このカテゴリには現在商品がございません</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Floating Cart Summary */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto">
          <Card className="shadow-lg border-primary">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">合計: {formatPrice(getTotalAmount())}</p>
                  <p className="text-sm text-muted-foreground">
                    {getTotalItems()}点の商品
                  </p>
                </div>
                <Button
                  onClick={() => {
                    window.location.href = `/table/${tableId}/cart`
                  }}
                  className="gap-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  注文確認
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}