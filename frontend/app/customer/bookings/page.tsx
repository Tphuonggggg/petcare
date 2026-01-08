"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PawPrint, ArrowLeft, Plus, Calendar, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Xóa mockBookings, pastBookings

export default function CustomerBookingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("upcoming")
  const [bookings, setBookings] = useState<any[]>([])
  const [past, setPast] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      try {
        const userData = localStorage.getItem('user')
        if (!userData) return
        const user = JSON.parse(userData)
        const { apiGet } = await import('@/lib/api')
        const all = await apiGet('/bookings')
        let arr = Array.isArray(all) ? all : (all?.items || [])
        const my = arr.filter((b: any) => Number(b.customerId) === Number(user.customerId || user.id || user.CustomerId))
        const now = new Date()
        const upcoming = my.filter((b: any) => new Date(b.requestedDateTime || b.date) >= now)
        const pastList = my.filter((b: any) => new Date(b.requestedDateTime || b.date) < now)
        setBookings(upcoming)
        setPast(pastList)
      } catch (e) {
        // ignore
      }
    }
    load()
  }, [])

  const getStatusBadge = (status: string) => {
    const variants = {
      confirmed: { label: "Đã xác nhận", variant: "default" as const },
      pending: { label: "Chờ xác nhận", variant: "secondary" as const },
      completed: { label: "Hoàn thành", variant: "outline" as const },
      cancelled: { label: "Đã hủy", variant: "destructive" as const },
      canceled: { label: "Đã hủy", variant: "destructive" as const },
      rejected: { label: "Từ chối", variant: "destructive" as const },
      inprogress: { label: "Đang thực hiện", variant: "default" as const },
      processing: { label: "Đang xử lý", variant: "default" as const },
      new: { label: "Mới", variant: "secondary" as const },
    }
    const config = variants[(status || '').toLowerCase() as keyof typeof variants]
    if (!config) return <Badge variant="secondary">Không rõ</Badge>
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
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/customer/doctor-schedules")}>
              <Clock className="h-4 w-4 mr-2" />
              Xem lịch bác sĩ
            </Button>
            <Button onClick={() => router.push("/customer/bookings/create")}>
              <Plus className="h-4 w-4 mr-2" />
              Đặt lịch mới
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming">Sắp tới</TabsTrigger>
            <TabsTrigger value="past">Lịch sử</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.bookingId ?? booking.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl mb-1">{booking.serviceName ?? booking.title ?? booking.bookingType ?? '-'}</CardTitle>
                      <p className="text-muted-foreground">{booking.petName ?? booking.pet?.name ?? '-'}</p>
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
                          {(booking.requestedDateTime ? new Date(booking.requestedDateTime).toLocaleString() : (booking.date ? new Date(booking.date).toLocaleString() : '-'))}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Chi nhánh:</span> {booking.branchName ?? booking.branch?.name ?? booking.branchId ?? '-'}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Bác sĩ:</span> {booking.doctorName ?? booking.doctor ?? '-'}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Ghi chú:</span> {booking.notes ?? '-'}
                      </div>
                    </div>
                    <div className="flex items-end justify-end">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Giá dịch vụ</p>
                        <p className="text-2xl font-bold text-primary">{booking.price ? booking.price.toLocaleString() + 'đ' : '-'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 bg-transparent" onClick={() => router.push(`/customer/bookings/${booking.bookingId ?? booking.id}`)}>
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
              <Card key={booking.bookingId ?? booking.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl mb-1">{booking.serviceName ?? booking.title ?? booking.bookingType ?? '-'}</CardTitle>
                      <p className="text-muted-foreground">{booking.petName ?? booking.pet?.name ?? '-'}</p>
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
                          {(booking.requestedDateTime ? new Date(booking.requestedDateTime).toLocaleString() : (booking.date ? new Date(booking.date).toLocaleString() : '-'))}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Chi nhánh:</span> {booking.branchName ?? booking.branch?.name ?? booking.branchId ?? '-'}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Bác sĩ:</span> {booking.doctorName ?? '-'}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Ghi chú:</span> {booking.notes ?? '-'}
                      </div>
                    </div>
                    <div className="flex items-end justify-end">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Đã thanh toán</p>
                        <p className="text-2xl font-bold">{booking.price ? booking.price.toLocaleString() + 'đ' : '-'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 bg-transparent" onClick={() => router.push(`/customer/bookings/${booking.bookingId ?? booking.id}`)}>
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
