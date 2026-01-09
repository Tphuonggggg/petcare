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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tiers, setTiers] = useState<Array<{ membershipTierId: number; name: string }>>([])
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
        const data = await apiGet('/membershiptiers?pageSize=100')
        if (mounted) {
          let tiersList = []
          if (data?.items && Array.isArray(data.items)) {
            tiersList = data.items.map((t: any) => ({ membershipTierId: t.membershipTierId || t.id, name: t.name }))
          } else if (Array.isArray(data)) {
            tiersList = data.map((t: any) => ({ membershipTierId: t.membershipTierId || t.id, name: t.name }))
          }
          setTiers(tiersList)
          if (tiersList.length > 0) setFormData(s => ({ ...s, membershipTierId: tiersList[0].membershipTierId }))
        }
      } catch (error) {
        console.error('Failed to load tiers:', error)
      }
    })()
    return () => { mounted = false }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    // Validation
    if (!formData.name.trim()) {
      setError('Vui lòng nhập họ tên')
      return
    }
    if (!formData.phone.trim()) {
      setError('Vui lòng nhập số điện thoại')
      return
    }
    if (!formData.email.trim()) {
      setError('Vui lòng nhập email')
      return
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email.trim())) {
      setError('Email không hợp lệ')
      return
    }

    ;(async () => {
      try {
        setLoading(true)
        const payload = {
          fullName: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          address: formData.address?.trim() || '',
          gender: formData.gender,
          membershipTierId: formData.membershipTierId || undefined,
        }
        const created = await apiPost('/customers', payload)
        try { window.dispatchEvent(new CustomEvent('customer-added', { detail: created })) } catch {}
        setFormData({ name: "", email: "", phone: "", address: "", membershipTierId: tiers.length > 0 ? tiers[0].membershipTierId : 0, gender: "M" })
        onOpenChange(false)
      } catch (err: any) {
        console.error('Create customer failed', err)
        // Handle duplicate email error
        if (err?.message?.includes('UNIQUE KEY') || err?.message?.includes('duplicate')) {
          setError('Email này đã được sử dụng, vui lòng nhập email khác')
        } else {
          setError(err?.message || 'Tạo khách hàng thất bại')
        }
      } finally {
        setLoading(false)
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
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
              {error}
            </div>
          )}
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
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="flex-1"
              disabled={loading}
            >
              Hủy
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={loading}
            >
              {loading ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
