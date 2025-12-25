"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { apiPost } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CustomerDialog({ open, onOpenChange }: CustomerDialogProps) {
  const [tiers, setTiers] = useState<{ membershipTierId: number; name: string }[]>([])
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    membershipTierId: 0,
    gender: "M",
  })

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { apiGet } = await import('@/lib/api')
        const data = await apiGet('/membershiptiers')
        if (mounted && Array.isArray(data)) {
          const list = data.map((t: any) => ({ membershipTierId: t.membershipTierId ?? t.membershipTierId ?? t.id, name: t.name ?? t.Name ?? t.Name }))
          setTiers(list)
          if (list.length > 0 && !formData.membershipTierId) setFormData(s => ({ ...s, membershipTierId: list[0].membershipTierId }))
        }
      } catch {
        // ignore, keep defaults
      }
    })()
    return () => { mounted = false }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    ;(async () => {
      try {
        const payload = {
          fullName: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          gender: formData.gender,
          membershipTierId: formData.membershipTierId || undefined,
        }
        const created = await apiPost('/customers', payload)
        try { window.dispatchEvent(new CustomEvent('customer-added', { detail: created })) } catch {}
        onOpenChange(false)
      } catch (err: any) {
        console.error('Create customer failed', err)
        alert('Tạo khách hàng thất bại: ' + (err?.message || err))
      }
    })()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm khách hàng mới</DialogTitle>
          <DialogDescription>Nhập thông tin khách hàng vào form bên dưới</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Họ tên</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Số điện thoại</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Địa chỉ</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Giới tính</Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => setFormData({ ...formData, gender: value })}
            >
              <SelectTrigger id="gender">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M">Nam</SelectItem>
                <SelectItem value="F">Nữ</SelectItem>
                <SelectItem value="O">Khác</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tier">Hạng thành viên</Label>
            <Select
              value={String(formData.membershipTierId)}
              onValueChange={(value) => setFormData({ ...formData, membershipTierId: parseInt(value, 10) })}
            >
              <SelectTrigger id="tier">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tiers.length === 0 ? (
                  <SelectItem value="0">Standard</SelectItem>
                ) : (
                  tiers.map(t => (
                    <SelectItem key={t.membershipTierId} value={String(t.membershipTierId)}>{t.name}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Hủy
            </Button>
            <Button type="submit" className="flex-1">
              Lưu
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
