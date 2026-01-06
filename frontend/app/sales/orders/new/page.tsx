"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PawPrint, ArrowLeft, Plus, Trash2, X } from "lucide-react"
import { apiGet, apiPost } from "@/lib/api"

interface Customer {
  customerId: number
  fullName: string
  phone: string
}

interface Product {
  productId: number
  name: string
  price: number
  quantity: number
}

interface OrderItem {
  productId: number
  productName: string
  price: number
  quantity: number
  total: number
}

export default function CreateOrderPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [showCustomerSelect, setShowCustomerSelect] = useState(false)
  const [showProductSelect, setShowProductSelect] = useState(false)
  const [searchCustomer, setSearchCustomer] = useState("")
  const [searchProduct, setSearchProduct] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("CASH")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [branchId, setBranchId] = useState<number>(13)

  useEffect(() => {
    // Get branchId from localStorage, default to 13
    const stored = localStorage.getItem('branchId')
    if (stored) {
      setBranchId(parseInt(stored))
    }
    loadCustomersAndProducts()
  }, [])

  const loadCustomersAndProducts = async () => {
    try {
      const [customersData, productsData] = await Promise.all([
        apiGet("/customers?page=1&pageSize=100"),
        apiGet("/products?page=1&pageSize=100")
      ])
      setCustomers(customersData.items || [])
      setProducts(productsData.items || [])
    } catch (err) {
      console.error("Error loading data:", err)
      setError("Lỗi khi tải dữ liệu")
    }
  }

  const addProductToOrder = (product: Product) => {
    const existingItem = orderItems.find(item => item.productId === product.productId)
    
    if (existingItem) {
      setOrderItems(orderItems.map(item =>
        item.productId === product.productId
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
          : item
      ))
    } else {
      setOrderItems([...orderItems, {
        productId: product.productId,
        productName: product.name,
        price: product.price,
        quantity: 1,
        total: product.price
      }])
    }
    setShowProductSelect(false)
    setSearchProduct("")
  }

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeProduct(productId)
      return
    }
    setOrderItems(orderItems.map(item =>
      item.productId === productId
        ? { ...item, quantity, total: quantity * item.price }
        : item
    ))
  }

  const removeProduct = (productId: number) => {
    setOrderItems(orderItems.filter(item => item.productId !== productId))
  }

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + item.total, 0)
  }

  const saveOrder = async () => {
    if (!selectedCustomer || orderItems.length === 0) {
      setError("Vui lòng chọn khách hàng và sản phẩm")
      return
    }

    try {
      setLoading(true)
      setError(null)

      const totalAmount = calculateTotal()

      const orderData = {
        customerId: selectedCustomer.customerId,
        branchId: branchId,
        employeeId: parseInt(localStorage.getItem('employeeId') || '1'),
        invoiceDate: new Date().toISOString(),
        totalAmount: totalAmount,
        discountAmount: 0,
        finalAmount: totalAmount,
        paymentMethod: paymentMethod,
        status: "Pending",
        items: orderItems.map(item => ({
          productId: item.productId,
          itemType: "PRODUCT",
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.total
        }))
      }

      const response = await apiPost("/invoices", orderData)
      
      if (response && response.invoiceId) {
        setSuccess(true)
        setSelectedCustomer(null)
        setOrderItems([])
        setSearchCustomer("")
        setSearchProduct("")
        
        // Auto redirect after 2 seconds
        setTimeout(() => {
          router.push("/sales/orders")
        }, 2000)
      }
    } catch (err) {
      console.error("Error saving order:", err)
      setError("Lỗi khi lưu đơn hàng. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(c =>
    c.fullName.toLowerCase().includes(searchCustomer.toLowerCase()) ||
    c.phone.includes(searchCustomer)
  )

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchProduct.toLowerCase()) && p.quantity > 0
  )

  const totalAmount = calculateTotal()

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/sales/orders")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <PawPrint className="h-6 w-6 text-primary" />
              <span className="font-bold">Tạo Đơn Hàng</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg">
            {error}
          </div>
        )}

      {success && (
          <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg flex items-center justify-between">
            <span>✓ Tạo đơn hàng thành công!</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push("/sales/orders")}
              >
                Xem danh sách
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSuccess(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Form khách hàng */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Thông tin khách hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedCustomer ? (
                <div className="p-4 bg-muted rounded-lg flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{selectedCustomer.fullName}</p>
                    <p className="text-sm text-muted-foreground">{selectedCustomer.phone}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedCustomer(null)
                      setOrderItems([])
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <Input
                    placeholder="Tìm khách hàng..."
                    value={searchCustomer}
                    onChange={(e) => {
                      setSearchCustomer(e.target.value)
                      setShowCustomerSelect(true)
                    }}
                    onFocus={() => setShowCustomerSelect(true)}
                  />
                  {showCustomerSelect && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                      {filteredCustomers.map(customer => (
                        <button
                          key={customer.customerId}
                          className="w-full text-left px-4 py-2 hover:bg-muted"
                          onClick={() => {
                            setSelectedCustomer(customer)
                            setShowCustomerSelect(false)
                            setSearchCustomer("")
                          }}
                        >
                          <p className="font-medium">{customer.fullName}</p>
                          <p className="text-sm text-muted-foreground">{customer.phone}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tổng hợp */}
          <Card>
            <CardHeader>
              <CardTitle>Tổng hợp đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Số lượng sản phẩm:</span>
                  <span className="font-semibold">{orderItems.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tổng số lượng:</span>
                  <span className="font-semibold">{orderItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-lg">
                  <span className="font-semibold">Tổng tiền:</span>
                  <span className="font-bold text-primary">{totalAmount.toLocaleString()}đ</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phương thức thanh toán</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="CASH">Tiền mặt</option>
                  <option value="CARD">Thẻ tín dụng</option>
                  <option value="BANKING">Chuyển khoản</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sản phẩm trong đơn */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Sản phẩm trong đơn hàng</CardTitle>
              <Button
                size="sm"
                onClick={() => setShowProductSelect(!showProductSelect)}
                disabled={!selectedCustomer}
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm sản phẩm
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {showProductSelect && (
              <div className="p-4 bg-muted rounded-lg">
                <Input
                  placeholder="Tìm sản phẩm..."
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                  autoFocus
                />
                <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                  {filteredProducts.map(product => (
                    <button
                      key={product.productId}
                      className="w-full text-left p-2 hover:bg-white rounded border"
                      onClick={() => addProductToOrder(product)}
                    >
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.price.toLocaleString()}đ - Còn {product.quantity}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {orderItems.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Chưa có sản phẩm nào</p>
            ) : (
              <div className="space-y-3">
                {orderItems.map(item => (
                  <div key={item.productId} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">{item.price.toLocaleString()}đ/cái</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                        className="w-16 text-center"
                      />
                      <span className="font-semibold text-right w-24">{item.total.toLocaleString()}đ</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProduct(item.productId)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Nút hành động */}
        <div className="flex gap-3 mt-8">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.push("/sales/orders")}
          >
            Hủy
          </Button>
          <Button
            className="flex-1"
            onClick={saveOrder}
            disabled={loading || !selectedCustomer || orderItems.length === 0}
          >
            {loading ? "Đang lưu..." : "Lưu đơn hàng"}
          </Button>
        </div>
      </main>
    </div>
  )
}
