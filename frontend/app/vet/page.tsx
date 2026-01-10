"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { PawPrint, Calendar, User, Clock, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { apiGet } from "@/lib/api"

interface BookingDetail {
  bookingId: number
  bookingTime: string
  customerName: string
  petName: string
  petType: string
  serviceType: string
  status: string
  notes?: string
}

interface Employee {
  employeeId: number
  branchId: number
  fullName: string
}

export default function VetPage() {
  const router = useRouter()
  const [branchName, setBranchName] = useState<string | null>(null)
  const [branchId, setBranchId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<BookingDetail[]>([])
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20

  const loadBookings = async (brId: number) => {
    try {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0]
      const data = await apiGet(`/receptionistdashboard/today-bookings?branchId=${brId}&date=${today}`)
      setBookings(data || [])
    } catch (error) {
      console.error("Error loading bookings:", error)
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const load = async () => {
      try {
        // Get employee info and branchId
        const employeeId = localStorage.getItem('employeeId')
        let userBranchId = localStorage.getItem('branchId')
        
        console.log('[VET PAGE] Initial load - employeeId:', employeeId, 'branchId:', userBranchId)
        
        // Always load employee info if we have employeeId
        if (employeeId) {
          try {
            const empData = await apiGet(`/employees/${employeeId}`)
            console.log('[VET PAGE] Employee data:', empData)
            setEmployee(empData)
            
            // If no branchId in localStorage, get from employee
            if (!userBranchId && empData.branchId) {
              userBranchId = empData.branchId.toString()
              localStorage.setItem('branchId', userBranchId)
              console.log('[VET PAGE] Set branchId from employee:', userBranchId)
            }
          } catch (error) {
            console.error("Error loading employee info:", error)
          }
        }

        if (userBranchId) {
          const brIdNum = parseInt(userBranchId)
          setBranchId(brIdNum)
          console.log('[VET PAGE] Using branchId:', brIdNum)
          
          // Get branch name
          try {
            const branchData = await apiGet(`/branches/${userBranchId}`)
            console.log('[VET PAGE] Branch data:', branchData)
            // Try different field names
            const name = branchData.branchName || branchData.name || branchData.BranchName || 'Chi nhánh #' + userBranchId
            console.log('[VET PAGE] Branch name:', name)
            setBranchName(name)
          } catch (error) {
            console.error("Error loading branch:", error)
          }
          
          await loadBookings(brIdNum)
        } else {
          console.warn('[VET PAGE] No branchId found!')
          setLoading(false)
        }
      } catch (error) {
        console.error("Error in load:", error)
        setLoading(false)
      }
    }
    load()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Chờ xử lý</Badge>
      case 'confirmed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Đã check-in</Badge>
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Hoàn thành</Badge>
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Đã hủy</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatTime = (dateTime: string) => {
    try {
      const date = new Date(dateTime)
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return dateTime
    }
  }

  const filteredBookings = bookings.filter(booking => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      booking.customerName?.toLowerCase().includes(query) ||
      booking.petName?.toLowerCase().includes(query) ||
      booking.petType?.toLowerCase().includes(query) ||
      booking.serviceType?.toLowerCase().includes(query)
    )
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredBookings.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedBookings = filteredBookings.slice(startIndex, endIndex)

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  if (!branchId) {
    console.log('[VET PAGE RENDER] No branchId, showing error')
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <p>Không tìm thấy thông tin chi nhánh. Vui lòng đăng nhập lại.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  console.log('[VET PAGE RENDER] Rendering with:', { branchName, employee: employee?.fullName, bookingsCount: bookings.length })

  return (
    <div className="bg-muted/30 min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Lịch hôm nay — {branchName || 'Đang tải...'}</h1>
          <p className="text-muted-foreground">Các cuộc hẹn đã đặt cho hôm nay. Nhấn "Xem chi tiết" để mở hồ sơ và viết bệnh án.</p>
          {employee && employee.fullName && (
            <p className="text-sm text-muted-foreground mt-1">Bác sĩ: {employee.fullName}</p>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Cuộc hẹn hôm nay ({filteredBookings.length})
            </CardTitle>
            <div className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tên khách hàng, thú cưng, dịch vụ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-2 text-muted-foreground">Đang tải...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-8">
                <PawPrint className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-muted-foreground">
                  {searchQuery ? 'Không tìm thấy cuộc hẹn nào.' : 'Không có cuộc hẹn hôm nay.'}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {paginatedBookings.map((booking) => (
                    <div 
                      key={booking.bookingId} 
                      className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold">{formatTime(booking.bookingTime)}</span>
                            {getStatusBadge(booking.status)}
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{booking.customerName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <PawPrint className="h-4 w-4" />
                              <span>{booking.petName} ({booking.petType})</span>
                            </div>
                          </div>
                          
                          {booking.notes && (
                            <div className="text-sm text-muted-foreground">
                              <span className="font-medium">Ghi chú:</span> {booking.notes}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          {booking.serviceType?.toLowerCase().includes('vaccination') || 
                           booking.serviceType?.toLowerCase().includes('tiêm phòng') ? (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => router.push(`/vet/vaccination?bookingId=${booking.bookingId}`)}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                Tiêm phòng
                              </Button>
                              <Button 
                                size="sm"
                                variant="outline"
                                onClick={() => router.push(`/vet/bookings/${booking.bookingId}`)}
                              >
                                Chi tiết
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => router.push(`/vet/bookings/${booking.bookingId}`)}
                              >
                                Viết bệnh án
                              </Button>
                              <Button 
                                size="sm"
                                variant="outline"
                                onClick={() => router.push(`/vet/bookings/${booking.bookingId}`)}
                              >
                                Chi tiết
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredBookings.length)} / {filteredBookings.length}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Trước
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum: number
                          if (totalPages <= 5) {
                            pageNum = i + 1
                          } else if (currentPage <= 3) {
                            pageNum = i + 1
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i
                          } else {
                            pageNum = currentPage - 2 + i
                          }
                          
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className="w-9"
                            >
                              {pageNum}
                            </Button>
                          )
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Sau
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
