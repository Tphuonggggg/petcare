"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, ShoppingCart, Package, TrendingUp, PawPrint, Plus, RefreshCw, Search, AlertCircle } from "lucide-react"
import { apiGet, apiPost } from "@/lib/api"

interface DashboardSummary {
  totalOrdersToday: number
  pendingOrders: number
  completedOrders: number
  totalRevenue: number
}

interface OrderDetail {
  orderId: number
  orderTime: string
  customerName: string
  products: string
  amount: number
  status: string
}

interface Branch {
  branchId: number
  name: string
}

interface Employee {
  employeeId: number
  fullName: string
  branchId: number
  positionId: number
}

export default function SalesDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [branchId, setBranchId] = useState<number | null>(null)
  const [branches, setBranches] = useState<Branch[]>([])
  const [summary, setSummary] = useState<DashboardSummary>({
    totalOrdersToday: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
  })
  const [recentOrders, setRecentOrders] = useState<OrderDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    const employeeId = localStorage.getItem("employeeId")
    
    if (!userData || !employeeId) {
      router.push("/login")
      return
    }
    
    setUser(JSON.parse(userData))
    loadEmployeeInfo(parseInt(employeeId))
  }, [router])

  const loadEmployeeInfo = async (empId: number) => {
    try {
      const empData = await apiGet(`/employees/${empId}`)
      setEmployee(empData)
      setBranchId(empData.branchId)
      loadBranches()
    } catch (error) {
      console.error("Error loading employee info:", error)
      alert("Lỗi khi tải thông tin nhân viên")
      router.push("/login")
    }
  }

  useEffect(() => {
    if (branchId) {
      loadDashboardData()
    }
  }, [branchId])

  const loadBranches = async () => {
    try {
      const data = await apiGet("/branches?page=1&pageSize=100")
      setBranches(data.items || [])
      loadDashboardData()
    } catch (error) {
      console.error("Error loading branches:", error)
      loadDashboardData()
    }
  }

  const loadDashboardData = async () => {
    try {
      setRefreshing(true)
      if (!branchId) return
      
      const [summaryData, ordersData] = await Promise.all([
        apiGet(`/SalesDashboard/summary?branchId=${branchId}`),
        apiGet(`/SalesDashboard/today-orders?branchId=${branchId}&take=20`)
      ])
      
      setSummary(summaryData)
      setRecentOrders(ordersData || [])
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  if (!user) return null

  const getStatusBadge = (status: string) => {
    const config = {
      paid: { label: "Đã thanh toán", class: "bg-green-100 text-green-800" },
      completed: { label: "Đã thanh toán", class: "bg-green-100 text-green-800" },
      pending: { label: "Chờ xử lý", class: "bg-orange-100 text-orange-800" },
      processing: { label: "Đang xử lý", class: "bg-blue-100 text-blue-800" },
      cancelled: { label: "Đã hủy", class: "bg-red-100 text-red-800" },
    }
    const statusLower = (status || "pending").toLowerCase()
    const badgeConfig = config[statusLower as keyof typeof config] || { label: status || "Chờ xử lý", class: "bg-gray-100 text-gray-800" }
    return <span className={`text-xs px-2 py-1 rounded font-medium ${badgeConfig.class}`}>{badgeConfig.label}</span>
  }

  const formatTime = (dateTime: string) => {
    try {
      return new Date(dateTime).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateTime
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <PawPrint className="h-6 w-6 text-primary" />
              <div>
                <span className="font-bold">PetCare - Bán hàng</span>
                {employee && (
                  <p className="text-xs text-muted-foreground">{employee.fullName}</p>
                )}
              </div>
            </div>
            
            {employee && branchId && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Chi nhánh:</label>
                <div className="border rounded px-2 py-1 text-sm bg-muted">
                  {branches.find((b) => b.branchId === branchId)?.name || "N/A"}
                </div>
              </div>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={loadDashboardData}
            disabled={refreshing}
            className="bg-transparent"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard Bán hàng</h1>
            <p className="text-muted-foreground">Quản lý đơn hàng và sản phẩm</p>
          </div>
          <Button className="gap-2" onClick={() => router.push("/sales/orders/new")}>
            <Plus className="h-4 w-4" />
            Tạo Đơn Hàng
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push("/sales/orders")}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Đơn hàng (7 ngày)</CardTitle>
              <ShoppingCart className={`h-5 w-5 text-blue-600`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary.totalOrdersToday}</div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push("/sales/orders?filter=pending")}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Chờ xử lý</CardTitle>
              <AlertCircle className={`h-5 w-5 text-orange-600`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary.pendingOrders}</div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push("/sales/orders?filter=paid")}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Đã thanh toán</CardTitle>
              <Package className={`h-5 w-5 text-green-600`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary.completedOrders}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Đơn hàng gần đây</CardTitle>
                  <CardDescription>Các giao dịch trong 30 ngày gần đây</CardDescription>
                </div>
                <Button onClick={() => router.push("/sales/orders")}>Xem tất cả</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Không có đơn hàng gần đây
                  </div>
                ) : (
                  recentOrders.slice(0, 4).map((order) => (
                    <div key={order.orderId} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50">
                      <div className="font-mono font-bold text-lg min-w-[60px]">{formatTime(order.orderTime)}</div>
                      <div className="flex-1">
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-sm text-muted-foreground">{order.products}</p>
                      </div>
                      {getStatusBadge(order.status)}
                      <div className="flex gap-2">
                        <div className="text-right">
                          <p className="font-bold text-primary">{order.amount.toLocaleString()}đ</p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-transparent"
                          onClick={() => router.push(`/sales/orders/${order.orderId}`)}
                        >
                          Chi tiết
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Thao tác nhanh</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  className="w-full justify-start" 
                  onClick={() => router.push("/sales/orders/new")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo đơn hàng mới
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push("/sales/orders")}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Xem tất cả đơn hàng
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push("/sales/products")}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Quản lý sản phẩm
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push("/sales/inventory")}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Kiểm tra kho
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push("/sales/orders?filter=pending")}
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Đơn chờ xử lý
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tổng quan</CardTitle>
                <CardDescription className="text-xs">Thống kê bán hàng</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">Doanh thu hôm nay</p>
                      <p className="font-bold text-primary text-lg">{(summary.totalRevenue / 1000000).toFixed(1)}M</p>
                    </div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">Đơn hàng đã thanh toán</p>
                      <p className="font-bold text-green-600 text-lg">{summary.completedOrders}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">Chờ xử lý</p>
                      <p className="font-bold text-orange-600 text-lg">{summary.pendingOrders}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
