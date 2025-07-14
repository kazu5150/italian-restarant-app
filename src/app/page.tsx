'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { QRScanner } from '@/components/qr-scanner'
import { SetupNotice } from '@/components/setup-notice'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { UtensilsCrossed, Users, QrCode } from 'lucide-react'
import { toast } from 'sonner'

export default function Home() {
  const [manualTableNumber, setManualTableNumber] = useState('')
  const router = useRouter()

  // Check if Supabase is configured
  const isSupabaseConfigured = 
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project-ref.supabase.co'

  if (!isSupabaseConfigured) {
    return <SetupNotice />
  }

  const handleQRScanSuccess = (data: string) => {
    try {
      const url = new URL(data)
      const pathParts = url.pathname.split('/')
      const tableIndex = pathParts.indexOf('table')
      
      if (tableIndex !== -1 && pathParts[tableIndex + 1]) {
        const tableId = pathParts[tableIndex + 1]
        toast.success(`テーブル ${tableId} を認識しました`)
        router.push(`/table/${tableId}/menu`)
      } else {
        toast.error('無効なQRコードです')
      }
    } catch {
      toast.error('QRコードの読み取りに失敗しました')
    }
  }

  const handleManualEntry = () => {
    if (!manualTableNumber) {
      toast.error('テーブル番号を入力してください')
      return
    }
    
    const tableNum = parseInt(manualTableNumber)
    if (isNaN(tableNum) || tableNum < 1 || tableNum > 20) {
      toast.error('有効なテーブル番号を入力してください（1-20）')
      return
    }
    
    router.push(`/table/${tableNum}/menu`)
  }

  const handleQRError = (error: string) => {
    toast.error(error)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        {/* Theme Toggle */}
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <UtensilsCrossed className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-primary">
              Bella Vista
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            イタリアンレストラン / Italian Restaurant
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            テーブルのQRコードをスキャンするか、テーブル番号を入力してください
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* QR Scanner Section */}
          <div className="flex flex-col items-center">
            <QRScanner 
              onScanSuccess={handleQRScanSuccess}
              onError={handleQRError}
            />
          </div>

          <div className="flex items-center gap-4">
            <Separator className="flex-1" />
            <span className="text-sm text-muted-foreground">または</span>
            <Separator className="flex-1" />
          </div>

          {/* Manual Table Entry */}
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Users className="h-5 w-5" />
                テーブル番号入力
              </CardTitle>
              <CardDescription>
                QRコードが読み取れない場合はこちら
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="table-number">テーブル番号</Label>
                <Input
                  id="table-number"
                  type="number"
                  placeholder="例: 5"
                  min="1"
                  max="20"
                  value={manualTableNumber}
                  onChange={(e) => setManualTableNumber(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleManualEntry()
                    }
                  }}
                />
              </div>
              <Button onClick={handleManualEntry} className="w-full">
                メニューを表示
              </Button>
            </CardContent>
          </Card>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <QrCode className="h-5 w-5" />
                  ご利用方法
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>テーブルのQRコードをスキャン</li>
                  <li>メニューから好きな料理を選択</li>
                  <li>カートに追加して注文確定</li>
                  <li>調理状況をリアルタイムで確認</li>
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <UtensilsCrossed className="h-5 w-5" />
                  Bella Vista について
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>
                  本格的なイタリア料理を現代的なスタイルでお楽しみいただけます。
                </p>
                <p>
                  新鮮な食材と伝統的な調理法で、心温まるひとときを提供いたします。
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Admin Link */}
          <div className="text-center mt-8">
            <Button variant="ghost" size="sm" asChild>
              <a href="/admin">スタッフ管理画面</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
