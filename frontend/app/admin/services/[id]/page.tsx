"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function AdminServiceDetail() {
  const params = useParams()
  const id = params?.id
  const router = useRouter()
  const [service, setService] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (!id) return
    ;(async () => {
      setLoading(true)
      try {
        const { apiGet } = await import('@/lib/api')
        const data = await apiGet('/services/' + id)
        setService(data)
        setName(data?.name || '')
        setPrice(data?.price ? String(data.price) : '')
        setDescription(data?.description || '')
      } catch (err) {
        console.error(err)
      }
      setLoading(false)
    })()
  }, [id])

  const save = async () => {
    if (!id) return
    try {
      const { apiPut } = await import('@/lib/api')
      await apiPut('/services/' + id, { name, price: price ? Number(price) : undefined, description })
      alert('Đã lưu')
      router.push('/admin/services')
    } catch {
      alert('Lưu thất bại')
    }
  }

  const remove = async () => {
    if (!id || !confirm('Xóa dịch vụ này?')) return
    try {
      const { apiDelete } = await import('@/lib/api')
      await apiDelete('/services/' + id)
      alert('Đã xóa')
      router.push('/admin/services')
    } catch {
      alert('Xóa thất bại')
    }
  }

  if (!id) return <div>Không tìm thấy ID</div>

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sửa dịch vụ</h1>
          <p className="text-muted-foreground">ID: {id}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin dịch vụ</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <div>Đang tải...</div> : (
            <div className="space-y-3">
              <div>
                <Label>Tên</Label>
                <input className="w-full border px-2 py-1 rounded" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label>Giá</Label>
                <input className="w-full border px-2 py-1 rounded" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>
              <div>
                <Label>Mô tả</Label>
                <Textarea value={description} onChange={(e:any) => setDescription(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => save()}>Lưu</Button>
                <Button variant="destructive" onClick={() => remove()}>Xóa</Button>
                <Button variant="ghost" onClick={() => router.back()}>Hủy</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
