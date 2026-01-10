"use client"

import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Check, AlertCircle } from "lucide-react"
import { apiGet, apiPut } from "@/lib/api"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface InvoiceItem {
  itemId: number
  description: string
  quantity: number
  unitPrice: number
  amount: number
}

interface Invoice {
  invoiceId: number
  customerId: number
  customerName: string
  customerPhone?: string
  invoiceDate: string
  status: string
  totalAmount: number
  discountAmount?: number
  finalAmount?: number
  notes?: string
  items: InvoiceItem[]
  paymentMethod?: string
}

export default function InvoicePaymentPage() {
  const router = useRouter()
  const params = useParams()
  const invoiceId = params.id as string

  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [paidAmount, setPaidAmount] = useState("0")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    loadInvoiceDetail()
  }, [invoiceId])

  const loadInvoiceDetail = async () => {
    try {
      setLoading(true)
      const data = await apiGet(`/invoices/${invoiceId}`)
      setInvoice(data)
      setPaidAmount((data.finalAmount || data.totalAmount).toString())
    } catch (error) {
      console.error("Error loading invoice:", error)
      setError("Lỗi khi tải hóa đơn")
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    setError("")
    setSuccess(false)

    const amount = parseFloat(paidAmount)
    if (!amount || amount <= 0) {
      setError("Vui lòng nhập số tiền hợp lệ")
      return
    }

    if (!invoice) return

    if (amount > (invoice.finalAmount || invoice.totalAmount)) {
      setError("Số tiền thanh toán không được vượt quá tổng hóa đơn")
      return
    }

    try {
      setProcessing(true)
      const updateData = {
        Status: "Paid",
        PaymentMethod: paymentMethod,
        Notes: notes || undefined,
      }

      await apiPut(`/invoices/${invoiceId}`, updateData)

      setSuccess(true)
      setTimeout(() => {
        router.push("/reception/invoices")
      }, 2000)
    } catch (error: any) {
      console.error("Error processing payment:", error)
      setError(error.message || "Lỗi khi xử lý thanh toán")
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-muted/30">
        <header className="border-b bg-background">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/reception/invoices")}
              className="bg-transparent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
            <h1 className="text-2xl font-bold">Thanh toán hóa đơn</h1>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">Không tìm thấy hóa đơn</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (invoice.status === "Paid") {
    return (
      <div className="min-h-screen bg-muted/30">
        <header className="border-b bg-background">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/reception/invoices")}
              className="bg-transparent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
            <h1 className="text-2xl font-bold">Thanh toán hóa đơn</h1>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-8 text-center">
              <Check className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <p className="text-lg font-medium">Hóa đơn này đã được thanh toán</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const totalAmount = invoice.finalAmount || invoice.totalAmount
  const amount = parseFloat(paidAmount) || 0
  const change = amount - totalAmount

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(val)
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/reception/invoices")}
            className="bg-transparent"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <h1 className="text-2xl font-bold">Thanh toán hóa đơn #{invoice.invoiceId}</h1>
        </div>
      </header>

      {success && (
        <div className="border-b bg-green-50 p-4">
          <div className="container mx-auto flex items-center gap-3 text-green-800">
            <Check className="h-5 w-5" />
            <p>Thanh toán thành công! Đang chuyển hướng...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="border-b bg-red-50 p-4">
          <div className="container mx-auto flex items-center gap-3 text-red-800">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Invoice Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Thông tin hóa đơn</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Khách hàng</p>
                  <p className="font-medium text-lg">{invoice.customerName}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Số điện thoại</p>
                  <p className="font-medium">{invoice.customerPhone || "N/A"}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Ngày lập</p>
                  <p className="font-medium">
                    {new Date(invoice.invoiceDate).toLocaleDateString("vi-VN")}
                  </p>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground mb-2">Chi tiết dịch vụ</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {(invoice.items || invoice.invoiceItems || []).map((item) => (
                      <div key={item.itemId} className="flex justify-between text-sm">
                        <span>{item.description}</span>
                        <span className="font-medium">
                          {item.quantity}x {formatCurrency(item.unitPrice)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tổng tiền:</span>
                    <span className="font-medium">{formatCurrency(invoice.totalAmount)}</span>
                  </div>
                  {invoice.discountAmount && invoice.discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Giảm giá:</span>
                      <span className="font-medium text-orange-600">
                        -{formatCurrency(invoice.discountAmount)}
                      </span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-bold">Cần thanh toán:</span>
                    <span className="font-bold text-lg text-primary">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Thông tin thanh toán</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Amount */}
                <div>
                  <Label className="text-base font-semibold mb-2 block">Số tiền thanh toán</Label>
                  <Input
                    type="number"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    placeholder="0"
                    className="text-lg font-semibold"
                    disabled={processing}
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    = {formatCurrency(parseFloat(paidAmount) || 0)}
                  </p>
                </div>

                {/* Change */}
                {change >= 0 && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">Tiền thừa</p>
                    <p className="text-lg font-bold text-green-700">
                      {formatCurrency(change)}
                    </p>
                  </div>
                )}

                {/* Payment Method */}
                <div>
                  <Label htmlFor="payment-method" className="text-base font-semibold mb-2 block">
                    Hình thức thanh toán
                  </Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod} disabled={processing}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Tiền mặt</SelectItem>
                      <SelectItem value="card">Thẻ tín dụng</SelectItem>
                      <SelectItem value="bank">Chuyển khoản ngân hàng</SelectItem>
                      <SelectItem value="e-wallet">Ví điện tử</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                <div>
                  <Label htmlFor="notes" className="text-base font-semibold mb-2 block">
                    Ghi chú (tùy chọn)
                  </Label>
                  <Input
                    id="notes"
                    placeholder="Nhập ghi chú..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={processing}
                  />
                </div>

                {/* Action Buttons */}
                <div className="border-t pt-6 space-y-3">
                  <Button
                    onClick={handlePayment}
                    disabled={processing || !paidAmount || parseFloat(paidAmount) <= 0}
                    className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-base"
                  >
                    {processing ? "Đang xử lý..." : "Xác nhận thanh toán"}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={processing}
                    className="w-full"
                  >
                    Hủy
                  </Button>
                </div>

                {/* Quick Amounts */}
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-3">Nhập nhanh</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPaidAmount(totalAmount.toString())}
                      disabled={processing}
                      className="text-xs"
                    >
                      Đúng tiền ({formatCurrency(totalAmount).replace(/\./g, "").split("₫")[0].trim()})
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPaidAmount((totalAmount * 1.05).toString())}
                      disabled={processing}
                      className="text-xs"
                    >
                      +5% Tip
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPaidAmount((totalAmount * 1.1).toString())}
                      disabled={processing}
                      className="text-xs"
                    >
                      +10% Tip
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPaidAmount((Math.ceil(totalAmount / 100000) * 100000).toString())}
                      disabled={processing}
                      className="text-xs"
                    >
                      Làm tròn
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
