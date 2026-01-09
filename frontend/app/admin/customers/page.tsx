"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from '@/hooks/use-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Mail, Phone, MapPin } from 'lucide-react'
import { parseISO } from 'date-fns'

export default function AdminCustomersPage() {
  const router = useRouter()
  const [allCustomers, setAllCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        console.log(`[ADMIN CUSTOMERS] Fetching all customers, page=${currentPage}, pageSize=${pageSize}`)
        const { apiGet } = await import('@/lib/api')
        // Fetch all customers without branchId filter
        const res = await apiGet(`/customers?page=${currentPage}&pageSize=${pageSize}`)
        console.log('[ADMIN CUSTOMERS] API response:', res)
        
        if (!mounted) return
        
        // Handle both array and PaginatedResult
        if (Array.isArray(res)) {
          console.log('[ADMIN CUSTOMERS] Response is array, length:', res.length)
          setAllCustomers(res)
          setTotalCount(res.length)
        } else if (res?.items) {
          console.log('[ADMIN CUSTOMERS] Response has items:', res.items.length, 'Total:', res.totalCount)
          setAllCustomers(res.items)
          setTotalCount(res.totalCount || res.items.length)
        } else {
          console.log('[ADMIN CUSTOMERS] Unexpected response format:', res)
        }
      } catch (err) {
        console.error('[ADMIN CUSTOMERS] Error:', err)
        toast({ title: 'Lỗi', description: 'Không thể tải danh sách khách hàng', variant: 'destructive' })
      } finally {
        setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [currentPage, pageSize])

  async function handleDelete(id: number) {
    if (!confirm('Xác nhận xóa khách hàng?')) return
    try {
      const { apiDelete } = await import('@/lib/api')
      await apiDelete(`/customers/${id}`)
      setAllCustomers(s => s.filter(i => (i.id || i.customerId) !== id))
      setTotalCount(t => Math.max(0, t - 1))
      toast({ title: 'Đã xóa', description: 'Khách hàng đã được xóa.' })
    } catch (err: any) {
      console.error(err)
      toast({ title: 'Lỗi', description: err?.message || String(err), variant: 'destructive' })
    }
  }

  const filtered = allCustomers.filter(i => {
    if (!query) return true
    const q = query.toLowerCase()
    return (i.fullName || i.name || '').toLowerCase().includes(q) 
      || (i.email || '').toLowerCase().includes(q) 
      || String(i.phone || '').includes(q)
  })

  // Use filtered.length for pagination calculation (client-side filtering)
  const displayTotalCount = query ? filtered.length : totalCount
  const totalPages = Math.ceil(displayTotalCount / pageSize)
  
  // For pagination, show items from current page
  const paginatedItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  
  console.log('[ADMIN CUSTOMERS] State:', { 
    allCustomers: allCustomers.length, 
    filtered: filtered.length,
    displayTotalCount, 
    pageSize, 
    totalPages, 
    currentPage,
    paginatedItems: paginatedItems.length
  })

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Khách hàng</h2>
            <p className="text-sm text-muted-foreground">Quản lý thông tin khách hàng</p>
          </div>
          <div className="flex items-center gap-2">
            <Input 
              className="w-96 max-w-full flex-none" 
              placeholder="Tìm kiếm tên, email, điện thoại" 
              value={query} 
              onChange={(e) => {
                setQuery(e.target.value)
                setCurrentPage(1)
              }} 
            />
            <Button onClick={() => router.push('/admin/customers/new')}>Thêm khách hàng</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="text-muted-foreground">Đang tải khách hàng...</div>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">Không có khách hàng.</div>
            </CardContent>
          </Card>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedItems.map((c) => {
                const id = c.customerId ?? c.id
                const name = c.fullName ?? c.name ?? 'Khách hàng'
                const email = c.email ?? ''
                const phone = c.phone ?? ''
                const address = c.address ?? ''
                const points = c.pointsBalance ?? c.points ?? 0
                const tier = c.membershipTier ?? c.tier ?? '—'
                const pets = c.petsCount ?? c.pets ?? 0
                
                return (
                  <Card key={id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/admin/customers/${id}`)}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{name}</CardTitle>
                          <div className="text-xs text-muted-foreground mt-1">Điểm tích lũy</div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-primary">{points}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2 text-sm">
                        {email && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            <span className="break-all">{email}</span>
                          </div>
                        )}
                        {phone && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span>{phone}</span>
                          </div>
                        )}
                        {address && (
                          <div className="flex items-start gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span className="break-words">{address}</span>
                          </div>
                        )}
                      </div>
                      <div className="pt-3 border-t flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{pets} thú cưng</span>
                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); router.push(`/admin/customers/${id}`) }}>
                          Xem chi tiết
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Trang {currentPage} / {totalPages} (Tổng: {displayTotalCount} khách hàng{query && ` - Tìm kiếm: "${query}"`})
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => Math.abs(p - currentPage) <= 2 || p === 1 || p === totalPages)
                      .map((p, idx, arr) => (
                        <div key={p}>
                          {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-2">...</span>}
                          <Button
                            variant={p === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(p)}
                          >
                            {p}
                          </Button>
                        </div>
                      ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
