"use client"

import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import VetNav from "@/components/vet-nav"
import { Card, CardContent } from "@/components/ui/card"

export default function VetLayout({ children }: { children: ReactNode }) {
  const [vet, setVet] = useState<{ email?: string; role?: string; fullName?: string } | null>(null)
  const [branchName, setBranchName] = useState<string | null>(null)

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || 'null')
      setVet(u)
      // auto-set selected branch if user has branch info
      const bid = u && (u.branchId || u.branch?.id || u.selectedBranchId)
      const bname = u && (u.branchName || u.branch?.name || u.selectedBranchName)
      if (bid && !localStorage.getItem('selected_branch_id')) {
        localStorage.setItem('selected_branch_id', String(bid))
      }
      if (bname && !localStorage.getItem('selected_branch_name')) {
        localStorage.setItem('selected_branch_name', String(bname))
      }
    } catch { setVet(null) }
    try { localStorage.setItem('branch_selector_disabled', '1') } catch {}
    setBranchName(localStorage.getItem('selected_branch_name'))
  }, [])

  return (
    <div className="flex min-h-screen">
      <VetNav />
      <main className="flex-1 p-6 lg:p-8">
        <div className="mb-6">
          <Card>
            <CardContent className="flex items-center justify-between gap-4">
              <div>
                <div className="font-semibold">{vet?.fullName ?? vet?.email ?? 'Bác sĩ'}</div>
                <div className="text-sm text-muted-foreground">{vet?.email ?? ''} — {vet?.role ?? ''}</div>
              </div>
              <div className="text-sm text-muted-foreground">Chi nhánh: {branchName ?? 'Chưa chọn'}</div>
            </CardContent>
          </Card>
        </div>

        {children}
      </main>
    </div>
  )
}
