"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PawPrint, ArrowLeft, Search, Plus, Filter } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const appointments = [
  {
    id: 1,
    time: "09:00",
    date: "15/01/2025",
    customer: "Nguyễn Văn A",
    phone: "0901234567",
    pet: "Max (Chó Golden)",
    service: "Khám tổng quát",
    doctor: "BS. Nguyễn Văn X",
    status: "confirmed",
  },
  {
    id: 2,
    time: "10:00",
    date: "15/01/2025",
    customer: "Trần Thị B",
    phone: "0912345678",
    pet: "Luna (Mèo Ba Tư)",
    service: "Tiêm phòng",
    doctor: "BS. Lê Thị Y",
    status: "pending",
  },
  {
    id: 3,
    time: "11:00",
    date: "15/01/2025",
    customer: "Lê Văn C",
    phone: "0923456789",
    pet: "Bobby (Chó Husky)",
    service: "Spa & Grooming",
    doctor: "NV. Phạm Văn Z",
    status: "confirmed",
  },
]

export default function ReceptionAppointmentsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const getStatusBadge = (status: string) => {
    const config = {
      confirmed: { label: "Đã xác nhận", class: "bg-green-100 text-green-800" },
      pending: { label: "Chờ xác nhận", class: "bg-orange-100 text-orange-800" },
      cancelled: { label: "Đã hủy", class: "bg-red-100 text-red-800" },
      completed: { label: "Hoàn thành", class: "bg-blue-100 text-blue-800" },
    }
    const { label, class: className } = config[status as keyof typeof config]
    return <span className={`text-xs px-2 py-1 rounded font-medium ${className}`}>{label}</span>
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

        <Tabs defaultValue="all">
          <TabsList className="mb-6">
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="today">Hôm nay</TabsTrigger>
            <TabsTrigger value="upcoming">Sắp tới</TabsTrigger>
            <TabsTrigger value="pending">Chờ xác nhận</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>Danh sách lịch hẹn</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointments.map((apt) => {
                    const id = apt?.appointmentId ?? apt?.id
                    const customer = apt?.customerName ?? apt?.customer ?? ''
                    const phone = apt?.phone ?? ''
                    const pet = apt?.petName ?? apt?.pet ?? ''
                    const service = apt?.serviceName ?? apt?.service ?? ''
                    const date = apt?.date ?? ''
                    const time = apt?.time ?? ''
                    const doctor = apt?.doctor ?? ''
                    return (
                    <div key={id} className="p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-medium text-lg">{customer}</p>
                          <p className="text-sm text-muted-foreground">{phone}</p>
                        </div>
                        {getStatusBadge(apt.status)}
                      </div>
                      <div className="grid md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Thú cưng</p>
                          <p className="font-medium">{pet}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Dịch vụ</p>
                          <p className="font-medium">{service}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Ngày & Giờ</p>
                          <p className="font-medium">{date} - {time}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Bác sĩ</p>
                          <p className="font-medium">{doctor}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="bg-transparent">Chi tiết</Button>
                        <Button size="sm" variant="outline" className="bg-transparent">Xác nhận</Button>
                        <Button size="sm" variant="outline" className="bg-transparent">Hủy</Button>
                      </div>
                    </div>
                  )})}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="today">
            <p className="text-muted-foreground">Hiển thị lịch hẹn hôm nay...</p>
          </TabsContent>

          <TabsContent value="upcoming">
            <p className="text-muted-foreground">Hiển thị lịch hẹn sắp tới...</p>
          </TabsContent>

          <TabsContent value="pending">
            <p className="text-muted-foreground">Hiển thị lịch hẹn chờ xác nhận...</p>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
