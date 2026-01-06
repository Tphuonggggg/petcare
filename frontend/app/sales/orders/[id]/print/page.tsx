"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { apiGet } from "@/lib/api"

interface InvoiceDetail {
  invoiceId: number
  invoiceDate?: string
  customerId?: number
  customerName?: string
  customerPhone?: string
  totalAmount?: number
  discountAmount?: number
  finalAmount?: number
  paymentMethod?: string
  status?: string
  branchId?: number
  branchName?: string
  items?: Array<{
    productId?: number
    serviceId?: number
    itemType?: string
    quantity?: number
    unitPrice?: number
  }>
}

export default function InvoicePrintPage() {
  const params = useParams()
  const invoiceId = params?.id ? parseInt(params.id as string) : 0
  
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (invoiceId) {
      loadInvoice()
    }
  }, [invoiceId])

  useEffect(() => {
    if (invoice && !loading) {
      window.print()
    }
  }, [invoice, loading])

  const loadInvoice = async () => {
    try {
      const data = await apiGet(`/invoices/${invoiceId}`)
      setInvoice(data)
    } catch (err) {
      console.error("Error loading invoice:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !invoice) {
    return <div className="p-8">Đang tải...</div>
  }

  const date = invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString('vi-VN') : 'N/A'

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white">
      {/* Header */}
      <div className="text-center mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold">HÓA ĐƠN BÁN HÀNG</h1>
        <p className="text-gray-600 mt-2">PetCare - Cửa hàng thú cưng</p>
      </div>

      {/* Số hóa đơn và ngày */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <p className="text-sm text-gray-600">Số hóa đơn</p>
          <p className="text-2xl font-bold">ĐH{invoiceId}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Ngày lập</p>
          <p className="text-lg font-medium">{date}</p>
        </div>
      </div>

      {/* Thông tin khách hàng */}
      <div className="mb-8">
        <h2 className="font-bold text-lg mb-4">Thông tin khách hàng</h2>
        <div className="grid grid-cols-2 gap-4 border p-4">
          <div>
            <p className="text-sm text-gray-600">Tên khách hàng</p>
            <p className="font-medium">{invoice.customerName || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Số điện thoại</p>
            <p className="font-medium">{invoice.customerPhone || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Chi nhánh</p>
            <p className="font-medium">{invoice.branchName || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Trạng thái</p>
            <p className="font-medium">{invoice.status || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Bảng sản phẩm */}
      <div className="mb-8">
        <h2 className="font-bold text-lg mb-4">Chi tiết hóa đơn</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-800">
              <th className="text-left py-3 px-2">STT</th>
              <th className="text-left py-3 px-2">Tên sản phẩm</th>
              <th className="text-center py-3 px-2">Số lượng</th>
              <th className="text-right py-3 px-2">Giá đơn vị</th>
              <th className="text-right py-3 px-2">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items && invoice.items.length > 0 ? (
              invoice.items.map((item, idx) => {
                const total = (item.quantity || 0) * (item.unitPrice || 0)
                return (
                  <tr key={idx} className="border-b">
                    <td className="py-3 px-2 text-center">{idx + 1}</td>
                    <td className="py-3 px-2">Sản phẩm {item.productId || item.serviceId}</td>
                    <td className="py-3 px-2 text-center">{item.quantity || 0}</td>
                    <td className="py-3 px-2 text-right">{(item.unitPrice || 0).toLocaleString()}đ</td>
                    <td className="py-3 px-2 text-right font-medium">{total.toLocaleString()}đ</td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={5} className="py-4 text-center text-gray-500">
                  Không có sản phẩm
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Tóm tắt tiền */}
      <div className="mb-8 ml-auto max-w-sm">
        <div className="border p-4 space-y-3">
          <div className="flex justify-between">
            <span>Tổng tiền hàng:</span>
            <span className="font-medium">{(invoice.totalAmount || 0).toLocaleString()}đ</span>
          </div>
          <div className="flex justify-between">
            <span>Giảm giá:</span>
            <span className="font-medium">-{(invoice.discountAmount || 0).toLocaleString()}đ</span>
          </div>
          <div className="border-t pt-3 flex justify-between text-lg">
            <span className="font-bold">Tổng thanh toán:</span>
            <span className="font-bold text-lg">{(invoice.finalAmount || 0).toLocaleString()}đ</span>
          </div>
        </div>
      </div>

      {/* Phương thức thanh toán */}
      <div className="mb-8 border-t pt-4">
        <p className="text-sm text-gray-600">Phương thức thanh toán</p>
        <p className="font-medium text-lg">{invoice.paymentMethod || 'N/A'}</p>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center border-t pt-4 text-sm text-gray-600">
        <p>Cảm ơn quý khách đã tin tưởng sử dụng dịch vụ của chúng tôi!</p>
        <p className="mt-2">Hóa đơn này được in tự động từ hệ thống</p>
      </div>

      {/* Print button - Chỉ hiển thị trên web, ẩn khi in */}
      <div className="no-print mt-8 flex justify-center gap-4">
        <Button onClick={() => window.print()}>In hóa đơn</Button>
        <Button variant="outline" onClick={() => window.close()}>Đóng</Button>
      </div>

      <style>{`
        @media print {
          .no-print {
            display: none;
          }
          body {
            margin: 0;
            padding: 0;
          }
        }
      `}</style>
    </div>
  )
}
