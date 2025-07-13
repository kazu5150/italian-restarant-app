'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Database, ExternalLink, AlertCircle } from 'lucide-react'

export function SetupNotice() {
  const isSupabaseConfigured = 
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project-ref.supabase.co'

  if (isSupabaseConfigured) {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center">
          <Database className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h1 className="text-3xl font-bold mb-2">Welcome to Bella Vista</h1>
          <p className="text-muted-foreground">
            Italian Restaurant QR Code Ordering System
          </p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Supabase configuration required to continue. Please follow the setup instructions below.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Setup Instructions</CardTitle>
            <CardDescription>
              Follow these steps to configure your restaurant ordering system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">1. Create Supabase Project</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Create a new Supabase project to host your restaurant database.
                </p>
                <Button variant="outline" asChild>
                  <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Go to Supabase
                  </a>
                </Button>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">2. Set up Database</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Run the SQL commands from <code className="bg-muted px-1 py-0.5 rounded">supabase-schema.sql</code> in your Supabase SQL editor.
                </p>
                <div className="bg-muted p-3 rounded-md text-sm">
                  <code>supabase-schema.sql</code> contains:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Table structures for menu, orders, and tables</li>
                    <li>Sample menu data with Italian dishes</li>
                    <li>Row Level Security policies</li>
                    <li>Initial table setup</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">3. Configure Environment Variables</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Update your <code className="bg-muted px-1 py-0.5 rounded">.env.local</code> file with your Supabase credentials.
                </p>
                <div className="bg-muted p-3 rounded-md text-sm">
                  <pre className="whitespace-pre-wrap">
{`NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000`}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">4. Restart Development Server</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  After updating the environment variables, restart your development server.
                </p>
                <div className="bg-muted p-3 rounded-md text-sm">
                  <code>npm run dev</code>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-2">Features Included</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium">Customer Features</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>QR code scanning</li>
                    <li>Digital menu browsing</li>
                    <li>Shopping cart</li>
                    <li>Real-time order tracking</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium">Staff Features</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Order management dashboard</li>
                    <li>Table management</li>
                    <li>QR code generation</li>
                    <li>Menu administration</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>Need help? Check the README.md file for detailed instructions.</p>
        </div>
      </div>
    </div>
  )
}