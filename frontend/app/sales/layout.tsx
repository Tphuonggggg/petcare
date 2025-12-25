"use client"

import type { ReactNode } from "react"
import { useEffect } from "react"
import { SalesNav } from "@/components/sales-nav"

export default function SalesLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    try {
      const raw = localStorage.getItem('user')
      if (!raw) return
      const u = JSON.parse(raw)
      const bid = u.branchId || u.branch?.id || u.branchId || u.selectedBranchId
      const bname = u.branchName || u.branch?.name || u.selectedBranchName
      if (bid && !localStorage.getItem('selected_branch_id')) {
        localStorage.setItem('selected_branch_id', String(bid))
      }
      if (bname && !localStorage.getItem('selected_branch_name')) {
        localStorage.setItem('selected_branch_name', String(bname))
      }
    } catch {}
    try { localStorage.setItem('branch_selector_disabled', '1') } catch {}
  }, [])

  return (
    <div className="flex min-h-screen">
      <SalesNav />
      <main className="flex-1 p-6 lg:p-8">{children}</main>
    </div>
  )
}
