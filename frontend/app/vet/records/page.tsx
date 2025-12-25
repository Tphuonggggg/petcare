"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export default function VetRecordsPage() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingNote, setEditingNote] = useState('')

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const branchId = localStorage.getItem('selected_branch_id')
        const { apiGet } = await import('@/lib/api')
        const data = branchId ? await apiGet('/vetrecords?branchId=' + encodeURIComponent(branchId)) : await apiGet('/vetrecords')
        if (Array.isArray(data)) setRecords(data)
      } catch {}
      setLoading(false)
    })()
  }, [])

  const startEdit = (r: any) => {
    const id = r?.recordId ?? r?.id
    setEditingId(id)
    setEditingNote(r.notes || '')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingNote('')
  }

  const saveEdit = async () => {
    if (!editingId) return
    try {
      const { apiPut, apiGet } = await import('@/lib/api')
      await apiPut('/vetrecords/' + editingId, { notes: editingNote })
      const branchId = localStorage.getItem('selected_branch_id')
      const rec = branchId ? await apiGet('/vetrecords?branchId=' + encodeURIComponent(branchId)) : await apiGet('/vetrecords')
      if (Array.isArray(rec)) setRecords(rec)
      cancelEdit()
      alert('Cập nhật thành công')
    } catch (err) {
      alert('Cập nhật thất bại')
    }
  }

  const deleteRecord = async (rid: number) => {
    if (!confirm('Xóa ghi chú này?')) return
    try {
      const { apiDelete, apiGet } = await import('@/lib/api')
      await apiDelete('/vetrecords/' + rid)
      const branchId = localStorage.getItem('selected_branch_id')
      const rec = branchId ? await apiGet('/vetrecords?branchId=' + encodeURIComponent(branchId)) : await apiGet('/vetrecords')
      if (Array.isArray(rec)) setRecords(rec)
      alert('Đã xóa')
    } catch (err) {
      alert('Xóa thất bại')
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Ghi chú y tế</h1>
        <p className="text-muted-foreground">Ghi chú khám chữa bệnh theo chi nhánh.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ghi chú</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <div>Đang tải...</div> : (
            <div className="space-y-3">
              {records.length === 0 ? <div className="text-muted-foreground">Không có ghi chú.</div> : records.map(r => (
                <div key={r.recordId ?? r.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="text-sm text-muted-foreground">{new Date(r.createdAt).toLocaleString()} — {r.vetEmail ?? ''}</div>
                    <div className="flex gap-2">
                      <button className="btn btn-sm" onClick={() => startEdit(r)}>Chỉnh sửa</button>
                      <button className="btn btn-sm btn-ghost" onClick={() => deleteRecord(r.recordId ?? r.id)}>Xóa</button>
                    </div>
                  </div>
                  <div className="mt-1">
                    {editingId === (r.recordId ?? r.id) ? (
                      <div className="space-y-2">
                        <Textarea value={editingNote} onChange={(e:any) => setEditingNote(e.target.value)} />
                        <div className="flex gap-2">
                          <Button onClick={() => saveEdit()}>Lưu</Button>
                          <Button variant="ghost" onClick={() => cancelEdit()}>Hủy</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="font-medium">Pet #{r.petId ?? r.pet} {r.petName ? `- ${r.petName}` : ''}</div>
                        <div className="mt-1">{r.notes}</div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
