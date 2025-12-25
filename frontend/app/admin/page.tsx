"use client"
import React from 'react'
import BranchStats from '@/components/admin/BranchStats'
import BranchList from '@/components/admin/BranchList'

export default function AdminIndex() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Trang Quản trị</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BranchStats />
        </div>

        <div>
          <BranchList />
        </div>
      </div>
    </div>
  )
}
