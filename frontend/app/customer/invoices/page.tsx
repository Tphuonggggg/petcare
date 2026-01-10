"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, FileText, Calendar, DollarSign } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function InvoicesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const raw = localStorage.getItem('user')
        const parsed = raw ? JSON.parse(raw) : null
        const id = parsed && (parsed.id || parsed.customerId || parsed.CustomerId)
        console.log("=== INVOICE PAGE ===")
        console.log("Current user ID:", id)
        
        if (!id) {
          console.warn("No user ID found!")
          toast({ title: 'Chú ý', description: 'Không tìm thấy người dùng. Hãy đăng nhập hoặc bật mock mode.' })
          setInvoices([])
          setLoading(false)
          return
        }
        
        const { apiGet } = await import('@/lib/api')
        console.log("Fetching invoices...")
        // Fetch invoices filtered by customer on server-side
        const data = await apiGet(`/invoices?customerId=${id}&pageSize=1000&page=1`)
        console.log("Raw data from API:", data)
        
        let invoiceList: any[] = []
        if (data && typeof data === 'object' && data.items && Array.isArray(data.items)) {
          invoiceList = data.items
          console.log("Using paginated format, items count:", invoiceList.length)
        } else if (Array.isArray(data)) {
          invoiceList = data
          console.log("Using array format, count:", invoiceList.length)
        }
        
        console.log("Total invoices fetched:", invoiceList.length)
        
        // No need to filter since backend already filters by customerId
        const filtered = invoiceList
        
        console.log("Filtered invoices:", filtered.length)
        console.log("Filtered invoices data:", filtered)
        
        if (mounted) {
          setInvoices(filtered)
          console.log("State updated with filtered invoices")
        }
      } catch (err) {
        console.error("Error loading invoices:", err)
        toast({ title: 'Lỗi', description: 'Không thể tải danh sách hóa đơn.', variant: 'destructive' })
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [toast])

  if (loading) {
    return (
      <main className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Đang tải hóa đơn...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Lịch sử đơn hàng</h1>
            <p className="text-sm text-muted-foreground">Danh sách các đơn hàng của bạn</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/customer')}>Quay lại</Button>
        </div>
      </div>

      {invoices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <FileText className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground mb-4">Chưa có đơn hàng nào</p>
            <Button onClick={() => router.push('/customer/shop')}>
              Bắt đầu mua sắm
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <Card
              key={invoice.invoiceId || invoice.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              role="button"
              tabIndex={0}
              onClick={() => router.push(`/customer/invoices/${invoice.invoiceId || invoice.id}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') router.push(`/customer/invoices/${invoice.invoiceId || invoice.id}`)
              }}
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  {/* Left: Invoice Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-semibold text-lg">
                        Đơn hàng #{invoice.invoiceId || invoice.id}
                      </h3>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {invoice.invoiceDate
                          ? new Date(invoice.invoiceDate).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
                          : '---'}
                      </div>
                      {invoice.items && invoice.items.length > 0 && (
                        <div>
                          {invoice.items.length} sản phẩm
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Amount & Status */}
                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end mb-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div className="text-2xl font-bold text-primary">
                        {invoice.totalAmount || invoice.amount || 0}k
                      </div>
                    </div>
                    <Badge 
                      variant={invoice.status?.toLowerCase() === 'paid' ? 'default' : 'secondary'}
                      className="mb-3"
                    >
                      {invoice.status?.toLowerCase() === 'paid' ? '✓ Đã thanh toán' : '⏳ Chờ xử lý'}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                      Xem chi tiết
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}
