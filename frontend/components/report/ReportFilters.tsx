"use client"
import React, { useEffect, useState } from 'react'
import { apiGet } from '../../lib/api'

export type ReportFiltersProps = {
  branchSelectable?: boolean
  initialBranchId?: number | null
  onChange?: (opts: { branchId?: number | null; from?: string; to?: string; period?: string }) => void
}

export default function ReportFilters({ branchSelectable = true, initialBranchId = null, onChange }: ReportFiltersProps) {
  const [branches, setBranches] = useState<Array<any>>([])
  const [branchId, setBranchId] = useState<number | null>(initialBranchId)
  const [from, setFrom] = useState<string>('')
  const [to, setTo] = useState<string>('')
  const [period, setPeriod] = useState<string>('day')

  useEffect(() => {
    let mounted = true
    apiGet('/branches')
      .then((b: any) => mounted && setBranches(b || []))
      .catch(() => {})
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    onChange?.({ branchId, from: from || undefined, to: to || undefined, period })
  }, [branchId, from, to, period])

  // hide branch selector when layouts set this flag (reception/sales/vet)
  const [branchSelectorDisabled, setBranchSelectorDisabled] = useState(false)
  useEffect(() => {
    try { setBranchSelectorDisabled(localStorage.getItem('branch_selector_disabled') === '1') } catch { setBranchSelectorDisabled(false) }
  }, [])

  const effectiveBranchSelectable = branchSelectable && !branchSelectorDisabled

  return (
    <div className="p-4 bg-white rounded-md shadow-sm">
      <div className="flex gap-3 flex-wrap">
        {effectiveBranchSelectable && (
          <div>
            <label className="text-sm block mb-1">Chi nhánh</label>
            <select value={branchId ?? ''} onChange={(e) => setBranchId(e.target.value ? Number(e.target.value) : null)} className="border px-2 py-1 rounded">
              <option value="">Tất cả</option>
              {branches.map((b: any) => (
                <option key={b.branchId || b.id} value={b.branchId || b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="text-sm block mb-1">Từ</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border px-2 py-1 rounded" />
        </div>

        <div>
          <label className="text-sm block mb-1">Đến</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="border px-2 py-1 rounded" />
        </div>

        <div>
          <label className="text-sm block mb-1">Khoảng</label>
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="border px-2 py-1 rounded">
            <option value="day">Ngày</option>
            <option value="month">Tháng</option>
            <option value="quarter">Quý</option>
            <option value="year">Năm</option>
          </select>
        </div>
      </div>
    </div>
  )
}
