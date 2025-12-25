"use client"

import { useState, useEffect } from "react"
import { getSelectedBranchId, getSelectedBranchName } from '@/lib/branch'
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PawPrint, ArrowLeft, Search, Plus, Package } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const products = [
  {
    id: 1,
    name: "Thức ăn Royal Canin 2kg",
    category: "Thức ăn",
    price: 250000,
    stock: 45,
    sold: 120,
    status: "in-stock",
  },
  {
    id: 2,
    name: "Cát vệ sinh Cat's Best 10L",
    category: "Vệ sinh",
    price: 350000,
    stock: 32,
    sold: 85,
    status: "in-stock",
  },
  {
    id: 3,
    name: "Xương gặm Petstages",
    category: "Đồ chơi",
    price: 50000,
    stock: 8,
    sold: 65,
    status: "low-stock",
  },
  {
    id: 4,
    name: "Sữa tắm Bio-Groom 500ml",
    category: "Vệ sinh",
    price: 180000,
    stock: 0,
    sold: 42,
    status: "out-of-stock",
  },
]

export default function SalesProductsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [highlightId, setHighlightId] = useState<number | null>(null)

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search)
        const h = params.get('highlight')
        if (h) setHighlightId(Number(h))
      }
    } catch {}
  }, [])

  const getStockBadge = (status: string, stock: number) => {
    const config = {
      "in-stock": { label: `Còn ${stock}`, class: "bg-green-100 text-green-800" },
      "low-stock": { label: `Sắp hết (${stock})`, class: "bg-orange-100 text-orange-800" },
      "out-of-stock": { label: "Hết hàng", class: "bg-red-100 text-red-800" },
    }
    const { label, class: className } = config[status as keyof typeof config]
    return <Badge className={className}>{label}</Badge>
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
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Thêm sản phẩm
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm sản phẩm..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(() => {
            const branchId = getSelectedBranchId()
            const branchName = getSelectedBranchName()
            const list = branchId ? products.filter(p => String(p.branchId ?? p.branch) === String(branchId) || String(p.branchName ?? p.branch) === String(branchName)) : products
            return list.map((product) => {
              const id = product?.productId ?? product?.id
              const name = product?.name ?? product?.productName ?? 'Sản phẩm'
              const category = product?.category ?? product?.productCategory ?? '—'
              const priceVal = product?.price ?? product?.cost ?? 0
              const priceDisplay = typeof priceVal === 'number' ? priceVal.toLocaleString() + 'đ' : String(priceVal)
              const stock = product?.stock ?? product?.quantity ?? 0
              const sold = product?.sold ?? 0
              const status = product?.status ?? (stock > 0 ? 'in-stock' : 'out-of-stock')
              return (
                <Card key={id} className={highlightId === id ? 'ring-2 ring-primary' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Package className="h-10 w-10 text-primary" />
                  {getStockBadge(status, stock)}
                </div>
                <CardTitle className="text-lg">{name}</CardTitle>
                <p className="text-sm text-muted-foreground">{category}</p>
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
                      <p className="text-xs text-muted-foreground">Đã bán</p>
                      <p className="font-medium">{sold}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                      Chi tiết
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                      Nhập hàng
                    </Button>
                  </div>
                </div>
              </CardContent>
                </Card>
              )
            })
          })()}
        </div>
      </main>
    </div>
  )
}
