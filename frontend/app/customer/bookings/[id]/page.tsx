"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'

export default function BookingDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { id } = params
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { apiGet } = await import('@/lib/api')
        const data = await apiGet(`/bookings/${id}`)
        if (mounted) setBooking(data)
      } catch (err) {
        toast({ title: 'Lỗi', description: 'Không thể tải thông tin đặt lịch.' , variant: 'destructive' })
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [id])

  async function updateStatus(status: string) {
    if (!booking) return
    setSaving(true)
    try {
      const { apiPut } = await import('@/lib/api')
      const updated = await apiPut(`/bookings/${booking.bookingId}`, { ...booking, status })
      setBooking(updated)
      toast({ title: 'Đã cập nhật', description: `Trạng thái: ${status}` })
    } catch (err) {
      toast({ title: 'Lỗi', description: 'Không thể cập nhật trạng thái.', variant: 'destructive' })
    } finally { setSaving(false) }
  }

  if (loading) return <div className="p-6">Đang tải...</div>
  if (!booking) return <div className="p-6">Không tìm thấy đặt lịch.</div>

  return (
    <main className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết đặt lịch #{booking.bookingId}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div><strong>Dịch vụ:</strong> {booking.serviceName}</div>
            <div><strong>Ngày:</strong> {booking.date}</div>
            <div><strong>Khách hàng ID:</strong> {booking.customerId}</div>
            <div><strong>Trạng thái:</strong> {booking.status}</div>
            <div><strong>Tổng:</strong> {booking.total ? booking.total + 'k' : '-'}</div>

            <div className="flex gap-2 pt-4">
              <Button onClick={() => updateStatus('Confirmed')} disabled={saving || booking.status === 'Confirmed'}>Xác nhận</Button>
              <Button onClick={() => updateStatus('Completed')} disabled={saving || booking.status === 'Completed'}>Hoàn thành</Button>
              <Button variant="destructive" onClick={() => updateStatus('Cancelled')} disabled={saving || booking.status === 'Cancelled'}>Hủy</Button>
              <Button variant="ghost" onClick={() => router.back()}>Quay lại</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
