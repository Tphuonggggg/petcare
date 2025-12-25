"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function VetServicesPage() {
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const { apiGet } = await import('@/lib/api')
        const data = await apiGet('/services')
        if (Array.isArray(data)) setServices(data)
      } catch {}
      setLoading(false)
    })()
  }, [])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dịch vụ</h1>
        <p className="text-muted-foreground">Danh sách dịch vụ mà bác sĩ có thể thực hiện.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dịch vụ</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <div>Đang tải...</div> : (
            <div className="space-y-3">
              {services.length === 0 ? <div className="text-muted-foreground">Không có dịch vụ.</div> : services.map(s => (
                <Link key={s.serviceId ?? s.id} href={`/vet/services/${s.serviceId ?? s.id}`} className="block p-3 border rounded-lg hover:bg-muted">
                  <div className="font-medium">{s.name}</div>
                  <div className="text-sm text-muted-foreground">Giá: {s.price ?? s.cost ?? '—'}</div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
