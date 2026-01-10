
CREATE DATABASE PetCare;
GO
USE PetCare;
GO


CREATE TABLE Vaccine (
    VaccineID INT IDENTITY(1,1) PRIMARY KEY,
    Type NVARCHAR(50) NOT NULL,
    Description NVARCHAR(255),
    StandardDose DECIMAL(6,2) NOT NULL,
    CONSTRAINT CK_Vaccine_StandardDose CHECK (StandardDose >= 0)
);


CREATE TABLE VaccinePackage (
    PackageID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    DurationMonths INT NOT NULL,
    Price DECIMAL(14,2) NOT NULL,
    DiscountPercent DECIMAL(5,2) NOT NULL,
    Item NVARCHAR(255),

    CONSTRAINT CK_VP_Duration CHECK (DurationMonths > 0),
    CONSTRAINT CK_VP_Price CHECK (Price > 0),
    CONSTRAINT CK_VP_Discount CHECK (DiscountPercent BETWEEN 0 AND 100)
);


CREATE TABLE VaccinePackageItem (
    PackageID INT NOT NULL,
    VaccineID INT NOT NULL,
    RelativeMonth INT NOT NULL,
    Dose DECIMAL(6,2) NOT NULL,

    PRIMARY KEY (PackageID, VaccineID),

    CONSTRAINT CK_VPI_RelativeMonth CHECK (RelativeMonth >= 1),
    CONSTRAINT CK_VPI_Dose CHECK (Dose >= 0),

    FOREIGN KEY (PackageID) REFERENCES VaccinePackage(PackageID),
    FOREIGN KEY (VaccineID) REFERENCES Vaccine(VaccineID)
);


CREATE TABLE Branch (
    BranchID INT PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Phone VARCHAR(20),
    OpenTime TIME,
    CloseTime TIME,
    Address NVARCHAR(255)
);
GO


CREATE TABLE Service (
    ServiceID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL UNIQUE,
    ServiceType NVARCHAR(30) NOT NULL,
    BasePrice DECIMAL(14,2) NOT NULL,
    Description NVARCHAR(255),

    CONSTRAINT CK_Service_Type CHECK (ServiceType IN ('CHECKUP','VACCINATION','PACKAGE')),
    CONSTRAINT CK_Service_BasePrice CHECK (BasePrice > 0)
);


CREATE TABLE VaccineBatch (
    BatchID INT IDENTITY(1,1) PRIMARY KEY,
    VaccineID INT NOT NULL,
    BranchID INT NOT NULL,
    ManufactureDate DATE NOT NULL,
    ExpiryDate DATE NOT NULL,
    Quantity INT NOT NULL,

    CONSTRAINT CK_VB_Expiry CHECK (ExpiryDate > ManufactureDate),
    CONSTRAINT CK_VB_Quantity CHECK (Quantity >= 0),

    FOREIGN KEY (VaccineID) REFERENCES Vaccine(VaccineID),
    FOREIGN KEY (BranchID) REFERENCES Branch(BranchID)
);

CREATE TABLE Promotion (
    PromotionID INT PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Type NVARCHAR(50) NOT NULL,
    Value DECIMAL(10,2) NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    ApplicableTo NVARCHAR(50) NOT NULL,

    CONSTRAINT CK_Promotion_Type CHECK (Type IN ('PERCENT','AMOUNT')),
    CONSTRAINT CK_Promotion_Value CHECK (Value >= 0),
    CONSTRAINT CK_Promotion_Date CHECK (EndDate >= StartDate)
);


CREATE TABLE BranchService (
    BranchID INT NOT NULL,
    ServiceID INT NOT NULL,
    Price DECIMAL(12,2),
    Active BIT,

    PRIMARY KEY (BranchID, ServiceID),

    CONSTRAINT CK_BS_Price CHECK (Price >= 0),

    FOREIGN KEY (BranchID) REFERENCES Branch(BranchID),
    FOREIGN KEY (ServiceID) REFERENCES Service(ServiceID)
);
GO

CREATE TABLE PromotionBranch (
    PromotionID INT NOT NULL,
    BranchID INT NOT NULL,

    PRIMARY KEY (PromotionID, BranchID),
    FOREIGN KEY (PromotionID) REFERENCES Promotion(PromotionID),
    FOREIGN KEY (BranchID) REFERENCES Branch(BranchID)
);
GO
CREATE TABLE Position (
    PositionID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL UNIQUE,
    Description NVARCHAR(255)
);
GO

CREATE TABLE Employee (
    EmployeeID INT IDENTITY(1,1) PRIMARY KEY,
    BranchID INT NOT NULL,
    PositionID INT NOT NULL,
    FullName NVARCHAR(150) NOT NULL,
    BirthDate DATE NOT NULL,
    Gender NVARCHAR(10) NOT NULL,
    HireDate DATE NOT NULL,
    BaseSalary DECIMAL(14,2) NOT NULL,

    CONSTRAINT CK_Emp_Birth CHECK (BirthDate < GETDATE()),
    CONSTRAINT CK_Emp_Gender CHECK (Gender IN ('Male','Female','Other')),
    CONSTRAINT CK_Emp_Hire CHECK (HireDate <= GETDATE()),
    CONSTRAINT CK_Emp_Salary CHECK (BaseSalary >= 0),

    FOREIGN KEY (BranchID) REFERENCES Branch(BranchID),
    FOREIGN KEY (PositionID) REFERENCES Position(PositionID)
);

GO

-- EmployeeHistory: nhan vien lam o 1 chi nhanh trong 1 khoang thoi gian
CREATE TABLE EmployeeHistory (
    EmployeeID INT NOT NULL,
    BranchID INT NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NULL,

    PRIMARY KEY (EmployeeID, BranchID, StartDate),

    CONSTRAINT CK_EH_Date CHECK (EndDate IS NULL OR EndDate >= StartDate),

    FOREIGN KEY (EmployeeID) REFERENCES Employee(EmployeeID),
    FOREIGN KEY (BranchID) REFERENCES Branch(BranchID)
);

GO

CREATE TABLE MembershipTier (
    MembershipTierID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL UNIQUE,
    MinSpend DECIMAL(14,2),
    MaintainSpend DECIMAL(14,2),
    Benefits NVARCHAR(255),

    CONSTRAINT CK_MT_MinSpend CHECK (MinSpend >= 0),
    CONSTRAINT CK_MT_Maintain CHECK (MaintainSpend >= 0)
);
GO


CREATE TABLE Customer (
    CustomerID INT IDENTITY(1,1) PRIMARY KEY,
    MembershipTierID INT NOT NULL,
    FullName NVARCHAR(100) NOT NULL,
    Phone VARCHAR(15) NOT NULL UNIQUE,
    Email VARCHAR(100) UNIQUE,
    CCCD VARCHAR(12) NOT NULL,
    Gender CHAR(1) NOT NULL,
    BirthDate DATE NOT NULL,
    MemberSince DATE NOT NULL DEFAULT GETDATE(),
    TotalYearlySpend DECIMAL(14,2) NOT NULL DEFAULT 0,
    PointsBalance INT NOT NULL DEFAULT 0,

    CONSTRAINT CK_Customer_CCCD CHECK (LEN(CCCD) = 12),
    CONSTRAINT CK_Customer_Gender CHECK (Gender IN ('M','F','O')),
    CONSTRAINT CK_Customer_Birth CHECK (BirthDate < GETDATE()),
    CONSTRAINT CK_Customer_Spend CHECK (TotalYearlySpend >= 0),
    CONSTRAINT CK_Customer_Points CHECK (PointsBalance >= 0),

    FOREIGN KEY (MembershipTierID) REFERENCES MembershipTier(MembershipTierID)
);

GO

CREATE TABLE Product (
    ProductID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Category NVARCHAR(50) NOT NULL,
    Price DECIMAL(14,2) NOT NULL,
    StockQty INT NOT NULL,
    ReorderPoint INT NOT NULL DEFAULT 10,
    Description NVARCHAR(255),

    CONSTRAINT CK_Product_Category CHECK (Category IN ('FOOD','MEDICINE','ACCESSORY','TOY')),
    CONSTRAINT CK_Product_Price CHECK (Price > 0),
    CONSTRAINT CK_Product_Stock CHECK (StockQty >= 0),
    CONSTRAINT CK_Product_Reorder CHECK (ReorderPoint >= 0)
);
GO

CREATE TABLE Pet (
    PetID INT IDENTITY(1,1) PRIMARY KEY,
    CustomerID INT NOT NULL,
    Name NVARCHAR(100) NOT NULL,
    Species NVARCHAR(50) NOT NULL,
    Breed NVARCHAR(100),
    BirthDate DATE,
    Gender CHAR(1),
    Status NVARCHAR(50),

    CONSTRAINT UQ_Pet_Customer_Name UNIQUE (CustomerID, Name),
    CONSTRAINT CK_Pet_Gender CHECK (Gender IN ('M','F','U')),
    CONSTRAINT CK_Pet_BirthDate CHECK (BirthDate IS NULL OR BirthDate < GETDATE()),

    FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID)
);
GO
CREATE TABLE Invoice (
    InvoiceID INT IDENTITY(1,1) PRIMARY KEY,
    BranchID INT NOT NULL,
    CustomerID INT NOT NULL,
    EmployeeID INT NOT NULL,
    PetID INT NULL,

    InvoiceDate DATETIME NOT NULL DEFAULT GETDATE(),
    TotalAmount DECIMAL(14,2) NOT NULL,
    DiscountAmount DECIMAL(14,2) NOT NULL DEFAULT 0,
    FinalAmount AS (TotalAmount - DiscountAmount),

    PaymentMethod NVARCHAR(20) NOT NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'Pending',

    CONSTRAINT CK_Invoice_Total CHECK (TotalAmount > 0),
    CONSTRAINT CK_Invoice_Discount CHECK (DiscountAmount >= 0 AND DiscountAmount <= TotalAmount),
    CONSTRAINT CK_Invoice_Method CHECK (PaymentMethod IN ('CASH','CARD','BANKING')),
    CONSTRAINT CK_Invoice_Status CHECK (Status IN ('Pending','Paid','Cancelled')),

    FOREIGN KEY (BranchID) REFERENCES Branch(BranchID),
    FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID),
    FOREIGN KEY (EmployeeID) REFERENCES Employee(EmployeeID),
    FOREIGN KEY (PetID) REFERENCES Pet(PetID)
);

GO

CREATE TABLE ServiceVaccination (
    VaccinationID INT IDENTITY(1,1) PRIMARY KEY,
    VaccineID INT NOT NULL,
    Date DATETIME NOT NULL,
    StandardDose INT NOT NULL CHECK (StandardDose > 0),

    CONSTRAINT FK_ServiceVaccination_Vaccine 
    FOREIGN KEY (VaccineID) REFERENCES Vaccine(VaccineID)
);
GO

CREATE TABLE CheckHealth (
    CheckID INT IDENTITY(1,1) PRIMARY KEY,
    PetID INT NOT NULL,
    DoctorID INT NOT NULL,

    CheckDate DATETIME NOT NULL DEFAULT GETDATE(),
    Symptoms NVARCHAR(255) NOT NULL,
    Diagnosis NVARCHAR(255),
    Prescription NVARCHAR(255),
    FollowUpDate DATETIME,

    CONSTRAINT CK_CheckHealth_FollowUp CHECK (FollowUpDate IS NULL OR FollowUpDate >= CheckDate),

    FOREIGN KEY (PetID) REFERENCES Pet(PetID),
    FOREIGN KEY (DoctorID) REFERENCES Employee(EmployeeID)
);


GO
CREATE TABLE InvoiceItem (
    InvoiceItemID INT IDENTITY(1,1) PRIMARY KEY,
    InvoiceID INT NOT NULL,
    ItemType NVARCHAR(20) NOT NULL,
    ProductID INT NULL,
    ServiceID INT NULL,
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(14,2) NOT NULL,
    TotalPrice AS (Quantity * UnitPrice),

    CONSTRAINT CK_InvoiceItem_Type CHECK (ItemType IN ('PRODUCT','SERVICE')),
    CONSTRAINT CK_InvoiceItem_Quantity CHECK (Quantity > 0),
    CONSTRAINT CK_InvoiceItem_UnitPrice CHECK (UnitPrice > 0),

    FOREIGN KEY (InvoiceID) REFERENCES Invoice(InvoiceID),
    FOREIGN KEY (ProductID) REFERENCES Product(ProductID),
    FOREIGN KEY (ServiceID) REFERENCES Service(ServiceID)
);



GO
CREATE TABLE LoyaltyTransaction (
    LoyaltyTransID INT IDENTITY(1,1) PRIMARY KEY,
    CustomerID INT NOT NULL,
    InvoiceID INT NULL,
    PointsChange INT NOT NULL,
    Reason NVARCHAR(255),
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),

    CONSTRAINT CK_Loyalty_Points CHECK (PointsChange <> 0),

    FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID),
    FOREIGN KEY (InvoiceID) REFERENCES Invoice(InvoiceID)
);

GO

CREATE TABLE Review (
    ReviewID INT IDENTITY(1,1) PRIMARY KEY,
    CustomerID INT NOT NULL,
    BranchID INT NOT NULL,
    EmployeeID INT NULL,

    RatingServiceQuality TINYINT,
    RatingStaffAttitude  TINYINT,
    RatingOverall        TINYINT,
    Comment NVARCHAR(500),
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT CK_Review_Service CHECK (RatingServiceQuality BETWEEN 1 AND 5),
    CONSTRAINT CK_Review_Attitude CHECK (RatingStaffAttitude BETWEEN 1 AND 5),
    CONSTRAINT CK_Review_Overall CHECK (RatingOverall BETWEEN 1 AND 5),

    FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID),
    FOREIGN KEY (BranchID) REFERENCES Branch(BranchID),
    FOREIGN KEY (EmployeeID) REFERENCES Employee(EmployeeID)
);

GO

CREATE TABLE Booking (
    BookingID INT IDENTITY(1,1) PRIMARY KEY,
    CustomerID INT NOT NULL,
    PetID INT NOT NULL,
    BookingType NVARCHAR(50) NOT NULL,
    RequestedDateTime DATETIME NOT NULL,
    Status NVARCHAR(20) NOT NULL,
    Notes NVARCHAR(255),
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),

    CONSTRAINT CK_Booking_Status CHECK (Status IN ('Pending','Confirmed','Cancelled','Completed')),

    FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID),
    FOREIGN KEY (PetID) REFERENCES Pet(PetID)
);

GO

CREATE TABLE BookingHistory (
    HistoryID INT IDENTITY(1,1) PRIMARY KEY,
    BookingID INT NOT NULL,
    ActionType NVARCHAR(30) NOT NULL,
    OldDateTime DATETIME,
    NewDateTime DATETIME,
    OldStatus NVARCHAR(20),
    NewStatus NVARCHAR(20),
    Notes NVARCHAR(255),
    Timestamp DATETIME NOT NULL DEFAULT GETDATE(),

    CONSTRAINT CK_BookingHistory_Status CHECK (
        NewStatus IN ('Pending','Confirmed','Cancelled','Completed')
    ),

    FOREIGN KEY (BookingID) REFERENCES Booking(BookingID)
);

GO

CREATE TABLE VaccineRecord (
    VaccinationRecordID INT IDENTITY(1,1) PRIMARY KEY,
    PetID INT NOT NULL,
    VaccineID INT NOT NULL,
    BranchID INT NOT NULL,
    DoctorID INT NOT NULL,
    InvoiceItemID INT,
    Dose DECIMAL(6,2) NOT NULL,
    DateAdministered DATE NOT NULL,
    NextDueDate DATE,

    FOREIGN KEY (PetID) REFERENCES Pet(PetID),
    FOREIGN KEY (VaccineID) REFERENCES Vaccine(VaccineID),
    FOREIGN KEY (BranchID) REFERENCES Branch(BranchID),
    FOREIGN KEY (DoctorID) REFERENCES Employee(EmployeeID),
    FOREIGN KEY (InvoiceItemID) REFERENCES InvoiceItem(InvoiceItemID)
);
GO
USE PetCare;
GO

CREATE TABLE Account (
    AccountID INT IDENTITY(1,1) PRIMARY KEY,
    Username VARCHAR(50) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL, -- Lưu mật khẩu đã mã hóa (BCrypt/Argon2)
    Role NVARCHAR(20) NOT NULL,
    IsActive BIT DEFAULT 1,
    
    -- Liên kết đến đối tượng sở hữu
    EmployeeID INT NULL,
    CustomerID INT NULL,

    -- RÀNG BUỘC 1: Một tài khoản phải thuộc về HOẶC nhân viên HOẶC khách hàng (Exclusive OR)
    CONSTRAINT CK_Account_Owner 
    CHECK (
        (EmployeeID IS NOT NULL AND CustomerID IS NULL) OR 
        (CustomerID IS NOT NULL AND EmployeeID IS NULL)
    ),

    -- RÀNG BUỘC 2: Kiểm tra vai trò hợp lệ
    -- Role chỉ có 2 loại: EMPLOYEE (nhân viên) hoặc CUSTOMER (khách hàng)
    -- Role thực tế của employee (Doctor, Receptionist, Sales, Manager) dựa vào PositionID
    CONSTRAINT CK_Account_Role 
    CHECK (Role IN ('EMPLOYEE', 'CUSTOMER')),

    FOREIGN KEY (EmployeeID) REFERENCES Employee(EmployeeID),
    FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID)
);
GO

-- Index để tăng tốc độ đăng nhập
CREATE NONCLUSTERED INDEX IDX_Account_Login ON Account(Username, IsActive);
CREATE UNIQUE NONCLUSTERED INDEX UQ_Account_EmployeeID ON Account(EmployeeID) WHERE EmployeeID IS NOT NULL;
CREATE UNIQUE NONCLUSTERED INDEX UQ_Account_CustomerID ON Account(CustomerID) WHERE CustomerID IS NOT NULL;
GO
--1)
--InvoiceItem: thiếu ràng buộc “chỉ được chọn 1 trong 2”
-- Hiện tại ItemType là PRODUCT/SERVICE nhưng ProductID và ServiceID đều để NULL được, hoặc tệ hơn là cả hai cùng có giá trị → dữ liệu bẩn.
--Thêm check:
ALTER TABLE InvoiceItem
ADD CONSTRAINT CK_InvoiceItem_ExactlyOne
CHECK (
    (ItemType = 'PRODUCT' AND ProductID IS NOT NULL AND ServiceID IS NULL)
 OR (ItemType = 'SERVICE' AND ServiceID IS NOT NULL AND ProductID IS NULL)
)
GO
--2)
--Invoice: Discount có thể làm âm FinalAmount
--FinalAmount AS (TotalAmount - DiscountAmount) nhưng hiện tại chỉ check DiscountAmount >= 0, không check DiscountAmount <= TotalAmount.
ALTER TABLE Invoice
ADD CONSTRAINT CK_Invoice_Discount_LTE_Total
CHECK (DiscountAmount >= 0 AND DiscountAmount <= TotalAmount);
GO
--MembershipTier
INSERT INTO MembershipTier (Name, MinSpend, MaintainSpend, Benefits)
VALUES
(N'Basic', 0, 0, N'Ưu đãi cơ bản'),
(N'Loyal', 5000000, 3000000, N'Ưu đãi thân thiết'),
(N'VIP',   20000000, 15000000, N'Ưu đãi cao nhất');
GO
--Vaccinepackage
INSERT INTO VaccinePackage (Name, DurationMonths, Price, DiscountPercent, Item)
VALUES
(N'Gói 6 tháng', 6, 1200000, 5, N'Bao gồm các vaccine cơ bản'),
(N'Gói 12 tháng', 12, 2000000, 10, N'Gói phòng bệnh đầy đủ'),
(N'Gói VIP', 12, 3500000, 15, N'Gói cao cấp cho chó mèo');
GO
--Position
INSERT INTO Position (Name, Description)
VALUES
(N'Bác sĩ thú y',        N'Chẩn đoán, điều trị và tiêm phòng cho thú cưng'),
(N'Nhân viên tiếp tân',  N'Tiếp nhận khách, đặt lịch, hỗ trợ thông tin'),
(N'Nhân viên bán hàng',  N'Tư vấn sản phẩm và hỗ trợ thanh toán'),
(N'Quản lý chi nhánh',   N'Điều hành chi nhánh và quản lý nhân sự');
GO
--Service
INSERT INTO Service (Name, ServiceType, BasePrice, Description)
VALUES
(N'Khám bệnh',       'CHECKUP',      150000, N'Dịch vụ khám sức khỏe thú cưng'),
(N'Tiêm phòng',      'VACCINATION',  230000, N'Tiêm vaccine cho thú cưng'),
(N'Gói tiêm phòng',  'PACKAGE',      1200000, N'Gói tiêm phòng theo tháng');
GO
--Promotion
INSERT INTO Promotion (PromotionID, Name, Type, Value, StartDate, EndDate, ApplicableTo)
VALUES
(1, N'Giảm giá dịch vụ 10%', 'PERCENT', 10, '2024-01-01', '2024-12-31', 'SERVICE'),
(2, N'Giảm giá sản phẩm 5%', 'PERCENT', 5, '2024-01-01', '2024-12-31', 'PRODUCT'),
(3, N'Giảm 50k hóa đơn', 'AMOUNT', 50000, '2024-01-01', '2024-12-31', 'ALL');
GO
--Branch
INSERT INTO Branch (BranchID, Name, Phone, OpenTime, CloseTime, Address) VALUES
(1,  N'PetCare Quận 1',          '0938417265', '08:00', '21:00', N'Quận 1, TP.HCM'),
(2,  N'PetCare Quận 3',          '0975321840', '08:00', '21:00', N'Quận 3, TP.HCM'),
(3,  N'PetCare Quận 5',          '0867219345', '08:00', '21:00', N'Quận 5, TP.HCM'),
(4,  N'PetCare Quận 7',          '0829453176', '08:00', '21:00', N'Quận 7, TP.HCM'),
(5,  N'PetCare Quận 10',         '0916372845', '08:00', '21:00', N'Quận 10, TP.HCM'),

