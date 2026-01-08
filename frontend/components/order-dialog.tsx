"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"

interface OrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pets: any[]
  branches: any[]
  onSubmit: (data: { branchId: number; petId?: number; paymentMethod: string; notes?: string }) => Promise<void>
  isLoading?: boolean
}

const PAYMENT_METHODS = [
  { value: "CASH", label: "💵 Tiền mặt" },
  { value: "CARD", label: "💳 Thẻ ngân hàng" },
  { value: "BANKING", label: "🏦 Chuyển khoản" },
]

export function OrderDialog({ open, onOpenChange, pets, branches, onSubmit, isLoading }: OrderDialogProps) {
  const [branchId, setBranchId] = useState<string>("")
  const [petId, setPetId] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  const [error, setError] = useState<string>("")

  const handleSubmit = async () => {
    setError("")

    if (!branchId) {
      setError("Vui lòng chọn chi nhánh")
      return
    }

    if (!paymentMethod) {
      setError("Vui lòng chọn phương thức thanh toán")
      return
    }

    try {
      await onSubmit({
        branchId: parseInt(branchId),
        petId: petId ? parseInt(petId) : undefined,
        paymentMethod,
        notes: notes || undefined,
      })
      // Reset form
      setBranchId("")
      setPetId("")
      setPaymentMethod("")
      setNotes("")
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message || "Không thể tạo đơn hàng")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Thông tin đặt mua</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Branch Selection */}
          <div className="space-y-2">
            <Label htmlFor="branch">
              Chọn chi nhánh <span className="text-red-500">*</span>
            </Label>
            <Select value={branchId} onValueChange={setBranchId}>
              <SelectTrigger id="branch">
                <SelectValue placeholder="-- Chọn chi nhánh --" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((branch) => (
                  <SelectItem key={branch.branchId || branch.id} value={String(branch.branchId || branch.id)}>
                    🏢 {branch.name || branch.branchName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Pet Selection */}
          <div className="space-y-2">
            <Label htmlFor="pet">Chọn thú cưng (tùy chọn)</Label>
            <Select value={petId} onValueChange={setPetId}>
              <SelectTrigger id="pet">
                <SelectValue placeholder="-- Không chọn thú cưng --" />
              </SelectTrigger>
              <SelectContent>
                {pets.map((pet) => (
                  <SelectItem key={pet.petId || pet.id} value={String(pet.petId || pet.id)}>
                    🐾 {pet.name || pet.petName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Liên kết đơn hàng với thú cưng (không bắt buộc)
            </p>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="payment">
              Phương thức thanh toán <span className="text-red-500">*</span>
            </Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger id="payment">
                <SelectValue placeholder="-- Chọn phương thức --" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú (tùy chọn)</Label>
            <Textarea
              id="notes"
              placeholder="Nhập ghi chú cho đơn hàng..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-24"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !branchId || !paymentMethod}
            className="flex-1"
          >
            {isLoading ? "Đang xử lý..." : "Xác nhận đặt mua"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
