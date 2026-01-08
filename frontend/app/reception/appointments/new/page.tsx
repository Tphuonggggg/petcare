"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calendar, Users, Clock, X } from "lucide-react"
import { apiGet, apiPost } from "@/lib/api"

interface Customer {
  customerId: number
  fullName: string
}

interface Pet {
  petId: number
  name: string
  species: string
}

interface Service {
  serviceId: number
  name: string
  serviceType?: string
  basePrice?: number
  description?: string
}

interface Doctor {
  employeeId: number
  fullName: string
}

export default function NewAppointmentPage() {
  const router = useRouter()
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [pets, setPets] = useState<Pet[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [customerSearch, setCustomerSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [selectedPetId, setSelectedPetId] = useState("")
  const [selectedService, setSelectedService] = useState("")
  const [selectedDoctorId, setSelectedDoctorId] = useState("")
  const [appointmentDate, setAppointmentDate] = useState("")
  const [appointmentTime, setAppointmentTime] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [searchingCustomers, setSearchingCustomers] = useState(false)
  
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    loadFormData()
  }, [])

  // Debounce search input
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(customerSearch)
    }, 500)

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [customerSearch])

  // Load customers when debounced search changes
  useEffect(() => {
    if (debouncedSearch.trim()) {
      searchCustomers(debouncedSearch)
    } else {
      setFilteredCustomers([])
      setShowCustomerDropdown(false)
    }
  }, [debouncedSearch])

  const loadFormData = async () => {
    try {
      setLoading(true)
      
      // Get branchId from localStorage
      let branchId = localStorage.getItem("branchId")
      
      if (!branchId) {
        const employeeId = localStorage.getItem("employeeId")
        if (employeeId) {
          try {
            const empData = await apiGet(`/employees/${employeeId}`)
            branchId = empData.branchId?.toString()
            if (branchId) {
              localStorage.setItem("branchId", branchId)
            }
          } catch (error) {
            console.error("Error loading employee info:", error)
          }
        }
      }
      
      const [servicesData, doctorsData] = await Promise.all([
        apiGet("/services?page=1&pageSize=100"),
        apiGet(`/employees?positionId=1&branchId=${branchId}&page=1&pageSize=100`)
      ])
      
      const servicesList = servicesData?.items || servicesData || []
      const doctorsList = doctorsData?.items || doctorsData || []
      
      setServices(Array.isArray(servicesList) ? servicesList : [])
      setDoctors(Array.isArray(doctorsList) ? doctorsList : [])
    } catch (error) {
      console.error("Error loading form data:", error)
    } finally {
      setLoading(false)
    }
  }

  const searchCustomers = async (searchText: string) => {
    try {
      setSearchingCustomers(true)
      
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      const params = new URLSearchParams({
        page: '1',
        pageSize: '20',
        search: searchText.trim()
      })

      const result = await apiGet(`/receptionistdashboard/customers?${params.toString()}`)
      
      if (!abortControllerRef.current.signal.aborted) {
        const customersList = result?.items || []
        setFilteredCustomers(customersList)
        setShowCustomerDropdown(customersList.length > 0)
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error("Error searching customers:", error)
      }
    } finally {
      setSearchingCustomers(false)
    }
  }

  const loadPets = async (customerId: number) => {
    try {
      const data = await apiGet(`/customers/${customerId}`)
      console.log("Full Customer Response:", JSON.stringify(data, null, 2))
      console.log("Pets from response:", data?.pets || data?.Pets || [])
      
      const petsList = data?.pets || data?.Pets || []
      setPets(Array.isArray(petsList) ? petsList : [])
    } catch (error) {
      console.error("Error loading pets:", error)
      setPets([])
    }
  }

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setCustomerSearch(customer.fullName)
    setShowCustomerDropdown(false)
    setFilteredCustomers([])
    setSelectedPetId("")
    loadPets(customer.customerId)
  }

  const handleClearCustomer = () => {
    setSelectedCustomer(null)
    setCustomerSearch("")
    setPets([])
    setSelectedPetId("")
    setShowCustomerDropdown(false)
  }

  const handleSaveBooking = async () => {
    if (!selectedCustomer || !selectedPetId || !selectedService || !appointmentDate || !appointmentTime) {
      alert("Vui lòng điền tất cả thông tin")
      return
    }

    try {
      setSubmitting(true)
      const bookingDateTime = new Date(`${appointmentDate}T${appointmentTime}`)
      const branchId = typeof window !== 'undefined' ? localStorage.getItem('branchId') : null
      
      console.log("[DEBUG] branchId from localStorage:", branchId)
      
      if (!branchId) {
        alert("Không tìm thấy thông tin chi nhánh. Vui lòng đăng nhập lại.")
        return
      }
      
      // Map service name to bookingType
      const bookingTypeMap: Record<string, string> = {
        'Khám bệnh': 'CheckHealth',
        'Tiêm phòng': 'Vaccination',
        'Gói tiêm phòng': 'Vaccination'
      }
      const bookingType = bookingTypeMap[selectedService] || selectedService
      
      const bookingData = {
        customerId: selectedCustomer.customerId,
        petId: parseInt(selectedPetId),
        branchId: parseInt(branchId),
        bookingType: bookingType,
        requestedDateTime: bookingDateTime.toISOString(),
        status: "Pending",
        doctorId: selectedDoctorId ? parseInt(selectedDoctorId) : null,
      }
      
      console.log("[DEBUG] Booking data being sent:", bookingData)
      
      await apiPost("/bookings", bookingData)

      alert("Lịch hẹn đã được tạo thành công")
      // Clear form data
      setSelectedCustomer(null)
      setCustomerSearch("")
      setPets([])
      setSelectedPetId("")
      setSelectedService("")
      setSelectedDoctorId("")
      setAppointmentDate("")
      setAppointmentTime("")
      // Navigate back to appointments list
      router.push("/reception/appointments")
      
      // Reload page after short delay to ensure dashboard refreshes
      setTimeout(() => {
        router.refresh()
      }, 500)
    } catch (error) {
      console.error("Error creating booking:", error)
      alert("Lỗi khi tạo lịch hẹn")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/reception/appointments")}
            className="bg-transparent"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <h1 className="text-2xl font-bold">Đặt lịch hẹn mới</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {loading ? (
          <Card>
            <CardContent className="py-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Đang tải dữ liệu...</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Thông tin đặt lịch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Khách hàng</label>
                <div className="relative">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Gõ tên khách hàng..."
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        onFocus={() => filteredCustomers.length > 0 && setShowCustomerDropdown(true)}
                        className="w-full border rounded-md px-3 py-2"
                        disabled={submitting}
                      />
                      {searchingCustomers && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        </div>
                      )}
                      {selectedCustomer && (
                        <button
                          type="button"
                          onClick={handleClearCustomer}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  {showCustomerDropdown && filteredCustomers.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 border rounded-md bg-white shadow-lg z-10 max-h-48 overflow-y-auto">
                      {filteredCustomers.map((customer) => (
                        <div
                          key={customer.customerId}
                          onClick={() => handleSelectCustomer(customer)}
                          className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                        >
                          {customer.fullName}
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedCustomer && (
                    <div className="mt-2 p-2 bg-blue-50 rounded-md border border-blue-200">
                      <p className="text-sm text-blue-900">✓ Đã chọn: <strong>{selectedCustomer.fullName}</strong></p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Thú cưng</label>
                <select
                  value={selectedPetId}
                  onChange={(e) => setSelectedPetId(e.target.value)}
                  disabled={!selectedCustomer}
                  className="w-full border rounded-md px-3 py-2 disabled:opacity-50"
                >
                  <option value="">-- Chọn thú cưng --</option>
                  {pets.map((pet) => (
                    <option key={pet.petId} value={pet.petId}>
                      {pet.name} ({pet.species})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Dịch vụ</label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="">-- Chọn dịch vụ --</option>
                  {services.map((service) => (
                    <option key={service.serviceId} value={service.name}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Bác sĩ (tùy chọn)</label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="">-- Tự động gán --</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.employeeId} value={doctor.employeeId}>
                      {doctor.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Ngày</label>
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Giờ</label>
                  <input
                    type="time"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => router.push("/reception/appointments")}
                  className="bg-transparent"
                  disabled={submitting}
                >
                  Hủy
                </Button>
                <Button onClick={handleSaveBooking} disabled={submitting}>
                  {submitting ? "Đang lưu..." : "Lưu lịch hẹn"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
