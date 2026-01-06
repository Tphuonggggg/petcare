"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PawPrint, ArrowLeft, Search, Plus, Filter } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { apiGet, apiPost } from "@/lib/api"

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

export default function ReceptionAppointmentsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [appointments, setAppointments] = useState<BookingDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10) // Số lượng items mỗi trang

  useEffect(() => {
    loadAppointments()
  }, [])

  const loadAppointments = async () => {
    try {
      setLoading(true)
      const data = await apiGet("/ReceptionistDashboard/today-bookings")
      setAppointments(data || [])
    } catch (error) {
      console.error("Error loading appointments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = async (bookingId: number) => {
    try {
      const employeeId = 1 // TODO: Get from auth context
      await apiPost(`/ReceptionistDashboard/check-in/${bookingId}`, { employeeId })
      alert("Check-in thành công!")
      loadAppointments()
    } catch (error) {
      console.error("Error checking in:", error)
      alert("Lỗi khi check-in")
    }
  }

  const formatDateTime = (dateTime: string) => {
    try {
      const date = new Date(dateTime)
      return {
        date: date.toLocaleDateString("vi-VN"),
        time: date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      }
    } catch {
      return { date: "", time: "" }
    }
  }

  const filterAppointments = () => {
    let filtered = appointments

    if (searchQuery) {
      filtered = filtered.filter((apt) =>
        apt.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.petName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (activeTab === "today") {
      const today = new Date().toDateString()
      filtered = filtered.filter((apt) => new Date(apt.bookingTime).toDateString() === today)
    } else if (activeTab === "pending") {
      filtered = filtered.filter((apt) => apt.status === "Pending" || apt.status === "Đang chờ")
    }

    return filtered
  }

  const filteredAppointments = filterAppointments()
  
  // Pagination calculations
  const totalPages = Math.ceil(filteredAppointments.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedAppointments = filteredAppointments.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, activeTab])

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; class: string }> = {
      "Pending": { label: "Chờ xác nhận", class: "bg-orange-100 text-orange-800" },
      "Đang chờ": { label: "Chờ xác nhận", class: "bg-orange-100 text-orange-800" },
      "Confirmed": { label: "Đã xác nhận", class: "bg-green-100 text-green-800" },
      "Đã xác nhận": { label: "Đã xác nhận", class: "bg-green-100 text-green-800" },
      "Completed": { label: "Hoàn thành", class: "bg-blue-100 text-blue-800" },
      "Hoàn thành": { label: "Hoàn thành", class: "bg-blue-100 text-blue-800" },
      "Cancelled": { label: "Đã hủy", class: "bg-red-100 text-red-800" },
      "Đã hủy": { label: "Đã hủy", class: "bg-red-100 text-red-800" },
    }
    const config = statusMap[status] || { label: status, class: "bg-gray-100 text-gray-800" }
    return <span className={`text-xs px-2 py-1 rounded font-medium ${config.class}`}>{config.label}</span>
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
            <Button variant="ghost" size="icon" onClick={() => router.push("/reception")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <PawPrint className="h-6 w-6 text-primary" />
              <span className="font-bold">PetCare - Tiếp tân</span>
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
            <h1 className="text-3xl font-bold mb-2">Quản lý lịch hẹn</h1>
            <p className="text-muted-foreground">Xem và quản lý tất cả lịch hẹn</p>
          </div>
          <Button onClick={() => router.push("/reception/appointments/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Đặt lịch mới
          </Button>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên, số điện thoại..."
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

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">Tất cả ({appointments.length})</TabsTrigger>
            <TabsTrigger value="today">Hôm nay</TabsTrigger>
            <TabsTrigger value="pending">Chờ xác nhận</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Danh sách lịch hẹn</CardTitle>
                  <span className="text-sm text-muted-foreground">
                    Tổng: {filteredAppointments.length} lịch hẹn
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {filteredAppointments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Không có lịch hẹn nào
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {paginatedAppointments.map((apt) => {
                      const { date, time } = formatDateTime(apt.bookingTime)
                      return (
                        <div key={apt.bookingId} className="p-4 border rounded-lg hover:bg-muted/50">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-medium text-lg">{apt.customerName}</p>
                              <p className="text-sm text-muted-foreground">{date} - {time}</p>
                            </div>
                            {getStatusBadge(apt.status)}
                          </div>
                          <div className="grid md:grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-sm text-muted-foreground">Thú cưng</p>
                              <p className="font-medium">{apt.petName} ({apt.petType})</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Dịch vụ</p>
                              <p className="font-medium">{apt.serviceType}</p>
                            </div>
                            {apt.notes && (
                              <div className="md:col-span-2">
                                <p className="text-sm text-muted-foreground">Ghi chú</p>
                                <p className="font-medium">{apt.notes}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="bg-transparent"
                              onClick={() => router.push(`/reception/appointments/${apt.bookingId}`)}
                            >
                              Chi tiết
                            </Button>
                            {(apt.status === "Pending" || apt.status === "Đang chờ") && (
                              <Button 
                                size="sm" 
                                onClick={() => handleCheckIn(apt.bookingId)}
                              >
                                Check-in
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6 pt-4 border-t">
                        <div className="text-sm text-muted-foreground">
                          Hiển thị {startIndex + 1} - {Math.min(endIndex, filteredAppointments.length)} của {filteredAppointments.length}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                          >
                            Đầu
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            Trước
                          </Button>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              let pageNum
                              if (totalPages <= 5) {
                                pageNum = i + 1
                              } else if (currentPage <= 3) {
                                pageNum = i + 1
                              } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i
                              } else {
                                pageNum = currentPage - 2 + i
                              }
                              return (
                                <Button
                                  key={pageNum}
                                  variant={currentPage === pageNum ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setCurrentPage(pageNum)}
                                  className="w-10"
                                >
                                  {pageNum}
                                </Button>
                              )
                            })}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                          >
                            Sau
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                          >
                            Cuối
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
