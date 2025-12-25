"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function PetDetailPage() {
  const params = useParams()
  const id = params?.id
  const [pet, setPet] = useState<any | null>(null)
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [note, setNote] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingNote, setEditingNote] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (!id) return
    ;(async () => {
      setLoading(true)
      try {
        const { apiGet } = await import('@/lib/api')
        try {
          const p = await apiGet('/pets/' + id)
          setPet(p)
        } catch {}
        try {
          const rec = await apiGet('/vetrecords?petId=' + encodeURIComponent(String(id)))
          if (Array.isArray(rec)) setRecords(rec)
        } catch {}
      } catch {}
      setLoading(false)
    })()
  }, [id])

  const saveNote = async () => {
    if (!id) return alert('Missing pet id')
    try {
      const vetEmail = JSON.parse(localStorage.getItem('user') || '{}').email
      const branchId = localStorage.getItem('selected_branch_id')
      const { apiPost, apiGet } = await import('@/lib/api')
      await apiPost('/vetrecords', { petId: Number(id), petName: pet?.name ?? '', notes: note, branchId: branchId ? Number(branchId) : undefined, vetEmail })
      const rec = await apiGet('/vetrecords?petId=' + encodeURIComponent(String(id)))
      if (Array.isArray(rec)) setRecords(rec)
      setNote('')
      alert('Ghi chú đã lưu')
    } catch (err) {
      alert('Lưu thất bại')
    }
  }

  const startEdit = (r: any) => {
    setEditingId(r.id)
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
      const rec = await apiGet('/vetrecords?petId=' + encodeURIComponent(String(id)))
      if (Array.isArray(rec)) setRecords(rec)
      cancelEdit()
      alert('Ghi chú đã được cập nhật')
    } catch (err) {
      alert('Cập nhật thất bại')
    }
  }

  const deleteRecord = async (rid: number) => {
    if (!confirm('Xóa ghi chú này?')) return
    try {
      const { apiDelete, apiGet } = await import('@/lib/api')
      await apiDelete('/vetrecords/' + rid)
      const rec = await apiGet('/vetrecords?petId=' + encodeURIComponent(String(id)))
      if (Array.isArray(rec)) setRecords(rec)
      alert('Đã xóa')
    } catch (err) {
      alert('Xóa thất bại')
    }
  }

  if (!id) return <div>Không tìm thấy Pet ID</div>

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hồ sơ thú cưng</h1>
          <p className="text-muted-foreground">ID: {id}</p>
        </div>
        <div>
          <Button variant="ghost" onClick={() => router.back()}>Quay lại</Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Thông tin</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <div>Đang tải...</div> : (
            <div>
              <div className="font-medium">{pet?.name ?? '—'}</div>
              <div className="text-sm text-muted-foreground">{pet?.species ?? ''} — {pet?.breed ?? ''}</div>
              <div className="text-sm text-muted-foreground">Owner ID: {pet?.customerId ?? '—'}</div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Thêm ghi chú y tế</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <Label>Ghi chú</Label>
              <Textarea value={note} onChange={(e:any) => setNote(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => saveNote()}>Lưu ghi chú</Button>
              <Button variant="ghost" onClick={() => setNote('')}>Hủy</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ghi chú trước đây</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? <div className="text-muted-foreground">Chưa có ghi chú.</div> : records.map(r => (
            <div key={r.id} className="p-3 border rounded-lg mb-2">
              <div className="flex justify-between items-start">
                <div className="text-sm text-muted-foreground">{new Date(r.createdAt).toLocaleString()} — {r.vetEmail ?? ''}</div>
                <div className="flex gap-2">
                  <button className="btn btn-sm" onClick={() => startEdit(r)}>Chỉnh sửa</button>
                  <button className="btn btn-sm btn-ghost" onClick={() => deleteRecord(r.id)}>Xóa</button>
                </div>
              </div>
              <div className="mt-2">
                {editingId === r.id ? (
                  <div className="space-y-2">
                    <Textarea value={editingNote} onChange={(e:any) => setEditingNote(e.target.value)} />
                    <div className="flex gap-2">
                      <Button onClick={() => saveEdit()}>Lưu</Button>
                      <Button variant="ghost" onClick={() => cancelEdit()}>Hủy</Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-1">{r.notes}</div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
