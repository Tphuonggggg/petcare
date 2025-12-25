"use client"

import { useEffect, useState } from "react"
import { getSelectedBranchId, getSelectedBranchName } from '@/lib/branch'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Package } from "lucide-react"

const mockOrders = [
  {
    id: "DH#001",
    date: "25/12/2024",
    customer: "Nguyễn Văn A",
    items: 3,
    total: "1,250,000 VNĐ",
    status: "Đang xử lý",
  },
  {
    id: "DH#002",
    date: "24/12/2024",
    customer: "Trần Thị B",
    items: 2,
    total: "680,000 VNĐ",
    status: "Đã giao",
  },
  {
    id: "DH#003",
    date: "24/12/2024",
    customer: "Lê Văn C",
    items: 5,
    total: "2,100,000 VNĐ",
    status: "Đang vận chuyển",
  },
]

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>(mockOrders)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const { apiGet } = await import('@/lib/api')
        const branchId = getSelectedBranchId()
        const branchName = getSelectedBranchName()
        const data = branchId ? await apiGet('/orders?branchId=' + encodeURIComponent(branchId)) : await apiGet('/orders')
        if (mounted && Array.isArray(data)) {
          const filtered = branchId ? data.filter((o: any) => String(o.branchId ?? o.branch) === String(branchId) || String(o.branchName ?? o.branch) === String(branchName)) : data
          setOrders(filtered)
        }
      } catch (e) {
        // keep mockOrders on error
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    const onBranch = () => { load() }
    window.addEventListener('branch-changed', onBranch as EventListener)
    return () => { mounted = false; window.removeEventListener('branch-changed', onBranch as EventListener) }
  }, [])
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Đã giao":
        return "bg-green-100 text-green-700"
      case "Đang vận chuyển":
        return "bg-blue-100 text-blue-700"
      case "Đang xử lý":
        return "bg-yellow-100 text-yellow-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Đơn hàng</h1>
          <p className="text-muted-foreground mt-1">Quản lý đơn hàng sản phẩm</p>
        </div>
      </div>

      <div className="space-y-4">
          {(loading ? [] : orders).map((order) => {
          const id = order?.orderId ?? order?.id
          const cust = order?.customerName ?? order?.customer ?? ''
          const items = order?.items ?? (Array.isArray(order?.products) ? order.products.length : 0)
          const total = order?.total ?? order?.amount ?? '—'
          return (
          <Card key={id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{id}</h3>
                  <p className="text-sm text-muted-foreground">{cust} - {order.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <Package className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                  <p className="text-sm font-medium">{items} sản phẩm</p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Tổng tiền</p>
                  <p className="text-xl font-bold text-primary">{typeof total === 'number' ? total.toLocaleString() : total}</p>
                </div>

                <Badge className={getStatusColor(order.status)}>{order.status}</Badge>

                <Button size="sm">Xem chi tiết</Button>
              </div>
            </div>
          </Card>
        )})}
      </div>
    </div>
  )
}
