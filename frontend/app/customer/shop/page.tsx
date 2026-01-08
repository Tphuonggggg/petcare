"use client"

import { useEffect, useState } from 'react'
import { getSelectedBranchId } from '@/lib/branch'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Package, Search, ShoppingCart, Plus, Minus, Trash2, Calendar } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { apiPost } from '@/lib/api'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OrderDialog } from '@/components/order-dialog'

interface Product {
  productId?: number
  id?: number
  name?: string
  productName?: string
  category?: string
  unit?: string
  price?: number
  cost?: number
  description?: string
  image?: string
}

interface CartItem extends Product {
  qty: number
}

export default function ShopPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<CartItem[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [loadingInvoices, setLoadingInvoices] = useState(false)
  const [activeTab, setActiveTab] = useState('shop')
  const [pets, setPets] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [orderDialogOpen, setOrderDialogOpen] = useState(false)
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)
  
  // Filter/Search states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { apiGet } = await import('@/lib/api')
        const branchId = getSelectedBranchId()
        const data = branchId ? await apiGet('/products?branchId=' + encodeURIComponent(branchId)) : await apiGet('/products')
        console.log("Products from API:", data)
        
        let productList: Product[] = []
        
        // Handle paginated response
        if (data && typeof data === 'object' && data.items && Array.isArray(data.items)) {
          productList = data.items
        } else if (Array.isArray(data)) {
          productList = data
        }
        
        console.log("Product list:", productList)
        if (mounted) {
          setProducts(productList)
          // Extract unique categories
          const cats = Array.from(new Set(productList.map(p => p.category || p.productCategory || '—'))) as string[]
          console.log("Categories:", cats)
          setCategories(cats)
        }
      } catch (err) {
        console.error("Error loading products:", err)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    // load cart
    try {
      const raw = localStorage.getItem('cart_v1')
      setCart(raw ? JSON.parse(raw) : [])
    } catch {}
    
    // load pets
    ;(async () => {
      try {
        const raw = localStorage.getItem('user')
        const user = raw ? JSON.parse(raw) : null
        if (!user) return
        
        const { apiGet } = await import('@/lib/api')
        const customerId = user.id || user.customerId
        const petsData = await apiGet(`/pets?customerId=${customerId}`)
        let petsList = Array.isArray(petsData) ? petsData : petsData?.items || []
        if (mounted) {
          setPets(petsList)
        }
      } catch (err) {
        console.error("Error loading pets:", err)
      }
    })()

    // load branches
    ;(async () => {
      try {
        const { apiGet } = await import('@/lib/api')
        const branchesData = await apiGet('/branches')
        let branchesList = Array.isArray(branchesData) ? branchesData : branchesData?.items || []
        if (mounted) {
          setBranches(branchesList)
        }
      } catch (err) {
        console.error("Error loading branches:", err)
      }
    })()
    
    return () => { mounted = false }
  }, [])

  // Apply filters and search
  useEffect(() => {
    let result = [...products]

    // Search filter
    if (searchTerm) {
      result = result.filter(p => {
        const name = (p.name || p.productName || '').toLowerCase()
        return name.includes(searchTerm.toLowerCase())
      })
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(p => (p.category || p.productCategory || '—') === selectedCategory)
    }

    // Sort
    if (sortBy === 'name') {
      result.sort((a, b) => (a.name || a.productName || '').localeCompare(b.name || b.productName || ''))
    } else if (sortBy === 'price-low') {
      result.sort((a, b) => (a.price || a.cost || 0) - (b.price || b.cost || 0))
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => (b.price || b.cost || 0) - (a.price || a.cost || 0))
    }

    setCurrentPage(1)
    setFilteredProducts(result)
    console.log("Filtered products:", result.length, result)
  }, [searchTerm, selectedCategory, sortBy, products])

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  function persistCart(next: CartItem[]) {
    setCart(next)
    try {
      localStorage.setItem('cart_v1', JSON.stringify(next))
    } catch {}
  }

  function addToCart(product: Product) {
    const existing = cart.find((c) => c.id === (product.id || product.productId) || c.productId === (product.productId || product.id))
    let next
    if (existing) {
      next = cart.map(c => (c.id === (product.id || product.productId) || c.productId === (product.productId || product.id)) ? { ...c, qty: c.qty + 1 } : c)
    } else {
      next = [...cart, { ...product, qty: 1 } as CartItem]
    }
    persistCart(next)
    toast({ title: 'Đã thêm', description: `${product.name || product.productName} đã được thêm vào giỏ.` })
  }

  function updateQty(id: number, qty: number) {
    if (qty <= 0) {
      removeFromCart(id)
    } else {
      const next = cart.map(c => (c.id === id || c.productId === id) ? { ...c, qty } : c)
      persistCart(next)
    }
  }

  function removeFromCart(id: number) {
    const next = cart.filter(c => c.id !== id && c.productId !== id)
    persistCart(next)
  }

  function clearCart() {
    persistCart([])
    toast({ title: 'Giỏ hàng', description: 'Giỏ hàng đã được xóa.' })
  }

  async function checkout() {
    // Open order dialog instead of directly creating invoice
    setOrderDialogOpen(true)
  }

  async function handleOrderSubmit(orderInfo: { branchId: number; petId?: number; paymentMethod: string; notes?: string }) {
    try {
      setIsSubmittingOrder(true)
      const userData = localStorage.getItem('user')
      if (!userData) {
        router.push('/login')
        return
      }

      const user = JSON.parse(userData)
      const customerId = parseInt(String(user.id || user.customerId || user.CustomerId), 10)
      
      if (!customerId || isNaN(customerId)) {
        toast({
          title: 'Lỗi',
          description: 'Không thể xác định khách hàng. Vui lòng đăng nhập lại.',
          variant: 'destructive'
        })
        router.push('/login')
        return
      }

      // Create invoice with order details
      const totalAmount = cart.reduce((s, c) => s + (c.price || c.cost || 0) * (c.qty || 1), 0)
      
      const invoiceData = {
        customerId,
        branchId: orderInfo.branchId,
        petId: orderInfo.petId || null,
        paymentMethod: orderInfo.paymentMethod,
        notes: orderInfo.notes,
        totalAmount,
        discountAmount: 0,
        finalAmount: totalAmount,
        status: 'Pending',
        items: cart.map(item => ({
          productId: parseInt(String(item.productId || item.id), 10),
          quantity: item.qty || 1,
          unitPrice: item.price || item.cost || 0,
          totalPrice: (item.price || item.cost || 0) * (item.qty || 1),
          itemType: 'Product'
        }))
      }

      const result = await apiPost('/invoices', invoiceData)
      
      if (result) {
        toast({
          title: 'Thành công',
          description: 'Đơn hàng đã được tạo thành công! Nhân viên sẽ xác nhận trong thời gian sớm.'
        })
        clearCart()
        setIsSubmittingOrder(false)
        router.push('/customer/invoices')
      }
    } catch (error: any) {
      setIsSubmittingOrder(false)
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể tạo đơn hàng',
        variant: 'destructive'
      })
      throw error
    }
  }

  const total = cart.reduce((s, c) => s + (c.price || c.cost || 0) * (c.qty || 1), 0)

  const loadInvoices = async () => {
    try {
      setLoadingInvoices(true)
      const userData = localStorage.getItem('user')
      if (!userData) {
        router.push('/login')
        return
      }
      const user = JSON.parse(userData)
      const customerId = user.id || user.customerId || user.CustomerId
      
      console.log("loadInvoices: Current user ID =", customerId)
      
      const { apiGet } = await import('@/lib/api')
      const data = await apiGet(`/invoices?customerId=${customerId}&pageSize=1000&page=1`)
      
      let invoiceList: any[] = []
      if (data && typeof data === 'object' && data.items && Array.isArray(data.items)) {
        invoiceList = data.items
      } else if (Array.isArray(data)) {
        invoiceList = data
      }
      
      console.log("Total invoices from API:", invoiceList.length)
      
      // No need to filter since backend already filters by customerId
      const filtered = invoiceList
      console.log("Filtered invoices for customer " + customerId + ":", filtered.length)
      
      setInvoices(filtered)
    } catch (error: any) {
      console.error("Error loading invoices:", error)
      toast({
        title: 'Lỗi',
        description: 'Không thể tải lịch sử đơn hàng',
        variant: 'destructive'
      })
    } finally {
      setLoadingInvoices(false)
    }
  }

  return (
    <main className="container mx-auto p-6 max-w-7xl">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Cửa hàng</h1>
            <p className="text-sm text-muted-foreground">Mua sắm các sản phẩm cho thú cưng</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/customer')}>Quay lại</Button>
        </div>

        <TabsList className="mb-6">
          <TabsTrigger value="shop">Cửa hàng</TabsTrigger>
          <TabsTrigger value="history" onClick={() => {
            console.log("History tab clicked, setting to history")
            setActiveTab('history')
            loadInvoices()
          }}>Lịch sử đơn hàng</TabsTrigger>
        </TabsList>

        {/* Shop Tab */}
        <TabsContent value="shop" className="w-full">
          <div className="flex items-start gap-6">
            <div className="flex-1">
              {/* Search and Filters */}
              <div className="grid gap-4 md:grid-cols-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm sản phẩm..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Tên sản phẩm</SelectItem>
                  <SelectItem value="price-low">Giá: Thấp đến cao</SelectItem>
                  <SelectItem value="price-high">Giá: Cao đến thấp</SelectItem>
                </SelectContent>
              </Select>

              <div className="text-sm text-muted-foreground flex items-center justify-end">
                Hiển thị {paginatedProducts.length} / {filteredProducts.length}
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {(loading ? Array(9).fill(null) : paginatedProducts).map((p, idx) => {
              if (!p) return <Card key={idx} className="animate-pulse" />
              const id = p.productId ?? p.id
              const name = p.name ?? p.productName ?? 'Sản phẩm'
              const category = p.category ?? '—'
              const unit = p.unit ?? '—'
              const price = p.price ?? p.cost ?? 0
              return (
                <Card key={id} className="p-4 hover:shadow-lg transition-shadow flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    {p.image ? (
                      <img src={p.image} alt={name} className="h-16 w-16 object-cover rounded bg-muted" />
                    ) : (
                      <div className="h-16 w-16 rounded bg-muted flex items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <Badge variant="outline" className="text-xs">{category}</Badge>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold line-clamp-2">{name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{unit}</p>
                    <p className="text-lg font-bold mt-2">{price}k</p>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <Button size="sm" onClick={() => addToCart(p)} className="flex-1">
                      <Plus className="h-4 w-4 mr-1" />
                      Thêm
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => router.push(`/customer/shop/${id}`)}>
                      Chi tiết
                    </Button>
                  </div>
                </Card>
              )
            })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Trước
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    onClick={() => setCurrentPage(page)}
                    className="w-10"
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Sau
                </Button>
              </div>
            )}
            </div>

            {/* Shopping Cart Sidebar */}
            <aside className="w-96 sticky top-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                <CardTitle>Giỏ hàng ({cart.length})</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <p className="text-sm text-muted-foreground">Giỏ hàng trống.</p>
              ) : (
                <ul className="space-y-4">
                  {cart.map((c) => {
                    const itemId = c.id || c.productId
                    const itemPrice = c.price || c.cost || 0
                    return (
                      <li key={itemId} className="border-b pb-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="font-medium text-sm line-clamp-2">{c.name || c.productName}</div>
                            <div className="text-sm text-muted-foreground mt-1">{itemPrice}k × {c.qty}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-sm">{(itemPrice * c.qty)}k</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => updateQty(itemId!, c.qty - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium flex-1 text-center">{c.qty}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => updateQty(itemId!, c.qty + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-destructive"
                            onClick={() => removeFromCart(itemId!)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}

              <div className="pt-4 border-t mt-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm font-medium">Tổng cộng</div>
                  <div className="text-2xl font-bold">{total}k</div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={checkout}
                    disabled={cart.length === 0}
                    className="flex-1"
                  >
                    Đặt mua
                  </Button>
                  <Button variant="outline" onClick={clearCart} disabled={cart.length === 0}>
                    Xóa tất cả
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
            </aside>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <div className="max-w-4xl">
            {loadingInvoices ? (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <p className="text-muted-foreground">Đang tải lịch sử đơn hàng...</p>
                </CardContent>
              </Card>
            ) : invoices.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-64">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-4">Chưa có lịch sử đơn hàng</p>
                  <Button onClick={() => {
                    const tabsContainer = document.querySelector('[role="tab"][value="shop"]')
                    if (tabsContainer) (tabsContainer as HTMLElement).click()
                  }}>
                    Bắt đầu mua sắm
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <Card key={invoice.invoiceId || invoice.id} className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => router.push(`/customer/invoices/${invoice.invoiceId || invoice.id}`)}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">
                            Đơn hàng #{invoice.invoiceId || invoice.id}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            <Calendar className="inline mr-1 h-4 w-4" />
                            {invoice.issuedAt ? new Date(invoice.issuedAt).toLocaleString('vi-VN') : '---'}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {invoice.totalAmount || invoice.amount || 0}k
                          </div>
                          <Badge variant={invoice.paid ? 'default' : 'secondary'} className="mt-2">
                            {invoice.paid ? 'Đã xác nhận' : 'Chờ xác nhận'}
                          </Badge>
                        </div>
                      </div>
                      
                      {invoice.invoiceItems && invoice.invoiceItems.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-sm font-medium mb-3">Chi tiết sản phẩm:</p>
                          <div className="space-y-2">
                            {invoice.invoiceItems.map((item: any, idx: number) => (
                              <div key={idx} className="bg-muted/50 p-2.5 rounded flex justify-between items-center">
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{item.productName || `Sản phẩm #${item.productId}`}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {item.quantity} × {item.unitPrice}k = <span className="font-semibold text-foreground">{item.quantity * item.unitPrice}k</span>
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-4 pt-4 border-t flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          {invoice.invoiceItems?.length || 0} sản phẩm
                        </span>
                        <span className="text-sm font-semibold text-primary cursor-pointer hover:underline">
                          Xem chi tiết →
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Order Dialog */}
      <OrderDialog
        open={orderDialogOpen}
        onOpenChange={setOrderDialogOpen}
        pets={pets}
        branches={branches}
        onSubmit={handleOrderSubmit}
        isLoading={isSubmittingOrder}
      />
    </main>
  )
}
