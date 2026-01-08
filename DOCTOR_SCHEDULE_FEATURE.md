# Hướng Dẫn - Chức Năng Xem Lịch Trình Bác Sĩ

## 📋 Tóm Tắt Thay Đổi

Đã thêm chức năng cho khách hàng xem lịch trình của bác sĩ/nhân viên nhằm giúp họ chọn thời gian hợp lý khi đặt lịch hẹn.

---

## 🗄️ Cơ Sở Dữ Liệu

**Dữ liệu lịch trình bác sĩ được lưu từ:**
1. **Bảng CheckHealth** - Ghi lại các lần khám của bác sĩ
   - `CheckDate`: Thời gian khám
   - `DoctorID`: Bác sĩ thực hiện
   - `PetID`: Thú cưng được khám

2. **Bảng VaccineRecord** - Ghi lại các lần tiêm vaccine
   - `DateAdministered`: Ngày tiêm
   - `DoctorID`: Bác sĩ thực hiện
   - `PetID`: Thú cưng được tiêm

3. **Stored Procedure**: `usp_GetDoctorScheduleByDate`
   - Lấy lịch trình của bác sĩ trong ngày cụ thể
   - Kết hợp dữ liệu từ CheckHealth và VaccineRecord

---

## 🔌 API Endpoint

**Backend (C# .NET Core):**
```
GET /api/employees/{id}/schedule?date={date}
```
- `id`: Employee ID (bác sĩ)
- `date`: Ngày cần xem lịch (format: YYYY-MM-DD)

**Response:**
```json
[
  {
    "appointmentTime": "2026-01-08T09:30:00",
    "petName": "Mèo Miu",
    "activity": "Examination"
  },
  {
    "appointmentTime": "2026-01-08T10:15:00",
    "petName": "Chó Bạc",
    "activity": "Vaccination"
  }
]
```

---

## 📱 Frontend - Trang Mới

### 1. Trang Xem Lịch Trình Bác Sĩ
**File:** `frontend/app/customer/doctor-schedules/page.tsx`

**Tính năng:**
- 📋 Danh sách tất cả bác sĩ (được filter từ vị trí chứa "bác sĩ" hoặc "doctor")
- 📅 Chọn ngày để xem lịch trình
- ⏰ Hiển thị lịch trình bác sĩ với thời gian và loại hoạt động
- 🎯 Giao diện responsive, thân thiện với mobile

**Giao diện:**
- Sidebar trái: Danh sách bác sĩ
- Nội dung chính: Chọn ngày và xem lịch trình
- Card thông tin: Hiển thị từng lịch hẹn

---

## 🔗 Cập Nhật Liên Kết

### 1. Trang Chính Customer
**File:** `frontend/app/customer/page.tsx`

**Thay đổi:**
- ✅ Thêm icon `Clock` từ lucide-react
- ✅ Thêm button "Lịch trình bác sĩ" vào quick actions
- ✅ Thay đổi grid từ 4 cột thành 5 cột

### 2. Trang Lịch Hẹn
**File:** `frontend/app/customer/bookings/page.tsx`

**Thay đổi:**
- ✅ Thêm button "Xem lịch bác sĩ" ở header
- ✅ Icon `Clock` để điều hướng đến trang lịch trình bác sĩ

---

## 🚀 Cách Sử Dụng

### Cho Khách Hàng:
1. Vào trang chủ Customer (dashboard)
2. Click "Lịch trình bác sĩ" hoặc từ trang "Lịch hẹn"
3. Chọn bác sĩ từ danh sách bên trái
4. Chọn ngày để xem lịch trình
5. Xem các hoạt động khám/tiêm chủng của bác sĩ
6. Dựa vào lịch trình để chọn thời gian đặt lịch phù hợp

---

## 📊 Chi Tiết Technical

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **UI Components:** shadcn/ui (Card, Button, Badge, Input, Skeleton, Tabs)
- **Icons:** lucide-react
- **API Client:** apiGet từ `@/lib/api`

### Backend
- **Framework:** ASP.NET Core
- **Database:** SQL Server
- **Stored Procedure:** usp_GetDoctorScheduleByDate

---

## ⚠️ Lưu Ý

1. **Filter bác sĩ:** Chỉ hiển thị những nhân viên có Position chứa từ "bác sĩ", "doctor", hoặc "veterinarian"
2. **Dữ liệu lịch trình:** Dựa trên CheckHealth (khám) và VaccineRecord (tiêm vaccine)
3. **Định dạng ngày:** Sử dụng format ISO (YYYY-MM-DD)
4. **Múi giờ:** Hiển thị theo múi giờ Việt Nam (vi-VN)

---

## 🔧 Troubleshooting

**Nếu không thấy bác sĩ nào:**
- Kiểm tra Position của employee có chứa từ "bác sĩ" không
- Hoặc cập nhật filter trong code để phù hợp với tên Position của bạn

**Nếu không thấy lịch trình:**
- Kiểm tra có CheckHealth hoặc VaccineRecord nào cho ngày đó không
- Verify DoctorID trong database

---

## 📝 Các File Được Tạo/Sửa

| File | Loại | Mô Tả |
|------|------|-------|
| `frontend/app/customer/doctor-schedules/page.tsx` | ✅ Tạo | Trang xem lịch trình bác sĩ |
| `frontend/app/customer/page.tsx` | ✏️ Sửa | Thêm quick action lịch trình bác sĩ |
| `frontend/app/customer/bookings/page.tsx` | ✏️ Sửa | Thêm button điều hướng |

---

## 🎨 UI/UX Improvements

- ✅ Loading states (Skeleton loaders)
- ✅ Error handling
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ Badge colors để phân biệt loại hoạt động
- ✅ Sticky header cho dễ điều hướng
- ✅ Thông tin helpful (gợi ý)