(6,  N'PetCare Bình Thạnh',      '0908726314', '08:00', '21:00', N'Bình Thạnh, TP.HCM'),
(7,  N'PetCare Gò Vấp',          '0881934752', '08:00', '21:00', N'Gò Vấp, TP.HCM'),
(8,  N'PetCare Tân Bình',        '0835647291', '08:00', '21:00', N'Tân Bình, TP.HCM'),
(9,  N'PetCare Tân Phú',         '0859172436', '08:00', '21:00', N'Tân Phú, TP.HCM'),
(10, N'PetCare Phú Nhuận',       '0928713465', '08:00', '21:00', N'Phú Nhuận, TP.HCM'),

(11, N'PetCare Thủ Đức',         '0871265493', '08:00', '21:00', N'Thủ Đức, TP.HCM'),
(12, N'PetCare Dĩ An',           '0935127846', '08:00', '21:00', N'Dĩ An, Bình Dương'),
(13, N'PetCare Thuận An',        '0948273156', '08:00', '21:00', N'Thuận An, Bình Dương'),
(14, N'PetCare Biên Hòa',        '0903564827', '08:00', '21:00', N'Biên Hòa, Đồng Nai'),
(15, N'PetCare Vũng Tàu',        '0912846357', '08:00', '21:00', N'TP. Vũng Tàu'),

(16, N'PetCare Long An',         '0925637481', '08:00', '21:00', N'Long An'),
(17, N'PetCare Cần Thơ',         '0837812465', '08:00', '21:00', N'Ninh Kiều, Cần Thơ'),
(18, N'PetCare Đà Nẵng',         '0879351624', '08:00', '21:00', N'Hải Châu, Đà Nẵng'),
(19, N'PetCare Hà Nội',          '0965283741', '08:00', '21:00', N'Hoàn Kiếm, Hà Nội'),
(20, N'PetCare Hải Phòng',       '0917364825', '08:00', '21:00', N'Lê Chân, Hải Phòng');
GO
--Service
INSERT INTO Product (Name, Category, Price, StockQty, Description)
VALUES
(N'Hạt Royal Canin Puppy',    N'FOOD',      350000,  120, N'Dành cho chó con'),
(N'Hạt Pedigree Adult',       N'FOOD',      250000,  200, N'Hạt cho chó trưởng thành'),
(N'Hạt Whiskas Tuna',         N'FOOD',      220000,  150, N'Hạt cho mèo vị cá ngừ'),
(N'Hạt HomeCat Salmon',       N'FOOD',      180000,  100, N'Hạt mèo vị cá hồi'),
(N'Sữa tắm SOS',              N'MEDICINE',  95000,   80,  N'Sữa tắm khử mùi cho chó mèo'),
(N'Sữa tắm JOY Pet',          N'MEDICINE',  85000,   90,  N'Sữa tắm kháng khuẩn'),
(N'Thuốc tẩy giun Drontal',   N'MEDICINE',  80000,   300, N'Tẩy giun định kỳ'),
(N'Thuốc nhỏ gáy Frontline',  N'MEDICINE',  120000,  250, N'Trị ve rận cho chó mèo'),
(N'Thuốc trị nấm Ketoconazole',N'MEDICINE', 160000,  70,  N'Dùng cho chó mèo bị nấm'),
(N'Gel dinh dưỡng Nutri-Plus',N'MEDICINE',  150000,  120, N'Bổ sung vitamin'),

(N'Dây dắt chó 1.2m',         N'ACCESSORY', 70000,   100, N'Dây dắt cho chó nhỏ'),
(N'Dây dắt chó 2m',           N'ACCESSORY', 90000,   90,  N'Dây dắt cho chó lớn'),
(N'Vòng cổ mèo chuông nhỏ',   N'ACCESSORY', 35000,   200, N'Vòng cổ có chuông'),
(N'Ổ nằm cho mèo loại S',     N'ACCESSORY', 150000,  50,  N'Ổ nằm nhỏ cho mèo'),
(N'Ổ nằm cho mèo loại L',     N'ACCESSORY', 250000,  40,  N'Ổ nằm lớn cho mèo'),
(N'Áo hoodie cho chó',        N'ACCESSORY', 120000,  60,  N'Áo thời trang cho chó'),
(N'Áo mèo size M',            N'ACCESSORY', 90000,   50,  N'Áo cho mèo size trung'),

(N'Đồ chơi bóng chuông',      N'TOY',       30000,   300, N'Bóng kêu vui nhộn'),
(N'Đồ chơi chuột giả',        N'TOY',       20000,   250, N'Chuột giả cho mèo'),
(N'Đồ chơi xương mềm',        N'TOY',       45000,   200, N'Xương cao su cho chó'),
(N'Cây cào móng mèo mini',    N'TOY',       120000,  70,  N'Cào móng cho mèo'),
(N'Cây cào móng mèo lớn',     N'TOY',       250000,  50,  N'Cây cào size lớn'),

(N'Bát ăn inox size S',       N'ACCESSORY', 40000,   150, N'Bát ăn chống trượt'),
(N'Bát ăn inox size L',       N'ACCESSORY', 60000,   120, N'Cho chó lớn'),
(N'Bình nước tự động',        N'ACCESSORY', 130000,  80,  N'Dành cho mọi loại thú cưng'),
(N'Lồng vận chuyển size S',   N'ACCESSORY', 280000,  40,  N'Dễ dàng mang theo'),
(N'Lồng vận chuyển size L',   N'ACCESSORY', 450000,  30,  N'Dành cho thú cưng lớn'),

(N'Snack gà sấy',             N'FOOD',      55000,   200, N'Treat thưởng cho chó'),
(N'Snack cá hồi',             N'FOOD',      65000,   180, N'Treat cho mèo'),
(N'Sữa bột Goat Milk',        N'FOOD',      180000,  60,  N'Sữa bột dinh dưỡng');
--BranchService
INSERT INTO BranchService (BranchID, ServiceID, Price, Active) VALUES
-- Chi nhánh 1
(1, 1, 150000, 1),
(1, 2, 230000, 1),
(1, 3, 0,      1),

-- Chi nhánh 2
(2, 1, 165000, 1),
(2, 2, 210000, 1),
(2, 3, 0,      1),

-- Chi nhánh 3
(3, 1, 178000, 1),
(3, 2, 250000, 1),
(3, 3, 0,      0),

-- Chi nhánh 4
(4, 1, 160000, 1),
(4, 2, 270000, 1),
(4, 3, 0,      1),

-- Chi nhánh 5
(5, 1, 155000, 1),
(5, 2, 265000, 1),
(5, 3, 0,      1),

-- Chi nhánh 6
(6, 1, 170000, 1),
(6, 2, 240000, 1),
(6, 3, 0,      1),

-- Chi nhánh 7
(7, 1, 180000, 1),
(7, 2, 260000, 0),
(7, 3, 0,      1),

-- Chi nhánh 8
(8, 1, 150000, 1),
(8, 2, 225000, 1),
(8, 3, 0,      1),

-- Chi nhánh 9
(9, 1, 175000, 1),
(9, 2, 245000, 1),
(9, 3, 0,      1),

-- Chi nhánh 10
(10, 1, 168000, 1),
(10, 2, 255000, 1),
(10, 3, 0,      0),

-- Chi nhánh 11
(11, 1, 180000, 1),
(11, 2, 300000, 1),
(11, 3, 0,      1),

-- Chi nhánh 12
(12, 1, 155000, 1),
(12, 2, 290000, 1),
(12, 3, 0,      1),

-- Chi nhánh 13
(13, 1, 172000, 1),
(13, 2, 310000, 0),
(13, 3, 0,      1),

-- Chi nhánh 14
(14, 1, 158000, 1),
(14, 2, 295000, 1),
(14, 3, 0,      1),

-- Chi nhánh 15
(15, 1, 165000, 1),
(15, 2, 220000, 1),
(15, 3, 0,      1),

-- Chi nhánh 16
(16, 1, 190000, 1),
(16, 2, 330000, 1),
(16, 3, 0,      1),

-- Chi nhánh 17
(17, 1, 175000, 1),
(17, 2, 260000, 1),
(17, 3, 0,      1),

-- Chi nhánh 18
(18, 1, 185000, 1),
(18, 2, 280000, 0),
(18, 3, 0,      1),

-- Chi nhánh 19
(19, 1, 160000, 1),
(19, 2, 250000, 1),
(19, 3, 0,      1),

-- Chi nhánh 20
(20, 1, 170000, 1),
(20, 2, 265000, 1),
(20, 3, 0,      1);
--PromotionBranch
INSERT INTO PromotionBranch (PromotionID, BranchID) VALUES
(1, 1), (3, 1),
(2, 2),
(1, 3), (2, 3),
(1, 4),
(1, 5), (3, 5),
(2, 6),
(1, 7),
(3, 8),
(2, 9),
(1, 10), (2, 10),

(3, 11),
(1, 12),
(1, 13), (3, 13),
(2, 14),
(1, 15),
(2, 16),
(1, 17), (3, 17),
(1, 18),
(2, 19), (3, 19),
(1, 20);
GO
--Vaccine
INSERT INTO Vaccine (Type, Description, StandardDose)
VALUES
(N'7 bệnh',            N'Vaccine tổng hợp cho chó',              1.0),
(N'Dại',               N'Vaccine phòng bệnh dại',                1.6),
(N'Parvo',             N'Vaccine phòng bệnh Parvovirus',         1.0),
(N'Care',              N'Vaccine phòng bệnh Care',               0.5),
(N'Corona',            N'Vaccine phòng bệnh Corona',             1.0),
(N'FVRCP',             N'Vaccine tổng hợp 3 bệnh cho mèo',       1.75),
(N'FeLV',              N'Vaccine phòng bệnh bạch cầu mèo',       1.0),
(N'Bordetella',        N'Vaccine ho cũi cho chó',                2.0),
(N'Leptospira',        N'Vaccine phòng xoắn khuẩn Lepto',        1.2),
(N'Calicivirus',       N'Vaccine cho mèo phòng bệnh calici',     1.25),
(N'Parainfluenza',     N'Ngừa bệnh cảm cúm do virus PI ở chó',       1.0),
(N'Distemper Booster', N'Mũi nhắc lại bệnh Care cho chó',           1.0),
(N'Rabies Booster',    N'Mũi nhắc lại phòng bệnh dại',              1.5),
(N'FIP',               N'Ngừa bệnh viêm phúc mạc ở mèo (FIP)',      1.25),
(N'Panleukopenia',     N'Vaccine phòng bệnh giảm bạch cầu mèo',     1.0),
(N'Chlamydia',         N'Ngừa bệnh Chlamydia ở mèo',                0.75),
(N'Kennel Cough',      N'Vaccine phòng ho cũi (Kennel Cough)',      1.0),
(N'Hepatitis',         N'Vaccine phòng viêm gan truyền nhiễm',      0.5),
(N'Lyme Disease',      N'Ngừa bệnh Lyme do ve truyền',              1.0),
(N'Giardia',           N'Vaccine phòng bệnh đường ruột Giardia',    1.75);

GO
--VaccineBatch
DECLARE @VaccineID INT, @BranchID INT;
DECLARE vaccine_cursor CURSOR FOR SELECT VaccineID FROM Vaccine;
OPEN vaccine_cursor;
FETCH NEXT FROM vaccine_cursor INTO @VaccineID;
WHILE @@FETCH_STATUS = 0
BEGIN
    DECLARE branch_cursor CURSOR FOR SELECT BranchID FROM Branch; -- Khai báo bên trong
    OPEN branch_cursor;
    FETCH NEXT FROM branch_cursor INTO @BranchID;
    WHILE @@FETCH_STATUS = 0
    BEGIN
        INSERT INTO VaccineBatch (VaccineID, BranchID, ManufactureDate, ExpiryDate, Quantity)
        VALUES (
            @VaccineID, @BranchID,
            DATEADD(DAY, -ABS(CHECKSUM(NEWID())) % 730, GETDATE()), 
            DATEADD(DAY, (ABS(CHECKSUM(NEWID())) % 730) + 30, GETDATE()), 
            (ABS(CHECKSUM(NEWID())) % 150) + 50 
        );
        FETCH NEXT FROM branch_cursor INTO @BranchID;
    END
    CLOSE branch_cursor;
    DEALLOCATE branch_cursor; -- Giải phóng ngay sau khi kết thúc 1 chi nhánh
    FETCH NEXT FROM vaccine_cursor INTO @VaccineID;
END
CLOSE vaccine_cursor;
DEALLOCATE vaccine_cursor;
GO
--Employee
DECLARE @LastNames TABLE (Name NVARCHAR(50));
INSERT INTO @LastNames VALUES 
(N'Nguyễn'),(N'Trần'),(N'Lê'),(N'Phạm'),
(N'Hoàng'),(N'Bùi'),(N'Đặng'),(N'Đỗ'),
(N'Võ'),(N'Vương'),(N'Huỳnh'),(N'Đào');

DECLARE @MiddleNames TABLE (Name NVARCHAR(50));
INSERT INTO @MiddleNames VALUES 
(N'Văn'),(N'Thị'),(N'Ngọc'),(N'Minh'),
(N'Hoàng'),(N'Hữu'),(N'Gia'),(N'Bảo'),
(N'Khánh'),(N'Quốc'),(N'Phương');

DECLARE @FirstNames TABLE (Name NVARCHAR(50));
INSERT INTO @FirstNames VALUES 
(N'Anh'),(N'Hùng'),(N'Tuấn'),(N'Thảo'),
(N'Hà'),(N'Phong'),(N'Linh'),(N'Trâm'),
(N'Vy'),(N'Kiệt'),(N'Tâm'),(N'Huy'),
(N'Thành'),(N'Phúc'),(N'Trân'),(N'Nhi'),
(N'Tiên'),(N'Thu'),(N'Long'),(N'Tài'),
(N'Hạnh'),(N'Tú'),(N'Quân'),(N'Thịnh'),

(N'Tiên'),(N'Thu'),(N'Long'),(N'Tài'),
(N'Hạnh'),(N'Tú'),(N'Quân'),(N'Thịnh');

DECLARE @i INT = 1;

WHILE @i <= 1000
BEGIN
    DECLARE 
        @Last NVARCHAR(50),
        @Mid NVARCHAR(50),
        @First NVARCHAR(50),
        @Full NVARCHAR(150),
        @Gender NVARCHAR(10),
        @Birth DATE,
        @Hire DATE,
        @BranchID1 INT,
        @PositionID INT,
        @Salary DECIMAL(14,2);

    -- Random tên
    SELECT TOP 1 @Last = Name FROM @LastNames ORDER BY NEWID();
    SELECT TOP 1 @Mid  = Name FROM @MiddleNames ORDER BY NEWID();
    SELECT TOP 1 @First= Name FROM @FirstNames ORDER BY NEWID();

    SET @Full = CONCAT(@Last, ' ', @Mid, ' ', @First);

    -- Random giới tính
    SET @Gender = CASE ABS(CHECKSUM(NEWID())) % 3
                    WHEN 0 THEN 'Male'
                    WHEN 1 THEN 'Female'
                    ELSE 'Other'
                  END;

    -- Random ngày sinh từ 1970–2005
    SET @Birth = DATEADD(DAY, -(ABS(CHECKSUM(NEWID())) % 12000), '2005-01-01');

    -- HireDate >= Birth + 18 năm
    SET @Hire = DATEADD(YEAR, 18, @Birth);

    -- Random BranchID (1–20)
    SET @BranchID1 = (ABS(CHECKSUM(NEWID())) % 20) + 1;

    -- Random PositionID (1–4)
    SET @PositionID = (ABS(CHECKSUM(NEWID())) % 4) + 1;

    -- Lương 8 triệu – 25 triệu
    SET @Salary = ((ABS(CHECKSUM(NEWID())) % 17000) + 8000) * 1000;

    INSERT INTO Employee (BranchID, PositionID, FullName, BirthDate, Gender, HireDate, BaseSalary)
    VALUES (@BranchID1, @PositionID, @Full, @Birth, @Gender, @Hire, @Salary);

    SET @i = @i + 1;
END;
GO
--EmployeeHistory
DECLARE @EmployeeID INT, @i INT = 1, @Loops INT;

WHILE @i <= 500
BEGIN
    SET @EmployeeID = @i;

    -- Mỗi nhân viên có 2 hoặc 3 lịch sử
    SET @Loops = (ABS(CHECKSUM(NEWID())) % 2) + 2;  -- 2 hoặc 3

    DECLARE @k INT = 1;
    DECLARE @StartDate DATE, @EndDate DATE;

    -- Khởi tạo ngày bắt đầu đầu tiên (random từ 2015 đến 2021)
    SET @StartDate = DATEADD(DAY, ABS(CHECKSUM(NEWID())) % 2000, '2015-01-01');

    WHILE @k <= @Loops
    BEGIN
        -- Random chi nhánh
        DECLARE @BranchID INT = (ABS(CHECKSUM(NEWID())) % 20) + 1;

        -- EndDate: 50% là NULL (đang làm việc)
        IF @k = @Loops AND (ABS(CHECKSUM(NEWID())) % 2 = 0)
            SET @EndDate = NULL;
        ELSE
            SET @EndDate = DATEADD(DAY, (ABS(CHECKSUM(NEWID())) % 500) + 180, @StartDate);

        INSERT INTO EmployeeHistory (EmployeeID, BranchID, StartDate, EndDate)
        VALUES (@EmployeeID, @BranchID, @StartDate, @EndDate);

        -- Lịch sử tiếp theo bắt đầu sau khi EndDate + random 10–60 ngày
        IF @EndDate IS NOT NULL
            SET @StartDate = DATEADD(DAY, (ABS(CHECKSUM(NEWID())) % 50) + 10, @EndDate);

        SET @k = @k + 1;
    END
    SET @i = @i + 1;
