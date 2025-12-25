"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, ArrowLeft } from "lucide-react"
import { format } from "date-fns"

export default function SalesInventoryPage() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const { apiGet } = await import('@/lib/api')
        const data = await apiGet('/products')
        if (Array.isArray(data)) setProducts(data)
        else setProducts([])
      } catch {
        setProducts([])
      } finally { setLoading(false) }
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/sales')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              <span className="font-bold">Kiểm tra kho</span>
            </div>
          </div>
          <Button variant="outline" onClick={() => router.push('/login')}>Đăng xuất</Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Kiểm tra tồn kho</h1>
          <p className="text-muted-foreground">Danh sách tồn kho hiện tại. Bạn có thể chuyển sang quản lý sản phẩm để chỉnh sửa chi tiết.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? <div>Đang tải...</div> : products.map(p => (
            <Card key={p.id ?? p.productId}>
              <CardHeader>
                <CardTitle className="text-lg">{p.name || p.productName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">Tồn kho: <span className="font-medium">{p.stock ?? '-'}</span></div>
                <div className="text-sm text-muted-foreground">Giá: <span className="font-medium">{(p.price||0).toLocaleString()} đ</span></div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" onClick={() => router.push('/sales/products')}>Mở phần sản phẩm</Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    // navigate to products and add highlight query
                    router.push(`/sales/products?highlight=${encodeURIComponent(String(p.id ?? p.productId))}`)
                  }}>Xem chi tiết</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
