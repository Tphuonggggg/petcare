"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Users, Clock, CheckCircle, PawPrint, Plus, Phone, TrendingUp, AlertCircle, RefreshCw, Search } from "lucide-react"
import { apiGet, apiPost } from "@/lib/api"

interface DashboardSummary {
  totalBookingsToday: number
  pendingBookings: number
  completedBookings: number
  newCustomers: number
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

interface WaitingCustomer {
  bookingId: number
  customerName: string
  petName: string
  bookingTime: string
  serviceType: string
  waitingDuration: number
}

interface Branch {
  branchId: number
  name: string
}

interface Employee {
  employeeId: number
  fullName: string
  branchId: number
  positionId: number
}

export default function ReceptionDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [branchId, setBranchId] = useState<number | null>(null)
  const [branches, setBranches] = useState<Branch[]>([])
  const [summary, setSummary] = useState<DashboardSummary>({
    totalBookingsToday: 0,
    pendingBookings: 0,
    completedBookings: 0,
    newCustomers: 0,
  })
  const [todayAppointments, setTodayAppointments] = useState<BookingDetail[]>([])
  const [waitingCustomers, setWaitingCustomers] = useState<WaitingCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    const employeeId = localStorage.getItem("employeeId")
    
    if (!userData || !employeeId) {
      router.push("/login")
      return
    }
    
