"use client"

import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Phone, Mail, MapPin, Clock } from "lucide-react"
import { apiGet, apiPost, apiPut } from "@/lib/api"

interface BookingDetail {
  bookingId: number
  bookingTime: string
  customerName: string
  customerPhone?: string
  customerEmail?: string
  petName: string
  petType: string
  serviceType: string
  status: string
  notes?: string
}

export default function AppointmentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id
  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [newStatus, setNewStatus] = useState("")
  const [notes, setNotes] = useState("")
  const [savingNotes, setSavingNotes] = useState(false)

  useEffect(() => {
    loadBookingDetail()
  }, [id])

  const loadBookingDetail = async () => {
    try {
      setLoading(true)
      // Fetch from API - sử dụng today-bookings để lấy data đầy đủ với customer info
      const allBookings = await apiGet("/ReceptionistDashboard/today-bookings")
      
      // Tìm booking theo ID
      const data = allBookings.find((b: any) => b.bookingId === Number(id))
      
      if (!data) {
        throw new Error("Booking not found")
      }
      
      // Fetch customer details to get phone and email
      let customerPhone = "N/A"
      let customerEmail = "N/A"
      
      try {
        // Try to find customer by name
        const customersResponse = await apiGet("/customers?page=1&pageSize=1000")
        const customer = customersResponse.items.find((c: any) => c.fullName === data.customerName)
        if (customer) {
          customerPhone = customer.phone || "N/A"
          customerEmail = customer.email || "N/A"
        }
      } catch (error) {
        console.error("Error loading customer details:", error)
      }
      
      // Transform API response to BookingDetail format
      const bookingData: BookingDetail = {
        bookingId: data.bookingId,
        bookingTime: data.bookingTime,
        customerName: data.customerName || "N/A",
        customerPhone: customerPhone,
        customerEmail: customerEmail,
        petName: data.petName || "N/A",
        petType: data.petType || "N/A",
        serviceType: data.serviceType || "N/A",
        status: data.status,
        notes: data.notes || "",
      }
      
      setBooking(bookingData)
      setNewStatus(bookingData.status)
      setNotes(bookingData.notes || "")
    } catch (error) {
      console.error("Error loading booking:", error)
      alert("Lỗi khi tải thông tin lịch hẹn")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (status: string) => {
    try {
      await apiPost(`/ReceptionistDashboard/update-booking-status/${id}`, {
        newStatus: status,
      })
      alert("Cập nhật trạng thái thành công")
      setNewStatus(status)
      loadBookingDetail()
    } catch (error) {
      console.error("Error updating status:", error)
      alert("Lỗi khi cập nhật trạng thái")
    }
  }

  const handleSaveNotes = async () => {
    try {
      setSavingNotes(true)
      if (!booking) return

      await apiPut(`/bookings/${id}`, {
        bookingId: booking.bookingId,
        customerId: 1, // TODO: Get from booking
        petId: 1, // TODO: Get from booking
        bookingType: booking.serviceType,
        requestedDateTime: booking.bookingTime,
        status: booking.status,
        notes: notes,
      })

      alert("Lưu ghi chú thành công")
      loadBookingDetail()
    } catch (error) {
      console.error("Error saving notes:", error)
      alert("Lỗi khi lưu ghi chú")
    } finally {
      setSavingNotes(false)
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

  if (!booking) {
    return (
      <div className="min-h-screen bg-muted/30">
        <header className="border-b bg-background">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/reception/appointments")}
              className="bg-transparent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-800">Không tìm thấy thông tin lịch hẹn</p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      "Pending": "bg-orange-100 text-orange-800",
      "Confirmed": "bg-blue-100 text-blue-800",
      "Completed": "bg-green-100 text-green-800",
      "Cancelled": "bg-red-100 text-red-800",
    }
    return statusMap[status] || "bg-gray-100 text-gray-800"
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

  const formatDate = (dateTime: string) => {
    try {
      return new Date(dateTime).toLocaleDateString("vi-VN")
    } catch {
      return dateTime
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/reception/appointments")}
            className="bg-transparent"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <h1 className="text-2xl font-bold">Chi tiết lịch hẹn</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="grid grid-cols-2 gap-6">
          {/* Thông tin khách hàng */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin khách hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Tên khách hàng</p>
                <p className="font-medium">{booking.customerName}</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Số điện thoại</p>
                  <p className="font-medium">{booking.customerPhone || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{booking.customerEmail || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Thông tin lịch hẹn */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin lịch hẹn</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Thú cưng</p>
                <p className="font-medium">{booking.petName} ({booking.petType})</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dịch vụ</p>
                <p className="font-medium">{booking.serviceType}</p>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Thời gian</p>
                  <p className="font-medium">{formatTime(booking.bookingTime)} - {formatDate(booking.bookingTime)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trạng thái */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Trạng thái</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/reception/appointments/${id}/edit`)}
                  className="bg-transparent"
                >
                  Chỉnh sửa
                </Button>
                {booking.status !== "Cancelled" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                    onClick={() => {
                      if (confirm("Bạn chắc chắn muốn hủy lịch hẹn này?")) {
                        handleStatusChange("Cancelled")
                      }
                    }}
                  >
                    Hủy lịch hẹn
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <span className={`inline-block w-3 h-3 rounded-full ${getStatusColor(booking.status).split(" ")[0]}`}></span>
              <span className={`font-medium ${getStatusColor(booking.status)}`}>{booking.status}</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {booking.status !== "Confirmed" && (
                <Button onClick={() => handleStatusChange("Confirmed")}>
                  Xác nhận
                </Button>
              )}
              {booking.status !== "Completed" && (
                <Button
                  variant="outline"
                  className="bg-transparent"
                  onClick={() => handleStatusChange("Completed")}
                >
                  Chuyển thành Hoàn thành
                </Button>
              )}
              {booking.status !== "Cancelled" && (
                <Button
                  variant="outline"
                  className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                  onClick={() => handleStatusChange("Cancelled")}
                >
                  Hủy lịch hẹn
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ghi chú */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Ghi chú</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              className="w-full border rounded-md px-3 py-2 min-h-[100px]"
              placeholder="Thêm ghi chú cho lịch hẹn này..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
            <Button 
              className="mt-4"
              onClick={handleSaveNotes}
              disabled={savingNotes}
            >
              {savingNotes ? "Đang lưu..." : "Lưu ghi chú"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
