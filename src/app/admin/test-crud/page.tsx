'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Database, 
  Plus, 
  Trash2, 
  TestTube, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'
import {
  menuCategoriesAdmin,
  menuItemsAdmin,
  tablesAdmin,
  ordersAdmin,
  statsAdmin,
  testConnection
} from '@/lib/supabase-admin'

interface TestResult {
  operation: string
  success: boolean
  message: string
  duration: number
}

export default function TestCRUDPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [categories, setCategories] = useState<{id: string, name: string, description?: string, display_order: number}[]>([])
  const [menuItems, setMenuItems] = useState<{id: string, name: string, description?: string, price: number, is_available: boolean, menu_categories?: {name: string}}[]>([])
  const [tables, setTables] = useState<{id: string, table_number: number, capacity: number, status: string}[]>([])
  const [newCategory, setNewCategory] = useState({ name: '', description: '' })
  const [newTable, setNewTable] = useState({ table_number: '', capacity: '4' })

  const runTest = async (testName: string, testFn: () => Promise<void>) => {
    const startTime = Date.now()
    try {
      await testFn()
      const duration = Date.now() - startTime
      setTestResults(prev => [...prev, {
        operation: testName,
        success: true,
        message: '成功',
        duration
      }])
    } catch (error) {
      const duration = Date.now() - startTime
      setTestResults(prev => [...prev, {
        operation: testName,
        success: false,
        message: error instanceof Error ? error.message : 'エラーが発生しました',
        duration
      }])
    }
  }

  const runAllTests = async () => {
    setIsRunning(true)
    setTestResults([])

    // 1. 接続テスト
    await runTest('データベース接続テスト', async () => {
      const result = await testConnection()
      if (!result) throw new Error('接続失敗')
    })

    // 2. カテゴリCRUDテスト
    let testCategoryId: string | null = null
    await runTest('カテゴリ作成テスト', async () => {
      const category = await menuCategoriesAdmin.create({
        name: 'テストカテゴリ',
        description: 'CRUD テスト用',
        display_order: 999
      })
      testCategoryId = category.id
    })

    if (testCategoryId) {
      await runTest('カテゴリ更新テスト', async () => {
        await menuCategoriesAdmin.update(testCategoryId!, {
          name: 'テストカテゴリ（更新済み）',
          description: 'CRUD テスト用（更新済み）'
        })
      })

      await runTest('カテゴリ削除テスト', async () => {
        await menuCategoriesAdmin.delete(testCategoryId!)
      })
    }

    // 3. テーブルCRUDテスト
    let testTableId: string | null = null
    await runTest('テーブル作成テスト', async () => {
      const table = await tablesAdmin.create({
        table_number: 999,
        capacity: 4,
        status: 'available'
      })
      testTableId = table.id
    })

    if (testTableId) {
      await runTest('テーブル更新テスト', async () => {
        await tablesAdmin.update(testTableId!, {
          capacity: 6,
          status: 'maintenance'
        })
      })

      await runTest('テーブル削除テスト', async () => {
        await tablesAdmin.delete(testTableId!)
      })
    }

    // 4. 読み取りテスト
    await runTest('カテゴリ一覧取得テスト', async () => {
      const data = await menuCategoriesAdmin.getAll()
      if (!Array.isArray(data)) throw new Error('データが配列ではありません')
    })

    await runTest('メニューアイテム一覧取得テスト', async () => {
      const data = await menuItemsAdmin.getAll()
      if (!Array.isArray(data)) throw new Error('データが配列ではありません')
    })

    await runTest('テーブル一覧取得テスト', async () => {
      const data = await tablesAdmin.getAll()
      if (!Array.isArray(data)) throw new Error('データが配列ではありません')
    })

    await runTest('注文一覧取得テスト', async () => {
      const data = await ordersAdmin.getAll()
      if (!Array.isArray(data)) throw new Error('データが配列ではありません')
    })

    await runTest('統計情報取得テスト', async () => {
      const stats = await statsAdmin.getDashboardStats()
      if (typeof stats.totalOrders !== 'number') throw new Error('統計データが不正です')
    })

    setIsRunning(false)
    toast.success('全てのテストが完了しました')
  }

  const loadData = async () => {
    try {
      const [categoriesData, menuItemsData, tablesData] = await Promise.all([
        menuCategoriesAdmin.getAll(),
        menuItemsAdmin.getAll(),
        tablesAdmin.getAll()
      ])
      
      setCategories(categoriesData)
      setMenuItems(menuItemsData)
      setTables(tablesData)
    } catch {
      toast.error('データの読み込みに失敗しました')
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateCategory = async () => {
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
      loadData()
    } catch {
      // エラーはsupabase-admin.tsで処理済み
    }
  }

  const handleCreateTable = async () => {
    if (!newTable.table_number.trim()) {
      toast.error('テーブル番号を入力してください')
      return
    }

    try {
      await tablesAdmin.create({
        table_number: parseInt(newTable.table_number),
        capacity: parseInt(newTable.capacity)
      })
      setNewTable({ table_number: '', capacity: '4' })
      loadData()
    } catch {
      // エラーはsupabase-admin.tsで処理済み
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('このカテゴリを削除しますか？')) return
    
    try {
      await menuCategoriesAdmin.delete(id)
      loadData()
    } catch {
      // エラーはsupabase-admin.tsで処理済み
    }
  }

  const handleDeleteTable = async (id: string) => {
    if (!confirm('このテーブルを削除しますか？')) return
    
    try {
      await tablesAdmin.delete(id)
      loadData()
    } catch {
      // エラーはsupabase-admin.tsで処理済み
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Database className="h-6 w-6" />
                CRUD操作テスト
              </h1>
              <p className="text-sm text-muted-foreground">
                Supabaseの全CRUD操作をテストします
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={loadData}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                データ再読み込み
              </Button>
              <Button
                onClick={runAllTests}
                disabled={isRunning}
                className="gap-2"
              >
                <TestTube className="h-4 w-4" />
                {isRunning ? '実行中...' : '全テスト実行'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="test-results" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="test-results">テスト結果</TabsTrigger>
            <TabsTrigger value="categories">カテゴリ管理</TabsTrigger>
            <TabsTrigger value="tables">テーブル管理</TabsTrigger>
            <TabsTrigger value="menu-items">メニュー表示</TabsTrigger>
          </TabsList>

          <TabsContent value="test-results" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5" />
                  CRUD操作テスト結果
                </CardTitle>
                <CardDescription>
                  全ての基本的なデータベース操作をテストします
                </CardDescription>
              </CardHeader>
              <CardContent>
                {testResults.length === 0 && !isRunning ? (
                  <div className="text-center py-8">
                    <TestTube className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      「全テスト実行」ボタンをクリックしてテストを開始してください
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {testResults.map((result, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          result.success 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {result.success ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                          <div>
                            <p className="font-medium">{result.operation}</p>
                            <p className="text-sm text-muted-foreground">
                              {result.message}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {result.duration}ms
                        </Badge>
                      </div>
                    ))}
                    {isRunning && (
                      <div className="flex items-center gap-3 p-3 rounded-lg border bg-blue-50 border-blue-200">
                        <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
                        <p className="font-medium">テスト実行中...</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>カテゴリ作成テスト</CardTitle>
                <CardDescription>
                  新しいカテゴリを作成してCRUD操作をテストします
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category-name">カテゴリ名</Label>
                    <Input
                      id="category-name"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="例: テストカテゴリ"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category-description">説明</Label>
                    <Input
                      id="category-description"
                      value={newCategory.description}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="例: テスト用カテゴリです"
                    />
                  </div>
                </div>
                <Button onClick={handleCreateCategory} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  カテゴリを作成
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>既存カテゴリ一覧</CardTitle>
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
                        <p className="text-sm text-muted-foreground">
                          {category.description}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tables" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>テーブル作成テスト</CardTitle>
                <CardDescription>
                  新しいテーブルを作成してCRUD操作をテストします
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="table-number">テーブル番号</Label>
                    <Input
                      id="table-number"
                      type="number"
                      value={newTable.table_number}
                      onChange={(e) => setNewTable(prev => ({ ...prev, table_number: e.target.value }))}
                      placeholder="例: 10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="table-capacity">席数</Label>
                    <Select
                      value={newTable.capacity}
                      onValueChange={(value) => setNewTable(prev => ({ ...prev, capacity: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2席</SelectItem>
                        <SelectItem value="4">4席</SelectItem>
                        <SelectItem value="6">6席</SelectItem>
                        <SelectItem value="8">8席</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleCreateTable} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  テーブルを作成
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>既存テーブル一覧</CardTitle>
                <CardDescription>
                  {tables.length} 件のテーブル
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tables.map((table) => (
                    <div
                      key={table.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">テーブル {table.table_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {table.capacity}席 - {table.status}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTable(table.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="menu-items" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>メニューアイテム一覧</CardTitle>
                <CardDescription>
                  {menuItems.length} 件のメニューアイテム（読み取り専用）
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {menuItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium">{item.name}</h3>
                        <Badge variant={item.is_available ? "default" : "secondary"}>
                          {item.is_available ? "販売中" : "販売停止"}
                        </Badge>
                      </div>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-primary">
                          ¥{item.price.toLocaleString()}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {item.menu_categories?.name}
                        </span>
                      </div>
                    </div>
                  ))}
                  {menuItems.length === 0 && (
                    <div className="col-span-full text-center py-8">
                      <AlertCircle className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        メニューアイテムがありません
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}