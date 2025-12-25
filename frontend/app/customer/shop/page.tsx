"use client"

import { useEffect, useState } from 'react'
import { getSelectedBranchId } from '@/lib/branch'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Package } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function ShopPage() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<any[]>([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { apiGet } = await import('@/lib/api')
        const branchId = getSelectedBranchId()
        const data = branchId ? await apiGet('/products?branchId=' + encodeURIComponent(branchId)) : await apiGet('/products')
        if (mounted) setProducts(Array.isArray(data) ? data : [])
      } catch (err) {
        // ignore
      } finally { if (mounted) setLoading(false) }
    })()
    // load cart
    try { const raw = localStorage.getItem('cart_v1'); setCart(raw ? JSON.parse(raw) : []) } catch {}
    return () => { mounted = false }
  }, [])

  function persistCart(next: any[]) {
    setCart(next)
    try { localStorage.setItem('cart_v1', JSON.stringify(next)) } catch {}
  }

  function addToCart(product: any) {
    const existing = cart.find((c) => c.id === product.id)
    let next
    if (existing) {
      next = cart.map(c => c.id === product.id ? { ...c, qty: c.qty + 1 } : c)
    } else {
      next = [...cart, { ...product, qty: 1 }]
    }
    persistCart(next)
    toast({ title: 'Đã thêm', description: `${product.name} đã được thêm vào giỏ.` })
  }

  function removeFromCart(id: number) {
    const next = cart.filter(c => c.id !== id)
    persistCart(next)
  }

  function clearCart() { persistCart([]); toast({ title: 'Giỏ hàng', description: 'Giỏ hàng đã được xóa.' }) }

  const total = cart.reduce((s, c) => s + (c.price || 0) * (c.qty || 1), 0)

  return (
    <main className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-start gap-6">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Cửa hàng</h1>
              <p className="text-sm text-muted-foreground">Mua sắm các sản phẩm cho thú cưng</p>
            </div>
            <Button onClick={() => router.push('/customer')}>Quay lại</Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(loading ? [] : products).map((p) => {
              const id = p?.productId ?? p?.id
              const name = p?.name ?? p?.productName ?? 'Sản phẩm'
              const category = p?.category ?? '—'
              const unit = p?.unit ?? '—'
              const price = p?.price ?? p?.cost ?? 0
              return (
              <Card key={id} className="p-4 hover:shadow">
                <div className="flex items-start justify-between">
                  <Package className="h-8 w-8 text-emerald-600" />
                  <Badge variant="outline">{category}</Badge>
                </div>
                <div className="mt-3">
                  <h3 className="font-semibold">{name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{unit}</p>
                  <p className="text-lg font-bold mt-2">{typeof price === 'number' ? price + 'k' : price}</p>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <Button size="sm" onClick={() => addToCart(p)}>Thêm vào giỏ</Button>
                  <Button variant="ghost" size="sm" onClick={() => router.push(`/customer/shop/${id}`)}>Xem chi tiết</Button>
                </div>
              </Card>
            )})}
          </div>
        </div>

        <aside className="w-80">
          <Card>
            <CardHeader>
              <CardTitle>Giỏ hàng</CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <p className="text-sm text-muted-foreground">Giỏ hàng trống.</p>
              ) : (
                <ul className="space-y-3">
                  {cart.map((c) => (
                    <li key={c.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{c.name}</div>
                        <div className="text-sm text-muted-foreground">{c.qty} × {c.price}k</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{(c.price * c.qty)}k</div>
                        <div className="text-xs mt-1"><button className="text-destructive" onClick={() => removeFromCart(c.id)}>Xóa</button></div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <div className="pt-4 border-t mt-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">Tổng</div>
                  <div className="font-bold">{total}k</div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button onClick={() => { toast({ title: 'Checkout', description: 'Checkout giả lập — chưa kết nối backend.' }); clearCart() }} disabled={cart.length === 0}>Thanh toán</Button>
                  <Button variant="outline" onClick={clearCart}>Xóa</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  )
}
