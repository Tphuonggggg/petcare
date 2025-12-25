"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import type { Vaccine } from "@/lib/dbTypes"

export default function VaccinesPage() {
  const [items, setItems] = useState<Vaccine[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const { apiGet } = await import('@/lib/api')
        const data = await apiGet('/vaccines')
        if (Array.isArray(data)) setItems(data)
      } catch {}
      setLoading(false)
    })()
  }, [])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Vaccine</h1>
        <p className="text-muted-foreground">Quản lý vaccine</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách vaccine</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <div>Đang tải...</div> : (
            <div className="space-y-2">
              {items.length === 0 ? <div className="text-muted-foreground">Không có vaccine.</div> : items.map(v => (
                <div key={v.vaccineId} className="p-3 border rounded flex justify-between items-center">
                  <div>
                    <div className="font-medium">{v.type}</div>
                    <div className="text-sm text-muted-foreground">{v.description}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">Liều chuẩn: {v.standardDose}</div>
                  <div>
                    <Button size="sm" onClick={() => router.push(`/admin/vaccines/${v.vaccineId}`)}>Chi tiết</Button>
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
