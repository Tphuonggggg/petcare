"use client"

import { useEffect, useState } from "react"
import { getSelectedBranchId, getSelectedBranchName } from '@/lib/branch'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Stethoscope, Syringe, Scissors, Pill } from "lucide-react"

const mockServices = [
  {
    id: 1,
    name: "Khám tổng quát",
    category: "Khám bệnh",
    price: "300,000 VNĐ",
    duration: "30 phút",
    icon: Stethoscope,
    color: "text-blue-600",
  },
  {
    id: 2,
    name: "Tiêm phòng dại",
    category: "Tiêm chủng",
    price: "150,000 VNĐ",
    duration: "15 phút",
    icon: Syringe,
    color: "text-green-600",
  },
  {
    id: 3,
    name: "Tắm & cắt tỉa lông",
    category: "Chăm sóc",
    price: "200,000 VNĐ",
    duration: "60 phút",
    icon: Scissors,
    color: "text-pink-600",
  },
  {
    id: 4,
    name: "Điều trị ký sinh trùng",
    category: "Điều trị",
    price: "250,000 VNĐ",
    duration: "45 phút",
    icon: Pill,
    color: "text-purple-600",
  },
]

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>(mockServices)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const { apiGet } = await import('@/lib/api')
        const data = await apiGet('/services')
        if (mounted && Array.isArray(data)) {
          const branchId = getSelectedBranchId()
          const branchName = getSelectedBranchName()
          const filtered = branchId
            ? data.filter((s: any) => String(s.branchId ?? s.branch?._id ?? s.branch) === String(branchId) || String(s.branchName ?? s.branch) === String(branchName))
            : data
          setServices(filtered)
        }
      } catch (e) {
        // keep mockServices on error
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    const onBranch = () => { load() }
    window.addEventListener('branch-changed', onBranch as EventListener)
    return () => { mounted = false; window.removeEventListener('branch-changed', onBranch as EventListener) }
  }, [])
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dịch vụ</h1>
          <p className="text-muted-foreground mt-1">Quản lý các dịch vụ chăm sóc thú cưng</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Thêm dịch vụ
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(loading ? [] : services).map((service) => {
          const Icon = (service && typeof service.icon === 'function') ? service.icon : Stethoscope
          const name = service?.name ?? service?.serviceName ?? 'Dịch vụ'
          const price = service?.price ?? service?.cost ?? service?.priceString ?? '—'
          const duration = service?.duration ?? service?.time ?? '—'
          return (
            <Card key={service.serviceId ?? service.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <Icon className={`h-10 w-10 ${service.color ?? ''}`} />
                  <Badge variant="outline">{service.category ?? service?.serviceCategory ?? '—'}</Badge>
                </div>

                <div>
                  <h3 className="font-semibold text-lg">{name}</h3>
                  <p className="text-2xl font-bold text-primary mt-2">{price}</p>
                  <p className="text-sm text-muted-foreground mt-1">Thời gian: {duration}</p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    Chỉnh sửa
                  </Button>
                  <Button size="sm" className="flex-1">
                    Đặt lịch
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
