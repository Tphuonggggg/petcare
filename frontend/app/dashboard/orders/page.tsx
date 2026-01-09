"use client"

import { useEffect, useState } from "react"
import { getSelectedBranchId, getSelectedBranchName } from '@/lib/branch'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Package, Search, ChevronLeft, ChevronRight, X } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface Booking {
  invoiceId: number
  customerId: number
  customerName: string
  invoiceDate: string
  total: number
  totalAmount?: number
  finalAmount?: number
  status: string
  notes: string
  branchId: number
  branchName: string
  items?: Array<{
    invoiceItemId: number
    productName?: string
    serviceName?: string
    quantity: number
    unitPrice: number
    totalPrice: number
    itemType?: string
  }>
}

interface Branch {
  branchId: number
  name: string
}

interface BookingDetail {
  invoiceId: number
  customerName: string
  customerPhone: string
  customerEmail: string
  invoiceDate: string
  branchName: string
  total?: number
  totalAmount?: number
  finalAmount?: number
  status: string
  notes: string
  items?: Array<{
    invoiceItemId: number
    productName?: string
    serviceName?: string
    quantity: number
    unitPrice: number
    totalPrice: number
    itemType?: string
  }>
}

export default function OrdersPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranch, setSelectedBranch] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 10
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<BookingDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  // Load branches
  useEffect(() => {
    async function loadBranches() {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('http://localhost:5000/api/branches?pageSize=100', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          console.log('Branches response:', data)
          // API returns PaginatedResult with items array
          const branchList = data.items || []
          if (Array.isArray(branchList)) {
            setBranches(branchList)
            console.log('Branches loaded:', branchList)
            // Set initial branch from localStorage or default
            const defaultBranchId = getSelectedBranchId()
            if (defaultBranchId) {
              setSelectedBranch(String(defaultBranchId))
            } else if (branchList.length > 0) {
              setSelectedBranch(String(branchList[0].branchId))
            }
          }
        }
      } catch (e) {
        console.error('Error loading branches:', e)
        // Set default branches as fallback
        setBranches([
          { branchId: 1, name: 'Chi nhánh 1' },
          { branchId: 2, name: 'Chi nhánh 2' }
        ])
      }
    }
    loadBranches()
  }, [])

  // Load bookings
  const loadBookings = async (page: number = 1) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      let url = `http://localhost:5000/api/invoices?page=${page}&pageSize=${pageSize}`
      
      if (selectedBranch && selectedBranch !== "all") {
        url += `&branchId=${selectedBranch}`
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        let items = data.items || []
        
        // Filter by search term
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase()
          items = items.filter((b: Booking) => 
            b.invoiceId.toString().includes(term) ||
            b.customerName.toLowerCase().includes(term) ||
            b.branchName.toLowerCase().includes(term)
          )
        }

        setBookings(items)
        setTotalCount(data.totalCount || 0)
        setCurrentPage(page)
      }
    } catch (e) {
      console.error('Error loading invoices:', e)
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  // Load bookings on mount and when filters change
  useEffect(() => {
    loadBookings(1)
  }, [selectedBranch])

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      loadBookings(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Load booking detail
  const loadBookingDetail = async (bookingId: number) => {
    setDetailLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/invoices/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setSelectedBooking(data)
        setIsDetailDialogOpen(true)
      }
    } catch (e) {
      console.error('Error loading invoice detail:', e)
    } finally {
      setDetailLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || ""
    if (statusLower.includes("completed") || statusLower.includes("hoàn thành")) {
      return "bg-green-100 text-green-700"
    }
    if (statusLower.includes("in progress") || statusLower.includes("đang xử lý")) {
      return "bg-blue-100 text-blue-700"
    }
    if (statusLower.includes("cancelled") || statusLower.includes("hủy")) {
      return "bg-red-100 text-red-700"
    }
    if (statusLower.includes("pending") || statusLower.includes("chờ")) {
      return "bg-yellow-100 text-yellow-700"
    }
    return "bg-gray-100 text-gray-700"
  }

  const getStatusLabel = (status: string) => {
    const statusLower = status?.toLowerCase() || ""
    if (statusLower.includes("completed") || statusLower.includes("hoàn thành")) return "Hoàn thành"
    if (statusLower.includes("in progress") || statusLower.includes("đang xử lý")) return "Đang xử lý"
    if (statusLower.includes("cancelled") || statusLower.includes("hủy")) return "Hủy"
    if (statusLower.includes("pending") || statusLower.includes("chờ")) return "Chờ xử lý"
    return status || "Không xác định"
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Đơn hàng</h1>
          <p className="text-muted-foreground mt-1">Quản lý đơn hàng sản phẩm</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="text-sm font-medium block mb-2">Tìm kiếm đơn hàng</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo mã đơn, tên khách..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="w-48">
          <label className="text-sm font-medium block mb-2">Chi nhánh</label>
          <Select 
            value={selectedBranch} 
            onValueChange={(value) => {
              console.log('Branch selected:', value)
              setSelectedBranch(value)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn chi nhánh" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả chi nhánh</SelectItem>
              {branches.map((branch) => (
                <SelectItem key={branch.branchId} value={String(branch.branchId)}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="text-muted-foreground">Đang tải...</div>
          </div>
        ) : bookings.length > 0 ? (
          bookings.map((booking) => {
            const totalAmount = booking.finalAmount || booking.totalAmount || booking.total || 0
            const itemCount = booking.items?.length || 0
            return (
            <Card key={booking.invoiceId} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <ShoppingCart className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Đơn #{booking.invoiceId}</h3>
                    <p className="text-sm text-muted-foreground">
                      {booking.customerName} - {new Date(booking.invoiceDate).toLocaleDateString('vi-VN')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Chi nhánh: {booking.branchName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 mr-4">
                  <div className="text-center">
                    <Package className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                    <p className="text-sm font-medium">{itemCount} sản phẩm</p>
                  </div>

                  <div className="text-right min-w-[120px]">
                    <p className="text-sm text-muted-foreground">Tổng tiền</p>
                    <p className="text-lg font-bold text-primary">{totalAmount?.toLocaleString('vi-VN')} ₫</p>
                  </div>

                  <Badge className={getStatusColor(booking.status)}>
                    {getStatusLabel(booking.status)}
                  </Badge>
                </div>

                <Button 
                  size="sm"
                  onClick={() => loadBookingDetail(booking.invoiceId)}
                  disabled={detailLoading}
                >
                  Xem chi tiết
                </Button>
              </div>
            </Card>
            )
          })
        ) : (
          <div className="flex justify-center py-12">
            <div className="text-muted-foreground">Không tìm thấy đơn hàng nào</div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadBookings(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i
              if (pageNum > totalPages) return null
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => loadBookings(pageNum)}
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => loadBookings(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <span className="text-sm text-muted-foreground ml-4">
            Trang {currentPage} / {totalPages}
          </span>
        </div>
      )}

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng #{selectedBooking?.invoiceId}</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về đơn hàng
            </DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="flex justify-center py-8">
              <div className="text-muted-foreground">Đang tải...</div>
            </div>
          ) : selectedBooking ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tên khách hàng</label>
                  <p className="text-sm font-medium mt-1">{selectedBooking.customerName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Điện thoại</label>
                  <p className="text-sm font-medium mt-1">{selectedBooking.customerPhone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm font-medium mt-1">{selectedBooking.customerEmail}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Ngày lập hóa đơn</label>
                  <p className="text-sm font-medium mt-1">
                    {new Date(selectedBooking.invoiceDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Thông tin đơn hàng</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Chi nhánh</label>
                    <p className="text-sm font-medium mt-1">{selectedBooking.branchName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Trạng thái</label>
                    <Badge className={getStatusColor(selectedBooking.status)} style={{ marginTop: '0.25rem' }}>
                      {getStatusLabel(selectedBooking.status)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Chi tiết sản phẩm</h4>
                {selectedBooking.items && selectedBooking.items.length > 0 ? (
                  <div className="space-y-2">
                    {selectedBooking.items.map((item) => (
                      <div key={item.invoiceItemId} className="flex justify-between text-sm py-2 border-b">
                        <div>
                          <p className="font-medium">{item.productName || item.serviceName || 'Hàng hóa'}</p>
                          <p className="text-muted-foreground">
                            {item.quantity} x {item.unitPrice?.toLocaleString('vi-VN')} ₫
                          </p>
                        </div>
                        <p className="font-medium text-primary">{item.totalPrice?.toLocaleString('vi-VN')} ₫</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Không có sản phẩm</p>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <p className="text-lg font-semibold">Tổng cộng</p>
                  <p className="text-2xl font-bold text-primary">
                    {(selectedBooking.finalAmount || selectedBooking.totalAmount || selectedBooking.total || 0)?.toLocaleString('vi-VN')} ₫
                  </p>
                </div>
              </div>

              {selectedBooking.notes && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Ghi chú</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedBooking.notes}</p>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
