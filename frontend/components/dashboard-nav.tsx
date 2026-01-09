"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  PawPrint,
  Calendar,
  Package,
  FileText,
  Building,
  Settings,
  Stethoscope,
  ShoppingCart,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Khách hàng", href: "/dashboard/customers", icon: Users },
  { name: "Nhân viên", href: "/admin/employees", icon: Users },
  { name: "Thú cưng", href: "/dashboard/pets", icon: PawPrint },
  { name: "Đặt lịch", href: "/dashboard/bookings", icon: Calendar },
  { name: "Dịch vụ", href: "/dashboard/services", icon: Stethoscope },
  { name: "Sản phẩm", href: "/dashboard/products", icon: Package },
  { name: "Hóa đơn", href: "/dashboard/invoices", icon: FileText },
  { name: "Chi nhánh", href: "/dashboard/branches", icon: Building },
  { name: "Cài đặt", href: "/dashboard/settings", icon: Settings },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r bg-muted/30">
      <div className="p-6">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="PetCare" className="h-8 w-8 object-contain" />
          <div>
            <h2 className="font-bold text-xl">PetCare</h2>
            <p className="text-xs text-muted-foreground">Quản lý thú cưng</p>
          </div>
        </div>
      </div>
      <nav className="px-3 space-y-1">
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
      <div className="px-3 mt-6">
        <Button variant="outline" size="sm" className="w-full flex items-center justify-center gap-2" onClick={() => { import('@/lib/auth').then(m => m.logout('/')) }}>
          <LogOut className="h-4 w-4" /> Đăng xuất
        </Button>
      </div>
    </aside>
  )
}
