"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Users, PawPrint, Calendar, Package, DollarSign, Building } from "lucide-react"

type DashboardStats = {
  totalBookingsToday?: number
  pendingBookings?: number
  completedBookings?: number
  newCustomers?: number
}

type BookingDetail = {
  bookingId: number
  bookingTime: string
  customerName: string
  petName: string
  petType: string
  serviceType: string
  status: string
  notes?: string
}

type RecentCustomer = {
  customerId: number
  fullName: string
  phone?: string
  email?: string
  memberSince?: string
  membershipTierName?: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({})
  const [bookings, setBookings] = useState<BookingDetail[]>([])
  const [recentCustomers, setRecentCustomers] = useState<RecentCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)
        const { apiGet } = await import('@/lib/api')
        
        // Load dashboard summary stats
        const statsData = await apiGet('/ReceptionistDashboard/summary')
        if (statsData) {
          setStats(statsData)
        }
        
        // Load today's bookings
        const bookingsData = await apiGet('/ReceptionistDashboard/today-bookings')
        if (bookingsData && Array.isArray(bookingsData)) {
          setBookings(bookingsData.slice(0, 5)) // Show top 5
        }
        
        // Load recent customers
        const customersData = await apiGet('/ReceptionistDashboard/recent-customers')
        if (customersData && Array.isArray(customersData)) {
          setRecentCustomers(customersData.slice(0, 3)) // Show top 3
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
        setError('Không thể tải dữ liệu dashboard')
      } finally {
        setLoading(false)
      }
    }
    loadDashboardData()
  }, [])

  const statsDisplay = [
    { title: "Lịch hẹn hôm nay", value: stats.totalBookingsToday || 0, icon: Calendar, color: "text-purple-600" },
    { title: "Chờ xử lý", value: stats.pendingBookings || 0, icon: Users, color: "text-orange-600" },
    { title: "Hoàn thành", value: stats.completedBookings || 0, icon: PawPrint, color: "text-green-600" },
    { title: "Khách hàng mới (7 ngày)", value: stats.newCustomers || 0, icon: Package, color: "text-blue-600" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Tổng quan hệ thống quản lý PetCare</p>
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsDisplay.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <Icon className={`h-10 w-10 ${stat.color}`} />
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Lịch hẹn hôm nay ({bookings.length})</h3>
          {bookings.length === 0 ? (
            <p className="text-muted-foreground text-sm">Không có lịch hẹn nào hôm nay</p>
          ) : (
            <div className="space-y-3">
              {bookings.map((appointment) => {
                const bookingTime = new Date(appointment.bookingTime)
                const time = bookingTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                return (
                  <div key={appointment.bookingId} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="font-semibold text-primary min-w-[60px]">{time}</div>
                    <div className="flex-1">
                      <p className="font-medium">{appointment.customerName}</p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.petName} ({appointment.petType}) - {appointment.serviceType}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Trạng thái: {appointment.status}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Khách hàng mới (7 ngày qua)</h3>
          {recentCustomers.length === 0 ? (
            <p className="text-muted-foreground text-sm">Không có khách hàng mới</p>
          ) : (
            <div className="space-y-3">
              {recentCustomers.map((customer) => {
                const joinDate = new Date(customer.memberSince || new Date())
                const dateStr = joinDate.toLocaleDateString('vi-VN')
                return (
                  <div key={customer.customerId} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="flex-1">
                      <p className="font-medium">{customer.fullName}</p>
                      <p className="text-sm text-muted-foreground">{customer.phone || customer.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">Đăng ký: {dateStr}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
