"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useRealtor } from "@/contexts/realtor-context"
import { RealtorSidebar } from "@/components/realtor-sidebar"

export function RealtorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { realtor, isLoading } = useRealtor()
  const router = useRouter()

  useEffect(() => {
    // Check if we're in the browser
    if (typeof window !== "undefined") {
      // Redirect to login if no realtor is found and loading is complete
      if (!isLoading && !realtor) {
        router.push("/login?role=realtor")
      }
    }
  }, [realtor, isLoading, router])

  // Show nothing while checking authentication
  if (isLoading || !realtor) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F9FAFB]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#F9FAFB]">
      <RealtorSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b h-16 flex items-center px-6">
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-primary">Realtor Portal</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">{realtor.name}</span>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-medium text-sm">{realtor.name.charAt(0)}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
