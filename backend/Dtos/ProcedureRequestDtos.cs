using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace PetCareX.Api.Dtos;

// ============================================================
// DTOs cho Receptionist APIs
// ============================================================

/// <summary>
/// Request DTO: Tạo booking từ nhân viên tiếp tân (khách đến trực tiếp)
/// </summary>
public class CreateBookingByStaffDto
{
    [Required]
    public int CustomerId { get; set; }

    [Required]
    public int PetId { get; set; }

    [Required]
    public DateTime BookingDate { get; set; }

    [Required]
    [StringLength(20)]
    public string BookingType { get; set; } = null!; // "CheckHealth" hoặc "Vaccination"

    [Required]
    public int StaffId { get; set; }
}

/// <summary>
/// Response DTO: Kết quả tạo booking
/// </summary>
public class CreateBookingResponseDto
{
    public int NewBookingId { get; set; }
    public string Message { get; set; } = null!;
}

/// <summary>
/// Request DTO: Tìm pet bằng số điện thoại khách hàng
/// </summary>
public class FindPetByPhoneDto
{
    [Required]
    [Phone]
    public string Phone { get; set; } = null!;
}

/// <summary>
/// Response DTO: Thông tin pet của khách hàng
/// </summary>
public class CustomerPetResultDto
{
    public int CustomerId { get; set; }
    public string FullName { get; set; } = null!;
    public List<PetBasicDto> Pets { get; set; } = new();
}

/// <summary>
/// Thông tin pet cơ bản
/// </summary>
public class PetBasicDto
{
    public int PetId { get; set; }
    public string Name { get; set; } = null!;
    public string Species { get; set; } = null!;
    public string? Breed { get; set; }
}

/// <summary>
/// Response DTO: Bác sĩ trống lịch
/// </summary>
public class AvailableDoctorDto
{
    public int DoctorId { get; set; }
    public string DoctorName { get; set; } = null!;
}

/// <summary>
/// Request DTO: Tìm bác sĩ trống lịch
/// </summary>
public class FindAvailableDoctorDto
{
    [Required]
    public int BranchId { get; set; }

    [Required]
    public DateTime RequestedDateTime { get; set; }

    public int DurationMinutes { get; set; } = 30;
}

/// <summary>
/// Request DTO: Tìm thuốc/sản phẩm
/// </summary>
public class SearchMedicineDto
{
    [Required]
    [StringLength(100)]
    public string Keyword { get; set; } = null!;
}

/// <summary>
/// Response DTO: Thông tin thuốc/sản phẩm
/// </summary>
public class MedicineDto
{
    public int ProductId { get; set; }
    public string Name { get; set; } = null!;
    public decimal Price { get; set; }
    public int StockQty { get; set; }
}

/// <summary>
/// Request DTO: Đăng ký pet mới cho khách hàng
/// </summary>
public class RegisterNewPetDto
{
    [Required]
    public int CustomerId { get; set; }

    [Required]
    [StringLength(100)]
    public string PetName { get; set; } = null!;

    [Required]
    [StringLength(50)]
    public string Species { get; set; } = null!;

    [StringLength(100)]
    public string? Breed { get; set; }

    [DataType(DataType.Date)]
    public DateOnly? BirthDate { get; set; }

    [Required]
    [StringLength(1)]
    public string Gender { get; set; } = null!; // 'M', 'F', 'U'

    [StringLength(50)]
    public string Status { get; set; } = "Healthy";
}

// ============================================================
// DTOs cho Staff/Receptionist (Order Management)
// ============================================================

/// <summary>
/// Request DTO: Khởi tạo đơn hàng mới
/// </summary>
public class CreateOrderDto
{
    [Required]
    public int BranchId { get; set; }

    [Required]
    public int CustomerId { get; set; }

    [Required]
    public int EmployeeId { get; set; }

    public int? PetId { get; set; }

    [StringLength(20)]
    public string PaymentMethod { get; set; } = "CASH";
}

/// <summary>
/// Response DTO: Kết quả khởi tạo đơn
/// </summary>
public class CreateOrderResponseDto
{
    public int InvoiceId { get; set; }
}

/// <summary>
/// Request DTO: Thêm item vào đơn hàng
/// </summary>
public class AddItemToOrderDto
{
    [Required]
    public int InvoiceId { get; set; }

