"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PawPrint, ArrowLeft, Plus, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const mockBookings = [
  {
    id: 1,
    service: "Khám sức khỏe định kỳ",
    pet: "Max - Chó Golden Retriever",
    date: "15/01/2025",
    time: "10:00 AM",
    branch: "PetCare Quận 1",
    doctor: "BS. Nguyễn Văn A",
    status: "confirmed",
    price: 200000,
  },
  {
    id: 2,
    service: "Spa & Grooming",
    pet: "Luna - Mèo Ba Tư",
    date: "18/01/2025",
    time: "2:00 PM",
    branch: "PetCare Quận 3",
    doctor: "NV. Trần Thị B",
    status: "pending",
    price: 150000,
  },
]

const pastBookings = [
  {
    id: 3,
    service: "Tiêm phòng dại",
    pet: "Max - Chó Golden Retriever",
    date: "10/12/2024",
    time: "3:00 PM",
    branch: "PetCare Quận 1",
    doctor: "BS. Lê Văn C",
    status: "completed",
    price: 100000,
  },
]

export default function CustomerBookingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("upcoming")
  const [bookings, setBookings] = useState<any[]>(mockBookings)
  const [past, setPast] = useState<any[]>(pastBookings)

  useEffect(() => {
    async function load() {
      try {
        const userData = localStorage.getItem('user')
        if (!userData) return
        const user = JSON.parse(userData)
        const { apiGet } = await import('@/lib/api')
        const all = await apiGet('/bookings')
        if (Array.isArray(all)) {
          const my = all.filter((b: any) => b.customerId === user.id || b.customerId === user.customerId || b.customerId === user.CustomerId)
          const upcoming = my.filter((b: any) => (new Date(b.requestedDateTime)) >= new Date())
          const pastList = my.filter((b: any) => (new Date(b.requestedDateTime)) < new Date())
          setBookings(upcoming.length ? upcoming : mockBookings)
          setPast(pastList.length ? pastList : pastBookings)
        }
      } catch (e) {
        // ignore, keep mocks
      }
    }
    load()
  }, [])

  const getStatusBadge = (status: string) => {
    const variants = {
      confirmed: { label: "Đã xác nhận", variant: "default" as const },
      pending: { label: "Chờ xác nhận", variant: "secondary" as const },
      completed: { label: "Hoàn thành", variant: "outline" as const },
    }
    const config = variants[status as keyof typeof variants]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/customer")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <PawPrint className="h-6 w-6 text-primary" />
              <span className="font-bold">PetCare</span>
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
            <h1 className="text-3xl font-bold mb-2">Lịch hẹn của tôi</h1>
            <p className="text-muted-foreground">Quản lý và theo dõi lịch hẹn</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Đặt lịch mới
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming">Sắp tới</TabsTrigger>
            <TabsTrigger value="past">Lịch sử</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl mb-1">{booking.service}</CardTitle>
                      <p className="text-muted-foreground">{booking.pet}</p>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {booking.date} - {booking.time}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Chi nhánh:</span> {booking.branch}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Bác sĩ:</span> {booking.doctor}
                      </div>
                    </div>
                    <div className="flex items-end justify-end">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Giá dịch vụ</p>
                        <p className="text-2xl font-bold text-primary">{booking.price.toLocaleString()}đ</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 bg-transparent">
                      Xem chi tiết
                    </Button>
                    <Button variant="outline" className="flex-1 bg-transparent">
                      Hủy lịch
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {past.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl mb-1">{booking.service}</CardTitle>
                      <p className="text-muted-foreground">{booking.pet}</p>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {booking.date} - {booking.time}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Chi nhánh:</span> {booking.branch}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Bác sĩ:</span> {booking.doctor}
                      </div>
                    </div>
                    <div className="flex items-end justify-end">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Đã thanh toán</p>
                        <p className="text-2xl font-bold">{booking.price.toLocaleString()}đ</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 bg-transparent">
                      Xem chi tiết
                    </Button>
                    <Button variant="outline" className="flex-1 bg-transparent">
                      Đặt lại
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
