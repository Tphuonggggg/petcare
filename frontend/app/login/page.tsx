"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PawPrint, ArrowLeft, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getRouteByPositionId } from "@/lib/roleRouting"

interface LoginResponse {
  accountId: number
  username: string
  role: string
  displayName: string
  employeeId?: number
  customerId?: number
  branchId?: number
  positionId?: number
  token: string
}

const DEMO_ACCOUNTS = [
  // Veterinarian (Bác sĩ thú y) - PositionID: 1
  { username: "daophuonghung7", password: "123456", role: "Bác sĩ thú y", position: "🏥 Bác sĩ Thú y" },
  
  // Receptionist (Nhân viên tiếp tân) - PositionID: 2
  { username: "dominhquan3", password: "123456", role: "Nhân viên tiếp tân", position: "📞 Tiếp Tân" },
  
  // Sales (Nhân viên bán hàng) - PositionID: 3
  { username: "vuongbaothao2", password: "123456", role: "Nhân viên bán hàng", position: "💰 Bán Hàng" },
  
  // Manager (Quản lý chi nhánh) - PositionID: 4
  { username: "dangthiphuc1", password: "123456", role: "Quản lý chi nhánh", position: "👔 Quản Lý" },
  
  // Customer (Khách hàng)
  { username: "0900000001", password: "123456", role: "Khách hàng", position: "🛒 Khách Hàng" },
]

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleDemoLogin = (demoUsername: string, demoPassword: string) => {
    setUsername(demoUsername)
    setPassword(demoPassword)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Call real backend login API
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.message || "Đăng nhập thất bại. Vui lòng kiểm tra tài khoản và mật khẩu.")
        return
      }

      const data: LoginResponse = await response.json()

      // Clear old session data first (in case user didn't logout)
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      localStorage.removeItem('employeeId')
      localStorage.removeItem('customerId')
      localStorage.removeItem('branchId')
      localStorage.removeItem('positionId')

      // Store login info
      localStorage.setItem("user", JSON.stringify({
        accountId: data.accountId,
        username: data.username,
        displayName: data.displayName,
        role: data.role,
        employeeId: data.employeeId,
        customerId: data.customerId,
        positionId: data.positionId,
        branchId: data.branchId,
      }))
      localStorage.setItem("token", data.token)
      
      // Store branchId if exists (employees only)
      if (data.branchId) {
        localStorage.setItem("branchId", data.branchId.toString())
      }
      
      // Store employeeId separately for easy access
      if (data.employeeId) {
        localStorage.setItem("employeeId", data.employeeId.toString())
      }
      
      // Store customerId if it's a customer login
      if (data.customerId) {
        localStorage.setItem("customerId", data.customerId.toString())
      }
      
      // Store positionId if it's an employee
      if (data.positionId) {
        localStorage.setItem("positionId", data.positionId.toString())
      }

      // Determine route based on PositionID (for employees)
      // or use customer route for customer accounts
      if (data.employeeId && data.positionId) {
        // Employee login - use PositionID to determine route
        const route = getRouteByPositionId(data.positionId)
        router.push(route)
      } else if (data.customerId) {
        // Customer login
        router.push("/customer")
      } else {
        // Fallback
        router.push("/")
      }
    } catch (err) {
      setError("Lỗi kết nối. Vui lòng thử lại sau.")
      console.error("Login error:", err)
    } finally {
      setIsLoading(false)
    }
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

        <div className="flex gap-3 mb-8">
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full">
              ← Trang chủ
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <PawPrint className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl">Đăng nhập PetCareX</CardTitle>
            <CardDescription>
              Đăng nhập bằng tài khoản nhân viên hoặc khách hàng của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">Tên đăng nhập</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Nhập tên đăng nhập"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>

              <div className="mt-6 space-y-3">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300"></span>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Tài khoản demo</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  {DEMO_ACCOUNTS.map((account) => (
                    <button
                      key={account.username}
                      onClick={() => handleDemoLogin(account.username, account.password)}
                      disabled={isLoading}
                      className="p-3 text-left text-sm border border-gray-200 rounded-md hover:bg-gray-50 hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-pre-wrap"
                    >
                      <div className="font-semibold text-gray-900">{account.position}</div>
                      <div className="text-xs text-gray-500 mt-1">{account.username} / {account.password}</div>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
