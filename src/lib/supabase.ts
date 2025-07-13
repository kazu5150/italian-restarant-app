import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env.local file.')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

export type Tables = {
  tables: {
    id: string
    table_number: number
    qr_code: string
    status: 'available' | 'occupied' | 'cleaning'
    created_at: string
  }
  menu_categories: {
    id: string
    name: string
    display_order: number
    created_at: string
  }
  menu_items: {
    id: string
    category_id: string
    name: string
    description: string
    price: number
    image_url: string | null
    is_available: boolean
    allergens: string[]
    created_at: string
  }
  orders: {
    id: string
    table_id: string
    status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'
    total_amount: number
    special_requests: string | null
    created_at: string
  }
  order_items: {
    id: string
    order_id: string
    menu_item_id: string
    quantity: number
    unit_price: number
    created_at: string
  }
}

export type Table = Tables['tables']
export type MenuCategory = Tables['menu_categories']
export type MenuItem = Tables['menu_items']
export type Order = Tables['orders']
export type OrderItem = Tables['order_items']