"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function AdminServicesPage() {
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const { apiGet } = await import('@/lib/api')
      const data = await apiGet('/services')
      if (Array.isArray(data)) setServices(data)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const create = async () => {
    if (!name) return alert('Nhập tên dịch vụ')
    try {
      const { apiPost } = await import('@/lib/api')
      await apiPost('/services', { name, price: price ? Number(price) : undefined, description })
      setName('')
      setPrice('')
      setDescription('')
      await load()
      alert('Đã tạo dịch vụ')
    } catch (err) {
      alert('Tạo thất bại')
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Quản lý Dịch vụ</h1>
        <p className="text-muted-foreground">Tạo, sửa, xóa dịch vụ.</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Tạo dịch vụ mới</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2">
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
              <Button onClick={() => create()}>Tạo</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách dịch vụ</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <div>Đang tải...</div> : (
            <div className="space-y-3">
              {services.length === 0 ? <div className="text-muted-foreground">Không có dịch vụ.</div> : services.map(s => (
                <div key={s.serviceId ?? s.id} className="p-3 border rounded-lg flex justify-between items-center">
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-sm text-muted-foreground">Giá: {s.price ?? '—'}</div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/admin/services/${s.serviceId ?? s.id}`} className="btn btn-sm">Sửa</Link>
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
