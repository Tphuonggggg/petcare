"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Vaccine } from "@/lib/dbTypes"

export default function VaccineDetail() {
  const params = useParams()
  const id = params?.id
  const router = useRouter()
  const [item, setItem] = useState<Vaccine | null>(null)
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState('')
  const [desc, setDesc] = useState('')
  const [dose, setDose] = useState<number | ''>('')

  useEffect(() => {
    if (!id) return
    ;(async () => {
      setLoading(true)
      try {
        const { apiGet } = await import('@/lib/api')
        const data = await apiGet('/vaccines/' + id)
        setItem(data)
        setType(data.type)
        setDesc(data.description)
        setDose(data.standardDose)
      } catch {}
      setLoading(false)
    })()
  }, [id])

  const save = async () => {
    try {
      const { apiPut } = await import('@/lib/api')
      await apiPut('/vaccines/' + id, { type, description: desc, standardDose: Number(dose) })
      alert('Lưu thành công')
      router.push('/admin/vaccines')
    } catch (e) { alert('Lưu thất bại') }
  }

  if (!id) return <div>Không hợp lệ</div>

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Chi tiết Vaccine</h1>
          <p className="text-muted-foreground">ID: {id}</p>
        </div>
        <div>
          <Button variant="ghost" onClick={() => router.back()}>Quay lại</Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Thông tin vaccine</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <div>Đang tải...</div> : (
            <div className="space-y-3">
              <div>
                <Label>Tên loại</Label>
                <Input value={type} onChange={(e:any) => setType(e.target.value)} />
              </div>
              <div>
                <Label>Mô tả</Label>
                <Input value={desc ?? ''} onChange={(e:any) => setDesc(e.target.value)} />
              </div>
              <div>
                <Label>Liều chuẩn</Label>
                <Input value={dose ?? ''} onChange={(e:any) => setDose(e.target.value ? Number(e.target.value) : '')} />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => save()}>Lưu</Button>
                <Button variant="ghost" onClick={() => router.push('/admin/vaccines')}>Hủy</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
