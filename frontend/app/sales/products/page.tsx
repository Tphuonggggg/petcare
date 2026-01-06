"use client"

import { useState, useEffect } from "react"
import { getSelectedBranchId, getSelectedBranchName } from '@/lib/branch'
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PawPrint, ArrowLeft, Search, Plus, Package, Filter, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { apiGet, apiPut } from "@/lib/api"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

interface Product {
  productId: number
  name: string
  category?: string
  price: number
  quantity: number
  status?: string
  description?: string
  reorderPoint?: number
  stockQty?: number
}

export default function SalesProductsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [highlightId, setHighlightId] = useState<number | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [isMounted, setIsMounted] = useState(false)
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const pageSize = 12
  
  // Dialog states
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [addProductDialogOpen, setAddProductDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [importQuantity, setImportQuantity] = useState<number>(1)
  const [importing, setImporting] = useState(false)
  
  // Add Product Form states
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: 0,
    quantity: 0,
    description: ''
  })
  const [addingProduct, setAddingProduct] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  useEffect(() => {
    setIsMounted(true)
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search)
        const h = params.get('highlight')
        if (h) setHighlightId(Number(h))
      }
    } catch {}
  }, [])

  useEffect(() => {
    loadProducts()
  }, [currentPage])

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1)
    } else {
      loadProducts()
    }
  }, [searchQuery, selectedCategory, sortBy, sortOrder])

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiGet(`/products?page=${currentPage}&pageSize=${pageSize}`)
      const productList = data.items || data || []
      setProducts(Array.isArray(productList) ? productList : [])
      
      // Update pagination info
      const totalCount = data.totalCount || productList.length || 0
      setTotalProducts(totalCount)
      setTotalPages(Math.ceil(totalCount / pageSize) || 1)
    } catch (err) {
      console.error("Error loading products:", err)
      setError("Không thể tải danh sách sản phẩm")
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const getCategories = () => {
    const cats = new Set(products.map(p => p.category || 'Khác').filter(Boolean))
    return Array.from(cats).sort()
  }

  const handleImportStock = async () => {
    if (!selectedProduct || importQuantity <= 0) return
    
    try {
      setImporting(true)
      const newQuantity = selectedProduct.quantity + importQuantity
      
      // Call update API - adjust based on your backend
      // For now, assuming you have a PUT endpoint to update product quantity
      // const result = await apiPut(`/products/${selectedProduct.productId}`, { 
      //   ...selectedProduct, 
      //   quantity: newQuantity 
      // })
      
      // For demo, just update locally and show success
      setProducts(prev => prev.map(p => 
        p.productId === selectedProduct.productId 
          ? { ...p, quantity: newQuantity }
          : p
      ))
      
      alert(`Nhập hàng thành công! Tồn kho mới: ${newQuantity}`)
      setImportDialogOpen(false)
      setImportQuantity(1)
      setSelectedProduct(null)
    } catch (err) {
      console.error("Error importing stock:", err)
      alert('Lỗi khi nhập hàng')
    } finally {
      setImporting(false)
    }
  }

  const getFilteredAndSortedProducts = () => {
    let filtered = products
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query) ||
        p.productId.toString().includes(query)
      )
    }
    
    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(p => (p.category || 'Khác') === selectedCategory)
    }
    
    // Sort
    const sorted = [...filtered].sort((a, b) => {
      let aVal: any = a.name
      let bVal: any = b.name
      
      if (sortBy === 'price') {
        aVal = a.price
        bVal = b.price
      } else if (sortBy === 'stock') {
        aVal = a.quantity
        bVal = b.quantity
      }
      
      if (typeof aVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
    })
    
    return sorted
  }

  const openDetailDialog = (product: Product) => {
    setSelectedProduct(product)
    setDetailDialogOpen(true)
  }

  const openImportDialog = (product: Product) => {
    setSelectedProduct(product)
    setImportQuantity(1)
    setImportDialogOpen(true)
  }

  const handleAddProduct = async () => {
    try {
      setAddError(null)
      
      // Validation
      if (!newProduct.name.trim()) {
        setAddError('Vui lòng nhập tên sản phẩm')
        return
      }
      if (newProduct.price < 0) {
        setAddError('Giá bán phải lớn hơn 0')
        return
      }
      if (newProduct.quantity < 0) {
        setAddError('Tồn kho phải lớn hơn 0')
        return
      }

      setAddingProduct(true)

      // Call API to create product
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProduct.name,
          category: newProduct.category || 'Khác',
          price: newProduct.price,
          stockQty: newProduct.quantity,
          description: newProduct.description
        })
      })

      if (response.ok) {
        alert('Thêm sản phẩm thành công!')
        setNewProduct({ name: '', category: '', price: 0, quantity: 0, description: '' })
        setAddProductDialogOpen(false)
        loadProducts() // Reload danh sách
      } else {
        const errData = await response.json()
        setAddError(errData.message || 'Lỗi khi thêm sản phẩm')
      }
    } catch (err) {
      console.error("Error adding product:", err)
      setAddError('Lỗi: ' + (err instanceof Error ? err.message : 'Không xác định'))
    } finally {
      setAddingProduct(false)
    }
  }

  const handleResetAddForm = () => {
    setNewProduct({ name: '', category: '', price: 0, quantity: 0, description: '' })
    setAddError(null)
    setAddProductDialogOpen(false)
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
              <span className="font-bold">PetCare - Bán hàng</span>
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
            <h1 className="text-3xl font-bold mb-2">Quản lý sản phẩm</h1>
            <p className="text-muted-foreground">Danh sách sản phẩm và tồn kho</p>
          </div>
          <Button onClick={() => setAddProductDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm sản phẩm
          </Button>
        </div>

        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên, category, ID sản phẩm..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {/* Category Filter */}
            {isMounted && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Danh mục {selectedCategory && `(${selectedCategory})`}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSelectedCategory(null)}>
                    Tất cả
                  </DropdownMenuItem>
                  {getCategories().map(cat => (
                    <DropdownMenuItem key={cat} onClick={() => setSelectedCategory(cat)}>
                      {cat}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Sort By */}
            {isMounted && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Sắp xếp: {sortBy === 'name' ? 'Tên' : sortBy === 'price' ? 'Giá' : 'Tồn kho'}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSortBy('name')}>Tên</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('price')}>Giá</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('stock')}>Tồn kho</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Sort Order */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑ Tăng' : '↓ Giảm'}
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">Đang tải sản phẩm...</p>
            </div>
          ) : error ? (
            <div className="col-span-full text-center py-8">
              <p className="text-red-600">{error}</p>
              <Button onClick={loadProducts} className="mt-4">Thử lại</Button>
            </div>
          ) : getFilteredAndSortedProducts().length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">Không có sản phẩm nào</p>
            </div>
          ) : (
            getFilteredAndSortedProducts().map((product) => {
              const stock = product.quantity || 0
              const status = stock === 0 ? 'out-of-stock' : stock < 10 ? 'low-stock' : 'in-stock'
              const priceDisplay = product.price?.toLocaleString() + 'đ'
              return (
                <Card key={product.productId} className={highlightId === product.productId ? 'ring-2 ring-primary' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Package className="h-10 w-10 text-primary" />
                      <Badge className={status === 'in-stock' ? 'bg-green-100 text-green-800' : status === 'low-stock' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'}>
                        {status === 'in-stock' ? `Còn ${stock}` : status === 'low-stock' ? `Sắp hết (${stock})` : 'Hết hàng'}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{product.category || '—'}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Giá bán</span>
                        <span className="text-xl font-bold text-primary">{priceDisplay}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                        <div>
                          <p className="text-xs text-muted-foreground">Tồn kho</p>
                          <p className="font-medium">{stock}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Mã sản phẩm</p>
                          <p className="font-medium">{product.productId}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 bg-transparent"
                          onClick={() => openDetailDialog(product)}
                        >
                          Chi tiết
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 bg-transparent"
                          onClick={() => openImportDialog(product)}
                        >
                          Nhập hàng
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        {/* Pagination */}
        {products.length > 0 && (
          <div className="flex items-center justify-between mt-8">
            <p className="text-sm text-muted-foreground">
              Hiển thị {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalProducts)} của {totalProducts} sản phẩm
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || loading}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || loading}
              >
                Tiếp
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Detail Dialog */}
      {selectedProduct && (
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedProduct.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <p className="text-sm text-muted-foreground">Danh mục</p>
                <p className="font-medium">{selectedProduct.category || 'Không xác định'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mã sản phẩm</p>
                <p className="font-medium">{selectedProduct.productId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Giá bán</p>
                <p className="text-lg font-bold text-primary">{selectedProduct.price?.toLocaleString()}đ</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tồn kho</p>
                <p className="font-medium">{selectedProduct.quantity || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mô tả</p>
                <p className="font-medium">{selectedProduct.description || 'Không có'}</p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setDetailDialogOpen(false)}>Đóng</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Import Stock Dialog */}
      {selectedProduct && (
        <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nhập hàng - {selectedProduct.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Tồn kho hiện tại</p>
                <p className="text-2xl font-bold">{selectedProduct.quantity || 0}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Số lượng nhập</label>
                <Input 
                  type="number" 
                  min="1" 
                  value={importQuantity}
                  onChange={(e) => setImportQuantity(parseInt(e.target.value) || 1)}
                  className="mt-2"
                />
              </div>
              <div className="bg-muted p-3 rounded">
                <p className="text-sm text-muted-foreground">Tồn kho sau nhập</p>
                <p className="text-xl font-bold">{(selectedProduct.quantity || 0) + importQuantity}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
                Hủy
              </Button>
              <Button 
                onClick={handleImportStock}
                disabled={importing || importQuantity <= 0}
              >
                {importing ? 'Đang xử lý...' : 'Nhập hàng'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Product Dialog */}
      <Dialog open={addProductDialogOpen} onOpenChange={setAddProductDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm sản phẩm mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {addError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {addError}
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium">Tên sản phẩm *</label>
              <Input 
                placeholder="Nhập tên sản phẩm"
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                className="mt-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Danh mục</label>
              <Input 
                placeholder="Ví dụ: FOOD, TOY, HEALTH..."
                value={newProduct.category}
                onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                className="mt-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Giá bán (đ) *</label>
                <Input 
                  type="number" 
                  placeholder="0"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})}
                  className="mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Tồn kho *</label>
                <Input 
                  type="number" 
                  placeholder="0"
                  value={newProduct.quantity}
                  onChange={(e) => setNewProduct({...newProduct, quantity: parseInt(e.target.value) || 0})}
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Mô tả</label>
              <textarea 
                placeholder="Mô tả sản phẩm..."
                value={newProduct.description}
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                className="w-full mt-2 p-2 border rounded text-sm"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleResetAddForm}>
              Hủy
            </Button>
            <Button 
              onClick={handleAddProduct}
              disabled={addingProduct || !newProduct.name.trim()}
            >
              {addingProduct ? 'Đang thêm...' : 'Thêm sản phẩm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
