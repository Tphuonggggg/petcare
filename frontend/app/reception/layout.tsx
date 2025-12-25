"use client"

import type { ReactNode } from "react"
import { useEffect } from "react"
import { ReceptionNav } from "@/components/reception-nav"

export default function ReceptionLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    try {
      const raw = localStorage.getItem('user')
      if (!raw) return
      const u = JSON.parse(raw)
      // if user has branch info, set selected branch in localStorage
      const bid = u.branchId || u.branch?.id || u.branchId || u.selectedBranchId
      const bname = u.branchName || u.branch?.name || u.selectedBranchName
      if (bid && !localStorage.getItem('selected_branch_id')) {
        localStorage.setItem('selected_branch_id', String(bid))
      }
      if (bname && !localStorage.getItem('selected_branch_name')) {
        localStorage.setItem('selected_branch_name', String(bname))
      }
    } catch {
      // ignore
    }
    try { localStorage.setItem('branch_selector_disabled', '1') } catch {}
  }, [])

  return (
    <div className="flex min-h-screen">
      <ReceptionNav />
      <main className="flex-1 p-6 lg:p-8">{children}</main>
    </div>
  )
}
