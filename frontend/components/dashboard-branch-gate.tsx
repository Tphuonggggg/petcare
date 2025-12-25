"use client"

import { useEffect, useState } from 'react'
import BranchSelector from './branch-selector'

export default function DashboardBranchGate({ children }: { children: React.ReactNode }) {
  const [selected, setSelected] = useState<{ id: string | number; name?: string } | null>(null)
  const [showSelector, setShowSelector] = useState(false)

  useEffect(() => {
    try {
      const id = localStorage.getItem('selected_branch_id')
      const name = localStorage.getItem('selected_branch_name')
      if (id) setSelected({ id: Number(id), name: name || undefined })
    } catch {}

    const onChange = (e: any) => {
      const d = e?.detail
      if (!d) {
        setSelected(null)
      } else {
        setSelected({ id: d.id, name: d.name })
        setShowSelector(false)
      }
    }
    window.addEventListener('branch-changed', onChange as EventListener)
    return () => window.removeEventListener('branch-changed', onChange as EventListener)
  }, [])

  if (!selected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-2xl px-4">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold">Vui lòng chọn chi nhánh để truy cập phần quản lý</h2>
            <p className="text-sm text-muted-foreground">Bạn phải chọn chi nhánh trước khi xem khách hàng, hóa đơn, thống kê và thông tin thú cưng.</p>
          </div>
          <BranchSelector onSelected={() => { /* noop */ }} />
        </div>
      </div>
    )
  }

  // hide change UI when layouts request selector disabled
  const branchSelectorDisabled = (() => { try { return localStorage.getItem('branch_selector_disabled') === '1' } catch { return false } })()

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-sm text-muted-foreground">Chi nhánh đang chọn</div>
          <div className="font-semibold">{selected.name ?? `#${selected.id}`}</div>
        </div>
        <div>
          {!branchSelectorDisabled && (
            <button className="text-sm text-primary underline" onClick={() => setShowSelector((s) => !s)}>{showSelector ? 'Đóng' : 'Thay đổi chi nhánh'}</button>
          )}
        </div>
      </div>

      {showSelector && !branchSelectorDisabled && <BranchSelector onSelected={() => setShowSelector(false)} />}

      <div>{children}</div>
    </div>
  )
}
