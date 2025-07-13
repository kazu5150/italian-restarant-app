# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Bella Vista**, a modern QR code-based ordering system for Italian restaurants built with Next.js 14, Supabase, and shadcn/ui. The system enables customers to scan QR codes at restaurant tables to view menus, place orders, and track order status in real-time.

## Development Commands

```bash
# Development
npm run dev          # Start development server on http://localhost:3000
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# TypeScript checking (not in package.json but commonly used)
npx tsc --noEmit --skipLibCheck   # Check TypeScript syntax without compilation
```

## Core Architecture

### Application Structure
- **Customer Flow**: `/` → `/table/[id]/menu` → `/table/[id]/cart` → `/table/[id]/order/[orderId]`
- **Admin Flow**: `/admin` with nested routes for orders, menu, tables, reports, settings
- **State Management**: React Context (CartContext) with localStorage persistence
- **Database**: Supabase PostgreSQL with real-time subscriptions

### Key Architectural Patterns

#### 1. **Dual Interface Design**
The app serves two distinct user types:
- **Customers**: Mobile-first QR scanning and ordering (`/table/[id]/*`)
- **Staff**: Desktop admin dashboard (`/admin/*`)

#### 2. **Real-time Data Flow**
```
Customer Order → Supabase → Real-time Subscription → Admin Dashboard
```
Orders update live across all connected admin clients using Supabase subscriptions.

#### 3. **Cart State Management**
Cart state persists across page navigation using React Context + localStorage:
- Located in `src/contexts/CartContext.tsx`
- Automatically saves/loads cart data on page refresh
- Must be wrapped around customer pages only (not admin)

#### 4. **Database Abstraction Layers**
- **Base types**: `src/lib/supabase.ts` - Core Supabase client and TypeScript types
- **Admin operations**: `src/lib/supabase-admin.ts` - CRUD helpers with error handling and toast notifications
- **Shared utilities**: `src/lib/utils.ts` - Common functions like `formatPrice()`

### Database Schema Overview

Core entities and relationships:
```
tables (id, table_number, qr_code, status)
  ↓ 1:many
orders (id, table_id, status, total_amount, special_requests)
  ↓ 1:many  
order_items (id, order_id, menu_item_id, quantity, unit_price)

menu_categories (id, name, description, display_order)
  ↓ 1:many
menu_items (id, category_id, name, description, price, image_url, is_available, allergens)
```

**Critical Order Status Flow**: 
`pending → confirmed → preparing → ready → served → completed`

### Component Architecture

#### Admin Layout Pattern
All admin pages use `AdminLayout` wrapper:
```tsx
import AdminLayout from '@/components/admin/AdminLayout'

export default function AdminPage() {
  return (
    <AdminLayout>
      {/* page content */}
    </AdminLayout>
  )
}
```

#### CRUD Operation Pattern
Admin CRUD operations follow this pattern:
```tsx
import { menuCategoriesAdmin, menuItemsAdmin, tablesAdmin, ordersAdmin } from '@/lib/supabase-admin'

// All operations include error handling and toast notifications
await menuItemsAdmin.create(data)
await menuItemsAdmin.update(id, updates)
await menuItemsAdmin.delete(id)
```

## Critical Setup Requirements

### 1. Supabase Configuration
- **Environment**: Requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Schema**: Must run `supabase-schema.sql` to create tables
- **RLS Policies**: Must run `supabase-rls-policies.sql` for development CRUD access
- **Missing Column Fix**: If encountering "capacity does not exist" error, run `fix-tables-schema.sql`

### 2. Development vs Production Security
- **Development**: RLS policies allow unrestricted access (`USING (true)`)
- **Production**: Must implement proper authentication and role-based policies
- **Test Interface**: `/admin/test-crud` available for CRUD operation testing

### 3. Image Management
- Menu images stored in `public/images/menu/[category]/[item].png`
- Categories: antipasti, pasta, pizza, main, dessert, beverages
- Must use Next.js `Image` component for optimization

## Common Development Patterns

### Real-time Updates
```tsx
useEffect(() => {
  const subscription = supabase
    .channel('orders')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
      fetchOrders() // Refresh data
    })
    .subscribe()

  return () => supabase.removeChannel(subscription)
}, [])
```

### QR Code Integration
- **Generation**: Uses `react-qr-code` for table QR codes
- **Scanning**: Uses `qr-scanner` for customer QR code scanning
- **URL Pattern**: `${APP_URL}/table/${tableNumber}/menu`

### Error Handling
All database operations use consistent error handling:
```tsx
try {
  const result = await supabaseOperation()
  toast.success('Success message')
  return result
} catch (error) {
  console.error('Operation failed:', error)
  toast.error('User-friendly error message')
  throw error
}
```

## TypeScript Considerations

### Core Types
All database types are defined in `src/lib/supabase.ts` as `Tables` interface. Export individual types:
```tsx
export type Table = Tables['tables']
export type MenuItem = Tables['menu_items']
export type Order = Tables['orders']
```

### Order Status Types
Order status is strictly typed - only use these values:
`'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled'`

## Debugging Tools

### CRUD Test Interface
Access `/admin/test-crud` for:
- Database connection testing
- CRUD operation verification
- Performance testing
- Schema validation

### Common Issues
1. **"Column capacity does not exist"**: Run `fix-tables-schema.sql`
2. **RLS policy violations**: Verify `supabase-rls-policies.sql` was executed
3. **QR scanning not working**: Check camera permissions and HTTPS requirements
4. **Cart not persisting**: Ensure `CartProvider` wraps customer pages

## Design System

### Color Palette (Italian Theme)
- **Primary (Tomato Red)**: `oklch(0.47 0.15 25)`
- **Secondary (Basil Green)**: `oklch(0.25 0.02 120)` 
- **Accent (Parmesan Yellow)**: `oklch(0.75 0.12 85)`

### Component Library
Uses shadcn/ui components extensively. All UI components are in `src/components/ui/` and follow shadcn conventions.

## Security Notes

- Current RLS policies are development-only (allow all operations)
- Production deployment requires proper authentication implementation
- Admin routes have no authentication guards - implement before production
- Environment variables must be properly configured for Supabase access