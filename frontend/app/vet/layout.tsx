"use client"

import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import VetNav from "@/components/vet-nav"
import { Card, CardContent } from "@/components/ui/card"
import { apiGet } from "@/lib/api"

interface Employee {
  employeeId: number
  branchId: number
  fullName: string
  positionId: number
}

interface Branch {
  branchId: number
  name: string
}

export default function VetLayout({ children }: { children: ReactNode }) {
  const [vet, setVet] = useState<{ email?: string; role?: string; fullName?: string; displayName?: string } | null>(null)
  const [branchName, setBranchName] = useState<string>('Đang tải...')
  const [employeeName, setEmployeeName] = useState<string>('Bác sĩ')

  useEffect(() => {
    const loadInfo = async () => {
      try {
        // Get user from localStorage
        const userData = JSON.parse(localStorage.getItem('user') || 'null')
        setVet(userData)
        
        // Get employeeId and branchId
        const employeeId = localStorage.getItem('employeeId')
        let branchId = localStorage.getItem('branchId')
        
        console.log('[VET LAYOUT] Loading - employeeId:', employeeId, 'branchId:', branchId)
        
        // Load employee info
        if (employeeId) {
          try {
            const empData: Employee = await apiGet(`/employees/${employeeId}`)
            console.log('[VET LAYOUT] Employee data:', empData)
            setEmployeeName(empData.fullName || userData?.displayName || 'Bác sĩ')
            
            // If no branchId, get from employee
            if (!branchId && empData.branchId) {
              branchId = empData.branchId.toString()
              localStorage.setItem('branchId', branchId)
            }
          } catch (error) {
            console.error('Error loading employee:', error)
          }
        } else {
          setEmployeeName(userData?.displayName || userData?.fullName || 'Bác sĩ')
        }
        
        // Load branch info
        if (branchId) {
          try {
            const branchData: Branch = await apiGet(`/branches/${branchId}`)
            console.log('[VET LAYOUT] Branch data:', branchData)
            setBranchName(branchData.name || 'Chi nhánh #' + branchId)
          } catch (error) {
            console.error('Error loading branch:', error)
            setBranchName('Chi nhánh #' + branchId)
          }
        } else {
          setBranchName('Chưa chọn')
        }
      } catch (error) {
        console.error('Error in layout load:', error)
        setBranchName('Lỗi tải thông tin')
      }
    }
    
    loadInfo()
  }, [])

  return (
    <div className="flex min-h-screen">
      <VetNav />
      <main className="flex-1 p-6 lg:p-8">
        <div className="mb-6">
          <Card>
            <CardContent className="flex items-center justify-between gap-4 py-4">
              <div>
                <div className="font-semibold">{employeeName}</div>
                <div className="text-sm text-muted-foreground">— EMPLOYEE</div>
              </div>
              <div className="text-sm text-muted-foreground">Chi nhánh: {branchName}</div>
            </CardContent>
          </Card>
        </div>

        {children}
      </main>
    </div>
  )
}
