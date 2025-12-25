"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from '@/hooks/use-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { parseISO } from 'date-fns'

export default function AdminCustomersPage() {
  const router = useRouter()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [period, setPeriod] = useState<'day'|'month'|'year'>('day')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        const { apiGet } = await import('@/lib/api')
        const res = await apiGet('/customers')
        if (!mounted) return
        setItems(Array.isArray(res) ? res : [])
      } catch (err) {
        console.error(err)
        toast({ title: 'Lỗi', description: 'Không thể tải danh sách khách hàng', variant: 'destructive' })
      } finally {
        setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  async function handleDelete(id: number) {
    if (!confirm('Xác nhận xóa khách hàng?')) return
    try {
      const { apiDelete } = await import('@/lib/api')
      await apiDelete(`/customers/${id}`)
      setItems(s => s.filter(i => (i.id || i.customerId) !== id))
      toast({ title: 'Đã xóa', description: 'Khách hàng đã được xóa.' })
    } catch (err: any) {
      console.error(err)
      toast({ title: 'Lỗi', description: err?.message || String(err), variant: 'destructive' })
    }
  }

  const filtered = items.filter(i => {
    if (!query) return true
    const q = query.toLowerCase()
    return (i.fullName || i.name || '').toLowerCase().includes(q) || (i.email || '').toLowerCase().includes(q) || String(i.phone || '').includes(q)
  })
  .filter(i => {
    // if no date filters set, include
    if (!from && !to) return true
    const raw = i.memberSince || i.MemberSince || i.memberSinceDate || i.registeredAt || i.createdAt
    if (!raw) return false
    let d: Date
    try { d = typeof raw === 'string' ? parseISO(raw) : new Date(raw) } catch { return false }
    if (from) {
      const f = new Date(from + (period === 'day' ? 'T00:00:00' : 'T00:00:00'))
      if (d < f) return false
    }
    if (to) {
      const t = new Date(to + (period === 'day' ? 'T23:59:59' : 'T23:59:59'))
      if (d > t) return false
    }
    return true
  })

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h2 className="text-lg font-bold">Quản lý Khách hàng</h2>
          <div className="flex items-center gap-2">
            <Input className="w-96 max-w-full flex-none" placeholder="Tìm kiếm tên, email, điện thoại" value={query} onChange={(e) => setQuery(e.target.value)} />
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowFilters(s => !s)}>{showFilters ? 'Đóng bộ lọc' : 'Bộ lọc'}</Button>
              <Button onClick={() => router.push('/admin/customers/new')}>Thêm khách hàng</Button>
            </div>
          </div>
        </div>
      </header>
      {showFilters && (
        <div className="container mx-auto px-4 py-4">
          <div className="p-4 bg-white rounded shadow flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">Khoảng:</div>
              <Select onValueChange={(v) => setPeriod(v as any)}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder={` ${period} `} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Ngày</SelectItem>
                  <SelectItem value="month">Tháng</SelectItem>
                  <SelectItem value="year">Năm</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <input type={period === 'day' ? 'date' : 'month'} value={from} onChange={(e) => setFrom(e.target.value)} className="border rounded px-2 py-1" />
              <span className="text-sm">→</span>
              <input type={period === 'day' ? 'date' : 'month'} value={to} onChange={(e) => setTo(e.target.value)} className="border rounded px-2 py-1" />
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => { setFrom(''); setTo(''); setPeriod('day') }}>Xóa lọc</Button>
            </div>

            <div className="w-full mt-3">
              <details className="text-sm text-muted-foreground">
                <summary className="cursor-pointer">Xem thuộc tính lọc</summary>
                <ul className="mt-2 list-disc list-inside">
                  <li><strong>fullName / name</strong>: lọc theo tên khách hàng</li>
                  <li><strong>email</strong>: lọc theo email</li>
                  <li><strong>phone</strong>: lọc theo số điện thoại</li>
                  <li><strong>memberSince / MemberSince / createdAt</strong>: ngày đăng ký (sử dụng khoảng ngày/tháng/năm)</li>
                </ul>
              </details>
            </div>
          </div>
        </div>
      )}
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Danh sách khách hàng</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Đang tải...</div>
            ) : (
              <div className="space-y-2">
                {filtered.length === 0 ? <div className="text-sm text-muted-foreground">Không có khách hàng.</div> : null}
                {filtered.map((c) => {
                  const id = c.id ?? c.customerId
                  return (
                    <div key={id} className="p-3 border rounded-md flex justify-between items-center">
                      <div>
                        <div className="font-medium">{c.fullName || c.name || 'Không tên'}</div>
                        <div className="text-sm text-muted-foreground">{c.email || ''} • {c.phone || ''}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => router.push(`/admin/customers/${id}`)}>Xem / Sửa</Button>
                        <Button variant="destructive" onClick={() => handleDelete(Number(id))}>Xóa</Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
