"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Clock, User, PawPrint } from "lucide-react"
import { apiGet, apiPost } from "@/lib/api"

interface WaitingCustomer {
  bookingId: number
  petId: number
  customerId: number
  customerName: string
  petName: string
  bookingTime: string
  serviceType: string
  waitingDuration: number
}

export default function CheckInPage() {
  const router = useRouter()
  const [waitingCustomers, setWaitingCustomers] = useState<WaitingCustomer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWaitingCustomers()
  }, [])

  const loadWaitingCustomers = async () => {
    try {
      setLoading(true)
      const branchId = localStorage.getItem('branchId') || '1'
      const data = await apiGet(`/ReceptionistDashboard/waiting-customers?branchId=${branchId}`)
      setWaitingCustomers(data || [])
    } catch (error) {
      console.error("Error loading waiting customers:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = async (customer: WaitingCustomer) => {
    try {
      const doctorId = parseInt(localStorage.getItem('employeeId') || '1')
      const petId = customer.petId
      const employeeId = doctorId
      
      console.log('Check-in data:', { petId, doctorId, customer })
      
      // Tạo hồ sơ check-up
      await apiPost(`/CheckHealths`, {
        petId: petId,
        doctorId: doctorId,
        checkDate: new Date().toISOString().split('T')[0],
        symptoms: '',
      })
      
      // Cập nhật booking status - dùng check-in endpoint
      await apiPost(`/ReceptionistDashboard/check-in/${customer.bookingId}`, {
        employeeId: employeeId
      })
      
      alert(`Đã check-in khách hàng ${customer.customerName}`)
      loadWaitingCustomers()
    } catch (error) {
      console.error("Error checking in:", error)
      alert("Lỗi khi check-in")
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/reception")}
            className="bg-transparent"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <h1 className="text-2xl font-bold">Quản lý Check-in</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <Card>
            <CardContent className="py-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Đang tải danh sách chờ check-in...</p>
            </CardContent>
          </Card>
        ) : waitingCustomers.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">Không có khách hàng chờ check-in</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Khách hàng chờ check-in ({waitingCustomers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {waitingCustomers.map((customer) => (
                  <div
                    key={customer.bookingId}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{customer.customerName}</p>
                        <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded">
                          {customer.waitingDuration} phút
                        </span>
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <PawPrint className="h-3 w-3" />
                          {customer.petName}
                        </span>
                        <span>{customer.serviceType}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleCheckIn(customer)}
                      className="gap-2"
                    >
                      <Clock className="h-4 w-4" />
                      Check-in
                    </Button>
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
