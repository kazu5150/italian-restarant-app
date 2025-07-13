# 🍝 Bella Vista Setup Guide

Your Italian restaurant QR code ordering system is ready! Follow these steps to complete the setup.

## 🚀 Quick Start

The application is currently running with placeholder values. You'll see a setup screen guiding you through the configuration.

### 1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for setup to complete

### 2. **Run Database Schema**
   - In your Supabase dashboard, go to SQL Editor
   - Copy and paste the contents of `supabase-schema.sql`
   - Run the SQL commands

### 3. **Configure Environment Variables**
   Edit `.env.local` and replace with your actual credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   NEXT_PUBLIC_APP_URL=http://localhost:3002
   ```

### 4. **Restart Development Server**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

## ✅ **What's Included**

### **Customer Experience**
- 📱 **QR Code Scanner** - Camera-based table access
- 🍽️ **Digital Menu** - Beautiful Italian restaurant menu
- 🛒 **Shopping Cart** - Add/remove items with quantities
- 📊 **Order Tracking** - Real-time status updates
- 📱 **Mobile-First Design** - Optimized for smartphones

### **Staff Management**
- 📈 **Admin Dashboard** - Order statistics and management
- 👨‍🍳 **Kitchen Display** - Real-time order queue
- 🏠 **Table Management** - QR code generation
- ✏️ **Menu Administration** - Add/edit menu items

### **Technical Features**
- ⚡ **Real-time Updates** - Supabase subscriptions
- 🎨 **Modern UI** - shadcn/ui with Italian theme
- 📱 **Responsive Design** - Works on all devices
- 🔒 **Type Safety** - Full TypeScript implementation

## 🎯 **Testing the System**

Once configured, test these user flows:

### **Customer Flow**
1. Visit `http://localhost:3002`
2. Enter a table number (1-8) or use QR scanner
3. Browse menu categories
4. Add items to cart
5. Place order and track status

### **Staff Flow**
1. Visit `http://localhost:3002/admin`
2. View dashboard statistics
3. Manage incoming orders
4. Update order statuses
5. Generate QR codes for tables

## 🛠 **Customization**

### **Menu Items**
- Edit in Supabase dashboard or admin panel
- Categories: Antipasti, Pasta, Pizza, Main, Dessert, Drinks
- Sample Italian dishes included

### **Restaurant Branding**
- Update restaurant name in `src/app/page.tsx`
- Customize colors in `src/app/globals.css`
- Replace logo/images as needed

### **Table Configuration**
- Default: 8 tables (1-8)
- Add more in admin panel
- QR codes auto-generated

## 🚀 **Deployment**

### **Vercel (Recommended)**
1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### **Other Platforms**
- Update `NEXT_PUBLIC_APP_URL` to your domain
- Ensure environment variables are set
- Build with `npm run build`

## 🎉 **You're Ready!**

Your modern Italian restaurant ordering system includes:
- ✅ QR code-based table access
- ✅ Real-time order management
- ✅ Mobile-optimized interface
- ✅ Staff dashboard
- ✅ Beautiful Italian design theme
- ✅ Production-ready architecture

Perfect for enhancing the dining experience while streamlining restaurant operations!