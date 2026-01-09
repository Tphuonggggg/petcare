# PetCareX Backend API

ASP.NET Core 8 API backend cho hệ thống quản lý thú cưng.

## 📋 Yêu cầu

- **.NET SDK 8.0+** - [Download](https://dotnet.microsoft.com/download)
- **SQL Server** - Local hoặc Azure SQL Database

## 🚀 Cài đặt & Chạy

### 1. Vào thư mục backend
```bash
cd PetCareX/backend
```

### 2. Kiểm tra .NET SDK
```bash
dotnet --version
```

### 3. Restore dependencies
```bash
dotnet restore
```

### 4. Cấu hình Database

Mở file `appsettings.json` và sửa connection string:

**SQL Server Local:**
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=PetCareX;Trusted_Connection=true;TrustServerCertificate=true;"
}
```

**Azure SQL:**
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=tcp:your-server.database.windows.net,1433;Initial Catalog=PetCareX;User ID=your-user;Password=your-pass;Encrypt=True;Connection Timeout=30;"
}
```

### 5. Tạo database
```bash
dotnet ef database update
```

### 6. Chạy ứng dụng
```bash
dotnet run
```

API chạy tại: **http://localhost:5000**

Swagger docs: **http://localhost:5000/swagger**
| `GET /api/employees` | Danh sách nhân viên |
| `GET /swagger` | API Documentation |

## 🔐 Authentication

Hệ thống sử dụng **JWT Token**:

1. Login: `POST /api/auth/login`
   ```json
   {
     "username": "user@example.com",
     "password": "password123"
   }
   ```

2. Sử dụng token trong header:
   ```
   Authorization: Bearer <your-jwt-token>
   ```

## 📝 Cấu hình chính (appsettings.json)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=PetCareX;..."
  },
  "Jwt": {
    "SecretKey": "your-secret-key-here",
    "Issuer": "PetCareX",
    "Audience": "PetCareX-Users"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  }
}
```

## 🐛 Troubleshooting

### Error: "Database connection failed"
- Kiểm tra SQL Server đang chạy
- Kiểm tra connection string trong appsettings.json
- Kiểm tra quyền truy cập database

### Error: "EF migrations not applied"
```bash
# Xóa migrations và tạo lại
dotnet ef database drop
dotnet ef database update
```

### Port 5000 đã được sử dụng
```bash
dotnet run --urls="https://localhost:5001"
```

## 📞 Support & Contact

Nếu gặp lỗi hoặc có câu hỏi, vui lòng tạo issue trên GitHub hoặc liên hệ team phát triển.

---

**Happy Coding! 🚀**

### 3. Cập nhật Database Connection String

Mở file **[appsettings.json](appsettings.json)** và sửa:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=petcarxDB;User Id=YOUR_USER;Password=YOUR_PASSWORD;TrustServerCertificate=True;Encrypt=True;"
  }
}
```

**Ví dụ cho local SQL Server:**
```json
"DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=petcarxDB;Trusted_Connection=true;TrustServerCertificate=true;"
```

### 4. Tạo/Cập nhật Database

```bash
# Xem migrations hiện có
dotnet ef migrations list

# Tạo migration mới (nếu có thay đổi schema)
dotnet ef migrations add InitialCreate

# Cập nhật database
dotnet ef database update
```

Hoặc chạy SQL script:
```bash
sqlcmd -S your_server -U your_user -P your_password -i CSDL.sql
```

### 5. Chạy ứng dụng

```bash
dotnet run
```

Ứng dụng sẽ khởi động tại: **http://localhost:5000**

### 6. Xem Swagger UI

Mở trong trình duyệt:
```
http://localhost:5000/swagger
```

## 📁 Cấu trúc dự án

```
backend/
├── Controllers/          # API endpoints (30+ controllers)
│   ├── AuthController.cs
│   ├── CustomersController.cs
│   ├── BookingsController.cs
│   ├── PetsController.cs
│   ├── ReceptionistDashboardController.cs
│   ├── SalesDashboardController.cs
│   └── ...
│
├── Models/              # Entity models (database entities)
│   ├── Customer.cs
│   ├── Booking.cs
│   ├── Pet.cs
│   ├── CheckHealth.cs
│   └── ...
│
├── Dtos/                # Data Transfer Objects (28+ DTOs)
│   ├── CustomerDto.cs
│   ├── BookingDto.cs
│   ├── CheckHealthDto.cs
│   └── ...
│
├── Data/
│   └── ApplicationDbContext.cs  # EF Core DbContext
│
├── Services/            # Business logic
│   ├── StoredProcedureService.cs
│   └── DiagnosticHostedService.cs
│
├── Mapping/
│   └── MappingProfile.cs        # AutoMapper configuration
│
├── Program.cs           # Entry point & DI configuration
├── appsettings.json     # Configuration file
└── PetCareX.Api.csproj  # Project file
```

