"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { VaccinePackage } from "@/lib/dbTypes"

export default function PackageDetail() {
  const params = useParams()
  const id = params?.id
  const router = useRouter()
  const [item, setItem] = useState<VaccinePackage | null>(null)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [duration, setDuration] = useState<number | ''>('')
  const [price, setPrice] = useState<number | ''>('')
  const [discount, setDiscount] = useState<number | ''>('')

  useEffect(() => {
    if (!id) return
    ;(async () => {
      setLoading(true)
      try {
        const { apiGet } = await import('@/lib/api')
        const data = await apiGet('/vaccinepackages/' + id)
        setItem(data)
        setName(data.name)
        setDuration(data.durationMonths)
        setPrice(data.price)
        setDiscount(data.discountPercent)
      } catch {}
      setLoading(false)
    })()
  }, [id])

  const save = async () => {
    try {
      const { apiPut } = await import('@/lib/api')
      await apiPut('/vaccinepackages/' + id, { name, durationMonths: Number(duration), price: Number(price), discountPercent: Number(discount) })
      alert('Lưu thành công')
      router.push('/admin/vaccine-packages')
    } catch { alert('Lưu thất bại') }
  }

  if (!id) return <div>Không hợp lệ</div>

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Chi tiết Gói Vaccine</h1>
          <p className="text-muted-foreground">ID: {id}</p>
        </div>
        <div>
          <Button variant="ghost" onClick={() => router.back()}>Quay lại</Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Thông tin gói</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <div>Đang tải...</div> : (
            <div className="space-y-3">
              <div>
                <Label>Tên</Label>
                <Input value={name} onChange={(e:any) => setName(e.target.value)} />
              </div>
              <div>
                <Label>Thời hạn (tháng)</Label>
                <Input value={duration ?? ''} onChange={(e:any) => setDuration(e.target.value ? Number(e.target.value) : '')} />
              </div>
              <div>
                <Label>Giá</Label>
                <Input value={price ?? ''} onChange={(e:any) => setPrice(e.target.value ? Number(e.target.value) : '')} />
              </div>
              <div>
                <Label>Giảm (%)</Label>
                <Input value={discount ?? ''} onChange={(e:any) => setDiscount(e.target.value ? Number(e.target.value) : '')} />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => save()}>Lưu</Button>
                <Button variant="ghost" onClick={() => router.push('/admin/vaccine-packages')}>Hủy</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
