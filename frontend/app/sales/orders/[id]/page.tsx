"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PawPrint, ArrowLeft, Printer } from "lucide-react"
import { apiGet } from "@/lib/api"

interface InvoiceItem {
  productId?: number
  serviceId?: number
  itemType?: string
  quantity?: number
  unitPrice?: number
  productName?: string
  serviceName?: string
}

interface InvoiceDetail {
  invoiceId: number
  invoiceDate?: string
  customerId?: number
  customerName?: string
  customerPhone?: string
  totalAmount?: number
  discountAmount?: number
  finalAmount?: number
  paymentMethod?: string
  status?: string
  branchId?: number
  branchName?: string
  items?: InvoiceItem[]
}

export default function InvoiceDetailPage() {
  const router = useRouter()
  const params = useParams()
  const invoiceId = params?.id ? parseInt(params.id as string) : 0
  
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (invoiceId) {
      loadInvoice()
    }
  }, [invoiceId])

  const loadInvoice = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiGet(`/invoices/${invoiceId}`)
      
      // Fetch product/service names if not available
      if (data.items && data.items.length > 0) {
        const itemsWithNames = await Promise.all(
          data.items.map(async (item: InvoiceItem) => {
            if (!item.productName && item.productId && item.itemType === 'PRODUCT') {
              try {
                const product = await apiGet(`/products/${item.productId}`)
                item.productName = product.name
              } catch (e) {
                console.error(`Failed to fetch product ${item.productId}`)
              }
            }
            if (!item.serviceName && item.serviceId && item.itemType === 'SERVICE') {
              try {
                const service = await apiGet(`/services/${item.serviceId}`)
                item.serviceName = service.name
              } catch (e) {
                console.error(`Failed to fetch service ${item.serviceId}`)
              }
            }
            return item
          })
        )
        data.items = itemsWithNames
      }
      
      setInvoice(data)
    } catch (err) {
      console.error("Error loading invoice:", err)
      setError("Không thể tải chi tiết hóa đơn")
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmOrder = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          invoiceId: invoiceId,
          status: 'Processing',
          branchId: invoice?.branchId || 1,
          customerId: invoice?.customerId || 1,
          employeeId: 1,
          totalAmount: invoice?.totalAmount || 0,
          discountAmount: invoice?.discountAmount || 0,
          finalAmount: invoice?.finalAmount || 0,
          paymentMethod: invoice?.paymentMethod || 'CASH'
        })
      })
      if (response.ok) {
        alert('Đơn hàng đã được xác nhận và đang xử lý')
        loadInvoice() // Reload to get updated status
      } else {
        alert('Lỗi khi xác nhận đơn hàng')
      }
    } catch (err) {
      console.error("Error confirming order:", err)
      alert('Lỗi khi xác nhận đơn hàng')
    }
  }

  const handleCompleteOrder = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          invoiceId: invoiceId,
          status: 'Completed',
          branchId: invoice?.branchId || 1,
          customerId: invoice?.customerId || 1,
          employeeId: 1,
          totalAmount: invoice?.totalAmount || 0,
          discountAmount: invoice?.discountAmount || 0,
          finalAmount: invoice?.finalAmount || 0,
          paymentMethod: invoice?.paymentMethod || 'CASH'
        })
      })
      if (response.ok) {
        alert('Đơn hàng đã hoàn thành')
        loadInvoice() // Reload to get updated status
      } else {
        alert('Lỗi khi hoàn thành đơn hàng')
      }
    } catch (err) {
      console.error("Error completing order:", err)
      alert('Lỗi khi hoàn thành đơn hàng')
    }
  }

  const getStatusBadge = (status?: string) => {
    const config: Record<string, { label: string; class: string }> = {
      completed: { label: "Hoàn thành", class: "bg-green-100 text-green-800" },
      pending: { label: "Chờ xử lý", class: "bg-orange-100 text-orange-800" },
      processing: { label: "Đang xử lý", class: "bg-blue-100 text-blue-800" },
      cancelled: { label: "Đã hủy", class: "bg-red-100 text-red-800" },
    }
    const s = (status ?? "pending").toLowerCase()
    const cfg = config[s] ?? { label: status, class: "bg-gray-100 text-gray-800" }
    return <span className={`text-xs px-2 py-1 rounded font-medium ${cfg.class}`}>{cfg.label}</span>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-muted/30">
        <header className="border-b bg-background">
          <div className="container mx-auto px-4 h-16 flex items-center">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-red-600">{error || "Không tìm thấy hóa đơn"}</p>
              <div className="flex justify-center mt-4">
                <Button onClick={() => router.back()}>Quay lại</Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const date = invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString('vi-VN') : 'N/A'
  const customer = invoice.customerName || 'N/A'
  const phone = invoice.customerPhone || 'N/A'

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <PawPrint className="h-6 w-6 text-primary" />
              <span className="font-bold">Chi tiết hóa đơn</span>
            </div>
          </div>
          <Button onClick={() => window.open(`/sales/orders/${invoiceId}/print`, '_blank')}>
            <Printer className="h-4 w-4 mr-2" />
            In hóa đơn
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Thông tin hóa đơn */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="font-mono text-2xl mb-2">ĐH{invoiceId}</CardTitle>
                    <p className="text-sm text-muted-foreground">{date}</p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(invoice.status)}
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Khách hàng */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin khách hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Tên khách hàng</p>
                  <p className="font-medium">{customer}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Số điện thoại</p>
                  <p className="font-medium">{phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Chi nhánh</p>
                  <p className="font-medium">{invoice.branchName || 'N/A'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Sản phẩm */}
            <Card>
              <CardHeader>
                <CardTitle>Sản phẩm / Dịch vụ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Tên sản phẩm</th>
                        <th className="text-right py-2">Số lượng</th>
                        <th className="text-right py-2">Giá đơn vị</th>
                        <th className="text-right py-2">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.items && invoice.items.length > 0 ? (
                        invoice.items.map((item, idx) => {
                          let itemName = 'Đang tải...'
                          if (item.itemType === 'PRODUCT') {
                            itemName = item.productName || `Sản phẩm #${item.productId}`
                          } else if (item.itemType === 'SERVICE') {
                            itemName = item.serviceName || `Dịch vụ #${item.serviceId}`
                          } else {
                            itemName = item.productName ? `${item.productName}` : (item.serviceName ? `${item.serviceName}` : `Mục #${item.productId || item.serviceId}`)
                          }
                          return (
                            <tr key={idx} className="border-b">
                              <td className="py-2">{itemName}</td>
                              <td className="text-right">{item.quantity || 0}</td>
                              <td className="text-right">{(item.unitPrice || 0).toLocaleString()}đ</td>
                              <td className="text-right font-medium">
                                {((item.quantity || 0) * (item.unitPrice || 0)).toLocaleString()}đ
                              </td>
                            </tr>
                          )
                        })
                      ) : (
                        <tr>
                          <td colSpan={4} className="text-center py-4 text-muted-foreground">
                            Không có sản phẩm
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tóm tắt */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tóm tắt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tổng tiền:</span>
                  <span className="font-medium">{(invoice.totalAmount || 0).toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Giảm giá:</span>
                  <span className="font-medium">-{(invoice.discountAmount || 0).toLocaleString()}đ</span>
                </div>
                <div className="border-t pt-4 flex justify-between text-lg">
                  <span className="font-semibold">Tổng thanh toán:</span>
                  <span className="font-bold text-primary">{(invoice.finalAmount || 0).toLocaleString()}đ</span>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Phương thức thanh toán</p>
                  <p className="font-medium">{invoice.paymentMethod || 'N/A'}</p>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Trạng thái</p>
                  {getStatusBadge(invoice.status)}
                </div>

                <div className="pt-4 space-y-2">
                  {/* Status action buttons */}
                  {invoice.status?.toLowerCase() === 'pending' && (
                    <Button 
                      className="w-full" 
                      onClick={handleConfirmOrder}
                    >
                      Xác nhận đơn hàng
                    </Button>
                  )}
                  
                  {invoice.status?.toLowerCase() === 'processing' && (
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700" 
                      onClick={handleCompleteOrder}
                    >
                      Hoàn thành đơn hàng
                    </Button>
                  )}

                  {invoice.status?.toLowerCase() === 'completed' && (
                    <div className="text-center py-2">
                      <span className="text-sm text-green-600 font-medium">✓ Đơn hàng đã hoàn thành</span>
                    </div>
                  )}
                  
                  {/* Print and back buttons */}
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => window.open(`/sales/orders/${invoiceId}/print`, '_blank')}>
                      <Printer className="h-4 w-4 mr-2" />
                      In hóa đơn
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => router.back()}>
                      Quay lại
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
