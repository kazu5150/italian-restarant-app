'use client'

import { useState, useEffect } from 'react'
import { supabase, type Table } from '@/lib/supabase'
import AdminLayout from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { QRGenerator } from '@/components/qr-generator'
import { 
  ArrowLeft,
  Plus,
  QrCode,
  Users,
  Trash2,
  Download,
  Printer
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function AdminTablesPage() {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newTableNumber, setNewTableNumber] = useState('')

  useEffect(() => {
    fetchTables()
  }, [])

  const fetchTables = async () => {
    try {
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .order('table_number')

      if (error) throw error
      setTables(data || [])
    } catch (error) {
      console.error('Error fetching tables:', error)
      toast.error('テーブルデータの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const addTable = async () => {
    if (!newTableNumber) {
      toast.error('テーブル番号を入力してください')
      return
    }

    const tableNumber = parseInt(newTableNumber)
    if (isNaN(tableNumber) || tableNumber < 1) {
      toast.error('有効なテーブル番号を入力してください')
      return
    }

    // Check if table number already exists
    if (tables.some(table => table.table_number === tableNumber)) {
      toast.error('このテーブル番号は既に存在します')
      return
    }

    try {
      const qrCodeUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/table/${tableNumber}/menu`
      
      const { error } = await supabase
        .from('tables')
        .insert({
          table_number: tableNumber,
          qr_code: qrCodeUrl,
          status: 'available'
        })

      if (error) throw error
      
      toast.success('テーブルを追加しました')
      setNewTableNumber('')
      setShowAddDialog(false)
      fetchTables()
    } catch (error) {
      console.error('Error adding table:', error)
      toast.error('テーブルの追加に失敗しました')
    }
  }

  const updateTableStatus = async (tableId: string, status: Table['status']) => {
    try {
      const { error } = await supabase
        .from('tables')
        .update({ status })
        .eq('id', tableId)

      if (error) throw error
      
      toast.success('テーブルステータスを更新しました')
      fetchTables()
    } catch (error) {
      console.error('Error updating table status:', error)
      toast.error('ステータスの更新に失敗しました')
    }
  }

  const deleteTable = async (tableId: string) => {
    if (!confirm('このテーブルを削除してもよろしいですか？')) {
      return
    }

    try {
      const { error } = await supabase
        .from('tables')
        .delete()
        .eq('id', tableId)

      if (error) throw error
      
      toast.success('テーブルを削除しました')
      fetchTables()
    } catch (error) {
      console.error('Error deleting table:', error)
      toast.error('テーブルの削除に失敗しました')
    }
  }

  const getStatusBadge = (status: Table['status']) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-800">空席</Badge>
      case 'occupied':
        return <Badge className="bg-red-100 text-red-800">使用中</Badge>
      case 'cleaning':
        return <Badge className="bg-yellow-100 text-yellow-800">清掃中</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const downloadAllQRCodes = () => {
    // This would generate a PDF with all QR codes
    toast.info('全QRコードのダウンロード機能を準備中です')
  }

  const printAllQRCodes = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const qrCodesHtml = tables.map(table => `
      <div style="page-break-inside: avoid; margin-bottom: 40px; text-align: center; border: 2px solid #000; padding: 20px; display: inline-block; margin: 10px;">
        <h2 style="margin: 0 0 20px 0;">テーブル ${table.table_number}</h2>
        <div id="qr-${table.table_number}" style="margin: 20px 0;"></div>
        <p style="margin: 20px 0 0 0; font-size: 12px;">QRコードをスキャンしてメニューを表示</p>
      </div>
    `).join('')

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Codes - All Tables</title>
        <script src="https://unpkg.com/qrcode-generator@1.4.4/qrcode.js"></script>
        <style>
          body { 
            margin: 20px; 
            font-family: Arial, sans-serif; 
          }
          @media print {
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        ${qrCodesHtml}
        <script>
          ${tables.map(table => `
            const qr${table.table_number} = qrcode(0, 'M');
            qr${table.table_number}.addData('${table.qr_code}');
            qr${table.table_number}.make();
            document.getElementById('qr-${table.table_number}').innerHTML = qr${table.table_number}.createImgTag(4);
          `).join('\n')}
          window.onload = function() {
            setTimeout(() => {
              window.print();
              window.close();
            }, 1000);
          };
        </script>
      </body>
      </html>
    `)
    
    printWindow.document.close()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Users className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>テーブルデータを読み込み中...</p>
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
                  <h1 className="text-2xl font-bold">テーブル管理</h1>
                  <p className="text-sm text-muted-foreground">
                    テーブル設定とQRコード管理
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={downloadAllQRCodes}>
                  <Download className="h-4 w-4 mr-2" />
                  全QRダウンロード
                </Button>
                <Button variant="outline" size="sm" onClick={printAllQRCodes}>
                  <Printer className="h-4 w-4 mr-2" />
                  全QR印刷
                </Button>
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      テーブル追加
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>新しいテーブルを追加</DialogTitle>
                      <DialogDescription>
                        テーブル番号を入力してください。QRコードが自動生成されます。
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="table-number">テーブル番号</Label>
                        <Input
                          id="table-number"
                          type="number"
                          placeholder="例: 10"
                          value={newTableNumber}
                          onChange={(e) => setNewTableNumber(e.target.value)}
                          min="1"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                        キャンセル
                      </Button>
                      <Button onClick={addTable}>追加</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
        {tables.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Users className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">テーブルが登録されていません</p>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  最初のテーブルを追加
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tables.map((table) => (
              <Card key={table.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      テーブル {table.table_number}
                    </CardTitle>
                    {getStatusBadge(table.status)}
                  </div>
                  <CardDescription>
                    作成日: {new Date(table.created_at).toLocaleDateString('ja-JP')}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* QR Code Preview */}
                  <div className="bg-white p-4 rounded-lg border">
                    <QRGenerator
                      tableNumber={table.table_number}
                      url={table.qr_code}
                      size={120}
                    />
                  </div>
                  
                  {/* Status Control */}
                  <div className="space-y-2">
                    <Label>ステータス</Label>
                    <Select
                      value={table.status}
                      onValueChange={(value) => updateTableStatus(table.id, value as Table['status'])}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">空席</SelectItem>
                        <SelectItem value="occupied">使用中</SelectItem>
                        <SelectItem value="cleaning">清掃中</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href={table.qr_code} target="_blank">
                        <QrCode className="h-4 w-4 mr-1" />
                        プレビュー
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteTable(table.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    URL: {table.qr_code.split('/').slice(-3).join('/')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        </div>
      </div>
    </AdminLayout>
  )
}