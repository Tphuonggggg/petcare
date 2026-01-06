"use client"

import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Printer, Download } from "lucide-react"
import { apiGet } from "@/lib/api"

interface InvoiceItem {
  itemId: number
  invoiceId: number
  description: string
  quantity: number
  unitPrice: number
  amount: number
}

interface InvoiceDetail {
  invoiceId: number
  customerId: number
  customerName: string
  customerPhone?: string
  branchId?: number
  branchName?: string
  employeeId?: number
  employeeName?: string
  invoiceDate: string
  status: string
  totalAmount: number
  discountAmount?: number
  finalAmount?: number
  paymentMethod?: string
  notes?: string
  items?: any[]
  invoiceItems?: any[]
}

export default function InvoiceDetailPage() {
  const router = useRouter()
  const params = useParams()
  const invoiceId = params.id as string

  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadInvoiceDetail()
  }, [invoiceId])

  const loadInvoiceDetail = async () => {
    try {
      setLoading(true)
      // Load from invoices endpoint
      const data = await apiGet(`/invoices/${invoiceId}`)
      setInvoice(data)
    } catch (error) {
      console.error("Error loading invoice:", error)
      alert("Lỗi khi tải hóa đơn")
      router.push("/reception/invoices")
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExportPDF = () => {
    // Tạo content để in
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const content = `
      <html>
      <head>
        <title>Hóa đơn #${invoice?.invoiceId}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .info { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total { text-align: right; font-weight: bold; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>HÓA ĐƠN</h1>
          <p>Số HĐ: ${invoice?.invoiceId}</p>
        </div>
        
        <div class="info">
          <p><strong>Khách hàng:</strong> ${invoice?.customerName}</p>
          <p><strong>SĐT:</strong> ${invoice?.customerPhone || "N/A"}</p>
          <p><strong>Ngày lập:</strong> ${new Date(invoice?.invoiceDate || "").toLocaleDateString("vi-VN")}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Mô tả</th>
              <th>Số lượng</th>
              <th>Đơn giá</th>
              <th>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${invoice?.items.map((item, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>${item.unitPrice.toLocaleString("vi-VN")} ₫</td>
                <td>${item.amount.toLocaleString("vi-VN")} ₫</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div style="margin-top: 20px; text-align: right;">
          <p><strong>Tổng cộng: ${invoice?.totalAmount.toLocaleString("vi-VN")} ₫</strong></p>
          <p><strong>Trạng thái:</strong> ${invoice?.status}</p>
        </div>
      </body>
      </html>
    `

    printWindow.document.write(content)
    printWindow.document.close()
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
            <h1 className="text-2xl font-bold">Chi tiết hóa đơn</h1>
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

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/reception/invoices")}
              className="bg-transparent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
            <h1 className="text-2xl font-bold">Chi tiết hóa đơn</h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-2 bg-transparent"
            >
              <Printer className="h-4 w-4" />
              In
            </Button>
            <Button
              size="sm"
              onClick={handleExportPDF}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Tải PDF
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl print:max-w-full">
        <Card className="print:border-0">
          <CardContent className="pt-8 space-y-6">
            {/* Header */}
            <div className="text-center">
              <h2 className="text-3xl font-bold">HÓA ĐƠN</h2>
              <p className="text-lg text-muted-foreground">Số HĐ: {invoice.invoiceId}</p>
            </div>

            {/* Customer Info */}
            <div className="grid grid-cols-2 gap-4 border-y py-4">
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
              <div>
                <p className="text-sm text-muted-foreground">Trạng thái</p>
                <span
                  className={`text-sm px-2 py-1 rounded font-medium ${
                    invoice.status === "Paid"
                      ? "bg-green-100 text-green-800"
                      : "bg-orange-100 text-orange-800"
                  }`}
                >
                  {invoice.status === "Paid" ? "Đã thanh toán" : "Chưa thanh toán"}
                </span>
              </div>
              {invoice.branchName && (
                <div>
                  <p className="text-sm text-muted-foreground">Chi nhánh</p>
                  <p className="font-medium">{invoice.branchName}</p>
                </div>
              )}
              {invoice.paymentMethod && (
                <div>
                  <p className="text-sm text-muted-foreground">Phương thức thanh toán</p>
                  <p className="font-medium">{invoice.paymentMethod}</p>
                </div>
              )}
            </div>

            {/* Items Table */}
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Mô tả</th>
                  <th className="text-center py-2">SL</th>
                  <th className="text-right py-2">Đơn giá</th>
                  <th className="text-right py-2">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {(invoice.items || invoice.invoiceItems || []).map((item) => (
                  <tr key={item.itemId} className="border-b">
                    <td className="py-2">{item.description}</td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-right">{item.unitPrice.toLocaleString("vi-VN")} ₫</td>
                    <td className="text-right font-medium">{item.amount.toLocaleString("vi-VN")} ₫</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2 border-t pt-4">
                <div className="flex justify-between">
                  <span>Tổng tiền:</span>
                  <span>{invoice.totalAmount.toLocaleString("vi-VN")} ₫</span>
                </div>
                {invoice.discountAmount && invoice.discountAmount > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>Giảm giá:</span>
                    <span>-{invoice.discountAmount.toLocaleString("vi-VN")} ₫</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2 text-green-600">
                  <span>Thành tiền:</span>
                  <span>{(invoice.finalAmount || invoice.totalAmount - (invoice.discountAmount || 0)).toLocaleString("vi-VN")} ₫</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground">Ghi chú</p>
                <p className="font-medium">{invoice.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <style jsx>{`
        @media print {
          button {
            display: none;
          }
          .print\\:border-0 {
            border: 0 !important;
          }
          .print\\:max-w-full {
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  )
}
