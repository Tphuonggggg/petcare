"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function VetServiceDetailPage() {
  const params = useParams() as { id?: string }
  const router = useRouter()
  const id = params?.id
  const [service, setService] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    ;(async () => {
      setLoading(true)
      try {
        const { apiGet } = await import('@/lib/api')
        const data = await apiGet(`/services/${id}`)
        setService(data)
      } catch (err) {
        console.error(err)
      }
      setLoading(false)
    })()
  }, [id])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Chi tiết dịch vụ</h1>
        <p className="text-muted-foreground">Thông tin chi tiết dịch vụ.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{service?.name ?? (loading ? 'Đang tải...' : 'Không tìm thấy dịch vụ')}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <div>Đang tải...</div> : service ? (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">Mã: {service.serviceId ?? service.id}</div>
              <div className="font-medium">Giá: {service.price ?? service.cost ?? '—'}</div>
              {service.description && <div className="text-sm">{service.description}</div>}
              <div className="flex gap-2 mt-4">
                <button className="btn" onClick={() => router.back()}>Quay lại</button>
              </div>
            </div>
          ) : <div className="text-muted-foreground">Không tìm thấy dịch vụ.</div>}
        </CardContent>
      </Card>
    </div>
  )
}
