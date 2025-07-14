'use client'

import { useEffect, useRef, useState } from 'react'
import QrScanner from 'qr-scanner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, CameraOff } from 'lucide-react'

interface QRScannerProps {
  onScanSuccess: (result: string) => void
  onError?: (error: string) => void
}

export function QRScanner({ onScanSuccess, onError }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [scanner, setScanner] = useState<QrScanner | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [hasCamera, setHasCamera] = useState(true)

  useEffect(() => {
    const initScanner = async () => {
      if (!videoRef.current) return

      try {
        const qrScanner = new QrScanner(
          videoRef.current,
          (result) => {
            onScanSuccess(result.data)
          },
          {
            onDecodeError: () => {
              // QR decode error (non-critical)
            },
            highlightScanRegion: true,
            highlightCodeOutline: true,
          }
        )

        setScanner(qrScanner)
      } catch {
        setHasCamera(false)
        onError?.('カメラの初期化に失敗しました')
      }
    }

    initScanner()

    return () => {
      scanner?.destroy()
    }
  }, [onScanSuccess, onError])

  const startScanning = async () => {
    if (!scanner) return

    try {
      await scanner.start()
      setIsScanning(true)
    } catch {
      setHasCamera(false)
      onError?.('カメラへのアクセスに失敗しました')
    }
  }

  const stopScanning = () => {
    scanner?.stop()
    setIsScanning(false)
  }

  if (!hasCamera) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <CameraOff className="h-6 w-6" />
            カメラエラー
          </CardTitle>
          <CardDescription>
            カメラへのアクセスができません。ブラウザの設定を確認してください。
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Camera className="h-6 w-6" />
          QRコードスキャン
        </CardTitle>
        <CardDescription>
          テーブルのQRコードをカメラで読み取ってください
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted">
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            playsInline
            muted
          />
          {!isScanning && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/80">
              <p className="text-sm text-muted-foreground">カメラ準備中...</p>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          {!isScanning ? (
            <Button onClick={startScanning} className="flex-1">
              <Camera className="mr-2 h-4 w-4" />
              スキャン開始
            </Button>
          ) : (
            <Button onClick={stopScanning} variant="outline" className="flex-1">
              <CameraOff className="mr-2 h-4 w-4" />
              停止
            </Button>
          )}
        </div>
        
        <p className="text-xs text-center text-muted-foreground">
          QRコードが認識されない場合は、明るい場所で再度お試しください
        </p>
      </CardContent>
    </Card>
  )
}