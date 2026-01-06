"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PawPrint, ArrowLeft, Search, Plus, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { apiGet, apiPost } from "@/lib/api"

interface OrderDetail {
  invoiceId: number
  customerId?: number
  customerName?: string
  customerPhone?: string
  invoiceDate?: string
  totalAmount?: number
  discountAmount?: number
  finalAmount?: number
  paymentMethod?: string
  status?: string
  branchId?: number
  branchName?: string
  items?: Array<{ productId: number; quantity: number; unitPrice: number }>
}

export default function SalesOrdersPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [orders, setOrders] = useState<OrderDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [branchId, setBranchId] = useState<number | null>(null)
  const pageSize = 10

  useEffect(() => {
    // Get branchId from localStorage
    const stored = localStorage.getItem('branchId')
    if (stored) {
      setBranchId(parseInt(stored))
    }
  }, [])

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

  useEffect(() => {
    if (branchId) {
      loadOrders()
    }
  }, [currentPage, branchId])

  const loadOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiGet(`/invoices?page=${currentPage}&pageSize=${pageSize}&branchId=${branchId}`)
      const orderList = data.items || data || []
      setOrders(Array.isArray(orderList) ? orderList : [])
      // Tính totalPages từ TotalCount
      const totalCount = data.totalCount || 0
      const calculatedPages = Math.ceil(totalCount / pageSize) || 1
      setTotalPages(calculatedPages)
    } catch (err) {
      console.error("Error loading orders:", err)
      setError("Không thể tải danh sách đơn hàng")
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmOrder = async (invoiceId: number) => {
    try {
      // First get invoice details to have all required fields
      const invoiceData = await apiGet(`/invoices/${invoiceId}`)
      
      const response = await fetch(`http://localhost:5000/api/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          invoiceId: invoiceId,
          status: 'Processing',
          branchId: invoiceData?.branchId || 1,
          customerId: invoiceData?.customerId || 1,
          employeeId: 1,
          totalAmount: invoiceData?.totalAmount || 0,
          discountAmount: invoiceData?.discountAmount || 0,
          finalAmount: invoiceData?.finalAmount || 0,
          paymentMethod: invoiceData?.paymentMethod || 'CASH'
        })
      })
      if (response.ok) {
        alert('Đơn hàng đang xử lý')
        loadOrders()
      }
    } catch (err) {
      console.error("Error confirming order:", err)
      alert('Lỗi khi xác nhận đơn hàng')
    }
  }

  const handleCompleteOrder = async (invoiceId: number) => {
    try {
      // First get invoice details to have all required fields
      const invoiceData = await apiGet(`/invoices/${invoiceId}`)
      
      const response = await fetch(`http://localhost:5000/api/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          invoiceId: invoiceId,
          status: 'Completed',
          branchId: invoiceData?.branchId || 1,
          customerId: invoiceData?.customerId || 1,
          employeeId: 1,
          totalAmount: invoiceData?.totalAmount || 0,
          discountAmount: invoiceData?.discountAmount || 0,
          finalAmount: invoiceData?.finalAmount || 0,
          paymentMethod: invoiceData?.paymentMethod || 'CASH'
        })
      })
      if (response.ok) {
        alert('Đơn hàng hoàn thành')
        loadOrders()
      }
    } catch (err) {
      console.error("Error completing order:", err)
      alert('Lỗi khi hoàn thành đơn hàng')
    }
  }

  const handlePrintInvoice = (invoiceId: number) => {
    window.open(`/sales/orders/${invoiceId}/print`, '_blank')
  }

  const getFilteredOrders = (filterType: string) => {
    const today = new Date().toISOString().split('T')[0]
    const query = searchQuery.toLowerCase().trim()
    
    return orders.filter(order => {
      const orderDate = order.invoiceDate ? order.invoiceDate.split('T')[0] : ''
      const status = (order.status ?? 'pending').toLowerCase()
      
      switch (filterType) {
        case 'today':
          return orderDate === today
        case 'pending':
          return status === 'pending'
        case 'processing':
          return status === 'processing'
        case 'completed':
          return status === 'completed'
        default:
          return true
      }
    }).filter(o => {
      if (!query) return true
      
      // Search by invoice ID
      const id = String(o.invoiceId ?? '')
      if (id.includes(query)) return true
      
      // Search by customer name
      const customer = String(o.customerName ?? '').toLowerCase()
      if (customer.includes(query)) return true
      
      // Search by customer phone
      const phone = String(o.customerPhone ?? '').toLowerCase()
      if (phone.includes(query)) return true
      
      // Search by payment method
      const payment = String(o.paymentMethod ?? '').toLowerCase()
      if (payment.includes(query)) return true
      
      // Search by amount (final amount)
      const finalAmount = String(o.finalAmount ?? '').replace(/\D/g, '')
      const queryNumber = query.replace(/\D/g, '')
      if (finalAmount.includes(queryNumber) && queryNumber) return true
      
      return false
    })
  }

  const renderOrdersList = (filterType: string) => {
    const filtered = getFilteredOrders(filterType)
    
    if (filtered.length === 0) {
      return <p className="text-muted-foreground text-center py-8">Không có đơn hàng nào</p>
    }

    return (
      <div className="space-y-4">
        {filtered.map((order) => {
          const id = order?.invoiceId
          const date = order?.invoiceDate ? new Date(order.invoiceDate).toLocaleDateString('vi-VN') : 'N/A'
          const customer = order?.customerName ?? 'N/A'
          const phone = order?.customerPhone ?? 'N/A'
          const total = order?.finalAmount ?? order?.totalAmount ?? 0
          const status = (order?.status ?? 'pending').toLowerCase()
          
          return (
            <Card key={id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="font-mono">ĐH{id}</CardTitle>
                      {getStatusBadge(status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{typeof total === 'number' ? total.toLocaleString() : total}đ</p>
                    <p className="text-xs text-muted-foreground">{order.paymentMethod || 'Chưa thanh toán'}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="font-medium mb-1">Khách hàng</p>
                  <p className="text-sm text-muted-foreground">{customer} - {phone}</p>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent"
                    onClick={() => router.push(`/sales/orders/${id}`)}
                  >
                    Xem chi tiết
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent"
                    onClick={() => handlePrintInvoice(id)}
                  >
                    In hóa đơn
                  </Button>
                  {status === "pending" && (
                    <Button size="sm" className="flex-1"
                      onClick={() => handleConfirmOrder(id)}
                    >
                      Xác nhận
                    </Button>
                  )}
                  {status === "processing" && (
                    <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleCompleteOrder(id)}
                    >
                      Hoàn thành
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
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
            <TabsTrigger value="pending">Chờ xử lý</TabsTrigger>
            <TabsTrigger value="processing">Đang xử lý</TabsTrigger>
            <TabsTrigger value="completed">Hoàn thành</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {loading ? (
              <p className="text-muted-foreground text-center py-8">Đang tải đơn hàng...</p>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={loadOrders}>Thử lại</Button>
              </div>
            ) : (
              renderOrdersList('all')
            )}
          </TabsContent>

          <TabsContent value="pending">
            {renderOrdersList('pending')}
          </TabsContent>

          <TabsContent value="processing">
            {renderOrdersList('processing')}
          </TabsContent>

          <TabsContent value="completed">
            {renderOrdersList('completed')}
          </TabsContent>
        </Tabs>

        {/* Pagination */}
        {orders.length > 0 && (
          <div className="flex items-center justify-between mt-8">
            <p className="text-sm text-muted-foreground">
              Trang {currentPage} của {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || loading}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || loading}
              >
                Tiếp
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