    [Required]
    [StringLength(20)]
    public string ItemType { get; set; } = null!; // "PRODUCT" hoặc "SERVICE"

    [Required]
    public int ItemId { get; set; }

    [Required]
    public int Quantity { get; set; }
}

/// <summary>
/// Request DTO: Xác nhận thanh toán hóa đơn
/// </summary>
public class ConfirmInvoiceDto
{
    [Required]
    public int InvoiceId { get; set; }

    [StringLength(20)]
    public string? PaymentMethod { get; set; }
}

/// <summary>
/// Response DTO: Hóa đơn đã thanh toán
/// </summary>
public class ConfirmInvoiceResponseDto
{
    public int InvoiceId { get; set; }
    public string CustomerName { get; set; } = null!;
    public string StaffName { get; set; } = null!;
    public decimal TotalAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal FinalAmount { get; set; }
    public string PaymentMethod { get; set; } = null!;
}

// ============================================================
// DTOs cho Customer APIs
// ============================================================

/// <summary>
/// Response DTO: Lịch sử mua hàng khách hàng
/// </summary>
public class CustomerInvoiceHistoryDto
{
    public int InvoiceId { get; set; }
    public DateTime InvoiceDate { get; set; }
    public string BranchName { get; set; } = null!;
    public decimal TotalAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal FinalAmount { get; set; }
    public string PaymentMethod { get; set; } = null!;
}

/// <summary>
/// Request DTO: Tìm sản phẩm khách hàng
/// </summary>
public class CustomerSearchProductDto
{
    public string? Keyword { get; set; }

    [StringLength(50)]
    public string? Category { get; set; }
}

/// <summary>
/// Response DTO: Sản phẩm cho khách hàng
/// </summary>
public class CustomerProductDto
{
    public int ProductId { get; set; }
    public string Name { get; set; } = null!;
    public string Category { get; set; } = null!;
    public decimal Price { get; set; }
    public int StockQty { get; set; }
    public string? Description { get; set; }
}

/// <summary>
/// Request DTO: Mua sản phẩm
/// </summary>
public class CustomerPurchaseProductDto
{
    [Required]
    public int CustomerId { get; set; }

    [Required]
    public int BranchId { get; set; }

    [Required]
    public int EmployeeId { get; set; }

    [Required]
    public int ProductId { get; set; }

    [Required]
    public int Quantity { get; set; }

    [Required]
    [StringLength(20)]
    public string PaymentMethod { get; set; } = null!;

    public int? PetId { get; set; }
}

/// <summary>
/// Response DTO: Lịch sử mua hàng cho pet
/// </summary>
public class PetPurchaseHistoryDto
{
    public DateTime InvoiceDate { get; set; }
    public string ItemType { get; set; } = null!;
    public string ItemName { get; set; } = null!;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
}

/// <summary>
/// Response DTO: Lịch sử y tế của pet (khám bệnh + tiêm phòng)
/// </summary>
public class PetMedicalHistoryDto
{
    public string RecordType { get; set; } = null!; // "KHAM" hoặc "TIEM"
    public DateTime RecordDate { get; set; }
    public string Diagnosis { get; set; } = null!;
    public string? Symptoms { get; set; }
    public string? Prescription { get; set; }
    public DateTime? FollowUpDate { get; set; }
    public string DoctorName { get; set; } = null!;
}

// ============================================================
// DTOs cho Doctor APIs
// ============================================================

/// <summary>
/// Request DTO: Tạo bệnh án mới
/// </summary>
public class CreateCheckHealthDto
{
    [Required]
    public int PetId { get; set; }

    [Required]
    public int DoctorId { get; set; }

    [Required]
    [StringLength(255)]
    public string Symptoms { get; set; } = null!;

    [StringLength(255)]
    public string? Diagnosis { get; set; }

    [StringLength(255)]
    public string? Prescription { get; set; }

    [DataType(DataType.DateTime)]
    public DateTime? FollowUpDate { get; set; }

    public int? BookingId { get; set; }
}

/// <summary>
/// Response DTO: Bệnh án được tạo
/// </summary>
public class CreateCheckHealthResponseDto
{
    public int NewCheckId { get; set; }
}

// ============================================================
// DTOs cho Manager/Admin - Reports & Analytics
// ============================================================

