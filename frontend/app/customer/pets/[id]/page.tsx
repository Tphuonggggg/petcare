"use client"

import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PawPrint, ArrowLeft, Edit2, Stethoscope, Syringe, Plus, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { apiGet } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface Pet {
  petId?: number
  id?: number
  customerId: number
  name: string
  species: string
  breed?: string
  birthDate?: string
  gender?: string
  status?: string
}

interface Booking {
  bookingId?: number
  id?: number
  customerId: number
  customerName?: string
  petId: number
  petName?: string
  bookingType?: string
  requestedDateTime: string
  status?: string
  notes?: string
  branchId?: number
  branchName?: string
  employeeName?: string
}

export default function PetDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const petId = params.id as string

  const [pet, setPet] = useState<Pet | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    loadData()
  }, [petId])

  const loadData = async () => {
    try {
      setLoading(true)

      // Kiểm tra quyền truy cập
      const userData = localStorage.getItem("user")
      if (!userData) {
        router.push("/login")
        return
      }

      const currentUser = JSON.parse(userData)
      const customerId = currentUser.id || currentUser.customerId || currentUser.CustomerId

      // Lấy pet của user hiện tại
      const allPets = await apiGet(`/pets?customerId=${customerId}`)
      let found: Pet | null = null

      if (Array.isArray(allPets)) {
        found = allPets.find(
          (p: Pet) => p.petId === Number(petId) || p.id === Number(petId)
        )
      } else if (allPets && typeof allPets === 'object' && allPets.items && Array.isArray(allPets.items)) {
        found = allPets.items.find(
          (p: Pet) => p.petId === Number(petId) || p.id === Number(petId)
        )
      }

      if (found) {
        setPet(found)
        setAuthorized(true)

        // Load bookings (khám, tiêm) for this pet
        try {
          const allBookings = await apiGet(`/bookings`)
          console.log("All bookings from API:", allBookings)
          
          let filteredBookings: Booking[] = []
          
          if (Array.isArray(allBookings)) {
            // Filter bookings by petId and customer
            filteredBookings = allBookings.filter((b: Booking) => 
              b.petId === (found.petId || found.id)
            )
          } else if (allBookings && allBookings.items && Array.isArray(allBookings.items)) {
            // If paginated response
            filteredBookings = allBookings.items.filter((b: Booking) => 
              b.petId === (found.petId || found.id)
            )
          }
          
          console.log("Filtered bookings for pet:", filteredBookings)
          setBookings(filteredBookings)
        } catch (e) {
          console.warn("Could not load bookings:", e)
          setBookings([])
        }
      } else {
        setAuthorized(false)
      }
    } catch (error: any) {
      console.error("Error loading pet:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải thông tin thú cưng",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return "Không rõ"
    try {
      const birth = new Date(birthDate)
      const today = new Date()
      let age = today.getFullYear() - birth.getFullYear()
      const monthDiff = today.getMonth() - birth.getMonth()

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--
      }

      return age >= 0 ? `${age} tuổi` : "Không rõ"
    } catch {
      return "Không rõ"
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "---"
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", { timeZone: 'Asia/Ho_Chi_Minh' })
    } catch {
      return "---"
    }
  }

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



  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <PawPrint className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-bounce" />
          <p className="text-muted-foreground">Đang tải thông tin...</p>
        </div>
      </div>
    )
  }

  if (!authorized || !pet) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <p className="text-muted-foreground">
              {authorized ? "Không tìm thấy thú cưng" : "Bạn không có quyền xem thú cưng này"}
            </p>
            <Button className="mt-4" onClick={() => router.push("/customer/pets")}>
              Về danh sách thú cưng
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push(`/customer/pets/${pet.petId || pet.id}/edit`)}
        >
          <Edit2 className="h-4 w-4 mr-2" />
          Chỉnh sửa
        </Button>
      </div>

      {/* Pet Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-6">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <PawPrint className="h-12 w-12 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-4">{pet.name}</h1>
              <p className="text-lg text-muted-foreground">
                {pet.species}
                {pet.breed && ` - ${pet.breed}`}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Tuổi</p>
              <p className="text-lg font-semibold">{calculateAge(pet.birthDate)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Ngày sinh</p>
              <p className="text-lg font-semibold">{formatDate(pet.birthDate)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Giới tính</p>
              <p className="text-lg font-semibold">{pet.gender || "---"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="history" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="history">Lịch hẹn</TabsTrigger>
        </TabsList>

        {/* All Bookings Tab */}
        <TabsContent value="history" className="space-y-4">
          {bookings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">Chưa có lịch hẹn</p>
                <Button className="mt-4" onClick={() => router.push("/customer/bookings/create")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Đặt lịch mới
                </Button>
              </CardContent>
            </Card>
          ) : (
            bookings.map((booking) => (
              <Card key={booking.bookingId ?? booking.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl mb-1">
                        {booking.bookingType ?? "Dịch vụ khám"}
                      </CardTitle>
                      <p className="text-muted-foreground">{booking.petName ?? pet?.name}</p>
                    </div>
                    {getStatusBadge(booking.status || '')}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {booking.requestedDateTime ? new Date(booking.requestedDateTime).toLocaleString("vi-VN") : '---'}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Chi nhánh:</span> {booking.branchName ?? booking.branchId ?? '---'}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Bác sĩ:</span> {booking.employeeName ?? '---'}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Ghi chú:</span> {booking.notes ?? '---'}
                      </div>
                    </div>
                    <div className="flex items-end justify-end">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Booking ID</p>
                        <p className="text-2xl font-bold text-primary">{booking.bookingId ?? booking.id}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 bg-transparent" 
                      onClick={() => router.push(`/customer/bookings/${booking.bookingId ?? booking.id}`)}
                    >
                      Xem chi tiết
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
