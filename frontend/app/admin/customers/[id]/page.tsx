"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from '@/hooks/use-toast'

export default function AdminCustomerEditPage({ params }: any) {
  const router = useRouter()
  const { id } = params || {}
  const [customer, setCustomer] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        const { apiGet } = await import('@/lib/api')
        const data = await apiGet(`/customers/${id}`)
        if (!mounted) return
        setCustomer(data || null)
      } catch (err) {
        console.error(err)
        toast({ title: 'Lỗi', description: 'Không thể tải khách hàng', variant: 'destructive' })
      } finally {
        setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [id])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const payload: any = {
      fullName: String(fd.get('fullName') || '').trim(),
      email: String(fd.get('email') || '').trim(),
      phone: String(fd.get('phone') || '').trim(),
      address: String(fd.get('address') || '').trim(),
    }
    try {
      setSaving(true)
      const { apiPut } = await import('@/lib/api')
      await apiPut(`/customers/${id}`, payload)
      toast({ title: 'Đã lưu', description: 'Thông tin khách hàng đã được cập nhật.' })
      router.push('/admin/customers')
    } catch (err: any) {
      console.error(err)
      toast({ title: 'Lỗi', description: err?.message || String(err), variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Xác nhận xóa khách hàng này?')) return
    try {
      const { apiDelete } = await import('@/lib/api')
      await apiDelete(`/customers/${id}`)
      toast({ title: 'Đã xóa', description: 'Khách hàng đã được xóa.' })
      router.push('/admin/customers')
    } catch (err: any) {
      console.error(err)
      toast({ title: 'Lỗi', description: err?.message || String(err), variant: 'destructive' })
    }
  }

  if (loading) return <div className="p-4">Đang tải...</div>
  if (!customer) return <div className="p-4">Không tìm thấy khách hàng.</div>

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h2 className="text-lg font-bold">Chỉnh sửa khách hàng</h2>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin khách hàng #{id}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit as any} className="space-y-4">
              <div>
                <Label>Họ và tên</Label>
                <Input name="fullName" defaultValue={customer.fullName || customer.name || ''} />
              </div>
              <div>
                <Label>Email</Label>
                <Input name="email" type="email" defaultValue={customer.email || ''} />
              </div>
              <div>
                <Label>Số điện thoại</Label>
                <Input name="phone" defaultValue={customer.phone || ''} />
              </div>
              <div>
                <Label>Địa chỉ</Label>
                <Input name="address" defaultValue={customer.address || ''} />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</Button>
                <Button type="button" variant="outline" onClick={() => router.push('/admin/customers')}>Hủy</Button>
                <Button type="button" variant="destructive" onClick={handleDelete}>Xóa</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
