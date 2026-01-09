"use client"

import { useEffect, useState } from "react"
import { getSelectedBranchId, getSelectedBranchName } from '@/lib/branch'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Stethoscope, Syringe, Scissors, Pill } from "lucide-react"
import { toast } from '@/hooks/use-toast'

const SERVICE_TYPES = [
  { value: 'CHECKUP', label: 'Khám bệnh' },
  { value: 'VACCINATION', label: 'Tiêm chủng' },
  { value: 'PACKAGE', label: 'Gói dịch vụ' }
]

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
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<any>(null)
  const [formData, setFormData] = useState({ name: '', basePrice: '', serviceType: '', description: '' })
  const [branchId, setBranchId] = useState<number | null>(null)

  useEffect(() => {
    const bid = getSelectedBranchId()
    if (bid) setBranchId(bid)
  }, [])

  const loadServices = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/services', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setServices(data.items || data || [])
      }
    } catch (error) {
      console.error('Load services error:', error)
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu dịch vụ",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadServices()
  }, [branchId])

  const resetForm = () => {
    setFormData({ name: '', basePrice: '', serviceType: '', description: '' })
    setSelectedService(null)
  }

  const openAddDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const openEditDialog = (service: any) => {
    setSelectedService(service)
    setFormData({
      name: service.name || '',
      basePrice: service.basePrice || '',
      serviceType: service.serviceType || '',
      description: service.description || ''
    })
    setIsDialogOpen(true)
  }

  const handleSaveService = async () => {
    try {
      if (!formData.name || !formData.basePrice || !formData.serviceType) {
        toast({
          title: "Lỗi",
          description: "Vui lòng điền đầy đủ thông tin bắt buộc",
          variant: "destructive",
        })
        return
      }

      // Validate ServiceType
      if (!['CHECKUP', 'VACCINATION', 'PACKAGE'].includes(formData.serviceType)) {
        toast({
          title: "Lỗi",
          description: "Loại dịch vụ không hợp lệ",
          variant: "destructive",
        })
        return
      }

      // Validate BasePrice > 0
      const price = parseFloat(formData.basePrice.toString())
      if (price <= 0) {
        toast({
          title: "Lỗi",
          description: "Giá dịch vụ phải lớn hơn 0",
          variant: "destructive",
        })
        return
      }

      setLoading(true)
      const token = localStorage.getItem('token')
      
      const payload = {
        name: formData.name,
        basePrice: price,
        serviceType: formData.serviceType,
        description: formData.description
      }

      if (selectedService) {
        // Edit
        const response = await fetch(`http://localhost:5000/api/services/${selectedService.serviceId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        })

        if (response.ok) {
          toast({
            title: "Thành công",
            description: "Cập nhật dịch vụ thành công",
          })
          loadServices()
          setIsDialogOpen(false)
          resetForm()
        } else {
          const error = await response.text()
          toast({
            title: "Lỗi",
            description: error || "Không thể cập nhật dịch vụ",
            variant: "destructive",
          })
        }
      } else {
        // Add
        const response = await fetch('http://localhost:5000/api/services', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        })

        if (response.ok) {
          toast({
            title: "Thành công",
            description: "Thêm dịch vụ thành công",
          })
          loadServices()
          setIsDialogOpen(false)
          resetForm()
        } else {
          const error = await response.text()
          toast({
            title: "Lỗi",
            description: error || "Không thể thêm dịch vụ",
            variant: "destructive",
          })
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteService = async (serviceId: number | string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) return

    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/services/${serviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast({
          title: "Thành công",
          description: "Xóa dịch vụ thành công",
        })
        loadServices()
      } else {
        const error = await response.text()
        toast({
          title: "Lỗi",
          description: error || "Không thể xóa dịch vụ",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Quản lý Dịch vụ</h1>
        <Button onClick={openAddDialog} className="gap-2">
          <Plus className="w-4 h-4" />
          Thêm dịch vụ
        </Button>
      </div>

      {loading && <p className="text-center text-gray-500">Đang tải...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => {
          const IconComponent = mockServices.find(s => s.name === service.name)?.icon || Stethoscope
          const color = mockServices.find(s => s.name === service.name)?.color || 'text-gray-600'
          const serviceTypeLabel = SERVICE_TYPES.find(t => t.value === service.serviceType)?.label || service.serviceType
          
          return (
            <Card key={service.serviceId} className="p-6 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <IconComponent className={`w-8 h-8 ${color}`} />
                <Badge variant="outline">{serviceTypeLabel}</Badge>
              </div>
              <div>
                <h3 className="font-semibold text-lg">{service.name}</h3>
                {service.description && <p className="text-sm text-gray-600">{service.description}</p>}
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-gray-600">Giá: <span className="font-semibold text-green-600">{service.basePrice?.toLocaleString()} VNĐ</span></p>
              </div>
              <div className="flex gap-2 mt-auto">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => openEditDialog(service)}
                >
                  Chỉnh sửa
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1"
                  onClick={() => handleDeleteService(service.serviceId)}
                >
                  Xóa
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6 space-y-4">
            <h2 className="text-2xl font-bold">
              {selectedService ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ'}
            </h2>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="name">Tên dịch vụ *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nhập tên dịch vụ"
                />
              </div>

              <div>
                <Label htmlFor="serviceType">Loại dịch vụ *</Label>
                <Select value={formData.serviceType} onValueChange={(value) => setFormData({ ...formData, serviceType: value })}>
                  <SelectTrigger id="serviceType">
                    <SelectValue placeholder="Chọn loại dịch vụ" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="basePrice">Giá cơ bản (VNĐ) *</Label>
                <Input
                  id="basePrice"
                  type="number"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                  placeholder="Nhập giá (phải lớn hơn 0)"
                  min="1"
                />
              </div>

              <div>
                <Label htmlFor="description">Mô tả</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Nhập mô tả dịch vụ (không bắt buộc)"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsDialogOpen(false)
                  resetForm()
                }}
              >
                Hủy
              </Button>
              <Button
                className="flex-1"
                onClick={handleSaveService}
                disabled={loading}
              >
                {loading ? 'Đang lưu...' : 'Lưu'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
