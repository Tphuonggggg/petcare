"use client"
import React, { useEffect, useState } from 'react'
import { apiGet } from '@/lib/api'

export default function BranchStats() {
  const [branches, setBranches] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    Promise.all([apiGet('/branches'), apiGet('/employees')])
      .then(([b, e]) => {
        if (!mounted) return
        setBranches(Array.isArray(b) ? b : [])
        setEmployees(Array.isArray(e) ? e : [])
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [])

  if (loading) return <div>Đang tải thống kê...</div>

  const totalBranches = branches.length
  const totalEmployees = employees.length
  const employeesPerBranch: Record<string, number> = {}
  employees.forEach((emp: any) => {
    const id = String(emp.branchId || emp.branch?.branchId || emp.branchId)
    employeesPerBranch[id] = (employeesPerBranch[id] || 0) + 1
  })
  const avgEmployees = totalBranches ? Math.round((totalEmployees / totalBranches) * 10) / 10 : 0
  const topBranchId = Object.keys(employeesPerBranch).reduce((a, b) => employeesPerBranch[a] > employeesPerBranch[b] ? a : b, Object.keys(employeesPerBranch)[0] || '')
  const topBranch = branches.find((b) => String(b.branchId || b.id) === String(topBranchId))

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Thống kê chi nhánh</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-muted-foreground">Tổng số chi nhánh</div>
          <div className="text-2xl font-bold">{totalBranches}</div>
        </div>

        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-muted-foreground">Tổng số nhân viên</div>
          <div className="text-2xl font-bold">{totalEmployees}</div>
        </div>

        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-muted-foreground">Trung bình nhân viên / chi nhánh</div>
          <div className="text-2xl font-bold">{avgEmployees}</div>
        </div>
      </div>

      <div className="mt-4 p-4 bg-white rounded shadow">
        <div className="text-sm text-muted-foreground">Chi nhánh có nhiều nhân viên nhất</div>
        <div className="mt-2">
          {topBranch ? (
            <div className="font-medium">{topBranch.name} ({employeesPerBranch[topBranchId]} nhân viên)</div>
          ) : (
            <div>Không có dữ liệu</div>
          )}
        </div>
      </div>
    </div>
  )
}