END
GO
--Chạy hàm này trước khi tạo customer
GO
CREATE FUNCTION RemoveVietnameseAccent (@str NVARCHAR(MAX))
RETURNS NVARCHAR(MAX)
AS
BEGIN
    IF @str IS NULL RETURN NULL;
    -- Chữ thường
    SET @str = REPLACE(@str, N'á', 'a'); SET @str = REPLACE(@str, N'à', 'a');
    SET @str = REPLACE(@str, N'ả', 'a'); SET @str = REPLACE(@str, N'ã', 'a');
    SET @str = REPLACE(@str, N'ạ', 'a'); SET @str = REPLACE(@str, N'ă', 'a');
    SET @str = REPLACE(@str, N'ắ', 'a'); SET @str = REPLACE(@str, N'ằ', 'a');
    SET @str = REPLACE(@str, N'ẳ', 'a'); SET @str = REPLACE(@str, N'ẵ', 'a');
    SET @str = REPLACE(@str, N'ặ', 'a'); SET @str = REPLACE(@str, N'â', 'a');
    SET @str = REPLACE(@str, N'ấ', 'a'); SET @str = REPLACE(@str, N'ầ', 'a');
    SET @str = REPLACE(@str, N'ẩ', 'a'); SET @str = REPLACE(@str, N'ẫ', 'a');
    SET @str = REPLACE(@str, N'ậ', 'a');

    SET @str = REPLACE(@str, N'é', 'e'); SET @str = REPLACE(@str, N'è', 'e');
    SET @str = REPLACE(@str, N'ẻ', 'e'); SET @str = REPLACE(@str, N'ẽ', 'e');
    SET @str = REPLACE(@str, N'ẹ', 'e'); SET @str = REPLACE(@str, N'ê', 'e');
    SET @str = REPLACE(@str, N'ế', 'e'); SET @str = REPLACE(@str, N'ề', 'e');
    SET @str = REPLACE(@str, N'ể', 'e'); SET @str = REPLACE(@str, N'ễ', 'e');
    SET @str = REPLACE(@str, N'ệ', 'e');

    SET @str = REPLACE(@str, N'í', 'i'); SET @str = REPLACE(@str, N'ì', 'i');
    SET @str = REPLACE(@str, N'ỉ', 'i'); SET @str = REPLACE(@str, N'ĩ', 'i');
    SET @str = REPLACE(@str, N'ị', 'i');

    SET @str = REPLACE(@str, N'ó', 'o'); SET @str = REPLACE(@str, N'ò', 'o');
    SET @str = REPLACE(@str, N'ỏ', 'o'); SET @str = REPLACE(@str, N'õ', 'o');
    SET @str = REPLACE(@str, N'ọ', 'o'); SET @str = REPLACE(@str, N'ô', 'o');
    SET @str = REPLACE(@str, N'ố', 'o'); SET @str = REPLACE(@str, N'ồ', 'o');
    SET @str = REPLACE(@str, N'ổ', 'o'); SET @str = REPLACE(@str, N'ỗ', 'o');
    SET @str = REPLACE(@str, N'ộ', 'o'); SET @str = REPLACE(@str, N'ơ', 'o');
    SET @str = REPLACE(@str, N'ớ', 'o'); SET @str = REPLACE(@str, N'ờ', 'o');
    SET @str = REPLACE(@str, N'ở', 'o'); SET @str = REPLACE(@str, N'ỡ', 'o');
    SET @str = REPLACE(@str, N'ợ', 'o');

    SET @str = REPLACE(@str, N'ú', 'u'); SET @str = REPLACE(@str, N'ù', 'u');
    SET @str = REPLACE(@str, N'ủ', 'u'); SET @str = REPLACE(@str, N'ũ', 'u');
    SET @str = REPLACE(@str, N'ụ', 'u'); SET @str = REPLACE(@str, N'ư', 'u');
    SET @str = REPLACE(@str, N'ứ', 'u'); SET @str = REPLACE(@str, N'ừ', 'u');
    SET @str = REPLACE(@str, N'ử', 'u'); SET @str = REPLACE(@str, N'ữ', 'u');
    SET @str = REPLACE(@str, N'ự', 'u');

    SET @str = REPLACE(@str, N'ý', 'y'); SET @str = REPLACE(@str, N'ỳ', 'y');
    SET @str = REPLACE(@str, N'ỷ', 'y'); SET @str = REPLACE(@str, N'ỹ', 'y');
    SET @str = REPLACE(@str, N'ỵ', 'y');

    SET @str = REPLACE(@str, N'đ', 'd');

    -- Chữ hoa
    SET @str = REPLACE(@str, N'Á', 'A'); SET @str = REPLACE(@str, N'À', 'A');
    SET @str = REPLACE(@str, N'Ả', 'A'); SET @str = REPLACE(@str, N'Ã', 'A');
    SET @str = REPLACE(@str, N'Ạ', 'A'); SET @str = REPLACE(@str, N'Ă', 'A');
    SET @str = REPLACE(@str, N'Ắ', 'A'); SET @str = REPLACE(@str, N'Ằ', 'A');
    SET @str = REPLACE(@str, N'Ẳ', 'A'); SET @str = REPLACE(@str, N'Ẵ', 'A');
    SET @str = REPLACE(@str, N'Ặ', 'A'); SET @str = REPLACE(@str, N'Â', 'A');
    SET @str = REPLACE(@str, N'Ấ', 'A'); SET @str = REPLACE(@str, N'Ầ', 'A');
    SET @str = REPLACE(@str, N'Ẩ', 'A'); SET @str = REPLACE(@str, N'Ẫ', 'A');
    SET @str = REPLACE(@str, N'Ậ', 'A');

    SET @str = REPLACE(@str, N'É', 'E'); SET @str = REPLACE(@str, N'È', 'E');
    SET @str = REPLACE(@str, N'Ẻ', 'E'); SET @str = REPLACE(@str, N'Ẽ', 'E');
    SET @str = REPLACE(@str, N'Ẹ', 'E'); SET @str = REPLACE(@str, N'Ê', 'E');
    SET @str = REPLACE(@str, N'Ế', 'E'); SET @str = REPLACE(@str, N'Ề', 'E');
    SET @str = REPLACE(@str, N'Ể', 'E'); SET @str = REPLACE(@str, N'Ễ', 'E');
    SET @str = REPLACE(@str, N'Ệ', 'E');

    SET @str = REPLACE(@str, N'Í', 'I'); SET @str = REPLACE(@str, N'Ì', 'I');
    SET @str = REPLACE(@str, N'Ỉ', 'I'); SET @str = REPLACE(@str, N'Ĩ', 'I');
    SET @str = REPLACE(@str, N'Ị', 'I');

    SET @str = REPLACE(@str, N'Ó', 'O'); SET @str = REPLACE(@str, N'Ò', 'O');
    SET @str = REPLACE(@str, N'Ỏ', 'O'); SET @str = REPLACE(@str, N'Õ', 'O');
    SET @str = REPLACE(@str, N'Ọ', 'O'); SET @str = REPLACE(@str, N'Ô', 'O');
    SET @str = REPLACE(@str, N'Ố', 'O'); SET @str = REPLACE(@str, N'Ồ', 'O');
    SET @str = REPLACE(@str, N'Ổ', 'O'); SET @str = REPLACE(@str, N'Ỗ', 'O');
    SET @str = REPLACE(@str, N'Ộ', 'O'); SET @str = REPLACE(@str, N'Ơ', 'O');
    SET @str = REPLACE(@str, N'Ớ', 'O'); SET @str = REPLACE(@str, N'Ờ', 'O');
    SET @str = REPLACE(@str, N'Ở', 'O'); SET @str = REPLACE(@str, N'Ỡ', 'O');
    SET @str = REPLACE(@str, N'Ợ', 'O');

    SET @str = REPLACE(@str, N'Ú', 'U'); SET @str = REPLACE(@str, N'Ù', 'U');
    SET @str = REPLACE(@str, N'Ủ', 'U'); SET @str = REPLACE(@str, N'Ũ', 'U');
    SET @str = REPLACE(@str, N'Ụ', 'U'); SET @str = REPLACE(@str, N'Ư', 'U');
    SET @str = REPLACE(@str, N'Ứ', 'U'); SET @str = REPLACE(@str, N'Ừ', 'U');
    SET @str = REPLACE(@str, N'Ử', 'U'); SET @str = REPLACE(@str, N'Ữ', 'U');
    SET @str = REPLACE(@str, N'Ự', 'U');

    SET @str = REPLACE(@str, N'Ý', 'Y'); SET @str = REPLACE(@str, N'Ỳ', 'Y');
    SET @str = REPLACE(@str, N'Ỷ', 'Y'); SET @str = REPLACE(@str, N'Ỹ', 'Y');
    SET @str = REPLACE(@str, N'Ỵ', 'Y');

    SET @str = REPLACE(@str, N'Đ', 'D');

    RETURN @str;
END;
GO
--Customer
;WITH Numbers AS (
    SELECT TOP (70000)
        ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS rn,
        ABS(CHECKSUM(NEWID())) AS rnd
    FROM master..spt_values a CROSS JOIN master..spt_values b
)
INSERT INTO Customer (MembershipTierID, FullName, Phone, Email, CCCD, Gender, BirthDate, MemberSince)
SELECT  
    (rnd % 3) + 1,

    CONCAT(
        CHOOSE(rnd % 10 + 1,
            N'Nguyễn',N'Trần',N'Lê',N'Phạm',N'Hoàng',
            N'Võ',N'Huỳnh',N'Bùi',N'Vương',N'Đinh'),
        N' ',
        CHOOSE((rnd / 10) % 10 + 1,
            N'Văn',N'Thị',N'Ngọc',N'Minh',N'Gia',
            N'Bảo',N'Hoàng',N'Quốc',N'Phương',N'Hữu'),
        N' ',
        CHOOSE((rnd / 100) % 15 + 1,
            N'Anh',N'Huy',N'Linh',N'Nhi',N'Long',
            N'Vy',N'Phúc',N'Thảo',N'Tiên',N'Tuấn',
            N'Tâm',N'Tài',N'Kiệt',N'Khánh',N'Trân')
    ),

    '09' + RIGHT('00000000' + CAST(rn AS VARCHAR(8)), 8),
    LOWER('customer' + CAST(rn AS VARCHAR(10)) + '@gmail.com'),
    RIGHT('000000000000' + CAST(100000000000 + rn AS VARCHAR(12)), 12),

    CASE rnd % 3 WHEN 0 THEN 'M' WHEN 1 THEN 'F' ELSE 'O' END,
    DATEADD(DAY, rnd % 15000, '1970-01-01'),
    DATEADD(DAY, rnd % 3500, '2015-01-01')
FROM Numbers;
GO
-- PET
;WITH PetCount AS (
    SELECT 
        C.CustomerID,
        ABS(CHECKSUM(NEWID())) % 3 + 1 AS PetCount   -- 1–3 thú cưng
    FROM Customer C
),
PetBase AS (
    SELECT *
    FROM (VALUES
        (N'Chó', N'Poodle',        N'Milo'),
        (N'Chó', N'Corgi',         N'Sam'),
        (N'Chó', N'Husky',         N'Lu'),
        (N'Chó', N'Shiba Inu',     N'Bim'),
        (N'Chó', N'Golden',        N'Đốm'),
        (N'Chó', N'Labrador',      N'Vàng'),
        (N'Chó', N'Phốc Sóc',      N'Bông'),
        (N'Chó', N'Bull Pháp',     N'Kem'),

        (N'Mèo', N'ALN',           N'Miu'),
        (N'Mèo', N'ALD',           N'Mun'),
        (N'Mèo', N'Ba Tư',         N'Nho'),
        (N'Mèo', N'Ragdoll',       N'Sữa'),
        (N'Mèo', N'Munchkin',      N'Bé'),
        (N'Mèo', N'Sphynx',        N'Tôm'),

        (N'Hamster', N'Syrian',      N'Chuối'),
        (N'Hamster', N'Winter White',N'Kẹo'),
        (N'Hamster', N'Robo',        N'Tip'),

        (N'Thỏ', N'Hà Lan',        N'Bé Mun'),
        (N'Thỏ', N'Mini Lop',      N'Bé Heo'),

        (N'Chim', N'Yến phụng',    N'Chip'),
        (N'Chim', N'Lovebird',     N'Xíu'),
        (N'Chim', N'Cockatiel',    N'Su'),

        (N'Rùa', N'Sulcata',       N'Nuts'),
        (N'Rùa', N'Tai đỏ',        N'Leaf'),

        (N'Bò sát', N'Leopard Gecko', N'Gex'),
        (N'Bò sát', N'Bearded Dragon',N'Drax'),

        (N'Rắn', N'Corn Snake',    N'Slick'),
        (N'Rắn', N'Ball Python',   N'Orb'),

        (N'Cá', N'Betta',          N'Blue'),
        (N'Cá', N'Guppy',          N'Fin'),
        (N'Cá', N'Koi Mini',       N'Spot'),

        (N'Sóc Bay', N'Sugar Glider', N'Zippy'),

        (N'Nhím', N'Nhím kiểng',      N'Spike')
    ) AS P(Species, Breed, PetName)
)

INSERT INTO Pet (CustomerID, Name, Species, Breed, BirthDate, Gender, Status)
SELECT 
    PC.CustomerID,
    CONCAT(P.PetName, ROW_NUMBER() OVER (PARTITION BY PC.CustomerID ORDER BY NEWID())),
    P.Species,
    P.Breed,
    DATEADD(DAY, ABS(CHECKSUM(NEWID())) % 3000, '2015-01-01'),

    -- FIX GENDER ALWAYS VALID & NOT NULL
    CASE ABS(CHECKSUM(NEWID())) % 3
        WHEN 0 THEN 'M'
        WHEN 1 THEN 'F'
        ELSE 'U'
    END,

    -- FIX STATUS ALWAYS VALID
    CASE ABS(CHECKSUM(NEWID())) % 4
        WHEN 0 THEN 'Healthy'
        WHEN 1 THEN 'Sick'
        WHEN 2 THEN 'Adopted'
        ELSE 'Lost'
    END
FROM PetCount PC
CROSS APPLY (
    SELECT TOP (PC.PetCount) *
    FROM PetBase
    ORDER BY NEWID()
) AS P;
GO
-- Phat sinh du lieu bang invoice
-- Phat sinh du lieu bang invoice (FIX discount <= total)
;WITH N1 AS (SELECT 1 n FROM (VALUES(1),(1),(1),(1),(1),(1),(1),(1),(1),(1)) a(n)),
      N2 AS (SELECT 1 n FROM N1 a, N1 b),
      N3 AS (SELECT 1 n FROM N2 a, N2 b),
      N4 AS (SELECT 1 n FROM N3 a, N2 b),
      InvoiceGen AS (
          SELECT TOP (300000)
                 ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS RowID
          FROM N4
      )
INSERT INTO Invoice (BranchID, CustomerID, EmployeeID, InvoiceDate, TotalAmount, DiscountAmount, PaymentMethod)
SELECT
    (ABS(CHECKSUM(NEWID())) % 20) + 1 AS BranchID,
    ABS(CHECKSUM(NEWID())) % (SELECT COUNT(*) FROM Customer) + 1 AS CustomerID,
    ABS(CHECKSUM(NEWID())) % (SELECT COUNT(*) FROM Employee) + 1 AS EmployeeID,
    DATEADD(
    MINUTE, 
    -ABS(CHECKSUM(NEWID())) % 525600, 
    GETDATE()
	) AS InvoiceDate,

    T.TotalAmount,

    -- Discount = % * TotalAmount (luôn <= TotalAmount)
    CASE
        WHEN ABS(CHECKSUM(NEWID())) % 10 = 0
            THEN CAST(ROUND(T.TotalAmount * ((ABS(CHECKSUM(NEWID())) % 21) / 100.0), 2) AS DECIMAL(14,2))
        ELSE CAST(0 AS DECIMAL(14,2))
    END AS DiscountAmount,

    CASE ABS(CHECKSUM(NEWID())) % 3
        WHEN 0 THEN 'CASH'
        WHEN 1 THEN 'CARD'
        ELSE 'BANKING'
    END AS PaymentMethod
FROM InvoiceGen
CROSS APPLY (
    SELECT CAST((ABS(CHECKSUM(NEWID())) % 4950000) + 50000 AS DECIMAL(14,2)) AS TotalAmount
) T;
GO

-- Tạo dữ liệu invoiceitem
;WITH Base AS (
    SELECT TOP (500000)
        ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS rn,

        (SELECT TOP 1 InvoiceID FROM Invoice ORDER BY NEWID()) AS InvoiceID,
        (SELECT TOP 1 ProductID FROM Product ORDER BY NEWID()) AS ProductID,
        (SELECT TOP 1 ServiceID FROM Service ORDER BY NEWID()) AS ServiceID,

        CASE WHEN ABS(CHECKSUM(NEWID())) % 10 < 7 THEN 'PRODUCT' ELSE 'SERVICE' END AS ItemType,

        (ABS(CHECKSUM(NEWID())) % 5) + 1 AS Quantity
    FROM master..spt_values a CROSS JOIN master..spt_values b
)

INSERT INTO InvoiceItem (InvoiceID, ItemType, ProductID, ServiceID, Quantity, UnitPrice)
SELECT  
    InvoiceID,
    ItemType,

    CASE WHEN ItemType = 'PRODUCT' THEN ProductID ELSE NULL END,
    CASE WHEN ItemType = 'SERVICE' THEN ServiceID ELSE NULL END,
    Quantity,

    CASE 
        WHEN ItemType = 'PRODUCT' THEN 
            (SELECT Price FROM Product WHERE ProductID = Base.ProductID)

        ELSE 
        (
            SELECT 
                CASE 
                    WHEN BS.Price IS NULL OR BS.Price <= 0
                        THEN (SELECT BasePrice FROM Service WHERE ServiceID = Base.ServiceID)
                    ELSE BS.Price
                END
            FROM Invoice I
            LEFT JOIN BranchService BS 
                ON BS.BranchID = I.BranchID
               AND BS.ServiceID = Base.ServiceID
            WHERE I.InvoiceID = Base.InvoiceID
        )
    END AS UnitPrice
FROM Base;
GO
--Dữ liệu bảng review
;WITH N AS (
    SELECT TOP (200000)
        ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS rn
    FROM master..spt_values a CROSS JOIN master..spt_values b
)
INSERT INTO Review (CustomerID, BranchID, EmployeeID,
                    RatingServiceQuality, RatingStaffAttitude, RatingOverall,
                    Comment)
SELECT
    -- Random customer
    ABS(CHECKSUM(NEWID())) % (SELECT COUNT(*) FROM Customer) + 1,

    -- Random branch
    ABS(CHECKSUM(NEWID())) % 20 + 1,

    -- Random employee
    ABS(CHECKSUM(NEWID())) % (SELECT COUNT(*) FROM Employee) + 1,

    -- Rating 1–5
    ABS(CHECKSUM(NEWID())) % 5 + 1,
    ABS(CHECKSUM(NEWID())) % 5 + 1,
    ABS(CHECKSUM(NEWID())) % 5 + 1,

    -- Random comment (50% có comment)
    CASE WHEN ABS(CHECKSUM(NEWID())) % 2 = 0 THEN
        CHOOSE(
            ABS(CHECKSUM(NEWID())) % 5 + 1,
            N'Rất hài lòng',
            N'Nhân viên thân thiện',
            N'Dịch vụ tốt',
            N'Sẽ quay lại',
            N'Cần cải thiện thêm'
        )
    ELSE NULL END
FROM N;
GO
--Dữ liệu loyaltyTransaction
INSERT INTO LoyaltyTransaction (CustomerID, InvoiceID, PointsChange, Reason)
SELECT
    I.CustomerID,
    I.InvoiceID,

    CASE 
        WHEN I.FinalAmount IS NULL THEN 1
        WHEN I.FinalAmount < 50000 THEN 1
        ELSE CAST(I.FinalAmount / 50000 AS INT)
    END AS PointsChange,

    N'Tích điểm từ hóa đơn'
FROM Invoice I;
GO
--Dữ liệu Booking
;WITH B AS (
    SELECT TOP (500000)
        ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS rn,
        ABS(CHECKSUM(NEWID())) % (SELECT COUNT(*) FROM Customer) + 1 AS CustID
    FROM master..spt_values a CROSS JOIN master..spt_values b
)
INSERT INTO Booking (CustomerID, PetID, BookingType, RequestedDateTime, Status, Notes, CreatedAt)
SELECT 
    C.CustomerID,
    ISNULL((SELECT TOP 1 PetID FROM Pet WHERE CustomerID = C.CustomerID ORDER BY NEWID()), (SELECT TOP 1 PetID FROM Pet ORDER BY NEWID())),
    CASE ABS(CHECKSUM(NEWID())) % 2 WHEN 0 THEN 'CheckHealth' ELSE 'Vaccination' END,
    
    -- Ngày hẹn (RequestedDateTime)
    T.RequestedDate,
    
    -- Trạng thái (Status)
    T.RndStatus,
    N'Khách đặt lịch 2026',
    
    -- Ngày tạo (CreatedAt): Luôn trước ngày hẹn từ 1-7 ngày
    DATEADD(DAY, -(ABS(CHECKSUM(NEWID())) % 7 + 1), T.RequestedDate) 
FROM B
JOIN Customer C ON C.CustomerID = B.CustID
CROSS APPLY (
    SELECT 
        -- Random trạng thái
        CASE ABS(CHECKSUM(NEWID())) % 4 
            WHEN 0 THEN 'Pending' WHEN 1 THEN 'Confirmed' WHEN 2 THEN 'Completed' ELSE 'Cancelled' 
        END AS RndStatus,
        -- Tính toán ngày hẹn dựa trên trạng thái
        CASE 
            WHEN ABS(CHECKSUM(NEWID())) % 4 IN (2, 3) -- Completed hoặc Cancelled
                THEN DATEADD(DAY, -(ABS(CHECKSUM(NEWID())) % 30), GETDATE()) -- Trong 30 ngày qua
            ELSE DATEADD(DAY, (ABS(CHECKSUM(NEWID())) % 60), GETDATE()) -- Trong 60 ngày tới
        END AS RequestedDate
) T;
GO
--Dữ liệu BookingHistory
;WITH BH AS (
    SELECT TOP (600000)
        ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS rn,
        (SELECT TOP 1 BookingID FROM Booking ORDER BY NEWID()) AS BookingID
    FROM master..spt_values a CROSS JOIN master..spt_values b
)
INSERT INTO BookingHistory (BookingID, ActionType, OldDateTime, NewDateTime, OldStatus, NewStatus, Notes, Timestamp)
SELECT 
    B.BookingID,
    'UPDATE_STATUS',
    DATEADD(HOUR, -2, RequestedDateTime),
    RequestedDateTime,
    'Pending',
    Status,
    N'Cập nhật trạng thái tự động',
    GETDATE()
FROM (SELECT TOP 600000 BookingID, RequestedDateTime, Status FROM Booking ORDER BY NEWID()) B;
GO
--CHeckHealth
DECLARE @StartTime DATETIME = GETDATE();
DECLARE @StartDate DATE = DATEADD(YEAR, -2, GETDATE());
DECLARE @EndDate DATE = GETDATE();
DECLARE @DayRange INT = DATEDIFF(DAY, @StartDate, @EndDate);
DECLARE @MinDoctorId INT = 2, @MaxDoctorId INT = 10;

-- 30 Symptoms
DECLARE @Symptoms TABLE (Id INT PRIMARY KEY, Txt NVARCHAR(255));
INSERT INTO @Symptoms VALUES
(1,N'Khám định kỳ, không triệu chứng'),(2,N'Ho khan, sổ mũi'),(3,N'Ho có đờm, khó thở'),
(4,N'Ngứa, rụng lông'),(5,N'Tiêu chảy, phân lỏng'),(6,N'Nôn mửa sau ăn'),
(7,N'Ăn kém, sụt cân'),(8,N'Đau chân, khập khễnh'),(9,N'Chảy máu lợi, hôi miệng'),
(10,N'Mắt đỏ, chảy nước mắt'),(11,N'Ngứa liên tục, phát ban'),(12,N'Thở khò khè, ho nhiều'),
(13,N'Uống nhiều nước'),(14,N'Gãi tai, có mùi hôi'),(15,N'Sốt cao 39-40°C'),
(16,N'Sưng bụng, khó thở'),(17,N'Yếu ớt, không đứng được'),(18,N'Tái khám sau điều trị'),
(19,N'Kiểm tra sau phẫu thuật'),(20,N'Tiêm phòng định kỳ'),(21,N'Chích vaccine'),
(22,N'Triệt sản'),(23,N'Vết thương hở, chảy máu'),(24,N'Run, co giật'),
(25,N'Bồn chồn, kêu thét'),(26,N'Khó thở, thở nhanh'),(27,N'Da khô, nứt nẻ'),
(28,N'Răng lung lay'),(29,N'Mệt mỏi, ngủ nhiều'),(30,N'Sốt nhẹ, lả lơi');

