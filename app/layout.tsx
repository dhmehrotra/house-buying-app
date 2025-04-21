import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { RealtorProvider } from "@/contexts/realtor-context"
import { UserProvider } from "@/contexts/user-context"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BuyHome ABC to XYZ",
  description: "Your complete home buying journey from ABC to XYZ",
  icons: {
    icon: [{ url: "/favicon.png" }],
    apple: [{ url: "/favicon.png" }],
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </head>
      <body className={inter.className + " min-h-screen flex flex-col"}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <RealtorProvider>
            <UserProvider>
              <main className="flex-grow">{children}</main>
              <Toaster />
            </UserProvider>
          </RealtorProvider>
        </ThemeProvider>

        {/* Initialize app with test data */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Initialize app on client side
              if (typeof window !== 'undefined') {
                // Wait for the app to be fully loaded
                window.addEventListener('load', function() {
                  // Check if we need to initialize
                  if (!localStorage.getItem('buyhome_app_initialized')) {
                    console.log('Initializing app with test data');
                    
                    // Initialize invite codes storage
                    const inviteCodesStorage = localStorage.getItem('buyhome_invite_codes');
                    if (!inviteCodesStorage) {
                      localStorage.setItem('buyhome_invite_codes', JSON.stringify([]));
                    }
                    
                    // Mark as initialized
                    localStorage.setItem('buyhome_app_initialized', 'true');
                  }
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
