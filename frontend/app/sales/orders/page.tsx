"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PawPrint, ArrowLeft, Search, Plus, Filter } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const orders = [
  {
    id: "DH001",
    date: "15/01/2025",
    customer: "Nguyễn Văn A",
    phone: "0901234567",
    products: [
      { name: "Thức ăn Royal Canin 2kg", qty: 2, price: 250000 },
      { name: "Xương gặm Petstages", qty: 3, price: 50000 },
    ],
    total: 650000,
    status: "completed",
    paymentMethod: "Tiền mặt",
  },
  {
    id: "DH002",
    date: "15/01/2025",
    customer: "Trần Thị B",
    phone: "0912345678",
    products: [
      { name: "Cát vệ sinh Cat's Best", qty: 1, price: 350000 },
      { name: "Khay vệ sinh", qty: 1, price: 100000 },
    ],
    total: 450000,
    status: "pending",
    paymentMethod: "Chuyển khoản",
  },
]

export default function SalesOrdersPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; class: string }> = {
      completed: { label: "Hoàn thành", class: "bg-green-100 text-green-800" },
      pending: { label: "Chờ xử lý", class: "bg-orange-100 text-orange-800" },
      processing: { label: "Đang xử lý", class: "bg-blue-100 text-blue-800" },
      cancelled: { label: "Đã hủy", class: "bg-red-100 text-red-800" },
    }
    const cfg = config[status] ?? { label: status, class: "bg-gray-100 text-gray-800" }
    return <span className={`text-xs px-2 py-1 rounded font-medium ${cfg.class}`}>{cfg.label}</span>
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/sales")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <PawPrint className="h-6 w-6 text-primary" />
              <span className="font-bold">PetCare - Bán hàng</span>
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
            <h1 className="text-3xl font-bold mb-2">Quản lý đơn hàng</h1>
            <p className="text-muted-foreground">Xem và quản lý tất cả đơn hàng</p>
          </div>
          <Button onClick={() => router.push("/sales/orders/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Tạo đơn hàng
          </Button>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo mã đơn, tên khách hàng..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="bg-transparent">
            <Filter className="h-4 w-4 mr-2" />
            Lọc
          </Button>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="mb-6">
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="today">Hôm nay</TabsTrigger>
            <TabsTrigger value="pending">Chờ xử lý</TabsTrigger>
            <TabsTrigger value="completed">Hoàn thành</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="space-y-4">
              {orders.map((order) => {
                const id = order?.orderId ?? order?.id
                const date = order?.date
                const customer = order?.customer ?? order?.customerName ?? ''
                const phone = order?.phone ?? order?.customerPhone ?? ''
                const total = order?.total ?? order?.amount ?? 0
                return (
                  <Card key={id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="font-mono">{id}</CardTitle>
                            {getStatusBadge(order.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">{date}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">{typeof total === 'number' ? total.toLocaleString() : total}đ</p>
                          <p className="text-xs text-muted-foreground">{order.paymentMethod}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <p className="font-medium mb-1">Khách hàng</p>
                        <p className="text-sm text-muted-foreground">{customer} - {phone}</p>
                      </div>

                      <div className="mb-4">
                        <p className="font-medium mb-2">Sản phẩm</p>
                        <div className="space-y-2">
                          {order.products.map((product, idx) => (
                            <div key={idx} className="flex justify-between text-sm p-2 bg-muted rounded">
                              <span>
                                {product.name} x{product.qty}
                              </span>
                              <span className="font-medium">{(product.price * product.qty).toLocaleString()}đ</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                          Xem chi tiết
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                          In hóa đơn
                        </Button>
                        {order.status === "pending" && (
                          <Button size="sm" className="flex-1">
                            Xác nhận
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="today">
            <p className="text-muted-foreground">Hiển thị đơn hàng hôm nay...</p>
          </TabsContent>

          <TabsContent value="pending">
            <p className="text-muted-foreground">Hiển thị đơn hàng chờ xử lý...</p>
          </TabsContent>

          <TabsContent value="completed">
            <p className="text-muted-foreground">Hiển thị đơn hàng đã hoàn thành...</p>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
