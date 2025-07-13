'use client'

import { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  Store,
  Users,
  Bell,
  Database,
  Clock,
  Wifi,
  Save,
  RotateCcw
} from 'lucide-react'
import { toast } from 'sonner'

interface RestaurantSettings {
  name: string
  description: string
  address: string
  phone: string
  email: string
  openingHours: {
    [key: string]: { open: string; close: string; isOpen: boolean }
  }
  maxTables: number
  defaultTableCapacity: number
  orderTimeoutMinutes: number
  enableNotifications: boolean
  enableAutoConfirm: boolean
  enableQROrdering: boolean
  taxRate: number
  serviceCharge: number
  currency: string
  language: string
  theme: string
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<RestaurantSettings>({
    name: 'Bella Vista',
    description: '本格的なイタリア料理をお楽しみください',
    address: '東京都港区麻布十番1-2-3',
    phone: '03-1234-5678',
    email: 'info@bellavista.jp',
    openingHours: {
      monday: { open: '11:00', close: '22:00', isOpen: true },
      tuesday: { open: '11:00', close: '22:00', isOpen: true },
      wednesday: { open: '11:00', close: '22:00', isOpen: true },
      thursday: { open: '11:00', close: '22:00', isOpen: true },
      friday: { open: '11:00', close: '23:00', isOpen: true },
      saturday: { open: '11:00', close: '23:00', isOpen: true },
      sunday: { open: '11:00', close: '21:00', isOpen: true }
    },
    maxTables: 20,
    defaultTableCapacity: 4,
    orderTimeoutMinutes: 30,
    enableNotifications: true,
    enableAutoConfirm: false,
    enableQROrdering: true,
    taxRate: 10,
    serviceCharge: 0,
    currency: 'JPY',
    language: 'ja',
    theme: 'light'
  })
  
