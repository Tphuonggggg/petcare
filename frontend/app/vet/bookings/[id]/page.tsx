"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function BookingDetailPage() {
  const params = useParams()
  const id = params?.id
  const router = useRouter()
  const [booking, setBooking] = useState<any | null>(null)
  const [pet, setPet] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [diagnosis, setDiagnosis] = useState('')
  const [evaluation, setEvaluation] = useState('')

  useEffect(() => {
    if (!id) return
    ;(async () => {
      setLoading(true)
      try {
        const { apiGet } = await import('@/lib/api')
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

  const saveRecord = async () => {
    if (!booking) return alert('Không có booking')
    try {
      const vetEmail = JSON.parse(localStorage.getItem('user') || '{}').email
      const branchId = localStorage.getItem('selected_branch_id')
      const notes = `Chẩn đoán:\n${diagnosis}\n\nĐánh giá:\n${evaluation}`
      const { apiPost } = await import('@/lib/api')
      await apiPost('/vetrecords', { petId: booking.petId || 0, petName: pet?.name || '', notes, branchId: branchId ? Number(branchId) : undefined, vetEmail, bookingId: booking.bookingId })
      alert('Bệnh án đã lưu')
      router.push('/vet')
    } catch (err) {
      alert('Lưu thất bại')
    }
  }

  if (!id) return <div>Booking ID không hợp lệ</div>

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Chi tiết cuộc hẹn</h1>
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
              <div className="font-medium">{booking?.serviceName ?? '—'}</div>
              <div className="text-sm text-muted-foreground">Ngày: {booking?.date ?? '—'} — Trạng thái: {booking?.status ?? '—'}</div>
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
            <div>
              <div className="font-medium">{pet.name}</div>
              <div className="text-sm text-muted-foreground">{pet.species ?? ''} — {pet.breed ?? ''}</div>
              <div className="text-sm text-muted-foreground">Owner ID: {pet.customerId}</div>
            </div>
          ) : <div className="text-muted-foreground">Không có thông tin thú cưng</div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Viết bệnh án / Đánh giá</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <Label>Chẩn đoán</Label>
              <Textarea value={diagnosis} onChange={(e:any) => setDiagnosis(e.target.value)} />
            </div>
            <div>
              <Label>Đánh giá</Label>
              <Textarea value={evaluation} onChange={(e:any) => setEvaluation(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => saveRecord()}>Lưu bệnh án</Button>
              <Button variant="ghost" onClick={() => router.back()}>Hủy</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
