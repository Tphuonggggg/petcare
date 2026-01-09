"use client"

import { useEffect, useState } from "react"
import { getSelectedBranchId, getSelectedBranchName } from '@/lib/branch'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock } from "lucide-react"
import { BookingDialog } from "@/components/booking-dialog"
import DashboardBranchGate from '@/components/dashboard-branch-gate'

const mockBookings = [
  {
    id: 1,
    date: "2024-12-25",
    time: "09:00",
    customer: "Nguyễn Văn A",
    pet: "Milu (Chó)",
    service: "Khám tổng quát",
    branch: "Chi nhánh Quận 1",
    status: "Đã xác nhận",
    employee: "BS. Trần Văn X",
  },
  {
    id: 2,
    date: "2024-12-25",
    time: "10:30",
    customer: "Trần Thị B",
    pet: "Kitty (Mèo)",
    service: "Tiêm phòng dại",
    branch: "Chi nhánh Quận 3",
    status: "Chờ xác nhận",
    employee: "BS. Nguyễn Thị Y",
  },
  {
    id: 3,
    date: "2024-12-25",
    time: "14:00",
    customer: "Lê Văn C",
    pet: "Rocky (Chó)",
    service: "Tắm & cắt tỉa lông",
    branch: "Chi nhánh Quận 10",
    status: "Đã xác nhận",
    employee: "NV. Lê Thị Z",
  },
]

