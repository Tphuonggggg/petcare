"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Clock, User, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { apiGet } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

interface DoctorScheduleItem {
  appointmentTime: string
  petName: string
  activity: string
}

interface Employee {
  employeeId: number
  fullName: string
  position?: {
    name: string
  }
  branch?: {
    name: string
  }
}

export default function DoctorSchedulesPage() {
  const router = useRouter()
  const [doctors, setDoctors] = useState<Employee[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<Employee[]>([])
  const [schedules, setSchedules] = useState<DoctorScheduleItem[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [loadingDoctors, setLoadingDoctors] = useState(true)
  const [error, setError] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Load danh sách bác sĩ
  useEffect(() => {
    async function loadDoctors() {
      try {
        setLoadingDoctors(true)
        const data = await apiGet("/employees")
        const employeeList = Array.isArray(data) ? data : data?.items || []
        // Filter bác sĩ theo positionID = 1 (Bác sĩ thú y)
        const docList = employeeList.filter(
          (emp: any) => emp.positionId === 1 || emp.position?.positionId === 1
        )
        setDoctors(docList)
        if (docList.length > 0) {
          setSelectedDoctor(docList[0].employeeId)
        }
      } catch (err) {
        setError("Không thể tải danh sách bác sĩ")
        console.error(err)
      } finally {
        setLoadingDoctors(false)
      }
    }

    loadDoctors()
  }, [])

  // Load lịch trình bác sĩ
  useEffect(() => {
    async function loadSchedule() {
      if (!selectedDoctor) return

      try {
        setLoading(true)
        setError("")
        
        // Keep date as-is without timezone conversion
        // selectedDate is already in YYYY-MM-DD format from input
        const isoDate = selectedDate
        
        console.log("Fetching schedule for:", {
          doctorId: selectedDoctor,
          selectedDate,
          isoDate,
          url: `/employees/${selectedDoctor}/schedule?date=${isoDate}`
        })
        
        const data = await apiGet(
          `/employees/${selectedDoctor}/schedule?date=${isoDate}`
        )
        
        console.log("Schedule response:", data)
        
        const scheduleList = Array.isArray(data) ? data : data?.items || []
        setSchedules(scheduleList)
      } catch (err) {
        setError("Không thể tải lịch trình bác sĩ")
        console.error("Error loading schedule:", err)
        setSchedules([])
      } finally {
        setLoading(false)
      }
    }

    loadSchedule()
  }, [selectedDoctor, selectedDate])

  // Handle search term change
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredDoctors([])
      setShowSuggestions(false)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = doctors.filter((doc) =>
      doc.fullName.toLowerCase().includes(term)
    )
    setFilteredDoctors(filtered)
    setShowSuggestions(true)
  }, [searchTerm, doctors])

  const handleSelectDoctor = (doctor: Employee) => {
    setSelectedDoctor(doctor.employeeId)
    setSearchTerm(doctor.fullName)
    setShowSuggestions(false)
  }

  const getActivityBadge = (activity: string) => {
    const badges: Record<string, { label: string; variant: string }> = {
      examination: { label: "Khám bệnh", variant: "default" },
      checkup: { label: "Kiểm tra", variant: "default" },
      vaccination: { label: "Tiêm vaccine", variant: "secondary" },
      vaccine: { label: "Tiêm vaccine", variant: "secondary" },
    }
    const key = activity?.toLowerCase().replace(/\s+/g, "")
    return badges[key] || { label: activity || "Hoạt động", variant: "outline" }
  }

  const formatTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return "N/A"
    try {
      return new Date(dateTimeStr).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Ho_Chi_Minh"
      })
    } catch {
      return dateTimeStr
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Calendar className="h-5 w-5 text-primary" />
          <h1 className="font-bold text-lg">Lịch trình bác sĩ</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Tìm kiếm bác sĩ */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-base">Tìm bác sĩ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative">
                  <Input
                    placeholder="Nhập tên bác sĩ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => searchTerm && setShowSuggestions(true)}
                    className="w-full"
                  />
                  {showSuggestions && (
                    <div className="absolute top-full left-0 right-0 mt-1 border rounded-lg bg-white shadow-lg z-10 max-h-64 overflow-y-auto">
                      {loadingDoctors ? (
                        <div className="p-3">
                          <Skeleton className="h-10" />
                          <Skeleton className="h-10 mt-2" />
                        </div>
                      ) : filteredDoctors.length === 0 ? (
                        <div className="p-3 text-sm text-muted-foreground">
                          {searchTerm ? "Không tìm thấy bác sĩ" : "Bắt đầu nhập tên"}
                        </div>
                      ) : (
                        filteredDoctors.map((doctor) => (
                          <Button
                            key={doctor.employeeId}
                            variant="ghost"
                            className="w-full justify-start rounded-none border-b last:border-b-0 h-auto py-3 px-3 hover:bg-blue-50"
                            onClick={() => handleSelectDoctor(doctor)}
                          >
                            <User className="h-4 w-4 mr-2" />
                            <span className="text-left">{doctor.fullName}</span>
                          </Button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {selectedDoctor && doctors.find((d) => d.employeeId === selectedDoctor) && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200 space-y-2">
                    <p className="text-xs text-muted-foreground mb-1">Đã chọn</p>
                    <div>
                      <p className="font-medium text-sm">
                        {doctors.find((d) => d.employeeId === selectedDoctor)?.fullName}
                      </p>
                      {doctors.find((d) => d.employeeId === selectedDoctor)?.branch?.name && (
                        <p className="text-xs text-blue-700 mt-1 flex items-center gap-1">
                          📍 {doctors.find((d) => d.employeeId === selectedDoctor)?.branch?.name}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-8 text-xs"
                      onClick={() => {
                        setSelectedDoctor(null)
                        setSearchTerm("")
                        setShowSuggestions(false)
                      }}
                    >
                      Chọn bác sĩ khác
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Date picker */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Chọn ngày</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={() =>
                      setSelectedDate(new Date().toISOString().split("T")[0])
                    }
                  >
                    Hôm nay
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Schedule list */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Lịch trình</CardTitle>
                {selectedDoctor && doctors.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {doctors.find((d) => d.employeeId === selectedDoctor)?.fullName}
                    {" - "}
                    {new Date(selectedDate).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 mb-4">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {loading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-20" />
                    <Skeleton className="h-20" />
                    <Skeleton className="h-20" />
                  </div>
                ) : schedules.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-muted-foreground">
                      Không có lịch trình vào ngày này
                    </p>
                    {selectedDoctor && (
                      <Button
                        variant="link"
                        size="sm"
                        className="mt-2"
                        onClick={async () => {
                          try {
                            const data = await apiGet(`/employees/${selectedDoctor}/schedule-all`)
                            console.log("Debug info:", data)
                            alert("Kiểm tra Console (F12) để xem dữ liệu debug")
                          } catch (err) {
                            console.error(err)
                          }
                        }}
                      >
                        Debug: Xem tất cả lịch trình
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {schedules.map((schedule, idx) => (
                      <div
                        key={idx}
                        className="border rounded-lg p-4 flex items-start gap-4 hover:bg-muted/50 transition"
                      >
                        <div className="flex items-center gap-2 min-w-fit">
                          <Clock className="h-4 w-4 text-primary" />
                          <span className="font-semibold text-sm">
                            {formatTime(schedule.appointmentTime)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{schedule.petName}</p>
                          <p className="text-xs text-muted-foreground">
                            Thú cưng cần khám
                          </p>
                        </div>
                        <Badge variant={getActivityBadge(schedule.activity).variant as any}>
                          {getActivityBadge(schedule.activity).label}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Info card */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <p className="text-sm text-blue-900">
                  💡 Bạn có thể xem lịch trình của tất cả bác sĩ để chọn thời gian hợp lý cho lịch hẹn của mình.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
