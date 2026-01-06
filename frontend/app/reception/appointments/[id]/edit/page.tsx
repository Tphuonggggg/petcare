"use client"

import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { apiGet, apiPut } from "@/lib/api"

interface Service {
  serviceId: number
  name: string
}

interface BookingDetail {
  bookingId: number
  bookingTime: string
  customerName: string
  petName: string
  petType: string
  serviceType: string
  status: string
  notes?: string
}

interface Pet {
  petId: number
  name: string
  species: string
}

export default function EditAppointmentPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [pets, setPets] = useState<Pet[]>([])
  
  const [selectedService, setSelectedService] = useState("")
  const [appointmentDate, setAppointmentDate] = useState("")
  const [appointmentTime, setAppointmentTime] = useState("")
  const [notes, setNotes] = useState("")
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load booking detail
      const allBookings = await apiGet("/ReceptionistDashboard/today-bookings")
      const bookingData = allBookings.find((b: any) => b.bookingId === Number(id))
      
      if (!bookingData) {
        throw new Error("Booking not found")
      }

      const booking: BookingDetail = {
        bookingId: bookingData.bookingId,
        bookingTime: bookingData.bookingTime,
        customerName: bookingData.customerName || "N/A",
        petName: bookingData.petName || "N/A",
        petType: bookingData.petType || "N/A",
        serviceType: bookingData.serviceType || "N/A",
        status: bookingData.status,
        notes: bookingData.notes || "",
      }

      setBooking(booking)
      setSelectedService(booking.serviceType)
      setNotes(booking.notes)

      // Parse booking time
      const date = new Date(booking.bookingTime)
      setAppointmentDate(date.toISOString().split("T")[0])
      setAppointmentTime(
        date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
      )

      // Load services
      const servicesData = await apiGet("/services?page=1&pageSize=100")
      setServices(servicesData.items || [])

      // Load pets
      const customersData = await apiGet("/customers?page=1&pageSize=100")
      const customer = customersData.items?.find(
        (c: any) => c.fullName === booking.customerName
      )
      if (customer && customer.pets) {
        setPets(customer.pets)
      }
    } catch (error) {
      console.error("Error loading data:", error)
      alert("Lỗi khi tải dữ liệu")
      router.push(`/reception/appointments/${id}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!selectedService || !appointmentDate || !appointmentTime) {
      alert("Vui lòng điền tất cả thông tin")
      return
    }

    try {
      setSubmitting(true)
      const bookingDateTime = new Date(`${appointmentDate}T${appointmentTime}`)

      await apiPut(`/bookings/${id}`, {
        bookingId: Number(id),
        customerId: 1, // TODO: Get from booking
        petId: 1, // TODO: Get from booking
        bookingType: selectedService,
        requestedDateTime: bookingDateTime.toISOString(),
        status: booking?.status || "Pending",
      })

      alert("Cập nhật lịch hẹn thành công")
      router.push(`/reception/appointments/${id}`)
    } catch (error) {
      console.error("Error saving booking:", error)
      alert("Lỗi khi cập nhật lịch hẹn")
    } finally {
      setSubmitting(false)
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
              onClick={() => router.push(`/reception/appointments/${id}`)}
              className="bg-transparent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
            <h1 className="text-2xl font-bold">Chỉnh sửa lịch hẹn</h1>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">Không tìm thấy lịch hẹn</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/reception/appointments/${id}`)}
            className="bg-transparent"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <h1 className="text-2xl font-bold">Chỉnh sửa lịch hẹn</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin chỉnh sửa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Khách hàng & thú cưng (chỉ đọc) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Khách hàng</label>
                <div className="border rounded-md px-3 py-2 bg-muted">
                  {booking.customerName}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Thú cưng</label>
                <div className="border rounded-md px-3 py-2 bg-muted">
                  {booking.petName} ({booking.petType})
                </div>
              </div>
            </div>

            {/* Dịch vụ */}
            <div>
              <label className="block text-sm font-medium mb-2">Dịch vụ</label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">-- Chọn dịch vụ --</option>
                {services.map((service) => (
                  <option key={service.serviceId} value={service.name}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Ngày giờ */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Ngày</label>
                <input
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Giờ</label>
                <input
                  type="time"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
            </div>

            {/* Ghi chú */}
            <div>
              <label className="block text-sm font-medium mb-2">Ghi chú</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Thêm ghi chú..."
                className="w-full border rounded-md px-3 py-2 min-h-[100px]"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                onClick={() => router.push(`/reception/appointments/${id}`)}
                className="bg-transparent"
                disabled={submitting}
              >
                Hủy
              </Button>
              <Button onClick={handleSave} disabled={submitting}>
                {submitting ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