## 🔐 Xác thực & Phân quyền

### Vai trò (Roles) - dựa trên PositionID:

| PositionID | Vai trò | Truy cập |
|-----------|--------|---------|
| 1 | Bác sĩ thú y (Vet) | Quản lý dịch vụ, hồ sơ tiêm chủng, check-up |
| 2 | Nhân viên tiếp tân (Receptionist) | Quản lý booking, khách hàng, check-in |
| 3 | Nhân viên bán hàng (Sales) | Quản lý sản phẩm, đơn hàng, báo cáo doanh số |
| 4 | Quản lý chi nhánh (Manager/Admin) | Quản lý toàn bộ, nhân viên, dịch vụ |
| null | Khách hàng (Customer) | Xem lịch hẹn, thú cưng, hóa đơn |

### Login API

```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "accountId": 1,
  "username": "user@example.com",
  "displayName": "Nguyễn Văn A",
  "role": "employee",
  "positionId": 1,
  "employeeId": 1,
  "customerId": null,
  "branchId": 1,
  "token": "jwt_token_here"
}
```

> ⚠️ **Lưu ý:** Backend chưa có JWT authentication middleware. Cần thêm nếu deploy production.

## 📚 API Documentation

### Endpoints chính:

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/login` | Đăng nhập |
| GET | `/api/customers` | Danh sách khách hàng |
| POST | `/api/customers` | Tạo khách hàng |
| GET | `/api/customers/{id}` | Chi tiết khách hàng |
| GET | `/api/bookings` | Danh sách lịch hẹn |
| POST | `/api/bookings` | Đặt lịch |
| GET | `/api/pets` | Danh sách thú cưng |
| POST | `/api/checkhealths` | Tạo hồ sơ check-up |
| GET | `/api/invoices` | Danh sách hóa đơn |
| GET | `/api/invoices/{id}` | Chi tiết hóa đơn |
| PUT | `/api/invoices/{id}` | Cập nhật hóa đơn (thanh toán) |
| DELETE | `/api/invoices/{id}` | Xóa hóa đơn |
| GET | `/api/ReceptionistDashboard/summary` | Dashboard tiếp tân |
| POST | `/api/ReceptionistDashboard/check-in/{id}` | Check-in khách hàng |
| GET | `/api/SalesDashboard/summary` | Dashboard bán hàng |

### Invoice API

**Tính năng:**
- Tạo/cập nhật hóa đơn
- Theo dõi trạng thái thanh toán (Pending → Paid)
- Hỗ trợ multiple payment methods (Tiền mặt, Thẻ, Chuyển khoản)
- Tự động tính toán FinalAmount = TotalAmount - DiscountAmount

**Get All Invoices:**
```bash
GET /api/invoices?page=1&pageSize=20
```

**Get Invoice Detail:**
```bash
GET /api/invoices/{id}
```

**Response:**
```json
{
  "invoiceId": 1,
  "customerId": 10,
  "customerName": "Nguyễn Văn A",
  "totalAmount": 500000,
  "discountAmount": 50000,
  "finalAmount": 450000,
  "status": "Pending",
  "paymentMethod": "CASH",
  "invoiceDate": "2024-01-15T10:30:00",
  "invoiceItems": [
    {
      "itemId": 1,
      "description": "Dịch vụ tắm rửa",
      "quantity": 1,
      "unitPrice": 300000,
      "amount": 300000
    }
  ]
}
```

**Update Invoice (Thanh toán):**
```bash
PUT /api/invoices/1
Content-Type: application/json

{
  "status": "Paid",
  "paymentMethod": "CASH",
  "notes": "Thanh toán tại quầy"
}
```

**Status Values:**
- `Pending` - Chưa thanh toán
- `Paid` - Đã thanh toán
- `Cancelled` - Đã hủy

> **Lưu ý:** Cơ sở dữ liệu sẽ tự động tính toán `FinalAmount` từ công thức `TotalAmount - DiscountAmount`

## 🗄️ Database Schema

### Invoice Table
```sql
CREATE TABLE Invoice (
    InvoiceID INT IDENTITY(1,1) PRIMARY KEY,
    BranchID INT NOT NULL,
    CustomerID INT NOT NULL,
    EmployeeID INT NOT NULL,
    PetID INT NULL,
    InvoiceDate DATETIME NOT NULL DEFAULT GETDATE(),
    TotalAmount DECIMAL(14,2) NOT NULL,
    DiscountAmount DECIMAL(14,2) NOT NULL DEFAULT 0,
    FinalAmount AS (TotalAmount - DiscountAmount),  -- Computed column
    PaymentMethod NVARCHAR(20) NOT NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'Pending',  -- NEW
    CONSTRAINT CK_Invoice_Status CHECK (Status IN ('Pending','Paid','Cancelled'))
);
```

### InvoiceItem Table
```sql
CREATE TABLE InvoiceItem (
    InvoiceItemID INT IDENTITY(1,1) PRIMARY KEY,
    InvoiceID INT NOT NULL,
    Description NVARCHAR(255) NOT NULL,
    ItemType NVARCHAR(50) NOT NULL,
    Quantity DECIMAL(10,2) NOT NULL,
    UnitPrice DECIMAL(14,2) NOT NULL,
    Amount AS (Quantity * UnitPrice),
    FOREIGN KEY (InvoiceID) REFERENCES Invoice(InvoiceID)
);
```

## 🔄 Migration: Add Status Column

Nếu cơ sở dữ liệu của bạn đã tồn tại, chạy script migration:

```bash
# File: MIGRATION_INVOICE_STATUS.sql
sqlcmd -S your_server -d PetCare -i MIGRATION_INVOICE_STATUS.sql
```

Hoặc chạy trực tiếp trong SQL Server Management Studio:
```sql
ALTER TABLE Invoice
ADD Status NVARCHAR(20) NOT NULL DEFAULT 'Pending';

