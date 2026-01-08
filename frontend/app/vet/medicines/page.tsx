"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Pill, Syringe, Package, Eye } from "lucide-react"
import { apiGet } from "@/lib/api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Vaccine {
  vaccineId: number
  type: string
  description?: string
  standardDose?: string
  stockQuantity?: number
}

interface Product {
  productId: number
  name: string
  category: string
  price: number
  stockQty: number
  reorderPoint?: number
  description?: string
}

const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    'FOOD': 'Thức ăn',
    'MEDICINE': 'Thuốc',
    'ACCESSORY': 'Phụ kiện',
    'TOY': 'Đồ chơi'
  }
  return labels[category] || category
}

export default function MedicinesPage() {
  const [vaccines, setVaccines] = useState<Vaccine[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("vaccines")
  const [selectedVaccine, setSelectedVaccine] = useState<Vaccine | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Get branch ID from localStorage
      const branchId = typeof window !== 'undefined' ? localStorage.getItem('branchId') : null
      const branchParam = branchId ? `&branchId=${branchId}` : ''
      
      // Load vaccines with branch filter
      const vaccineData = await apiGet(`/vaccines?page=1&pageSize=100${branchParam}`)
      setVaccines(vaccineData.items || [])
      
      // Load products (medicines)
      const productData = await apiGet('/products?page=1&pageSize=100')
      setProducts(productData.items || [])
    } catch (error) {
      console.error("Error loading medicines:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredVaccines = vaccines.filter(v => 
    !searchQuery || 
    v.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredProducts = products.filter(p => 
    !searchQuery || 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Tra cứu thuốc & Vaccine</h1>
        <p className="text-muted-foreground">Danh sách thuốc, vaccine và sản phẩm y tế</p>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên, mô tả, loại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="vaccines" className="flex items-center gap-2">
            <Syringe className="h-4 w-4" />
            Vaccine ({filteredVaccines.length})
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Pill className="h-4 w-4" />
            Thuốc & Sản phẩm ({filteredProducts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vaccines">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Syringe className="h-5 w-5" />
                Danh sách Vaccine
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="mt-2 text-muted-foreground">Đang tải...</p>
                </div>
              ) : filteredVaccines.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Syringe className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Không tìm thấy vaccine nào</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredVaccines.map((vaccine) => (
                    <div 
                      key={vaccine.vaccineId} 
                      className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{vaccine.type}</h3>
                            {vaccine.stockQuantity !== undefined && (
                              <Badge variant={vaccine.stockQuantity > 0 ? "default" : "destructive"}>
                                {vaccine.stockQuantity > 0 ? `Còn ${vaccine.stockQuantity}` : 'Hết hàng'}
                              </Badge>
                            )}
                          </div>
                          
                          {vaccine.description && (
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{vaccine.description}</p>
                          )}
                          
                          {vaccine.standardDose && (
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">Liều chuẩn:</span> {vaccine.standardDose}
                            </p>
                          )}
                        </div>
                        
                        <div className="ml-4 flex flex-col items-end gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedVaccine(vaccine)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            Xem chi tiết
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Thuốc & Sản phẩm y tế
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="mt-2 text-muted-foreground">Đang tải...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Pill className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Không tìm thấy sản phẩm nào</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredProducts.map((product) => (
                    <div 
                      key={product.productId} 
                      className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <h3 className="font-semibold text-lg">{product.name}</h3>
                            {product.category && (
                              <Badge variant="outline">
                                {product.category === 'FOOD' ? 'Thức ăn' : 
                                 product.category === 'MEDICINE' ? 'Thuốc' : 
                                 product.category === 'ACCESSORY' ? 'Phụ kiện' : 
                                 product.category === 'TOY' ? 'Đồ chơi' : product.category}
                              </Badge>
                            )}
                            <Badge variant={product.stockQty > (product.reorderPoint || 0) ? "default" : product.stockQty > 0 ? "secondary" : "destructive"}>
                              {product.stockQty > 0 ? `Còn ${product.stockQty}` : 'Hết hàng'}
                            </Badge>
                          </div>
                          
                          {product.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                          )}
                        </div>
                        
                        <div className="ml-4 flex flex-col items-end gap-2">
                          {product.price && (
                            <p className="text-lg font-bold text-primary">
                              {product.price.toLocaleString('vi-VN')} đ
                            </p>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedProduct(product)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            Xem chi tiết
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Vaccine Detail Modal */}
      <Dialog open={!!selectedVaccine} onOpenChange={() => setSelectedVaccine(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Syringe className="h-5 w-5" />
              Chi tiết Vaccine
            </DialogTitle>
          </DialogHeader>
          {selectedVaccine && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold mb-2">{selectedVaccine.type}</h3>
                {selectedVaccine.stockQuantity !== undefined && (
                  <Badge variant={selectedVaccine.stockQuantity > 0 ? "default" : "destructive"} className="text-sm">
                    {selectedVaccine.stockQuantity > 0 ? `Còn ${selectedVaccine.stockQuantity} liều` : 'Hết hàng'}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Loại vaccine</p>
                    <p className="text-base font-semibold">{selectedVaccine.type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Liều chuẩn</p>
                    <p className="text-base font-semibold">{selectedVaccine.standardDose || 'Không có thông tin'}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Tồn kho chi nhánh</p>
                    <p className="text-2xl font-bold text-primary">{selectedVaccine.stockQuantity ?? 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Mã vaccine</p>
                    <p className="text-base font-mono">{selectedVaccine.vaccineId}</p>
                  </div>
                </div>
              </div>

              {selectedVaccine.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Mô tả chi tiết</p>
                  <p className="text-base whitespace-pre-wrap bg-muted p-3 rounded-md">{selectedVaccine.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Product Detail Modal */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5" />
              Chi tiết Sản phẩm
            </DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold mb-2">{selectedProduct.name}</h3>
                <div className="flex gap-2">
                  <Badge variant="outline">{getCategoryLabel(selectedProduct.category)}</Badge>
                  <Badge variant={selectedProduct.stockQty > (selectedProduct.reorderPoint || 0) ? "default" : selectedProduct.stockQty > 0 ? "secondary" : "destructive"}>
                    {selectedProduct.stockQty > 0 ? `Còn ${selectedProduct.stockQty}` : 'Hết hàng'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Giá bán</p>
                  <p className="text-2xl font-bold text-primary">
                    {selectedProduct.price.toLocaleString('vi-VN')} đ
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Tồn kho</p>
                  <p className="text-2xl font-bold">
                    {selectedProduct.stockQty}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Loại sản phẩm</p>
                  <p className="text-base font-semibold">{getCategoryLabel(selectedProduct.category)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Điểm đặt hàng lại</p>
                  <p className="text-base font-semibold">{selectedProduct.reorderPoint || 'Không có'}</p>
                </div>
              </div>

              {selectedProduct.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Mô tả chi tiết</p>
                  <p className="text-base whitespace-pre-wrap bg-muted p-3 rounded-md">{selectedProduct.description}</p>
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">Mã sản phẩm: {selectedProduct.productId}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
