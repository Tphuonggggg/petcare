"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, X, Pill } from "lucide-react"
import { apiGet, apiPost } from "@/lib/api"

interface Prescription {
  medicineName: string
  dosage: string
  frequency: string
  duration: string
  notes: string
}

export default function BookingDetailPage() {
  const params = useParams()
  const id = params?.id
  const router = useRouter()
  const [booking, setBooking] = useState<any | null>(null)
  const [pet, setPet] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  
  // Health check fields
  const [symptoms, setSymptoms] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [prescription, setPrescription] = useState('')
  const [followUpDate, setFollowUpDate] = useState('')
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])

  useEffect(() => {
    if (!id) return
    ;(async () => {
      setLoading(true)
      try {
        try {
          const b = await apiGet('/bookings/' + id)
          setBooking(b)
          if (b?.petId) {
            try {
              const p = await apiGet('/pets/' + b.petId)
              setPet(p)
            } catch {}
          }
        } catch {}
      } catch {}
      setLoading(false)
    })()
  }, [id])

  const addPrescription = () => {
    setPrescriptions([...prescriptions, {
      medicineName: '',
      dosage: '',
      frequency: '',
      duration: '',
      notes: ''
    }])
  }

  const removePrescription = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index))
  }

  const updatePrescription = (index: number, field: keyof Prescription, value: string) => {
    const updated = [...prescriptions]
    updated[index] = { ...updated[index], [field]: value }
    setPrescriptions(updated)
  }

  const saveCheckHealth = async () => {
    if (!booking || !pet) {
      alert('Không có đủ thông tin booking và thú cưng')
      return
    }

    // Validate required fields
    if (!symptoms.trim()) {
      alert('Vui lòng nhập triệu chứng')
      return
    }

    if (!diagnosis.trim()) {
      alert('Vui lòng nhập chẩn đoán')
      return
    }

    // Validate prescriptions if using detailed form
    if (prescriptions.length > 0) {
      const missingFields = []
      for (let i = 0; i < prescriptions.length; i++) {
        const p = prescriptions[i]
        const drugNumber = i + 1
        
        if (!p.medicineName.trim()) {
          missingFields.push(`Thuốc ${drugNumber}: thiếu tên thuốc`)
        }
        if (!p.dosage.trim()) {
          missingFields.push(`Thuốc ${drugNumber}: thiếu liều lượng`)
        }
        if (!p.frequency.trim()) {
          missingFields.push(`Thuốc ${drugNumber}: thiếu tần suất`)
        }
        if (!p.duration.trim()) {
          missingFields.push(`Thuốc ${drugNumber}: thiếu thời gian`)
        }
      }
      
      if (missingFields.length > 0) {
        alert('Thông tin đơn thuốc chưa đầy đủ:\n' + missingFields.join('\n'))
        return
      }
    } else if (!prescription.trim()) {
      // If not using detailed form, require text prescription
      alert('Vui lòng nhập đơn thuốc hoặc thêm thuốc chi tiết')
      return
    }

    try {
      const employeeId = localStorage.getItem('employeeId')
      if (!employeeId) {
        alert('Không tìm thấy thông tin bác sĩ')
        return
      }

      // Format prescription text
      let prescriptionText = prescription
      if (prescriptions.length > 0) {
        prescriptionText = prescriptions.map((p, i) => 
          `${i + 1}. ${p.medicineName}\n   - Liều lượng: ${p.dosage}\n   - Tần suất: ${p.frequency}\n   - Thời gian: ${p.duration}\n   - Ghi chú: ${p.notes || 'Không có'}`
        ).join('\n\n')
      }

      // Call API to create check health record
      const checkHealthData = {
        petId: pet.petId,
        doctorId: parseInt(employeeId),
        symptoms: symptoms,
        diagnosis: diagnosis,
        prescription: prescriptionText,
        followUpDate: followUpDate ? new Date(followUpDate).toISOString() : null,
        checkDate: new Date().toISOString(),
        bookingId: booking.bookingId
      }

      console.log('[DEBUG] Saving check health:', checkHealthData)
      
      await apiPost('/procedures/doctor/create-check-health', checkHealthData)
      
      alert('Bệnh án đã được lưu thành công! Lịch hẹn đã chuyển sang hoàn thành.')
      router.push('/vet')
    } catch (error: any) {
      console.error('Error saving check health:', error)
      alert('Lỗi khi lưu bệnh án: ' + (error.message || 'Vui lòng thử lại'))
    }
  }

  if (!id) return <div>Booking ID không hợp lệ</div>

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Chi tiết cuộc hẹn & Viết bệnh án</h1>
          <p className="text-muted-foreground">Booking #{id}</p>
        </div>
        <div>
          <Button variant="ghost" onClick={() => router.back()}>Quay lại</Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Thông tin cuộc hẹn</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <div>Đang tải...</div> : (
            <div>
              <div className="font-medium">{booking?.bookingType ?? '—'}</div>
              <div className="text-sm text-muted-foreground">
                Ngày: {booking?.requestedDateTime ? new Date(booking.requestedDateTime).toLocaleString('vi-VN') : '—'} — Trạng thái: {booking?.status ?? '—'}
              </div>
              {booking?.notes && (
                <div className="text-sm text-muted-foreground mt-2">
                  Ghi chú: {booking.notes}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Thông tin thú cưng</CardTitle>
        </CardHeader>
        <CardContent>
          {pet ? (
            <div className="space-y-1">
              <div className="font-medium text-lg">{pet.name}</div>
              <div className="text-sm text-muted-foreground">{pet.species ?? ''} — {pet.breed ?? ''}</div>
              {pet.birthDate && (
                <div className="text-sm text-muted-foreground">Ngày sinh: {pet.birthDate}</div>
              )}
              {pet.gender && (
                <div className="text-sm text-muted-foreground">Giới tính: {pet.gender}</div>
              )}
            </div>
          ) : <div className="text-muted-foreground">Không có thông tin thú cưng</div>}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Khám bệnh</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="symptoms">Triệu chứng *</Label>
              <Textarea 
                id="symptoms"
                placeholder="Mô tả các triệu chứng quan sát được..."
                value={symptoms} 
                onChange={(e) => setSymptoms(e.target.value)}
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="diagnosis">Chẩn đoán *</Label>
              <Textarea 
                id="diagnosis"
                placeholder="Chẩn đoán bệnh..."
                value={diagnosis} 
                onChange={(e) => setDiagnosis(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="followup">Ngày tái khám (tùy chọn)</Label>
              <Input 
                id="followup"
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Pill className="h-5 w-5" />
              Kê đơn thuốc
            </span>
            <Button size="sm" onClick={addPrescription}>
              <Plus className="h-4 w-4 mr-1" />
              Thêm thuốc
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {prescriptions.length === 0 ? (
            <div>
              <Label>Đơn thuốc (text)</Label>
              <Textarea 
                placeholder="Nhập đơn thuốc hoặc thêm thuốc chi tiết bên dưới..."
                value={prescription} 
                onChange={(e) => setPrescription(e.target.value)}
                rows={4}
              />
              <p className="text-sm text-muted-foreground mt-2">
                Hoặc nhấn "Thêm thuốc" để kê đơn chi tiết
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {prescriptions.map((p, index) => (
                <div key={index} className="border p-4 rounded-lg relative">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => removePrescription(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  
                  <div className="space-y-3 pr-10">
                    <div>
                      <Label>Tên thuốc *</Label>
                      <Input 
                        placeholder="VD: Amoxicillin"
                        value={p.medicineName}
                        onChange={(e) => updatePrescription(index, 'medicineName', e.target.value)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label>Liều lượng *</Label>
                        <Input 
                          placeholder="VD: 250mg"
                          value={p.dosage}
                          onChange={(e) => updatePrescription(index, 'dosage', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label>Tần suất *</Label>
                        <Input 
                          placeholder="VD: 2 lần/ngày"
                          value={p.frequency}
                          onChange={(e) => updatePrescription(index, 'frequency', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label>Thời gian *</Label>
                        <Input 
                          placeholder="VD: 7 ngày"
                          value={p.duration}
                          onChange={(e) => updatePrescription(index, 'duration', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Ghi chú</Label>
                      <Input 
                        placeholder="VD: Uống sau ăn"
                        value={p.notes}
                        onChange={(e) => updatePrescription(index, 'notes', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={saveCheckHealth} size="lg">
          Lưu bệnh án
        </Button>
        <Button variant="outline" size="lg" onClick={() => router.back()}>
          Hủy
        </Button>
      </div>
    </div>
  )
}
