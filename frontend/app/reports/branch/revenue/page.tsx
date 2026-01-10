"use client"
import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import ReportFilters from '../../../../components/report/ReportFilters'
import { apiGet } from '../../../../lib/api'
import { Button } from '@/components/ui/button'

function formatDateISO(d: Date) {
  return d.toISOString().slice(0, 10)
}

export default function BranchRevenuePage() {
  const search = useSearchParams()
  const qBranch = search?.get('branchId')
  const qFrom = search?.get('from')
  const qTo = search?.get('to')
  const qPeriod = search?.get('period')

  const [filters, setFilters] = useState<any>({ branchId: qBranch ? Number(qBranch) : null, from: qFrom ?? '', to: qTo ?? '', period: qPeriod ?? 'day' })
  const [invoices, setInvoices] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    Promise.all([apiGet('/invoices'), apiGet('/bookings')])
      .then(([inv, bk]) => {
        if (!mounted) return
        setInvoices(Array.isArray(inv) ? inv : [])
        setBookings(Array.isArray(bk) ? bk : [])
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [])

  const filtered = useMemo(() => {
    const { branchId, from, to } = filters
    // build map bookingId -> booking
    const bkMap = new Map(bookings.map(b => [b.bookingId, b]))

    const rows = invoices.filter(inv => {
      const bid = inv.bookingId
      const bk = bkMap.get(bid)
      if (branchId && (!bk || bk.branchId !== branchId)) return false
      const issued = new Date(inv.issuedAt || inv.createdAt || new Date())
      if (from) {
        const fromD = new Date(from + 'T00:00:00')
        if (issued < fromD) return false
      }
      if (to) {
        const toD = new Date(to + 'T23:59:59')
        if (issued > toD) return false
      }
      return true
    })

    return rows
  }, [invoices, bookings, filters])

  const totalRevenue = useMemo(() => filtered.reduce((s, r) => s + (Number(r.amount) || 0), 0), [filtered])

  // Group by period (day/month/quarter/year)
  function groupKeyFor(dateStr: string, period: string) {
    const d = new Date(dateStr)
    const y = d.getFullYear()
    const m = d.getMonth() + 1
    const day = d.getDate()
    if (period === 'day') return `${y}-${String(m).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    if (period === 'month') return `${y}-${String(m).padStart(2,'0')}`
    if (period === 'quarter') {
      const q = Math.floor((m - 1) / 3) + 1
      return `${y}-Q${q}`
    }
    return String(y)
  }

  const grouped = useMemo(() => {
    const period = filters?.period || 'day'
    const map = new Map<string, { key: string; label: string; revenue: number; count: number; items: any[] }>()
    for (const inv of filtered) {
      const key = groupKeyFor(inv.issuedAt || inv.createdAt || new Date().toISOString(), period)
      const sampleDate = new Date(inv.issuedAt || inv.createdAt || new Date().toISOString())
      let label = key
      if (period === 'day') {
        label = sampleDate.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
      } else if (period === 'month') {
        label = `Tháng ${sampleDate.getMonth() + 1}/${sampleDate.getFullYear()}`
      } else if (period === 'quarter') {
        const q = Math.floor(sampleDate.getMonth() / 3) + 1
        label = `Quý ${q} ${sampleDate.getFullYear()}`
      } else {
        label = `${sampleDate.getFullYear()}`
      }

      const cur = map.get(key) || { key, label, revenue: 0, count: 0, items: [] }
      cur.revenue += Number(inv.amount) || 0
      cur.count += 1
      cur.items.push(inv)
      map.set(key, cur)
    }
    // sort keys descending (newest first)
    return Array.from(map.values()).sort((a, b) => (a.key < b.key ? 1 : -1))
  }, [filtered, filters?.period])

  function exportCsv() {
    const headers = ['issuedAt','invoiceId','bookingId','customerId','amount','paid']
    const lines = [headers.join(',')].concat(filtered.map(r => [r.issuedAt, r.invoiceId, r.bookingId, r.customerId, r.amount, r.paid].map(v => String(v)).join(',')))
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `branch-revenue-${formatDateISO(new Date())}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">← Quay lại Dashboard</Button>
          </Link>
          <h1 className="text-2xl font-semibold">Doanh thu - Chi nhánh</h1>
        </div>
      </div>

      <ReportFilters initialBranchId={filters.branchId} onChange={(o) => setFilters(o)} />

      <div className="mt-4 bg-white p-4 rounded shadow">
        {loading ? (
          <div>Đang tải...</div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-muted-foreground">Tổng doanh thu</div>
                <div className="text-2xl font-bold">{totalRevenue.toLocaleString()} đ</div>
                <div className="text-sm text-muted-foreground">Số hóa đơn: {filtered.length}</div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={exportCsv}>Xuất CSV</button>
              </div>
            </div>

            <div className="mb-4 bg-gray-50 p-3 rounded">
              <h3 className="font-medium mb-2">Tổng theo {filters?.period || 'Ngày'}</h3>
              <div className="overflow-x-auto">
                <table className="w-full table-auto border-collapse">
                  <thead>
                    <tr className="text-left">
                      <th className="p-2">Khoảng</th>
                      <th className="p-2">Doanh thu</th>
                      <th className="p-2">Số hóa đơn</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grouped.map(g => (
                      <tr key={g.key} className="border-t">
                        <td className="p-2 align-top">{g.label}</td>
                        <td className="p-2 align-top">{g.revenue.toLocaleString()} đ</td>
                        <td className="p-2 align-top">{g.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="text-left">
                    <th className="p-2">Ngày</th>
                    <th className="p-2">Hóa đơn</th>
                    <th className="p-2">Booking</th>
                    <th className="p-2">Khách</th>
                    <th className="p-2">Số tiền</th>
                    <th className="p-2">Đã thanh toán</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => {
                    const id = r?.invoiceId ?? r?.id
                    const issued = r?.issuedAt ?? r?.createdAt ?? r?.date
                    const bookingId = (r?.bookingId ?? r?.booking) || ''
                    const customer = r?.customerId ?? r?.customerName ?? ''
                    const amount = r?.amount ?? r?.total ?? 0
                    const paid = !!r?.paid
                    return (
                    <tr key={id} className="border-t">
                      <td className="p-2 align-top">{issued ? new Date(issued).toLocaleString() : ''}</td>
                      <td className="p-2 align-top">#{id}</td>
                      <td className="p-2 align-top">#{bookingId}</td>
                      <td className="p-2 align-top">{customer}</td>
                      <td className="p-2 align-top">{Number(amount).toLocaleString()} đ</td>
                      <td className="p-2 align-top">{paid ? 'Yes' : 'No'}</td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
