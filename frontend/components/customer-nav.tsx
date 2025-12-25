"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, PawPrint, Calendar, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { logout } from '@/lib/auth'

const navigation = [
  { name: "Tổng quan", href: "/customer", icon: LayoutDashboard },
  { name: "Thú cưng", href: "/customer/pets", icon: PawPrint },
  { name: "Lịch hẹn", href: "/customer/bookings", icon: Calendar },
  { name: "Tài khoản", href: "/customer/profile", icon: User },
]

export function CustomerNav() {
  const pathname = usePathname()

  const handleLogout = () => {
    logout('/')
  }

  return (
    <aside className="w-64 border-r bg-muted/30 flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center gap-2">
          <PawPrint className="h-8 w-8 text-primary" />
          <div>
            <h2 className="font-bold text-xl">PetCare</h2>
            <p className="text-xs text-muted-foreground">Cổng khách hàng</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="p-3 border-t">
        <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
          <LogOut className="h-5 w-5 mr-3" />
          Đăng xuất
        </Button>
      </div>
    </aside>
  )
}
