"use client"

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowRight, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { apiGet } from '@/lib/api'

interface OrderItem {
  invoiceItemId: number
  productName?: string
  serviceName?: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface OrderData {
  invoiceId: number
  customerId: number
  branchId: number
  branchName?: string
  invoiceDate: string
  totalAmount: number
  discountAmount: number
  finalAmount: number
  status: string
  paymentMethod: string
  customerName?: string
  customerPhone?: string
  items?: OrderItem[]
}

interface Branch {
  branchId: number
  name: string
}

export default function SalesOrdersPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [userBranchId, setUserBranchId] = useState<number | null>(null)
  const [branchName, setBranchName] = useState<string>('')
  const [orders, setOrders] = useState<OrderData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Search & Filter
  const [searchId, setSearchId] = useState('')
  const [filterToday, setFilterToday] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [filteredOrders, setFilteredOrders] = useState<OrderData[]>([])
  const [totalOrders, setTotalOrders] = useState(0)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    // Get branchId từ localStorage (set khi login)
    const branchIdFromStorage = localStorage.getItem('branchId')
    const userData = localStorage.getItem('user')
    
    if (!branchIdFromStorage || !userData) {
      router.push('/login')
      return
    }
    
    const branchId = parseInt(branchIdFromStorage)
    setUserBranchId(branchId)
    
    // Parse branch name từ user data nếu có
    try {
      const user = JSON.parse(userData)
      // Load orders với branchId cố định
      loadOrders(branchId)
    } catch (err) {
      console.error("Error parsing user data:", err)
      loadOrders(branchId)
    }
  }, [])

  useEffect(() => {
    if (userBranchId) {
      loadOrders(userBranchId)
    }
  }, [userBranchId])

  useEffect(() => {
    let filtered = orders
    
    // Lọc theo ngày hôm nay nếu được chọn
    if (filterToday) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.invoiceDate)
        return orderDate >= today && orderDate < tomorrow
      })
    }
    
    // Lọc theo trạng thái
    if (filterStatus) {
      filtered = filtered.filter(order => 
        order.status?.toLowerCase() === filterStatus.toLowerCase()
      )
    }
    
    // Lọc theo search ID hoặc tên khách
    if (searchId.trim()) {
      filtered = filtered.filter(order => 
        order.invoiceId.toString().includes(searchId) ||
        order.customerName?.toLowerCase().includes(searchId.toLowerCase())
      )
    }
    
    setFilteredOrders(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [searchId, filterToday, filterStatus, orders])

  const loadOrders = useCallback(async (branchId: number) => {
    try {
      setLoading(true)
      setError(null)
      
      // Load toàn bộ dữ liệu đơn hàng của chi nhánh (không phân trang)
      const url = `/invoices?pageSize=10000&page=1&branchId=${branchId}`
      
      const data = await apiGet(url)
      setOrders(data.items || [])
      setTotalOrders(data.total || 0)
      
      // Set branch name từ first order nếu có
      if (data.items && data.items.length > 0 && data.items[0].branchName) {
        setBranchName(data.items[0].branchName)
      }
    } catch (err) {
      console.error("Error loading orders:", err)
      setError("Không thể tải danh sách đơn hàng")
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách đơn hàng",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const getStatusBadge = (status?: string) => {
    const config: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: "Chờ xử lý", variant: "secondary" },
      processing: { label: "Đang xử lý", variant: "outline" },
      paid: { label: "Đã thanh toán & Hoàn thành", variant: "default" },
      cancelled: { label: "Đã hủy", variant: "destructive" },
    }
    const s = (status ?? "pending").toLowerCase()
    const cfg = config[s] ?? { label: status, variant: "outline" }
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>
  }

  const handleViewOrder = (invoiceId: number) => {
    router.push(`/sales/orders/${invoiceId}`)
  }

  // Pagination calculation
  const totalPages = Math.ceil(filteredOrders.length / pageSize)
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <h1 className="font-bold text-2xl">
            Danh sách đơn hàng 
            {branchName && <span className="text-muted-foreground font-normal"> • {branchName}</span>}
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Tìm theo ID đơn hàng hoặc tên khách..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant={filterToday ? "default" : "outline"}
              onClick={() => setFilterToday(!filterToday)}
            >
              Hôm nay
            </Button>
          </div>
          
          {/* Status Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filterStatus === null ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus(null)}
            >
              Tất cả
            </Button>
            <Button
              variant={filterStatus === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("pending")}
            >
              Chờ xử lý
            </Button>
            <Button
              variant={filterStatus === "processing" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("processing")}
            >
              Đang xử lý
            </Button>
            <Button
              variant={filterStatus === "paid" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("paid")}
            >
              Đã thanh toán & Hoàn thành
            </Button>
            <Button
              variant={filterStatus === "cancelled" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("cancelled")}
            >
              Đã hủy
            </Button>
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50 mb-6">
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                {orders.length === 0 ? 'Không có đơn hàng nào' : 'Không tìm thấy đơn hàng phù hợp'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {paginatedOrders.map((order) => (
              <Card 
                key={order.invoiceId} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleViewOrder(order.invoiceId)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-mono font-bold text-lg">ĐH{order.invoiceId}</h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.customerName || 'N/A'} • {order.customerPhone || 'N/A'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Chi nhánh: {order.branchName || 'N/A'} • {order.invoiceDate ? new Date(order.invoiceDate).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'N/A'}
                      </p>
                      {order.items && order.items.length > 0 && (
                        <p className="text-sm">
                          <span className="text-muted-foreground">Sản phẩm:</span> {order.items.length} mục
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Tổng tiền</p>
                        <p className="text-xl font-bold text-primary">
                          {(order.finalAmount || order.totalAmount || 0).toLocaleString()}đ
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewOrder(order.invoiceId)
                        }}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Trang {currentPage} trong {totalPages} • {filteredOrders.length} đơn hàng
            </p>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Trước
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Sau
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Summary */}
        {totalPages <= 1 && (
          <div className="mt-8 text-sm text-muted-foreground text-right">
            {filteredOrders.length} đơn hàng
            {filterToday && ' (hôm nay)'}
            {searchId && ` (tìm: "${searchId}")`}
          </div>
        )}
      </main>
    </div>
  )
}
