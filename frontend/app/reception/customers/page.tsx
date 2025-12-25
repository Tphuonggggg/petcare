"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PawPrint, ArrowLeft, Search, Plus, Phone, Mail } from "lucide-react"
import { CustomerDialog } from "@/components/customer-dialog"
import { Badge } from "@/components/ui/badge"

type CustomerItem = {
  customerId: number
  fullName: string
  phone?: string
  email?: string
  membershipTier?: string
  pets?: number
  visits?: number
  lastVisit?: string
}

const customersInitial: CustomerItem[] = []

export default function ReceptionCustomersPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [customers, setCustomers] = useState<CustomerItem[]>(customersInitial)
  const [branchName, setBranchName] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const { apiGet } = await import('@/lib/api')
        const branchId = localStorage.getItem('selected_branch_id')
        if (branchId) {
          const data = await apiGet('/customers?branchId=' + encodeURIComponent(branchId))
          if (Array.isArray(data)) setCustomers(data.map((c: any) => ({ customerId: c.customerId ?? c.id, fullName: c.fullName ?? c.name, phone: c.phone, email: c.email, membershipTier: c.membershipTier, pets: (c.pets ?? 0), visits: (c.visits ?? 0), lastVisit: c.lastVisit })))
        } else {
          const data = await apiGet('/customers')
          if (Array.isArray(data)) setCustomers(data.map((c: any) => ({ customerId: c.customerId ?? c.id, fullName: c.fullName ?? c.name, phone: c.phone, email: c.email, membershipTier: c.membershipTier, pets: (c.pets ?? 0), visits: (c.visits ?? 0), lastVisit: c.lastVisit })))
        }
      } catch {
        // ignore
      }
      try { setBranchName(localStorage.getItem('selected_branch_name')) } catch {}
    }
    load()

    const onBranchChanged = (e: any) => setBranchName(e?.detail?.name ?? localStorage.getItem('selected_branch_name'))
    window.addEventListener('branch-changed', onBranchChanged as EventListener)

    const onCustomerAdded = (_e: any) => { load() }
    window.addEventListener('customer-added', onCustomerAdded as EventListener)

    return () => {
      window.removeEventListener('branch-changed', onBranchChanged as EventListener)
      window.removeEventListener('customer-added', onCustomerAdded as EventListener)
    }
  }, [])

  const getMembershipBadge = (membership: string) => {
    const config = {
      Vàng: "default",
      Bạc: "secondary",
      Thường: "outline",
    }
    return <Badge variant={config[membership as keyof typeof config] as any}>{membership}</Badge>
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/reception")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <PawPrint className="h-6 w-6 text-primary" />
              <span className="font-bold">PetCare - Tiếp tân</span>
            </div>
          </div>
          <Button variant="outline" onClick={() => { import('@/lib/auth').then(m => m.logout('/')) }}>
            Đăng xuất
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Quản lý khách hàng</h1>
            <p className="text-muted-foreground">Thông tin và lịch sử khách hàng</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm khách hàng
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên, số điện thoại, email..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Danh sách khách hàng {branchName ? `- ${branchName}` : ''}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {customers.map((customer) => (
                <div key={customer.customerId} className="p-4 border rounded-lg hover:bg-muted/50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-medium text-lg">{customer.fullName}</p>
                        {getMembershipBadge(customer.membershipTier || '')}
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          {customer.phone}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          {customer.email}
                        </div>
                      </div>
                    </div>
                    <Button size="sm">Xem chi tiết</Button>
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-3 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">Số thú cưng</p>
                      <p className="font-medium">{customer.pets}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Lượt khám</p>
                      <p className="font-medium">{customer.visits}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Lần cuối</p>
                      <p className="font-medium">{customer.lastVisit}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <CustomerDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      </main>
    </div>
  )
}
