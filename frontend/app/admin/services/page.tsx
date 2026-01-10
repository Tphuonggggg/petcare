"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

export default function AdminServicesPage() {
  const router = useRouter()
  const { toast } = useToast()
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
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách dịch vụ",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const create = async () => {
    if (!name) {
      toast({
        title: "Lỗi",
        description: "Nhập tên dịch vụ",
        variant: "destructive",
      })
      return
    }
    try {
      const { apiPost } = await import('@/lib/api')
      await apiPost('/services', { Name: name, BasePrice: price ? Number(price) : undefined, Description: description })
      setName('')
      setPrice('')
      setDescription('')
      await load()
      toast({
        title: "Thành công",
        description: "Đã tạo dịch vụ",
      })
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: err?.message || "Tạo thất bại",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (serviceId: number) => {
    router.push(`/admin/services/${serviceId}`)
  }

  const handleDelete = async (serviceId: number) => {
    if (!confirm('Xóa dịch vụ này?')) return
    try {
      const { apiDelete } = await import('@/lib/api')
      await apiDelete(`/services/${serviceId}`)
      await load()
      toast({
        title: "Thành công",
        description: "Đã xóa dịch vụ",
      })
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: err?.message || "Xóa thất bại",
        variant: "destructive",
      })
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
                <div key={s.ServiceId ?? s.serviceId ?? s.id} className="p-3 border rounded-lg flex justify-between items-center">
                  <div>
                    <div className="font-medium">{s.Name ?? s.name}</div>
                    <div className="text-sm text-muted-foreground">Giá: {s.BasePrice ?? s.price ?? s.basePrice ?? '—'}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm"
                      onClick={() => handleEdit(s.ServiceId ?? s.serviceId ?? s.id)}
                    >
                      Chỉnh sửa
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDelete(s.ServiceId ?? s.serviceId ?? s.id)}
                    >
                      Xóa
                    </Button>
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
