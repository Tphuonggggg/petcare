"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Syringe, Calendar, User, PawPrint, AlertCircle } from "lucide-react"
import { apiGet, apiPost } from "@/lib/api"

interface BookingDetail {
  bookingId: number
  branchId?: number
  petId?: number
  doctorId?: number
  bookingTime: string
  customerName: string
  customerPhone: string
  customerEmail: string
  petName: string
  petType: string
  branchName: string
  doctorName: string
  serviceType: string
  status: string
  notes?: string
}

interface Vaccine {
  vaccineId: number
  type: string
  description: string
  standardDose: number
}

interface VaccineRecord {
  vaccineId: number
  vaccine: Vaccine
  dose: number
  nextDueDate: string
}

export default function VaccinationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("bookingId")

  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadingVaccines, setLoadingVaccines] = useState(false)
  const [vaccines, setVaccines] = useState<Vaccine[]>([])
  const [vaccineRecords, setVaccineRecords] = useState<VaccineRecord[]>([])

  // Form fields
  const [selectedVaccine, setSelectedVaccine] = useState<string>("")
  const [dose, setDose] = useState<string>("")
  const [administeredDate, setAdministeredDate] = useState<string>(new Date().toLocaleDateString('en-CA'))
  const [nextDueDate, setNextDueDate] = useState<string>("")
  const [records, setRecords] = useState<Array<{
    vaccineId: number
    vaccine: string
    dose: string
    administeredDate: string
    nextDueDate: string
  }>>([])

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)

        // Load booking detail
        if (bookingId) {
          try {
            const bookingData = await apiGet(`/bookings/detail/${bookingId}`)
            setBooking(bookingData)
          } catch (error) {
            console.error("Error loading booking:", error)
          }
        }

        // Load all vaccines
        try {
          setLoadingVaccines(true)
          const response = await apiGet("/vaccines")
          console.log("Vaccines response:", response)
          
          let vaccinesData: Vaccine[] = []
          
          // Handle PaginatedResult format
          if (response?.items && Array.isArray(response.items)) {
            vaccinesData = response.items.map((v: any) => ({
              vaccineId: v.vaccineId || v.VaccineId,
              type: v.type || v.Type,
              description: v.description || v.Description,
              standardDose: v.standardDose || v.StandardDose
            }))
          } 
          // Handle direct array format
          else if (Array.isArray(response)) {
            vaccinesData = response.map((v: any) => ({
              vaccineId: v.vaccineId || v.VaccineId,
              type: v.type || v.Type,
              description: v.description || v.Description,
              standardDose: v.standardDose || v.StandardDose
            }))
          }
          
          console.log("Processed vaccines:", vaccinesData)
          setVaccines(vaccinesData)
        } catch (error) {
          console.error("Error loading vaccines:", error)
          setVaccines([])
        } finally {
          setLoadingVaccines(false)
        }

        // Load vaccine records for pet
        if (bookingId) {
          try {
            const bookingData = await apiGet(`/bookings/detail/${bookingId}`)
            if (bookingData?.petId) {
              const recordsData = await apiGet(`/vaccinerecords?petId=${bookingData.petId}&pageSize=100`)
              // Handle both PaginatedResult and direct array
              const records = recordsData?.items || (Array.isArray(recordsData) ? recordsData : [])
              setVaccineRecords(records)
            }
          } catch (error) {
            console.error("Error loading vaccine records:", error)
          }
        }
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [bookingId])

  const handleAddRecord = () => {
    if (!selectedVaccine || !dose) {
      alert("Vui lòng chọn vaccine và liều lượng")
      return
    }

    const vaccine = vaccines.find(v => v.vaccineId.toString() === selectedVaccine)
    if (!vaccine) return

    setRecords([
      ...records,
      {
        vaccineId: vaccine.vaccineId,
        vaccine: vaccine.type,
        dose,
        administeredDate,
        nextDueDate
      }
    ])

    // Reset form
    setSelectedVaccine("")
    setDose("")
    setAdministeredDate(new Date().toLocaleDateString('en-CA'))
    setNextDueDate("")
  }

  const handleRemoveRecord = (index: number) => {
    setRecords(records.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (records.length === 0) {
      alert("Vui lòng thêm ít nhất một vaccine")
      return
    }

    try {
      setSaving(true)

      // Save each vaccine record to VaccineRecord table
      for (const record of records) {
        const employeeIdStr = localStorage.getItem("employeeId")
        const employeeId = employeeIdStr ? parseInt(employeeIdStr, 10) : null

        const payload = {
          petId: booking?.petId,
          vaccineId: record.vaccineId,
          branchId: booking?.branchId,
          doctorId: employeeId,
          dose: record.dose,
          dateAdministered: record.administeredDate,
          nextDueDate: record.nextDueDate || null
        }

        console.log("Sending vaccine record payload:", payload)
        await apiPost("/vaccinerecords", payload)
      }

      // Update booking status to Completed
      if (booking?.bookingId) {
        try {
          await apiPost(`/bookings/${booking.bookingId}/status`, { status: "Completed" })
        } catch (error) {
          console.warn("Warning: Could not update booking status:", error)
          // Don't fail the whole operation if status update fails
        }
      }

      alert("Cập nhật vaccine thành công!")
      setRecords([])
      router.push(`/vet`)
    } catch (error) {
      console.error("Error saving vaccine records:", error)
      alert("Lỗi khi lưu thông tin vaccine: " + (error instanceof Error ? error.message : "Lỗi không xác định"))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-2 text-muted-foreground">Đang tải...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <p>Không tìm thấy cuộc hẹn. Vui lòng quay lại trang trước.</p>
              <Button variant="outline" className="mt-4" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="bg-muted/30 min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Syringe className="h-8 w-8 text-blue-600" />
            Tiêm phòng
          </h1>
          <p className="text-muted-foreground">Ghi lại thông tin tiêm phòng cho thú cưng</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Thông tin booking */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Thông tin cuộc hẹn</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground">Thời gian</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {new Date(booking.bookingTime).toLocaleString("vi-VN")}
                    </span>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-muted-foreground">Khách hàng</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{booking.customerName}</p>
                      <p className="text-sm text-muted-foreground">{booking.customerPhone}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-muted-foreground">Thú cưng</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <PawPrint className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{booking.petName}</p>
                      <p className="text-sm text-muted-foreground">{booking.petType}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-muted-foreground">Chi nhánh</Label>
                  <p className="mt-1 font-medium">{booking.branchName}</p>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-muted-foreground">Bác sĩ</Label>
                  <p className="mt-1 font-medium">{booking.doctorName}</p>
                </div>
              </CardContent>
            </Card>

            {/* Lịch sử tiêm phòng trước */}
            {vaccineRecords.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Lịch sử tiêm phòng</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {vaccineRecords.map((record, idx) => (
                      <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                        <p className="font-medium text-sm">{record.vaccine?.type || "N/A"}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Liều: {record.dose}ml
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Lần tiêp theo: {new Date(record.nextDueDate).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Form thêm vaccine */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Syringe className="h-5 w-5" />
                  Thêm vaccine
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {vaccines.length === 0 && !loadingVaccines && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg flex gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                    <div className="text-sm text-amber-700 dark:text-amber-400">
                      <p className="font-medium mb-1">Không tải được danh sách vaccine</p>
                      <p className="text-xs">Vui lòng thử tải lại trang hoặc kiểm tra kết nối</p>
                    </div>
                  </div>
                )}
                
                <div>
                  <Label htmlFor="vaccine">Chọn vaccine</Label>
                  <Select value={selectedVaccine} onValueChange={setSelectedVaccine} disabled={loadingVaccines || vaccines.length === 0}>
                    <SelectTrigger id="vaccine">
                      <SelectValue placeholder={loadingVaccines ? "Đang tải vaccine..." : "Chọn vaccine..."} />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingVaccines ? (
                        <div className="p-2 text-sm text-muted-foreground">Đang tải...</div>
                      ) : vaccines.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground">Không có vaccine nào</div>
                      ) : (
                        vaccines.map((v) => (
                          <SelectItem key={v.vaccineId} value={v.vaccineId.toString()}>
                            <div className="flex flex-col">
                              <span>{v.type}</span>
                              {v.description && (
                                <span className="text-xs text-muted-foreground">{v.description}</span>
                              )}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dose">Liều lượng (ml)</Label>
                    <Input
                      id="dose"
                      type="number"
                      step="0.01"
                      value={dose}
                      onChange={(e) => setDose(e.target.value)}
                      placeholder="Ví dụ: 1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="administeredDate">Ngày tiêm</Label>
                    <Input
                      id="administeredDate"
                      type="date"
                      value={administeredDate}
                      onChange={(e) => setAdministeredDate(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="nextDueDate">Ngày tiêm lần kế tiếp</Label>
                  <Input
                    id="nextDueDate"
                    type="date"
                    value={nextDueDate}
                    onChange={(e) => setNextDueDate(e.target.value)}
                  />
                </div>

                <Button onClick={handleAddRecord} className="w-full">
                  Thêm vaccine
                </Button>
              </CardContent>
            </Card>

            {/* Danh sách vaccine đã thêm */}
            {records.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge>{records.length}</Badge>
                    Vaccine sẽ được tiêm
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {records.map((record, idx) => (
                    <div key={idx} className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 space-y-2">
                          <p className="font-semibold">{record.vaccine}</p>
                          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <div>
                              <span className="font-medium">Liều:</span> {record.dose}ml
                            </div>
                            <div>
                              <span className="font-medium">Ngày tiêm:</span> {record.administeredDate}
                            </div>
                          </div>
                          {record.nextDueDate && (
                            <div className="text-sm text-muted-foreground">
                              <span className="font-medium">Lần tiếp theo:</span> {record.nextDueDate}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveRecord(idx)}
                          className="text-destructive hover:text-destructive"
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full mt-4"
                    size="lg"
                  >
                    {saving ? "Đang lưu..." : "Lưu tất cả vaccine"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {records.length === 0 && (
              <Card className="mt-6 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      Vui lòng thêm ít nhất một vaccine trước khi lưu
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
