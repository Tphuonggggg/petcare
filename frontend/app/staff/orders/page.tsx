"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Package, User, Phone } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { apiGet } from '@/lib/api'

interface InvoiceItem {
  invoiceItemId: number
  productName?: string
  serviceName?: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface OrderData {
  invoiceId: number
  customerId: number
  branchId: number
  invoiceDate: string
  totalAmount: number
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
  invoiceItems: InvoiceItem[]
}

export default function StaffOrdersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [orders, setOrders] = useState<OrderData[]>([])
  const [loading, setLoading] = useState(true)
  const [employeeData, setEmployeeData] = useState<any>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed'>('pending')

  useEffect(() => {
    let mounted = true

    ;(async () => {
      try {
        setLoading(true)
        const userData = localStorage.getItem('employee')
        if (!userData) {
          router.push('/login')
          return
        }

        const employee = JSON.parse(userData)
        setEmployeeData(employee)
        const employeeBranchId = employee.branchId || employee.BranchId

        // Load orders for this branch
        const ordersData = await apiGet(
          `/invoices?branchId=${employeeBranchId}&pageSize=1000&page=1`
        )

        let ordersList = Array.isArray(ordersData)
          ? ordersData
          : ordersData?.items || []

        if (mounted) {
          setOrders(ordersList)
        }
      } catch (err: any) {
        console.error('Error loading orders:', err)
        toast({
          title: 'Lỗi',
          description: 'Không thể tải đơn hàng',
          variant: 'destructive'
        })
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [router, toast])

  const filteredOrders = orders.filter(order => {
    if (filter === 'pending') return order.status === 'Pending'
    if (filter === 'confirmed') return order.status === 'Confirmed' || order.status === 'Paid'
    return true
  })

  const getStatusBadge = (status: string) => {
    if (status === 'Pending') {
      return <Badge variant="outline" className="bg-yellow-50">⏳ Chờ xác nhận</Badge>
    } else if (status === 'Confirmed' || status === 'Paid') {
      return <Badge variant="default" className="bg-green-600">✓ Đã xác nhận</Badge>
    }
    return <Badge variant="secondary">{status}</Badge>
  }

  if (loading) {
    return (
      <main className="container mx-auto p-6">
        <div className="text-center py-12">Đang tải...</div>
      </main>
    )
  }

  return (
    <main className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Quản lý đơn hàng</h1>
        {employeeData && (
          <p className="text-muted-foreground mt-1">
            👤 {employeeData.name || employeeData.employeeName} - Chi nhánh {employeeData.branchName}
          </p>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          onClick={() => setFilter('pending')}
        >
          ⏳ Chờ xác nhận ({orders.filter(o => o.status === 'Pending').length})
        </Button>
        <Button
          variant={filter === 'confirmed' ? 'default' : 'outline'}
          onClick={() => setFilter('confirmed')}
        >
          ✓ Đã xác nhận ({orders.filter(o => o.status === 'Confirmed' || o.status === 'Paid').length})
        </Button>
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          Tất cả ({orders.length})
        </Button>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Không có đơn hàng</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredOrders.map(order => (
            <Card
              key={order.invoiceId}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/staff/orders/${order.invoiceId}`)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      Đơn hàng #{order.invoiceId}
                    </CardTitle>
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
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {(order.finalAmount || order.totalAmount).toLocaleString('vi-VN')} ₫
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {order.invoiceItems?.length || 0} sản phẩm
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Customer Info */}
                {order.customer && (
                  <div className="mb-4 p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 text-sm mb-1">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{order.customer.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{order.customer.phone}</span>
                    </div>
                  </div>
                )}

                {/* Items Preview */}
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Sản phẩm:</p>
                  <div className="space-y-1">
                    {order.invoiceItems?.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="text-sm text-muted-foreground">
                        • {item.productName || item.serviceName} x {item.quantity}
                      </div>
                    ))}
                    {(order.invoiceItems?.length || 0) > 3 && (
                      <div className="text-sm text-muted-foreground">
                        • ...và {(order.invoiceItems?.length || 0) - 3} sản phẩm khác
                      </div>
                    )}
                  </div>
                </div>

                {/* Date & Notes */}
                <div className="flex justify-between items-end pt-3 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(order.invoiceDate).toLocaleDateString('vi-VN')}
                  </div>
                  {order.notes && (
                    <div className="text-sm text-muted-foreground italic max-w-xs truncate">
                      "{order.notes}"
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}
