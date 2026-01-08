"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, User, Phone, Mail, Droplet } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { apiGet, apiPost } from '@/lib/api'

interface InvoiceItem {
  invoiceItemId: number
  productName?: string
  serviceName?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  category?: string
  description?: string
}

interface OrderData {
  invoiceId: number
  customerId: number
  branchId: number
  petId?: number
  invoiceDate: string
  totalAmount: number
  discountAmount: number
  finalAmount: number
  status: string
  paymentMethod: string
  notes?: string
  customer?: {
    customerId: number
    name: string
    phone: string
    email: string
  }
  pet?: {
    petId: number
    name: string
    petType?: string
  }
  invoiceItems: InvoiceItem[]
}

export default function StaffOrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const orderId = params.id as string
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    let mounted = true

    ;(async () => {
      try {
        setLoading(true)
        const orderData = await apiGet(`/invoices/${orderId}`)
        if (mounted) {
          setOrder(orderData)
        }
      } catch (err: any) {
        console.error('Error loading order:', err)
        toast({
          title: 'Lỗi',
          description: 'Không thể tải thông tin đơn hàng',
          variant: 'destructive'
        })
        router.push('/staff/orders')
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [orderId, router, toast])

  const handleConfirmOrder = async () => {
    try {
      setConfirming(true)
      // Call API to confirm order (update status to Confirmed/Paid)
      await apiPost(`/invoices/${orderId}/confirm`, {})
      
      toast({
        title: 'Thành công',
        description: 'Đơn hàng đã được xác nhận'
      })
      
      // Update local state
      if (order) {
        setOrder({ ...order, status: 'Confirmed' })
      }
    } catch (err: any) {
      toast({
        title: 'Lỗi',
        description: err.message || 'Không thể xác nhận đơn hàng',
        variant: 'destructive'
      })
    } finally {
      setConfirming(false)
    }
  }

  if (loading) {
    return (
      <main className="container mx-auto p-6">
        <div className="text-center py-12">Đang tải...</div>
      </main>
    )
  }

  if (!order) {
    return (
      <main className="container mx-auto p-6">
        <div className="text-center py-12">Không tìm thấy đơn hàng</div>
      </main>
    )
  }

  const getStatusBadge = (status: string) => {
    if (status === 'Pending') {
      return <Badge className="bg-yellow-600">⏳ Chờ xác nhận</Badge>
    } else if (status === 'Confirmed' || status === 'Paid') {
      return <Badge className="bg-green-600">✓ Đã xác nhận</Badge>
    }
    return <Badge>{status}</Badge>
  }

  return (
    <main className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/staff/orders')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Đơn hàng #{order.invoiceId}</h1>
          <div className="flex gap-2 mt-2">
            {getStatusBadge(order.status)}
            <Badge variant="secondary">
              {order.paymentMethod === 'CASH' && '💵'}
              {order.paymentMethod === 'CARD' && '💳'}
              {order.paymentMethod === 'BANKING' && '🏦'}
              {order.paymentMethod === 'WALLET' && '📱'}
              {' '}{order.paymentMethod}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Thông tin khách hàng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.customer && (
              <>
                <div>
                  <div className="flex items-center gap-2 font-medium">
                    <User className="h-4 w-4" />
                    {order.customer.name}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    ID: {order.customer.customerId}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {order.customer.phone}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {order.customer.email}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Pet Info (if linked) */}
        {order.pet && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Thông tin thú cưng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 font-medium">
                <Droplet className="h-4 w-4" />
                {order.pet.name}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Loài: {order.pet.petType || 'Chưa cập nhật'}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tóm tắt đơn hàng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ngày đặt:</span>
              <span className="font-medium">
                {new Date(order.invoiceDate).toLocaleDateString('vi-VN')}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Số sản phẩm:</span>
              <span className="font-medium">{order.invoiceItems?.length || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tổng tiền:</span>
              <span className="font-medium">
                {order.totalAmount.toLocaleString('vi-VN')} ₫
              </span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-sm text-orange-600">
                <span>Giảm giá:</span>
                <span>-{order.discountAmount.toLocaleString('vi-VN')} ₫</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>Thành tiền:</span>
              <span className="text-primary text-lg">
                {order.finalAmount.toLocaleString('vi-VN')} ₫
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items Table */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Chi tiết sản phẩm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Sản phẩm</th>
                  <th className="pb-2 font-medium text-right">Đơn giá</th>
                  <th className="pb-2 font-medium text-center">Số lượng</th>
                  <th className="pb-2 font-medium text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {order.invoiceItems?.map((item, idx) => (
                  <tr key={idx} className="border-b last:border-b-0">
                    <td className="py-3">
                      <div className="font-medium">
                        {item.productName || item.serviceName}
                      </div>
                      {item.category && (
                        <div className="text-xs text-muted-foreground">
                          📁 {item.category}
                        </div>
                      )}
                      {item.description && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {item.description}
                        </div>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      {item.unitPrice.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="py-3 text-center">{item.quantity}</td>
                    <td className="py-3 text-right font-medium">
                      {item.totalPrice.toLocaleString('vi-VN')} ₫
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {order.notes && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Ghi chú từ khách hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground italic">{order.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {order.status === 'Pending' && (
        <div className="flex gap-2">
          <Button
            onClick={() => router.push('/staff/orders')}
            variant="outline"
          >
            Quay lại
          </Button>
          <Button
            onClick={handleConfirmOrder}
            disabled={confirming}
            className="flex-1"
          >
            {confirming ? 'Đang xử lý...' : '✓ Xác nhận đơn hàng'}
          </Button>
        </div>
      )}
    </main>
  )
}
