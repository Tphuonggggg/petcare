"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Package, ArrowLeft, Plus, Minus, ShoppingCart } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

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

export default function ProductDetail() {
  const router = useRouter()
  const { toast } = useToast()
  const params = useParams() as { id?: string }
  const id = params?.id ? Number(params.id) : undefined
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    let mounted = true
    if (!id) return
    ;(async () => {
      try {
        const { apiGet } = await import('@/lib/api')
        const data = await apiGet(`/products/${id}`)
        if (mounted) setProduct(data || null)
      } catch (error) {
        console.error(error)
      }
      finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [id])

  function addToCart() {
    try {
      const raw = localStorage.getItem('cart_v1')
      const cart = raw ? JSON.parse(raw) : []
      const productId = product?.productId || product?.id
      const existing = cart.find((c: any) => c.id === productId || c.productId === productId)
      let next
      if (existing) {
        next = cart.map((c: any) =>
          c.id === productId || c.productId === productId
            ? { ...c, qty: c.qty + quantity }
            : c
        )
      } else {
        next = [...cart, { ...product, qty: quantity }]
      }
      localStorage.setItem('cart_v1', JSON.stringify(next))
      toast({ title: 'Đã thêm', description: `${product?.name || product?.productName} đã được thêm vào giỏ.` })
      setQuantity(1)
    } catch (error) {
      toast({ title: 'Lỗi', description: 'Không thể thêm vào giỏ', variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <main className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <p className="text-muted-foreground mb-4">Sản phẩm không tìm thấy.</p>
            <Button onClick={() => router.push('/customer/shop')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại cửa hàng
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  const name = product.name || product.productName || 'Sản phẩm'
  const category = product.category || '—'
  const unit = product.unit || '—'
  const price = product.price || product.cost || 0
  const description = product.description || 'Không có mô tả chi tiết.'

  return (
    <main className="container mx-auto p-6 max-w-4xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Quay lại
      </Button>

      <Card>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Product Image */}
            <div>
              {product.image ? (
                <img
                  src={product.image}
                  alt={name}
                  className="w-full h-96 object-cover rounded-lg border"
                />
              ) : (
                <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                  <div className="text-center">
                    <Package className="h-16 w-16 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-muted-foreground">Không có ảnh</p>
                  </div>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <div className="mb-4">
                <Badge variant="outline" className="mb-3">{category}</Badge>
                <h1 className="text-4xl font-bold mb-2">{name}</h1>
                <p className="text-muted-foreground text-lg">{unit}</p>
              </div>

              <div className="mb-6 pt-4 border-t">
                <p className="text-5xl font-bold text-primary mb-2">{price}k</p>
              </div>

              <div className="mb-8 pb-8 border-b">
                <h3 className="font-semibold mb-3">Mô tả sản phẩm</h3>
                <p className="text-muted-foreground leading-relaxed">{description}</p>
              </div>

              {/* Quantity and Add to Cart */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-3 block">Số lượng</label>
                  <div className="flex items-center gap-4 border rounded-lg p-2 w-fit">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setQuantity(quantity + 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Button onClick={addToCart} size="lg" className="w-full">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Thêm vào giỏ hàng
                </Button>

                <Button variant="outline" onClick={() => router.push('/customer/shop')} className="w-full">
                  Tiếp tục mua sắm
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
