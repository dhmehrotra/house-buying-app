import type React from "react"
import { BuyerSidebarNav } from "@/components/buyer-sidebar-nav"
import { BuyerHeader } from "@/components/buyer-header"
import { BuyerFooter } from "@/components/buyer-footer"

const sidebarNavItems = [
  {
    title: "Dashboard",
    href: "/buyer/dashboard",
    icon: "home",
  },
  {
    title: "1. Pre-Qualification",
    href: "/buyer/pre-qualification",
    icon: "dollar",
    step: "step1",
  },
  {
    title: "2. Needs Assessment",
    href: "/buyer/needs-assessment",
    icon: "clipboard",
    step: "step2",
  },
  {
    title: "3. Property Search",
    href: "/buyer/property-search",
    icon: "search",
    step: "step3",
  },
  {
    title: "4. Property Selection",
    href: "/buyer/property-selection",
    icon: "check",
    step: "step4",
  },
  {
    title: "5. Offer Preparation",
    href: "/buyer/offer-preparation",
    icon: "file",
    step: "step5",
  },
  {
    title: "6. Closing Process",
    href: "/buyer/closing-process",
    icon: "key",
    step: "step6",
  },
  {
    title: "Messages",
    href: "/buyer/messages",
    icon: "message",
  },
]

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <BuyerHeader />
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r bg-gray-100/40 lg:block">
          <BuyerSidebarNav items={sidebarNavItems} />
        </aside>
        <main className="flex-1">{children}</main>
      </div>
      <BuyerFooter />
    </div>
  )
}
