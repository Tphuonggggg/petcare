"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

type Invoice = { invoiceId: number; amount: number; issuedAt: string; customerId?: number; branchId?: number }
type Booking = { bookingId: number; date: string; total?: number; branchId?: number }

export default function SalesReportsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [branchName, setBranchName] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const { apiGet } = await import('@/lib/api')

        // Determine branch: prefer employee's assigned branch for sales role
        let branchId: string | null = null
        try {
          const raw = localStorage.getItem('user')
          if (raw) {
            const user = JSON.parse(raw)
            if (user?.role === 'sales' && user?.email) {
              try {
                const emp = await apiGet('/employees?email=' + encodeURIComponent(user.email))
                if (emp && (emp as any).branchId) {
                  branchId = String((emp as any).branchId)
                  try {
                    const b = await apiGet('/branches/' + branchId)
                    setBranchName(b?.name ?? null)
                  } catch {}
                }
              } catch {}
            }
          }
        } catch {}

        // fallback to selected_branch_id in localStorage
        if (!branchId) branchId = localStorage.getItem('selected_branch_id')

        const q = branchId ? `?branchId=${encodeURIComponent(branchId)}` : ''
        const inv = await apiGet('/invoices' + q)
        const bk = await apiGet('/bookings' + q)
        setInvoices(Array.isArray(inv) ? inv : [])
        setBookings(Array.isArray(bk) ? bk : [])
      } catch (err) {
        setInvoices([])
        setBookings([])
      } finally { setLoading(false) }
    }
    load()
  }, [])

  const totalRevenue = useMemo(() => invoices.reduce((s, i) => s + (i.amount||0), 0), [invoices])
  const totalBookings = useMemo(() => bookings.length, [bookings])

  const last7Days = useMemo(() => {
    const days: { date: string; revenue: number; bookings: number }[] = []
    for (let i=6;i>=0;i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = format(d, 'yyyy-MM-dd')
      const rev = invoices.filter(inv => (inv.issuedAt||'').slice(0,10) === key).reduce((s,i)=>s+(i.amount||0),0)
      const bcount = bookings.filter(b => (b.date||'').slice(0,10) === key).length
      days.push({ date: key, revenue: rev, bookings: bcount })
    }
    return days
  }, [invoices, bookings])

  function exportCsv() {
    const rows = [['invoiceId','amount','issuedAt','customerId']]
    invoices.forEach(i => rows.push([String(i.invoiceId), String(i.amount), i.issuedAt, String(i.customerId||'')]))
    const csv = rows.map(r => r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `invoices_${format(new Date(),'yyyyMMdd')}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Báo cáo bán hàng</h1>
          <p className="text-muted-foreground">Tổng quan doanh thu và lịch sử đơn hàng (lọc theo chi nhánh nếu có).</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Tổng doanh thu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{totalRevenue.toLocaleString()} đ</div>
              <div className="text-sm text-muted-foreground mt-2">Số hóa đơn: {invoices.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tổng lượt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{totalBookings}</div>
              <div className="text-sm text-muted-foreground mt-2">Cuộc hẹn đã ghi</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hành động</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <Button onClick={exportCsv}>Xuất CSV (hóa đơn)</Button>
                <Button variant="outline" onClick={() => window.location.reload()}>Làm mới</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Doanh thu 7 ngày gần nhất</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
              {last7Days.map(d => (
                <div key={d.date} className="p-3 border rounded text-center">
                  <div className="text-sm text-muted-foreground">{format(new Date(d.date),'dd/MM')}</div>
                  <div className="font-medium">{d.revenue.toLocaleString()} đ</div>
                  <div className="text-xs text-muted-foreground">{d.bookings} lượt</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hóa đơn gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <div>Đang tải...</div> : (
              <div className="space-y-2">
                {invoices.slice().reverse().map(inv => (
                  <div key={inv.invoiceId} className="p-2 border rounded flex justify-between items-center">
                    <div>
                      <div className="font-medium">HĐ #{inv.invoiceId} — {format(new Date(inv.issuedAt),'dd/MM/yyyy')}</div>
                      <div className="text-sm text-muted-foreground">Khách hàng: {inv.customerId ?? '-'}</div>
                    </div>
                    <div className="font-medium">{inv.amount?.toLocaleString() ?? 0} đ</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
