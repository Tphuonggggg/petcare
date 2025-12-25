"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Package } from "lucide-react"

const mockProducts = [
  {
    id: 1,
    name: "Thức ăn cho chó Royal Canin",
    category: "Thức ăn",
    price: "450,000 VNĐ",
    stock: 150,
    unit: "Túi 2kg",
  },
  {
    id: 2,
    name: "Thuốc tẩy giun Drontal",
    category: "Thuốc",
    price: "120,000 VNĐ",
    stock: 80,
    unit: "Hộp 10 viên",
  },
  {
    id: 3,
    name: "Vòng cổ phát sáng LED",
    category: "Phụ kiện",
    price: "95,000 VNĐ",
    stock: 45,
    unit: "Chiếc",
  },
  {
    id: 4,
    name: "Cát vệ sinh cho mèo",
    category: "Vệ sinh",
    price: "180,000 VNĐ",
    stock: 200,
    unit: "Túi 5kg",
  },
]

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>(mockProducts)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const { apiGet } = await import('@/lib/api')
        const data = await apiGet('/products')
        if (mounted && Array.isArray(data)) setProducts(data)
      } catch (e) {
        // keep mockProducts on error
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sản phẩm</h1>
          <p className="text-muted-foreground mt-1">Quản lý kho hàng và sản phẩm</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Thêm sản phẩm
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(loading ? [] : products).map((product) => {
          const id = product?.productId ?? product?.id
          const name = product?.name ?? product?.productName ?? 'Sản phẩm'
          const category = product?.category ?? product?.productCategory ?? '—'
          const unit = product?.unit ?? '—'
          const stock = product?.stock ?? product?.quantity ?? 0
          const price = product?.price ?? product?.cost ?? product?.priceString ?? '—'
          return (
          <Card key={id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <Package className="h-10 w-10 text-green-600" />
                <Badge variant="outline">{category}</Badge>
              </div>

              <div>
                  <h3 className="font-semibold text-lg text-balance">{name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{unit}</p>
                  <p className="text-2xl font-bold text-primary mt-2">{typeof price === 'number' ? price.toLocaleString() : price}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div>
                    <p className="text-xs text-muted-foreground">Tồn kho</p>
                    <p className="font-semibold">{stock} {unit}</p>
                </div>
                <Button size="sm">Bán</Button>
              </div>
            </div>
          </Card>
          )
        })}
      </div>
    </div>
  )
}