-- 30 Diagnoses
DECLARE @Diagnoses TABLE (Id INT PRIMARY KEY, Txt NVARCHAR(255));
INSERT INTO @Diagnoses VALUES
(1,N'Sức khỏe tốt'),(2,N'Viêm đường hô hấp trên'),(3,N'Viêm phổi nhẹ'),
(4,N'Viêm da do nấm'),(5,N'Rối loạn tiêu hóa cấp'),(6,N'Viêm dạ dày ruột'),
(7,N'Bong gân cấp độ 1'),(8,N'Viêm nha chu'),(9,N'Viêm kết mạc mắt'),
(10,N'Dị ứng thức ăn'),(11,N'Nhiễm trùng hô hấp'),(12,N'Suy thận mãn tính'),
(13,N'Viêm tai ngoài'),(14,N'Sốt virus'),(15,N'Suy dinh dưỡng'),
(16,N'Chấn thương nhẹ'),(17,N'Đã hồi phục hoàn toàn'),(18,N'Đang hồi phục tốt'),
(19,N'Khỏi bệnh'),(20,N'Cần theo dõi thêm'),(21,N'Viêm khớp thoái hóa'),
(22,N'Ghẻ demodex'),(23,N'Nhiễm ký sinh trùng'),(24,N'Gãy xương'),
(25,N'Loét giác mạc'),(26,N'Viêm bàng quang'),(27,N'Cảm lạnh thông thường'),
(28,N'Thiếu vitamin'),(29,N'Nhiễm trùng vết thương'),(30,N'Thai kỳ bình thường');

-- 30 Prescription parts
DECLARE @Meds TABLE (Id INT PRIMARY KEY, Txt NVARCHAR(255));
INSERT INTO @Meds VALUES
(1,N'Amoxicillin 250mg'),(2,N'Cephalexin 500mg'),(3,N'Doxycycline 100mg'),
(4,N'Meloxicam giảm đau'),(5,N'Probiotic'),(6,N'Vitamin B complex'),
(7,N'Ketoconazole cream'),(8,N'Thuốc nhỏ mắt'),(9,N'Thuốc nhỏ tai Otomax'),
(10,N'Tắm thuốc Chlorhexidine'),(11,N'Thuốc tẩy giun'),(12,N'Vaccine Rabies'),
(13,N'Bù nước điện giải'),(14,N'Nghỉ ngơi 2 tuần'),(15,N'Hạn chế vận động'),
(16,N'Đeo phễu bảo vệ'),(17,N'Băng bó vết thương'),(18,N'Xét nghiệm máu'),
(19,N'Lấy cao răng'),(20,N'Thức ăn đặc biệt'),(21,N'Prednisone 5mg'),
(22,N'Metronidazole 250mg'),(23,N'Vitamin C 500mg'),(24,N'Thuốc mỡ mắt'),
(25,N'Shampoo chữa nấm'),(26,N'X-quang ngực'),(27,N'Siêu âm bụng'),
(28,N'Theo dõi thân nhiệt'),(29,N'Cho ăn thức ăn mềm'),(30,N'Khâu vết thương');

-- Generate records using index-based selection (NO ORDER BY NEWID!)
WITH PetWithRandom AS (
    SELECT 
        PetID,
        1 + (ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % 3) AS NumRecords, -- 1-3 records
        ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % 2147483647 AS Seed1,
        ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % 2147483647 AS Seed2,
        ABS(CAST(CHECKSUM(NEWID()) AS BIGINT)) % 2147483647 AS Seed3
    FROM Pet
),
Numbers AS (
    SELECT 1 AS N UNION ALL SELECT 2 UNION ALL SELECT 3
),
ExpandedRecords AS (
    SELECT 
        p.PetID,
        n.N AS RecordNum,
        p.Seed1,
        p.Seed2,
        p.Seed3,
        ROW_NUMBER() OVER (ORDER BY p.PetID, n.N) AS RowNum
    FROM PetWithRandom p
    CROSS JOIN Numbers n
    WHERE n.N <= p.NumRecords
)
INSERT INTO CheckHealth (PetID, DoctorID, CheckDate, Symptoms, Diagnosis, Prescription, FollowUpDate)
SELECT 
    e.PetID,
    @MinDoctorId + ((e.Seed1 + e.RowNum) % (@MaxDoctorId - @MinDoctorId + 1)) AS DoctorID,
    DATEADD(DAY, -(e.Seed2 % @DayRange), @EndDate) AS CheckDate,
    s.Txt AS Symptoms,
    d.Txt AS Diagnosis,
    m1.Txt + 
        CASE WHEN (e.Seed3 % 10) < 6 THEN ' + ' + m2.Txt ELSE '' END AS Prescription,
    CASE WHEN ((e.Seed1 + e.Seed2) % 10) < 4 
        THEN DATEADD(DAY, 7 + ((e.Seed3 % 54)), DATEADD(DAY, -(e.Seed2 % @DayRange), @EndDate))
        ELSE NULL 
    END AS FollowUpDate
FROM ExpandedRecords e
INNER JOIN @Symptoms s ON s.Id = 1 + ((e.RowNum + e.Seed1) % 30)
INNER JOIN @Diagnoses d ON d.Id = 1 + ((e.RowNum + e.Seed2) % 30)
INNER JOIN @Meds m1 ON m1.Id = 1 + ((e.RowNum + e.Seed3) % 30)
INNER JOIN @Meds m2 ON m2.Id = 1 + ((e.RowNum + e.Seed3 + 7) % 30);
--VaccineRecord
;WITH VR AS (
    SELECT TOP (400000)
        ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS rn
    FROM master..spt_values a CROSS JOIN master..spt_values b
)
INSERT INTO VaccineRecord
(PetID, VaccineID, BranchID, DoctorID, InvoiceItemID, Dose, DateAdministered, NextDueDate)
SELECT
    (SELECT TOP 1 PetID FROM Pet ORDER BY NEWID()),
    (SELECT TOP 1 VaccineID FROM Vaccine ORDER BY NEWID()),
    ABS(CHECKSUM(NEWID())) % 20 + 1,
    (SELECT TOP 1 EmployeeID FROM Employee WHERE PositionID = 1 ORDER BY NEWID()),
    (SELECT TOP 1 InvoiceItemID FROM InvoiceItem ORDER BY NEWID()),
    CAST((ABS(CHECKSUM(NEWID())) % 5) + 1 AS DECIMAL(6,2)),

    -- Ngày tiêm: Trải dài trong 1 năm qua
    DATEADD(MINUTE, -ABS(CHECKSUM(NEWID())) % 100000, GETDATE()) AS DateAdministered,
	DATEADD(DAY, (ABS(CHECKSUM(NEWID())) % 180) + 30, GETDATE()) AS NextDueDate
FROM VR;
GO
--ServiceVaccination
;WITH SV AS (
    SELECT TOP (100000)
        ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS rn
    FROM master..spt_values a 
    CROSS JOIN master..spt_values b
)
INSERT INTO ServiceVaccination (VaccineID, Date, StandardDose)
SELECT 
    V.VaccineID,   -- Random VaccineID đúng cách
    DATEADD(
        DAY,
        ABS(CHECKSUM(NEWID())) % DATEDIFF(DAY, '2023-01-01', GETDATE()),
        '2023-01-01'
    ) AS Date,
    (ABS(CHECKSUM(NEWID())) % 5) + 1 AS StandardDose
FROM SV
CROSS APPLY (
    SELECT TOP 1 VaccineID 
    FROM Vaccine 
    ORDER BY NEWID()
) AS V;
GO
--VaccinePackageItem
INSERT INTO VaccinePackageItem (PackageID, VaccineID, RelativeMonth, Dose)
SELECT 
    P.PackageID,
    V.VaccineID,
    (ABS(CHECKSUM(NEWID())) % P.DurationMonths) + 1,
    V.StandardDose
FROM VaccinePackage P
CROSS JOIN Vaccine V;
GO

---account---
-- A. Tạo tài khoản cho TOÀN BỘ Nhân viên (1,000 nhân viên)
-- Username: tên không dấu + ID nhân viên (để tránh trùng lặp)
-- Password mặc định: '123456'
INSERT INTO Account (Username, PasswordHash, Role, EmployeeID)
SELECT 
    LOWER(REPLACE(dbo.RemoveVietnameseAccent(FullName), ' ', '')) + CAST(EmployeeID AS VARCHAR),
    'e10adc3949ba59abbe56e057f20f883e', -- MD5 của '123456'
    'EMPLOYEE',  -- Tất cả nhân viên có role là EMPLOYEE, vị trí thực tế dựa vào PositionID
    EmployeeID
FROM Employee;
GO

-- B. Tạo tài khoản cho TOÀN BỘ Khách hàng (70,000 khách hàng)
-- Username: Sử dụng số điện thoại (Phone) làm tên đăng nhập
-- Password mặc định: '123456'
INSERT INTO Account (Username, PasswordHash, Role, CustomerID)
SELECT 
    Phone, 
    'e10adc3949ba59abbe56e057f20f883e',
    'CUSTOMER',
    CustomerID
FROM Customer;
GO


-- Trigger cho bảng Employee
CREATE OR ALTER TRIGGER trg_Employee_CreateAccount
ON Employee
AFTER INSERT
AS
BEGIN
    -- Chỉ tạo tài khoản nếu EmployeeID đó chưa có trong bảng Account
    INSERT INTO Account (Username, PasswordHash, Role, EmployeeID)
    SELECT 
        LOWER(REPLACE(dbo.RemoveVietnameseAccent(i.FullName), ' ', '')) + CAST(i.EmployeeID AS VARCHAR),
        'e10adc3949ba59abbe56e057f20f883e',
        'EMPLOYEE',  -- Tất cả nhân viên có role là EMPLOYEE, vị trí thực tế dựa vào PositionID
        i.EmployeeID
    FROM inserted i
    WHERE NOT EXISTS (SELECT 1 FROM Account WHERE EmployeeID = i.EmployeeID);
END;
GO

-- Trigger cho bảng Customer
CREATE OR ALTER TRIGGER trg_Customer_CreateAccount
ON Customer
AFTER INSERT
AS
BEGIN
    INSERT INTO Account (Username, PasswordHash, Role, CustomerID)
    SELECT 
        i.Phone,
        'e10adc3949ba59abbe56e057f20f883e',
        'CUSTOMER',
        i.CustomerID
    FROM inserted i
    WHERE NOT EXISTS (SELECT 1 FROM Account WHERE CustomerID = i.CustomerID);
END;
GO


-- Thủ tục đăng nhập trả về thông tin người dùng
-- CHÈN VÀO SAU KHI TẠO BẢNG ACCOUNT --

-- 1. Thủ tục Đăng nhập (Bản nâng cấp)
CREATE PROC sp_Account_Login
    @Username VARCHAR(50),
    @PasswordHash VARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM Account WHERE Username = @Username AND PasswordHash = @PasswordHash AND IsActive = 1)
    BEGIN
        SELECT 
            A.AccountID, A.Username, A.Role,
            ISNULL(E.FullName, C.FullName) AS DisplayName,
            A.EmployeeID, A.CustomerID,
            ISNULL(E.BranchID, 0) AS BranchID,
            E.PositionID
        FROM Account A
        LEFT JOIN Employee E ON A.EmployeeID = E.EmployeeID
        LEFT JOIN Customer C ON A.CustomerID = C.CustomerID
        WHERE A.Username = @Username AND A.PasswordHash = @PasswordHash;
    END
    ELSE
    BEGIN
        RAISERROR(N'Tài khoản không chính xác hoặc đã bị khóa', 16, 1);
    END
END;
GO

-- 2. Thủ tục Khóa/Mở tài khoản (Thay vì xóa)
CREATE PROC sp_Account_ToggleStatus
    @AccountID INT,
    @Status BIT
AS
BEGIN
    UPDATE Account SET IsActive = @Status WHERE AccountID = @AccountID;
END;
GO

-- 3. Thủ tục Reset mật khẩu (Dành cho Admin)
CREATE PROC sp_Account_ResetPassword
    @AccountID INT,
    @NewPasswordHash VARCHAR(255) = 'e10adc3949ba59abbe56e057f20f883e' -- Mặc định là '123456'
AS
BEGIN
    UPDATE Account SET PasswordHash = @NewPasswordHash WHERE AccountID = @AccountID;
    PRINT N'Mật khẩu đã được reset về mặc định';
END;
GO

--------------------------------------CRUD-----------------------------------------
----------Create Vaccine------------------
CREATE PROC sp_Vaccine_Create
@Type NVARCHAR(50),
@Description NVARCHAR(255),
@StandardDose DECIMAL(6,2)
AS
IF EXISTS (SELECT 1 FROM Vaccine WHERE Type=@Type)
BEGIN
    RAISERROR(N'Vắc-xin đã tồn tại',16,1)
    RETURN
END
INSERT INTO Vaccine(Type,Description,StandardDose)
VALUES(@Type,@Description,@StandardDose)
GO

----------Update Vaccine------------------
CREATE PROC sp_Vaccine_Update
@VaccineID INT,
@Type NVARCHAR(50),
@Description NVARCHAR(255),
@StandardDose DECIMAL(6,2)
AS
IF NOT EXISTS (SELECT 1 FROM Vaccine WHERE VaccineID=@VaccineID)
BEGIN
    RAISERROR(N'Vắc-xin không tồn tại',16,1)
    RETURN
END
UPDATE Vaccine
SET Type=@Type, Description=@Description, StandardDose=@StandardDose
WHERE VaccineID=@VaccineID
GO

----------Delete Vaccine------------------
CREATE PROC sp_Vaccine_Delete
@VaccineID INT
AS
IF NOT EXISTS (SELECT 1 FROM Vaccine WHERE VaccineID=@VaccineID)
BEGIN
    RAISERROR(N'Vắc-xin không tồn tại',16,1)
    RETURN
END
IF EXISTS (
    SELECT 1 FROM VaccineRecord WHERE VaccineID=@VaccineID
)
BEGIN
    RAISERROR(N'Không thể xóa vắc-xin đã được sử dụng',16,1)
    RETURN
END
DELETE FROM Vaccine WHERE VaccineID=@VaccineID
GO

-----------GetAll Vaccine-----------------
CREATE PROC sp_Vaccine_GetAll
AS
SELECT * FROM Vaccine
GO

----------Create VaccinePackage-------------
CREATE PROC sp_VaccinePackage_Create
@Name NVARCHAR(100),
@DurationMonths INT,
@Price DECIMAL(14,2),
@DiscountPercent DECIMAL(5,2),
@Item NVARCHAR(255)
AS
IF EXISTS (SELECT 1 FROM VaccinePackage WHERE Name=@Name)
BEGIN
    RAISERROR(N'Gói tiêm đã tồn tại',16,1)
    RETURN
END
INSERT INTO VaccinePackage
VALUES(@Name,@DurationMonths,@Price,@DiscountPercent,@Item)
GO

----------Update VaccinePackage-------------
CREATE PROC sp_VaccinePackage_Update
@PackageID INT,
@Name NVARCHAR(100),
@DurationMonths INT,
@Price DECIMAL(14,2),
@DiscountPercent DECIMAL(5,2),
@Item NVARCHAR(255)
AS
IF NOT EXISTS (SELECT 1 FROM VaccinePackage WHERE PackageID=@PackageID)
BEGIN
    RAISERROR(N'Gói tiêm không tồn tại',16,1)
    RETURN
END
UPDATE VaccinePackage
SET Name=@Name,
    DurationMonths=@DurationMonths,
    Price=@Price,
    DiscountPercent=@DiscountPercent,
    Item=@Item
WHERE PackageID=@PackageID
GO

----------Delete VaccinePackage-------------
CREATE PROC sp_VaccinePackage_Delete
@PackageID INT
AS
IF NOT EXISTS (SELECT 1 FROM VaccinePackage WHERE PackageID=@PackageID)
BEGIN
    RAISERROR(N'Gói tiêm không tồn tại',16,1)
    RETURN
END
IF EXISTS (
    SELECT 1 FROM VaccinePackageItem WHERE PackageID=@PackageID
)
BEGIN
    RAISERROR(N'Không thể xóa gói tiêm đã có vắc-xin',16,1)
    RETURN
END
DELETE FROM VaccinePackage WHERE PackageID=@PackageID
GO

----------Add VaccinePackageItem------------
CREATE PROC sp_VaccinePackageItem_Add
@PackageID INT,
@VaccineID INT,
@RelativeMonth INT,
@Dose DECIMAL(6,2)
AS
IF NOT EXISTS (SELECT 1 FROM VaccinePackage WHERE PackageID=@PackageID)
   OR NOT EXISTS (SELECT 1 FROM Vaccine WHERE VaccineID=@VaccineID)
BEGIN
    RAISERROR(N'Gói tiêm hoặc vắc-xin không tồn tại',16,1)
    RETURN
END
INSERT INTO VaccinePackageItem
VALUES(@PackageID,@VaccineID,@RelativeMonth,@Dose)
GO

----------Update VaccinePackageItem---------
CREATE PROC sp_VaccinePackageItem_Update
@PackageID INT,
@VaccineID INT,
@RelativeMonth INT,
@Dose DECIMAL(6,2)
AS
IF NOT EXISTS (
    SELECT 1 FROM VaccinePackageItem
    WHERE PackageID=@PackageID AND VaccineID=@VaccineID
)
BEGIN
    RAISERROR(N'Chi tiết gói tiêm không tồn tại',16,1)
    RETURN
END
UPDATE VaccinePackageItem
SET RelativeMonth=@RelativeMonth,
    Dose=@Dose
WHERE PackageID=@PackageID AND VaccineID=@VaccineID
GO

----------Delete VaccinePackageItem---------
CREATE PROC sp_VaccinePackageItem_Delete
@PackageID INT,
@VaccineID INT
AS
IF NOT EXISTS (
    SELECT 1 FROM VaccinePackageItem
    WHERE PackageID=@PackageID AND VaccineID=@VaccineID
)
BEGIN
    RAISERROR(N'Chi tiết gói tiêm không tồn tại',16,1)
    RETURN
END
DELETE FROM VaccinePackageItem
WHERE PackageID=@PackageID AND VaccineID=@VaccineID
GO

----------Create Branch---------------------
CREATE PROC sp_Branch_Create
@BranchID INT,
@Name NVARCHAR(100),
@Phone VARCHAR(20),
@OpenTime TIME,
@CloseTime TIME,
@Address NVARCHAR(255)
AS
IF EXISTS (SELECT 1 FROM Branch WHERE BranchID=@BranchID)
BEGIN
    RAISERROR(N'Chi nhánh đã tồn tại',16,1)
    RETURN
END
INSERT INTO Branch
VALUES(@BranchID,@Name,@Phone,@OpenTime,@CloseTime,@Address)
GO

----------Update Branch---------------------
CREATE PROC sp_Branch_Update
@BranchID INT,
@Phone VARCHAR(20),
@OpenTime TIME,
@CloseTime TIME,
@Address NVARCHAR(255)
AS
IF NOT EXISTS (SELECT 1 FROM Branch WHERE BranchID=@BranchID)
BEGIN
    RAISERROR(N'Chi nhánh không tồn tại',16,1)
    RETURN
END
UPDATE Branch
SET Phone=@Phone,
    OpenTime=@OpenTime,
    CloseTime=@CloseTime,
    Address=@Address
WHERE BranchID=@BranchID
GO

----------Delete Branch---------------------
CREATE PROC sp_Branch_Delete
@BranchID INT
AS
IF EXISTS (SELECT 1 FROM Employee WHERE BranchID=@BranchID)
BEGIN
    RAISERROR(N'Chi nhánh còn nhân viên',16,1)
    RETURN
END
DELETE FROM Branch WHERE BranchID=@BranchID
GO

----------Create Position-------------------
CREATE PROC sp_Position_Create
@Name NVARCHAR(100),
@Description NVARCHAR(255)
AS
IF EXISTS (SELECT 1 FROM Position WHERE Name=@Name)
BEGIN
    RAISERROR(N'Vị trí đã tồn tại',16,1)
    RETURN
END
INSERT INTO Position(Name,Description)
VALUES(@Name,@Description)
GO
----------Update Position-------------------
CREATE PROC sp_Position_Update
@PositionID INT,
@Description NVARCHAR(255)
AS
IF NOT EXISTS (SELECT 1 FROM Position WHERE PositionID=@PositionID)
BEGIN
    RAISERROR(N'Vị trí không tồn tại',16,1)
    RETURN
END
UPDATE Position
SET Description=@Description
WHERE PositionID=@PositionID
GO

----------Delete Position-------------------
CREATE PROC sp_Position_Delete
@PositionID INT
AS
IF EXISTS (SELECT 1 FROM Employee WHERE PositionID=@PositionID)
BEGIN
    RAISERROR(N'Không thể xóa vị trí đang được sử dụng',16,1)
    RETURN
END
DELETE FROM Position WHERE PositionID=@PositionID
GO

----------Create Employee-------------------
CREATE PROC sp_Employee_Create
@BranchID INT,
@PositionID INT,
@FullName NVARCHAR(150),
@BirthDate DATE,
@Gender NVARCHAR(10),
@HireDate DATE,
@BaseSalary DECIMAL(14,2)
AS
IF NOT EXISTS (SELECT 1 FROM Branch WHERE BranchID=@BranchID)
   OR NOT EXISTS (SELECT 1 FROM Position WHERE PositionID=@PositionID)
BEGIN
    RAISERROR(N'Chi nhánh hoặc vị trí không tồn tại',16,1)
    RETURN
END
INSERT INTO Employee
VALUES(@BranchID,@PositionID,@FullName,@BirthDate,@Gender,@HireDate,@BaseSalary)
GO

----------Delete Employee-------------------
CREATE PROC sp_Employee_Delete
@EmployeeID INT
AS
IF EXISTS (SELECT 1 FROM Invoice WHERE EmployeeID=@EmployeeID)
BEGIN
    RAISERROR(N'Nhân viên đã phát sinh hóa đơn',16,1)
    RETURN
END
DELETE FROM Employee WHERE EmployeeID=@EmployeeID
GO