/// <summary>
/// Response DTO: Doanh thu theo bác sĩ
/// </summary>
public class DoctorRevenueDto
{
    public int DoctorId { get; set; }
    public string FullName { get; set; } = null!;
    public int TotalInvoices { get; set; }
    public decimal TotalRevenue { get; set; }
}

/// <summary>
/// Response DTO: Thống kê lượt khám
/// </summary>
public class VisitStatisticsDto
{
    public int TotalVisits { get; set; }
}

/// <summary>
/// Response DTO: Doanh thu toàn hệ thống
/// </summary>
public class SystemRevenueDto
{
    public decimal TotalSystemRevenue { get; set; }
}

/// <summary>
/// Response DTO: Doanh thu sản phẩm theo loại
/// </summary>
public class ProductRevenueDto
{
    public string Category { get; set; } = null!;
    public int TotalSoldQuantity { get; set; }
    public decimal CategoryRevenue { get; set; }
}

/// <summary>
/// Response DTO: Sản phẩm bán chạy nhất
/// </summary>
public class TopSellingProductDto
{
    public string Name { get; set; } = null!;
    public string Category { get; set; } = null!;
    public int TotalQuantity { get; set; }
}

/// <summary>
/// Response DTO: Lịch bác sĩ theo ngày
/// </summary>
public class DoctorScheduleDto
{
    public DateTime AppointmentTime { get; set; }
    public string PetName { get; set; } = null!;
    public string Activity { get; set; } = null!; // "Examination" hoặc "Vaccination"
}

/// <summary>
/// Response DTO: Hiệu suất chi nhánh
/// </summary>
public class BranchPerformanceDto
{
    public string ItemType { get; set; } = null!;
    public decimal Revenue { get; set; }
    public int TotalInvoices { get; set; }
    public int TotalVisits { get; set; }
}

/// <summary>
/// Response DTO: Hiệu suất bác sĩ
/// </summary>
public class DoctorEfficiencyDto
{
    public string DoctorName { get; set; } = null!;
    public int TotalTreatments { get; set; }
    public decimal TotalRevenueGenerated { get; set; }
}

/// <summary>
/// Response DTO: Doanh thu chi tiết theo tháng
/// </summary>
public class MonthlyDetailedRevenueDto
{
    public string LoaiHinh { get; set; } = null!;
    public decimal TongDoanhThu { get; set; }
    public int SoLuongBanRa { get; set; }
}

/// <summary>
/// Response DTO: Tóm tắt đánh giá chi nhánh
/// </summary>
public class ReviewSummaryDto
{
    public decimal DiemDichVuTrungBinh { get; set; }
    public decimal DiemThaiDotTrungBinh { get; set; }
    public decimal DiemTongTheTrungBinh { get; set; }
    public int TongSoLuotDanhGia { get; set; }
    public List<NegativeReviewDto> NegativeReviews { get; set; } = new();
}

/// <summary>
/// Đánh giá tiêu cực
/// </summary>
public class NegativeReviewDto
{
    public int CustomerId { get; set; }
    public int RatingOverall { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// Response DTO: Khách hàng VIP của chi nhánh
/// </summary>
public class TopCustomerDto
{
    public string TenKhachHang { get; set; } = null!;
    public string SoDienThoai { get; set; } = null!;
    public decimal TongChiTieuTaiChiNhanh { get; set; }
    public string HangThanhVien { get; set; } = null!;
}

/// <summary>
/// Response DTO: So sánh doanh thu giữa các chi nhánh
/// </summary>
public class BranchRevenueComparisonDto
{
    public string BranchName { get; set; } = null!;
    public decimal YearlyRevenue { get; set; }
    public int TotalTransactions { get; set; }
}

/// <summary>
/// Request DTO: Điều động nhân viên
/// </summary>
public class TransferEmployeeDto
{
    [Required]
    public int EmployeeId { get; set; }

    [Required]
    public int NewBranchId { get; set; }
}

/// <summary>
/// Response DTO: Kết quả điều động
/// </summary>
public class TransferEmployeeResponseDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = null!;
}

/// <summary>
/// Request DTO: Cập nhật chính sách hạng thành viên
/// </summary>
public class UpdateMembershipPolicyDto
{
    [Required]
    public int TierId { get; set; }

    [Required]
    public decimal NewMinSpend { get; set; }

    [Required]
    [StringLength(255)]
    public string NewBenefits { get; set; } = null!;
}
