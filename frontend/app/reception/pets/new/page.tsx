"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import { apiGet, apiPost } from "@/lib/api"

interface Customer {
  customerId: number
  id?: number
  fullName: string
  name?: string
  phone?: string
  email?: string
}

export default function NewPetPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchCustomer, setSearchCustomer] = useState("")
  const [selectedCustomerName, setSelectedCustomerName] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [searching, setSearching] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [formData, setFormData] = useState({
    customerId: "",
    name: "",
    species: "",
    breed: "",
    birthDate: "",
    gender: "",
    status: "Khỏe mạnh"
  })

  const searchCustomers = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setCustomers([])
      return
    }
    
    try {
      setSearching(true)
      const data = await apiGet(`/customers?page=1&pageSize=500&search=${encodeURIComponent(searchTerm)}`)
      const customerList = Array.isArray(data) ? data : (data.items || [])
      console.log("Search results:", customerList.length, "customers")
      setCustomers(customerList)
    } catch (error) {
      console.error("Error searching customers:", error)
    } finally {
      setSearching(false)
    }
  }

  const handleSearchChange = (value: string) => {
    setSearchCustomer(value)
    setSelectedCustomerName("")
    setShowDropdown(true)
    
    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    if (!value.trim()) {
      setCustomers([])
      return
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      console.log("Calling searchCustomers with:", value)
      searchCustomers(value)
    }, 300)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.customerId || !formData.name || !formData.species) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!")
      return
    }

    try {
      setLoading(true)
      
      const payload = {
        CustomerId: parseInt(formData.customerId),
        Name: formData.name,
        Species: formData.species,
        Breed: formData.breed || null,
        BirthDate: formData.birthDate || null,
        Gender: formData.gender || null,
        Status: formData.status || "Khỏe mạnh"
      }

      await apiPost("/pets", payload)
      alert("Thêm thú cưng thành công!")
      router.push("/reception/pets")
    } catch (error: any) {
      console.error("Error creating pet:", error)
      alert(`Lỗi: ${error.message || "Không thể thêm thú cưng"}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Thêm thú cưng mới</h1>
          <p className="text-muted-foreground">Điền thông tin thú cưng</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin thú cưng</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Chủ thú cưng */}
            <div className="space-y-2">
              <Label htmlFor="customerId">
                Chủ thú cưng <span className="text-red-500">*</span>
              </Label>
              <Input
                id="customerSearch"
                placeholder="Tìm kiếm khách hàng..."
                value={selectedCustomerName || searchCustomer}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                className="mb-2"
              />
              {searching && (
                <p className="text-xs text-muted-foreground">Đang tìm kiếm...</p>
              )}
              {showDropdown && searchCustomer && !selectedCustomerName && (
                <div className="border rounded-lg max-h-48 overflow-y-auto">
                  {customers.length === 0 ? (
                    <p className="p-3 text-sm text-muted-foreground">
                      {searching ? "Đang tìm kiếm..." : "Không tìm thấy khách hàng"}
                    </p>
                  ) : (
                    customers.map((customer) => (
                      <div
                        key={customer.customerId || customer.id}
                        onClick={() => {
                          setFormData({ ...formData, customerId: (customer.customerId || customer.id)?.toString() || "" })
                          setSelectedCustomerName(customer.fullName || customer.name || "")
                          setSearchCustomer("")
                          setShowDropdown(false)
                        }}
                        className="p-3 hover:bg-muted cursor-pointer border-b last:border-0"
                      >
                        <p className="font-medium">{customer.fullName || customer.name}</p>
                        <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                          <span>ID: {customer.customerId || customer.id}</span>
                          {customer.phone && <span>📱 {customer.phone}</span>}
                          {customer.email && <span>📧 {customer.email}</span>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
              {formData.customerId && selectedCustomerName && (
                <p className="text-sm text-green-600">✓ Đã chọn: {selectedCustomerName}</p>
              )}
            </div>

            {/* Tên thú cưng */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Tên thú cưng <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: Milo, Luna, Max..."
                required
              />
            </div>

            {/* Loài */}
            <div className="space-y-2">
              <Label htmlFor="species">
                Loài <span className="text-red-500">*</span>
              </Label>
              <select
                id="species"
                value={formData.species}
                onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">Chọn loài</option>
                <option value="Chó">Chó</option>
                <option value="Mèo">Mèo</option>
                <option value="Chim">Chim</option>
                <option value="Thỏ">Thỏ</option>
                <option value="Hamster">Hamster</option>
                <option value="Bò sát">Bò sát</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            {/* Giống */}
            <div className="space-y-2">
              <Label htmlFor="breed">Giống</Label>
              <Input
                id="breed"
                value={formData.breed}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                placeholder="VD: Golden Retriever, Mèo Ba Tư..."
              />
            </div>

            {/* Ngày sinh */}
            <div className="space-y-2">
              <Label htmlFor="birthDate">Ngày sinh</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Giới tính */}
            <div className="space-y-2">
              <Label htmlFor="gender">Giới tính</Label>
              <select
                id="gender"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Chưa xác định</option>
                <option value="Đực">Đực</option>
                <option value="Cái">Cái</option>
              </select>
            </div>

            {/* Tình trạng */}
            <div className="space-y-2">
              <Label htmlFor="status">Tình trạng sức khỏe</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                <option value="Khỏe mạnh">Khỏe mạnh</option>
                <option value="Đang điều trị">Đang điều trị</option>
                <option value="Cần theo dõi">Cần theo dõi</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? "Đang lưu..." : "Thêm thú cưng"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
