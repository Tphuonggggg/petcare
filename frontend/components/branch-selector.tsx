"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function BranchSelector({ onSelected }: { onSelected?: (b: any) => void }) {
  const [branches, setBranches] = useState<any[]>([])
  const [selected, setSelected] = useState<string | number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { apiGet } = await import('@/lib/api')
        const data = await apiGet('/branches')
        if (!mounted) return
        setBranches(Array.isArray(data) ? data : [])
      } catch (err) {
        // fallback to empty
        setBranches([])
      } finally { if (mounted) setLoading(false) }
    })()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    try {
      const id = localStorage.getItem('selected_branch_id')
      if (id) setSelected(Number(id))
    } catch {}
  }, [])

  function save() {
    const b = branches.find((x) => String(x.id || x.branchId) === String(selected))
    const id = selected
    const name = b ? (b.name || b.displayName || b.branchName) : ''
    try {
      localStorage.setItem('selected_branch_id', String(id))
      localStorage.setItem('selected_branch_name', String(name))
      window.dispatchEvent(new CustomEvent('branch-changed', { detail: { id, name } }))
    } catch {}
    if (onSelected) onSelected(b)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Chọn chi nhánh</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Chi nhánh</label>
            <select className="w-full rounded-md border px-3 py-2" value={selected ?? ''} onChange={(e) => setSelected(e.target.value)}>
              <option value="">-- Chọn chi nhánh --</option>
              {branches.map((b) => (
                <option key={b.id ?? b.branchId} value={b.id ?? b.branchId}>{b.name ?? b.branchName}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <Button onClick={save} disabled={!selected}>{loading ? 'Đang tải...' : 'Chọn'}</Button>
            <Button variant="ghost" onClick={() => { localStorage.removeItem('selected_branch_id'); localStorage.removeItem('selected_branch_name'); window.dispatchEvent(new CustomEvent('branch-changed', { detail: null })) }}>Xóa</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
