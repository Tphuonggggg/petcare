"use client"

import { useEffect, useState } from "react"
import { getSelectedBranchId, getSelectedBranchName } from '@/lib/branch'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Plus } from "lucide-react"
import { BookingDialog } from "@/components/booking-dialog"

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
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [bookings, setBookings] = useState<any[]>(mockBookings)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const { apiGet } = await import('@/lib/api')
        const branchId = getSelectedBranchId()
        const branchName = getSelectedBranchName()
        const data = branchId ? await apiGet('/bookings?branchId=' + encodeURIComponent(branchId)) : await apiGet('/bookings')
        if (mounted && Array.isArray(data)) {
          const filtered = branchId ? data.filter((b: any) => String(b.branchId ?? b.branch) === String(branchId) || String(b.branchName ?? b.branch) === String(branchName)) : data
          setBookings(filtered)
        }
      } catch (e) {
        // keep mockBookings on error
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
      case "Đã xác nhận":
        return "bg-green-100 text-green-700"
      case "Chờ xác nhận":
        return "bg-yellow-100 text-yellow-700"
      case "Đã hủy":
        return "bg-red-100 text-red-700"
      case "Hoàn thành":
        return "bg-blue-100 text-blue-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lịch đặt hẹn</h1>
          <p className="text-muted-foreground mt-1">Quản lý lịch hẹn dịch vụ</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Đặt lịch mới
        </Button>
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
                  <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
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
                  <Button variant="outline" size="sm">
                    Chi tiết
                  </Button>
                  <Button variant="outline" size="sm">
                    Chỉnh sửa
                  </Button>
                  {booking.status === "Chờ xác nhận" && <Button size="sm">Xác nhận</Button>}
                </div>
              </div>
            </div>
          </Card>
        )})}
      </div>

      <BookingDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  )
}
