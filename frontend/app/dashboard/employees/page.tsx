"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Mail, Phone, Building, User } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api"

const mockEmployees = [
  { employeeId: 1, fullName: 'Nhân viên Tiếp tân 1', email: 'receptionist@petcare.vn', phone: '0900000001', role: 'Tiếp tân', branch: 'Chi nhánh Quận 1', code: 'EMP001' },
  { employeeId: 2, fullName: 'Bác sĩ Thú y', email: 'vet@petcare.vn', phone: '0900000002', role: 'Bác sĩ', branch: 'Chi nhánh Quận 1', code: 'EMP002' },
  { employeeId: 3, fullName: 'Quản lý', email: 'manager@petcare.vn', phone: '0900000003', role: 'Quản lý', branch: 'Chi nhánh Quận 3', code: 'MGR001' },
]

export default function DashboardEmployeesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [employees, setEmployees] = useState<any[]>(mockEmployees)
  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', role: '', code: '' })
  const [panelOpen, setPanelOpen] = useState(false)
  const [selected, setSelected] = useState<any | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const data = await apiGet('/employees')
        if (mounted && Array.isArray(data)) setEmployees(data)
      } catch (e) {
        // keep mock data
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const filtered = employees.filter(e => {
    if (!searchTerm) return true
    const q = searchTerm.toLowerCase()
    return (e.fullName || '').toLowerCase().includes(q) || (e.email || '').toLowerCase().includes(q) || String(e.phone || '').includes(q) || (e.role || '').toLowerCase().includes(q)
  })

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    try {
      // optimistic: call apiPost if available
      const payload = { ...form }
      try {
        const created = await apiPost('/employees', payload)
        setEmployees(prev => [created, ...prev])
      } catch {
        setEmployees(prev => [{ employeeId: Date.now(), ...payload }, ...prev])
      }
      setIsDialogOpen(false)
      setForm({ fullName: '', email: '', phone: '', role: '', code: '' })
    } catch (err) {
      console.error(err)
    }
  }

  async function openDetail(id?: number) {
    if (!id) {
      setSelected({})
      setPanelOpen(true)
      return
    }
    try {
      const data = await apiGet(`/employees/${id}`)
      setSelected(data || null)
      setPanelOpen(true)
    } catch (err) {
      console.error(err)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!selected) return
    const fd = new FormData(e.currentTarget as HTMLFormElement)
    const payload: any = {
      fullName: String(fd.get('fullName') || '').trim(),
      email: String(fd.get('email') || '').trim(),
      phone: String(fd.get('phone') || '').trim(),
      positionName: String(fd.get('positionName') || fd.get('role') || '').trim(),
      code: String(fd.get('code') || '').trim(),
    }
    try {
      setSaving(true)
      const id = selected.employeeId ?? selected.id
      if (id) {
        await apiPut(`/employees/${id}`, payload)
        setEmployees(prev => prev.map(it => ((it.employeeId ?? it.id) === id ? { ...it, ...payload } : it)))
      }
      setPanelOpen(false)
      setSelected(null)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id?: number) {
    if (!id) return
    if (!confirm('Xác nhận xóa nhân viên?')) return
    try {
      await apiDelete(`/employees/${id}`)
      setEmployees(prev => prev.filter(it => (it.employeeId ?? it.id) !== id))
      if (selected && (selected.employeeId ?? selected.id) === id) {
        setSelected(null)
        setPanelOpen(false)
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Nhân viên</h1>
          <p className="text-muted-foreground mt-1">Quản lý nhân sự và phân công</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm nhân viên
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Tìm kiếm theo tên, email, số điện thoại, vị trí..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(loading ? [] : filtered).map((emp) => {
          const id = emp.employeeId ?? emp.id
          const name = emp.fullName ?? emp.name ?? 'Nhân viên'
          const email = emp.email ?? ''
          const phone = emp.phone ?? ''
          const role = emp.role ?? emp.position ?? '—'
          const branch = emp.branch ?? emp.branchName ?? ''
          return (
            <Card key={id} onClick={() => openDetail(id)} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2"><User className="h-5 w-5 text-muted-foreground" />{name}</h3>
                    <Badge className="mt-1">{role}</Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Mã</p>
                    <p className="text-lg font-bold text-primary">{emp.code ?? '—'}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" /> <span>{email}</span></div>
                  <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" /> <span>{phone}</span></div>
                  <div className="flex items-center gap-2 text-muted-foreground"><Building className="h-4 w-4" /> <span>{branch}</span></div>
                </div>

                      <div className="pt-4 border-t flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Vai trò: {role}</span>
                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); openDetail(id) }}>Xem chi tiết</Button>
                      </div>
              </div>
            </Card>
          )
        })}
      </div>

            {/* Inline right-side panel */}
            {panelOpen ? (
              <div className="fixed inset-y-0 right-0 w-full md:w-1/3 bg-background border-l p-6 overflow-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">{(selected && (selected.fullName || selected.name)) ? `Nhân viên: ${selected.fullName || selected.name}` : 'Nhân viên'}</h3>
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => { setPanelOpen(false); setSelected(null) }}>Đóng</Button>
                  </div>
                </div>
                {selected ? (
                  <form onSubmit={handleSave as any} className="space-y-4">
                    <div>
                      <Label>Họ và tên</Label>
                      <Input name="fullName" defaultValue={selected.fullName || selected.name || ''} />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input name="email" type="email" defaultValue={selected.email || ''} />
                    </div>
                    <div>
                      <Label>Số điện thoại</Label>
                      <Input name="phone" defaultValue={selected.phone || ''} />
                    </div>
                    <div>
                      <Label>Vị trí</Label>
                      <Input name="positionName" defaultValue={selected.positionName || selected.role || ''} />
                    </div>
                    <div>
                      <Label>Mã nhân viên</Label>
                      <Input name="code" defaultValue={selected.code || ''} />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</Button>
                      <Button type="button" variant="outline" onClick={() => { setPanelOpen(false); setSelected(null) }}>Hủy</Button>
                      <Button type="button" variant="destructive" onClick={() => handleDelete(selected.employeeId ?? selected.id)}>Xóa</Button>
                    </div>
                  </form>
                ) : (
                  <div>Đang tải...</div>
                )}
              </div>
            ) : null}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm nhân viên mới</DialogTitle>
            <DialogDescription>Nhập thông tin nhân viên</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Họ và tên</Label>
              <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Số điện thoại</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Vị trí / Vai trò</Label>
              <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Mã nhân viên</Label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">Hủy</Button>
              <Button type="submit" className="flex-1">Lưu</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
