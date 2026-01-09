"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building, MapPin, Phone, Plus, Users } from "lucide-react"

interface Branch {
  branchId: number
  name: string
  address: string
  phone: string
  openTime?: string
  closeTime?: string
  managerName?: string
  staffCount?: number
  status?: string
}

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [statsState, setStatsState] = useState<Record<number, { open: boolean; loading: boolean; period: string; revenue: number; count: number }>>({})

  // Load branches from API
  useEffect(() => {
    let mounted = true
    async function loadBranches() {
      setLoading(true)
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('http://localhost:5000/api/branches?pageSize=100', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          const branchList = data.items || []
          if (mounted && Array.isArray(branchList)) {
            setBranches(branchList)
          }
        }
      } catch (e) {
        console.error('Error loading branches:', e)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadBranches()
    return () => { mounted = false }
  }, [])

  async function loadStatsFor(branchId: number, period: string) {
    setStatsState(s => ({ ...s, [branchId]: { ...(s[branchId] || {}), open: true, loading: true, period, revenue: 0, count: 0 } }))
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/invoices?branchId=${branchId}&pageSize=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const invoices = data.items || []
        
        // Filter by period
        const now = new Date()
        const filtered = invoices.filter((i: any) => {
          const issued = new Date(i.invoiceDate || new Date())
          if (period === 'day') return issued.toDateString() === now.toDateString()
          if (period === 'month') return issued.getFullYear() === now.getFullYear() && issued.getMonth() === now.getMonth()
          if (period === 'year') return issued.getFullYear() === now.getFullYear()
          return true
        })

        const revenue = filtered.reduce((s: number, inv: any) => s + (inv.finalAmount || inv.totalAmount || inv.total || 0), 0)
        const count = filtered.length
        setStatsState(s => ({ ...s, [branchId]: { ...(s[branchId] || {}), open: true, loading: false, period, revenue, count } }))
      }
    } catch (e) {
      console.error('Error loading stats:', e)
      setStatsState(s => ({ ...s, [branchId]: { ...(s[branchId] || {}), open: true, loading: false, period, revenue: 0, count: 0 } }))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Chi nhánh</h1>
          <p className="text-muted-foreground mt-1">Quản lý các chi nhánh PetCare</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Thêm chi nhánh
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="text-muted-foreground">Đang tải dữ liệu chi nhánh...</div>
        </div>
      ) : branches.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {branches.map((branch) => (
            <Card key={branch.branchId} className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Building className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{branch.name}</h3>
                      <Badge className="mt-1 bg-green-100 text-green-700">Đang hoạt động</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-muted-foreground text-balance">{branch.address || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{branch.phone || 'Chưa cập nhật'}</span>
                  </div>
                  {branch.openTime && branch.closeTime && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">Giờ hoạt động: {branch.openTime} - {branch.closeTime}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t space-y-2">
                  {branch.managerName && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Quản lý</span>
                      <span className="font-medium">{branch.managerName}</span>
                    </div>
                  )}
                  {branch.staffCount !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Nhân viên</span>
                      <span className="font-medium flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {branch.staffCount} người
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button 
                    size="sm"
                    onClick={() => window.location.href = `/dashboard/reports/branch?branchId=${branch.branchId}`}
                  >
                    Thống kê
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex justify-center py-12">
          <div className="text-muted-foreground">Không có chi nhánh nào</div>
        </div>
      )}
    </div>
  )
}
