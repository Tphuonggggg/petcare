"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function BookingCreatePage() {
  const router = useRouter()
  const [services, setServices] = useState<any[]>([])
  const [pets, setPets] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [form, setForm] = useState({
    serviceId: "",
    petId: "",
    branchId: "",
    doctorId: "auto",
    requestedDateTime: "",
    notes: ""
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      const { apiGet } = await import("@/lib/api")
      const s = await apiGet("/services")
      setServices(Array.isArray(s) ? s : (s?.items || []))
      const b = await apiGet("/branches")
      setBranches(Array.isArray(b) ? b : (b?.items || []))
      const e = await apiGet("/employees?positionId=1")
      setDoctors(Array.isArray(e) ? e : (e?.items || []))
      const userData = localStorage.getItem('user')
      if (userData) {
        const user = JSON.parse(userData)
        const petsRes = await apiGet(`/pets?customerId=${user.customerId || user.id || user.CustomerId}`)
        setPets(Array.isArray(petsRes) ? petsRes : (petsRes?.items || []))
      }
    }
    load()
  }, [])

  const handleChange = (key: string, value: string) => {
    setForm(f => ({ ...f, [key]: value }))
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { apiPost } = await import("@/lib/api")
      const userData = localStorage.getItem('user')
      if (!userData) throw new Error("Chưa đăng nhập")
      const user = JSON.parse(userData)
      // Lấy tên dịch vụ từ id
      const service = services.find((s: any) => String(s.serviceId ?? s.id) === form.serviceId)
      
      // Send datetime-local value directly without conversion
      // form.requestedDateTime is in format "2025-01-11T07:00"
      
      await apiPost("/bookings", {
        CustomerId: user.customerId || user.id || user.CustomerId,
        PetId: Number(form.petId),
        BranchId: Number(form.branchId),
        DoctorId: form.doctorId && form.doctorId !== "auto" ? Number(form.doctorId) : null,
        BookingType: service?.name || "D\u1ecbch v\u1ee5",
        RequestedDateTime: form.requestedDateTime,
        Status: "Pending",
        Notes: form.notes,
      })
      router.push("/customer/bookings")
    } catch (e) {
      alert("Đặt lịch thất bại. Vui lòng thử lại!")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            ←
          </Button>
          <span className="font-bold text-lg">Đặt lịch mới</span>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle>Đặt lịch hẹn mới</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block mb-1 font-medium">Dịch vụ</label>
                <Select value={form.serviceId} onValueChange={v => handleChange('serviceId', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn dịch vụ" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((s: any) => (
                      <SelectItem key={s.serviceId ?? s.id} value={String(s.serviceId ?? s.id)}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Thú cưng</label>
                <Select value={form.petId} onValueChange={v => handleChange('petId', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn thú cưng" />
                  </SelectTrigger>
                  <SelectContent>
                    {pets.map((p: any) => (
                      <SelectItem key={p.petId ?? p.id} value={String(p.petId ?? p.id)}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Chi nhánh</label>
                <Select value={form.branchId} onValueChange={v => handleChange('branchId', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn chi nhánh" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((b: any) => (
                      <SelectItem key={b.branchId ?? b.id} value={String(b.branchId ?? b.id)}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Bác sĩ (tùy chọn)</label>
                <Select value={form.doctorId} onValueChange={v => handleChange('doctorId', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn bác sĩ (nếu có)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Không chọn (tự động gán)</SelectItem>
                    {doctors.filter((d: any) => d.branchId == Number(form.branchId) || !form.branchId).map((d: any) => (
                      <SelectItem key={d.employeeId ?? d.id} value={String(d.employeeId ?? d.id)}>{d.fullName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Ngày giờ</label>
                <Input type="datetime-local" value={form.requestedDateTime} onChange={e => handleChange('requestedDateTime', e.target.value)} required />
              </div>
              <div>
                <label className="block mb-1 font-medium">Ghi chú</label>
                <Textarea value={form.notes} onChange={e => handleChange('notes', e.target.value)} placeholder="Ghi chú thêm (nếu có)" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Đang đặt..." : "Đặt lịch"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
