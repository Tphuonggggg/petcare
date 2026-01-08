"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PawPrint, ArrowLeft, Search, Plus, Phone, Mail, Calendar, Heart, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, User } from "lucide-react"
import { CustomerDialog } from "@/components/customer-dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type CustomerItem = {
  customerId: number
  fullName: string
  phone?: string
  email?: string
  membershipTier?: string
  petsCount?: number
  totalBookings?: number
  lastBooking?: string
  memberSince?: string
  pointsBalance?: number
}

type CustomerDetail = {
  customerId: number
  fullName: string
  phone?: string
  email?: string
  address?: string
  gender?: string
  membershipTier?: string
  pointsBalance?: number
  memberSince?: string
  pets?: Array<{
    petId: number
    name: string
    species: string
    breed?: string
  }>
  recentBookings?: Array<{
    bookingId: number
    requestedDateTime: string
    status: string
    service?: string
  }>
}

export default function ReceptionCustomersPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [allCustomers, setAllCustomers] = useState<CustomerItem[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedTier, setSelectedTier] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetail | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [membershipTiers, setMembershipTiers] = useState<Array<{ id: number; name: string }>>([])
  const pageSize = 20
  
  // Debounce refs
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    // Load membership tiers
    const loadTiers = async () => {
      try {
        const { apiGet } = await import('@/lib/api')
        const result = await apiGet('/membershiptiers?pageSize=100')
        if (result?.items && Array.isArray(result.items)) {
          setMembershipTiers(result.items.map((t: any) => ({ id: t.membershipTierId, name: t.name })))
        }
      } catch (error) {
        console.error('Failed to load membership tiers:', error)
      }
    }
    loadTiers()
  }, [])

  // Debounce search input
  useEffect(() => {
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    // Set new timer
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1) // Reset to first page when search changes
    }, 500) // Wait 500ms after user stops typing

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [searchQuery])

  useEffect(() => {
    loadCustomers()
  }, [currentPage, debouncedSearch, selectedTier])

  useEffect(() => {
    const onCustomerAdded = () => {
      setCurrentPage(1) // Reset to first page to see new customer
      setDebouncedSearch("") // Clear search
      setSearchQuery("")
    }
    window.addEventListener('customer-added', onCustomerAdded as EventListener)

    return () => {
      window.removeEventListener('customer-added', onCustomerAdded as EventListener)
    }
  }, [])

  const loadCustomers = async () => {
    try {
      setLoading(true)
      const { apiGet } = await import('@/lib/api')
      
      // Cancel previous request if it's still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
      })
      
      if (debouncedSearch.trim()) {
        params.append('search', debouncedSearch.trim())
      }
      
      if (selectedTier !== 'all') {
        params.append('tier', selectedTier)
      }

      const result = await apiGet(`/receptionistdashboard/customers?${params.toString()}`)
      
      // Only update state if this request wasn't aborted
      if (!abortControllerRef.current.signal.aborted) {
        if (result?.items && Array.isArray(result.items)) {
          const mapped = result.items.map((c: any) => ({
            customerId: c.customerId,
            fullName: c.fullName,
            phone: c.phone,
            email: c.email,
            membershipTier: c.membershipTier,
            petsCount: c.petsCount,
            totalBookings: c.totalBookings,
            lastBooking: c.lastBooking,
            memberSince: c.memberSince,
            pointsBalance: c.pointsBalance || 0
          }))
          setAllCustomers(mapped)
          setTotalCount(result.totalCount || 0)
        }
      }
    } catch (error) {
      // Ignore abort errors
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Failed to load customers:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  const loadCustomerDetail = async (customerId: number) => {
    try {
      const { apiGet } = await import('@/lib/api')
      const [customer, pets, bookings] = await Promise.all([
        apiGet(`/customers/${customerId}`),
        apiGet(`/pets?customerId=${customerId}`).catch(() => ({ items: [] })),
        apiGet(`/bookings?customerId=${customerId}`).catch(() => ({ items: [] }))
      ])

      const petsList = pets?.items || pets || []
      const bookingsList = bookings?.items || bookings || []
      
      setSelectedCustomer({
        customerId: customer.customerId,
        fullName: customer.fullName,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        gender: customer.gender,
        membershipTier: customer.membershipTier?.name || 'Standard',
        pointsBalance: customer.pointsBalance || 0,
        memberSince: customer.memberSince,
        pets: petsList,
        recentBookings: bookingsList.slice(0, 5)
      })
      setDetailDialogOpen(true)
    } catch (error) {
      console.error('Failed to load customer detail:', error)
    }
  }

  const getMembershipBadge = (membership: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      "VIP": "default",
      "Vàng": "default",
      "Gold": "default",
      "Bạc": "secondary",
      "Silver": "secondary",
      "Thường": "outline",
      "Standard": "outline",
      "Bronze": "outline"
    }
    return <Badge variant={variants[membership] || "outline"}>{membership}</Badge>
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa có'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('vi-VN')
    } catch {
      return 'Không xác định'
    }
  }

  // Pagination
  const totalPages = Math.ceil(totalCount / pageSize)

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const renderPageNumbers = () => {
    const pages = []
    const maxVisible = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    let endPage = Math.min(totalPages, startPage + maxVisible - 1)
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          onClick={() => goToPage(i)}
        >
          {i}
        </Button>
      )
    }
    return pages
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/reception")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <PawPrint className="h-6 w-6 text-primary" />
              <span className="font-bold">PetCare - Tiếp tân</span>
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
            <h1 className="text-3xl font-bold mb-2">Quản lý khách hàng</h1>
            <p className="text-muted-foreground">Thông tin và lịch sử khách hàng</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm khách hàng
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tên, số điện thoại, email..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Tabs value={selectedTier} onValueChange={setSelectedTier} suppressHydrationWarning>
                <TabsList className="w-full justify-start overflow-x-auto">
                  <TabsTrigger value="all">Tất cả</TabsTrigger>
                  {membershipTiers.length > 0 ? (
                    membershipTiers.map((tier) => (
                      <TabsTrigger key={tier.id} value={tier.name}>
                        {tier.name}
                      </TabsTrigger>
                    ))
                  ) : (
                    <>
                      <TabsTrigger value="VIP">VIP</TabsTrigger>
                      <TabsTrigger value="Gold">Vàng</TabsTrigger>
                      <TabsTrigger value="Silver">Bạc</TabsTrigger>
                      <TabsTrigger value="Standard">Thường</TabsTrigger>
                    </>
                  )}
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Danh sách khách hàng
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({totalCount} khách hàng)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Đang tải...</p>
              </div>
            ) : allCustomers.length === 0 ? (
              <div className="text-center py-12">
                <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Không tìm thấy khách hàng</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allCustomers.map((customer) => (
                    <div key={customer.customerId} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-medium text-lg">{customer.fullName}</p>
                            {getMembershipBadge(customer.membershipTier || 'Standard')}
                          </div>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="h-4 w-4" />
                              {customer.phone || 'Chưa có'}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="h-4 w-4" />
                              {customer.email || 'Chưa có'}
                            </div>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => loadCustomerDetail(customer.customerId)}
                        >
                          Chi tiết
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-4 pt-3 border-t">
                        <div>
                          <p className="text-sm text-muted-foreground">Thú cưng</p>
                          <p className="font-medium flex items-center gap-1">
                            <Heart className="h-4 w-4 text-primary" />
                            {customer.petsCount || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Lượt khám</p>
                          <p className="font-medium flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-primary" />
                            {customer.totalBookings || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Lần cuối</p>
                          <p className="font-medium text-sm">{formatDate(customer.lastBooking)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Trang {currentPage} / {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      
                      <div className="flex gap-1">
                        {renderPageNumbers()}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(totalPages)}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronsRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Customer Detail Dialog */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Thông tin khách hàng</DialogTitle>
            </DialogHeader>
            {selectedCustomer && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">{selectedCustomer.fullName}</h3>
                    {getMembershipBadge(selectedCustomer.membershipTier || 'Standard')}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedCustomer.phone || 'Chưa có'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedCustomer.email || 'Chưa có'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Thành viên từ: {formatDate(selectedCustomer.memberSince)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>Điểm: {selectedCustomer.pointsBalance || 0}</span>
                    </div>
                  </div>

                  {selectedCustomer.address && (
                    <p className="text-sm text-muted-foreground">
                      Địa chỉ: {selectedCustomer.address}
                    </p>
                  )}
                </div>

                {/* Pets */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    Thú cưng ({selectedCustomer.pets?.length || 0})
                  </h4>
                  {selectedCustomer.pets && selectedCustomer.pets.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {selectedCustomer.pets.map((pet) => (
                        <div key={pet.petId} className="p-3 border rounded-lg">
                          <p className="font-medium">{pet.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {pet.species} {pet.breed ? `- ${pet.breed}` : ''}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Chưa có thú cưng</p>
                  )}
                </div>

                {/* Recent Bookings */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Lịch hẹn gần đây
                  </h4>
                  {selectedCustomer.recentBookings && selectedCustomer.recentBookings.length > 0 ? (
                    <div className="space-y-2">
                      {selectedCustomer.recentBookings.map((booking) => (
                        <div key={booking.bookingId} className="p-3 border rounded-lg flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">
                              {new Date(booking.requestedDateTime).toLocaleString('vi-VN')}
                            </p>
                            {booking.service && (
                              <p className="text-sm text-muted-foreground">{booking.service}</p>
                            )}
                          </div>
                          <Badge variant={booking.status === 'Completed' ? 'default' : 'outline'}>
                            {booking.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Chưa có lịch hẹn</p>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <CustomerDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      </main>
    </div>
  )
}
