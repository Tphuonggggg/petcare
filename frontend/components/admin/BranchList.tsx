"use client"
import React, { useEffect, useState } from 'react'
import { apiGet } from '@/lib/api'

export default function BranchList() {
  const [branches, setBranches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    apiGet('/branches')
      .then((b) => { if (!mounted) return; setBranches(Array.isArray(b) ? b : []) })
      .catch(() => {})
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [])

  if (loading) return <div>Đang tải danh sách chi nhánh...</div>

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Toàn bộ chi nhánh</h2>
      <div className="space-y-3">
        {branches.map((b) => (
          <div key={b.branchId || b.id} className="p-4 bg-white rounded shadow flex justify-between items-center">
            <div>
              <div className="font-medium">{b.name}</div>
              <div className="text-sm text-muted-foreground">{b.address || 'Chưa có địa chỉ'}</div>
            </div>
            <div className="text-sm text-muted-foreground">{b.phone || '—'}</div>
          </div>
        ))}
        {branches.length === 0 && <div className="p-4 bg-white rounded shadow">Không có chi nhánh</div>}
      </div>
    </div>
  )
}
