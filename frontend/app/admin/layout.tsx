import type { ReactNode } from "react"
import { DashboardNav } from "@/components/dashboard-nav"
import DashboardBranchGate from '@/components/dashboard-branch-gate'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <DashboardNav />
      <main className="flex-1 p-6 lg:p-8">
        <DashboardBranchGate>
          {children}
        </DashboardBranchGate>
      </main>
    </div>
  )
}
