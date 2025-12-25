"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building, MapPin, Phone, Plus } from "lucide-react"

const mockBranches = [
  {
    id: 1,
    name: "Chi nhánh Quận 1",
    address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
    phone: "028 1234 5678",
    manager: "Nguyễn Văn Manager",
    employees: 15,
    status: "Đang hoạt động",
  },
  {
    id: 2,
    name: "Chi nhánh Quận 3",
    address: "456 Lê Văn Sỹ, Quận 3, TP.HCM",
    phone: "028 8765 4321",
    manager: "Trần Thị Quản Lý",
    employees: 12,
    status: "Đang hoạt động",
  },
  {
    id: 3,
    name: "Chi nhánh Quận 10",
    address: "789 Ba Tháng Hai, Quận 10, TP.HCM",
    phone: "028 9999 8888",
    manager: "Lê Văn Trưởng",
    employees: 10,
    status: "Đang hoạt động",
  },
]

export default function BranchesPage() {
  const [branches, setBranches] = useState<any[]>(mockBranches)
  const [loading, setLoading] = useState(false)
  const [statsState, setStatsState] = useState<Record<number, { open: boolean; loading: boolean; period: string; revenue: number; count: number }>>({})

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const { apiGet } = await import('@/lib/api')
        const data = await apiGet('/branches')
        if (mounted && Array.isArray(data)) setBranches(data)
      } catch (e) {
        // keep mockBranches on error
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  async function loadStatsFor(branchId: number, period: string) {
    setStatsState(s => ({ ...s, [branchId]: { ...(s[branchId] || {}), open: true, loading: true, period, revenue: 0, count: 0 } }))
    try {
      const { apiGet } = await import('@/lib/api')
      const [inv, bk] = await Promise.all([apiGet('/invoices'), apiGet('/bookings')])
      const invoices = Array.isArray(inv) ? inv : []
      const bookings = Array.isArray(bk) ? bk : []
      const bkMap = new Map(bookings.map((b: any) => [b.bookingId, b]))

      const now = new Date()
      const filtered = invoices.filter((i: any) => {
        const booking = bkMap.get(i.bookingId)
        if (!booking) return false
        if (booking.branchId !== branchId) return false
        const issued = new Date(i.issuedAt || i.createdAt || new Date())
        if (period === 'day') return issued.toDateString() === now.toDateString()
        if (period === 'month') return issued.getFullYear() === now.getFullYear() && issued.getMonth() === now.getMonth()
        if (period === 'year') return issued.getFullYear() === now.getFullYear()
        return true
      })

      const revenue = filtered.reduce((s: number, r: any) => s + (Number(r.amount) || 0), 0)
      const count = filtered.length
      setStatsState(s => ({ ...s, [branchId]: { ...(s[branchId] || {}), open: true, loading: false, period, revenue, count } }))
    } catch (e) {
      setStatsState(s => ({ ...s, [branchId]: { ...(s[branchId] || {}), open: true, loading: false, period, revenue: 0, count: 0 } }))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Chi nhánh</h1>
          <p className="text-muted-foreground mt-1">Quản lý các chi nhánh PetCare</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Thêm chi nhánh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {(loading ? [] : branches).map((branch) => {
          const id = branch?.branchId ?? branch?.id
          const name = branch?.name ?? branch?.branchName ?? 'Chi nhánh'
          const address = branch?.address ?? ''
          const phone = branch?.phone ?? ''
          const manager = branch?.manager ?? branch?.managerName ?? ''
          const employees = branch?.employees ?? branch?.staffCount ?? 0
          const status = branch?.status ?? '—'
          return (
          <Card key={id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Building className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{name}</h3>
                    <Badge className="mt-1 bg-green-100 text-green-700">{status}</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-muted-foreground text-balance">{branch.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{branch.phone}</span>
                </div>
              </div>

              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quản lý</span>
                  <span className="font-medium">{branch.manager}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Nhân viên</span>
                  <span className="font-medium">{branch.employees} người</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline">Chi tiết</Button>
                <Link href={`/reports/branch/revenue?branchId=${id}`}>
                  <Button>Thống kê</Button>
                </Link>
                <Button variant="ghost" onClick={() => {
                  const cur = statsState[id]
                  if (cur && cur.open) {
                    setStatsState(s => ({ ...s, [id]: { ...s[id], open: false } }))
                  } else {
                    loadStatsFor(id, 'day')
                  }
                }}>
                  Xem nhanh
                </Button>
              </div>
            </div>

            {statsState[id] && statsState[id].open && (
              <div className="mt-4 p-3 border rounded bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-muted-foreground">Thống kê nhanh</div>
                  <div className="flex items-center gap-2">
                    <select value={statsState[id].period} onChange={(e) => loadStatsFor(id, e.target.value)} className="border px-2 py-1 rounded bg-white">
                      <option value="day">Ngày</option>
                      <option value="month">Tháng</option>
                      <option value="year">Năm</option>
                    </select>
                  </div>
                </div>

                {statsState[id].loading ? (
                  <div>Đang tải...</div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white rounded shadow-sm">
                      <div className="text-sm text-muted-foreground">Doanh thu</div>
                      <div className="text-lg font-bold">{statsState[id].revenue.toLocaleString()} đ</div>
                    </div>
                    <div className="p-3 bg-white rounded shadow-sm">
                      <div className="text-sm text-muted-foreground">Số hóa đơn</div>
                      <div className="text-lg font-bold">{statsState[id].count}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        )})}
      </div>
    </div>
  )
}
