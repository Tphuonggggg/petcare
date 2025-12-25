"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Mail, Phone, MapPin } from "lucide-react"
import { CustomerDialog } from "@/components/customer-dialog"
import { apiGet } from "@/lib/api"

const mockCustomers = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    email: "nguyenvana@email.com",
    phone: "0901234567",
    address: "123 Nguyễn Trãi, Q1, TP.HCM",
    membershipTier: "VIP",
    points: 1500,
    pets: 2,
  },
  {
    id: 2,
    name: "Trần Thị B",
    email: "tranthib@email.com",
    phone: "0907654321",
    address: "456 Lê Lợi, Q3, TP.HCM",
    membershipTier: "Vàng",
    points: 850,
    pets: 1,
  },
  {
    id: 3,
    name: "Lê Văn C",
    email: "levanc@email.com",
    phone: "0912345678",
    address: "789 Hai Bà Trưng, Q10, TP.HCM",
    membershipTier: "Bạc",
    points: 450,
    pets: 3,
  },
]

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [customers, setCustomers] = useState<any[]>(mockCustomers)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const data = await apiGet('/customers')
        if (mounted && Array.isArray(data)) setCustomers(data)
      } catch (e) {
        // keep mock data on error
        // console.warn('fetch customers failed', e)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "VIP":
        return "bg-purple-100 text-purple-700"
      case "Vàng":
        return "bg-yellow-100 text-yellow-700"
      case "Bạc":
        return "bg-gray-100 text-gray-700"
      default:
        return "bg-blue-100 text-blue-700"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Khách hàng</h1>
          <p className="text-muted-foreground mt-1">Quản lý thông tin khách hàng</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm khách hàng
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên, email, số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(loading ? [] : customers).map((customer) => {
          const id = customer?.customerId ?? customer?.id
          const name = customer?.fullName ?? customer?.name ?? 'Khách hàng'
          const email = customer?.email ?? customer?.contactEmail ?? ''
          const phone = customer?.phone ?? customer?.mobile ?? ''
          const address = customer?.address ?? ''
          const membership = customer?.membershipTier ?? customer?.tier ?? '—'
          const points = customer?.points ?? customer?.pointsBalance ?? 0
          const pets = customer?.pets ?? (customer?.petCount ?? 0)
          return (
          <Card key={id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{name}</h3>
                  <Badge className={cn("mt-1", getTierColor(membership))}>{membership}</Badge>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Điểm tích lũy</p>
                  <p className="text-lg font-bold text-primary">{points}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="text-balance">{email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{phone}</span>
                </div>
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5" />
                  <span className="text-balance">{address}</span>
                </div>
              </div>

              <div className="pt-4 border-t flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{pets} thú cưng</span>
                <Button variant="outline" size="sm">
                  Xem chi tiết
                </Button>
              </div>
            </div>
          </Card>
        )})}
      </div>

      <CustomerDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  )
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ")
}
