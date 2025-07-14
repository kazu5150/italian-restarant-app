// Supabase管理者向けCRUD操作ヘルパー
import { supabase } from './supabase'
import { toast } from 'sonner'

// =============================================
// IMAGE UPLOAD HELPERS
// =============================================

export const imageUploadAdmin = {
  // ストレージバケットの存在確認 (開発用: チェックをスキップ)
  async ensureBucket(): Promise<void> {
    try {
      const { data: buckets, error: listError } = await supabase.storage.listBuckets()
      
      if (listError) {
        console.error('バケット一覧取得エラー:', listError)
        console.warn('バケット存在チェックをスキップして続行します（開発モード）')
        
        // 開発環境ではバケット存在チェックをスキップ
        return
      }

      console.log('利用可能なバケット:', buckets)
      const bucketExists = buckets?.some(bucket => bucket.name === 'menu-images')
      console.log('menu-imagesバケットの存在:', bucketExists)
      
      if (!bucketExists) {
        // バケット一覧をログで確認
        console.log('バケット一覧の詳細:')
        buckets?.forEach(bucket => {
          console.log(`- ID: ${bucket.id}, Name: ${bucket.name}, Public: ${bucket.public}`)
        })
        
        console.warn('menu-imagesバケットが検出されませんが、アップロードを試行します')
        // バケットが見つからない場合でも、アップロードを試行
        return
      }
    } catch (error) {
      // 予期しないエラーの場合でも続行
      console.error('バケット確認中にエラーが発生しましたが、アップロードを試行します:', error)
      return
    }
  },

  // 画像をSupabaseストレージにアップロード
  async uploadImage(file: File, path: string): Promise<string> {
    try {
      // バケットの存在確認
      await this.ensureBucket()

      const { data, error } = await supabase.storage
        .from('menu-images')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (error) {
        console.error('画像アップロードエラー:', error)
        throw new Error(`画像のアップロードに失敗しました: ${error.message}`)
      }

      // パブリックURLを取得
      const { data: publicUrlData } = supabase.storage
        .from('menu-images')
        .getPublicUrl(data.path)

      return publicUrlData.publicUrl
    } catch (error) {
      console.error('画像アップロード処理エラー:', error)
      throw error
    }
  },

  // 画像を削除
  async deleteImage(path: string): Promise<void> {
    const { error } = await supabase.storage
      .from('menu-images')
      .remove([path])

    if (error) {
      console.error('画像削除エラー:', error)
      throw new Error('画像の削除に失敗しました')
    }
  },

  // メニューアイテム用の画像パスを生成
  generateImagePath(categoryName: string, itemName: string, fileExtension: string): string {
    const timestamp = Date.now()
    const sanitizedCategory = categoryName.toLowerCase().replace(/[^a-z0-9]/g, '-')
    const sanitizedItem = itemName.toLowerCase().replace(/[^a-z0-9]/g, '-')
    return `${sanitizedCategory}/${sanitizedItem}-${timestamp}.${fileExtension}`
  },

  // デバッグ用：ストレージバケットの状態を確認
  async debugStorageStatus(): Promise<void> {
    try {
      const { data: buckets, error: listError } = await supabase.storage.listBuckets()
      console.log('利用可能なバケット:', buckets)
      
      if (listError) {
        console.error('バケット一覧取得エラー:', listError)
        return
      }

      const menuImagesBucket = buckets?.find(bucket => bucket.name === 'menu-images')
      console.log('menu-imagesバケット:', menuImagesBucket)

      if (menuImagesBucket) {
        const { data: files, error: filesError } = await supabase.storage
          .from('menu-images')
          .list()
        
        console.log('menu-imagesバケット内ファイル:', files)
        if (filesError) {
          console.error('ファイル一覧取得エラー:', filesError)
        }
      }
    } catch (error) {
      console.error('ストレージ状態確認エラー:', error)
    }
  }
}

// =============================================
// MENU CATEGORIES CRUD
// =============================================

