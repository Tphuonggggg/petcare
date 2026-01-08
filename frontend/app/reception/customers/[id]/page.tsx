"use client"

import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Phone, Mail, MapPin, PawPrint, Calendar } from "lucide-react"
import { apiGet } from "@/lib/api"

interface Pet {
  petId: number
  customerId: number
  name: string
  species: string
  breed?: string
  birthDate?: string
  gender?: string
  status?: string
}

interface CustomerDetail {
  customerId: number
  fullName: string
  phone: string
  email?: string
  cccd?: string
  birthDate?: string
  memberSince?: string
  pointsBalance?: number
  totalYearlySpend?: number
  gender?: string
}

interface Booking {
  bookingId: number
  bookingTime: string
  serviceType: string
  status: string
  petName: string
  petType: string
  customerName: string
  notes?: string
}

export default function CustomerDetailPage() {
  const router = useRouter()
  const params = useParams()
  const customerId = params.id as string

  const [customer, setCustomer] = useState<CustomerDetail | null>(null)
  const [pets, setPets] = useState<Pet[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCustomerDetail()
  }, [customerId])

  const loadCustomerDetail = async () => {
    try {
      setLoading(true)
      const data = await apiGet(`/customers/${customerId}`)
      setCustomer(data)

      // Load all pets and filter by customer
      try {
        const petsResponse = await apiGet("/pets?page=1&pageSize=1000")
        const customerPets = petsResponse.items.filter(
          (p: Pet) => p.customerId === data.customerId
        )
        setPets(customerPets)
      } catch (error) {
        console.error("Error loading pets:", error)
      }

      // Load all bookings and filter by customer name
      try {
        const allBookings = await apiGet("/receptionistdashboard/today-bookings")
        const customerBookings = allBookings.filter(
          (b: Booking) => b.customerName === data.fullName
        )
        setBookings(customerBookings)
      } catch (error) {
        console.error("Error loading bookings:", error)
      }
    } catch (error) {
      console.error("Error loading customer:", error)
      alert("Lỗi khi tải thông tin khách hàng")
      router.push("/reception/customers/search")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải thông tin...</p>
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">Không tìm thấy khách hàng</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/reception/customers/search")}
            className="bg-transparent"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <h1 className="text-2xl font-bold">Chi tiết khách hàng</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Thông tin cơ bản */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{customer.fullName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Số điện thoại</p>
                <div className="flex items-center gap-2 mt-1">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{customer.phone}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{customer.email || "N/A"}</p>
                </div>
              </div>
            </div>

            {customer.address && (
              <div>
                <p className="text-sm text-muted-foreground">Địa chỉ</p>
                <div className="flex items-start gap-2 mt-1">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <p className="font-medium">{customer.address}</p>
                </div>
              </div>
            )}

            {customer.cccd && (
              <div>
                <p className="text-sm text-muted-foreground">CCCD/CMND</p>
                <p className="font-medium">{customer.cccd}</p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Điểm tích lũy</p>
                <p className="text-lg font-bold mt-1">{customer.pointsBalance || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Chi tiêu năm</p>
                <p className="text-lg font-bold mt-1">
                  {customer.totalYearlySpend?.toLocaleString("vi-VN")} ₫
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Thành viên từ</p>
                <p className="text-lg font-bold mt-1">
                  {customer.memberSince ? new Date(customer.memberSince).toLocaleDateString("vi-VN") : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Thú cưng */}
        {pets && pets.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Thú cưng ({pets.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pets.map((pet) => (
                  <div
                    key={pet.petId}
                    className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/reception/pets/${pet.petId}`)}
                  >
                    <div className="flex-1">
                      <p className="font-medium">{pet.name}</p>
                      <p className="text-sm text-muted-foreground">{pet.species} {pet.breed ? `- ${pet.breed}` : ""}</p>
                      {pet.birthDate && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Sinh: {new Date(pet.birthDate).toLocaleDateString("vi-VN")}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {pet.gender && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {pet.gender === "M" ? "Đực" : pet.gender === "F" ? "Cái" : "Không rõ"}
                        </span>
                      )}
                      {pet.status && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          pet.status === "Healthy" ? "bg-green-100 text-green-800" :
                          pet.status === "Sick" ? "bg-red-100 text-red-800" :
                          pet.status === "Lost" ? "bg-gray-100 text-gray-800" :
                          "bg-yellow-100 text-yellow-800"
                        }`}>
                          {pet.status === "Healthy" ? "Khỏe" :
                           pet.status === "Sick" ? "Ốm" :
                           pet.status === "Lost" ? "Mất tích" :
                           pet.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lịch hẹn */}
        {bookings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Lịch hẹn hôm nay ({bookings.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <div
                    key={booking.bookingId}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{booking.serviceType}</p>
                      <div className="flex gap-3 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(booking.bookingTime).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <PawPrint className="h-3 w-3" />
                          {booking.petName}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          booking.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : booking.status === "Pending"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {booking.status}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/reception/appointments/${booking.bookingId}`)}
                      >
                        Chi tiết
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
