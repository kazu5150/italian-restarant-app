'use client'

import { useState, useEffect } from 'react'
import { supabase, type MenuCategory, type MenuItem } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  UtensilsCrossed,
  Upload,
  Image as ImageIcon
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'

interface MenuItemForm {
  name: string
  description: string
  price: string
  category_id: string
  image_url: string
  is_available: boolean
  allergens: string[]
}

export default function AdminMenuPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [formData, setFormData] = useState<MenuItemForm>({
    name: '',
    description: '',
    price: '',
    category_id: '',
    image_url: '',
    is_available: true,
    allergens: []
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [categoriesResponse, itemsResponse] = await Promise.all([
        supabase.from('menu_categories').select('*').order('display_order'),
        supabase.from('menu_items').select('*, menu_categories(name)').order('created_at', { ascending: false })
      ])

      if (categoriesResponse.error) throw categoriesResponse.error
      if (itemsResponse.error) throw itemsResponse.error

      setCategories(categoriesResponse.data || [])
      setMenuItems(itemsResponse.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category_id: '',
      image_url: '',
      is_available: true,
      allergens: []
    })
    setEditingItem(null)
  }

  const handleAddItem = async () => {
    if (!formData.name || !formData.price || !formData.category_id) {
      toast.error('必須項目を入力してください')
      return
    }

    try {
      const { error } = await supabase
        .from('menu_items')
        .insert({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category_id: formData.category_id,
          image_url: formData.image_url || null,
          is_available: formData.is_available,
          allergens: formData.allergens
        })

      if (error) throw error

      toast.success('メニューアイテムを追加しました')
      setShowAddDialog(false)
      resetForm()
      fetchData()
    } catch (error) {
      console.error('Error adding item:', error)
      toast.error('追加に失敗しました')
    }
  }

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category_id: item.category_id,
      image_url: item.image_url || '',
      is_available: item.is_available,
      allergens: item.allergens || []
    })
    setShowAddDialog(true)
  }

  const handleUpdateItem = async () => {
    if (!editingItem) return

    try {
      const { error } = await supabase
        .from('menu_items')
        .update({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category_id: formData.category_id,
          image_url: formData.image_url || null,
          is_available: formData.is_available,
          allergens: formData.allergens
        })
        .eq('id', editingItem.id)

      if (error) throw error

      toast.success('メニューアイテムを更新しました')
      setShowAddDialog(false)
      resetForm()
      fetchData()
    } catch (error) {
      console.error('Error updating item:', error)
      toast.error('更新に失敗しました')
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('このメニューアイテムを削除してもよろしいですか？')) {
      return
    }

    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', itemId)

      if (error) throw error

      toast.success('メニューアイテムを削除しました')
      fetchData()
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error('削除に失敗しました')
    }
  }

  const toggleAvailability = async (itemId: string, isAvailable: boolean) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ is_available: !isAvailable })
        .eq('id', itemId)

      if (error) throw error

      toast.success('在庫状況を更新しました')
      fetchData()
    } catch (error) {
      console.error('Error updating availability:', error)
      toast.error('更新に失敗しました')
    }
  }

  const formatPrice = (price: number) => {
    return `¥${price.toLocaleString()}`
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId)
    return category?.name || 'Unknown'
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
                <p className="text-sm text-muted-foreground">
                  メニューアイテムの追加・編集・管理
                </p>
              </div>
            </div>
            
            <Dialog open={showAddDialog} onOpenChange={(open) => {
              setShowAddDialog(open)
              if (!open) resetForm()
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  メニュー追加
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? 'メニューアイテム編集' : '新しいメニューアイテム'}
                  </DialogTitle>
                  <DialogDescription>
                    メニューアイテムの詳細を入力してください
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">料理名 *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="例: マルゲリータピザ"
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">価格 (円) *</Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        placeholder="1500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="category">カテゴリ *</Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) => setFormData({...formData, category_id: value})}
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
                  
                  <div>
                    <Label htmlFor="description">説明</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="料理の説明を入力..."
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="image_url">画像URL</Label>
                    <div className="space-y-2">
                      <Input
                        id="image_url"
                        value={formData.image_url}
                        onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                        placeholder="/images/menu/pizza/margherita.jpg"
                      />
                      <p className="text-xs text-muted-foreground">
                        画像ファイルを public/images/menu/ に配置し、相対パスを入力してください
                      </p>
                      {formData.image_url && (
                        <div className="relative w-32 h-24 border rounded overflow-hidden">
                          <Image
                            src={formData.image_url}
                            alt="Preview"
                            fill
                            className="object-cover"
                            onError={() => toast.error('画像の読み込みに失敗しました')}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="allergens">アレルギー情報</Label>
                    <Input
                      id="allergens"
                      value={formData.allergens.join(', ')}
                      onChange={(e) => setFormData({
                        ...formData, 
                        allergens: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                      })}
                      placeholder="gluten, dairy, eggs (カンマ区切り)"
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    キャンセル
                  </Button>
                  <Button onClick={editingItem ? handleUpdateItem : handleAddItem}>
                    {editingItem ? '更新' : '追加'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>メニューアイテム一覧</CardTitle>
            <CardDescription>
              {menuItems.length} 件のメニューアイテム
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">画像</TableHead>
                    <TableHead>料理名</TableHead>
                    <TableHead>カテゴリ</TableHead>
                    <TableHead>価格</TableHead>
                    <TableHead>状態</TableHead>
                    <TableHead className="w-32">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menuItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="w-12 h-12 bg-muted rounded overflow-hidden">
                          {item.image_url ? (
                            <Image
                              src={item.image_url}
                              alt={item.name}
                              width={48}
                              height={48}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <ImageIcon className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          {item.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getCategoryName(item.category_id)}</TableCell>
                      <TableCell className="font-mono">{formatPrice(item.price)}</TableCell>
                      <TableCell>
                        <Button
                          variant={item.is_available ? "default" : "secondary"}
                          size="sm"
                          onClick={() => toggleAvailability(item.id, item.is_available)}
                        >
                          {item.is_available ? '在庫あり' : '在庫切れ'}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditItem(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {menuItems.length === 0 && (
              <div className="text-center py-8">
                <UtensilsCrossed className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">メニューアイテムがありません</p>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  最初のメニューを追加
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}