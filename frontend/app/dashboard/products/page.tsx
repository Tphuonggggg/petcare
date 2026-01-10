"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Package, ArrowUp } from "lucide-react"
import { toast } from '@/hooks/use-toast'

const PRODUCT_CATEGORIES = [
  { value: 'FOOD', label: 'Thức ăn' },
  { value: 'MEDICINE', label: 'Thuốc' },
  { value: 'ACCESSORY', label: 'Phụ kiện' },
  { value: 'TOY', label: 'Đồ chơi' }
]

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [importQty, setImportQty] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 10
  const [formData, setFormData] = useState({ 
    name: '', 
    category: '', 
    price: '', 
    stockQty: '',
    reorderPoint: '10',
    description: ''
  })

  const loadProducts = async (page: number = 1) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/products?page=${page}&pageSize=${pageSize}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setProducts(data.items || data || [])
        setTotalCount(data.totalCount || 0)
        setCurrentPage(page)
      }
    } catch (error) {
      console.error('Load products error:', error)
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu sản phẩm",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts(1)
  }, [])

  const resetForm = () => {
    setFormData({ 
      name: '', 
      category: '', 
      price: '', 
      stockQty: '',
      reorderPoint: '10',
      description: ''
    })
    setSelectedProduct(null)
  }

  const openAddDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const openEditDialog = (product: any) => {
    setSelectedProduct(product)
    setFormData({
      name: product.name || '',
      category: product.category || '',
      price: product.price || '',
      stockQty: product.stockQty || '',
      reorderPoint: product.reorderPoint || '10',
      description: product.description || ''
    })
    setIsDialogOpen(true)
  }

  const openDetailDialog = (product: any) => {
    setSelectedProduct(product)
    setIsDetailDialogOpen(true)
  }

  const openImportDialog = (product: any) => {
    setSelectedProduct(product)
    setImportQty('')
    setIsImportDialogOpen(true)
  }

  const handleSaveProduct = async () => {
    try {
      if (!formData.name || !formData.category || !formData.price || formData.stockQty === '') {
        toast({
          title: "Lỗi",
          description: "Vui lòng điền đầy đủ thông tin bắt buộc",
          variant: "destructive",
        })
        return
      }

      // Validate category
      if (!['FOOD', 'MEDICINE', 'ACCESSORY', 'TOY'].includes(formData.category)) {
        toast({
          title: "Lỗi",
          description: "Loại sản phẩm không hợp lệ",
          variant: "destructive",
        })
        return
      }

      // Validate price > 0
      const price = parseFloat(formData.price.toString())
      if (price <= 0) {
        toast({
          title: "Lỗi",
          description: "Giá sản phẩm phải lớn hơn 0",
          variant: "destructive",
        })
        return
      }

      const stockQty = parseInt(formData.stockQty.toString())
      if (stockQty < 0) {
        toast({
          title: "Lỗi",
          description: "Số lượng không thể âm",
          variant: "destructive",
        })
        return
      }

      setLoading(true)
      const token = localStorage.getItem('token')
      
      const payload = {
        productId: selectedProduct?.productId || null,
        name: formData.name,
        category: formData.category.toUpperCase(),
        price: price,
        stockQty: stockQty,
        reorderPoint: parseInt(formData.reorderPoint.toString()) || 10,
        description: formData.description
      }

      if (selectedProduct) {
        // Edit
        const response = await fetch(`http://localhost:5000/api/products/${selectedProduct.productId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        })

        if (response.ok) {
          toast({
            title: "Thành công",
            description: "Cập nhật sản phẩm thành công",
          })
          loadProducts(currentPage)
          setIsDialogOpen(false)
          resetForm()
        } else {
          const error = await response.text()
          toast({
            title: "Lỗi",
            description: error || "Không thể cập nhật sản phẩm",
            variant: "destructive",
          })
        }
      } else {
        // Add
        const response = await fetch('http://localhost:5000/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        })

        if (response.ok) {
          toast({
            title: "Thành công",
            description: "Thêm sản phẩm thành công",
          })
          loadProducts(1)
          setIsDialogOpen(false)
          resetForm()
        } else {
          const error = await response.text()
          toast({
            title: "Lỗi",
            description: error || "Không thể thêm sản phẩm",
            variant: "destructive",
          })
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const handleImportStock = async () => {
    try {
      if (!importQty || parseInt(importQty) <= 0) {
        toast({
          title: "Lỗi",
          description: "Số lượng nhập phải lớn hơn 0",
          variant: "destructive",
        })
        return
      }

      setLoading(true)
      const token = localStorage.getItem('token')
      const newStock = selectedProduct.stockQty + parseInt(importQty)
      
      const payload = {
        productId: selectedProduct.productId,
        name: selectedProduct.name,
        category: typeof selectedProduct.category === 'string' ? selectedProduct.category.toUpperCase() : selectedProduct.category,
        price: typeof selectedProduct.price === 'string' ? parseFloat(selectedProduct.price) : selectedProduct.price,
        stockQty: newStock,
        reorderPoint: selectedProduct.reorderPoint || 10,
        description: selectedProduct.description || ''
      }

      const response = await fetch(`http://localhost:5000/api/products/${selectedProduct.productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        toast({
          title: "Thành công",
          description: `Nhập ${importQty} sản phẩm thành công`,
        })
        loadProducts(currentPage)
        setIsImportDialogOpen(false)
        setImportQty('')
      } else {
        const error = await response.text()
        toast({
          title: "Lỗi",
          description: error || "Không thể nhập hàng",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return

    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast({
          title: "Thành công",
          description: "Xóa sản phẩm thành công",
        })
        loadProducts(currentPage)
      } else {
        const error = await response.text()
        toast({
          title: "Lỗi",
          description: error || "Không thể xóa sản phẩm",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sản phẩm</h1>
          <p className="text-muted-foreground mt-1">Quản lý kho hàng và sản phẩm</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm sản phẩm
        </Button>
      </div>

      {loading && <p className="text-center text-gray-500">Đang tải...</p>}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => {
          const categoryLabel = PRODUCT_CATEGORIES.find(c => c.value === product.category)?.label || product.category
          const isLowStock = product.stockQty <= (product.reorderPoint || 10)
          
          return (
            <Card key={product.productId} className={`p-6 hover:shadow-lg transition-shadow ${isLowStock ? 'border-yellow-300' : ''}`}>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <Package className="h-10 w-10 text-green-600" />
                  <Badge variant={isLowStock ? "destructive" : "outline"}>{categoryLabel}</Badge>
                </div>

                <div>
                  <h3 className="font-semibold text-lg text-balance">{product.name}</h3>
                  {product.description && <p className="text-sm text-muted-foreground mt-1">{product.description}</p>}
                  <p className="text-2xl font-bold text-primary mt-2">{product.price?.toLocaleString()} VNĐ</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground">Tồn kho</p>
                    <p className={`font-semibold ${isLowStock ? 'text-red-600' : ''}`}>{product.stockQty}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="flex-1"
                    onClick={() => openDetailDialog(product)}
                  >
                    Chi tiết
                  </Button>
                  <Button 
                    size="sm"
                    className="flex-1"
                    onClick={() => openImportDialog(product)}
                  >
                    <ArrowUp className="h-4 w-4 mr-1" />
                    Nhập hàng
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t">
        <div className="text-sm text-gray-600">
          Hiển thị {products.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} - {Math.min(currentPage * pageSize, totalCount)} của {totalCount} sản phẩm
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={currentPage === 1 || loading}
            onClick={() => loadProducts(currentPage - 1)}
          >
            Trang trước
          </Button>
          <div className="flex items-center gap-2 px-4">
            <span className="text-sm font-medium">Trang {currentPage}</span>
          </div>
          <Button
            variant="outline"
            disabled={currentPage * pageSize >= totalCount || loading}
            onClick={() => loadProducts(currentPage + 1)}
          >
            Trang sau
          </Button>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold">
              {selectedProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm'}
            </h2>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="name">Tên sản phẩm *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nhập tên sản phẩm"
                />
              </div>

              <div>
                <Label htmlFor="category">Loại sản phẩm *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Chọn loại sản phẩm" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="price">Giá (VNĐ) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="Nhập giá"
                  min="1"
                />
              </div>

              <div>
                <Label htmlFor="stockQty">Số lượng tồn kho *</Label>
                <Input
                  id="stockQty"
                  type="number"
                  value={formData.stockQty}
                  onChange={(e) => setFormData({ ...formData, stockQty: e.target.value })}
                  placeholder="Nhập số lượng"
                  min="0"
                />
              </div>

              <div>
                <Label htmlFor="reorderPoint">Điểm nhập hàng lại</Label>
                <Input
                  id="reorderPoint"
                  type="number"
                  value={formData.reorderPoint}
                  onChange={(e) => setFormData({ ...formData, reorderPoint: e.target.value })}
                  placeholder="Mặc định: 10"
                  min="0"
                />
              </div>

              <div>
                <Label htmlFor="description">Mô tả</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả sản phẩm"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsDialogOpen(false)
                  resetForm()
                }}
              >
                Hủy
              </Button>
              <Button
                className="flex-1"
                onClick={handleSaveProduct}
                disabled={loading}
              >
                {loading ? 'Đang lưu...' : 'Lưu'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Detail Dialog */}
      {isDetailDialogOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6 space-y-4">
            <h2 className="text-2xl font-bold">Chi tiết sản phẩm</h2>
            
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Tên sản phẩm</p>
                <p className="font-semibold">{selectedProduct.name}</p>
              </div>
              <div>
                <p className="text-gray-500">Loại</p>
                <p className="font-semibold">{PRODUCT_CATEGORIES.find(c => c.value === selectedProduct.category)?.label}</p>
              </div>
              <div>
                <p className="text-gray-500">Giá</p>
                <p className="font-semibold text-green-600">{selectedProduct.price?.toLocaleString()} VNĐ</p>
              </div>
              <div>
                <p className="text-gray-500">Tồn kho</p>
                <p className="font-semibold">{selectedProduct.stockQty}</p>
              </div>
              <div>
                <p className="text-gray-500">Điểm nhập hàng lại</p>
                <p className="font-semibold">{selectedProduct.reorderPoint || 10}</p>
              </div>
              {selectedProduct.description && (
                <div>
                  <p className="text-gray-500">Mô tả</p>
                  <p className="font-semibold">{selectedProduct.description}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 border-t pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsDetailDialogOpen(false)
                  openEditDialog(selectedProduct)
                }}
              >
                Chỉnh sửa
              </Button>
            </div>

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setIsDetailDialogOpen(false)}
            >
              Đóng
            </Button>
          </Card>
        </div>
      )}

      {/* Import Stock Dialog */}
      {isImportDialogOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6 space-y-4">
            <h2 className="text-2xl font-bold">Nhập hàng</h2>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Sản phẩm: <span className="font-semibold">{selectedProduct.name}</span></p>
                <p className="text-sm text-gray-500 mt-1">Tồn kho hiện tại: <span className="font-semibold text-green-600">{selectedProduct.stockQty}</span></p>
              </div>

              <div>
                <Label htmlFor="importQty">Số lượng nhập *</Label>
                <Input
                  id="importQty"
                  type="number"
                  value={importQty}
                  onChange={(e) => setImportQty(e.target.value)}
                  placeholder="Nhập số lượng"
                  min="1"
                />
              </div>

              {importQty && (
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Tồn kho sau nhập: <span className="font-bold text-blue-600">{selectedProduct.stockQty + (parseInt(importQty) || 0)}</span></p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsImportDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button
                className="flex-1"
                onClick={handleImportStock}
                disabled={loading}
              >
                {loading ? 'Đang nhập...' : 'Nhập hàng'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
