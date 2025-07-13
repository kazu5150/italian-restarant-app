'use client'

import { useState, useEffect } from 'react'
import { supabase, type MenuCategory, type MenuItem } from '@/lib/supabase'
import AdminLayout from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  UtensilsCrossed, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft,
  Upload,
  Eye,
  EyeOff
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import {
  menuCategoriesAdmin,
  menuItemsAdmin
} from '@/lib/supabase-admin'

export default function AdminMenuPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    image_url: '',
    is_available: true,
    allergens: [] as string[]
  })
  
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [categoriesData, itemsData] = await Promise.all([
        menuCategoriesAdmin.getAll(),
        menuItemsAdmin.getAll()
      ])
      
      setCategories(categoriesData)
      setMenuItems(itemsData)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return `¥${price.toLocaleString()}`
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId)
    return category?.name || 'Unknown'
  }
  
  const handleAddItem = async () => {
    if (!newItem.name.trim() || !newItem.price || !newItem.category_id) {
      toast.error('必須項目を入力してください')
      return
    }
    
    const price = parseFloat(newItem.price)
    if (isNaN(price) || price <= 0) {
      toast.error('有効な価格を入力してください')
      return
    }
    
    try {
      await menuItemsAdmin.create({
        name: newItem.name,
        description: newItem.description || undefined,
        price: price,
        category_id: newItem.category_id,
        image_url: newItem.image_url || undefined,
        is_available: newItem.is_available,
        allergens: newItem.allergens
      })
      
      setNewItem({
        name: '',
        description: '',
        price: '',
        category_id: '',
        image_url: '',
        is_available: true,
        allergens: []
      })
      setShowAddDialog(false)
      fetchData()
    } catch (error) {
      // エラーはsupabase-admin.tsで処理済み
    }
  }
  
  const handleEditItem = async () => {
    if (!editingItem || !newItem.name.trim() || !newItem.price || !newItem.category_id) {
      toast.error('必須項目を入力してください')
      return
    }
    
    const price = parseFloat(newItem.price)
    if (isNaN(price) || price <= 0) {
      toast.error('有効な価格を入力してください')
      return
    }
    
    try {
      await menuItemsAdmin.update(editingItem.id, {
        name: newItem.name,
        description: newItem.description || undefined,
        price: price,
        category_id: newItem.category_id,
        image_url: newItem.image_url || undefined,
        is_available: newItem.is_available,
        allergens: newItem.allergens
      })
      
      setShowEditDialog(false)
      setEditingItem(null)
      fetchData()
    } catch (error) {
      // エラーはsupabase-admin.tsで処理済み
    }
  }
  
  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('このメニューアイテムを削除しますか？')) return
    
    try {
      await menuItemsAdmin.delete(itemId)
      fetchData()
    } catch (error) {
      // エラーはsupabase-admin.tsで処理済み
    }
  }
  
  const handleToggleAvailability = async (itemId: string) => {
    try {
      await menuItemsAdmin.toggleAvailability(itemId)
      fetchData()
    } catch (error) {
      // エラーはsupabase-admin.tsで処理済み
    }
  }
  
  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error('カテゴリ名を入力してください')
      return
    }
    
    try {
      await menuCategoriesAdmin.create({
        name: newCategory.name,
        description: newCategory.description,
        display_order: categories.length + 1
      })
      
      setNewCategory({ name: '', description: '' })
      setShowCategoryDialog(false)
      fetchData()
    } catch (error) {
      // エラーはsupabase-admin.tsで処理済み
    }
  }
  
  const openEditDialog = (item: MenuItem) => {
    setEditingItem(item)
    setNewItem({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category_id: item.category_id,
      image_url: item.image_url || '',
      is_available: item.is_available,
      allergens: item.allergens || []
    })
    setShowEditDialog(true)
  }
  
  const resetNewItem = () => {
    setNewItem({
      name: '',
      description: '',
      price: '',
      category_id: '',
      image_url: '',
      is_available: true,
      allergens: []
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <UtensilsCrossed className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>メニューデータを読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    ダッシュボード
                  </Link>
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">メニュー管理</h1>
                  <p className="text-sm text-muted-foreground">メニューアイテムとカテゴリの管理</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowCategoryDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  カテゴリ追加
                </Button>
                <Button onClick={() => { resetNewItem(); setShowAddDialog(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  メニュー追加
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <Tabs defaultValue="menu-items" className="space-y-6">
            <TabsList>
              <TabsTrigger value="menu-items">メニューアイテム</TabsTrigger>
              <TabsTrigger value="categories">カテゴリ管理</TabsTrigger>
            </TabsList>
            
            <TabsContent value="menu-items" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>メニューアイテム一覧</CardTitle>
                  <CardDescription>
                    {menuItems.length} 件のメニューアイテム
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {menuItems.length === 0 ? (
                    <div className="text-center py-8">
                      <UtensilsCrossed className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground mb-4">メニューアイテムがありません</p>
                      <Button onClick={() => { resetNewItem(); setShowAddDialog(true); }}>
                        <Plus className="h-4 w-4 mr-2" />
                        最初のメニューを追加
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {menuItems.map((item) => (
                        <Card key={item.id} className="overflow-hidden">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-lg">{item.name}</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                  {getCategoryName(item.category_id)}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                <Badge variant={item.is_available ? "default" : "secondary"}>
                                  {item.is_available ? "販売中" : "販売停止"}
                                </Badge>
                              </div>
                            </div>
                            {item.description && (
                              <p className="text-sm text-muted-foreground">
                                {item.description}
                              </p>
                            )}
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-primary">
                                  {formatPrice(item.price)}
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditDialog(item)}
                                  className="flex-1"
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  編集
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleToggleAvailability(item.id)}
                                >
                                  {item.is_available ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="categories" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>カテゴリ一覧</CardTitle>
                  <CardDescription>
                    {categories.length} 件のカテゴリ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{category.name}</p>
                          {category.description && (
                            <p className="text-sm text-muted-foreground">
                              {category.description}
                            </p>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          順序: {category.display_order}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* メニューアイテム追加ダイアログ */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>新しいメニューアイテム</DialogTitle>
              <DialogDescription>
                メニューアイテムの詳細を入力してください
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="item-name">メニュー名 *</Label>
                <Input
                  id="item-name"
                  value={newItem.name}
                  onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="例: マルゲリータピザ"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="item-category">カテゴリ *</Label>
                <Select
                  value={newItem.category_id}
                  onValueChange={(value) => setNewItem(prev => ({ ...prev, category_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="カテゴリを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="item-price">価格 *</Label>
                <Input
                  id="item-price"
                  type="number"
                  value={newItem.price}
                  onChange={(e) => setNewItem(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="1000"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="item-description">説明</Label>
                <Textarea
                  id="item-description"
                  value={newItem.description}
                  onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="メニューの説明を入力..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="item-image">画像URL</Label>
                <Input
                  id="item-image"
                  value={newItem.image_url}
                  onChange={(e) => setNewItem(prev => ({ ...prev, image_url: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                キャンセル
              </Button>
              <Button onClick={handleAddItem}>
                追加
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* メニューアイテム編集ダイアログ */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>メニューアイテム編集</DialogTitle>
              <DialogDescription>
                メニューアイテムの詳細を編集してください
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-item-name">メニュー名 *</Label>
                <Input
                  id="edit-item-name"
                  value={newItem.name}
                  onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="例: マルゲリータピザ"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-item-category">カテゴリ *</Label>
                <Select
                  value={newItem.category_id}
                  onValueChange={(value) => setNewItem(prev => ({ ...prev, category_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="カテゴリを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-item-price">価格 *</Label>
                <Input
                  id="edit-item-price"
                  type="number"
                  value={newItem.price}
                  onChange={(e) => setNewItem(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="1000"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-item-description">説明</Label>
                <Textarea
                  id="edit-item-description"
                  value={newItem.description}
                  onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="メニューの説明を入力..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-item-image">画像URL</Label>
                <Input
                  id="edit-item-image"
                  value={newItem.image_url}
                  onChange={(e) => setNewItem(prev => ({ ...prev, image_url: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                キャンセル
              </Button>
              <Button onClick={handleEditItem}>
                更新
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* カテゴリ追加ダイアログ */}
        <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新しいカテゴリ</DialogTitle>
              <DialogDescription>
                新しいメニューカテゴリを追加します
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category-name">カテゴリ名 *</Label>
                <Input
                  id="category-name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="例: 季節限定メニュー"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category-description">説明</Label>
                <Input
                  id="category-description"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="カテゴリの説明を入力..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>
                キャンセル
              </Button>
              <Button onClick={handleAddCategory}>
                追加
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}