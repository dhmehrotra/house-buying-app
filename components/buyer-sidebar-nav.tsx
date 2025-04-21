"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Home, DollarSign, ClipboardList, Search, CheckSquare, FileText, Key, MessageSquare, Check } from "lucide-react"
import { useStepCompletion } from "@/hooks/use-step-completion"

interface BuyerSidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string
    title: string
    icon: keyof typeof icons
    step?: string
  }[]
}

const icons = {
  home: Home,
  dollar: DollarSign,
  clipboard: ClipboardList,
  search: Search,
  check: CheckSquare,
  file: FileText,
  key: Key,
  message: MessageSquare,
}

export function BuyerSidebarNav({ className, items, ...props }: BuyerSidebarNavProps) {
  const pathname = usePathname()
  const { isStepComplete } = useStepCompletion()

  return (
    <nav className={cn("flex flex-col space-y-1", className)} {...props}>
      <ScrollArea className="h-[calc(100vh-120px)]">
        <div className="flex flex-col space-y-1 p-2">
          {items.map((item) => {
            const Icon = icons[item.icon]
            const isActive = pathname === item.href
            const stepKey = item.step as keyof ReturnType<typeof useStepCompletion>["stepsCompleted"]
            const isCompleted = stepKey ? isStepComplete(stepKey) : false

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-2",
                    isActive && "bg-[#ff6a00] text-white hover:bg-[#e05e00] hover:text-white",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.title}</span>
                  {isCompleted && <Check className="h-4 w-4 ml-auto text-green-500" />}
                </Button>
              </Link>
            )
          })}
        </div>
      </ScrollArea>
    </nav>
  )
}