export const menuCategoriesAdmin = {
  // 全カテゴリ取得
  async getAll() {
    const { data, error } = await supabase
      .from('menu_categories')
      .select('*')
      .order('display_order')
    
    if (error) {
      toast.error('カテゴリの取得に失敗しました')
      return []
    }
    return data || []
  },

  // カテゴリ作成
  async create(category: {
    name: string
    description?: string
    display_order: number
  }) {
    const { data, error } = await supabase
      .from('menu_categories')
      .insert(category)
      .select()
      .single()
    
    if (error) {
      toast.error('カテゴリの作成に失敗しました')
      throw error
    }
    
    toast.success('カテゴリを作成しました')
    return data
  },

  // カテゴリ更新
  async update(id: string, updates: {
    name?: string
    description?: string
    display_order?: number
  }) {
    const { data, error } = await supabase
      .from('menu_categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      toast.error('カテゴリの更新に失敗しました')
      throw error
    }
    
    toast.success('カテゴリを更新しました')
    return data
  },

  // カテゴリ削除
  async delete(id: string) {
    // まず関連するメニューアイテムの数を確認
    const { count } = await supabase
      .from('menu_items')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id)
    
    if (count && count > 0) {
      toast.error('このカテゴリにはメニューアイテムが含まれているため削除できません')
      throw new Error('Category has menu items')
    }
    
    const { error } = await supabase
      .from('menu_categories')
      .delete()
      .eq('id', id)
    
    if (error) {
      toast.error('カテゴリの削除に失敗しました')
      throw error
    }
    
    toast.success('カテゴリを削除しました')
  }
}

// =============================================
// MENU ITEMS CRUD
// =============================================

