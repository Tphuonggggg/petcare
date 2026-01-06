"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus } from "lucide-react"
import { apiPost } from "@/lib/api"

interface CustomerForm {
  fullName: string
  phone: string
  email: string
  gender: string
  birthDate: string
  membershipTierId: string
  petName: string
  petSpecies: string
}

interface FormErrors {
  fullName?: string
  phone?: string
  gender?: string
  birthDate?: string
  membershipTierId?: string
}

export default function NewCustomerPage() {
  const router = useRouter()
  const [form, setForm] = useState<CustomerForm>({
    fullName: "",
    phone: "",
    email: "",
    gender: "",
    birthDate: "",
    membershipTierId: "1",
    petName: "",
    petSpecies: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!form.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ tên"
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại"
    } else if (!/^[0-9]{9,11}$/.test(form.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Số điện thoại không hợp lệ (9-11 chữ số)"
    }

    if (!form.gender) {
      newErrors.gender = "Vui lòng chọn giới tính"
    }

    if (!form.birthDate) {
      newErrors.birthDate = "Vui lòng chọn ngày sinh"
    } else {
      const birthDate = new Date(form.birthDate)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      if (age < 5 || age > 150) {
        newErrors.birthDate = "Ngày sinh không hợp lệ"
      }
    }

    if (!form.membershipTierId) {
      newErrors.membershipTierId = "Vui lòng chọn tầng thành viên"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSaveCustomer = async () => {
    if (!validateForm()) {
      return
    }

    try {
      setSubmitting(true)

      // Create customer
      const customerResponse = await apiPost("/customers", {
        fullName: form.fullName,
        phone: form.phone,
        email: form.email || null,
        gender: form.gender,
        birthDate: form.birthDate,
        memberSince: new Date().toISOString().split("T")[0],
        membershipTierId: parseInt(form.membershipTierId),
      })

      // If pet info is provided, create pet
      if (form.petName && customerResponse.customerId) {
        await apiPost("/pets", {
          customerId: customerResponse.customerId,
          name: form.petName,
          species: form.petSpecies || "Unknown",
          dateOfBirth: new Date().toISOString(),
        })
      }

      // Dispatch event to reload customer list
      window.dispatchEvent(new Event('customer-added'))

      alert("Khách hàng mới đã được tạo thành công")
      router.push("/reception/customers")
    } catch (error) {
      console.error("Error creating customer:", error)
      alert("Lỗi khi tạo khách hàng")
    } finally {
      setSubmitting(false)
    }
  }

  const fieldClass = (hasError: boolean) =>
    `w-full border rounded-md px-3 py-2 ${hasError ? "border-red-500 bg-red-50" : ""}`
  const errorClass = "text-sm text-red-600 mt-1"

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/reception/customers")}
            className="bg-transparent"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <h1 className="text-2xl font-bold">Thêm khách hàng mới</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin khách hàng <span className="text-red-500">*</span></CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Họ tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleInputChange}
                  placeholder="Nhập tên khách hàng"
                  className={fieldClass(!!errors.fullName)}
                />
                {errors.fullName && <p className={errorClass}>{errors.fullName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleInputChange}
                  placeholder="Nhập số điện thoại"
                  className={fieldClass(!!errors.phone)}
                />
                {errors.phone && <p className={errorClass}>{errors.phone}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleInputChange}
                  placeholder="Nhập email"
                  className={fieldClass(false)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Giới tính <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleInputChange}
                  className={fieldClass(!!errors.gender)}
                >
                  <option value="">-- Chọn giới tính --</option>
                  <option value="M">Nam</option>
                  <option value="F">Nữ</option>
                  <option value="O">Khác</option>
                </select>
                {errors.gender && <p className={errorClass}>{errors.gender}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Ngày sinh <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="birthDate"
                  value={form.birthDate}
                  onChange={handleInputChange}
                  className={fieldClass(!!errors.birthDate)}
                />
                {errors.birthDate && <p className={errorClass}>{errors.birthDate}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tầng thành viên <span className="text-red-500">*</span>
                </label>
                <select
                  name="membershipTierId"
                  value={form.membershipTierId}
                  onChange={handleInputChange}
                  className={fieldClass(!!errors.membershipTierId)}
                >
                  <option value="">-- Chọn tầng thành viên --</option>
                  <option value="1">Bạc (Silver)</option>
                  <option value="2">Vàng (Gold)</option>
                  <option value="3">Bạch kim (Platinum)</option>
                </select>
                {errors.membershipTierId && <p className={errorClass}>{errors.membershipTierId}</p>}
              </div>
            </div>

            <hr className="my-4" />

            <div>
              <h3 className="font-medium mb-4">Thông tin thú cưng (tùy chọn)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tên thú cưng</label>
                  <input
                    type="text"
                    name="petName"
                    value={form.petName}
                    onChange={handleInputChange}
                    placeholder="Nhập tên thú cưng"
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Loài thú cưng</label>
                  <select
                    name="petSpecies"
                    value={form.petSpecies}
                    onChange={handleInputChange}
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="">-- Chọn loài --</option>
                    <option value="Chó">Chó</option>
                    <option value="Mèo">Mèo</option>
                    <option value="Thỏ">Thỏ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                onClick={() => router.push("/reception")}
                className="bg-transparent"
                disabled={submitting}
              >
                Hủy
              </Button>
              <Button onClick={handleSaveCustomer} disabled={submitting}>
                {submitting ? "Đang lưu..." : "Lưu khách hàng"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
