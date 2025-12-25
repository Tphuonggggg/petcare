"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PawPrint, ArrowLeft } from "lucide-react"

type PetItem = {
  petId: number
  name: string
  species?: string
  breed?: string
  customerId?: number
}

export default function VetPage() {
  const router = useRouter()
  const [branchName, setBranchName] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const branchId = localStorage.getItem('selected_branch_id')
        setBranchName(localStorage.getItem('selected_branch_name'))
        // load today's bookings for this branch (or fallback to selected branch)
        try {
          const { apiGet } = await import('@/lib/api')
          const today = new Date().toISOString().slice(0,10)
          const q = branchId ? `?branchId=${encodeURIComponent(branchId)}&date=${today}` : `?date=${today}`
          const bk = await apiGet('/bookings' + q)
          if (Array.isArray(bk)) setBookings(bk)
        } catch {}
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    load()
    const onBranchChanged = (e: any) => {
      setBranchName(e?.detail?.name ?? localStorage.getItem('selected_branch_name'))
      ;(async () => {
        try {
          const branchId = localStorage.getItem('selected_branch_id')
          const today = new Date().toISOString().slice(0,10)
          const { apiGet } = await import('@/lib/api')
          const q = branchId ? `?branchId=${encodeURIComponent(branchId)}&date=${today}` : `?date=${today}`
          const bk = await apiGet('/bookings' + q)
          if (Array.isArray(bk)) setBookings(bk)
        } catch {}
      })()
    }
    window.addEventListener('branch-changed', onBranchChanged as EventListener)
    return () => window.removeEventListener('branch-changed', onBranchChanged as EventListener)
  }, [])

  const [bookings, setBookings] = useState<any[]>([])
  const [vetRecords, setVetRecords] = useState<any[]>([])

  return (
    <div className="bg-muted/30">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Lịch hôm nay — {branchName ?? 'Tất cả chi nhánh'}</h1>
          <p className="text-muted-foreground">Các cuộc hẹn đã đặt cho hôm nay. Nhấn "Xem chi tiết" để mở hồ sơ và viết bệnh án.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cuộc hẹn hôm nay</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <div>Đang tải...</div> : (
              <div className="space-y-3">
                {bookings.length === 0 ? <div className="text-muted-foreground">Không có cuộc hẹn hôm nay.</div> : bookings.map(b => {
                  const id = b?.bookingId ?? b?.id
                  const serviceName = b?.serviceName ?? b?.service ?? b?.service?.name ?? 'Dịch vụ'
                  const date = b?.date ?? b?.appointmentDate ?? ''
                  const status = b?.status ?? b?.state ?? ''
                  const customerId = b?.customerId ?? b?.customer ?? ''
                  return (
                  <div key={id} className="p-3 border rounded-lg flex justify-between items-center">
                    <div>
                      <div className="font-medium">{serviceName}</div>
                      <div className="text-sm text-muted-foreground">Khách hàng ID: {customerId} — {date} — {status}</div>
                    </div>
                    <div>
                      <Button size="sm" onClick={() => router.push(`/vet/bookings/${id}`)}>Xem chi tiết</Button>
                    </div>
                  </div>
                )})}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