export default function BookingsPage() {
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [bookings, setBookings] = useState<any[]>(mockBookings)
  const [loading, setLoading] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  const [branches, setBranches] = useState<any[]>([])
  const [branchId, setBranchId] = useState<number | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Load branches
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { apiGet } = await import('@/lib/api')
        const data = await apiGet('/branches?pageSize=100')
        if (mounted) {
          const items = Array.isArray(data) ? data : (data?.items || [])
          setBranches(items)
          if (items.length > 0) {
            setBranchId(items[0].branchId || items[0].id)
          }
        }
      } catch (e) {
        console.error('Failed to load branches:', e)
      }
    })()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!branchId) return
      setLoading(true)
      try {
        const { apiGet } = await import('@/lib/api')
        const data = await apiGet(`/bookings?branchId=${branchId}&page=${currentPage}&pageSize=${pageSize}`)
        
        if (mounted) {
          // Handle both array and paginated response
          let items = Array.isArray(data) ? data : (data?.items || [])
          const count = Array.isArray(data) ? data.length : (data?.totalCount || 0)
          
          // Transform API response to match UI expectations
          const transformed = items.map((b: any) => ({
            id: b.bookingId,
            bookingId: b.bookingId,
            date: b.requestedDateTime ? new Date(b.requestedDateTime).toISOString().split('T')[0] : '',
            time: b.requestedDateTime ? new Date(b.requestedDateTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '',
            customer: b.customerName || '',
            pet: b.petName || '',
            service: b.serviceType || 'Dịch vụ',
            branch: b.branchName || '',
            status: b.status || 'Pending',
            employee: b.employeeName || '',
            ...b // Keep original fields too
          }))
          
          setBookings(transformed)
          setTotalCount(count)
        }
      } catch (e) {
        console.error('Error loading bookings:', e)
        // keep mockBookings on error
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
  }, [branchId, currentPage, pageSize])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Đã xác nhận":
      case "Confirmed":
        return "bg-green-100 text-green-700"
      case "Chờ xác nhận":
      case "Pending":
      case "pending":
        return "bg-yellow-100 text-yellow-700"
      case "Đã hủy":
      case "Cancelled":
        return "bg-red-100 text-red-700"
      case "Hoàn thành":
      case "Completed":
        return "bg-blue-100 text-blue-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  // Map status tiếng Anh sang tiếng Việt để hiển thị
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "Pending":
      case "pending":
        return "Chờ xác nhận"
      case "Confirmed":
        return "Đã xác nhận"
      case "Cancelled":
        return "Đã hủy"
      case "Completed":
        return "Hoàn thành"
      default:
        return status
    }
  }

  const handleDetailClick = (booking: any) => {
    setSelectedBooking(booking)
    setIsDetailDialogOpen(true)
  }

  return (
    <DashboardBranchGate>
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-col md:flex-row gap-4">
        <div>
          <h1 className="text-3xl font-bold">Lịch đặt hẹn</h1>
          <p className="text-muted-foreground mt-1">Quản lý lịch hẹn dịch vụ</p>
        </div>
        <div className="w-full md:w-64">
          <Label htmlFor="branch-select" className="block mb-2 text-sm font-medium">Chọn Chi Nhánh</Label>
          <Select value={branchId?.toString() || ''} onValueChange={(v) => setBranchId(Number(v))}>
            <SelectTrigger id="branch-select">
              <SelectValue placeholder="Chọn chi nhánh" />
            </SelectTrigger>
            <SelectContent>
              {branches.map((b) => (
                <SelectItem key={b.branchId || b.id} value={(b.branchId || b.id).toString()}>
                  {b.name || b.branchName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {(loading ? [] : bookings).map((booking) => {
          const id = booking?.bookingId ?? booking?.id
          const serviceName = booking?.service ?? booking?.serviceName ?? booking?.service?.name ?? 'Dịch vụ'
          const customer = booking?.customer ?? booking?.customerName ?? booking?.customerId ?? ''
          const pet = booking?.pet ?? booking?.petName ?? ''
          return (
          <Card key={id} className="p-6">
            <div className="flex items-start gap-6">
              <div className="flex flex-col items-center justify-center bg-primary/10 rounded-lg p-4 min-w-[100px]">
                <Calendar className="h-6 w-6 text-primary mb-2" />
                <p className="font-semibold">{booking.date}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <Clock className="h-3 w-3" />
                  {booking.time}
                </div>
              </div>

              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{serviceName}</h3>
                    <p className="text-muted-foreground">
                      {customer} - {pet}
                    </p>
                  </div>
                  <Badge className={getStatusColor(booking.status)}>{getStatusLabel(booking.status)}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Chi nhánh</p>
                    <p className="font-medium">{booking.branch}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Nhân viên phụ trách</p>
                    <p className="font-medium">{booking.employee}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => handleDetailClick(booking)}>
                    Chi tiết
                  </Button>
                  {(getStatusLabel(booking.status) === "Chờ xác nhận") && <Button size="sm">Xác nhận</Button>}
                </div>
              </div>
            </div>
          </Card>
        )})}
      </div>

      {/* Pagination */}
      {totalCount > 0 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <Button
            variant="outline"
            disabled={currentPage === 1 || loading}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          >
            ← Trước
          </Button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Trang</span>
            <input
              type="number"
              min="1"
              max={Math.ceil(totalCount / pageSize)}
              value={currentPage}
              onChange={(e) => {
                const page = Math.max(1, Math.min(Math.ceil(totalCount / pageSize), parseInt(e.target.value) || 1))
                setCurrentPage(page)
              }}
              className="w-16 px-2 py-1 border rounded text-center"
              disabled={loading}
            />
            <span className="text-sm text-muted-foreground">trên {Math.ceil(totalCount / pageSize)}</span>
          </div>
          
          <Button
            variant="outline"
            disabled={currentPage === Math.ceil(totalCount / pageSize) || loading}
            onClick={() => setCurrentPage(p => Math.min(Math.ceil(totalCount / pageSize), p + 1))}
          >
            Sau →
          </Button>
        </div>
      )}

      {/* Detail Dialog */}
      {isDetailDialogOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Chi tiết đặt lịch</h2>
                <button onClick={() => setIsDetailDialogOpen(false)} className="text-2xl leading-none">&times;</button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Dịch vụ</p>
                  <p className="font-semibold">{selectedBooking.service || selectedBooking.serviceName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Trạng thái</p>
                  <Badge className={getStatusColor(selectedBooking.status)}>{getStatusLabel(selectedBooking.status)}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Khách hàng</p>
                  <p className="font-semibold">{selectedBooking.customer || selectedBooking.customerName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Thú cưng</p>
                  <p className="font-semibold">{selectedBooking.pet || selectedBooking.petName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ngày đặt</p>
                  <p className="font-semibold">{selectedBooking.date}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Thời gian</p>
                  <p className="font-semibold">{selectedBooking.time}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Chi nhánh</p>
                  <p className="font-semibold">{selectedBooking.branch || selectedBooking.branchName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nhân viên</p>
                  <p className="font-semibold">{selectedBooking.employee || selectedBooking.employeeName || 'N/A'}</p>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>Đóng</Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
    </DashboardBranchGate>
  )
}
