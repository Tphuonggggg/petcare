"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Printer, Check } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { apiGet, apiPost, apiPut } from '@/lib/api'

interface OrderData {
  invoiceId: number
  customerId: number
  branchId: number
  branchName?: string
  petId?: number
  invoiceDate: string
  totalAmount: number
  discountAmount: number
  finalAmount: number
  status: string
  paymentMethod: string
  notes?: string
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  items?: {
    invoiceItemId: number
    productId?: number
    productName?: string
    serviceName?: string
    quantity: number
    unitPrice: number
    totalPrice: number
    itemType: string
  }[]
}

export default function SalesOrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const invoiceId = parseInt(params.id as string, 10)
  
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    if (invoiceId) {
      loadOrder()
    }
  }, [invoiceId])

  const loadOrder = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiGet(`/invoices/${invoiceId}`)
      console.log("Order data:", data)
      setOrder(data)
    } catch (err) {
      console.error("Error loading order:", err)
      setError("Không thể tải chi tiết hóa đơn")
      toast({
        title: "Lỗi",
        description: "Không thể tải chi tiết hóa đơn",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmOrder = async () => {
    if (!order) return
    try {
      setConfirming(true)
      // If Pending, move to Processing. If Processing, move to Paid
      const nextStatus = order.status === "Pending" ? "Processing" : "Paid"
      await apiPut(`/invoices/${order.invoiceId}/status`, { status: nextStatus })
      
      // Reload order to get updated status
      await loadOrder()
      
      toast({
        title: "Thành công",
        description: "Đơn hàng đã được xác nhận"
      })
    } catch (err) {
      console.error("Error confirming order:", err)
      toast({
        title: "Lỗi",
        description: "Không thể xác nhận đơn hàng",
        variant: "destructive"
      })
    } finally {
      setConfirming(false)
    }
  }

  const handleCompleteOrder = async () => {
    if (!order) return
    try {
      setCompleting(true)
      await apiPut(`/invoices/${order.invoiceId}/status`, { status: "Paid" })
      
      // Reload order to get updated status
      await loadOrder()
      
      toast({
        title: "Thành công",
        description: "Đơn hàng đã thanh toán và hoàn thành"
      })
    } catch (err) {
      console.error("Error completing order:", err)
      toast({
        title: "Lỗi",
        description: "Không thể thanh toán đơn hàng",
        variant: "destructive"
      })
    } finally {
      setCompleting(false)
    }
  }

  const handleCancelOrder = async () => {
    if (!order) return
    try {
      setCancelling(true)
      await apiPut(`/invoices/${order.invoiceId}/status`, { status: "cancelled" })
      
      // Reload order to get updated status
      await loadOrder()
      
      toast({
        title: "Thành công",
        description: "Đơn hàng đã được hủy"
      })
    } catch (err) {
      console.error("Error cancelling order:", err)
      toast({
        title: "Lỗi",
        description: "Không thể hủy đơn hàng",
        variant: "destructive"
      })
    } finally {
      setCancelling(false)
    }
  }

  const handlePrint = () => {
    window.open(`/sales/orders/${order?.invoiceId}/print`, '_blank')
  }

  const getStatusBadge = (status?: string) => {
    const config: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: "Chờ xử lý", variant: "secondary" },
      processing: { label: "Đang xử lý", variant: "outline" },
      paid: { label: "Đã thanh toán & Hoàn thành", variant: "default" },
      cancelled: { label: "Đã hủy", variant: "destructive" },
    }
    const s = (status ?? "pending").toLowerCase()
    const cfg = config[s] ?? { label: status, variant: "outline" }
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    )
  }

  if (error || !order) {
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

  const date = order.invoiceDate ? new Date(order.invoiceDate).toLocaleDateString('vi-VN') : 'N/A'

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-bold text-xl">Chi tiết hóa đơn</h1>
          </div>
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
                    <CardTitle className="font-mono text-2xl mb-2">ĐH{order.invoiceId}</CardTitle>
                    <p className="text-sm text-muted-foreground">{date}</p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(order.status)}
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Khách hàng */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin khách hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Tên khách hàng</p>
                  <p className="font-medium">{order.customerName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Số điện thoại</p>
                  <p className="font-medium">{order.customerPhone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{order.customerEmail || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Chi nhánh</p>
                  <p className="font-medium">{order.branchName || 'N/A'}</p>
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
                      {order.items && order.items.length > 0 ? (
                        order.items.map((item, idx) => {
                          const itemName = item.productName || item.serviceName || `Mục #${item.invoiceItemId}`
                          return (
                            <tr key={idx} className="border-b">
                              <td className="py-2">{itemName}</td>
                              <td className="text-right">{item.quantity || 0}</td>
                              <td className="text-right">{(item.unitPrice || 0).toLocaleString()}đ</td>
                              <td className="text-right font-medium">
                                {(item.totalPrice || 0).toLocaleString()}đ
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

            {/* Ghi chú */}
            {order.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Ghi chú</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{order.notes}</p>
                </CardContent>
              </Card>
            )}
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
                  <span className="font-medium">{(order.totalAmount || 0).toLocaleString()}đ</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Giảm giá:</span>
                    <span className="font-medium">-{(order.discountAmount || 0).toLocaleString()}đ</span>
                  </div>
                )}
                <div className="border-t pt-4 flex justify-between text-lg">
                  <span className="font-semibold">Tổng thanh toán:</span>
                  <span className="font-bold text-primary">{(order.finalAmount || order.totalAmount || 0).toLocaleString()}đ</span>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Phương thức thanh toán</p>
                  <p className="font-medium">{order.paymentMethod || 'N/A'}</p>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Trạng thái</p>
                  {getStatusBadge(order.status)}
                </div>

                <div className="pt-4 space-y-2">
                  {order.status?.toLowerCase() === 'pending' && (
                    <>
                      <Button 
                        onClick={handleConfirmOrder}
                        disabled={confirming}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        {confirming ? "Đang xác nhận..." : "✓ Xác nhận đơn"}
                      </Button>
                    </>
                  )}

                  {order.status?.toLowerCase() === 'processing' && (
                    <>
                      <Button 
                        onClick={handleCompleteOrder}
                        disabled={completing}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        {completing ? "Đang thanh toán..." : "✓ Thanh toán"}
                      </Button>
                    </>
                  )}

                  {(order.status?.toLowerCase() === 'pending' || order.status?.toLowerCase() === 'processing') && (
                    <Button 
                      onClick={handleCancelOrder}
                      disabled={cancelling}
                      variant="destructive"
                      className="w-full"
                    >
                      {cancelling ? "Đang hủy..." : "✕ Hủy đơn hàng"}
                    </Button>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={handlePrint}
                      className="flex-1"
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      In
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => router.back()}
                      className="flex-1"
                    >
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
