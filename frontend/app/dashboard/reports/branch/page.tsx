"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, TrendingUp } from "lucide-react"
import Link from "next/link"

interface Branch {
  branchId: number
  name: string
}

interface Invoice {
  invoiceId: number
  branchId: number
  customerId: number
  customerName: string
  invoiceDate: string
  finalAmount?: number
  totalAmount?: number
  total?: number
  status?: string
  items?: InvoiceItem[]
}

interface InvoiceItem {
  invoiceItemId: number
  invoiceId: number
  itemType: string
  productId?: number
  serviceId?: number
  quantity: number
  unitPrice: number
  totalPrice: number
  productName?: string
  serviceName?: string
}

interface Booking {
  bookingId: number
  customerId: number
  customerName: string
  branchId: number
  employeeId?: number
  doctorId?: number
  doctorName?: string
  employeeName?: string
  bookingDate: string
  requestedDateTime?: string
  status?: string
  serviceBasePrice?: number
}

interface DoctorStats {
  employeeId: number
  employeeName: string
  checkupCount: number
  totalRevenue: number
}

export default function BranchReportsPage() {
  const searchParams = useSearchParams()
  const initialBranchId = searchParams.get('branchId')
  const isBranchFixed = !!initialBranchId // True if branchId from URL params
  
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranchId, setSelectedBranchId] = useState<string>(initialBranchId || '')
  const [loading, setLoading] = useState(true)
  
  // Statistics data
  const [clinicRevenue, setClinicRevenue] = useState(0)
  const [checkupCount, setCheckupCount] = useState(0)
  const [productRevenue, setProductRevenue] = useState(0)
  const [allBranchesRevenue, setAllBranchesRevenue] = useState(0)
  const [doctorStats, setDoctorStats] = useState<DoctorStats[]>([])
  
  // Pagination for doctor stats
  const [doctorPageSize] = useState(10)
  const [doctorCurrentPage, setDoctorCurrentPage] = useState(1)
  
  // Date filters
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Initialize dates to current month
  useEffect(() => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    setStartDate(firstDay.toISOString().split('T')[0])
    setEndDate(lastDay.toISOString().split('T')[0])
  }, [])

  // Load branches
  useEffect(() => {
    loadBranches()
  }, [])

  // Load statistics when branch changes or dates change
  useEffect(() => {
    if (selectedBranchId && startDate && endDate) {
      setDoctorCurrentPage(1) // Reset pagination when data changes
      loadStatistics()
    }
  }, [selectedBranchId, startDate, endDate])

  async function loadBranches() {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/branches?pageSize=100', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        const branchList = data.items || []
        setBranches(branchList)
        
        // If branchId not in params, select first branch
        if (!initialBranchId && branchList.length > 0) {
          setSelectedBranchId(branchList[0].branchId.toString())
        }
      }
    } catch (e) {
      console.error('Error loading branches:', e)
    } finally {
      setLoading(false)
    }
  }

  async function loadStatistics() {
    try {
      const token = localStorage.getItem('token')
      const branchId = parseInt(selectedBranchId)
      
      // Load invoices for this branch
      const invoicesResponse = await fetch(
        `http://localhost:5000/api/invoices?branchId=${branchId}&pageSize=1000`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
      
      // Load bookings for this branch (with branchId filter)
      const bookingsResponse = await fetch(
        `http://localhost:5000/api/bookings?branchId=${branchId}&pageSize=1000`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      )

      // Load all branches for comparison
      const allBranchesResponse = await fetch(
        `http://localhost:5000/api/invoices?pageSize=5000`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      )

      if (invoicesResponse.ok && bookingsResponse.ok && allBranchesResponse.ok) {
        const invoicesData = await invoicesResponse.json()
        const bookingsData = await bookingsResponse.json()
        const allBranchesData = await allBranchesResponse.json()

        const invoices = invoicesData.items || []
        const bookings = bookingsData.items || []
        const allInvoices = allBranchesData.items || []

        // Filter by date range
        const filtered = (items: any[], dateField: string) => {
          const start = new Date(startDate)
          const end = new Date(endDate)
          end.setHours(23, 59, 59, 999)
          
          return items.filter((item: any) => {
            const date = new Date(item[dateField] || new Date())
            return date >= start && date <= end
          })
        }

        const filteredInvoices = filtered(invoices, 'invoiceDate')
        const filteredBookings = filtered(bookings, 'requestedDateTime')
        const filteredAllInvoices = filtered(allInvoices, 'invoiceDate')

        // Calculate Clinic Revenue (from bookings/checkups)
        const clinicRev = filteredBookings.reduce((sum: number, booking: Booking) => {
          const price = booking.serviceBasePrice || 0
          return sum + price
        }, 0)
        setClinicRevenue(clinicRev)

        // Calculate Number of Checkups
        setCheckupCount(filteredBookings.length)

        // Calculate Product Sales Revenue
        let prodRev = 0
        filteredInvoices.forEach((invoice: Invoice) => {
          if (invoice.items) {
            invoice.items.forEach((item: InvoiceItem) => {
              if (item.itemType === 'PRODUCT') {
                prodRev += item.totalPrice || 0
              }
            })
          }
        })
        setProductRevenue(prodRev)

        // Calculate All Branches Revenue
        const allRev = filteredAllInvoices.reduce((sum: number, inv: Invoice) => {
          return sum + (inv.finalAmount || inv.totalAmount || inv.total || 0)
        }, 0)
        setAllBranchesRevenue(allRev)

        // Calculate Doctor Stats (from filtered bookings)
        const doctorMap = new Map<number, DoctorStats>()
        filteredBookings.forEach((booking: Booking) => {
          const empId = booking.doctorId || booking.bookingId
          const price = booking.serviceBasePrice || 0
          const doctorName = booking.doctorName || `Bác sĩ ${empId}`
          
          if (!doctorMap.has(empId)) {
            doctorMap.set(empId, {
              employeeId: empId,
              employeeName: doctorName,
              checkupCount: 0,
              totalRevenue: 0
            })
          }
          
          const stats = doctorMap.get(empId)!
          stats.checkupCount += 1
          stats.totalRevenue += price
        })

        setDoctorStats(Array.from(doctorMap.values()).sort((a, b) => b.totalRevenue - a.totalRevenue))
      }
    } catch (e) {
      console.error('Error loading statistics:', e)
    }
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
  }

  const selectedBranch = branches.find(b => b.branchId.toString() === selectedBranchId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/branches">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Thống kê chi nhánh</h1>
          {isBranchFixed && selectedBranch && (
            <p className="text-muted-foreground mt-1">📍 <strong>{selectedBranch.name}</strong> - Xem chi tiết doanh thu</p>
          )}
          {!isBranchFixed && (
            <p className="text-muted-foreground mt-1">Phân tích doanh thu và hoạt động của chi nhánh</p>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid gap-4 md:grid-cols-4">
          {!isBranchFixed && (
            <div>
              <label className="block text-sm font-medium mb-2">Chi nhánh</label>
              <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn chi nhánh" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.branchId} value={branch.branchId.toString()}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {isBranchFixed && (
            <div>
              <label className="block text-sm font-medium mb-2">Chi nhánh</label>
              <div className="px-3 py-2 border rounded-md bg-muted">
                <p className="font-medium text-sm">{selectedBranch?.name}</p>
                <p className="text-xs text-muted-foreground">Cố định</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Từ ngày</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Đến ngày</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="flex items-end">
            <Button onClick={loadStatistics} className="w-full">
              <TrendingUp className="h-4 w-4 mr-2" />
              Cập nhật
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Doanh thu phòng khám</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(clinicRevenue)}</p>
            <p className="text-xs text-muted-foreground">Từ dịch vụ khám</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Số lượt khám</p>
            <p className="text-2xl font-bold text-green-600">{checkupCount}</p>
            <p className="text-xs text-muted-foreground">Tổng số lượt khám</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Doanh thu bán sản phẩm</p>
            <p className="text-2xl font-bold text-purple-600">{formatCurrency(productRevenue)}</p>
            <p className="text-xs text-muted-foreground">Từ hóa đơn sản phẩm</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Tổng doanh thu tất cả chi nhánh</p>
            <p className="text-2xl font-bold text-orange-600">{formatCurrency(allBranchesRevenue)}</p>
            <p className="text-xs text-muted-foreground">Toàn hệ thống</p>
          </div>
        </Card>
      </div>

      {/* Revenue by Doctor */}
      <Card className="p-6">
        <h2 className="text-lg font-bold mb-4">Doanh thu theo bác sĩ</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Bác sĩ</th>
                <th className="text-right py-3 px-4">Số lượt khám</th>
                <th className="text-right py-3 px-4">Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {doctorStats.length > 0 ? (
                doctorStats
                  .slice((doctorCurrentPage - 1) * doctorPageSize, doctorCurrentPage * doctorPageSize)
                  .map((doctor) => (
                    <tr key={doctor.employeeId} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">{doctor.employeeName}</td>
                      <td className="text-right py-3 px-4">
                        <Badge variant="outline">{doctor.checkupCount}</Badge>
                      </td>
                      <td className="text-right py-3 px-4 font-medium text-blue-600">
                        {formatCurrency(doctor.totalRevenue)}
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-6 px-4 text-center text-muted-foreground">
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {doctorStats.length > doctorPageSize && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Hiển thị {(doctorCurrentPage - 1) * doctorPageSize + 1}-{Math.min(doctorCurrentPage * doctorPageSize, doctorStats.length)} trong {doctorStats.length} bác sĩ
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDoctorCurrentPage(Math.max(1, doctorCurrentPage - 1))}
                disabled={doctorCurrentPage === 1}
              >
                Trước
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  Trang {doctorCurrentPage} / {Math.ceil(doctorStats.length / doctorPageSize)}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDoctorCurrentPage(Math.min(Math.ceil(doctorStats.length / doctorPageSize), doctorCurrentPage + 1))}
                disabled={doctorCurrentPage >= Math.ceil(doctorStats.length / doctorPageSize)}
              >
                Tiếp
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Summary Stats */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 to-primary/10">
        <h2 className="text-lg font-bold mb-4">Tóm tắt</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Tổng doanh thu chi nhánh {selectedBranch?.name}</p>
            <p className="text-2xl font-bold">
              {formatCurrency(clinicRevenue + productRevenue)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Doanh thu bình quân/khám</p>
            <p className="text-2xl font-bold">
              {checkupCount > 0 ? formatCurrency(clinicRevenue / checkupCount) : '₫0'}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">% doanh thu so với toàn hệ thống</p>
            <p className="text-2xl font-bold">
              {allBranchesRevenue > 0 
                ? ((((clinicRevenue + productRevenue) / allBranchesRevenue) * 100).toFixed(1) + '%') 
                : '0%'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
