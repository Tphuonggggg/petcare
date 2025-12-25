import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Bell, Lock, User, Database } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold">Cài đặt</h1>
        <p className="text-muted-foreground mt-1">Quản lý cấu hình hệ thống</p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Thông tin tài khoản</h2>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Họ tên</Label>
              <Input id="name" defaultValue="Admin User" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="admin@petcare.vn" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Số điện thoại</Label>
            <Input id="phone" defaultValue="0901234567" />
          </div>
          <Button>Cập nhật thông tin</Button>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Lock className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Bảo mật</h2>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
            <Input id="current-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">Mật khẩu mới</Label>
            <Input id="new-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
            <Input id="confirm-password" type="password" />
          </div>
          <Button>Đổi mật khẩu</Button>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Thông báo</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Lịch hẹn mới</p>
              <p className="text-sm text-muted-foreground">Nhận thông báo khi có lịch hẹn mới</p>
            </div>
            <input type="checkbox" className="h-5 w-5" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Thanh toán</p>
              <p className="text-sm text-muted-foreground">Thông báo về các giao dịch thanh toán</p>
            </div>
            <input type="checkbox" className="h-5 w-5" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Báo cáo hàng tuần</p>
              <p className="text-sm text-muted-foreground">Nhận báo cáo tổng hợp mỗi tuần</p>
            </div>
            <input type="checkbox" className="h-5 w-5" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Database className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Cơ sở dữ liệu</h2>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Quản lý và sao lưu cơ sở dữ liệu của hệ thống</p>
          <div className="flex gap-3">
            <Button variant="outline">Sao lưu dữ liệu</Button>
            <Button variant="outline">Khôi phục dữ liệu</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