ALTER TABLE Invoice
ADD CONSTRAINT CK_Invoice_Status CHECK (Status IN ('Pending','Paid','Cancelled'));
```

**Chi tiết đầy đủ:** http://localhost:5000/swagger

## 🗄️ Database Schema

### Bảng chính:

- **Accounts** - Tài khoản (Employee + Customer)
- **Customers** - Khách hàng
- **Employees** - Nhân viên
- **Positions** - Vai trò (Vet, Receptionist, Sales, Manager)
- **Pets** - Thú cưng
- **Bookings** - Lịch hẹn
- **Services** - Dịch vụ
- **Products** - Sản phẩm
- **Invoices** - Hóa đơn
- **Vaccines** - Vắc xin
- **VaccineRecords** - Hồ sơ tiêm
- **CheckHealths** - Hồ sơ check-up

Xem chi tiết: [CSDL.sql](../CSDL.sql)

## 🧪 Testing API

### Dùng cURL:

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user@petcare.vn","password":"123456"}'

# Lấy danh sách khách hàng
curl http://localhost:5000/api/customers

# Tạo khách hàng mới
curl -X POST http://localhost:5000/api/customers \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Nguyễn Văn A","phone":"0912345678"}'
```

### Dùng Swagger UI:
1. Mở http://localhost:5000/swagger
2. Click vào endpoint
3. Click "Try it out"
4. Nhập parameters
5. Click "Execute"

## 🔧 Development

### Thêm API endpoint mới:

1. **Tạo Controller:**
   ```csharp
   [ApiController]
   [Route("api/[controller]")]
   public class MyController : ControllerBase
   {
       [HttpGet]
       public async Task<ActionResult> Get()
       {
           // Implementation
       }
   }
   ```

2. **Tạo DTO:**
   ```csharp
   public class MyDto
   {
       public int Id { get; set; }
       public string Name { get; set; }
   }
   ```

3. **Thêm AutoMapper mapping:**
   ```csharp
   CreateMap<MyEntity, MyDto>();
   CreateMap<MyDto, MyEntity>();
   ```

### Database migrations:

```bash
# Tạo migration
dotnet ef migrations add AddNewField

# Rollback last migration
dotnet ef migrations remove

# Update database
dotnet ef database update

# Xem SQL được sinh ra
dotnet ef migrations script
```

## 🚨 Troubleshooting

### Lỗi: "Cannot connect to database"
```bash
# Kiểm tra connection string trong appsettings.json
# Test connection:
sqlcmd -S your_server -U your_user -P your_password
```

### Lỗi: "AutoMapper mapping exception"
- Kiểm tra MappingProfile.cs có `CreateMap` cho entity đó không
- Rebuild solution: `dotnet build`

### Lỗi: "Port 5000 already in use"
```bash
# Thay đổi port trong launchSettings.json hoặc:
dotnet run --urls "http://localhost:5001"
```

## 📝 Logging

Application logs được in ra console:
```
Startup: Environment=Development, ConnectionString=Server=...
Application lifecycle: Started
```

Để thay đổi log level, sửa `appsettings.json`:
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

## 📦 Build for Production

```bash
# Publish release build
dotnet publish -c Release -o ./publish

# Run published app
cd publish
dotnet PetCareX.Api.dll
```

## 🤝 Contribution Guidelines

Khi phát triển:
1. Tạo branch từ `main`: `git checkout -b feature/your-feature`
2. Tuân thủ naming convention:
   - Controllers: `XyzController`
   - DTOs: `XyzDto`
   - Models: `Xyz`
3. Thêm XML comments cho public methods
4. Test API trước commit
5. Tạo Pull Request để review

## 📞 Support

- 📧 Email: support@petcare.vn
- 🐛 Issues: GitHub Issues
- 📚 Documentation: https://petcare-docs.example.com

## 📄 License

MIT License - © 2024 PetCareX
