"use client"
import React from 'react'
import Link from 'next/link'

export default function ReportsIndex() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Báo cáo & Quản lý</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/reports/branch" className="p-4 bg-white rounded shadow hover:shadow-md">
          <h3 className="font-medium">Cấp Chi nhánh</h3>
          <p className="text-sm text-muted-foreground">Báo cáo và công cụ quản lý ở cấp chi nhánh</p>
        </Link>

        <Link href="/reports/company" className="p-4 bg-white rounded shadow hover:shadow-md">
          <h3 className="font-medium">Cấp Công ty</h3>
          <p className="text-sm text-muted-foreground">Báo cáo hệ thống và quản lý nhân sự/chính sách</p>
        </Link>
      </div>
    </div>
  )
}
