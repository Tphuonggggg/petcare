"use client"
import React from 'react'
import Link from 'next/link'
import ReportFilters from '../../../../components/report/ReportFilters'

export default function BranchReports() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Báo cáo - Cấp Chi nhánh</h1>
      </div>

      <ReportFilters />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        <Link href="/reports/branch/revenue" className="p-4 bg-white rounded shadow hover:shadow-md">
          <h3 className="font-medium">Doanh thu (ngày/tháng/quý/năm)</h3>
        </Link>

        <Link href="/reports/branch/vaccinations" className="p-4 bg-white rounded shadow hover:shadow-md">
          <h3 className="font-medium">Danh sách thú cưng được tiêm phòng</h3>
        </Link>

        <Link href="/reports/branch/vaccine-stats" className="p-4 bg-white rounded shadow hover:shadow-md">
          <h3 className="font-medium">Vắc-xin đặt nhiều nhất</h3>
        </Link>

        <Link href="/reports/branch/inventory" className="p-4 bg-white rounded shadow hover:shadow-md">
          <h3 className="font-medium">Tồn kho sản phẩm bán lẻ</h3>
        </Link>

        <Link href="/reports/branch/vaccine-lookup" className="p-4 bg-white rounded shadow hover:shadow-md">
          <h3 className="font-medium">Tra cứu vắc-xin (tên/loại/NX)</h3>
        </Link>

        <Link href="/reports/branch/pet-history" className="p-4 bg-white rounded shadow hover:shadow-md">
          <h3 className="font-medium">Lịch sử khám / gói tiêm / tiêm chủng</h3>
        </Link>

        <Link href="/reports/branch/staff-performance" className="p-4 bg-white rounded shadow hover:shadow-md">
          <h3 className="font-medium">Hiệu suất nhân viên</h3>
        </Link>

        <Link href="/reports/branch/customers" className="p-4 bg-white rounded shadow hover:shadow-md">
          <h3 className="font-medium">Thống kê khách hàng & tần suất quay lại</h3>
        </Link>

        <Link href="/reports/branch/staff-management" className="p-4 bg-white rounded shadow hover:shadow-md">
          <h3 className="font-medium">Quản lý nhân viên chi nhánh</h3>
        </Link>
      </div>
    </div>
  )
}
