"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getSelectedBranchId } from '@/lib/branch'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PawPrint, ArrowLeft } from "lucide-react"

type UserRole = "customer" | "receptionist" | "sales" | "vet" | "branch_manager" | "admin"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<UserRole>("customer")
  
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Mock authentication: store user and set branch if employee
    const userObj: any = { email, role }
    localStorage.setItem('user', JSON.stringify(userObj))
    try {
      const { apiGet } = await import('@/lib/api')
      if (['receptionist','sales','vet','branch_manager'].includes(role)) {
        try {
          const emp = await apiGet('/employees?email=' + encodeURIComponent(email))
          if (emp && (emp as any).branchId) {
            const id = (emp as any).branchId
            try {
              const b = await apiGet('/branches/' + id)
              const name = b?.name ?? ''
              localStorage.setItem('selected_branch_id', String(id))
              localStorage.setItem('selected_branch_name', String(name))
              window.dispatchEvent(new CustomEvent('branch-changed', { detail: { id, name } }))
            } catch {}
          }
        } catch {
          // ignore if no employee found; keep user but no branch set
        }
      }
    } catch {}

    // Redirect
    switch (role) {
      case 'customer':
        router.push('/customer')
        break
      case 'receptionist':
        router.push('/reception')
        break
      case 'sales':
        router.push('/sales')
        break
      case 'vet':
        router.push('/vet')
        break
      case 'branch_manager':
        router.push('/dashboard')
        break
      case 'admin':
        router.push('/dashboard')
        break
      default:
        router.push('/')
    }
    setIsLoading(false)
    return

    // Default mock auth for customer/admin
    setTimeout(async () => {
      localStorage.setItem('user', JSON.stringify({ email, role }))
      if (role === 'admin') router.push('/dashboard')
      else router.push('/customer')
      setIsLoading(false)
    }, 500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="flex items-center gap-2 mb-8 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại trang chủ
        </Link>

        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <PawPrint className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl">Đăng nhập PetCare</CardTitle>
            <CardDescription>Đăng nhập vào hệ thống quản lý thú cưng</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">Vai trò</Label>
                <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Khách hàng</SelectItem>
                    <SelectItem value="receptionist">Nhân viên tiếp tân</SelectItem>
                    <SelectItem value="sales">Nhân viên bán hàng</SelectItem>
                    <SelectItem value="vet">Bác sĩ thú y</SelectItem>
                    <SelectItem value="branch_manager">Quản lý chi nhánh</SelectItem>
                    <SelectItem value="admin">Quản trị viên</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <>
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@petcare.vn"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Mật khẩu</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                  </Button>
                </>
              </>

              <div className="text-center text-sm text-muted-foreground">
                Chưa có tài khoản?{" "}
                <Link href="/register" className="text-primary hover:underline">
                  Đăng ký ngay
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-muted rounded-lg text-sm">
          <p className="font-medium mb-2">Demo accounts (seeded)</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>Khách hàng: customer1@gmail.com</li>
            <li>Khách hàng: customer2@gmail.com</li>
            <li>Nhân viên tiếp tân: receptionist@petcare.vn — mã: EMP001</li>
            <li>Nhân viên bán hàng: sales@petcare.vn — mã: EMP002</li>
            <li>Bác sĩ thú y: vet@petcare.vn — mã: EMP004</li>
            <li>Quản lý chi nhánh: manager@petcare.vn — mã: MGR001</li>
            <li>Admin: admin@petcare.vn — mã: ADMIN</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