    setUser(JSON.parse(userData))
    loadEmployeeInfo(parseInt(employeeId))
  }, [router])

  const loadEmployeeInfo = async (empId: number) => {
    try {
      const empData = await apiGet(`/employees/${empId}`)
      console.log("[RECEPTION] Employee data:", empData)
      console.log("[RECEPTION] BranchId from employee:", empData.branchId)
      setEmployee(empData)
      setBranchId(empData.branchId)
      localStorage.setItem('branchId', empData.branchId?.toString())
      loadBranches()
    } catch (error) {
      console.error("Error loading employee info:", error)
      alert("Lỗi khi tải thông tin nhân viên")
      router.push("/login")
    }
  }

  useEffect(() => {
    if (branchId) {
      loadDashboardData()
      
      // Auto-refresh dashboard every 30 seconds
      const interval = setInterval(() => {
        loadDashboardData()
      }, 30000)
      
      return () => clearInterval(interval)
    }
  }, [branchId])

  const loadBranches = async () => {
    try {
      const data = await apiGet("/branches?page=1&pageSize=100")
      setBranches(data.items || [])
    } catch (error) {
      console.error("Error loading branches:", error)
    }
  }

  const loadDashboardData = async () => {
    try {
      setRefreshing(true)
      console.log("[DASHBOARD] Loading data for branchId:", branchId)
      const [summaryData, bookingsData, waitingData] = await Promise.all([
        apiGet(`/receptionistdashboard/summary?branchId=${branchId}`),
        apiGet(`/receptionistdashboard/today-bookings?branchId=${branchId}`),
        apiGet(`/receptionistdashboard/waiting-customers?branchId=${branchId}`).catch(() => []),
      ])
      console.log("[DASHBOARD] Bookings data received:", bookingsData)
      console.log("[DASHBOARD] Bookings count:", bookingsData?.length || 0)
      setSummary(summaryData)
      setTodayAppointments(bookingsData || [])
      setWaitingCustomers(waitingData || [])
    } catch (error) {
      console.error("[DASHBOARD] Error loading dashboard data:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleCheckIn = async (bookingId: number) => {
    try {
      const employeeId = 1 // TODO: Get from auth context
      await apiPost(`/receptionistdashboard/check-in/${bookingId}`, { employeeId })
      alert("Check-in thành công!")
      loadDashboardData()
    } catch (error) {
      console.error("Error checking in:", error)
      alert("Lỗi khi check-in")
    }
  }

  if (!user) return null

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; class: string }> = {
      "Pending": { label: "Đang chờ", class: "bg-orange-100 text-orange-800" },
      "Đang chờ": { label: "Đang chờ", class: "bg-orange-100 text-orange-800" },
      "Confirmed": { label: "Đã xác nhận", class: "bg-blue-100 text-blue-800" },
      "Đã xác nhận": { label: "Đã xác nhận", class: "bg-blue-100 text-blue-800" },
      "Completed": { label: "Hoàn thành", class: "bg-green-100 text-green-800" },
      "Hoàn thành": { label: "Hoàn thành", class: "bg-green-100 text-green-800" },
      "Cancelled": { label: "Đã hủy", class: "bg-red-100 text-red-800" },
      "Đã hủy": { label: "Đã hủy", class: "bg-red-100 text-red-800" },
      "completed": { label: "Hoàn thành", class: "bg-green-100 text-green-800" },
      "in-progress": { label: "Đang khám", class: "bg-blue-100 text-blue-800" },
      "waiting": { label: "Chờ khám", class: "bg-orange-100 text-orange-800" },
      "scheduled": { label: "Đã đặt", class: "bg-gray-100 text-gray-800" },
    }
    const config = statusMap[status] || { label: status, class: "bg-gray-100 text-gray-800" }
    return <span className={`text-xs px-2 py-1 rounded ${config.class}`}>{config.label}</span>
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
            <div className="flex items-center gap-2">
              <PawPrint className="h-6 w-6 text-primary" />
              <div>
                <span className="font-bold">PetCare - Tiếp tân</span>
                {employee && (
                  <p className="text-xs text-muted-foreground">{employee.fullName}</p>
                )}
              </div>
            </div>
            
            {employee && branchId && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Chi nhánh:</label>
                <div className="border rounded px-2 py-1 text-sm bg-muted">
                  {branches.find((b) => b.branchId === branchId)?.name || "N/A"}
                </div>
              </div>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={loadDashboardData}
            disabled={refreshing}
            className="bg-transparent"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard Tiếp tân</h1>
            <p className="text-muted-foreground">Quản lý lịch hẹn và khách hàng</p>
          </div>
          <Button className="gap-2" onClick={() => router.push("/reception/appointments/new")}>
            <Plus className="h-4 w-4" />
            Đặt Lịch Mới
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push("/reception/appointments")}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Lịch hẹn hôm nay</CardTitle>
              <Calendar className={`h-5 w-5 text-blue-600`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary.totalBookingsToday}</div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push("/reception/appointments?filter=pending")}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Đang chờ</CardTitle>
              <Clock className={`h-5 w-5 text-orange-600`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary.pendingBookings}</div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push("/reception/appointments?filter=completed")}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Đã hoàn thành</CardTitle>
              <CheckCircle className={`h-5 w-5 text-green-600`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary.completedBookings}</div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push("/reception/customers?filter=new")}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Khách hàng mới</CardTitle>
              <Users className={`h-5 w-5 text-purple-600`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary.newCustomers}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Lịch hẹn hôm nay</CardTitle>
                  <CardDescription>Quản lý lịch hẹn trong ngày</CardDescription>
                </div>
                <Button onClick={() => router.push("/reception/appointments")}>Xem tất cả</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todayAppointments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Không có lịch hẹn nào hôm nay
                  </div>
                ) : (
                  todayAppointments.slice(0, 5).map((appointment) => (
                    <div key={appointment.bookingId} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50">
                      <div className="font-mono font-bold text-lg min-w-[60px]">{formatTime(appointment.bookingTime)}</div>
                      <div className="flex-1">
                        <p className="font-medium">{appointment.customerName}</p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.petName} ({appointment.petType}) - {appointment.serviceType}
                        </p>
                      </div>
                      {getStatusBadge(appointment.status)}
                      <div className="flex gap-2">
                        {(appointment.status === "Pending" || appointment.status === "Đang chờ") && (
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleCheckIn(appointment.bookingId)}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Check-in
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-transparent"
                          onClick={() => router.push(`/reception/appointments/${appointment.bookingId}`)}
                        >
                          Chi tiết
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Thao tác nhanh</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  className="w-full justify-start" 
                  onClick={() => router.push("/reception/appointments/new")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Đặt lịch mới
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push("/reception/appointments")}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Xem tất cả lịch hẹn
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push("/reception/customers/search")}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Tìm kiếm khách hàng
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push("/reception/bookings/history")}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Lịch sử lịch hẹn
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push("/reception/customers")}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Quản lý khách hàng
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push("/reception/customers/new")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm khách hàng
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push("/reception/check-in")}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Check-in khách
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push("/reception/invoices")}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Hóa đơn & thanh toán
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Khách hàng chờ</CardTitle>
                <CardDescription className="text-xs">({waitingCustomers.length} khách đang chờ)</CardDescription>
              </CardHeader>
              <CardContent>
                {waitingCustomers.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    <AlertCircle className="h-4 w-4 mx-auto mb-2" />
                    Không có khách đang chờ
                  </div>
                ) : (
                  <div className="space-y-3">
                    {waitingCustomers.slice(0, 3).map((customer) => (
                      <div key={customer.bookingId} className="p-3 bg-muted rounded-lg hover:bg-muted/80 transition">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-sm">{customer.customerName}</p>
                          <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                            {customer.waitingDuration} phút
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          <PawPrint className="h-3 w-3 inline mr-1" />
                          {customer.petName} - {customer.serviceType}
                        </p>
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleCheckIn(customer.bookingId)}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Check-in
                        </Button>
                      </div>
                    ))}
                    {waitingCustomers.length > 3 && (
                      <Button 
                        variant="outline" 
                        className="w-full bg-transparent"
                        onClick={() => router.push("/reception/check-in")}
                      >
                        Xem tất cả ({waitingCustomers.length})
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
