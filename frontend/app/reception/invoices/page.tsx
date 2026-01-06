"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, Download, Filter } from "lucide-react"
import { apiGet } from "@/lib/api"

interface Invoice {
  invoiceId: number
  customerName: string
  amount: number
  status: string
  date: string
  items: number
}

export default function InvoicesPage() {
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadInvoices()
  }, [])

  const loadInvoices = async () => {
    try {
      setLoading(true)
      const data = await apiGet("/invoices")
      // Transform API response to Invoice format
      const transformed = (data.items || []).map((inv: any) => ({
        invoiceId: inv.invoiceId,
        customerName: inv.customerName || "N/A",
        amount: inv.totalAmount || 0,
        status: inv.status || "Pending",
        date: new Date(inv.invoiceDate).toLocaleDateString("vi-VN"),
        items: inv.invoiceItems?.length || 0,
      }))
      setInvoices(transformed)
    } catch (error) {
      console.error("Error loading invoices:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, string> = {
      "Paid": "bg-green-100 text-green-800",
      "Pending": "bg-orange-100 text-orange-800",
      "Cancelled": "bg-red-100 text-red-800",
    }
    return statusMap[status] || "bg-gray-100 text-gray-800"
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
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
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Tạo hóa đơn
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <Card>
            <CardContent className="py-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Đang tải danh sách hóa đơn...</p>
            </CardContent>
          </Card>
        ) : invoices.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">Không có hóa đơn nào</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Danh sách hóa đơn ({invoices.length})</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent"
                >
                  <Filter className="h-4 w-4" />
                  Lọc
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.invoiceId}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-medium">HD#{invoice.invoiceId}</p>
                        <p className="text-sm text-muted-foreground">{invoice.date}</p>
                      </div>
                      <p className="text-sm">{invoice.customerName}</p>
                      <p className="text-xs text-muted-foreground">{invoice.items} mục hóa đơn</p>
                    </div>
                    <div className="text-right mr-4">
                      <p className="font-medium">{formatCurrency(invoice.amount)}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded inline-block ${getStatusBadge(
                          invoice.status
                        )}`}
                      >
                        {getStatusLabel(invoice.status)}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2 bg-transparent"
                      onClick={() => router.push(`/reception/invoices/${invoice.invoiceId}`)}
                    >
                      <Download className="h-4 w-4" />
                      Chi tiết
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
