"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Mail, Phone, Building, User, Trash2, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api"
import DashboardBranchGate from '@/components/dashboard-branch-gate'

export default function DashboardEmployeesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', role: '', code: '' })
  const [panelOpen, setPanelOpen] = useState(false)
  const [selected, setSelected] = useState<any | null>(null)
  const [saving, setSaving] = useState(false)
  const [branchId, setBranchId] = useState<number | null>(null)
  const [branches, setBranches] = useState<any[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Load branches
  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        console.log('[EMPLOYEES] Loading branches...')
        const data = await apiGet('/branches?pageSize=100')
        console.log('[EMPLOYEES] Branches loaded:', data)
        if (mounted) {
          const items = Array.isArray(data) ? data : (data?.items || [])
          console.log('[EMPLOYEES] Setting branches, count:', items.length)
          setBranches(items)
        }
      } catch (e) {
        console.error('[EMPLOYEES] Failed to load branches', e)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setCurrentPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Load employees
  useEffect(() => {
    if (!branchId) return
    
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const url = `/employees?branchId=${branchId}&page=${currentPage}&pageSize=${pageSize}${debouncedSearchTerm ? `&search=${encodeURIComponent(debouncedSearchTerm)}` : ''}`
        const data = await apiGet(url)
        if (mounted) {
          const items = Array.isArray(data) ? data : (data?.items || [])
          setEmployees(items)
          setTotalCount(Array.isArray(data) ? data.length : (data?.totalCount || 0))
        }
      } catch (e) {
        console.error('Failed to load employees')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [branchId, currentPage, pageSize, debouncedSearchTerm])

  const filtered = employees.filter(e => {
    if (!debouncedSearchTerm) return true
    const q = debouncedSearchTerm.toLowerCase()
    return (e.fullName || '').toLowerCase().includes(q) || (e.email || '').toLowerCase().includes(q) || String(e.phone || '').includes(q) || (e.role || '').toLowerCase().includes(q)
  })

  const totalPages = branchId ? Math.ceil(totalCount / pageSize) : 0

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!branchId) {
      alert('Vui lòng chọn chi nhánh')
      return
    }
    try {
      const payload = { ...form, branchId }
      const created = await apiPost('/employees', payload)
      setEmployees(prev => [created, ...prev])
      setIsDialogOpen(false)
      setForm({ fullName: '', email: '', phone: '', role: '', code: '' })
    } catch (err) {
      console.error(err)
      alert('Tạo nhân viên thất bại')
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
      alert('Lưu thông tin thất bại')
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
      alert('Xóa nhân viên thất bại')
    }
  }

  return (
    <DashboardBranchGate>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Nhân viên</h1>
          <p className="text-muted-foreground mt-1">Quản lý nhân sự và phân công</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} disabled={!branchId}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm nhân viên
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex-shrink-0 w-full md:w-64">
          <Label htmlFor="branch-select" className="block mb-2 text-sm font-medium">Chọn Chi Nhánh</Label>
          <Select value={branchId?.toString() || ''} onValueChange={(v) => setBranchId(Number(v))}>
            <SelectTrigger id="branch-select">
              <SelectValue placeholder="Chọn chi nhánh" />
            </SelectTrigger>
            <SelectContent>
              {branches.map((b) => (
                <SelectItem key={b.branchId || b.id} value={(b.branchId || b.id).toString()}>
                  {b.name || b.branchName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="relative flex-1 min-w-0">
          <Label htmlFor="search-input" className="block mb-2 text-sm font-medium">Tìm Kiếm</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              id="search-input"
              placeholder="Tìm theo tên, email, số điện thoại, vị trí..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="pl-9" 
              disabled={!branchId}
            />
          </div>
        </div>
      </div>

      {branchId ? (
        <>
          <div className="text-sm text-muted-foreground">
            Tổng cộng <span className="font-semibold">{totalCount.toLocaleString()}</span> nhân viên
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {(loading ? [] : filtered).map((emp) => {
              const id = emp.employeeId ?? emp.id
              const name = emp.fullName ?? emp.name ?? 'Nhân viên'
              const email = emp.email ?? ''
              const phone = emp.phone ?? ''
              const role = emp.role ?? emp.position ?? '—'
              const branch = emp.branch ?? emp.branchName ?? ''
              return (
                <Card key={id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg flex items-center gap-2"><User className="h-5 w-5 text-muted-foreground" />{name}</h3>
                        <Badge className="mt-1">{role}</Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Mã</p>
                        <p className="text-sm font-bold text-primary">{emp.code ?? '—'}</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" /> <span className="truncate">{email}</span></div>
                      <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" /> <span>{phone}</span></div>
                      <div className="flex items-center gap-2 text-muted-foreground"><Building className="h-4 w-4" /> <span className="truncate">{branch}</span></div>
                    </div>

                    <div className="pt-4 border-t flex items-center justify-between gap-2">
                      <Button variant="outline" size="sm" onClick={() => openDetail(id)} className="flex-1">
                        <Eye className="h-4 w-4 mr-1" /> Xem
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                disabled={currentPage === 1 || loading}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                ← Trước
              </Button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Trang</span>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const page = Math.max(1, Math.min(totalPages, parseInt(e.target.value) || 1))
                    setCurrentPage(page)
                  }}
                  className="w-16 px-2 py-1 border rounded text-center"
                  disabled={loading}
                />
                <span className="text-sm text-muted-foreground">trên {totalPages.toLocaleString()}</span>
              </div>
              
              <Button
                variant="outline"
                disabled={currentPage === totalPages || loading}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >
                Sau →
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Vui lòng chọn chi nhánh để xem danh sách nhân viên</p>
        </div>
      )}

            {/* Detail panel */}
            {panelOpen ? (
              <div className="fixed inset-y-0 right-0 w-full md:w-1/3 bg-background border-l p-6 overflow-auto z-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Chi tiết nhân viên</h3>
                  <Button variant="ghost" onClick={() => { setPanelOpen(false); setSelected(null) }}>Đóng</Button>
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
    </DashboardBranchGate>
  )
}
