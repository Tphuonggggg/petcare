# Trang Quản Lý Thú Cưng - Pet Management Page

## Tổng Quan
Trang quản lý thú cưng cho phép khách hàng quản lý hồ sơ của các thú cưng của họ, bao gồm thông tin cơ bản, lịch sử tiêm phòng và khám sức khỏe.

## Tính Năng

### 1. **Danh Sách Thú Cưng** (`/customer/pets`)
- Hiển thị tất cả thú cưng của khách hàng
- Thẻ thú cưng hiển thị:
  - Tên, loài, giống
  - Tuổi (tính toán tự động từ ngày sinh)
  - Giới tính
  - Trạng thái hoạt động
- Nút hành động:
  - **Xem chi tiết**: Xem full profile
  - **Chỉnh sửa**: Sửa thông tin
  - **Xóa**: Xóa thú cưng (có xác nhận)
- **Thêm thú cưng**: Nút floating action button

### 2. **Thêm Thú Cưng** (Dialog Modal)
- Form nhập liệu với validation:
  - **Tên** (bắt buộc)
  - **Loài** (bắt buộc) - dropdown: Chó, Mèo, Thỏ, Chim, Chuột, Khác
  - **Giống** (tùy chọn)
  - **Ngày sinh** (tùy chọn)
  - **Giới tính** (tùy chọn) - dropdown: Đực, Cái, Chưa xác định
- Validation với Zod
- Toast notification thành công/lỗi

### 3. **Chi Tiết Thú Cưng** (`/customer/pets/[id]`)
- **Phần tiêu đề**:
  - Avatar thú cưng
  - Tên, loài, giống
  - Badge trạng thái
  - Nút quay lại, chỉnh sửa
  
- **Thông tin cơ bản**:
  - Tuổi
  - Ngày sinh
  - Giới tính
  - Loài

- **2 Tab nội dung**:
  
  **Tab Tiêm Phòng**:
  - Danh sách lịch sử tiêm vắc xin
  - Mỗi record hiển thị:
    - Tên vắc xin
    - Ngày tiêm
    - Hạn tiêm lại
    - Bác sĩ thú y
    - Ghi chú (nếu có)
  - Nút "Thêm tiêm phòng"
  - Empty state nếu chưa có tiêm

  **Tab Khám Sức Khỏe**:
  - Danh sách lịch sử khám sức khỏe
  - Mỗi record hiển thị:
    - Ngày khám
    - Cân nặng
    - Nhiệt độ
    - Bác sĩ thú y
    - Chẩn đoán
    - Ghi chú
  - Nút "Thêm khám sức khỏe"
  - Empty state nếu chưa có khám

### 4. **Chỉnh Sửa Thú Cưng** (`/customer/pets/[id]/edit`)
- Form chỉnh sửa tất cả thông tin:
  - Tên, loài, giống
  - Ngày sinh
  - Giới tính
  - Trạng thái
- Tự động tải dữ liệu hiện tại
- Lưu cập nhật về API
- Toast notification kết quả
- Redirect về chi tiết sau khi lưu

## Cấu Trúc File

```
frontend/app/customer/pets/
├── page.tsx                    # Danh sách thú cưng
├── [id]/
│   ├── page.tsx               # Chi tiết thú cưng
│   └── edit/
│       └── page.tsx           # Chỉnh sửa thú cưng
└── (trong components/)
    └── pet-dialog.tsx         # Dialog thêm thú cưng
```

## Component Chính

### PetDialog (`components/pet-dialog.tsx`)
- Reusable dialog component
- Props:
  - `open`: boolean - trạng thái mở/đóng
  - `onOpenChange`: (open: boolean) => void
  - `onSuccess`: () => void - callback sau khi thêm thành công
  - `customerId`: number - ID khách hàng

### Pets Page (`app/customer/pets/page.tsx`)
- Tải danh sách thú cưng từ API
- Lọc theo customerId của user hiện tại
- Quản lý state: pets, loading, dialog, delete confirmation
- Tính toán tuổi từ ngày sinh

### Pet Detail Page (`app/customer/pets/[id]/page.tsx`)
- Tải chi tiết thú cưng
- Tải lịch sử tiêm phòng và khám sức khỏe
- Sử dụng Tabs để hiển thị
- Format ngày theo locale vi-VN

### Edit Pet Page (`app/customer/pets/[id]/edit/page.tsx`)
- Form với react-hook-form + Zod validation
- Tự động tải dữ liệu pet hiện tại
- Update qua API
- Redirect sau khi lưu

## API Endpoints Sử Dụng

```
GET    /api/pets                    # Lấy danh sách thú cưng
GET    /api/pets/{id}              # Lấy chi tiết thú cưng
POST   /api/pets                   # Thêm thú cưng mới
PUT    /api/pets/{id}              # Cập nhật thú cưng
DELETE /api/pets/{id}              # Xóa thú cưng

GET    /api/vaccine-records        # Lấy lịch sử tiêm (với query ?petId=)
GET    /api/check-healths          # Lấy lịch sử khám (với query ?petId=)
```

## Dữ Liệu Model

### Pet
```typescript
{
  petId?: number
  id?: number
  customerId: number
  name: string
  species: string
  breed?: string
  birthDate?: string
  gender?: string
  status?: string
}
```

### VaccineRecord
```typescript
{
  recordId?: number
  id?: number
  petId: number
  vaccineName: string
  vaccineDate: string
  nextDueDate: string
  veterinarian?: string
  notes?: string
}
```

### CheckHealth
```typescript
{
  id?: number
  checkId?: number
  petId: number
  checkDate: string
  weight?: number
  temperature?: number
  notes?: string
  veterinarian?: string
  diagnosis?: string
}
```

## Tính Năng Bảo Mật

- Kiểm tra đăng nhập: Redirect to `/login` nếu chưa đăng nhập
- Lọc dữ liệu: Chỉ hiển thị thú cưng của user hiện tại
- Validation form: Sử dụng Zod schema
- Error handling: Toast notifications cho tất cả errors

## Styling

- Sử dụng Tailwind CSS + Shadcn/ui components
- Responsive design: Mobile-first approach
- Light/Dark mode support (từ theme provider)
- Consistent spacing và typography

## Chức Năng Hiệu Hứa Được Thêm

Các chức năng sau đã được tạo framework, cần implement thêm API endpoints:
- Thêm/sửa/xóa tiêm phòng
- Thêm/sửa/xóa khám sức khỏe
- Upload hình ảnh thú cưng
- Tìm kiếm thú cưng

## Sử Dụng

1. **Đi đến trang thú cưng**:
   ```
   /customer/pets
   ```

2. **Thêm thú cưng**:
   - Nhấn nút "Thêm thú cưng"
   - Điền thông tin
   - Nhấn "Thêm thú cưng"

3. **Xem chi tiết**:
   - Nhấn nút "Xem chi tiết" trên thẻ thú cưng
   - Xem thông tin cơ bản, lịch sử tiêm, khám sức khỏe

4. **Chỉnh sửa**:
   - Nhấn nút "Chỉnh sửa" (icon bút)
   - Sửa thông tin cần thiết
   - Lưu thay đổi

5. **Xóa**:
   - Nhấn nút "Xóa" (icon thùng rác)
   - Xác nhận deletion