----------Create MembershipTier-------------
CREATE PROC sp_MembershipTier_Create
@Name NVARCHAR(50),
@MinSpend DECIMAL(14,2),
@MaintainSpend DECIMAL(14,2),
@Benefits NVARCHAR(255)
AS
IF EXISTS (SELECT 1 FROM MembershipTier WHERE Name=@Name)
BEGIN
    RAISERROR(N'Hạng hội viên đã tồn tại',16,1)
    RETURN
END
INSERT INTO MembershipTier
VALUES(@Name,@MinSpend,@MaintainSpend,@Benefits)
GO

----------Update MembershipTier-------------
CREATE PROC sp_MembershipTier_Update
@MembershipTierID INT,
@MinSpend DECIMAL(14,2),
@MaintainSpend DECIMAL(14,2),
@Benefits NVARCHAR(255)
AS
IF NOT EXISTS (SELECT 1 FROM MembershipTier WHERE MembershipTierID=@MembershipTierID)
BEGIN
    RAISERROR(N'Hạng hội viên không tồn tại',16,1)
    RETURN
END
UPDATE MembershipTier
SET MinSpend=@MinSpend,
    MaintainSpend=@MaintainSpend,
    Benefits=@Benefits
WHERE MembershipTierID=@MembershipTierID
GO

----------Delete MembershipTier-------------
CREATE PROC sp_MembershipTier_Delete
@MembershipTierID INT
AS
IF EXISTS (SELECT 1 FROM Customer WHERE MembershipTierID=@MembershipTierID)
BEGIN
    RAISERROR(N'Hạng hội viên đang được sử dụng',16,1)
    RETURN
END
DELETE FROM MembershipTier WHERE MembershipTierID=@MembershipTierID
GO

----------Create Pet------------------------
CREATE PROC sp_Pet_Create
@CustomerID INT,
@Name NVARCHAR(100),
@Species NVARCHAR(50),
@Breed NVARCHAR(100),
@BirthDate DATE,
@Gender CHAR(1),
@Status NVARCHAR(50)
AS
IF NOT EXISTS (SELECT 1 FROM Customer WHERE CustomerID=@CustomerID)
BEGIN
    RAISERROR(N'Khách hàng không tồn tại',16,1)
    RETURN
END
INSERT INTO Pet
VALUES(@CustomerID,@Name,@Species,@Breed,@BirthDate,@Gender,@Status)
GO

----------Update Pet------------------------
CREATE PROC sp_Pet_Update
@PetID INT,
@Breed NVARCHAR(100),
@Status NVARCHAR(50)
AS
IF NOT EXISTS (SELECT 1 FROM Pet WHERE PetID=@PetID)
BEGIN
    RAISERROR(N'Thú cưng không tồn tại',16,1)
    RETURN
END
UPDATE Pet
SET Breed=@Breed,
    Status=@Status
WHERE PetID=@PetID
GO

----------Delete Pet------------------------
CREATE PROC sp_Pet_Delete
@PetID INT
AS
IF EXISTS (SELECT 1 FROM CheckHealth WHERE PetID=@PetID)
   OR EXISTS (SELECT 1 FROM VaccineRecord WHERE PetID=@PetID)
BEGIN
    RAISERROR(N'Không thể xóa thú cưng đã phát sinh dịch vụ',16,1)
    RETURN
END
DELETE FROM Pet WHERE PetID=@PetID
GO

----------Create Invoice--------------------
CREATE PROC sp_Invoice_Create
@BranchID INT,
@CustomerID INT,
@EmployeeID INT,
@PetID INT,
@TotalAmount DECIMAL(14,2),
@PaymentMethod NVARCHAR(20)
AS
IF NOT EXISTS (SELECT 1 FROM Branch WHERE BranchID=@BranchID)
   OR NOT EXISTS (SELECT 1 FROM Customer WHERE CustomerID=@CustomerID)
   OR NOT EXISTS (SELECT 1 FROM Employee WHERE EmployeeID=@EmployeeID)
BEGIN
    RAISERROR(N'Dữ liệu hóa đơn không hợp lệ',16,1)
    RETURN
END
INSERT INTO Invoice
(BranchID,CustomerID,EmployeeID,PetID,TotalAmount,PaymentMethod)
VALUES(@BranchID,@CustomerID,@EmployeeID,@PetID,@TotalAmount,@PaymentMethod)
GO

----------Delete Invoice--------------------
CREATE PROC sp_Invoice_Delete
@InvoiceID INT
AS
IF NOT EXISTS (SELECT 1 FROM Invoice WHERE InvoiceID=@InvoiceID)
BEGIN
    RAISERROR(N'Hóa đơn không tồn tại',16,1)
    RETURN
END
DELETE FROM Invoice WHERE InvoiceID=@InvoiceID
GO

------------Add InvoiceItem-------------------
CREATE PROC sp_InvoiceItem_Add
    @InvoiceID  INT,
    @ItemType   NVARCHAR(20),
    @ProductID  INT = NULL,
    @ServiceID  INT = NULL,
    @Quantity   INT,
    @UnitPrice  DECIMAL(14,2)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Invoice WHERE InvoiceID = @InvoiceID)
    BEGIN
        RAISERROR(N'Hoa don khong ton tai', 16, 1);
        RETURN;
    END

    IF @ItemType NOT IN ('PRODUCT','SERVICE')
    BEGIN
        RAISERROR(N'ItemType chi nhan PRODUCT hoac SERVICE', 16, 1);
        RETURN;
    END

    IF @Quantity <= 0 OR @UnitPrice <= 0
    BEGIN
        RAISERROR(N'Quantity/UnitPrice phai > 0', 16, 1);
        RETURN;
    END

    -- EP DUNG "ExactlyOne"
    IF @ItemType = 'PRODUCT'
    BEGIN
        IF @ProductID IS NULL OR @ServiceID IS NOT NULL
        BEGIN
            RAISERROR(N'PRODUCT: can ProductID va ServiceID phai NULL', 16, 1);
            RETURN;
        END
        -- @ServiceID da NULL dung luat
    END
    ELSE -- SERVICE
    BEGIN
        IF @ServiceID IS NULL OR @ProductID IS NOT NULL
        BEGIN
            RAISERROR(N'SERVICE: can ServiceID va ProductID phai NULL', 16, 1);
            RETURN;
        END
        -- @ProductID da NULL dung luat
    END

    INSERT INTO InvoiceItem(InvoiceID, ItemType, ProductID, ServiceID, Quantity, UnitPrice)
    VALUES(@InvoiceID, @ItemType, @ProductID, @ServiceID, @Quantity, @UnitPrice);
END
GO

----------Update InvoiceItem----------------
CREATE PROC sp_InvoiceItem_Update
@InvoiceItemID INT,
@Quantity INT,
@UnitPrice DECIMAL(14,2)
AS
IF NOT EXISTS (SELECT 1 FROM InvoiceItem WHERE InvoiceItemID=@InvoiceItemID)
BEGIN
    RAISERROR(N'Dòng hóa đơn không tồn tại',16,1)
    RETURN
END
UPDATE InvoiceItem
SET Quantity=@Quantity,
    UnitPrice=@UnitPrice
WHERE InvoiceItemID=@InvoiceItemID
GO

----------Delete InvoiceItem----------------
CREATE PROC sp_InvoiceItem_Delete
@InvoiceItemID INT
AS
IF NOT EXISTS (SELECT 1 FROM InvoiceItem WHERE InvoiceItemID=@InvoiceItemID)
BEGIN
    RAISERROR(N'Dòng hóa đơn không tồn tại',16,1)
    RETURN
END
DELETE FROM InvoiceItem WHERE InvoiceItemID=@InvoiceItemID
GO

----------Create Booking--------------------
CREATE PROC sp_Booking_Create
@CustomerID INT,
@PetID INT,
@BranchID INT = NULL,
@BookingType NVARCHAR(50),
@RequestedDateTime DATETIME,
@Status NVARCHAR(20),
@Notes NVARCHAR(255)
AS
IF NOT EXISTS (SELECT 1 FROM Customer WHERE CustomerID=@CustomerID)
   OR NOT EXISTS (SELECT 1 FROM Pet WHERE PetID=@PetID)
BEGIN
    RAISERROR(N'Khách hàng hoặc thú cưng không tồn tại',16,1)
    RETURN
END

-- Determine BranchID if not provided
DECLARE @FinalBranchID INT;
IF @BranchID IS NOT NULL
BEGIN
    SET @FinalBranchID = @BranchID;
END
ELSE
BEGIN
    -- Get customer's last invoiced branch
    SELECT TOP 1 @FinalBranchID = BranchID
    FROM Invoice
    WHERE CustomerID = @CustomerID
    ORDER BY InvoiceDate DESC;
    
    -- If customer has no invoices, use first branch as default
    IF @FinalBranchID IS NULL
    BEGIN
        SELECT TOP 1 @FinalBranchID = BranchID FROM Branch ORDER BY BranchID;
    END
    
    -- If still no branch, use 1 as fallback
    IF @FinalBranchID IS NULL
    BEGIN
        SET @FinalBranchID = 1;
    END
END

INSERT INTO Booking
(CustomerID,PetID,BranchID,BookingType,RequestedDateTime,Status,Notes)
VALUES(@CustomerID,@PetID,@FinalBranchID,@BookingType,@RequestedDateTime,@Status,@Notes)
GO

----------Update Booking--------------------
CREATE PROC sp_Booking_UpdateStatus
@BookingID INT,
@Status NVARCHAR(20)
AS
IF NOT EXISTS (SELECT 1 FROM Booking WHERE BookingID=@BookingID)
BEGIN
    RAISERROR(N'Lịch hẹn không tồn tại',16,1)
    RETURN
END
UPDATE Booking
SET Status=@Status
WHERE BookingID=@BookingID
GO

----------Delete Booking--------------------
CREATE PROC sp_Booking_Delete
@BookingID INT
AS
IF NOT EXISTS (SELECT 1 FROM Booking WHERE BookingID=@BookingID)
BEGIN
    RAISERROR(N'Lịch hẹn không tồn tại',16,1)
    RETURN
END
DELETE FROM Booking WHERE BookingID=@BookingID
GO

----------Create Review---------------------
CREATE PROC sp_Review_Create
@CustomerID INT,
@BranchID INT,
@EmployeeID INT,
@RatingServiceQuality TINYINT,
@RatingStaffAttitude TINYINT,
@RatingOverall TINYINT,
@Comment NVARCHAR(500)
AS
IF NOT EXISTS (SELECT 1 FROM Customer WHERE CustomerID=@CustomerID)
BEGIN
    RAISERROR(N'Khách hàng không tồn tại',16,1)
    RETURN
END
INSERT INTO Review
(CustomerID,BranchID,EmployeeID,RatingServiceQuality,
 RatingStaffAttitude,RatingOverall,Comment)
VALUES
(@CustomerID,@BranchID,@EmployeeID,@RatingServiceQuality,
 @RatingStaffAttitude,@RatingOverall,@Comment)
GO

----------Update Review---------------------
CREATE PROC sp_Review_Update
@ReviewID INT,
@RatingServiceQuality TINYINT,
@RatingStaffAttitude TINYINT,
@RatingOverall TINYINT,
@Comment NVARCHAR(500)
AS
IF NOT EXISTS (SELECT 1 FROM Review WHERE ReviewID=@ReviewID)
BEGIN
    RAISERROR(N'Đánh giá không tồn tại',16,1)
    RETURN
END
UPDATE Review
SET RatingServiceQuality=@RatingServiceQuality,
    RatingStaffAttitude=@RatingStaffAttitude,
    RatingOverall=@RatingOverall,
    Comment=@Comment
WHERE ReviewID=@ReviewID
GO
----------Delete Review---------------------
CREATE PROC sp_Review_Delete
@ReviewID INT
AS
IF NOT EXISTS (SELECT 1 FROM Review WHERE ReviewID=@ReviewID)
BEGIN
    RAISERROR(N'Đánh giá không tồn tại',16,1)
    RETURN
END
DELETE FROM Review WHERE ReviewID=@ReviewID
GO

----------Update VaccineBatch---------------
CREATE PROC sp_VaccineBatch_Update
@BatchID INT,
@Quantity INT
AS
IF NOT EXISTS (SELECT 1 FROM VaccineBatch WHERE BatchID=@BatchID)
BEGIN
    RAISERROR(N'Lô vắc-xin không tồn tại',16,1)
    RETURN
END
UPDATE VaccineBatch
SET Quantity=@Quantity
WHERE BatchID=@BatchID
GO
----------Delete VaccineBatch---------------
CREATE PROC sp_VaccineBatch_Delete
    @BatchID INT
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Batch tồn tại?
    IF NOT EXISTS (
        SELECT 1 FROM VaccineBatch WHERE BatchID = @BatchID
    )
    BEGIN
        RAISERROR(N'Lô vắc-xin không tồn tại',16,1);
        RETURN;
    END

    -- 2. Đã từng được sử dụng?
    IF EXISTS (
        SELECT 1
        FROM VaccineRecord vr
        JOIN VaccineBatch vb
            ON vr.VaccineID = vb.VaccineID
           AND vr.BranchID  = vb.BranchID
        WHERE vb.BatchID = @BatchID
    )
    BEGIN
        RAISERROR(N'Không thể xóa lô vắc-xin đã được sử dụng',16,1);
        RETURN;
    END

    -- 3. Còn tồn kho?
    IF EXISTS (
        SELECT 1
        FROM VaccineBatch
        WHERE BatchID = @BatchID
          AND Quantity > 0
    )
    BEGIN
        RAISERROR(N'Không thể xóa lô vắc-xin còn tồn kho',16,1);
        RETURN;
    END

    -- 4. OK → xóa
    DELETE FROM VaccineBatch WHERE BatchID = @BatchID;
END
GO
----------Update CheckHealth----------------
CREATE PROC sp_CheckHealth_Update
@CheckID INT,
@Diagnosis NVARCHAR(255),
@Prescription NVARCHAR(255),
@FollowUpDate DATETIME
AS
IF NOT EXISTS (SELECT 1 FROM CheckHealth WHERE CheckID=@CheckID)
BEGIN
    RAISERROR(N'Hồ sơ khám không tồn tại',16,1)
    RETURN
END
UPDATE CheckHealth
SET Diagnosis=@Diagnosis,
    Prescription=@Prescription,
    FollowUpDate=@FollowUpDate
WHERE CheckID=@CheckID
GO

----------Update VaccineRecord--------------
CREATE PROC sp_VaccineRecord_Update
@VaccinationRecordID INT,
@NextDueDate DATE
AS
IF NOT EXISTS (SELECT 1 FROM VaccineRecord WHERE VaccinationRecordID=@VaccinationRecordID)
BEGIN
    RAISERROR(N'Lịch sử tiêm không tồn tại',16,1)
    RETURN
END
UPDATE VaccineRecord
SET NextDueDate=@NextDueDate
WHERE VaccinationRecordID=@VaccinationRecordID
GO
/*============================================================
  Tên: sp_Customer_Create
  Chức năng: Thêm mới khách hàng vào hệ thống
  Mô tả:
    - Tạo khách hàng mới
    - Kiểm tra trùng Phone hoặc CCCD
    - Điểm và chi tiêu khởi tạo = 0
  Bảng tác động: Customer
============================================================*/
CREATE PROC sp_Customer_Create
@MembershipTierID INT,
@FullName NVARCHAR(100),
@Phone VARCHAR(15),
@Email VARCHAR(100),
@CCCD VARCHAR(12),
@Gender CHAR(1),
@BirthDate DATE
AS
BEGIN
    IF EXISTS (
        SELECT 1 FROM Customer 
        WHERE Phone = @Phone OR CCCD = @CCCD
    )
    BEGIN
        RAISERROR(N'Khách hàng đã tồn tại',16,1)
        RETURN
    END
    INSERT INTO Customer
    (MembershipTierID, FullName, Phone, Email, CCCD, Gender, BirthDate)
    VALUES
    (@MembershipTierID, @FullName, @Phone, @Email, @CCCD, @Gender, @BirthDate)
END
GO
/*============================================================
  Tên: sp_Customer_Update
  Chức năng: Cập nhật thông tin khách hàng
  Mô tả:
    - Cho phép cập nhật thông tin cơ bản
    - Không cho sửa Phone / CCCD (định danh)
  Bảng tác động: Customer
============================================================*/
CREATE PROC sp_Customer_Update
@CustomerID INT,
@FullName NVARCHAR(100),
@Email VARCHAR(100),
@Gender CHAR(1)
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Customer WHERE CustomerID = @CustomerID)
    BEGIN
        RAISERROR(N'Khách hàng không tồn tại',16,1)
        RETURN
    END

    UPDATE Customer
    SET FullName = @FullName,
        Email = @Email,
        Gender = @Gender
    WHERE CustomerID = @CustomerID
END
GO
/*============================================================
  Tên: sp_Customer_Delete
  Chức năng: Xóa khách hàng
  Mô tả:
    - Chỉ cho phép xóa khách hàng chưa phát sinh hóa đơn
  Bảng tác động: Customer, Invoice
============================================================*/
CREATE PROC sp_Customer_Delete
@CustomerID INT
AS
BEGIN
    IF EXISTS (SELECT 1 FROM Invoice WHERE CustomerID = @CustomerID)
    BEGIN
        RAISERROR(N'Khách hàng đã phát sinh hóa đơn',16,1)
        RETURN
    END

    DELETE FROM Customer WHERE CustomerID = @CustomerID
END
GO


--------------------------------------------------------------------------------------------------------------
----------------------------TRIGGER-------------------------------------------------------------------------
----------Trigger: trg_InvoiceItem_UpdateProductStock----------
-- Chức năng: Tự động trừ tồn kho sản phẩm khi bán
-- Kích hoạt khi: INSERT InvoiceItem
-- Điều kiện: ItemType = 'PRODUCT'
-- Bảng tác động: Product
CREATE OR ALTER TRIGGER trg_InvoiceItem_UpdateProductStock
ON InvoiceItem
AFTER INSERT
AS
BEGIN
    UPDATE p
    SET p.StockQty = p.StockQty - i.Quantity
    FROM Product p
    JOIN inserted i ON p.ProductID = i.ProductID
    WHERE i.ItemType = 'PRODUCT';

    IF EXISTS (SELECT 1 FROM Product WHERE StockQty < 0)
    BEGIN
        RAISERROR(N'Tồn kho sản phẩm không đủ',16,1);
        ROLLBACK;
    END
END
GO

----------Trigger: trg_Product_PreventNegativeStock------------
-- Chức năng: Ngăn tồn kho sản phẩm bị âm
-- Kích hoạt khi: UPDATE Product
-- Bảng tác động: Product
CREATE TRIGGER trg_Product_PreventNegativeStock
ON Product
AFTER UPDATE
AS
IF EXISTS (SELECT 1 FROM inserted WHERE StockQty < 0)
BEGIN
    ROLLBACK
END
GO

-------------------------------------------------------------------
CREATE OR ALTER TRIGGER trg_VaccineRecord_Insert_FEFO
ON VaccineRecord
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    /* 1. Kiểm tra tồn kho đủ */
    IF EXISTS (
        SELECT 1
        FROM (
            SELECT VaccineID, BranchID, SUM(CAST(Dose AS DECIMAL(10,2))) AS Need
            FROM inserted
            GROUP BY VaccineID, BranchID
        ) d
        JOIN (
            SELECT VaccineID, BranchID, SUM(Quantity) AS Stock
            FROM VaccineBatch
            GROUP BY VaccineID, BranchID
        ) s
          ON d.VaccineID = s.VaccineID
         AND d.BranchID  = s.BranchID
        WHERE d.Need > s.Stock
    )
    BEGIN
        RAISERROR(N'Không đủ tồn kho vắc-xin',16,1);
        ROLLBACK;
        RETURN;
    END

    /* 2. Kiểm tra batch FEFO có bị hết hạn */
    IF EXISTS (
        SELECT 1
        FROM inserted i
        CROSS APPLY (
            SELECT TOP 1 vb.ExpiryDate
            FROM VaccineBatch vb
            WHERE vb.VaccineID = i.VaccineID
              AND vb.BranchID  = i.BranchID
              AND vb.Quantity > 0
            ORDER BY vb.ExpiryDate
        ) b
        WHERE b.ExpiryDate < CAST(i.DateAdministered AS DATE)
    )
    BEGIN
        RAISERROR(N'Không thể tiêm vắc-xin đã hết hạn',16,1);
        ROLLBACK;
        RETURN;
    END

    /* 3. Trừ kho theo FEFO */
    ;WITH UsedDose AS (
        SELECT VaccineID, BranchID, SUM(CAST(Dose AS DECIMAL(10,2))) AS TotalDose
        FROM inserted
        GROUP BY VaccineID, BranchID
    ),
    FEFO AS (
        SELECT
            vb.BatchID,
            vb.VaccineID,
            vb.BranchID,
            vb.Quantity,
            SUM(vb.Quantity) OVER (
                PARTITION BY vb.VaccineID, vb.BranchID
                ORDER BY vb.ExpiryDate
            ) AS CumQty
        FROM VaccineBatch vb
        JOIN UsedDose u
          ON vb.VaccineID = u.VaccineID
         AND vb.BranchID  = u.BranchID
    )
    UPDATE vb
    SET vb.Quantity =
        CASE
            WHEN f.CumQty <= u.TotalDose THEN 0
            WHEN f.CumQty - vb.Quantity >= u.TotalDose THEN vb.Quantity
            ELSE CAST(f.CumQty - u.TotalDose AS INT)
        END
    FROM VaccineBatch vb
    JOIN FEFO f ON vb.BatchID = f.BatchID
    JOIN UsedDose u
      ON f.VaccineID = u.VaccineID
     AND f.BranchID  = u.BranchID;
