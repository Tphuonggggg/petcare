"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from '@/hooks/use-toast'

type EmployeeType = any

export default function AdminEmployeesPage() {
  
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [panelOpen, setPanelOpen] = useState(false)
  const [selected, setSelected] = useState<EmployeeType | null>(null)
  const [saving, setSaving] = useState(false)
  const [branches, setBranches] = useState<any[]>([])
  const [positions, setPositions] = useState<any[]>([])
  const [branchId, setBranchId] = useState<number | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [editGender, setEditGender] = useState('Male')
  const [editPositionId, setEditPositionId] = useState<number | null>(null)

  // Load branches
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        console.log('[ADMIN EMPLOYEES] Loading branches...')
        const { apiGet } = await import('@/lib/api')
        const data = await apiGet('/branches?pageSize=100')
        console.log('[ADMIN EMPLOYEES] Branches loaded:', data)
        if (mounted) {
          const items = Array.isArray(data) ? data : (data?.items || [])
          console.log('[ADMIN EMPLOYEES] Setting branches, count:', items.length)
          setBranches(items)
          if (items.length > 0) {
            setBranchId(items[0].branchId || items[0].id)
          }
        }
      } catch (e) {
        console.error('[ADMIN EMPLOYEES] Failed to load branches:', e)
      }
    })()
    return () => { mounted = false }
  }, [])

  // Load positions
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        console.log('[ADMIN EMPLOYEES] Loading positions...')
        const { apiGet } = await import('@/lib/api')
        const data = await apiGet('/positions?pageSize=100')
        console.log('[ADMIN EMPLOYEES] Positions loaded:', data)
        if (mounted) {
          const items = Array.isArray(data) ? data : (data?.items || [])
          console.log('[ADMIN EMPLOYEES] Setting positions, count:', items.length)
          setPositions(items)
          if (items.length > 0 && !editPositionId) {
            setEditPositionId(items[0].positionId || items[0].id)
          }
        }
      } catch (e) {
        console.error('[ADMIN EMPLOYEES] Failed to load positions:', e)
      }
    })()
    return () => { mounted = false }
  }, [])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('[ADMIN EMPLOYEES] Debounced search:', query)
      setDebouncedQuery(query)
      setCurrentPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    if (!branchId) return
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        const { apiGet } = await import('@/lib/api')
        const url = `/employees?branchId=${branchId}&page=${currentPage}&pageSize=${pageSize}${debouncedQuery ? `&search=${encodeURIComponent(debouncedQuery)}` : ''}`
        console.log('[ADMIN EMPLOYEES] Fetching from:', url)
        const res = await apiGet(url)
        console.log('[ADMIN EMPLOYEES] Response:', res)
        if (!mounted) return
        if (Array.isArray(res)) {
          setItems(res)
          setTotalCount(res.length)
        } else if (res?.items) {
          setItems(res.items)
          setTotalCount(res.totalCount || 0)
        }
      } catch (err) {
        console.error('[ADMIN EMPLOYEES] Error:', err)
        toast({ title: 'Lỗi', description: 'Không thể tải danh sách nhân viên', variant: 'destructive' })
      } finally {
        setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [branchId, currentPage, pageSize, debouncedQuery])

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
      setSelected({ branchId, positionId: editPositionId }) // Set current branch and position
      setEditGender('Male')
      setPanelOpen(true)
      return
    }
    try {
      const { apiGet } = await import('@/lib/api')
      const data = await apiGet(`/employees/${id}`)
      setSelected(data || null)
      setEditGender(data?.gender || 'Male')
      setEditPositionId(data?.positionId || editPositionId)
      setPanelOpen(true)
    } catch (err) {
      console.error(err)
      toast({ title: 'Lỗi', description: 'Không thể tải nhân viên', variant: 'destructive' })
    }
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const id = selected?.id ?? selected?.employeeId
    
    const payload: any = {
      employeeId: id, // Backend PUT endpoint requires this
      fullName: String(fd.get('fullName') || '').trim(),
      birthDate: fd.get('birthDate') ? String(fd.get('birthDate')) : null,
      gender: editGender, // Use state value instead of form data
      hireDate: fd.get('hireDate') ? String(fd.get('hireDate')) : null,
      baseSalary: fd.get('baseSalary') ? parseFloat(String(fd.get('baseSalary'))) : null,
      // Keep existing relations
      branchId: branchId, // Use current selected branch
      positionId: editPositionId, // Use selected position
    }
    
    // Remove only optional null values (birthDate is optional)
    if (payload.birthDate === null) delete payload.birthDate
    if (payload.baseSalary === null) delete payload.baseSalary
    
    console.log('[ADMIN EMPLOYEES] Saving payload:', payload)
    
    try {
      setSaving(true)
      if (selected && id) {
        const { apiPut } = await import('@/lib/api')
        await apiPut(`/employees/${id}`, payload)
        setItems(s => s.map(it => ((it.id ?? it.employeeId) === id ? { ...it, ...payload } : it)))
        toast({ title: 'Đã lưu', description: 'Thông tin nhân viên đã được cập nhật.' })
      } else {
        const { apiPost } = await import('@/lib/api')
        const created = await apiPost('/employees', payload)
        setItems(s => [created, ...s])
        toast({ title: 'Đã tạo', description: 'Nhân viên mới đã được thêm.' })
      }
      setPanelOpen(false)
      setSelected(null)
    } catch (err: any) {
      console.error('[ADMIN EMPLOYEES] Save failed:', err)
      toast({ title: 'Lỗi', description: err?.message || String(err), variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-6">
          <h2 className="text-2xl font-bold mb-4">Quản lý Nhân viên</h2>
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
              <Input 
                id="search-input"
                placeholder="Tìm theo tên, email, số điện thoại, vị trí..." 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                disabled={!branchId}
              />
            </div>

            <div className="flex-shrink-0">
              <Button onClick={() => openDetail()} disabled={!branchId} className="w-full md:w-auto">Thêm nhân viên</Button>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {branchId ? (
          <Card>
            <CardHeader>
              <CardTitle>Danh sách nhân viên ({totalCount.toLocaleString()})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div>Đang tải...</div>
              ) : (
                <div className="bg-background rounded-lg border">
                  {items.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground">Không có nhân viên.</div>
                  ) : null}
                  {items.map((c) => {
                    const id = c.id ?? c.employeeId
                    return (
                      <div key={id} className="flex items-center justify-between p-4 border-b last:border-b-0">
                        <div>
                          <div className="font-medium text-lg">{c.fullName || c.name || 'Không tên'}</div>
                          <div className="text-sm text-muted-foreground">{c.email || ''}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button variant="outline" size="sm" onClick={() => openDetail(Number(id))}>Xem / Sửa</Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {totalCount > pageSize && (
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
                      max={Math.ceil(totalCount / pageSize)}
                      value={currentPage}
                      onChange={(e) => {
                        const page = Math.max(1, Math.min(Math.ceil(totalCount / pageSize), parseInt(e.target.value) || 1))
                        setCurrentPage(page)
                      }}
                      className="w-16 px-2 py-1 border rounded text-center"
                      disabled={loading}
                    />
                    <span className="text-sm text-muted-foreground">trên {Math.ceil(totalCount / pageSize)}</span>
                  </div>
                  
                  <Button
                    variant="outline"
                    disabled={currentPage === Math.ceil(totalCount / pageSize) || loading}
                    onClick={() => setCurrentPage(p => Math.min(Math.ceil(totalCount / pageSize), p + 1))}
                  >
                    Sau →
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Vui lòng chọn chi nhánh để xem danh sách nhân viên</p>
            </CardContent>
          </Card>
        )}
        {/* Inline detail panel */}
        {panelOpen ? (
          <div className="fixed inset-y-0 right-0 w-full md:w-1/3 bg-background border-l p-6 overflow-auto z-50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">{(selected && (selected.fullName || selected.name)) ? `${selected.fullName || selected.name}` : 'Chi tiết nhân viên'}</h3>
              <Button variant="ghost" onClick={() => { setPanelOpen(false); setSelected(null); setEditGender('Male') }}>Đóng</Button>
            </div>
            {selected ? (
              <form onSubmit={handleSave as any} className="space-y-6">
                {/* Thông tin cơ bản */}
                <div className="space-y-4">
                  <h4 className="font-semibold border-b pb-2">Thông Tin Cơ Bản</h4>
                  <div>
                    <Label>Họ và tên</Label>
                    <Input name="fullName" defaultValue={selected?.fullName || selected?.name || ''} required />
                  </div>
                  <div>
                    <Label>Ngày sinh</Label>
                    <Input name="birthDate" type="date" defaultValue={selected?.birthDate || ''} />
                  </div>
                  <div>
                    <Label>Giới tính</Label>
                    <Select value={editGender} onValueChange={setEditGender}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Nam</SelectItem>
                        <SelectItem value="Female">Nữ</SelectItem>
                        <SelectItem value="Other">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Ngày bắt đầu làm việc</Label>
                    <Input 
                      name="hireDate" 
                      type="date" 
                      defaultValue={selected?.hireDate || new Date().toISOString().split('T')[0]} 
                      required
                    />
                  </div>
                </div>

                {/* Thông tin công việc */}
                <div className="space-y-4">
                  <h4 className="font-semibold border-b pb-2">Thông Tin Công Việc</h4>
                  <div>
                    <Label>Vị trí</Label>
                    <Select value={editPositionId?.toString() || ''} onValueChange={(v) => setEditPositionId(Number(v))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn vị trí" />
                      </SelectTrigger>
                      <SelectContent>
                        {positions.map((p) => (
                          <SelectItem key={p.positionId || p.id} value={(p.positionId || p.id).toString()}>
                            {p.name || p.positionName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Chi nhánh</Label>
                    <Input 
                      name="branchName" 
                      defaultValue={branches.find(b => (b.branchId || b.id) === branchId)?.name || 'N/A'} 
                      disabled
                    />
                  </div>
                  <div>
                    <Label>Lương cơ bản</Label>
                    <Input name="baseSalary" type="number" defaultValue={selected?.baseSalary || 0} step="0.01" />
                  </div>
                </div>

                {/* Nút hành động */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button type="submit" className="flex-1" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</Button>
                  <Button type="button" variant="outline" onClick={() => { setPanelOpen(false); setSelected(null); setEditGender('Male'); setEditPositionId(positions[0]?.positionId || positions[0]?.id || null) }}>Hủy</Button>
                </div>
              </form>
            ) : (
              <div className="py-8 text-center text-muted-foreground">Đang tải thông tin...</div>
            )}
          </div>
        ) : null}
      </main>
    </div>
  )
}
