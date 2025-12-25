# Frontend — PetCareX

Hướng dẫn nhanh để cài đặt và chạy phần frontend (Next.js) của PetCareX.

Yêu cầu
- Node.js 18+ (khuyến nghị LTS hiện tại)
- npm hoặc pnpm

Thiết lập và chạy trong môi trường dev

1. Cài dependencies

```bash
cd frontend
npm install
```

2. Chạy dev server (Hot reload)

```bash
npm run dev
```

Mặc định frontend sẽ gọi API backend theo biến môi trường `NEXT_PUBLIC_API_URL` nếu được cấu hình. Nếu bạn muốn phát triển UI mà không cần backend, bật chế độ mock.

Chế độ Mock (UI-only)
- Bật mock tạm thời cho một lần duyệt: mở URL với `?useMocks=true`, ví dụ `http://localhost:3000/?useMocks=true`.
- Bật mock vĩnh viễn trong trình duyệt (console):

```js
localStorage.setItem('useMocks','true')
```

Mock API lưu dữ liệu vào `localStorage` (các keys: `mock_customers_v1`, `mock_bookings_v1`, `mock_invoices_v1`, `mock_products_v1`, `mock_pets_v1`, `mock_branches_v1`).

Chọn chi nhánh (Dashboard)
- Dashboard giờ yêu cầu chọn chi nhánh trước khi truy cập các trang quản lý. Để chọn nhanh (ví dụ testing), chạy trong Console:

```js
localStorage.setItem('selected_branch_id','1')
localStorage.setItem('selected_branch_name','Chi nhánh Quận 1')
window.dispatchEvent(new CustomEvent('branch-changed', { detail: { id: 1, name: 'Chi nhánh Quận 1' } }))
```

Sử dụng backend thật
- Thiết lập `NEXT_PUBLIC_API_URL` (ví dụ trong `.env.local`) để trỏ tới base URL backend (không cần `/api`):

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

- Khi `NEXT_PUBLIC_API_URL` được thiết lập và `useMocks` không bật, frontend sẽ gọi API thật dưới đường dẫn `NEXT_PUBLIC_API_URL/api/...`.

Build & chạy production (local)

```bash
cd frontend
npm run build
npm run preview
```

Troubleshooting
- Lỗi kiểu: "You're importing a component that needs `useEffect`... mark with 'use client'" — đây là cảnh báo Next.js khi một file server cố dùng React hooks; repo này đã sửa hầu hết trang nhưng nếu bạn tạo trang mới, thêm dòng đầu tiên:

```tsx
"use client"
```

- Nếu thấy dữ liệu không thay đổi: mock API lưu trong `localStorage`; xóa các keys `mock_*` nếu muốn reset dữ liệu mẫu.

Files/Endpoints mock sẵn có
- Mock endpoints: `/customers`, `/bookings`, `/invoices`, `/products`, `/pets`, `/branches` (GET/POST/PUT cơ bản).

Hỗ trợ thêm
- Muốn tôi thêm badge hiển thị chi nhánh đang chọn, hoặc tạo trang `Thêm chi nhánh`/`Chi tiết chi nhánh` trong UI không? Trả lời ngắn và tôi sẽ làm tiếp.

---
Tệp này được đặt tại `frontend/README.md` trong workspace.
# PetCareX Frontend (React + Vite + Tailwind)

Quick start:











- Example `App.jsx` calls `/api/example` endpoint on the backend.- Tailwind is configured; edit `tailwind.config.cjs` if you change file structure.
nNotes:
n2. Default dev server uses Vite on port 5173. To connect to backend (example uses `http://localhost:5000`), open `src/api/axios.js` and set `baseURL` accordingly.```npm run devnpm installcd frontend
n```powershelln1. From `frontend` folder install deps: