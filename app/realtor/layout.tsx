import type React from "react"
import type { Metadata } from "next"
import { RealtorProvider } from "@/contexts/realtor-context"

export const metadata: Metadata = {
  title: "Realtor Portal - BuyHome ABC to XYZ",
  description: "Manage your clients and their home buying journey",
}

export default function RealtorRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <RealtorProvider>{children}</RealtorProvider>
}
