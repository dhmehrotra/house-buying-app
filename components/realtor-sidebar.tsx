"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, LogOut, PlusCircle, Settings, Users } from "lucide-react"
import { useRealtor } from "@/contexts/realtor-context"
import { useRouter } from "next/navigation"
import Logo from "@/components/logo"

export function RealtorSidebar() {
  const pathname = usePathname()
  const { realtor, setRealtor } = useRealtor()
  const router = useRouter()

  const handleLogout = () => {
    setRealtor(null)
    localStorage.removeItem("buyhome_realtor")
    document.cookie = "buyhome_realtor=; path=/; max-age=0"
    router.push("/login?role=realtor")
  }

  const navItems = [
    {
      name: "Dashboard",
      href: "/realtor-dashboard",
      icon: Home,
    },
    {
      name: "New Buyer",
      href: "/new-buyer",
      icon: PlusCircle,
    },
    {
      name: "My Clients",
      href: "/clients",
      icon: Users,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ]

  return (
    <div className="w-64 bg-white border-r flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <Logo />
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive ? "bg-accent text-white" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-medium">{realtor?.name.charAt(0) || "A"}</span>
          </div>
          <div>
            <div className="font-medium text-sm">{realtor?.name || "Realtor"}</div>
            <div className="text-xs text-muted-foreground">{realtor?.email || "realtor@example.com"}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  )
}
