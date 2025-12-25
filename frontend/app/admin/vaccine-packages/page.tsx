"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import type { VaccinePackage } from "@/lib/dbTypes"

export default function VaccinePackagesPage() {
  const [items, setItems] = useState<VaccinePackage[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const { apiGet } = await import('@/lib/api')
        const data = await apiGet('/vaccinepackages')
        if (Array.isArray(data)) setItems(data)
      } catch {}
      setLoading(false)
    })()
  }, [])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Vaccine Packages</h1>
        <p className="text-muted-foreground">Quản lý gói vaccine</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách gói</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <div>Đang tải...</div> : (
            <div className="space-y-2">
              {items.length === 0 ? <div className="text-muted-foreground">Không có gói nào.</div> : items.map(v => (
                <div key={v.packageId} className="p-3 border rounded flex justify-between items-center">
                  <div>
                    <div className="font-medium">{v.name}</div>
                    <div className="text-sm text-muted-foreground">Tháng: {v.durationMonths} — Giá: {v.price}</div>
                  </div>
                  <div>
                    <Button size="sm" onClick={() => router.push(`/admin/vaccine-packages/${v.packageId}`)}>Chi tiết</Button>
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
