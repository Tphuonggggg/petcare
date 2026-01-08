"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PawPrint, ArrowLeft, Download, RefreshCw, TrendingUp, Calendar } from "lucide-react"
import { format } from "date-fns"
import { apiGet } from '@/lib/api'
import { useRouter } from "next/navigation"

interface SalesData {
  totalRevenue: number
  totalOrders: number
  todayRevenue: number
  last7Days: { date: string; revenue: number; orders: number }[]
  recentInvoices: any[]
}

export default function SalesReportsPage() {
  const router = useRouter()
  const [data, setData] = useState<SalesData>({
    totalRevenue: 0,
    totalOrders: 0,
    todayRevenue: 0,
    last7Days: [],
    recentInvoices: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [branchId, setBranchId] = useState<number | null>(null)

  useEffect(() => {
    // Get branchId from localStorage
    const stored = localStorage.getItem('branchId')
    if (stored) {
      setBranchId(parseInt(stored))
    }
  }, [])

  useEffect(() => {
    if (branchId) {
      loadSalesData()
    }
  }, [branchId])

  const loadSalesData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get sales dashboard data
      const dashboardData = await apiGet(`/SalesDashboard/summary?branchId=${branchId}`)
      
      // Get ALL invoices for today to calculate accurate revenue
      // Use local timezone instead of UTC
      const now = new Date()
      const today = now.getFullYear() + '-' + 
        String(now.getMonth() + 1).padStart(2, '0') + '-' + 
        String(now.getDate()).padStart(2, '0')
      
      
      // Get invoices filtered by current branch
      const allInvoicesData = await apiGet(`/invoices?page=1&pageSize=2000&branchId=${branchId}`)
      const allInvoices = allInvoicesData.items || allInvoicesData || []
      
      // Get recent invoices for display
      const recentInvoicesData = await apiGet(`/invoices?page=1&pageSize=10&branchId=${branchId}`)
      const recentInvoices = (recentInvoicesData.items || recentInvoicesData || [])
        .sort((a: any, b: any) => new Date(b.invoiceDate || b.createdDate || 0).getTime() - new Date(a.invoiceDate || a.createdDate || 0).getTime())

      // Calculate total revenue from PAID invoices
      const processedInvoices = allInvoices.filter((inv: any) => {
        const status = inv.status?.toLowerCase()
        return status === 'paid'
      })
      const totalRevenue = processedInvoices.reduce((sum: number, inv: any) => 
        sum + (inv.finalAmount || 0), 0
      )

      // Calculate today's revenue - include today's orders (including Pending)
      // Note: Status update from orders page may not be working properly
      const todayInvoices = allInvoices.filter((inv: any) => {
        const invoiceDate = inv.invoiceDate?.split('T')[0]
        const isToday = invoiceDate === today
        const status = inv.status?.toLowerCase()
        const isValidForRevenue = status === 'paid' || 
                                 (status === 'pending' && isToday) // Include today's pending orders
        
        return isToday && isValidForRevenue
      })
      
      const todayRevenue = todayInvoices.reduce((sum: number, inv: any) => 
        sum + (inv.finalAmount || 0), 0
      )

      // Calculate last 7 days data - only count COMPLETED orders  
      const last7Days = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        
        const dayInvoices = allInvoices.filter((inv: any) => 
          inv.invoiceDate?.split('T')[0] === dateStr &&
          inv.status?.toLowerCase() === 'paid'
        )
        
        const revenue = dayInvoices.reduce((sum: number, inv: any) => 
          sum + (inv.finalAmount || 0), 0
        )
        
        last7Days.push({
          date: dateStr,
          revenue,
          orders: dayInvoices.length
        })
      }

      setData({
        totalRevenue: totalRevenue,
        totalOrders: processedInvoices.length,
        todayRevenue,
        last7Days,
        recentInvoices: recentInvoices.slice(0, 5) // Show only 5 most recent
      })
    } catch (err) {
      console.error("Error loading sales data:", err)
      setError("Không thể tải dữ liệu báo cáo")
    } finally {
      setLoading(false)
    }
  }

  const exportCsv = () => {
    const rows = [['Mã hóa đơn', 'Khách hàng', 'Ngày', 'Tổng tiền', 'Trạng thái']]
    data.recentInvoices.forEach(inv => {
      rows.push([
        String(inv.invoiceId || ''),
        inv.customerName || 'N/A',
        format(new Date(inv.invoiceDate || new Date()), 'dd/MM/yyyy'),
        String(inv.finalAmount || 0),
        inv.status || 'N/A'
      ])
    })
    
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `bao-cao-doanh-thu-${format(new Date(), 'yyyy-MM-dd')}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  if (!branchId) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Chưa chọn chi nhánh</p>
          <Button onClick={() => router.push("/sales")} className="mt-4">
            Quay lại
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/sales")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <PawPrint className="h-6 w-6 text-primary" />
              <span className="font-bold">PetCare - Báo cáo bán hàng</span>
            </div>
          </div>
          <Button variant="outline" onClick={() => { import('@/lib/auth').then(m => m.logout('/')) }}>
            Đăng xuất
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Báo cáo bán hàng</h1>
            <p className="text-muted-foreground">
              Tổng quan doanh thu và lịch sử đơn hàng (lọc theo chi nhánh nếu có).
            </p>
          </div>
          <Button onClick={loadSalesData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Đang tải dữ liệu báo cáo...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadSalesData}>Thử lại</Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.totalRevenue.toLocaleString()} đ</div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Số đơn đã xử lý: {data.totalOrders}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Doanh thu hôm nay</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.todayRevenue.toLocaleString()} đ</div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {format(new Date(), 'dd/MM/yyyy')} • Bao gồm đơn hôm nay
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Hành động</CardTitle>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button 
                      onClick={exportCsv} 
                      className="w-full"
                      disabled={data.recentInvoices.length === 0}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Xuất CSV (hóa đơn)
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => router.push("/sales/orders/new")}
                      className="w-full"
                    >
                      Tạo đơn hàng
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Hóa đơn gần đây</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadSalesData}
                  disabled={loading}
                  className="ml-2"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Làm mới
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <p className="text-muted-foreground">Đang tải dữ liệu...</p>
                  </div>
                ) : data.recentInvoices.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Chưa có hóa đơn nào</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.recentInvoices.map(invoice => (
                      <div 
                        key={invoice.invoiceId} 
                        className="flex justify-between items-center p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => router.push(`/sales/orders/${invoice.invoiceId}`)}
                      >
                        <div>
                          <div className="font-medium">
                            Hóa đơn #{invoice.invoiceId}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {invoice.customerName || 'Khách lẻ'} • {' '}
                            {format(new Date(invoice.invoiceDate || new Date()), 'dd/MM/yyyy HH:mm')}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              invoice.status === 'Paid' || invoice.status === 'completed' ? 'bg-green-100 text-green-800' :
                              invoice.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {invoice.status === 'Pending' ? 'Chờ xử lý' : 
                               (invoice.status === 'Paid' || invoice.status === 'completed') ? 'Đã thanh toán' : invoice.status}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">
                            {(invoice.finalAmount || 0).toLocaleString()} đ
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {invoice.paymentMethod || 'CASH'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  )
}
