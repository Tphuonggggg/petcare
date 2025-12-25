"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'

export default function InvoicesPage() {
  const router = useRouter()
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function createInvoice() {
    try {
      const raw = localStorage.getItem('user')
      const parsed = raw ? JSON.parse(raw) : null
      const id = parsed && (parsed.id || parsed.customerId || parsed.CustomerId)
      if (!id) {
        toast({ title: 'Chú ý', description: 'Không tìm thấy người dùng. Hãy đăng nhập hoặc bật mock mode.' })
        return
      }

      const amountStr = prompt('Số tiền (k)', '100')
      if (!amountStr) return
      const amount = Number(amountStr)
      if (isNaN(amount) || amount <= 0) {
        toast({ title: 'Lỗi', description: 'Số tiền không hợp lệ', variant: 'destructive' })
        return
      }
      const bookingIdStr = prompt('Booking ID (tùy chọn)', '')
      const bookingId = bookingIdStr ? Number(bookingIdStr) : undefined

      const { apiPost, apiGet } = await import('@/lib/api')
      const created = await apiPost('/invoices', { customerId: id, amount, bookingId })
      toast({ title: 'Đã tạo', description: `Hóa đơn #${created?.invoiceId ?? '—'} đã được tạo.` })
      // refresh list
      const data = await apiGet(`/invoices?customerId=${id}`)
      setInvoices(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      toast({ title: 'Lỗi', description: 'Không thể tạo hóa đơn.', variant: 'destructive' })
    }
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const raw = localStorage.getItem('user')
        const parsed = raw ? JSON.parse(raw) : null
        const id = parsed && (parsed.id || parsed.customerId || parsed.CustomerId)
        if (!id) {
          // If no user, suggest mock mode
          toast({ title: 'Chú ý', description: 'Không tìm thấy người dùng. Hãy đăng nhập hoặc bật mock mode.' })
          setInvoices([])
          setLoading(false)
          return
        }
        const { apiGet } = await import('@/lib/api')
        const data = await apiGet(`/invoices?customerId=${id}`)
        if (mounted) setInvoices(Array.isArray(data) ? data : [])
      } catch (err) {
        toast({ title: 'Lỗi', description: 'Không thể tải danh sách hóa đơn.', variant: 'destructive' })
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  if (loading) return <div className="p-6">Đang tải hóa đơn...</div>

  return (
    <main className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Hóa đơn của tôi</CardTitle>
          <div>
            <Button onClick={createInvoice}>Tạo hóa đơn</Button>
          </div>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-sm text-muted-foreground">Không tìm thấy hóa đơn nào.</div>
          ) : (
            <ul className="space-y-3">
              {invoices.map((i) => (
                <li key={i.invoiceId} className="p-3 border rounded-md flex justify-between items-center cursor-pointer" role="button" tabIndex={0} onClick={() => router.push(`/customer/invoices/${i.invoiceId}`)} onKeyDown={(e) => { if (e.key === 'Enter') router.push(`/customer/invoices/${i.invoiceId}`) }}>
                  <div>
                    <div className="font-medium">Hóa đơn #{i.invoiceId}</div>
                    <div className="text-sm text-muted-foreground">{new Date(i.issuedAt).toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{i.amount}k</div>
                    <div className={`text-sm ${i.paid ? 'text-green-600' : 'text-red-600'}`}>{i.paid ? 'Đã thanh toán' : 'Chưa trả'}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <div className="mt-4">
        <Button variant="ghost" onClick={() => router.push('/customer')}>Quay lại</Button>
      </div>
    </main>
  )
}
