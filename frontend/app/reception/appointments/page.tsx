"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PawPrint, ArrowLeft, Search, Plus, Filter, Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
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
  doctorName?: string
  notes?: string
}

export default function ReceptionAppointmentsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [appointments, setAppointments] = useState<BookingDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [gotoPage, setGotoPage] = useState("")
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined)

  // Debounce search input - wait 500ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1) // Reset to page 1 when search changes
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true)
      
      // Get branchId from localStorage
      let branchId = localStorage.getItem("branchId")
      
      if (!branchId) {
        // If no branchId in localStorage, try to get from employee
        const employeeId = localStorage.getItem("employeeId")
        if (employeeId) {
          try {
            const empData = await apiGet(`/employees/${employeeId}`)
            branchId = empData.branchId?.toString()
            if (branchId) {
              localStorage.setItem("branchId", branchId)
            }
          } catch (error) {
            console.error("Error loading employee info:", error)
          }
        }
      }
      
      if (!branchId) {
        console.error("No branchId found - using fallback")
        branchId = "9" // Use Tân Phú as default for testing
      }
      
      // Build API URL with status filter based on active tab
      let url = `/receptionistdashboard/all-bookings?branchId=${branchId}&page=${currentPage}&pageSize=${pageSize}`
      if (activeTab === "pending") {
        url += "&status=Pending"
      } else if (activeTab === "checkedin") {
        url += "&status=Confirmed"
      }
      if (dateFilter) {
        url += `&date=${format(dateFilter, 'yyyy-MM-dd')}`
      } else if (activeTab === "today") {
        const today = new Date()
        url += `&date=${format(today, 'yyyy-MM-dd')}`
      }
      if (debouncedSearch) {
        url += `&search=${encodeURIComponent(debouncedSearch)}`
      }
      
      console.log(`[DEBUG] Loading appointments: ${url}`)
      const data = await apiGet(url)
      setAppointments(data.items || [])
      setTotalCount(data.totalCount || 0)
      setTotalPages(data.totalPages || 0)
      console.log(`[DEBUG] Loaded ${data.items?.length || 0} appointments, Total: ${data.totalCount}, Pages: ${data.totalPages}`)
    } catch (error) {
      console.error("Error loading appointments:", error)
    } finally {
      setLoading(false)
    }
  }, [currentPage, activeTab, pageSize, debouncedSearch, dateFilter])

  useEffect(() => {
    loadAppointments()
  }, [loadAppointments])

  const handleCheckIn = async (bookingId: number) => {
    try {
      const employeeId = 1 // TODO: Get from auth context
      await apiPost(`/receptionistdashboard/check-in/${bookingId}`, { employeeId })
      alert("Check-in thành công!")
      setActiveTab("checkedin") // Chuyển sang tab đã check-in
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

  // Server-side filtering for tabs and search
  const displayedAppointments = appointments

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

        <div className="flex gap-4 mb-6 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên, số điện thoại..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="bg-transparent flex gap-2 items-center">
                <CalendarIcon className="h-4 w-4" />
                {dateFilter ? format(dateFilter, 'dd/MM/yyyy') : 'Chọn ngày'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateFilter}
                onSelect={d => { setDateFilter(d ?? undefined); setCurrentPage(1); }}
                initialFocus
              />
              {dateFilter && (
                <Button size="sm" variant="ghost" className="w-full mt-2" onClick={() => setDateFilter(undefined)}>
                  Xóa lọc ngày
                </Button>
              )}
            </PopoverContent>
          </Popover>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">Tất cả ({totalCount})</TabsTrigger>
            <TabsTrigger value="today">Hôm nay</TabsTrigger>
            <TabsTrigger value="pending">Chờ xác nhận</TabsTrigger>
            <TabsTrigger value="checkedin">Đã check-in</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Danh sách lịch hẹn</CardTitle>
                  <span className="text-sm text-muted-foreground">
                    Tổng: {totalCount} lịch hẹn (Trang {currentPage}/{totalPages})
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {displayedAppointments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Không có lịch hẹn nào
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {displayedAppointments.map((apt) => {
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
                            {apt.doctorName && (
                              <div>
                                <p className="text-sm text-muted-foreground">Bác sĩ</p>
                                <p className="font-medium">{apt.doctorName}</p>
                              </div>
                            )}
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

                    {/* Server-side Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6 pt-4 border-t">
                        <div className="text-sm text-muted-foreground">
                          Trang {currentPage} của {totalPages} - Tổng cộng {totalCount} lịch hẹn
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
                                  className="w-8 h-8 p-0"
                                  onClick={() => setCurrentPage(pageNum)}
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
                            Tiếp
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                          >
                            Cuối
                          </Button>
                          {/* Input nhảy trang */}
                          <form onSubmit={e => { e.preventDefault(); const n = Number(gotoPage); if (n >= 1 && n <= totalPages) setCurrentPage(n) }} className="flex items-center gap-1">
                            <Input
                              type="number"
                              min={1}
                              max={totalPages}
                              value={gotoPage}
                              onChange={e => setGotoPage(e.target.value)}
                              placeholder="Tới trang..."
                              className="w-20 h-8 px-2 py-1 text-sm"
                            />
                            <Button type="submit" size="sm" variant="outline">Đi</Button>
                          </form>
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