END
GO
----------Trigger: trg_Invoice_UpdateLoyalty-------------------
-- Chức năng: Cộng điểm loyalty khi thanh toán hóa đơn
-- Quy tắc: 1 điểm = 50.000 VNĐ
-- Kích hoạt khi: INSERT Invoice
-- Bảng tác động: Customer, LoyaltyTransaction
CREATE TRIGGER trg_Invoice_UpdateLoyalty
ON Invoice
AFTER INSERT
AS
BEGIN
    UPDATE C
    SET
        C.TotalYearlySpend = C.TotalYearlySpend + X.Amount,
        C.PointsBalance   = C.PointsBalance + X.Points
    FROM Customer C
    JOIN (
        SELECT 
            CustomerID,
            SUM(FinalAmount) AS Amount,
            SUM(CAST(FinalAmount / 50000 AS INT)) AS Points
        FROM inserted
        GROUP BY CustomerID
    ) X ON C.CustomerID = X.CustomerID

    INSERT INTO LoyaltyTransaction
    (CustomerID, InvoiceID, PointsChange, Reason)
    SELECT
        CustomerID,
        InvoiceID,
        CAST(FinalAmount / 50000 AS INT),
        N'Thanh toán hóa đơn'
    FROM inserted
    WHERE CAST(FinalAmount / 50000 AS INT) > 0  -- Only insert if points > 0
END
GO
/*============================================================
  Tên: trg_InvoiceItem_UpdateInvoiceTotal
  Chức năng: Tự động cập nhật tổng tiền hóa đơn
  Mô tả:
    - Kích hoạt khi thêm/sửa/xóa InvoiceItem
    - Tính lại TotalAmount của Invoice
  Bảng tác động: Invoice, InvoiceItem
============================================================*/
CREATE TRIGGER trg_InvoiceItem_UpdateInvoiceTotal
ON InvoiceItem
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    UPDATE I
    SET TotalAmount = ISNULL(T.Total, 0)
    FROM Invoice I
    LEFT JOIN (
        SELECT InvoiceID, SUM(Quantity * UnitPrice) AS Total
        FROM InvoiceItem
        GROUP BY InvoiceID
    ) T ON I.InvoiceID = T.InvoiceID
    WHERE I.InvoiceID IN (
        SELECT InvoiceID FROM inserted
        UNION
        SELECT InvoiceID FROM deleted
    )
END
GO
----------Trigger: trg_Customer_UpdateMembershipTier-----------
-- Chức năng: Tự động cập nhật hạng hội viên theo chi tiêu
-- Kích hoạt khi: UPDATE Customer
-- Bảng tác động: Customer
CREATE OR ALTER TRIGGER trg_Customer_UpdateMembershipTier
ON Customer
AFTER UPDATE
AS
BEGIN
    UPDATE c
    SET c.MembershipTierID =
    (
        SELECT TOP 1 MembershipTierID
        FROM MembershipTier
        WHERE i.TotalYearlySpend >= MinSpend
        ORDER BY MinSpend DESC
    )
    FROM Customer c
    JOIN inserted i ON c.CustomerID = i.CustomerID;
END
GO

/*============================================================
  Tên: trg_Booking_UpdateHistory
  Chức năng: Ghi lịch sử thay đổi booking
  Mô tả:
    - Chỉ ghi log khi thay đổi Status hoặc RequestedDateTime
    - Phân biệt UPDATE_STATUS / RESCHEDULE
  Bảng tác động: BookingHistory
============================================================*/
CREATE TRIGGER trg_Booking_UpdateHistory
ON Booking
AFTER UPDATE
AS
BEGIN
    -- Thay đổi trạng thái
    INSERT INTO BookingHistory
    (BookingID, ActionType, OldStatus, NewStatus)
    SELECT
        d.BookingID,
        'UPDATE_STATUS',
        d.Status,
        i.Status
    FROM deleted d
    JOIN inserted i ON d.BookingID = i.BookingID
    WHERE d.Status <> i.Status

    -- Thay đổi thời gian
    INSERT INTO BookingHistory
    (BookingID, ActionType, OldDateTime, NewDateTime)
    SELECT
        d.BookingID,
        'RESCHEDULE',
        d.RequestedDateTime,
        i.RequestedDateTime
    FROM deleted d
    JOIN inserted i ON d.BookingID = i.BookingID
    WHERE d.RequestedDateTime <> i.RequestedDateTime
END
GO
----------Trigger: trg_Employee_InsertHistory------------------
-- Chức năng: Ghi nhận chi nhánh đầu tiên của nhân viên
-- Kích hoạt khi: INSERT Employee
-- Bảng tác động: EmployeeHistory
CREATE OR ALTER TRIGGER trg_Employee_InsertHistory
ON Employee
AFTER INSERT
AS
BEGIN
    INSERT INTO EmployeeHistory(EmployeeID, BranchID, StartDate)
    SELECT i.EmployeeID, i.BranchID, i.HireDate
    FROM inserted i
    WHERE NOT EXISTS (
        SELECT 1
        FROM EmployeeHistory eh
        WHERE eh.EmployeeID = i.EmployeeID
          AND eh.BranchID   = i.BranchID
          AND eh.StartDate  = i.HireDate
    );
END
GO


/*============================================================
  Tên: sp_Revenue_ByBranch_Month
  Chức năng: Thống kê doanh thu chi nhánh theo tháng
  Mô tả:
    - Dùng cho dashboard quản lý
    - Phục vụ phân tích index & execution plan
  Bảng tác động: Invoice
============================================================*/
CREATE PROC sp_Revenue_ByBranch_Month
@Year INT
AS
BEGIN
    SELECT
        BranchID,
        MONTH(InvoiceDate) AS Thang,
        SUM(FinalAmount) AS DoanhThu
    FROM Invoice
    WHERE YEAR(InvoiceDate) = @Year
    GROUP BY BranchID, MONTH(InvoiceDate)
    ORDER BY BranchID, Thang
END
GO
/*============================================================
  Tên: sp_Pet_VaccineHistory
  Chức năng: Tra cứu lịch sử tiêm phòng của thú cưng
  Mô tả:
    - Dùng cho bác sĩ & chăm sóc khách hàng
  Bảng tác động: VaccineRecord, Vaccine
============================================================*/
CREATE PROC sp_Pet_VaccineHistory
@PetID INT
AS
BEGIN
    SELECT
        vr.DateAdministered,
        v.Type AS VaccineName,
        vr.Dose,
        vr.NextDueDate
    FROM VaccineRecord vr
    JOIN Vaccine v ON vr.VaccineID = v.VaccineID
    WHERE vr.PetID = @PetID
    ORDER BY vr.DateAdministered DESC
END
GO
CREATE PROC sp_Pet_CheckHealthHistory
@PetID INT
AS
BEGIN
    SELECT
        ch.CheckDate,
        e.FullName AS DoctorName,
        ch.Symptoms,
        ch.Diagnosis,
        ch.Prescription,
        ch.FollowUpDate
    FROM CheckHealth ch
    JOIN Employee e ON ch.DoctorID = e.EmployeeID
    WHERE ch.PetID = @PetID
    ORDER BY ch.CheckDate DESC
END
GO
/*============================================================
  Tên: sp_Customer_Delete
  Chức năng: Xóa khách hàng
  Mô tả:
    - Không cho xóa nếu đã phát sinh nghiệp vụ
  Bảng tác động: Customer
============================================================*/
ALTER PROC sp_Customer_Delete
@CustomerID INT
AS
BEGIN
    IF EXISTS (SELECT 1 FROM Pet WHERE CustomerID = @CustomerID)
       OR EXISTS (SELECT 1 FROM Invoice WHERE CustomerID = @CustomerID)
       OR EXISTS (SELECT 1 FROM Review WHERE CustomerID = @CustomerID)
    BEGIN
        RAISERROR(N'Không thể xóa khách hàng đã phát sinh nghiệp vụ',16,1)
        RETURN
    END

    DELETE FROM Customer WHERE CustomerID = @CustomerID
END
GO
-- ============================================================
-- IDX_Employee_BranchID
-- Mục đích:
--   Tối ưu truy vấn tra cứu danh sách nhân viên theo chi nhánh.
-- Truy vấn sử dụng:
--   SELECT EmployeeID, FullName, PositionID, HireDate
--   FROM Employee
--   WHERE BranchID = @BranchID
-- Lý do thiết kế:
--   - BranchID là điều kiện lọc chính (WHERE)
--   - INCLUDE các cột thường xuyên hiển thị để tránh Key Lookup
-- Hiệu quả:
--   - Giảm Clustered Index Scan → Index Seek
--   - Giảm Logical Reads trong kịch bản KB1
-- ============================================================
CREATE NONCLUSTERED INDEX IDX_Employee_BranchID
ON Employee (BranchID)
INCLUDE (FullName, PositionID, HireDate);
GO
-- ============================================================
-- IDX_EmployeeHistory_EmployeeID
-- Mục đích:
--   Tối ưu truy vấn xem lịch sử điều động của 1 nhân viên.
-- Truy vấn sử dụng:
--   SELECT BranchID, StartDate, EndDate
--   FROM EmployeeHistory
--   WHERE EmployeeID = @EmployeeID
--   ORDER BY StartDate DESC
-- Lý do thiết kế:
--   - EmployeeID dùng để lọc
--   - StartDate DESC phục vụ ORDER BY
-- Hiệu quả:
--   - Tránh Sort tốn chi phí
--   - Giảm IO khi lịch sử lớn
-- ============================================================
CREATE NONCLUSTERED INDEX IDX_EmployeeHistory_EmployeeID
ON EmployeeHistory (EmployeeID, StartDate DESC);
GO
-- ============================================================
-- IDX_BranchService_BranchID
-- Mục đích:
--   Tối ưu truy vấn lấy danh sách dịch vụ đang hoạt động
--   theo từng chi nhánh.
-- Truy vấn sử dụng:
--   SELECT ...
--   FROM BranchService
--   WHERE BranchID = @BranchID AND Active = 1
-- Lý do thiết kế:
--   - Composite index (BranchID, Active) đúng thứ tự lọc
--   - INCLUDE ServiceID, Price để join và hiển thị nhanh
-- Hiệu quả:
--   - Index Seek thay cho Table Scan
--   - Tăng tốc load màn hình dịch vụ chi nhánh
-- ============================================================
CREATE NONCLUSTERED INDEX IDX_BranchService_BranchID
ON BranchService (BranchID, Active)
INCLUDE (ServiceID, Price);
GO
-- ============================================================
-- IDX_VaccineBatch_Branch_Expiry
-- Mục đích:
--   Tối ưu truy vấn tra cứu tồn kho vaccine còn hạn
--   theo từng chi nhánh.
-- Truy vấn sử dụng:
--   WHERE BranchID = @BranchID
--     AND ExpiryDate > GETDATE()
-- Lý do thiết kế:
--   - BranchID lọc theo chi nhánh
--   - ExpiryDate lọc vaccine còn sử dụng được
--   - INCLUDE Quantity để hiển thị tồn kho
-- Hiệu quả:
--   - Tránh quét toàn bảng VaccineBatch
--   - Hữu ích cho quản lý kho & cảnh báo hết hạn
-- ============================================================
CREATE NONCLUSTERED INDEX IDX_VaccineBatch_Branch_Expiry
ON VaccineBatch (BranchID, ExpiryDate)
INCLUDE (VaccineID, Quantity);
GO
-- ============================================================
-- IDX_Customer_Phone
-- Mục đích:
--   Tối ưu tra cứu khách hàng theo số điện thoại (đăng nhập).
-- Truy vấn sử dụng:
--   SELECT ... FROM Customer WHERE Phone = @Phone
-- Lý do thiết kế:
--   - Phone có tính duy nhất (UNIQUE)
--   - Là khóa tìm kiếm chính trong hệ thống
-- Hiệu quả:
--   - Index Seek thay cho Clustered Scan
--   - Đăng nhập và tra cứu khách cực nhanh
-- ============================================================
CREATE UNIQUE INDEX IDX_Customer_Phone
ON Customer(Phone)
INCLUDE (FullName, PointsBalance);
GO
-- ============================================================
-- IDX_Pet_CustomerID
-- Mục đích:
--   Tối ưu truy vấn lấy danh sách thú cưng của 1 khách hàng.
-- Truy vấn sử dụng:
--   SELECT ... FROM Pet WHERE CustomerID = @CustomerID
-- Lý do thiết kế:
--   - CustomerID là khóa ngoại lọc chính
--   - INCLUDE các cột hiển thị trong UI
-- Hiệu quả:
--   - Index Seek
--   - Load danh sách pet nhanh khi đặt lịch
-- ============================================================
CREATE NONCLUSTERED INDEX IDX_Pet_CustomerID
ON Pet(CustomerID)
INCLUDE (Name, Species, Breed, Status);
GO
-- ============================================================
-- IDX_Invoice_EmployeeID_InvoiceDate
-- Mục đích:
--   Tối ưu truy vấn lấy hóa đơn gần nhất theo nhân viên.
-- Truy vấn sử dụng:
--   WHERE EmployeeID = @EmployeeID
--   ORDER BY InvoiceDate DESC
-- Lý do thiết kế:
--   - Composite index đúng thứ tự lọc & sắp xếp
--   - INCLUDE thông tin hiển thị
-- Hiệu quả:
--   - Tránh Sort
--   - Tăng tốc load lịch sử hóa đơn
-- ============================================================
CREATE NONCLUSTERED INDEX IDX_Invoice_EmployeeID_InvoiceDate
ON Invoice(EmployeeID, InvoiceDate DESC)
INCLUDE (BranchID, CustomerID, TotalAmount, DiscountAmount, PaymentMethod);
GO
-- ============================================================
-- IDX_InvoiceItem_InvoiceID
-- Mục đích:
--   Tối ưu truy vấn xem chi tiết hóa đơn.
-- Truy vấn sử dụng:
--   SELECT ... FROM InvoiceItem WHERE InvoiceID = @InvoiceID
-- Lý do thiết kế:
--   - InvoiceID là khóa liên kết chính
-- Hiệu quả:
--   - Index Seek
--   - Load chi tiết hóa đơn nhanh
-- ============================================================
CREATE NONCLUSTERED INDEX IDX_InvoiceItem_InvoiceID
ON InvoiceItem(InvoiceID)
INCLUDE (ItemType, ProductID, ServiceID, Quantity, UnitPrice);
GO
-- ============================================================
-- IDX_Invoice_Branch_Date
-- Mục đích:
--   Tối ưu thống kê doanh thu theo chi nhánh và thời gian.
-- Truy vấn sử dụng:
--   WHERE BranchID = @BranchID
--     AND InvoiceDate BETWEEN @From AND @To
-- Lý do thiết kế:
--   - Composite index theo điều kiện lọc
-- Hiệu quả:
--   - Giảm IO đáng kể khi thống kê
-- ============================================================
CREATE NONCLUSTERED INDEX IDX_Invoice_Branch_Date
ON Invoice(BranchID, InvoiceDate)
INCLUDE (InvoiceID);
GO
-- ============================================================
-- IDX_CheckHealth_PetID_CheckDate
-- Mục đích:
--   Tối ưu xem lịch sử khám bệnh của thú cưng.
-- Truy vấn sử dụng:
--   WHERE PetID = @PetID
--   ORDER BY CheckDate DESC
-- ============================================================
CREATE NONCLUSTERED INDEX IDX_CheckHealth_PetID_CheckDate
ON CheckHealth(PetID, CheckDate DESC)
INCLUDE (DoctorID, Symptoms, Diagnosis, Prescription, FollowUpDate);
GO
-- ============================================================
-- IDX_VaccineRecord_PetID_DateAdministered
-- Mục đích:
--   Tối ưu xem lịch sử tiêm phòng của thú cưng.
-- Truy vấn sử dụng:
--   WHERE PetID = @PetID
--   ORDER BY DateAdministered DESC
-- ============================================================
CREATE NONCLUSTERED INDEX IDX_VaccineRecord_PetID_DateAdministered
ON VaccineRecord(PetID, DateAdministered DESC)
INCLUDE (VaccineID, DoctorID, Dose, NextDueDate, BranchID);
GO
-- ============================================================
-- usp_SearchProduct
-- Chức năng:
--   Khách hàng tìm kiếm sản phẩm theo tên hoặc loại.
-- Phục vụ demo:
--   Customer → tìm & đặt mua sản phẩm
-- ============================================================
CREATE PROCEDURE usp_SearchProduct
    @Keyword NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        ProductID,
        Name,
        Category,
        Price,
        StockQty
    FROM Product
    WHERE Name LIKE '%' + @Keyword + '%'
       OR Category LIKE '%' + @Keyword + '%';
END;
GO
-- ============================================================
-- usp_CreateBookingByStaff
-- Chức năng:
--   Nhân viên tạo lịch khám hoặc tiêm khi khách đến trực tiếp.
-- Giải thích:
--   - BookingType chỉ phản ánh loại dịch vụ: KHAM / TIEM
--   - Việc "đến trực tiếp" chỉ ghi chú, không ảnh hưởng schema
-- ============================================================
CREATE OR ALTER PROCEDURE usp_CreateBookingByStaff
    @CustomerID INT,
    @PetID INT,
    @BookingDate DATETIME,
    @BookingType NVARCHAR(10), -- 'KHAM' hoặc 'TIEM'
    @StaffID INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Validate BookingType
    IF @BookingType NOT IN ('CheckHealth', 'Vaccination')
    BEGIN
        RAISERROR(N'BookingType chỉ nhận KHAM hoặc TIEM', 16, 1);
        RETURN;
    END

    INSERT INTO Booking
    (CustomerID, PetID, BookingType, RequestedDateTime, Status, Notes)
    VALUES
    (
        @CustomerID,
        @PetID,
        @BookingType,
        @BookingDate,
        'Confirmed',
        N'Khách đến trực tiếp - tạo bởi nhân viên ID '
        + CAST(@StaffID AS NVARCHAR(10))
    );

    SELECT SCOPE_IDENTITY() AS NewBookingID;
END;
GO
-- ============================================================
-- usp_CreateBookingByCustomer
-- Chức năng:
--   Khách hàng đặt lịch khám hoặc tiêm phòng.
-- ============================================================
CREATE OR ALTER PROCEDURE usp_CreateBookingByCustomer
    @CustomerID INT,
    @PetID INT,
    @BookingDate DATETIME,
    @BookingType NVARCHAR(10), -- 'KHAM' hoặc 'TIEM'
    @BranchID INT = NULL -- Optional: specify branch, otherwise use customer's last invoiced branch
AS
BEGIN
    SET NOCOUNT ON;

    IF @BookingType NOT IN ('CheckHealth', 'Vaccination')
    BEGIN
        RAISERROR(N'BookingType không hợp lệ', 16, 1);
        RETURN;
    END

    -- Determine BranchID if not provided
    DECLARE @FinalBranchID INT;
    
    IF @BranchID IS NOT NULL
    BEGIN
        SET @FinalBranchID = @BranchID;
    END
    ELSE
    BEGIN
        -- Get customer's last invoiced branch
        SELECT TOP 1 @FinalBranchID = BranchID
        FROM Invoice
        WHERE CustomerID = @CustomerID
        ORDER BY InvoiceDate DESC;
        
        -- If customer has no invoices, use first branch as default
        IF @FinalBranchID IS NULL
        BEGIN
            SELECT TOP 1 @FinalBranchID = BranchID FROM Branch ORDER BY BranchID;
        END
        
        -- If still no branch, use 1 as fallback
        IF @FinalBranchID IS NULL
        BEGIN
            SET @FinalBranchID = 1;
        END
    END

    INSERT INTO Booking
    (CustomerID, PetID, BranchID, BookingType, RequestedDateTime, Status)
    VALUES
    (
        @CustomerID,
        @PetID,
        @FinalBranchID,
        @BookingType,
        @BookingDate,
        'Pending'
    );

    SELECT SCOPE_IDENTITY() AS NewBookingID;
END;
GO
-- ============================================================
-- usp_FindPetByCustomerPhone
-- Chức năng:
--   Nhân viên tra cứu thú cưng qua SĐT khách hàng.
-- Phục vụ demo:
--   Staff → xác định khách mới / khách cũ
-- ============================================================
CREATE PROCEDURE usp_FindPetByCustomerPhone
    @Phone VARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        C.CustomerID,
        C.FullName,
        P.PetID,
        P.Name AS PetName,
        P.Species,
        P.Breed
    FROM Customer C
    LEFT JOIN Pet P ON C.CustomerID = P.CustomerID
    WHERE C.Phone = @Phone;
END;
GO
-- ============================================================
-- usp_SearchMedicine
-- Chức năng:
--   Bác sĩ tra cứu thuốc đang bán trong hệ thống.
-- Phục vụ demo:
--   Doctor → kê toa
-- ============================================================
CREATE PROCEDURE usp_SearchMedicine
    @Keyword NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT ProductID, Name, Price, StockQty
    FROM Product
    WHERE Category = 'MEDICINE'
      AND Name LIKE '%' + @Keyword + '%';
END;
GO
-- ============================================================
-- usp_GetDoctorRevenue
-- Chức năng:
--   Thống kê doanh thu theo từng bác sĩ.
-- Phục vụ demo:
--   Manager → đánh giá hiệu suất bác sĩ
-- ============================================================
CREATE PROCEDURE usp_GetDoctorRevenue
    @FromDate DATE,
    @ToDate DATE
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        E.EmployeeID,
        E.FullName,
        COUNT(I.InvoiceID) AS TotalInvoices,
        SUM(I.FinalAmount) AS TotalRevenue
    FROM Invoice I
    JOIN Employee E ON I.EmployeeID = E.EmployeeID
    WHERE I.InvoiceDate BETWEEN @FromDate AND @ToDate
    GROUP BY E.EmployeeID, E.FullName
    ORDER BY TotalRevenue DESC;
