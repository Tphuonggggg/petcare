# PetCareX Frontend

Next.js giao diện người dùng cho hệ thống quản lý thú cưng.

## 📋 Yêu cầu

- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm hoặc pnpm**

## 🚀 Cài đặt & Chạy

### 1. Vào thư mục frontend
```bash
cd PetCareX/frontend
```

### 2. Kiểm tra Node.js
```bash
node --version
npm --version
```

### 3. Cài đặt dependencies
```bash
npm install
```

Hoặc nếu dùng **pnpm** (nhanh hơn):
```bash
pnpm install
```

### 4. Cấu hình Backend API (tùy chọn)

Tạo file `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Bỏ trống nếu dùng mock data.

### 5. Chạy development server
```bash
npm run dev
```

Mở http://localhost:3000 trong trình duyệt.

### 6. Build production
```bash
npm run build
npm start
```

## 📁 Cấu trúc thư mục

```
app/              # Next.js App Router
components/       # React components
hooks/           # Custom hooks
lib/             # Utilities & helpers
public/          # Static files
styles/          # CSS files
```
│   │
│   ├── sales/               # Sales dashboard
│   │   ├── products/        # Quản lý sản phẩm
│   │   ├── orders/          # Quản lý đơn hàng
│   │   ├── inventory/       # Quản lý kho
│   │   └── page.tsx
│   │
│   ├── customer/            # Customer portal
│   │   ├── bookings/        # Xem lịch hẹn
│   │   ├── pets/            # Quản lý thú cưng
│   │   ├── invoices/        # Hóa đơn
│   │   └── page.tsx
│   │
│   ├── login/               # Đăng nhập
│   ├── register/            # Đăng ký
│   ├── dashboard/           # Shared dashboard
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
│
├── components/              # Reusable components
│   ├── ui/                  # Shadcn UI components (50+ components)
│   ├── admin/               # Admin-specific components
│   ├── report/              # Report components
│   ├── *-nav.tsx            # Role-specific navigation
│   ├── booking-dialog.tsx
│   ├── customer-dialog.tsx
│   └── theme-provider.tsx
│
├── hooks/                   # Custom React hooks
│   ├── use-mobile.ts
│   └── use-toast.ts
│
├── lib/                     # Utility functions
│   ├── api.ts               # API client (switches mock/real)
│   ├── auth.ts              # Authentication logic
│   ├── roleRouting.ts       # Role-based routing
│   ├── mockApi.ts           # Mock data & endpoints
│   ├── branch.ts
│   ├── utils.ts
│   └── dbTypes.ts           # Type definitions
│
├── styles/                  # Global styles
│   └── globals.css
│
├── public/                  # Static assets
├── tsconfig.json            # TypeScript config
├── next.config.mjs          # Next.js config
├── tailwind.config.ts       # Tailwind config
├── package.json
└── README.md
```

## 🔐 Xác thực & Phân quyền

### Vai trò dựa trên PositionID:

| PositionID | Vai trò | Route | Features |
|-----------|--------|-------|----------|
| 1 | Bác sĩ thú y | `/vet` | Quản lý thú cưng, hồ sơ y tế, dịch vụ |
| 2 | Nhân viên tiếp tân | `/reception` | Quản lý booking, khách hàng, check-in |
| 3 | Nhân viên bán hàng | `/sales` | Quản lý sản phẩm, đơn hàng, kho |
| 4 | Quản lý chi nhánh | `/admin` | Quản lý toàn bộ hệ thống |
| null | Khách hàng | `/customer` | Đặt lịch, xem thú cưng, thanh toán |

### Login Flow:

1. User nhập username/password tại `/login`
2. Frontend gọi `POST /api/auth/login`
3. Backend trả về `accountId`, `positionId`, `token`
4. Frontend lưu vào localStorage
5. Auto-redirect tới dashboard theo role:
   - positionId=1 → `/vet`
   - positionId=2 → `/reception`
   - positionId=3 → `/sales`
   - positionId=4 → `/admin`
   - null → `/customer`

```typescript
// lib/auth.ts
localStorage.setItem('user', JSON.stringify({
  accountId: 1,
  username: 'user@petcare.vn',
  positionId: 2,  // Receptionist
  employeeId: 5,
}))
localStorage.setItem('token', 'jwt_token_here')

// Redirect sẽ dùng positionId để routing
```

## 🔄 API Integration

### Sử dụng Mock API (Development)

```env
NEXT_PUBLIC_USE_MOCKS=true
```

Mock API cung cấp:
- 2+ customers, 3+ pets, 5+ bookings
- localStorage persistence (dữ liệu giữ lại khi reload)
- CRUD operations (Create, Read, Update, Delete)
- Pagination support

