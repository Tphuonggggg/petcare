"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Mail, Phone, MapPin } from "lucide-react"
import { CustomerDialog } from "@/components/customer-dialog"
import { apiGet } from "@/lib/api"

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ")
}

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setCurrentPage(1) // Reset page when search changes
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const url = `/customers?page=${currentPage}&pageSize=${pageSize}${debouncedSearchTerm ? `&search=${encodeURIComponent(debouncedSearchTerm)}` : ''}`
        const data = await apiGet(url)
        if (mounted && Array.isArray(data)) {
          setCustomers(data)
          setTotalCount(data.length)
        } else if (mounted && data?.items && Array.isArray(data.items)) {
          setCustomers(data.items)
          setTotalCount(data.totalCount || 0)
        }
      } catch (e) {
        console.error('fetch customers failed', e)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [currentPage, pageSize, debouncedSearchTerm])

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "VIP":
        return "bg-purple-100 text-purple-700"
      case "Vàng":
        return "bg-yellow-100 text-yellow-700"
      case "Bạc":
        return "bg-gray-100 text-gray-700"
      default:
        return "bg-blue-100 text-blue-700"
    }
  }

  const handleViewDetails = (customer: any) => {
    setSelectedCustomer(customer)
    setIsDialogOpen(true)
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  const content = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Khách hàng</h1>
          <p className="text-muted-foreground mt-1">Quản lý thông tin khách hàng</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm khách hàng
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Tổng cộng <span className="font-semibold">{totalCount.toLocaleString()}</span> khách hàng
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên, email, số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {(loading ? [] : customers).map((customer) => {
          const id = customer?.customerId ?? customer?.id
          const name = customer?.fullName ?? customer?.name ?? 'Khách hàng'
          const email = customer?.email ?? customer?.contactEmail ?? ''
          const phone = customer?.phone ?? customer?.mobile ?? ''
          const address = customer?.address ?? ''
          const membership = customer?.membershipTier ?? customer?.tier ?? '—'
          const points = customer?.points ?? customer?.pointsBalance ?? 0
          const pets = customer?.pets ?? (customer?.petCount ?? 0)
          return (
          <Card key={id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{name}</h3>
                  <Badge className={cn("mt-1", getTierColor(membership))}>{membership}</Badge>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Điểm tích lũy</p>
                  <p className="text-lg font-bold text-primary">{points}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="text-balance">{email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{phone}</span>
                </div>
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5" />
                  <span className="text-balance">{address}</span>
                </div>
              </div>

              <div className="pt-4 border-t flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{pets} thú cưng</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleViewDetails(customer)}
                >
                  Xem chi tiết
                </Button>
              </div>
            </div>
          </Card>
        )})}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button
            variant="outline"
            disabled={currentPage === 1 || loading}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          >
            ← Trước
          </Button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Trang</span>
            <input
              type="number"
              min="1"
              max={totalPages}
              value={currentPage}
              onChange={(e) => {
                const page = Math.max(1, Math.min(totalPages, parseInt(e.target.value) || 1))
                setCurrentPage(page)
              }}
              className="w-16 px-2 py-1 border rounded text-center"
              disabled={loading}
            />
            <span className="text-sm text-muted-foreground">trên {totalPages.toLocaleString()}</span>
          </div>
          
          <Button
            variant="outline"
            disabled={currentPage === totalPages || loading}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          >
            Sau →
          </Button>
        </div>
      )}

      <CustomerDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        customer={selectedCustomer}
      />
    </div>
  )

  return content
}