END;
GO
-- ============================================================
-- usp_GetVisitStatistics
-- Chức năng:
--   Thống kê số lượt khám trong khoảng thời gian.
-- Phục vụ demo:
--   Manager → báo cáo hoạt động phòng khám
-- ============================================================
CREATE PROCEDURE usp_GetVisitStatistics
    @FromDate DATE,
    @ToDate DATE
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        COUNT(*) AS TotalVisits
    FROM CheckHealth
    WHERE CheckDate BETWEEN @FromDate AND @ToDate;
END;
GO
-- ============================================================
-- usp_GetSystemRevenue
-- Chức năng:
--   Thống kê doanh thu toàn hệ thống theo thời gian.
-- Phục vụ demo:
--   Manager → báo cáo tổng
-- ============================================================
CREATE PROCEDURE usp_GetSystemRevenue
    @FromDate DATE,
    @ToDate DATE
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        SUM(FinalAmount) AS TotalSystemRevenue
    FROM Invoice
    WHERE InvoiceDate BETWEEN @FromDate AND @ToDate;
END;
GO
-- ============================================================
-- usp_GetPetMedicalHistory
-- Chức năng:
--   Xem toàn bộ lịch sử khám bệnh và tiêm phòng của 1 thú cưng.
-- Đối tượng dùng:
--   - Bác sĩ
--   - Khách hàng (chỉ xem pet của mình)
-- ============================================================
CREATE OR ALTER PROCEDURE usp_GetPetMedicalHistory
    @PetID INT
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Lịch sử khám bệnh
    SELECT
        'KHAM' AS RecordType,
        ch.CheckDate AS RecordDate,
        ch.Diagnosis,
        ch.Symptoms,
        ch.Prescription,
        ch.FollowUpDate,
        e.FullName AS DoctorName
    FROM CheckHealth ch
    JOIN Employee e ON ch.DoctorID = e.EmployeeID
    WHERE ch.PetID = @PetID

    UNION ALL

    -- 2. Lịch sử tiêm phòng
    SELECT
        'TIEM' AS RecordType,
        vr.DateAdministered AS RecordDate,
        v.Type AS Diagnosis,
        NULL AS Symptoms,
        CONCAT(N'Liều: ', vr.Dose) AS Prescription,
        vr.NextDueDate AS FollowUpDate,
        e.FullName AS DoctorName
    FROM VaccineRecord vr
    JOIN Vaccine v ON vr.VaccineID = v.VaccineID
    JOIN Employee e ON vr.DoctorID = e.EmployeeID
    WHERE vr.PetID = @PetID

    ORDER BY RecordDate DESC;
END;
GO
/*============================================================
  Tên: usp_FindAvailableDoctors
  Chức năng:
    - Nhân viên tìm bác sĩ đang TRỐNG lịch
    - Dùng để đăng ký lịch cho khách
  Logic:
    - Lấy tất cả bác sĩ của chi nhánh
    - Loại trừ bác sĩ đã có booking trùng giờ
============================================================*/
CREATE PROCEDURE usp_FindAvailableDoctors
    @BranchID INT,
    @RequestedDateTime DATETIME,
    @DurationMinutes INT = 30  -- mặc định 1 ca 30 phút
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @EndTime DATETIME =
        DATEADD(MINUTE, @DurationMinutes, @RequestedDateTime);

    SELECT
        E.EmployeeID AS DoctorID,
        E.FullName   AS DoctorName
    FROM Employee E
    WHERE E.PositionID = 1        -- Bác sĩ thú y
      AND E.BranchID = @BranchID
      AND NOT EXISTS (
          SELECT 1
          FROM Booking B
          WHERE B.Status IN ('Pending','Confirmed')
            AND B.RequestedDateTime < @EndTime
            AND DATEADD(MINUTE, @DurationMinutes, B.RequestedDateTime) > @RequestedDateTime
      )
    ORDER BY DoctorName;
END;
GO
/*============================================================
  Tên: usp_Pet_GetPurchaseHistory
  Chức năng: Xem chi tiết các sản phẩm/dịch vụ đã mua cho 1 thú cưng cụ thể
  Đối tượng dùng:
    - Khách hàng 
============================================================*/
CREATE OR ALTER PROCEDURE usp_Pet_GetPurchaseHistory
    @PetID INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        I.InvoiceDate,
        II.ItemType,
        ISNULL(P.Name, S.Name) AS ItemName,
        II.Quantity,
        II.UnitPrice,
        II.TotalPrice
    FROM Invoice I
    JOIN InvoiceItem II ON I.InvoiceID = II.InvoiceID
    LEFT JOIN Product P ON II.ProductID = P.ProductID
    LEFT JOIN Service S ON II.ServiceID = S.ServiceID
    WHERE I.PetID = @PetID
    ORDER BY I.InvoiceDate DESC;
END;
GO
/*============================================================
  Tên: usp_CheckHealth_Create
  Chức năng: Bác sĩ tạo bệnh án mới và kê toa
  Đối tượng dùng:
    - Bác sĩ
============================================================*/
CREATE OR ALTER PROCEDURE usp_CheckHealth_Create
    @PetID INT,
    @DoctorID INT,
    @Symptoms NVARCHAR(255),
    @Diagnosis NVARCHAR(255) = NULL,
    @Prescription NVARCHAR(255) = NULL,
    @FollowUpDate DATETIME = NULL,
    @BookingID INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Kiểm tra nhân viên có phải bác sĩ không (PositionID = 1)
    IF NOT EXISTS (SELECT 1 FROM Employee WHERE EmployeeID = @DoctorID AND PositionID = 1)
    BEGIN
        RAISERROR(N'Nhân viên thực hiện phải là Bác sĩ thú y', 16, 1);
        RETURN;
    END

    INSERT INTO CheckHealth (PetID, DoctorID, CheckDate, Symptoms, Diagnosis, Prescription, FollowUpDate)
    VALUES (@PetID, @DoctorID, GETDATE(), @Symptoms, @Diagnosis, @Prescription, @FollowUpDate);
    
    DECLARE @NewCheckID INT = SCOPE_IDENTITY();
    
    -- Cập nhật trạng thái booking thành 'Completed' nếu có BookingID
    IF @BookingID IS NOT NULL
    BEGIN
        UPDATE Booking 
        SET Status = 'Completed'
        WHERE BookingID = @BookingID;
    END
    
    SELECT @NewCheckID AS NewCheckID;
END;
GO
/*============================================================
  Tên: usp_FindAvailableDoctors
  Chức năng: Thống kê doanh thu bán sản phẩm theo loại
  Đối tượng dùng:
    - Quản lý
============================================================*/
CREATE OR ALTER PROCEDURE usp_GetProductRevenueByCategory
    @FromDate DATE,
    @ToDate DATE
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        P.Category,
        COUNT(II.InvoiceItemID) AS TotalSoldQuantity,
        SUM(II.TotalPrice) AS CategoryRevenue
    FROM InvoiceItem II
    JOIN Product P ON II.ProductID = P.ProductID
    JOIN Invoice I ON II.InvoiceID = I.InvoiceID
    WHERE II.ItemType = 'PRODUCT'
      AND I.InvoiceDate BETWEEN @FromDate AND @ToDate
    GROUP BY P.Category
    ORDER BY CategoryRevenue DESC;
END;
GO
/*============================================================
  Tên: usp_FindAvailableDoctors
  Chức năng: Thống kê doanh thu sản phẩm chạy nhất
  Đối tượng dùng:
    - Quản lý
============================================================*/
CREATE OR ALTER PROCEDURE usp_GetTopSellingProducts
    @Top INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    SELECT TOP (@Top)
        P.Name,
        P.Category,
        SUM(II.Quantity) AS TotalQuantity
    FROM InvoiceItem II
    JOIN Product P ON II.ProductID = P.ProductID
    WHERE II.ItemType = 'PRODUCT'
    GROUP BY P.ProductID, P.Name, P.Category
    ORDER BY TotalQuantity DESC;
END;
GO
/*============================================================
  Tên: usp_FindAvailableDoctors
  Chức năng: Xem lịch đã đặt của 1 bác sĩ trong ngày để khách tránh đặt trùng
  Đối tượng dùng:
	- Khách Hàng
============================================================*/
CREATE OR ALTER PROCEDURE usp_GetDoctorScheduleByDate
    @DoctorID INT,
    @Date DATE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Lấy lịch trình tương lai từ Booking (Pending/Confirmed)
    -- chỉ hiển thị lịch hẹn trong tương lai của bác sĩ
    
    SELECT 
        B.RequestedDateTime AS AppointmentTime,
        P.Name AS PetName,
        B.BookingType AS Activity
    FROM Booking B
    JOIN Pet P ON B.PetID = P.PetID
    WHERE B.DoctorID = @DoctorID 
      AND CAST(B.RequestedDateTime AS DATE) = @Date
      AND B.Status IN ('Pending', 'Confirmed')
      
    ORDER BY B.RequestedDateTime;
END;
GO

