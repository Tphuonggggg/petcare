import type { ReactNode } from "react"
import { CustomerNav } from "@/components/customer-nav"

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <CustomerNav />
      <main className="flex-1 p-6 lg:p-8">{children}</main>
    </div>
  )
}
