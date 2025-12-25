"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, PawPrint, ShoppingCart, User, Heart } from "lucide-react"

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
        const [allPetsRes, allBookingsRes] = await Promise.all([apiGet(`/pets`), apiGet(`/bookings`)])
        if (!mounted) return
        const myPets = Array.isArray(allPetsRes) ? allPetsRes.filter((p: any) => p.customerId === user.id || p.customerId === user.customerId || p.customerId === user.CustomerId) : []
        const myBookings = Array.isArray(allBookingsRes) ? allBookingsRes.filter((b: any) => b.customerId === user.id || b.customerId === user.customerId || b.customerId === user.CustomerId) : []
        setPets(myPets.length ? myPets : [])
        setBookings(myBookings.length ? myBookings : [])
      } catch (e) {
        // ignore, keep UI defaults
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

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                <div className="flex justify-between items-start p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Khám sức khỏe định kỳ</p>
                    <p className="text-sm text-muted-foreground">Max - Chó Golden Retriever</p>
                    <p className="text-sm text-muted-foreground mt-1">15/01/2025 - 10:00 AM</p>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Đã xác nhận</span>
                </div>
                <div className="flex justify-between items-start p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Spa & Grooming</p>
                    <p className="text-sm text-muted-foreground">Luna - Mèo Ba Tư</p>
                    <p className="text-sm text-muted-foreground mt-1">18/01/2025 - 2:00 PM</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Đã đặt</span>
                </div>
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
                {(pets.length ? pets : [
                  { id: 1, name: 'Max', species: 'Chó', breed: 'Golden Retriever', age: '3 tuổi' },
                  { id: 2, name: 'Luna', species: 'Mèo', breed: 'Ba Tư', age: '2 tuổi' },
                ]).map((pet) => (
                  <div key={pet.petId ?? pet.id} className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <PawPrint className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{pet.name ?? pet.petName ?? 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground">{(pet.species ?? pet.type ?? '')} {(pet.breed ?? pet.breedName ?? '')}</p>
                    </div>
                  </div>
                ))}
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
