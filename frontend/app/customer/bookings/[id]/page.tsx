"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [petName, setPetName] = useState<string>('')
  const [customerName, setCustomerName] = useState<string>('')
  const [branchName, setBranchName] = useState<string>('')

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { apiGet } = await import('@/lib/api')
        const data = await apiGet(`/bookings/${id}`)
        if (mounted) setBooking(data)
        // fetch pet name
        if (data?.petId) {
          try {
            const pet = await apiGet(`/pets/${data.petId}`)
            if (pet?.name) setPetName(pet.name)
          } catch {}
        }
        // fetch customer name
        if (data?.customerId) {
          try {
            const customer = await apiGet(`/customers/${data.customerId}`)
            if (customer?.fullName) setCustomerName(customer.fullName)
            else if (customer?.name) setCustomerName(customer.name)
          } catch {}
        }
        // fetch branch name
        if (data?.branchId) {
          try {
            const branch = await apiGet(`/branches/${data.branchId}`)
            if (branch?.name) setBranchName(branch.name)
            else if (branch?.branchName) setBranchName(branch.branchName)
          } catch {}
        }
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
            <div><strong>Mã lịch hẹn:</strong> {booking.bookingId}</div>
            <div><strong>Dịch vụ:</strong> {booking.serviceName ?? booking.bookingType ?? booking.title ?? '-'}</div>
            <div><strong>Ngày đặt:</strong> {booking.requestedDateTime ? new Date(booking.requestedDateTime).toLocaleString() : (booking.date ? new Date(booking.date).toLocaleString() : '-')}</div>
            <div><strong>Trạng thái:</strong> {booking.status ?? '-'}</div>
            <div><strong>Ghi chú:</strong> {booking.notes ?? '-'}</div>
            <div><strong>Thú cưng:</strong> {petName || booking.petName || '-'}</div>
            <div><strong>Khách hàng:</strong> {customerName || booking.customerName || '-'}</div>
            <div><strong>Chi nhánh:</strong> {branchName || booking.branchName || '-'}</div>
            <div><strong>Bác sĩ:</strong> {booking.doctorName || '-'}</div>
            <div><strong>Tổng tiền:</strong> {booking.total ? booking.total + 'k' : '-'}</div>
          </div>
        </CardContent>
        <div className="pt-6 pb-2 px-6">
          <Button variant="outline" className="w-full" onClick={() => router.push('/customer')}>Quay về trang chủ</Button>
        </div>
      </Card>
    </main>
  )
}
