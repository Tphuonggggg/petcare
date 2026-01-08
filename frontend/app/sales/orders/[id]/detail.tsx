"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { apiGet } from "@/lib/api"

export default function OrderDetail() {
  const router = useRouter()
  const params = useParams()
  const id = parseInt(String(params.id), 10)
  
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      apiGet(`/invoices/${id}`)
        .then(data => { setOrder(data); setLoading(false) })
        .catch(() => setLoading(false))
    }
  }, [id])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>
  if (!order) return <div className="min-h-screen flex items-center justify-center"><p className="text-red-600">Không tìm thấy hóa đơn</p></div>

  const date = order.invoiceDate ? new Date(order.invoiceDate).toLocaleDateString("vi-VN") : ""

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-bold">Chi tiết hóa đơn</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="font-mono text-2xl">ĐH{order.invoiceId}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">{date}</p>
                  </div>
                  <Badge variant="secondary">{order.status || "N/A"}</Badge>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader><CardTitle>Khách hàng</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <p><span className="text-muted-foreground">Tên:</span> {order.customerName || "N/A"}</p>
                <p><span className="text-muted-foreground">SĐT:</span> {order.customerPhone || "N/A"}</p>
                <p><span className="text-muted-foreground">Email:</span> {order.customerEmail || "N/A"}</p>
                <p><span className="text-muted-foreground">Chi nhánh:</span> {order.branchName || "N/A"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Sản phẩm / Dịch vụ</CardTitle></CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr><th className="text-left py-2">Tên</th><th className="text-right">SL</th><th className="text-right">Giá</th><th className="text-right">Tổng</th></tr>
                  </thead>
                  <tbody>
                    {order.items?.length ? order.items.map((item: any, i: number) => (
                      <tr key={i} className="border-b">
                        <td className="py-2">{item.productName || item.serviceName || "Sản phẩm"}</td>
                        <td className="text-right">{item.quantity}</td>
                        <td className="text-right">{item.unitPrice?.toLocaleString()}đ</td>
                        <td className="text-right font-medium">{item.totalPrice?.toLocaleString()}đ</td>
                      </tr>
                    )) : <tr><td colSpan={4} className="text-center py-4 text-muted-foreground">Không có sản phẩm</td></tr>}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {order.notes && <Card><CardHeader><CardTitle>Ghi chú</CardTitle></CardHeader><CardContent><p className="text-sm">{order.notes}</p></CardContent></Card>}
          </div>

          <Card>
            <CardHeader><CardTitle>Tóm tắt</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between"><span className="text-muted-foreground">Tổng tiền:</span><span>{order.totalAmount?.toLocaleString()}đ</span></div>
              {order.discountAmount > 0 && <div className="flex justify-between text-green-600"><span>Giảm giá:</span><span>-{order.discountAmount?.toLocaleString()}đ</span></div>}
              <div className="border-t pt-3 flex justify-between font-bold text-lg"><span>Thanh toán:</span><span className="text-primary">{(order.finalAmount || order.totalAmount)?.toLocaleString()}đ</span></div>
              <div className="pt-3 border-t"><p className="text-sm text-muted-foreground">Phương thức</p><p className="font-medium">{order.paymentMethod || "N/A"}</p></div>
              <Button className="w-full mt-4" onClick={() => router.back()}>Quay lại</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
