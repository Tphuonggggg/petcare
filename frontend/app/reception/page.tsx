"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Users, Clock, CheckCircle, PawPrint } from "lucide-react"

export default function ReceptionDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<{ email: string } | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(userData))
  }, [router])

  if (!user) return null

  const stats = [
    { title: "Lịch hẹn hôm nay", value: "12", icon: Calendar, color: "text-blue-600" },
    { title: "Đang chờ", value: "5", icon: Clock, color: "text-orange-600" },
    { title: "Đã hoàn thành", value: "7", icon: CheckCircle, color: "text-green-600" },
    { title: "Khách hàng mới", value: "3", icon: Users, color: "text-purple-600" },
  ]

  const todayAppointments = [
    {
      id: 1,
      time: "09:00",
      customer: "Nguyễn Văn A",
      pet: "Max (Chó)",
      service: "Khám tổng quát",
      status: "completed",
    },
    {
      id: 2,
      time: "10:00",
      customer: "Trần Thị B",
      pet: "Luna (Mèo)",
      service: "Tiêm phòng",
      status: "in-progress",
    },
    { id: 3, time: "11:00", customer: "Lê Văn C", pet: "Bobby (Chó)", service: "Spa", status: "waiting" },
    { id: 4, time: "14:00", customer: "Phạm Thị D", pet: "Mimi (Mèo)", service: "Khám bệnh", status: "scheduled" },
  ]

  const getStatusBadge = (status: string) => {
    const config = {
      completed: { label: "Hoàn thành", class: "bg-green-100 text-green-800" },
      "in-progress": { label: "Đang khám", class: "bg-blue-100 text-blue-800" },
      waiting: { label: "Chờ khám", class: "bg-orange-100 text-orange-800" },
      scheduled: { label: "Đã đặt", class: "bg-gray-100 text-gray-800" },
    }
    const { label, class: className } = config[status as keyof typeof config]
    return <span className={`text-xs px-2 py-1 rounded ${className}`}>{label}</span>
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PawPrint className="h-6 w-6 text-primary" />
            <div>
              <span className="font-bold">PetCare - Tiếp tân</span>
            </div>
          </div>
          <Button variant="outline" onClick={() => { import('@/lib/auth').then(m => m.logout('/')) }}>
            Đăng xuất
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard Tiếp tân</h1>
          <p className="text-muted-foreground">Quản lý lịch hẹn và khách hàng</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            )
          })}
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
                {todayAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50">
                    <div className="font-mono font-bold text-lg min-w-[60px]">{appointment.time}</div>
                    <div className="flex-1">
                      <p className="font-medium">{appointment.customer}</p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.pet} - {appointment.service}
                      </p>
                    </div>
                    {getStatusBadge(appointment.status)}
                    <Button size="sm" variant="outline" className="bg-transparent">
                      Chi tiết
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Thao tác nhanh</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" onClick={() => router.push("/reception/appointments/new")}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Đặt lịch mới
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
                  onClick={() => router.push("/reception/check-in")}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Check-in khách
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Khách hàng chờ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm">Lê Văn C</p>
                    <p className="text-xs text-muted-foreground">Bobby - Spa (11:00)</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm">Hoàng Thị E</p>
                    <p className="text-xs text-muted-foreground">Kitty - Grooming (11:30)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
