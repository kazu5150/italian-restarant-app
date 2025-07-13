'use client'

import QRCode from 'react-qr-code'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Printer } from 'lucide-react'

interface QRGeneratorProps {
  tableNumber: number
  url: string
  size?: number
}

export function QRGenerator({ tableNumber, url, size = 256 }: QRGeneratorProps) {
  const handleDownload = () => {
    const svg = document.getElementById(`qr-${tableNumber}`)
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      canvas.width = size
      canvas.height = size
      ctx?.drawImage(img, 0, 0)
      
      const link = document.createElement('a')
      link.download = `table-${tableNumber}-qr.png`
      link.href = canvas.toDataURL()
      link.click()
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const svg = document.getElementById(`qr-${tableNumber}`)
    if (!svg) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Table ${tableNumber} QR Code</title>
        <style>
          body { 
            margin: 0; 
            padding: 40px; 
            text-align: center; 
            font-family: Arial, sans-serif; 
          }
          .qr-container { 
            display: inline-block; 
            padding: 20px; 
            border: 2px solid #000; 
            border-radius: 8px; 
          }
          h1 { 
            margin: 0 0 20px 0; 
            font-size: 24px; 
          }
          p { 
            margin: 20px 0 0 0; 
            font-size: 14px; 
            color: #666; 
          }
        </style>
      </head>
      <body>
        <div class="qr-container">
          <h1>テーブル ${tableNumber}</h1>
          ${svg.outerHTML}
          <p>QRコードをスキャンしてメニューを表示</p>
        </div>
      </body>
      </html>
    `)
    
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle>テーブル {tableNumber}</CardTitle>
        <CardDescription>QRコード</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center p-4 bg-white rounded-lg border">
          <QRCode
            id={`qr-${tableNumber}`}
            value={url}
            size={size}
            bgColor="#ffffff"
            fgColor="#000000"
            level="M"
          />
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleDownload} variant="outline" size="sm" className="flex-1">
            <Download className="mr-2 h-4 w-4" />
            ダウンロード
          </Button>
          <Button onClick={handlePrint} variant="outline" size="sm" className="flex-1">
            <Printer className="mr-2 h-4 w-4" />
            印刷
          </Button>
        </div>
        
        <p className="text-xs text-center text-muted-foreground">
          URL: {url}
        </p>
      </CardContent>
    </Card>
  )
}