"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { PawPrint, Calendar, FileText, Users, Stethoscope, Pill, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

const items = [
  { name: 'Lịch hôm nay', href: '/vet', icon: Calendar },
  { name: 'Thú cưng', href: '/vet/pets', icon: Users },
  { name: 'Tra cứu thuốc', href: '/vet/medicines', icon: Pill },
]

export function VetNav() {
  const pathname = usePathname()

  return (
    <aside className="w-56 border-r bg-muted/30">
      <div className="p-5">
        <div className="flex items-center gap-2">
          <PawPrint className="h-7 w-7 text-primary" />
          <div>
            <h2 className="font-bold">PetCare</h2>
            <p className="text-xs text-muted-foreground">Bác sĩ thú y</p>
          </div>
        </div>
      </div>

      <nav className="px-3 space-y-1">
        {items.map((it) => {
          const Icon = it.icon
          // Only highlight exact match or sub-paths (but not root for sub-paths)
          const active = it.href === '/vet' 
            ? pathname === '/vet'
            : pathname?.startsWith(it.href)
          return (
            <Link
              key={it.name}
              href={it.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {it.name}
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

export default VetNav
