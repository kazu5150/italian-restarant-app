# Bella Vista - Italian Restaurant QR Ordering System

A modern, mobile-first QR code-based ordering system for Italian restaurants built with Next.js 14, Supabase, and shadcn/ui.

## 🌟 Features

### Customer Features
- **QR Code Scanning**: Scan table QR codes to access menu
- **Digital Menu**: Browse menu by categories with images and descriptions
- **Shopping Cart**: Add items, adjust quantities, and manage orders
- **Real-time Order Tracking**: Live updates on order status
- **Mobile Optimized**: Responsive design for smartphones
- **Multilingual Support**: Japanese and English interface

### Staff Features
- **Real-time Order Management**: Live dashboard for incoming orders
- **Order Status Updates**: Change order status (pending → preparing → ready → completed)
- **Table Management**: Manage table status and generate QR codes
- **Menu Management**: Add, edit, and manage menu items
- **Sales Dashboard**: View order statistics and revenue

### Technical Features
- **Real-time Updates**: Supabase real-time subscriptions
- **Modern UI**: shadcn/ui with custom Italian restaurant theme
- **Type Safety**: Full TypeScript implementation
- **Responsive Design**: Mobile-first approach
- **QR Code Generation**: Automatic QR code creation for tables

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Backend**: Supabase (PostgreSQL, Real-time, Auth)
- **UI**: shadcn/ui, Tailwind CSS
- **QR Codes**: react-qr-code, qr-scanner
- **Icons**: Lucide React
- **Notifications**: Sonner

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd italian-restaurant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Run the SQL commands from `supabase-schema.sql` in your Supabase SQL editor

4. **Configure environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   - Customer interface: [http://localhost:3000](http://localhost:3000)
   - Admin dashboard: [http://localhost:3000/admin](http://localhost:3000/admin)

## 📱 Usage

### For Customers

1. **Scan QR Code**: Use your phone's camera to scan the table's QR code
2. **Browse Menu**: View menu items organized by categories
3. **Add to Cart**: Select items and quantities
4. **Place Order**: Review and confirm your order
5. **Track Status**: Monitor your order's preparation status

### For Staff

1. **Access Admin Dashboard**: Go to `/admin`
2. **Manage Orders**: View and update order statuses in real-time
3. **Table Management**: Add tables and generate QR codes
4. **Menu Management**: Add, edit, or disable menu items

## 🎨 Design System

### Color Palette
- **Primary** (Tomato Red): `oklch(0.47 0.15 25)`
- **Secondary** (Basil Green): `oklch(0.25 0.02 120)`
- **Accent** (Parmesan Yellow): `oklch(0.75 0.12 85)`

### Typography
- Uses Geist Sans for a modern, clean look
- Responsive font sizes optimized for mobile

## 🗂 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard pages
│   ├── table/[id]/        # Customer-facing table pages
│   │   ├── menu/          # Menu display
│   │   ├── cart/          # Shopping cart
│   │   └── order/[orderId]/ # Order status
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── qr-scanner.tsx    # QR code scanner
│   └── qr-generator.tsx  # QR code generator
└── lib/
    └── supabase.ts       # Supabase client configuration
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

## 🔍 Next Steps

To complete the setup:

1. **Create a Supabase project** and run the schema
2. **Configure environment variables** 
3. **Test the QR code flow** from scanning to order completion
4. **Customize the menu** with your restaurant's items
5. **Deploy to Vercel** for production use

This is a production-ready Italian restaurant ordering system with modern design and real-time functionality!