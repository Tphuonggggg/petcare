"use client"

import { useEffect, useState } from "react"
import { use } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, FileText, Calendar, DollarSign, Package } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { toast } = useToast()
  const { id } = use(params)
  const [invoice, setInvoice] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { apiGet } = await import('@/lib/api')
        const data = await apiGet(`/invoices/${id}`)
        console.log("Invoice detail:", data)
        if (mounted) setInvoice(data)
      } catch (err) {
        console.error(err)
        toast({ title: 'Lỗi', description: 'Không thể tải thông tin hóa đơn.' , variant: 'destructive' })
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [id, toast])

  if (loading) {
    return (
      <main className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </main>
    )
  }

  if (!invoice) {
    return (
      <main className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <p className="text-muted-foreground mb-4">Không tìm thấy hóa đơn.</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  const totalAmount = invoice.totalAmount || invoice.amount || invoice.finalAmount || 0
  const itemCount = invoice.items?.length || invoice.invoiceItems?.length || 0
  const issueDate = invoice.issuedAt ? new Date(invoice.issuedAt).toLocaleString('vi-VN') : (invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleString('vi-VN') : '---')

  return (
    <main className="container mx-auto p-6 max-w-4xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Quay lại
      </Button>

      {/* Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5" />
                <CardTitle>Đơn hàng #{invoice.invoiceId || id}</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">{issueDate}</p>
            </div>
            <Badge variant={invoice.status?.toLowerCase() === 'paid' ? 'default' : 'secondary'}>
              {invoice.status?.toLowerCase() === 'paid' ? '✓ Đã thanh toán' : '⏳ Chờ xử lý'}
            </Badge>
          </div>
          
          {/* Summary Info */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Ngày mua</p>
              <p className="font-semibold text-sm">{issueDate !== '---' ? issueDate.split(' ')[0] : '---'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Số lượng sản phẩm</p>
              <p className="font-semibold text-sm">{itemCount} sản phẩm</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Tổng tiền</p>
              <p className="font-semibold text-sm text-primary">{totalAmount}k</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Invoice Details */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Thông tin khách hàng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Khách hàng ID</p>
              <p className="font-medium">{invoice.customerId}</p>
            </div>
            {invoice.customerName && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Tên khách hàng</p>
                <p className="font-medium">{invoice.customerName}</p>
              </div>
            )}
            {invoice.bookingId && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Booking ID</p>
                <p className="font-medium">{invoice.bookingId}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tóm tắt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Số lượng sản phẩm</p>
                <p className="font-medium">{itemCount} sản phẩm</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Tổng tiền</p>
                <p className="text-2xl font-bold text-primary">{totalAmount}k</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Items */}
      {(invoice.items && invoice.items.length > 0) || (invoice.invoiceItems && invoice.invoiceItems.length > 0) ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Chi tiết sản phẩm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(invoice.items || invoice.invoiceItems || []).map((item: any, idx: number) => (
                <div key={idx} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="font-semibold">{item.productName || item.name || `Sản phẩm #${item.productId}`}</p>
                      <p className="text-xs text-muted-foreground mt-1">ID: {item.productId}</p>
                    </div>
                    <Badge variant="outline">{item.category || '—'}</Badge>
                  </div>
                  
                  {item.description && (
                    <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                  )}
                  
                  <div className="grid grid-cols-4 gap-4 text-sm bg-muted/30 p-3 rounded mt-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Số lượng</p>
                      <p className="font-semibold">{item.quantity}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Đơn giá</p>
                      <p className="font-semibold">{item.unitPrice || item.price || 0}k</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Thành tiền</p>
                      <p className="font-semibold text-primary">
                        {(item.totalPrice || (item.quantity * (item.unitPrice || item.price || 0)))}k
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">Tồn kho</p>
                      <p className="font-semibold">{item.stockQty || item.quantity || '—'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Row */}
            <div className="mt-6 pt-4 border-t flex justify-end">
              <div className="w-80">
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-muted-foreground">Tổng số sản phẩm:</span>
                  <span className="font-medium">{itemCount}</span>
                </div>
                <div className="flex justify-between items-center text-xl font-bold text-primary">
                  <span>Tổng cộng:</span>
                  <span>{totalAmount}k</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6">
          <CardContent className="flex flex-col items-center justify-center h-32">
            <Package className="h-12 w-12 text-muted-foreground/50 mb-2" />
            <p className="text-muted-foreground">Không có chi tiết sản phẩm</p>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => router.back()}>
              Quay lại
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
