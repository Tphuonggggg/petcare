"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function ProductDetail() {
  const router = useRouter()
  const params = useParams() as { id?: string }
  const id = params?.id ? Number(params.id) : undefined
  const [product, setProduct] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    if (!id) return
    ;(async () => {
      try {
        const { apiGet } = await import('@/lib/api')
        const data = await apiGet(`/products/${id}`)
        if (mounted) setProduct(data || null)
      } catch {}
      finally { if (mounted) setLoading(false) }
    })()
    return () => { mounted = false }
  }, [id])

  function addToCart() {
    try {
      const raw = localStorage.getItem('cart_v1')
      const cart = raw ? JSON.parse(raw) : []
      const existing = cart.find((c: any) => c.id === product.id)
      let next
      if (existing) next = cart.map((c: any) => c.id === product.id ? { ...c, qty: c.qty + 1 } : c)
      else next = [...cart, { ...product, qty: 1 }]
      localStorage.setItem('cart_v1', JSON.stringify(next))
      toast({ title: 'Đã thêm', description: `${product.name} đã được thêm vào giỏ.` })
    } catch {}
  }

  if (loading) return <div className="p-6">Đang tải...</div>
  if (!product) return <div className="p-6">Sản phẩm không tìm thấy.</div>

  return (
    <main className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>{product.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6">
            <div className="w-40 h-40 bg-muted flex items-center justify-center"><Package className="w-12 h-12"/></div>
            <div className="flex-1">
              <p className="text-muted-foreground">{product.category} • {product.unit}</p>
              <p className="mt-4 text-lg font-bold">{product.price}k</p>
              <p className="mt-4">{product.description || 'Không có mô tả.'}</p>

              <div className="mt-6 flex gap-2">
                <Button onClick={addToCart}>Thêm vào giỏ</Button>
                <Button variant="ghost" onClick={() => router.push('/customer/shop')}>Quay lại</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
