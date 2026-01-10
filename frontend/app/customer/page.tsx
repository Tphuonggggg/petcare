"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, PawPrint, ShoppingCart, User, Heart, Clock } from "lucide-react"

export default function CustomerDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [pets, setPets] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }
    const parsed = JSON.parse(userData)
    setUser(parsed)
  }, [router])

  useEffect(() => {
    if (!user) return
    let mounted = true
    async function load() {
      try {
        const { apiGet } = await import("@/lib/api")
        const userId = Number(user.customerId || user.id || user.CustomerId || user.accountId)
        
        console.log('Raw user object:', user)
        console.log('Extracted userId:', userId)
        
        if (isNaN(userId)) {
          console.error('Invalid userId:', userId)
          return
        }
        
        const [allPetsRes, bookingsRes] = await Promise.all([
          apiGet(`/pets?customerId=${userId}`),
          apiGet(`/bookings/customer/${userId}`)
        ])
        
        if (!mounted) return
        
        console.log('userId:', userId)
        console.log('bookingsRes:', bookingsRes)
        console.log('allPetsRes:', allPetsRes)
        
        const petsArr = Array.isArray(allPetsRes?.items) ? allPetsRes.items : (Array.isArray(allPetsRes) ? allPetsRes : [])
        const bookingsArr = Array.isArray(bookingsRes?.items) ? bookingsRes.items : (Array.isArray(bookingsRes) ? bookingsRes : [])
        
        // Filter upcoming bookings only
        const now = new Date()
        const upcomingBookings = bookingsArr.filter((b: any) => new Date(b.requestedDateTime) >= now)
        
        console.log('upcomingBookings:', upcomingBookings)
        console.log('allPetsRes:', petsArr)
        
        setPets(petsArr.length ? petsArr : [])
        setBookings(upcomingBookings.length ? upcomingBookings : [])
      } catch (e) {
        console.error('Error loading data:', e)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [user])

  if (!user) return null

  const quickActions = [
    {
      title: "Đặt lịch hẹn",
      description: "Đặt lịch khám bệnh, spa cho thú cưng",
      icon: Calendar,
      href: "/customer/bookings",
      color: "text-blue-600",
    },
    {
      title: "Lịch trình bác sĩ",
      description: "Xem lịch làm việc của bác sĩ",
      icon: Clock,
      href: "/customer/doctor-schedules",
      color: "text-cyan-600",
    },
    {
      title: "Thú cưng của tôi",
      description: "Quản lý thông tin thú cưng",
      icon: PawPrint,
      href: "/customer/pets",
      color: "text-green-600",
    },
    {
      title: "Mua sắm",
      description: "Sản phẩm và phụ kiện",
      icon: ShoppingCart,
      href: "/customer/shop",
      color: "text-purple-600",
    },
    {
      title: "Hồ sơ của tôi",
      description: "Thông tin cá nhân và ưu đãi",
      icon: User,
      href: "/customer/profile",
      color: "text-orange-600",
    },
  ]

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PawPrint className="h-6 w-6 text-primary" />
            <span className="font-bold">PetCare</span>
          </div>
          <Button variant="outline" onClick={() => { import('@/lib/auth').then(m => m.logout('/')) }}>
            Đăng xuất
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Xin chào, {user.name || user.email}!</h1>
          <p className="text-muted-foreground">Chào mừng bạn đến với PetCare</p>
        </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Card
                key={action.title}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push(action.href)}
              >
                <CardHeader>
                  <Icon className={`h-8 w-8 ${action.color} mb-2`} />
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Lịch hẹn sắp tới
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bookings.length === 0 ? (
                  <div className="text-center text-muted-foreground">Không có lịch hẹn nào.</div>
                ) : (
                  bookings.map((booking) => (
                    <div
                      key={booking.bookingId ?? booking.id}
                      className="flex justify-between items-start p-4 bg-muted rounded-lg cursor-pointer hover:bg-blue-50"
                      onClick={() => router.push(`/customer/bookings/${booking.bookingId ?? booking.id}`)}
                    >
                      <div>
                        <p className="font-medium">{booking.title ?? booking.serviceName ?? booking.bookingType ?? 'Lịch hẹn'}</p>
                        <p className="text-sm text-muted-foreground">{booking.petName ?? booking.pet?.name ?? ''} {booking.pet?.species ?? ''} {booking.pet?.breed ?? ''}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Ngày đặt: {booking.requestedDateTime ? new Date(booking.requestedDateTime).toLocaleString('vi-VN') : (booking.date ? new Date(booking.date).toLocaleString('vi-VN') : '')}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Loại lịch: {booking.bookingType ?? '-'}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${booking.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>{booking.status ?? 'Đã xác nhận'}</span>
                    </div>
                  ))
                )}
              </div>
              <Button
                className="w-full mt-4 bg-transparent"
                variant="outline"
                onClick={() => router.push("/customer/bookings")}
              >
                Xem tất cả lịch hẹn
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Thú cưng của tôi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pets.length === 0 ? (
                  <div className="text-center text-muted-foreground">Không có thú cưng nào.</div>
                ) : (
                  pets.map((pet) => (
                    <div
                      key={pet.petId ?? pet.id}
                      className="flex items-center gap-4 p-4 bg-muted rounded-lg cursor-pointer hover:bg-green-50"
                      onClick={() => router.push(`/customer/pets/${pet.petId ?? pet.id}`)}
                    >
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <PawPrint className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{pet.name ?? pet.petName ?? 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground">{(pet.species ?? pet.type ?? '')} {(pet.breed ?? pet.breedName ?? '')}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <Button
                className="w-full mt-4 bg-transparent"
                variant="outline"
                onClick={() => router.push("/customer/pets")}
              >
                Quản lý thú cưng
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
