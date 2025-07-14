'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

interface ImageUploadProps {
  onImageUpload: (file: File) => Promise<string>
  currentImageUrl?: string
  className?: string
  disabled?: boolean
}

export function ImageUpload({ 
  onImageUpload, 
  currentImageUrl, 
  className = '',
  disabled = false
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)

  const validateFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!validTypes.includes(file.type)) {
      toast.error('サポートされていないファイル形式です。JPEG、PNG、WebP、GIFのみ対応しています。')
      return false
    }

    if (file.size > maxSize) {
      toast.error('ファイルサイズが大きすぎます。5MB以下のファイルをアップロードしてください。')
      return false
    }

    return true
  }

  const handleFileUpload = useCallback(async (file: File) => {
    if (!validateFile(file)) return
    
    setIsUploading(true)
    try {
      const imageUrl = await onImageUpload(file)
      setPreviewUrl(imageUrl)
      toast.success('画像のアップロードが完了しました')
    } catch (error) {
      console.error('画像アップロードエラー:', error)
      toast.error('画像のアップロードに失敗しました')
    } finally {
      setIsUploading(false)
    }
  }, [onImageUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (disabled) return

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }, [disabled, handleFileUpload])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
    // Reset the input value to allow selecting the same file again
    e.target.value = ''
  }, [handleFileUpload])

  const removeImage = useCallback(() => {
    setPreviewUrl(null)
    toast.info('画像が削除されました')
  }, [])

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          メニュー画像
        </CardTitle>
        <CardDescription>
          画像をドラッグ&ドロップするか、クリックしてファイルを選択してください
        </CardDescription>
      </CardHeader>
      <CardContent>
        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt="プレビュー"
              className="w-full h-48 object-cover rounded-lg border"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={removeImage}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${isDragging 
                ? 'border-primary bg-primary/10' 
                : 'border-muted-foreground/25 hover:border-primary/50'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !disabled && document.getElementById('image-upload')?.click()}
          >
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
              disabled={disabled}
            />
            
            <div className="flex flex-col items-center gap-4">
              <Upload className={`h-12 w-12 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
              <div>
                <p className="text-sm font-medium">
                  {isDragging ? '画像をドロップしてください' : '画像をアップロード'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPEG、PNG、WebP、GIF（最大5MB）
                </p>
              </div>
            </div>
          </div>
        )}
        
        {isUploading && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              アップロード中...
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}