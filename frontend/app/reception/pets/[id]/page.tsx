"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit, Trash2 } from 'lucide-react'
import { apiGet, apiDelete } from '@/lib/api'

interface Pet {
  petId: number
  customerId: number
  name: string
  species: string
  breed?: string
  birthDate?: string
  gender?: string
  status?: string
}

interface Customer {
  customerId: number
  fullName: string
  email?: string
  phone?: string
  cccd?: string
}

export default function ReceptionPetDetail() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id ? Number(params.id) : undefined

  const [pet, setPet] = useState<Pet | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    console.log('Params:', params)
    console.log('ID:', id)
    if (!id) return
    loadPetDetails()
  }, [id])

  const loadPetDetails = async () => {
    try {
      setLoading(true)
      const p = await apiGet(`/pets/${id}`)
      setPet(p)
      
      if (p.customerId) {
        try {
          const c = await apiGet(`/customers/${p.customerId}`)
          setCustomer(c)
        } catch (err) {
          console.error("Error loading customer:", err)
        }
      }
    } catch (err) {
      console.error("Error loading pet:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm("Bạn chắc chắn muốn xóa thú cưng này?")) {
      return
    }

    setDeleting(true)
    try {
      await apiDelete(`/pets/${id}`)
      alert("Xóa thú cưng thành công")
      router.push("/reception/pets")
    } catch (err) {
      console.error("Error deleting pet:", err)
      alert("Lỗi khi xóa thú cưng")
      setDeleting(false)
    }
  }

  if (!id) return <div className="p-6">ID không hợp lệ</div>
  if (loading) return <div className="flex justify-center py-12"><p className="text-muted-foreground">Đang tải...</p></div>
  if (!pet) return <div className="flex justify-center py-12"><p className="text-muted-foreground">Không tìm thấy thú cưng</p></div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{pet.name}</h1>
            <p className="text-muted-foreground">Thông tin chi tiết thú cưng</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/reception/pets/${id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Chỉnh sửa
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa
          </Button>
        </div>
      </div>

      {/* Pet Info */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin thú cưng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Loài</p>
              <p className="text-lg font-semibold">{pet.species}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Giống</p>
              <p className="text-lg font-semibold">{pet.breed || "Chưa cập nhật"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Giới tính</p>
              <p className="text-lg font-semibold">{pet.gender ? (pet.gender === 'M' ? 'Đực' : pet.gender === 'F' ? 'Cái' : 'Không xác định') : "Chưa cập nhật"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Trạng thái</p>
              <p className="text-lg font-semibold">{pet.status || "Chưa cập nhật"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ngày sinh</p>
              <p className="text-lg font-semibold">
                {pet.birthDate
                  ? new Date(pet.birthDate).toLocaleDateString("vi-VN")
                  : "Chưa cập nhật"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Info */}
      {customer && (
        <Card>
          <CardHeader>
            <CardTitle>Thông tin chủ thú cưng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tên chủ</p>
                <p className="text-lg font-semibold">{customer.fullName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Điện thoại</p>
                <p className="text-lg font-semibold">{customer.phone || "Chưa cập nhật"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-lg font-semibold">{customer.email || "Chưa cập nhật"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">CCCD</p>
                <p className="text-lg font-semibold">{customer.cccd || "Chưa cập nhật"}</p>
              </div>
            </div>
            <Button
              className="w-full"
              onClick={() => router.push(`/reception/customers/${customer.customerId}`)}
            >
              Xem chi tiết khách hàng
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