export const menuItemsAdmin = {
  // 全メニューアイテム取得
  async getAll() {
    const { data, error } = await supabase
      .from('menu_items')
      .select(`
        *,
        menu_categories (
          name,
          display_order
        )
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      toast.error('メニューアイテムの取得に失敗しました')
      return []
    }
    return data || []
  },

  // メニューアイテム作成
  async create(item: {
    name: string
    description?: string
    price: number
    category_id: string
    image_url?: string
    is_available?: boolean
    allergens?: string[]
  }) {
    const { data, error } = await supabase
      .from('menu_items')
      .insert({
        ...item,
        is_available: item.is_available ?? true,
        allergens: item.allergens || []
      })
      .select()
      .single()
    
    if (error) {
      toast.error('メニューアイテムの作成に失敗しました')
      throw error
    }
    
    toast.success('メニューアイテムを作成しました')
    return data
  },

  // メニューアイテム更新
  async update(id: string, updates: {
    name?: string
    description?: string
    price?: number
    category_id?: string
    image_url?: string
    is_available?: boolean
    allergens?: string[]
  }) {
    const { data, error } = await supabase
      .from('menu_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      toast.error('メニューアイテムの更新に失敗しました')
      throw error
    }
    
    toast.success('メニューアイテムを更新しました')
    return data
  },

  // メニューアイテム削除
  async delete(id: string) {
    // 注文中のアイテムをチェック
    const { count } = await supabase
      .from('order_items')
      .select('*', { count: 'exact', head: true })
      .eq('menu_item_id', id)
    
    if (count && count > 0) {
      toast.error('このメニューアイテムは注文履歴があるため削除できません。代わりに販売停止にしてください。')
      throw new Error('Menu item has order history')
    }
    
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id)
    
    if (error) {
      toast.error('メニューアイテムの削除に失敗しました')
      throw error
    }
    
    toast.success('メニューアイテムを削除しました')
  },

  // 在庫状況切り替え
  async toggleAvailability(id: string) {
    // 現在の状態を取得
    const { data: currentItem, error: fetchError } = await supabase
      .from('menu_items')
      .select('is_available')
      .eq('id', id)
      .single()
    
    if (fetchError) {
      toast.error('メニューアイテムの取得に失敗しました')
      throw fetchError
    }
    
    const { data, error } = await supabase
      .from('menu_items')
      .update({ is_available: !currentItem.is_available })
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      toast.error('在庫状況の更新に失敗しました')
      throw error
    }
    
    toast.success(`メニューアイテムを${data.is_available ? '販売中' : '販売停止'}にしました`)
    return data
  }
}

// =============================================
// TABLES CRUD
// =============================================

export const tablesAdmin = {
  // 全テーブル取得
  async getAll() {
    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .order('table_number')
    
    if (error) {
      toast.error('テーブルの取得に失敗しました')
      return []
    }
    return data || []
  },

  // テーブル作成
  async create(table: {
    table_number: number
    capacity: number
    status?: 'available' | 'occupied' | 'reserved' | 'maintenance'
  }) {
    const { data, error } = await supabase
      .from('tables')
      .insert({
        ...table,
        status: table.status || 'available'
      })
      .select()
      .single()
    
    if (error) {
      toast.error('テーブルの作成に失敗しました')
      throw error
    }
    
    toast.success('テーブルを作成しました')
    return data
  },

  // テーブル更新
  async update(id: string, updates: {
    table_number?: number
    capacity?: number
    status?: 'available' | 'occupied' | 'reserved' | 'maintenance'
  }) {
    const { data, error } = await supabase
      .from('tables')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      toast.error('テーブルの更新に失敗しました')
      throw error
    }
    
    toast.success('テーブルを更新しました')
    return data
  },

  // テーブル削除
  async delete(id: string) {
    // 関連する注文をチェック
    const { count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('table_id', id)
    
    if (count && count > 0) {
      toast.error('このテーブルには注文履歴があるため削除できません')
      throw new Error('Table has order history')
    }
    
    const { error } = await supabase
      .from('tables')
      .delete()
      .eq('id', id)
    
    if (error) {
      toast.error('テーブルの削除に失敗しました')
      throw error
    }
    
    toast.success('テーブルを削除しました')
  }
}

// =============================================
// ORDERS CRUD
// =============================================

export const ordersAdmin = {
  // 注文一覧取得（フィルタ付き）
  async getAll(filters?: {
    status?: string
    table_id?: string
    date_from?: string
    date_to?: string
  }) {
    let query = supabase
      .from('orders')
      .select(`
        *,
        tables (
          table_number
        ),
        order_items (
          *,
          menu_items (
            name,
            price
          )
        )
      `)
    
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    
    if (filters?.table_id) {
      query = query.eq('table_id', filters.table_id)
    }
    
    if (filters?.date_from) {
      query = query.gte('created_at', filters.date_from)
    }
    
    if (filters?.date_to) {
      query = query.lte('created_at', filters.date_to)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) {
      toast.error('注文の取得に失敗しました')
      return []
    }
    return data || []
  },

  // 注文ステータス更新
  async updateStatus(id: string, status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled') {
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      toast.error('注文ステータスの更新に失敗しました')
      throw error
    }
    
    const statusLabels = {
      pending: '受付中',
      confirmed: '確定',
      preparing: '調理中', 
      ready: '提供準備完了',
      served: '提供済み',
      cancelled: 'キャンセル'
    }
    
    toast.success(`注文を${statusLabels[status]}に更新しました`)
    return data
  },

  // 注文削除（キャンセル状態のみ）
  async delete(id: string) {
    // 注文の現在のステータスを確認
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('status')
      .eq('id', id)
      .single()
    
    if (fetchError) {
      toast.error('注文の取得に失敗しました')
      throw fetchError
    }
    
    if (order.status !== 'cancelled') {
      toast.error('キャンセル済みの注文のみ削除できます')
      throw new Error('Only cancelled orders can be deleted')
    }
    
    // 関連する注文アイテムを削除
    const { error: itemsError } = await supabase
      .from('order_items')
      .delete()
      .eq('order_id', id)
    
    if (itemsError) {
      toast.error('注文アイテムの削除に失敗しました')
      throw itemsError
    }
    
    // 注文を削除
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id)
    
    if (error) {
      toast.error('注文の削除に失敗しました')
      throw error
    }
    
    toast.success('注文を削除しました')
  }
}

// =============================================
// 統計情報取得
// =============================================

export const statsAdmin = {
  // ダッシュボード統計取得
  async getDashboardStats() {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // 過去24時間
      
      if (error) throw error
      
      const totalOrders = orders.length
      const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0)
      const pendingOrders = orders.filter(o => o.status === 'pending').length
      const preparingOrders = orders.filter(o => o.status === 'preparing').length
      const readyOrders = orders.filter(o => o.status === 'ready').length
      const servedOrders = orders.filter(o => o.status === 'served').length
      
      return {
        totalOrders,
        totalRevenue,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        pendingOrders,
        preparingOrders,
        readyOrders,
        servedOrders
      }
    } catch {
      toast.error('統計情報の取得に失敗しました')
      return {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        pendingOrders: 0,
        preparingOrders: 0,
        readyOrders: 0,
        servedOrders: 0
      }
    }
  }
}

// =============================================
// データベース接続テスト
// =============================================

export const testConnection = async () => {
  try {
    const { error } = await supabase
      .from('menu_categories')
      .select('count(*)')
      .single()
    
    if (error) throw error
    
    // Supabase connection successful
    toast.success('データベース接続成功')
    return true
  } catch {
    toast.error('データベース接続失敗')
    return false
  }
}