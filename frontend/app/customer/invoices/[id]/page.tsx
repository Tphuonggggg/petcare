"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { id } = params
  const [invoice, setInvoice] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { apiGet } = await import('@/lib/api')
        const data = await apiGet(`/invoices/${id}`)
        if (mounted) setInvoice(data)
      } catch (err) {
        toast({ title: 'Lỗi', description: 'Không thể tải thông tin hóa đơn.' , variant: 'destructive' })
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [id])

  async function togglePaid() {
    if (!invoice) return
    setSaving(true)
    try {
      const { apiPut } = await import('@/lib/api')
      const updated = await apiPut(`/invoices/${invoice.invoiceId}`, { ...invoice, paid: !invoice.paid })
      setInvoice(updated)
      toast({ title: 'Đã cập nhật', description: `Trạng thái thanh toán: ${updated.paid ? 'Đã trả' : 'Chưa trả'}` })
    } catch (err) {
      toast({ title: 'Lỗi', description: 'Không thể cập nhật hóa đơn.', variant: 'destructive' })
    } finally { setSaving(false) }
  }

  if (loading) return <div className="p-6">Đang tải...</div>
  if (!invoice) return <div className="p-6">Không tìm thấy hóa đơn.</div>

  return (
    <main className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Hóa đơn #{invoice.invoiceId}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div><strong>Booking ID:</strong> {invoice.bookingId ?? '-'}</div>
            <div><strong>Khách hàng ID:</strong> {invoice.customerId}</div>
            <div><strong>Số tiền:</strong> {invoice.amount}k</div>
            <div><strong>Ngày:</strong> {new Date(invoice.issuedAt).toLocaleString()}</div>
            <div><strong>Trạng thái thanh toán:</strong> {invoice.paid ? 'Đã trả' : 'Chưa trả'}</div>

            <div className="flex gap-2 pt-4">
              <Button onClick={togglePaid} disabled={saving}>{invoice.paid ? 'Đánh dấu chưa trả' : 'Đánh dấu đã trả'}</Button>
              <Button variant="ghost" onClick={() => router.back()}>Quay lại</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
