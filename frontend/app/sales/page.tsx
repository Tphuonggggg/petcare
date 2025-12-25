"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, ShoppingCart, Package, TrendingUp, PawPrint } from "lucide-react"

export default function SalesDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<{ email: string } | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(userData))
  }, [router])

  if (!user) return null

  const stats = [
    { title: "Doanh thu hôm nay", value: "15.5M", icon: DollarSign, color: "text-green-600" },
    { title: "Đơn hàng", value: "23", icon: ShoppingCart, color: "text-blue-600" },
    { title: "Sản phẩm bán", value: "87", icon: Package, color: "text-purple-600" },
    { title: "Tăng trưởng", value: "+12%", icon: TrendingUp, color: "text-orange-600" },
  ]

  const recentOrders = [
    {
      id: "DH001",
      customer: "Nguyễn Văn A",
      products: "Thức ăn chó, Xương gặm",
      amount: 650000,
      status: "completed",
      time: "10:30",
    },
    {
      id: "DH002",
      customer: "Trần Thị B",
      products: "Cát vệ sinh, Khay vệ sinh",
      amount: 450000,
      status: "pending",
      time: "11:15",
    },
    {
      id: "DH003",
      customer: "Lê Văn C",
      products: "Sữa tắm, Lược chải lông",
      amount: 350000,
      status: "processing",
      time: "12:00",
    },
  ]

  const topProducts = [
    { name: "Thức ăn Royal Canin", sold: 45, revenue: "6.75M" },
    { name: "Cát vệ sinh Cat's Best", sold: 32, revenue: "4.80M" },
    { name: "Xương gặm Petstages", sold: 28, revenue: "2.80M" },
  ]

  const getStatusBadge = (status: string) => {
    const config = {
      completed: { label: "Hoàn thành", class: "bg-green-100 text-green-800" },
      pending: { label: "Chờ xử lý", class: "bg-orange-100 text-orange-800" },
      processing: { label: "Đang xử lý", class: "bg-blue-100 text-blue-800" },
    }
    const { label, class: className } = config[status as keyof typeof config]
    return <span className={`text-xs px-2 py-1 rounded font-medium ${className}`}>{label}</span>
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PawPrint className="h-6 w-6 text-primary" />
            <div>
              <span className="font-bold">PetCare - Bán hàng</span>
            </div>
          </div>
          <Button variant="outline" onClick={() => { import('@/lib/auth').then(m => m.logout('/')) }}>
            Đăng xuất
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard Bán hàng</h1>
          <p className="text-muted-foreground">Quản lý đơn hàng và sản phẩm</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Đơn hàng gần đây</CardTitle>
                  <CardDescription>Các giao dịch trong ngày hôm nay</CardDescription>
                </div>
                <Button onClick={() => router.push("/sales/orders")}>Xem tất cả</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-mono font-bold text-primary">{order.id}</p>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="font-medium">{order.customer}</p>
                        <p className="text-sm text-muted-foreground">{order.products}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">{order.amount.toLocaleString()}đ</p>
                        <p className="text-xs text-muted-foreground">{order.time}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                        Chi tiết
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                        In hóa đơn
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Thao tác nhanh</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" onClick={() => router.push("/sales/orders/new")}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Tạo đơn hàng
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push("/sales/products")}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Quản lý sản phẩm
                </Button>
                {/* Inventory check removed - navigation to inventory page deleted */}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sản phẩm bán chạy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topProducts.map((product, idx) => (
                    <div key={idx} className="p-3 bg-muted rounded-lg">
                      <p className="font-medium text-sm mb-1">{product.name}</p>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Đã bán: {product.sold}</span>
                        <span className="font-medium text-primary">{product.revenue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
