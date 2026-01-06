"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"
import { apiGet } from "@/lib/api"

interface BookingDetail {
  bookingId: number
  bookingTime: string
  customerName: string
  petName: string
  petType: string
  serviceType: string
  status: string
}

export default function BookingHistoryPage() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [bookings, setBookings] = useState<BookingDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"day" | "month">("month") // day or month view

  useEffect(() => {
    loadBookings()
  }, [currentDate, viewMode])

  const loadBookings = async () => {
    try {
      setLoading(true)
      const data = await apiGet(
        `/ReceptionistDashboard/today-bookings?date=${currentDate.toISOString()}`
      )
      setBookings(data || [])
    } catch (error) {
      console.error("Error loading bookings:", error)
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const handlePrevDay = () => {
    const prev = new Date(currentDate)
    prev.setDate(prev.getDate() - 1)
    setCurrentDate(prev)
  }

  const handleNextDay = () => {
    const next = new Date(currentDate)
    next.setDate(next.getDate() + 1)
    setCurrentDate(next)
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800"
      case "Pending":
        return "bg-orange-100 text-orange-800"
      case "Cancelled":
        return "bg-red-100 text-red-800"
      case "Confirmed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/reception")}
            className="bg-transparent"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <h1 className="text-2xl font-bold">Lịch sử lịch hẹn</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Controls */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode("month")}
                  className={viewMode === "month" ? "bg-primary text-primary-foreground" : "bg-transparent"}
                >
                  Tháng
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode("day")}
                  className={viewMode === "day" ? "bg-primary text-primary-foreground" : "bg-transparent"}
                >
                  Ngày
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={viewMode === "month" ? handlePrevMonth : handlePrevDay}
                  className="bg-transparent"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToday}
                  className="bg-transparent min-w-[120px]"
                >
                  Hôm nay
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={viewMode === "month" ? handleNextMonth : handleNextDay}
                  className="bg-transparent"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-lg font-bold min-w-[200px] text-center">
                {viewMode === "month"
                  ? currentDate.toLocaleDateString("vi-VN", { month: "long", year: "numeric" })
                  : formatDate(currentDate)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings */}
        {loading ? (
          <Card>
            <CardContent className="py-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Đang tải dữ liệu...</p>
            </CardContent>
          </Card>
        ) : bookings.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">Không có lịch hẹn nào trong khoảng thời gian này</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Lịch hẹn ({bookings.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <div
                    key={booking.bookingId}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-medium text-lg">
                          {new Date(booking.bookingTime).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <p className="text-sm text-muted-foreground">{booking.customerName}</p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {booking.petName} ({booking.petType}) • {booking.serviceType}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs px-2 py-1 rounded font-medium ${getStatusBadgeColor(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/reception/appointments/${booking.bookingId}`)}
                      >
                        Chi tiết
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