-- =============================================
-- Cập nhật TotalYearlySpend & PointsBalance với kiểm tra
-- =============================================
BEGIN TRY
    BEGIN TRANSACTION;
    
    -- Validate: Kiểm tra dữ liệu hóa đơn không hợp lệ
    IF EXISTS (
        SELECT 1 FROM Invoice 
        WHERE FinalAmount IS NULL OR FinalAmount < 0 OR CustomerID IS NULL
    )
    BEGIN
        RAISERROR(N'❌ Lỗi: Phát hiện Invoice không hợp lệ!', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
    
    UPDATE C
    SET TotalYearlySpend = ISNULL(T.Total, 0),
        PointsBalance = CAST(ISNULL(T.Total, 0) / 50000 AS INT)
    FROM Customer C
    LEFT JOIN (
        SELECT CustomerID, SUM(FinalAmount) AS Total 
        FROM Invoice 
        WHERE Status = 'Paid'
        GROUP BY CustomerID
    ) T ON C.CustomerID = T.CustomerID;
    
    -- Validate: Không được có giá trị âm
    IF EXISTS (SELECT 1 FROM Customer WHERE TotalYearlySpend < 0 OR PointsBalance < 0)
    BEGIN
        RAISERROR(N'❌ Lỗi: Phát hiện giá trị âm sau update!', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
    
    COMMIT TRANSACTION;
    PRINT N'✓ Cập nhật TotalYearlySpend & PointsBalance thành công';
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT N'❌ Lỗi: ' + ERROR_MESSAGE();
    THROW;
END CATCH
GO

/*============================================================
  Tên: usp_Customer_GetInvoiceHistory
  Chức năng:
    - Khách hàng xem lịch sử mua hàng
  Đối tượnng dùng:
    - Khách hàng 
============================================================*/
CREATE PROCEDURE usp_Customer_GetInvoiceHistory
    @CustomerID INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        I.InvoiceID,
        I.InvoiceDate,
        B.Name AS BranchName,
        I.TotalAmount,
        I.DiscountAmount,
        I.FinalAmount,
        I.PaymentMethod
    FROM Invoice I
    JOIN Branch B ON I.BranchID = B.BranchID
    WHERE I.CustomerID = @CustomerID
    ORDER BY I.InvoiceDate DESC;
END;
GO

/*============================================================
  Tên: usp_Customer_SearchProducts
  Chức năng::
    - Khách hàng tìm kiếm sản phẩm còn hàng
  Đối tượnng dùng:
    - Khách hàng 
============================================================*/
CREATE OR ALTER PROCEDURE usp_Customer_SearchProducts
    @Keyword NVARCHAR(100) = NULL,
    @Category NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        ProductID, Name, Category, Price, StockQty, Description
    FROM Product
    WHERE (@Keyword IS NULL OR Name LIKE '%' + @Keyword + '%')
      AND (@Category IS NULL OR Category = @Category)
      AND StockQty > 0 -- Chỉ hiển thị sản phẩm còn hàng
    ORDER BY Category, Name;
END;
GO

/*============================================================
  Tên: usp_Customer_PurchaseProduct
  Chức năng:
    - Khách hàng thực hiện mua sắm
  Mô tả:
    - Tạo hóa đơn và trừ kho sản phẩm
  Đối tượng dùng:
    - Khách hàng
============================================================*/
CREATE OR ALTER PROCEDURE usp_Customer_PurchaseProduct
    @CustomerID INT,
    @BranchID INT,
    @EmployeeID INT, -- Nhân viên hỗ trợ tại quầy
    @ProductID INT,
    @Quantity INT,
    @PaymentMethod NVARCHAR(20),
    @PetID INT = NULL -- Có thể gắn với 1 thú cưng cụ thể
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        -- 1. Kiểm tra tồn kho trước khi tạo hóa đơn
        DECLARE @AvailableStock INT;
        SELECT @AvailableStock = StockQty FROM Product WHERE ProductID = @ProductID;

        IF @AvailableStock < @Quantity
        BEGIN
            RAISERROR(N'Số lượng sản phẩm trong kho không đủ.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        -- 2. Lấy đơn giá sản phẩm hiện tại
        DECLARE @Price DECIMAL(14,2);
        SELECT @Price = Price FROM Product WHERE ProductID = @ProductID;
        
        -- 3. Khởi tạo hóa đơn
        INSERT INTO Invoice (BranchID, CustomerID, EmployeeID, PetID, TotalAmount, PaymentMethod)
        VALUES (@BranchID, @CustomerID, @EmployeeID, @PetID, @Price * @Quantity, @PaymentMethod);

        DECLARE @NewInvoiceID INT = SCOPE_IDENTITY();
        
        -- 4. Thêm sản phẩm vào chi tiết hóa đơn
        INSERT INTO InvoiceItem (InvoiceID, ItemType, ProductID, ServiceID, Quantity, UnitPrice)
        VALUES (@NewInvoiceID, 'PRODUCT', @ProductID, NULL, @Quantity, @Price);

        COMMIT TRANSACTION;
        PRINT N'Mua hàng thành công! Mã hóa đơn: ' + CAST(@NewInvoiceID AS NVARCHAR(10));
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        DECLARE @ErrorMsg NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMsg, 16, 1);
    END CATCH
END;
GO

/*============================================================
  Tên: usp_Staff_RegisterNewPet
  Chức năng: Nhân viên tiếp tân đăng ký thú cưng mới cho khách hàng
  Mô tả: 
    - Kiểm tra CustomerID có tồn tại không.
    - Kiểm tra tên thú cưng đã tồn tại với khách hàng này chưa.
    - Mặc định trạng thái ban đầu là 'Healthy'.
============================================================*/
CREATE OR ALTER PROCEDURE usp_Staff_RegisterNewPet
    @CustomerID INT,
    @PetName NVARCHAR(100),
    @Species NVARCHAR(50),
    @Breed NVARCHAR(100) = NULL,
    @BirthDate DATE = NULL,
    @Gender CHAR(1), -- 'M', 'F', 'U'
    @Status NVARCHAR(50) = N'Healthy'
AS
BEGIN
    SET NOCOUNT ON;
    
    -- 1. Kiểm tra khách hàng có tồn tại không
    IF NOT EXISTS (SELECT 1 FROM Customer WHERE CustomerID = @CustomerID)
    BEGIN
        RAISERROR(N'Khách hàng không tồn tại. Vui lòng đăng ký khách hàng trước.', 16, 1);
        RETURN;
    END

    -- 2. Kiểm tra trùng tên thú cưng của cùng một chủ (Dựa trên UQ_Pet_Customer_Name)
    IF EXISTS (SELECT 1 FROM Pet WHERE CustomerID = @CustomerID AND Name = @PetName)
    BEGIN
        RAISERROR(N'Khách hàng này đã đăng ký thú cưng có tên này rồi.', 16, 1);
        RETURN;
    END

    -- 3. Thêm mới thú cưng
    BEGIN TRY
        INSERT INTO Pet (CustomerID, Name, Species, Breed, BirthDate, Gender, Status)
        VALUES (@CustomerID, @PetName, @Species, @Breed, @BirthDate, @Gender, @Status);
        
        DECLARE @NewPetID INT = SCOPE_IDENTITY();
        PRINT N'Đã đăng ký thành công thú cưng mới. ID: ' + CAST(@NewPetID AS NVARCHAR(10));
        
        -- Trả về thông tin thú cưng vừa tạo để tiếp tân xác nhận
        SELECT * FROM Pet WHERE PetID = @NewPetID;
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMsg NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMsg, 16, 1);
    END CATCH
END;
GO

/*============================================================
  Tên: usp_Staff_CreateOrder
  Chức năng: Khởi tạo một đơn hàng mới (Trạng thái Pending)
============================================================*/
CREATE OR ALTER PROCEDURE usp_Staff_CreateOrder
    @BranchID INT,
    @CustomerID INT,
    @EmployeeID INT,
    @PetID INT = NULL,
    @PaymentMethod NVARCHAR(20) = 'CASH'
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO Invoice (BranchID, CustomerID, EmployeeID, PetID, InvoiceDate, TotalAmount, DiscountAmount, PaymentMethod, Status)
    VALUES (@BranchID, @CustomerID, @EmployeeID, @PetID, GETDATE(), 0.01, 0, @PaymentMethod, N'Pending');
    
    DECLARE @NewInvoiceID INT = SCOPE_IDENTITY();
    
    PRINT N'Đã khởi tạo đơn hàng số: ' + CAST(@NewInvoiceID AS NVARCHAR(10));
    SELECT @NewInvoiceID AS InvoiceID;
END;
GO

/*============================================================
  Tên: usp_Staff_AddItemToOrder
  Chức năng: Thêm món vào đơn hàng đang chờ (Pending)
============================================================*/
CREATE OR ALTER PROCEDURE usp_Staff_AddItemToOrder
    @InvoiceID INT,
    @ItemType NVARCHAR(20), -- 'PRODUCT' hoặc 'SERVICE'
    @ItemID INT,
    @Quantity INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Kiểm tra hóa đơn có đang ở trạng thái Pending không
    IF NOT EXISTS (SELECT 1 FROM Invoice WHERE InvoiceID = @InvoiceID AND Status = N'Pending')
    BEGIN
        RAISERROR(N'Đơn hàng đã thanh toán hoặc bị hủy, không thể thêm món.', 16, 1);
        RETURN;
    END

    DECLARE @UnitPrice DECIMAL(14,2);
    
    -- Lấy giá hiện tại
    IF @ItemType = 'PRODUCT'
        SELECT @UnitPrice = Price FROM Product WHERE ProductID = @ItemID;
    ELSE
        SELECT @UnitPrice = BasePrice FROM Service WHERE ServiceID = @ItemID;

    -- Thêm vào InvoiceItem (Trigger trg_InvoiceItem_UpdateInvoiceTotal sẽ tự tính lại tổng tiền Invoice)
    INSERT INTO InvoiceItem (InvoiceID, ItemType, ProductID, ServiceID, Quantity, UnitPrice)
    VALUES (@InvoiceID, @ItemType, 
            CASE WHEN @ItemType = 'PRODUCT' THEN @ItemID ELSE NULL END,
            CASE WHEN @ItemType = 'SERVICE' THEN @ItemID ELSE NULL END,
            @Quantity, @UnitPrice);
            
    PRINT N'Đã thêm mục vào đơn hàng.';
END;
GO

/*============================================================
  Tên: usp_Staff_ConfirmInvoice
  Chức năng: Xác nhận thanh toán hóa đơn
  Mô tả: 
    - Chuyển trạng thái sang Paid.
    - Áp dụng ưu đãi nếu cần (Logic giảm giá có thể thêm ở đây).
============================================================*/
CREATE OR ALTER PROCEDURE usp_Staff_ConfirmInvoice
    @InvoiceID INT,
    @PaymentMethod NVARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    IF NOT EXISTS (SELECT 1 FROM Invoice WHERE InvoiceID = @InvoiceID AND Status = N'Pending')
    BEGIN
        RAISERROR(N'Đơn hàng không ở trạng thái chờ xác nhận.', 16, 1);
        RETURN;
    END

    -- Cập nhật trạng thái và phương thức thanh toán cuối cùng
    UPDATE Invoice
    SET Status = N'Paid',
        PaymentMethod = ISNULL(@PaymentMethod, PaymentMethod),
        InvoiceDate = GETDATE()
    WHERE InvoiceID = @InvoiceID;

    -- Trigger trg_Invoice_UpdateLoyalty (đã có trong file x.sql) 
    -- sẽ tự động chạy sau lệnh UPDATE/INSERT để cộng điểm cho khách.

    PRINT N'Xác nhận hóa đơn thành công. Hóa đơn đã được quyết toán.';
    
    -- Trả về thông tin cuối cùng để in hóa đơn
    SELECT I.*, C.FullName AS CustomerName, E.FullName AS StaffName
    FROM Invoice I
    JOIN Customer C ON I.CustomerID = C.CustomerID
    JOIN Employee E ON I.EmployeeID = E.EmployeeID
    WHERE I.InvoiceID = @InvoiceID;
END;
GO

/*============================================================
  Tên: usp_Manager_GetBranchPerformance
  Chức năng: Thống kê doanh thu và lượt khách của 1 chi nhánh
============================================================*/
CREATE OR ALTER PROCEDURE usp_Manager_GetBranchPerformance
    @BranchID INT,
    @FromDate DATE,
    @ToDate DATE
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Tổng doanh thu chia theo loại (Sản phẩm / Dịch vụ)
    SELECT 
        II.ItemType,
        SUM(II.TotalPrice) AS Revenue,
        COUNT(DISTINCT I.InvoiceID) AS TotalInvoices
    FROM Invoice I
    JOIN InvoiceItem II ON I.InvoiceID = II.InvoiceID
    WHERE I.BranchID = @BranchID 
      AND CAST(I.InvoiceDate AS DATE) BETWEEN @FromDate AND @ToDate
      AND I.Status = N'Paid'
    GROUP BY II.ItemType;

    -- 2. Tổng số lượt khám bệnh (Visit counts)
    SELECT COUNT(*) AS TotalVisits
    FROM CheckHealth CH
    JOIN Employee E ON CH.DoctorID = E.EmployeeID
    WHERE E.BranchID = @BranchID
      AND CAST(CH.CheckDate AS DATE) BETWEEN @FromDate AND @ToDate;
END;
GO

/*============================================================
  Tên: usp_Manager_GetDoctorEfficiency
  Chức năng: Đánh giá hiệu suất bác sĩ tại chi nhánh
============================================================*/
CREATE OR ALTER PROCEDURE usp_Manager_GetDoctorEfficiency
    @BranchID INT
AS
BEGIN
    SELECT 
        E.FullName AS DoctorName,
        COUNT(CH.CheckID) AS TotalTreatments,
        (SELECT SUM(I.FinalAmount) 
         FROM Invoice I 
         WHERE I.EmployeeID = E.EmployeeID AND I.Status = N'Paid') AS TotalRevenueGenerated
    FROM Employee E
    LEFT JOIN CheckHealth CH ON E.EmployeeID = CH.DoctorID
    WHERE E.BranchID = @BranchID AND E.PositionID = 1 -- PositionID 1: Bác sĩ
    GROUP BY E.EmployeeID, E.FullName
    ORDER BY TotalTreatments DESC;
END;
GO

/*============================================================
  Tên: usp_BranchManager_MonthlyDetailedRevenue
  Chức năng: Báo cáo doanh thu chi tiết theo loại hình tại chi nhánh
============================================================*/
CREATE OR ALTER PROCEDURE usp_BranchManager_MonthlyDetailedRevenue
    @BranchID INT,
    @Month INT,
    @Year INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        II.ItemType AS [Loại hình],
        SUM(II.TotalPrice) AS [Tổng doanh thu],
        COUNT(II.InvoiceItemID) AS [Số lượng bán ra]
    FROM Invoice I
    JOIN InvoiceItem II ON I.InvoiceID = II.InvoiceID
    WHERE I.BranchID = @BranchID 
      AND MONTH(I.InvoiceDate) = @Month 
      AND YEAR(I.InvoiceDate) = @Year
    GROUP BY II.ItemType;
END;
GO

/*============================================================
  Tên: usp_BranchManager_ReviewSummary
  Chức năng: Thống kê điểm đánh giá trung bình tại chi nhánh
============================================================*/
CREATE OR ALTER PROCEDURE usp_BranchManager_ReviewSummary
    @BranchID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        AVG(CAST(RatingServiceQuality AS FLOAT)) AS [Điểm dịch vụ trung bình],
        AVG(CAST(RatingStaffAttitude AS FLOAT)) AS [Điểm thái độ trung bình],
        AVG(CAST(RatingOverall AS FLOAT)) AS [Điểm tổng thể trung bình],
        COUNT(ReviewID) AS [Tổng số lượt đánh giá]
    FROM Review
    WHERE BranchID = @BranchID;

    -- Hiển thị các bình luận tiêu cực (dưới 3 sao) để xử lý
    SELECT CustomerID, RatingOverall, Comment, CreatedAt
    FROM Review
    WHERE BranchID = @BranchID AND RatingOverall <= 3
    ORDER BY CreatedAt DESC;
END;
GO

/*============================================================
  Tên: usp_BranchManager_TopCustomers
  Chức năng: Lấy danh sách khách hàng VIP của chi nhánh
============================================================*/
CREATE OR ALTER PROCEDURE usp_BranchManager_TopCustomers
    @BranchID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP 10
        C.FullName AS [Tên khách hàng],
        C.Phone AS [Số điện thoại],
        SUM(I.FinalAmount) AS [Tổng chi tiêu tại chi nhánh],
        MT.Name AS [Hạng thành viên]
    FROM Customer C
    JOIN Invoice I ON C.CustomerID = I.CustomerID
    JOIN MembershipTier MT ON C.MembershipTierID = MT.MembershipTierID
    WHERE I.BranchID = @BranchID
    GROUP BY C.CustomerID, C.FullName, C.Phone, MT.Name
    ORDER BY [Tổng chi tiêu tại chi nhánh] DESC;
END;
GO

/*============================================================
  Tên: usp_Admin_GlobalRevenueDashboard
  Chức năng: So sánh doanh thu giữa các chi nhánh
============================================================*/
CREATE OR ALTER PROCEDURE usp_Admin_GlobalRevenueDashboard
    @Year INT
AS
BEGIN
    SELECT 
        B.Name AS BranchName,
        SUM(I.FinalAmount) AS YearlyRevenue,
        COUNT(I.InvoiceID) AS TotalTransactions
    FROM Branch B
    LEFT JOIN Invoice I ON B.BranchID = I.BranchID
    WHERE YEAR(I.InvoiceDate) = @Year AND I.Status = N'Paid'
    GROUP BY B.BranchID, B.Name
    ORDER BY YearlyRevenue DESC;
END;
GO

/*============================================================
  Tên: usp_Admin_TransferEmployee
  Chức năng: Điều động nhân viên sang chi nhánh mới
============================================================*/
CREATE OR ALTER PROCEDURE usp_Admin_TransferEmployee
    @EmployeeID INT,
    @NewBranchID INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        -- 1. Cập nhật ngày kết thúc tại chi nhánh cũ trong lịch sử
        UPDATE EmployeeHistory 
        SET EndDate = GETDATE()
        WHERE EmployeeID = @EmployeeID AND EndDate IS NULL;

        -- 2. Cập nhật chi nhánh mới trong bảng Employee
        UPDATE Employee 
        SET BranchID = @NewBranchID 
        WHERE EmployeeID = @EmployeeID;

        -- 3. Thêm bản ghi mới vào lịch sử
        INSERT INTO EmployeeHistory (EmployeeID, BranchID, StartDate)
        VALUES (@EmployeeID, @NewBranchID, GETDATE());

        COMMIT TRANSACTION;
        PRINT N'Điều động nhân viên thành công.';
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

/*============================================================
  Tên: usp_Admin_UpdateMembershipPolicy
  Chức năng: Admin điều chỉnh các mốc chi tiêu để phù hợp với chiến lược kinh doanh từng thời kỳ
============================================================*/
CREATE OR ALTER PROCEDURE usp_Admin_UpdateMembershipPolicy
    @TierID INT,
    @NewMinSpend DECIMAL(14,2),
    @NewBenefits NVARCHAR(255)
AS
BEGIN
    UPDATE MembershipTier
    SET MinSpend = @NewMinSpend,
        Benefits = @NewBenefits
    WHERE MembershipTierID = @TierID;
END;
GO

-- =============================================
-- Script: Thêm BranchID vào bảng Booking
-- Ngày tạo: 2026-01-07
-- Mục đích: 
--   - Thêm trường BranchID để theo dõi booking thuộc chi nhánh nào
--   - Điền dữ liệu cho các booking hiện có dựa trên logic nghiệp vụ
-- =============================================
PRINT '========================================';
PRINT 'BẮT ĐẦU MIGRATION: Thêm BranchID vào Booking';
PRINT '========================================';
PRINT '';

-- =============================================
-- Bước 1: Kiểm tra & thêm cột BranchID
-- =============================================
BEGIN TRY
    PRINT '[Bước 1] Kiểm tra & thêm cột BranchID...';
    
    -- Validate: Bảng Booking phải tồn tại
    IF OBJECT_ID('dbo.Booking', 'U') IS NULL
    BEGIN
        RAISERROR(N'❌ Bảng Booking không tồn tại!', 16, 1);
        RETURN;
    END
    
    -- Kiểm tra cột đã tồn tại
    IF NOT EXISTS (
        SELECT 1 FROM sys.columns 
        WHERE object_id = OBJECT_ID('dbo.Booking', 'U') 
        AND name = 'BranchID'
    )
    BEGIN
        ALTER TABLE dbo.Booking ADD BranchID INT NULL;
        PRINT '✓ Đã thêm cột BranchID (nullable)';
    END
    ELSE
    BEGIN
        DECLARE @IsNullable BIT;
        SELECT @IsNullable = is_nullable 
        FROM sys.columns 
        WHERE object_id = OBJECT_ID('dbo.Booking', 'U') 
        AND name = 'BranchID';
        PRINT '⚠ Cột BranchID đã tồn tại (nullable=' + CAST(@IsNullable AS VARCHAR(1)) + ')';
    END
    PRINT '';
END TRY
BEGIN CATCH
    PRINT N'❌ Lỗi: ' + ERROR_MESSAGE();
    THROW;
END CATCH
GO

-- =============================================
-- Bước 2: Cập nhật BranchID cho các booking hiện có
-- Logic ưu tiên:
--   1. Lấy từ Invoice gần nhất của Customer (nếu có)
--      → Vì Invoice đã có BranchID và là dữ liệu chính xác nhất
--   2. Lấy từ CheckHealth gần nhất của Pet (qua DoctorID)
--      → Backup nếu không có Invoice
--   3. Lấy từ Pet Owner's lastest activity
--      → Dựa vào Invoice của customer
--   4. Lấy chi nhánh đầu tiên trong hệ thống
--      → Default fallback
-- =============================================

PRINT '[Bước 2] Cập nhật BranchID cho các booking hiện có...';
PRINT '';

DECLARE @UpdatedRows INT = 0;

-- Cập nhật BranchID
UPDATE b
SET b.BranchID = COALESCE(
    -- Priority 1: Lấy từ Invoice gần nhất của Customer
    (SELECT TOP 1 i.BranchID
     FROM Invoice i
     WHERE i.CustomerID = b.CustomerID
     AND i.Status = 'Paid'  -- Chỉ lấy invoice đã thanh toán
     ORDER BY i.InvoiceDate DESC),
    
    -- Priority 2: Lấy từ Invoice bất kỳ của Customer
    (SELECT TOP 1 i.BranchID
     FROM Invoice i
     WHERE i.CustomerID = b.CustomerID
     ORDER BY i.InvoiceDate DESC),
    
    -- Priority 3: Lấy từ CheckHealth gần nhất của Pet
    (SELECT TOP 1 e.BranchID 
     FROM CheckHealth ch
     INNER JOIN Employee e ON ch.DoctorID = e.EmployeeID
     WHERE ch.PetID = b.PetID
     ORDER BY ch.CheckDate DESC),
    
    -- Priority 4: Lấy từ Employee (bác sĩ) đầu tiên có vị trí là bác sĩ
    (SELECT TOP 1 e.BranchID
     FROM Employee e
     INNER JOIN Position p ON e.PositionID = p.PositionID
     WHERE p.Name LIKE N'%Bác sĩ%' OR p.Name LIKE N'%Doctor%'
     ORDER BY e.EmployeeID),
    
    -- Priority 5: Lấy chi nhánh đầu tiên trong hệ thống
    (SELECT TOP 1 BranchID FROM Branch ORDER BY BranchID)
)
FROM Booking b
WHERE b.BranchID IS NULL;

SET @UpdatedRows = @@ROWCOUNT;

PRINT '✓ Đã cập nhật BranchID cho ' + CAST(@UpdatedRows AS VARCHAR) + ' booking';
PRINT '';

-- =============================================
-- Bước 3: Kiểm tra dữ liệu sau khi cập nhật
-- =============================================
PRINT '[Bước 3] Kiểm tra dữ liệu...';
PRINT '';

-- Kiểm tra còn booking nào chưa có BranchID
DECLARE @NullCount INT;
SELECT @NullCount = COUNT(*)
FROM Booking
WHERE BranchID IS NULL;

IF @NullCount > 0
BEGIN
    PRINT '⚠ CẢNH BÁO: Còn ' + CAST(@NullCount AS VARCHAR) + ' booking chưa có BranchID';
    PRINT '  Cần kiểm tra dữ liệu trước khi thêm ràng buộc NOT NULL';
    PRINT '';
END
ELSE
BEGIN
    PRINT '✓ Tất cả booking đã có BranchID';
    PRINT '';
END

-- =============================================
-- Bước 4: Thêm ràng buộc NOT NULL (nếu tất cả đã có BranchID)
-- =============================================
IF @NullCount = 0
BEGIN
    PRINT '[Bước 4] Thêm ràng buộc NOT NULL...';
    
    -- Kiểm tra xem cột đã là NOT NULL chưa
    IF EXISTS (
        SELECT 1 
        FROM sys.columns 
        WHERE object_id = OBJECT_ID('dbo.Booking') 
        AND name = 'BranchID' 
        AND is_nullable = 1
    )
    BEGIN
        ALTER TABLE dbo.Booking
        ALTER COLUMN BranchID INT NOT NULL;
        
        PRINT '✓ Đã thêm ràng buộc NOT NULL cho BranchID';
        PRINT '';
    END
    ELSE
    BEGIN
        PRINT '✓ BranchID đã có ràng buộc NOT NULL';
        PRINT '';
    END
END
ELSE
BEGIN
    PRINT '[Bước 4] Bỏ qua - chưa thể thêm NOT NULL do còn giá trị NULL';
    PRINT '';
END
GO

-- =============================================
-- Bước 5: Thêm Foreign Key constraint
-- =============================================
PRINT '[Bước 5] Thêm Foreign Key constraint...';

IF NOT EXISTS (
    SELECT 1 
    FROM sys.foreign_keys 
    WHERE name = 'FK_Booking_Branch' 
    AND parent_object_id = OBJECT_ID('dbo.Booking')
)
BEGIN
    ALTER TABLE dbo.Booking
    ADD CONSTRAINT FK_Booking_Branch
    FOREIGN KEY (BranchID) REFERENCES Branch(BranchID);
    
    PRINT '✓ Đã thêm Foreign Key constraint FK_Booking_Branch';
    PRINT '';
END
ELSE
BEGIN
    PRINT '✓ Foreign Key constraint FK_Booking_Branch đã tồn tại';
    PRINT '';
END
GO

-- =============================================
-- Bước 6: Cập nhật Stored Procedure sp_Booking_Create
-- =============================================
PRINT '[Bước 6] Cập nhật stored procedure...';

IF OBJECT_ID('dbo.sp_Booking_Create', 'P') IS NOT NULL
BEGIN
    DROP PROCEDURE dbo.sp_Booking_Create;
    PRINT '✓ Đã xóa sp_Booking_Create cũ';
END

-- Tạo lại với tham số BranchID
EXEC('
CREATE PROC sp_Booking_Create
@CustomerID INT,
@PetID INT,
@BranchID INT,
@BookingType NVARCHAR(50),
@RequestedDateTime DATETIME,
@Status NVARCHAR(20),
@Notes NVARCHAR(255)
AS
BEGIN
    -- Kiểm tra tồn tại
    IF NOT EXISTS (SELECT 1 FROM Customer WHERE CustomerID=@CustomerID)
    BEGIN
        RAISERROR(N''Khách hàng không tồn tại'',16,1)
        RETURN
    END
    
    IF NOT EXISTS (SELECT 1 FROM Pet WHERE PetID=@PetID)
    BEGIN
        RAISERROR(N''Thú cưng không tồn tại'',16,1)
        RETURN
    END
    
    IF NOT EXISTS (SELECT 1 FROM Branch WHERE BranchID=@BranchID)
    BEGIN
        RAISERROR(N''Chi nhánh không tồn tại'',16,1)
        RETURN
    END
    
    -- Insert booking
    INSERT INTO Booking
    (CustomerID, PetID, BranchID, BookingType, RequestedDateTime, Status, Notes)
    VALUES(@CustomerID, @PetID, @BranchID, @BookingType, @RequestedDateTime, @Status, @Notes)
    
    -- Trả về BookingID vừa tạo
    SELECT SCOPE_IDENTITY() AS NewBookingID
END
');

PRINT '✓ Đã cập nhật sp_Booking_Create với tham số BranchID';
PRINT '';
GO

-- =============================================
-- Bước 7: Đảm bảo tất cả Booking có BranchID (fallback cuối)
-- =============================================
PRINT '[Bước 7] Đảm bảo tất cả Booking có BranchID...';
PRINT '';

-- Cập nhật các booking còn NULL thành branch 1
UPDATE Booking
SET BranchID = 1
WHERE BranchID IS NULL;

PRINT '✓ Đã đảm bảo tất cả Booking có BranchID';
PRINT '';

-- =============================================
-- Bước 8: Báo cáo tổng quan
-- =============================================
PRINT '[Bước 8] Báo cáo tổng quan...';
PRINT '';
PRINT '--- Thống kê Booking theo Chi nhánh ---';

SELECT 
    b.Name AS TenChiNhanh,
    COUNT(bk.BookingID) as TongSoBooking,
    COUNT(CASE WHEN bk.Status = 'Pending' THEN 1 END) as ChoXacNhan,
    COUNT(CASE WHEN bk.Status = 'Confirmed' THEN 1 END) as DaXacNhan,
    COUNT(CASE WHEN bk.Status = 'Completed' THEN 1 END) as DaHoanThanh,
    COUNT(CASE WHEN bk.Status = 'Cancelled' THEN 1 END) as DaHuy
FROM Branch b
LEFT JOIN Booking bk ON b.BranchID = bk.BranchID
GROUP BY b.BranchID, b.Name
ORDER BY b.BranchID;

PRINT '';
PRINT '========================================';
PRINT 'HOÀN THÀNH MIGRATION';
PRINT '========================================';
GO


-- ============================================
-- Gán DoctorID với Load Balancing
-- ============================================

ALTER TABLE Booking 
ADD DoctorID INT NULL;

ALTER TABLE Booking
ADD CONSTRAINT FK_Booking_Employee 
FOREIGN KEY (DoctorID) REFERENCES Employee(EmployeeID);

-- Bước 1: Xác nhận số booking cần gán
SELECT COUNT(*) AS BookingNeedDoctor
FROM Booking
WHERE DoctorID IS NULL
  AND BranchID IS NOT NULL
  AND Status IN ('Pending', 'Confirmed');

-- Bước 2: Gán DoctorID tối ưu (Round-Robin)
WITH BookingsToAssign AS (
    SELECT 
        BookingID,
        BranchID,
        ROW_NUMBER() OVER (PARTITION BY BranchID ORDER BY BookingID) AS RowNum
    FROM Booking
    WHERE DoctorID IS NULL
      AND BranchID IS NOT NULL
      AND Status IN ('Pending', 'Confirmed')
),
DoctorsPerBranch AS (
    SELECT 
        EmployeeID,
        BranchID,
        ROW_NUMBER() OVER (PARTITION BY BranchID ORDER BY EmployeeID) AS DoctorRank
    FROM Employee
    WHERE PositionID = 1
),
AssignedDoctors AS (
    SELECT 
        BA.BookingID,
        DB.EmployeeID,
        ((BA.RowNum - 1) % (SELECT COUNT(*) FROM DoctorsPerBranch DP WHERE DP.BranchID = BA.BranchID) + 1) AS ModRank
    FROM BookingsToAssign BA
    CROSS JOIN DoctorsPerBranch DB
    WHERE BA.BranchID = DB.BranchID
      AND DB.DoctorRank = ((BA.RowNum - 1) % (SELECT COUNT(*) FROM DoctorsPerBranch DP WHERE DP.BranchID = BA.BranchID) + 1)
)
UPDATE B
SET B.DoctorID = AD.EmployeeID
FROM Booking B
INNER JOIN AssignedDoctors AD ON B.BookingID = AD.BookingID;
---------------------------------------------------------------------

-- Script THÊM DỮ LIỆU InvoiceItem MỚI (không xóa cái cũ)
-- Tham khảo từ CSDL.sql - thêm 3-5 sản phẩm/dịch vụ ngẫu nhiên vào mỗi hóa đơn
-- Tự động tránh trùng lặp items trong cùng hóa đơn
;WITH ProductAndServiceList AS (
    -- Lấy danh sách sản phẩm
    SELECT 
        InvoiceID,
        ProductID,
        NULL AS ServiceID,
        'PRODUCT' AS ItemType,
        Price AS UnitPrice,
        ROW_NUMBER() OVER (PARTITION BY InvoiceID ORDER BY NEWID()) AS RowNum
    FROM Invoice i
    CROSS JOIN Product p
    WHERE NOT EXISTS (
        SELECT 1 FROM InvoiceItem ii 
        WHERE ii.InvoiceID = i.InvoiceID 
        AND ii.ProductID = p.ProductID
        AND ii.ItemType = 'PRODUCT'
    )
    
    UNION ALL
    
    -- Lấy danh sách dịch vụ
    SELECT 
        InvoiceID,
        NULL AS ProductID,
        ServiceID,
        'SERVICE' AS ItemType,
        BasePrice AS UnitPrice,
        ROW_NUMBER() OVER (PARTITION BY InvoiceID ORDER BY NEWID()) AS RowNum
    FROM Invoice i
    CROSS JOIN Service s
    WHERE NOT EXISTS (
        SELECT 1 FROM InvoiceItem ii 
        WHERE ii.InvoiceID = i.InvoiceID 
        AND ii.ServiceID = s.ServiceID
        AND ii.ItemType = 'SERVICE'
    )
)
INSERT INTO InvoiceItem (InvoiceID, ItemType, ProductID, ServiceID, Quantity, UnitPrice)
SELECT 
    InvoiceID,
    ItemType,
    ProductID,
    ServiceID,
    (ABS(CHECKSUM(NEWID())) % 5) + 1 AS Quantity,
    UnitPrice
FROM ProductAndServiceList
WHERE RowNum <= (ABS(CHECKSUM(NEWID())) % 3 + 3)
AND NOT EXISTS (
    SELECT 1 FROM InvoiceItem ii
    WHERE ii.InvoiceID = ProductAndServiceList.InvoiceID
    AND (
        (ii.ItemType = 'PRODUCT' AND ii.ProductID = ProductAndServiceList.ProductID)
        OR 
        (ii.ItemType = 'SERVICE' AND ii.ServiceID = ProductAndServiceList.ServiceID)
    )
);
