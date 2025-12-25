"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from '@/hooks/use-toast'

type EmployeeType = any

export default function AdminEmployeesPage() {
  
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [panelOpen, setPanelOpen] = useState(false)
  const [selected, setSelected] = useState<EmployeeType | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        const { apiGet } = await import('@/lib/api')
        const res = await apiGet('/employees')
        if (!mounted) return
        setItems(Array.isArray(res) ? res : [])
      } catch (err) {
        console.error(err)
        toast({ title: 'Lỗi', description: 'Không thể tải danh sách nhân viên', variant: 'destructive' })
      } finally {
        setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  async function handleDelete(id: number) {
    if (!confirm('Xác nhận xóa nhân viên?')) return
    try {
      const { apiDelete } = await import('@/lib/api')
      await apiDelete(`/employees/${id}`)
      setItems(s => s.filter(i => (i.id || i.employeeId) !== id))
      if (selected && (selected.id === id || selected.employeeId === id)) {
        setSelected(null)
        setPanelOpen(false)
      }
      toast({ title: 'Đã xóa', description: 'Nhân viên đã được xóa.' })
    } catch (err: any) {
      console.error(err)
      toast({ title: 'Lỗi', description: err?.message || String(err), variant: 'destructive' })
    }
  }

  async function openDetail(id?: number) {
    if (!id) {
      setSelected({})
      setPanelOpen(true)
      return
    }
    try {
      const { apiGet } = await import('@/lib/api')
      const data = await apiGet(`/employees/${id}`)
      setSelected(data || null)
      setPanelOpen(true)
    } catch (err) {
      console.error(err)
      toast({ title: 'Lỗi', description: 'Không thể tải nhân viên', variant: 'destructive' })
    }
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const payload: any = {
      fullName: String(fd.get('fullName') || '').trim(),
      email: String(fd.get('email') || '').trim(),
      phone: String(fd.get('phone') || '').trim(),
      positionName: String(fd.get('positionName') || '').trim(),
      role: String(fd.get('role') || '').trim(),
      code: String(fd.get('code') || '').trim(),
    }
    try {
      setSaving(true)
      if (selected && (selected.id || selected.employeeId)) {
        const id = selected.id ?? selected.employeeId
        const { apiPut } = await import('@/lib/api')
        await apiPut(`/employees/${id}`, payload)
        setItems(s => s.map(it => ((it.id ?? it.employeeId) === id ? { ...it, ...payload } : it)))
        toast({ title: 'Đã lưu', description: 'Nhân viên đã được cập nhật.' })
      } else {
        const { apiPost } = await import('@/lib/api')
        const created = await apiPost('/employees', payload)
        setItems(s => [created, ...s])
        toast({ title: 'Đã tạo', description: 'Nhân viên mới đã được thêm.' })
      }
      setPanelOpen(false)
      setSelected(null)
    } catch (err: any) {
      console.error(err)
      toast({ title: 'Lỗi', description: err?.message || String(err), variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const filtered = items.filter(i => {
    if (!query) return true
    const q = query.toLowerCase()
    return (i.fullName || i.name || '').toLowerCase().includes(q)
      || (i.email || '').toLowerCase().includes(q)
      || String(i.phone || '').includes(q)
      || (i.positionName || i.position || '').toLowerCase().includes(q)
  })

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold">Quản lý Nhân viên</h2>
          </div>
          <div className="flex items-center gap-2">
            <Input placeholder="Tìm kiếm tên, email, điện thoại, vị trí" value={query} onChange={(e) => setQuery(e.target.value)} />
            <Button onClick={() => openDetail()}>Thêm nhân viên</Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Danh sách nhân viên</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Đang tải...</div>
            ) : (
              <div className="bg-background rounded-lg border">
                {filtered.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground">Không có nhân viên.</div>
                ) : null}
                {filtered.map((c) => {
                  const id = c.id ?? c.employeeId
                  return (
                    <div key={id} className="flex items-center justify-between p-4 border-b last:border-b-0">
                      <div>
                        <div className="font-medium text-lg">{c.fullName || c.name || 'Không tên'}</div>
                        <div className="text-sm text-muted-foreground">{c.email || ''}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" onClick={() => openDetail(Number(id))}>Xem / Sửa</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(Number(id))}>Xóa</Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
        {/* Inline detail panel */}
        {panelOpen ? (
          <div className="fixed inset-y-0 right-0 w-full md:w-1/3 bg-background border-l p-6 overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{(selected && (selected.fullName || selected.name)) ? `Nhân viên: ${selected.fullName || selected.name}` : 'Nhân viên mới'}</h3>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => { setPanelOpen(false); setSelected(null) }}>Đóng</Button>
              </div>
            </div>
            <form onSubmit={handleSave as any} className="space-y-4">
              <div>
                <Label>Họ và tên</Label>
                <Input name="fullName" defaultValue={selected?.fullName || selected?.name || ''} />
              </div>
              <div>
                <Label>Email</Label>
                <Input name="email" type="email" defaultValue={selected?.email || ''} />
              </div>
              <div>
                <Label>Số điện thoại</Label>
                <Input name="phone" defaultValue={selected?.phone || ''} />
              </div>
              <div>
                <Label>Vị trí</Label>
                <Input name="positionName" defaultValue={selected?.positionName || selected?.position || ''} />
              </div>
              <div>
                <Label>Vai trò</Label>
                <Input name="role" defaultValue={selected?.role || ''} />
              </div>
              <div>
                <Label>Mã nhân viên</Label>
                <Input name="code" defaultValue={selected?.code || ''} />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</Button>
                <Button type="button" variant="outline" onClick={() => { setPanelOpen(false); setSelected(null) }}>Hủy</Button>
                {(selected && (selected.id || selected.employeeId)) ? (
                  <Button type="button" variant="destructive" onClick={() => handleDelete(Number(selected.id ?? selected.employeeId))}>Xóa</Button>
                ) : null}
              </div>
            </form>
          </div>
        ) : null}
      </main>
    </div>
  )
}
