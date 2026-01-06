"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Plus, Download, Filter, Eye, Trash2, Search } from "lucide-react"
import { apiGet, apiDelete } from "@/lib/api"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Invoice {
  invoiceId: number
  customerId: number
  customerName: string
  finalAmount: number
  totalAmount: number
  status: string
  invoiceDate: string
  invoiceItems?: any[]
  paymentMethod?: string
}

export default function InvoicesPage() {
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [userBranchId, setUserBranchId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    // Get branch ID of current user from localStorage
    if (typeof window !== 'undefined') {
      const branchId = localStorage.getItem('branchId')
      setUserBranchId(branchId)
    }
  }, [])

  useEffect(() => {
    if (userBranchId) {
      loadInvoices()
    }
  }, [currentPage, pageSize, userBranchId])

  useEffect(() => {
    filterInvoices()
    setCurrentPage(1)
  }, [invoices, searchTerm, statusFilter])

  const loadInvoices = async () => {
    try {
      setLoading(true)
      let url = `/invoices?page=${currentPage}&pageSize=${pageSize}`
      if (userBranchId) {
        url += `&branchId=${userBranchId}`
      }
      const data = await apiGet(url)
      if (data && data.items) {
        setInvoices(data.items)
        setTotalCount(data.totalCount)
      } else {
        setInvoices([])
        setTotalCount(0)
      }
    } catch (error) {
      console.error("Error loading invoices:", error)
      setInvoices([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }

  const filterInvoices = () => {
    let filtered = invoices

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(inv => 
        statusFilter === "paid" ? inv.status === "Paid" :
        statusFilter === "pending" ? inv.status === "Pending" :
        inv.status === "Cancelled"
      )
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(inv =>
        inv.customerName.toLowerCase().includes(search) ||
        inv.invoiceId.toString().includes(search)
      )
    }

    setFilteredInvoices(filtered)
  }

  const handleDelete = async (invoiceId: number) => {
    if (!confirm("Bạn chắc chắn muốn xóa hóa đơn này?")) return

    try {
      await apiDelete(`/invoices/${invoiceId}`)
      alert("Xóa hóa đơn thành công")
      loadInvoices()
    } catch (error) {
      console.error("Error deleting invoice:", error)
      alert("Lỗi khi xóa hóa đơn")
    }
  }


  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string }> = {
      "Paid": { bg: "bg-green-100", text: "text-green-800" },
      "Pending": { bg: "bg-orange-100", text: "text-orange-800" },
      "Cancelled": { bg: "bg-red-100", text: "text-red-800" },
    }
    const style = statusMap[status] || { bg: "bg-gray-100", text: "text-gray-800" }
    return style
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      "Paid": "Đã thanh toán",
      "Pending": "Chưa thanh toán",
      "Cancelled": "Đã hủy",
    }
    return labels[status] || status
  }

  const stats = {
    total: totalCount,
    paid: invoices.filter(i => i.status === "Paid").length,
    pending: invoices.filter(i => i.status === "Pending").length,
    totalAmount: invoices.reduce((sum, i) => sum + (i.finalAmount || 0), 0),
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/reception")}
              className="bg-transparent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
            <h1 className="text-2xl font-bold">Hóa đơn & Thanh toán</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tổng hóa đơn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Đã thanh toán
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Chờ thanh toán
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tổng tiền
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{formatCurrency(stats.totalAmount)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Tìm kiếm & Lọc</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-col md:flex-row">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm theo tên khách hàng hoặc mã hóa đơn..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Lọc theo trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="paid">Đã thanh toán</SelectItem>
                  <SelectItem value="pending">Chưa thanh toán</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách hóa đơn ({filteredInvoices.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Không có hóa đơn nào</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  {filteredInvoices.map((invoice) => {
                    const badgeStyle = getStatusBadge(invoice.status)
                    return (
                      <div
                        key={invoice.invoiceId}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-medium">#{invoice.invoiceId}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(invoice.invoiceDate).toLocaleDateString("vi-VN")}
                            </p>
                            <span className={`text-xs px-2 py-1 rounded font-medium ${badgeStyle.bg} ${badgeStyle.text}`}>
                              {getStatusLabel(invoice.status)}
                            </span>
                          </div>
                          <p className="text-sm font-medium">{invoice.customerName}</p>
                          <p className="text-xs text-muted-foreground">
                            {invoice.invoiceItems?.length || 0} mục hóa đơn
                          </p>
                        </div>
                        <div className="text-right mr-4">
                          <p className="font-bold text-lg">{formatCurrency(invoice.finalAmount || invoice.totalAmount)}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/reception/invoices/${invoice.invoiceId}`)}
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {invoice.status === "Pending" && (
                            <Button
                              size="sm"
                              onClick={() => router.push(`/reception/invoices/${invoice.invoiceId}/payment`)}
                              title="Thanh toán"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Thanh toán
                            </Button>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(invoice.invoiceId)}
                            title="Xóa"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between pt-6 border-t">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Hiển thị {(currentPage - 1) * pageSize + 1} đến {Math.min(currentPage * pageSize, totalCount)} trong {totalCount} hóa đơn
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Select value={pageSize.toString()} onValueChange={(val) => {
                      setPageSize(parseInt(val))
                      setCurrentPage(1)
                    }}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">mục/trang</span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Trước
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => {
                          // Show first, last, current, and adjacent pages
                          return p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)
                        })
                        .map((p, idx, arr) => (
                          <div key={p}>
                            {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-muted-foreground">...</span>}
                            <Button
                              variant={p === currentPage ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(p)}
                              className="min-w-10"
                            >
                              {p}
                            </Button>
                          </div>
                        ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
