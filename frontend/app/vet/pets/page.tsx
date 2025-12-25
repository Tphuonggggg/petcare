"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function VetPetsPage() {
  const [pets, setPets] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const branchId = localStorage.getItem('selected_branch_id')
        const { apiGet } = await import('@/lib/api')
        const data = branchId ? await apiGet('/pets?branchId=' + encodeURIComponent(branchId)) : await apiGet('/pets')
        if (Array.isArray(data)) setPets(data)
      } catch {}
      setLoading(false)
    })()
  }, [])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Thú cưng</h1>
        <p className="text-muted-foreground">Danh sách thú cưng liên quan đến chi nhánh.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách thú cưng</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <div>Đang tải...</div> : (
            <div className="space-y-3">
              {pets.length === 0 ? <div className="text-muted-foreground">Không có thú cưng.</div> : pets.map(p => (
                <div key={p.petId ?? p.id} className="p-3 border rounded-lg flex justify-between items-center">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-sm text-muted-foreground">{p.species ?? ''} — {p.breed ?? ''}</div>
                  </div>
                  <div>
                    <Button size="sm" onClick={() => router.push(`/vet/pets/${p.petId ?? p.id}`)}>Xem hồ sơ</Button>
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