### Sử dụng Backend API (Production)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

API client tự động chuyển sang backend:

```typescript
// lib/api.ts
export async function apiGet(path: string) {
  if (useMocks()) return mock.apiGet(path)  // ← Dùng mock
  
  const url = buildUrl(path)  // ← Dùng backend
  const res = await fetch(url)
  return res.json()
}
```

## 💻 Usage Examples

### Lấy dữ liệu từ API

```typescript
import { apiGet, apiPost } from '@/lib/api'

// GET request
const customers = await apiGet('/customers')
const customer = await apiGet(`/customers/${id}`)

// POST request
await apiPost('/bookings', {
  customerId: 1,
  serviceName: 'Spa',
  date: '2024-01-15'
})
```

### Dùng Authentication

```typescript
import { logout } from '@/lib/auth'

// Logout
logout('/login')

// Check user role
const user = JSON.parse(localStorage.getItem('user') || '{}')
const isVet = user.positionId === 1
```

### Dùng Role-based Routing

```typescript
import { getRouteByPositionId } from '@/lib/roleRouting'

const positionId = parseInt(localStorage.getItem('positionId') || '0')
const route = getRouteByPositionId(positionId)  // '/vet', '/reception', etc.
```

## 🎨 UI Components

Frontend dùng **50+ Shadcn/ui components**:

```typescript
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
```

## 📱 Responsive Design

- ✅ Mobile first approach
- ✅ Breakpoints: 640px, 768px, 1024px, 1280px
- ✅ Dùng Tailwind CSS responsive classes
- ✅ useMediaQuery hook để responsive components

```typescript
import { useMediaQuery } from '@/hooks/use-mobile'

export function MyComponent() {
  const isMobile = useMediaQuery('(max-width: 640px)')
  
  return isMobile ? <MobileView /> : <DesktopView />
}
```

## 🧪 Testing

### Manual Testing

1. **Login:**
   - http://localhost:3000/login
   - Các demo accounts có sẵn

2. **Test Mock API:**
   - Mở DevTools Console
   - `localStorage.setItem('useMocks', 'true')`
   - Reload page

3. **Test Backend API:**
   - Chạy backend: `cd backend && dotnet run`
   - `.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:5000`
   - Reload page

## 🚨 Troubleshooting

### Lỗi: "API error 404"
- Kiểm tra `NEXT_PUBLIC_API_URL` đúng không
- Backend chạy trên port 5000?
- Kiểm tra route name (vd: `/customers` vs `/customer`)

### Lỗi: "localStorage is not defined"
- Lỗi này xảy ra ở server-side rendering
- Dùng `typeof window !== 'undefined'` check:
  ```typescript
  if (typeof window !== 'undefined') {
    localStorage.getItem('token')
  }
  ```

### CSS not loading
```bash
npm run build
npm start
```

## 📝 Development Tips

### Thêm page mới:

1. **Tạo folder:**
   ```
   app/reception/new-page/
   ```

2. **Tạo page.tsx:**
   ```typescript
   'use client'
   
   import { useEffect, useState } from 'react'
   import { apiGet } from '@/lib/api'
   
   export default function NewPage() {
     const [data, setData] = useState(null)
     
     useEffect(() => {
       const load = async () => {
         const result = await apiGet('/api-endpoint')
         setData(result)
       }
       load()
     }, [])
     
     return (
       <div className="min-h-screen">
         {/* Content */}
       </div>
     )
   }
   ```

### Thêm component mới:

```typescript
// components/my-component.tsx
import { Button } from '@/components/ui/button'

export function MyComponent() {
  return (
    <div>
      <h1>My Component</h1>
      <Button>Click me</Button>
    </div>
  )
}

// App usage:
// import { MyComponent } from '@/components/my-component'
```

## 📦 Build & Deploy

### Local Build:
```bash
npm run build
npm start
```

### Docker Deploy:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Vercel Deploy:
```bash
npm i -g vercel
vercel
```

Environment variables:
- `NEXT_PUBLIC_API_URL` - Backend API URL

## 🤝 Team Workflow

### Chia công việc theo role:

```
Team A: /admin dashboard + admin components
Team B: /reception dashboard
Team C: /vet dashboard  
Team D: /sales dashboard
Team E: /customer dashboard + shared components

Quy tắc:
- Mỗi người tạo branch: feature/role-name
- Dùng mock API để phát triển độc lập
- Merge khi backend API ready
```

## 📞 Support

- 📧 Email: support@petcare.vn
- 🐛 Issues: GitHub Issues
- 📚 Docs: https://petcare-docs.example.com

## 📄 License

MIT License - © 2024 PetCareX
