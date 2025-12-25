"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download } from "lucide-react"

const mockInvoices = [
  {
    id: "HD#001234",
    date: "25/12/2024",
    customer: "Nguyễn Văn A",
    amount: "850,000 VNĐ",
    status: "Đã thanh toán",
    paymentMethod: "Chuyển khoản",
  },
  {
    id: "HD#001235",
    date: "25/12/2024",
    customer: "Trần Thị B",
    amount: "450,000 VNĐ",
    status: "Chưa thanh toán",
    paymentMethod: "Tiền mặt",
  },
  {
    id: "HD#001236",
    date: "24/12/2024",
    customer: "Lê Văn C",
    amount: "1,200,000 VNĐ",
    status: "Đã thanh toán",
    paymentMethod: "Thẻ",
  },
]

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>(mockInvoices)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const { apiGet } = await import('@/lib/api')
        const data = await apiGet('/invoices')
        if (mounted && Array.isArray(data)) setInvoices(data)
      } catch (e) {
        // keep mockInvoices on error — log for debugging
        // eslint-disable-next-line no-console
        console.error('Failed to load invoices', e)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])
  const getStatusColor = (status: any) => {
    try {
      return String(status) === "Đã thanh toán" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
    } catch {
      return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hóa đơn</h1>
          <p className="text-muted-foreground mt-1">Quản lý hóa đơn và thanh toán</p>
        </div>
      </div>

      <div className="space-y-4">
        {(loading ? [] : Array.isArray(invoices) ? invoices : []).map((invoice) => {
          const id = invoice?.invoiceId ?? invoice?.id
          const cust = invoice?.customerName ?? invoice?.customer ?? ''
          const amount = invoice?.amount ?? invoice?.total ?? invoice?.sum ?? invoice?.amountString ?? '—'
          const method = invoice?.paymentMethod ?? invoice?.method ?? ''
          return (
          <Card key={id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                  <div>
                  <h3 className="font-semibold text-lg">{id ?? '—'}</h3>
                  <p className="text-sm text-muted-foreground">{cust} - {invoice?.date ?? ''}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Số tiền</p>
                  <p className="text-xl font-bold text-primary">{typeof amount === 'number' ? amount.toLocaleString() : amount}</p>
                  <p className="text-xs text-muted-foreground mt-1">{method}</p>
                </div>

                <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Tải
                  </Button>
                  <Button size="sm">Xem</Button>
                </div>
              </div>
            </div>
          </Card>
          )
        })}
      </div>
    </div>
  )
}
