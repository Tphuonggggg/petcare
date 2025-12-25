import { Card } from "@/components/ui/card"
import { Users, PawPrint, Calendar, Package, DollarSign, Building } from "lucide-react"

export default function DashboardPage() {
  const stats = [
    { title: "Tổng khách hàng", value: "2,847", icon: Users, color: "text-blue-600" },
    { title: "Thú cưng đang chăm sóc", value: "1,234", icon: PawPrint, color: "text-pink-600" },
    { title: "Lịch hẹn hôm nay", value: "45", icon: Calendar, color: "text-purple-600" },
    { title: "Sản phẩm", value: "890", icon: Package, color: "text-green-600" },
    { title: "Doanh thu tháng", value: "125M VNĐ", icon: DollarSign, color: "text-amber-600" },
    { title: "Chi nhánh", value: "20", icon: Building, color: "text-cyan-600" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Tổng quan hệ thống quản lý PetCare</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <Icon className={`h-10 w-10 ${stat.color}`} />
              </div>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Lịch hẹn sắp tới</h3>
          <div className="space-y-3">
            {[
              { time: "09:00", customer: "Nguyễn Văn A", pet: "Milu (Chó)", service: "Khám tổng quát" },
              { time: "10:30", customer: "Trần Thị B", pet: "Kitty (Mèo)", service: "Tiêm phòng" },
              { time: "14:00", customer: "Lê Văn C", pet: "Rocky (Chó)", service: "Tắm & cắt tỉa" },
            ].map((appointment, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="font-semibold text-primary min-w-[60px]">{appointment.time}</div>
                <div className="flex-1">
                  <p className="font-medium">{appointment.customer}</p>
                  <p className="text-sm text-muted-foreground">
                    {appointment.pet} - {appointment.service}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Hoạt động gần đây</h3>
          <div className="space-y-3">
            {[
              { action: "Khách hàng mới đăng ký", name: "Phạm Thị D", time: "5 phút trước" },
              { action: "Hoàn thành dịch vụ", name: "Chó Lucky - Tắm & Spa", time: "15 phút trước" },
              { action: "Thanh toán hóa đơn", name: "HD#1234 - 850,000 VNĐ", time: "30 phút trước" },
            ].map((activity, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="flex-1">
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">{activity.name}</p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
