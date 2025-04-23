"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Building2,
  CheckCircle,
  ClipboardCheck,
  FileSearch,
  Home,
  LockIcon,
  MessageSquare,
  Search,
  ShieldCheck,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Define the step data without completion status
const buyerStepData = [
  {
    id: 1,
    name: "Pre-Qualification & Financial Readiness",
    icon: ShieldCheck,
    path: "/dashboard/pre-qualification",
  },
  {
    id: 2,
    name: "Needs Assessment",
    icon: ClipboardCheck,
    path: "/dashboard/needs-assessment",
  },
  {
    id: 3,
    name: "Property Search",
    icon: Search,
    path: "/dashboard/property-search",
  },
  {
    id: 4,
    name: "Property Pre-Selection & Status",
    icon: Home,
    path: "/dashboard/property-pre-selection",
  },
  {
    id: 5,
    name: "Offer & Negotiation",
    icon: MessageSquare,
    path: "/dashboard/offer-negotiation",
  },
  {
    id: 6,
    name: "Due Diligence",
    icon: FileSearch,
    path: "/dashboard/due-diligence",
  },
  {
    id: 7,
    name: "Financing & Closing Prep",
    icon: CheckCircle,
    path: "/dashboard/financing-closing-prep",
  },
  {
    id: 8,
    name: "Closing",
    icon: CheckCircle,
    path: "/dashboard/closing",
  },
  {
    id: 9,
    name: "Post-Transaction Support",
    icon: CheckCircle,
    path: "/dashboard/post-transaction",
  },
]

export function BuyerSidebar() {
  const pathname = usePathname()
  const [buyerSteps, setBuyerSteps] = useState(
    buyerStepData.map((step) => ({
      ...step,
      completed: false,
      current: false,
      locked: true,
    })),
  )

  // Determine the current step and completion status
  useEffect(() => {
    // In a real app, this would come from the database
    // For demo purposes, we'll use localStorage
    const completedIntro = localStorage.getItem("buyhome_completed_intro") === "true"

    // Update the currentStepId to 4 to unlock Step 4
    // For demo purposes, let's say the user is on step 4 (Property Pre-Selection)
    // In a real app, you would get this from the user's profile
    const currentStepId = 4

    // Update the steps based on the current progress
    const updatedSteps = buyerStepData.map((step) => {
      // If intro is not completed, all steps are locked
      if (!completedIntro) {
        return {
          ...step,
          completed: false,
          current: false,
          locked: true,
        }
      }

      // If step is before current step, it's completed
      if (step.id < currentStepId) {
        return {
          ...step,
          completed: true,
          current: false,
          locked: false,
        }
      }

      // If step is the current step, it's not completed and not locked
      if (step.id === currentStepId) {
        return {
          ...step,
          completed: false,
          current: true,
          locked: false,
        }
      }

      // If step is after current step, it's locked
      return {
        ...step,
        completed: false,
        current: false,
        locked: true,
      }
    })

    setBuyerSteps(updatedSteps)
  }, [pathname]) // Re-run when pathname changes to update active state

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-4 py-2">
          <Building2 className="h-6 w-6 text-primary" />
          <span>
            <span className="font-normal">BuyHome</span> <span className="font-bold text-accent">ABC</span>{" "}
            <span className="font-normal">to</span> <span className="font-bold text-primary">XYZ</span>
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard"}>
                  <Link href="/dashboard">
                    <Home className="h-4 w-4" />
                    <span>Overview</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {pathname.includes("/dashboard/intro") && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/dashboard/intro"}>
                    <Link href="/dashboard/intro">
                      <CheckCircle className="h-4 w-4" />
                      <span>Journey Introduction</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Home Buying Journey</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {buyerSteps.map((step) => (
                <SidebarMenuItem key={step.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === step.path}
                    className={`${step.locked ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    <Link href={step.locked ? "#" : step.path}>
                      {step.completed ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : step.locked ? (
                        <LockIcon className="h-4 w-4" />
                      ) : (
                        <step.icon className="h-4 w-4" />
                      )}
                      <span>{step.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t">{/* Profile link removed as requested */}</SidebarFooter>
    </Sidebar>
  )
}
