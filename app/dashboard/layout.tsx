"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { BuyerSidebar } from "@/components/buyer-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { useUser } from "@/contexts/user-context"
import { LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useUser()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Redirect to login if no user is found and loading is complete
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    // If user is authenticated and not on the intro page, check if they've completed step 1
    if (user && !isLoading) {
      // In a real app, you would check the user's progress from the database
      // For demo purposes, we'll use a simple localStorage check
      const hasCompletedIntro = localStorage.getItem("buyhome_completed_intro") === "true"

      // If they haven't completed the intro and aren't already on the intro page
      // and they're trying to access the dashboard home
      if (!hasCompletedIntro && pathname !== "/dashboard/intro" && pathname === "/dashboard") {
        router.push("/dashboard/intro")
      }
    }
  }, [user, isLoading, pathname, router])

  // Show nothing while checking authentication
  if (isLoading || !user) {
    return null
  }

  return (
    <SidebarProvider>
      <BuyerSidebar />
      <SidebarInset>
        <header className="flex h-16 items-center gap-4 border-b px-6 bg-white">
          <SidebarTrigger className="text-primary" />
          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 h-8 px-2">
                  <span className="text-sm font-medium text-[#1F2937]">
                    {user.firstName} {user.lastName}
                  </span>
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-medium text-sm">
                      {user.firstName?.[0]}
                      {user.lastName?.[0]}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {user.firstName} {user.lastName}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    // Clear user data and redirect to login
                    localStorage.removeItem("buyhome_user")
                    document.cookie = "buyhome_user=; path=/; max-age=0"
                    router.push("/login")
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6 bg-[#F9FAFB]">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
