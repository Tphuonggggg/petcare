"use client"
import React from 'react'
import Link from 'next/link'
import ReportFilters from '../../../../components/report/ReportFilters'

export default function CompanyReports() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Báo cáo - Cấp Công ty</h1>
      </div>

      <ReportFilters branchSelectable={false} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        <Link href="/reports/company/revenue" className="p-4 bg-white rounded shadow hover:shadow-md">
          <h3 className="font-medium">Doanh thu toàn hệ thống & theo chi nhánh</h3>
        </Link>

        <Link href="/reports/company/top-services" className="p-4 bg-white rounded shadow hover:shadow-md">
          <h3 className="font-medium">Dịch vụ mang lại doanh thu cao nhất</h3>
        </Link>

        <Link href="/reports/company/pet-stats" className="p-4 bg-white rounded shadow hover:shadow-md">
          <h3 className="font-medium">Thống kê thú cưng theo loài/giống</h3>
        </Link>

        <Link href="/reports/company/membership" className="p-4 bg-white rounded shadow hover:shadow-md">
          <h3 className="font-medium">Tình hình hội viên (Cơ bản/Thân thiết/VIP)</h3>
        </Link>

        <Link href="/reports/company/staff-management" className="p-4 bg-white rounded shadow hover:shadow-md">
          <h3 className="font-medium">Quản lý nhân sự & phân công</h3>
        </Link>
      </div>
    </div>
  )
}