  const [loading, setLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const dayNames = {
    monday: '月曜日',
    tuesday: '火曜日',
    wednesday: '水曜日',
    thursday: '木曜日',
    friday: '金曜日',
    saturday: '土曜日',
    sunday: '日曜日'
  }

  const handleSettingChange = (key: string, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
    setHasChanges(true)
  }

  const handleOpeningHoursChange = (day: string, field: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: {
          ...prev.openingHours[day],
          [field]: value
        }
      }
    }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // In a real app, this would save to database or configuration service
      // For now, we'll just simulate a save operation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('設定を保存しました')
      setHasChanges(false)
    } catch {
      toast.error('設定の保存に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    // Reset to default values
    setSettings(prev => ({
      ...prev,
      // Reset specific values to defaults
    }))
    setHasChanges(true)
    toast.info('設定をリセットしました')
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">システム設定</h3>
              <p className="text-sm text-muted-foreground">
                レストランの基本設定と動作を管理
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={loading}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                リセット
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!hasChanges || loading}
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? '保存中...' : '保存'}
              </Button>
            </div>
          </div>

          {hasChanges && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <p className="text-sm text-orange-800">
                  未保存の変更があります。保存ボタンをクリックして変更を適用してください。
                </p>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="general" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="general">基本設定</TabsTrigger>
              <TabsTrigger value="hours">営業時間</TabsTrigger>
              <TabsTrigger value="ordering">注文設定</TabsTrigger>
              <TabsTrigger value="notifications">通知設定</TabsTrigger>
              <TabsTrigger value="system">システム</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    レストラン情報
                  </CardTitle>
                  <CardDescription>
                    基本的なレストラン情報を設定します
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">レストラン名</Label>
                      <Input
                        id="name"
                        value={settings.name}
                        onChange={(e) => handleSettingChange('name', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">電話番号</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={settings.phone}
                        onChange={(e) => handleSettingChange('phone', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">説明</Label>
                    <Textarea
                      id="description"
                      value={settings.description}
                      onChange={(e) => handleSettingChange('description', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">住所</Label>
                    <Textarea
                      id="address"
                      value={settings.address}
                      onChange={(e) => handleSettingChange('address', e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">メールアドレス</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.email}
                      onChange={(e) => handleSettingChange('email', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="hours" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    営業時間設定
                  </CardTitle>
                  <CardDescription>
                    各曜日の営業時間を設定します
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(settings.openingHours).map(([day, hours]) => (
                    <div key={day} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="w-20">
                        <Label>{dayNames[day as keyof typeof dayNames]}</Label>
                      </div>
                      
                      <Switch
                        checked={hours.isOpen}
                        onCheckedChange={(checked) => 
                          handleOpeningHoursChange(day, 'isOpen', checked)
                        }
                      />
                      
                      {hours.isOpen ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={hours.open}
                            onChange={(e) => 
                              handleOpeningHoursChange(day, 'open', e.target.value)
                            }
                            className="w-32"
                          />
                          <span>〜</span>
                          <Input
                            type="time"
                            value={hours.close}
                            onChange={(e) => 
                              handleOpeningHoursChange(day, 'close', e.target.value)
                            }
                            className="w-32"
                          />
                        </div>
                      ) : (
                        <Badge variant="secondary">定休日</Badge>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ordering" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    注文・テーブル設定
                  </CardTitle>
                  <CardDescription>
                    注文システムとテーブル管理の設定
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="maxTables">最大テーブル数</Label>
                      <Input
                        id="maxTables"
                        type="number"
                        min="1"
                        max="100"
                        value={settings.maxTables}
                        onChange={(e) => handleSettingChange('maxTables', parseInt(e.target.value))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="defaultCapacity">デフォルト席数</Label>
                      <Input
                        id="defaultCapacity"
                        type="number"
                        min="1"
                        max="20"
                        value={settings.defaultTableCapacity}
                        onChange={(e) => handleSettingChange('defaultTableCapacity', parseInt(e.target.value))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="orderTimeout">注文タイムアウト（分）</Label>
                      <Input
                        id="orderTimeout"
                        type="number"
                        min="5"
                        max="120"
                        value={settings.orderTimeoutMinutes}
                        onChange={(e) => handleSettingChange('orderTimeoutMinutes', parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="taxRate">消費税率（%）</Label>
                      <Input
                        id="taxRate"
                        type="number"
                        min="0"
                        max="20"
                        step="0.1"
                        value={settings.taxRate}
                        onChange={(e) => handleSettingChange('taxRate', parseFloat(e.target.value))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="serviceCharge">サービス料（%）</Label>
                      <Input
                        id="serviceCharge"
                        type="number"
                        min="0"
                        max="20"
                        step="0.1"
                        value={settings.serviceCharge}
                        onChange={(e) => handleSettingChange('serviceCharge', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="qr-ordering">QRコード注文システム</Label>
                      <p className="text-sm text-muted-foreground">
                        顧客がQRコードで注文できる機能
                      </p>
                    </div>
                    <Switch
                      id="qr-ordering"
                      checked={settings.enableQROrdering}
                      onCheckedChange={(checked) => handleSettingChange('enableQROrdering', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="auto-confirm">自動注文確認</Label>
                      <p className="text-sm text-muted-foreground">
                        注文を自動的に確認状態にする
                      </p>
                    </div>
                    <Switch
                      id="auto-confirm"
                      checked={settings.enableAutoConfirm}
                      onCheckedChange={(checked) => handleSettingChange('enableAutoConfirm', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    通知設定
                  </CardTitle>
                  <CardDescription>
                    システム通知と アラートの設定
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="notifications">プッシュ通知</Label>
                      <p className="text-sm text-muted-foreground">
                        新しい注文やステータス変更の通知
                      </p>
                    </div>
                    <Switch
                      id="notifications"
                      checked={settings.enableNotifications}
                      onCheckedChange={(checked) => handleSettingChange('enableNotifications', checked)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-4">
                        <CardTitle className="text-base">注文アラート</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">新規注文</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">調理完了</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">キャンセル</span>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-4">
                        <CardTitle className="text-base">システムアラート</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">在庫切れ</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">エラー発生</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">売上目標達成</span>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    システム設定
                  </CardTitle>
                  <CardDescription>
                    データベースとシステムの詳細設定
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="language">言語</Label>
                      <select
                        id="language"
                        value={settings.language}
                        onChange={(e) => handleSettingChange('language', e.target.value)}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="ja">日本語</option>
                        <option value="en">English</option>
                        <option value="ko">한국어</option>
                        <option value="zh">中文</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency">通貨</Label>
                      <select
                        id="currency"
                        value={settings.currency}
                        onChange={(e) => handleSettingChange('currency', e.target.value)}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="JPY">日本円 (¥)</option>
                        <option value="USD">米ドル ($)</option>
                        <option value="EUR">ユーロ (€)</option>
                      </select>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">データベース情報</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Wifi className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium">接続状態</span>
                          </div>
                          <Badge className="bg-green-100 text-green-800">接続中</Badge>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Database className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium">最終バックアップ</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date().toLocaleDateString('ja-JP')} 03:00
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button variant="outline" className="w-full">
                      <Database className="h-4 w-4 mr-2" />
                      データベースバックアップを実行
                    </Button>
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