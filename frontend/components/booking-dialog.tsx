"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface BookingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BookingDialog({ open, onOpenChange }: BookingDialogProps) {
  const [formData, setFormData] = useState({
    customer: "",
    pet: "",
    service: "",
    branch: "",
    date: "",
    time: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Booking form submitted:", formData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Đặt lịch hẹn mới</DialogTitle>
          <DialogDescription>Chọn khách hàng, thú cưng và dịch vụ cần đặt lịch</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer">Khách hàng</Label>
            <Select value={formData.customer} onValueChange={(value) => setFormData({ ...formData, customer: value })}>
              <SelectTrigger id="customer">
                <SelectValue placeholder="Chọn khách hàng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Nguyễn Văn A</SelectItem>
                <SelectItem value="2">Trần Thị B</SelectItem>
                <SelectItem value="3">Lê Văn C</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pet">Thú cưng</Label>
            <Select value={formData.pet} onValueChange={(value) => setFormData({ ...formData, pet: value })}>
              <SelectTrigger id="pet">
                <SelectValue placeholder="Chọn thú cưng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Milu (Chó)</SelectItem>
                <SelectItem value="2">Kitty (Mèo)</SelectItem>
                <SelectItem value="3">Rocky (Chó)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="service">Dịch vụ</Label>
            <Select value={formData.service} onValueChange={(value) => setFormData({ ...formData, service: value })}>
              <SelectTrigger id="service">
                <SelectValue placeholder="Chọn dịch vụ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Khám tổng quát</SelectItem>
                <SelectItem value="2">Tiêm phòng</SelectItem>
                <SelectItem value="3">Tắm & cắt tỉa</SelectItem>
                <SelectItem value="4">Phẫu thuật</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="branch">Chi nhánh</Label>
            <Select value={formData.branch} onValueChange={(value) => setFormData({ ...formData, branch: value })}>
              <SelectTrigger id="branch">
                <SelectValue placeholder="Chọn chi nhánh" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Chi nhánh Quận 1</SelectItem>
                <SelectItem value="2">Chi nhánh Quận 3</SelectItem>
                <SelectItem value="3">Chi nhánh Quận 10</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="date">Ngày</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Giờ</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Hủy
            </Button>
            <Button type="submit" className="flex-1">
              Đặt lịch
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
