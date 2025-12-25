"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from '@/hooks/use-toast'

export default function AdminCustomersNewPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

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
      const { apiPost } = await import('@/lib/api')
      const created = await apiPost('/customers', payload)
      toast({ title: 'Đã tạo', description: 'Khách hàng đã được tạo.' })
      router.push('/admin/customers')
    } catch (err: any) {
      console.error(err)
      toast({ title: 'Lỗi', description: err?.message || String(err), variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h2 className="text-lg font-bold">Tạo khách hàng mới</h2>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin khách hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit as any} className="space-y-4">
              <div>
                <Label>Họ và tên</Label>
                <Input name="fullName" />
              </div>
              <div>
                <Label>Email</Label>
                <Input name="email" type="email" />
              </div>
              <div>
                <Label>Số điện thoại</Label>
                <Input name="phone" />
              </div>
              <div>
                <Label>Địa chỉ</Label>
                <Input name="address" />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={saving}>{saving ? 'Đang lưu...' : 'Tạo'}</Button>
                <Button type="button" variant="outline" onClick={() => router.push('/admin/customers')}>Hủy</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
