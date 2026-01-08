using Microsoft.Data.SqlClient;
using PetCareX.Api.Data;
using PetCareX.Api.Dtos;
using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace PetCareX.Api.Services;

/// <summary>
/// Service for executing stored procedures and returning DTOs
/// </summary>
public interface IStoredProcedureService
{
    // Receptionist APIs
    Task<CreateBookingResponseDto> CreateBookingByStaffAsync(CreateBookingByStaffDto request);
    Task<List<CustomerPetResultDto>> FindPetByCustomerPhoneAsync(string phone);
    Task<List<AvailableDoctorDto>> FindAvailableDoctorsAsync(FindAvailableDoctorDto request);
    Task<List<MedicineDto>> SearchMedicineAsync(string keyword);
    Task<PetDto> RegisterNewPetAsync(RegisterNewPetDto request);

    // Staff Order Management
    Task<CreateOrderResponseDto> CreateOrderAsync(CreateOrderDto request);
    Task AddItemToOrderAsync(AddItemToOrderDto request);
    Task<ConfirmInvoiceResponseDto> ConfirmInvoiceAsync(ConfirmInvoiceDto request);

    // Customer APIs
    Task<List<CustomerInvoiceHistoryDto>> GetCustomerInvoiceHistoryAsync(int customerId);
    Task<List<CustomerProductDto>> SearchProductsAsync(CustomerSearchProductDto request);
    Task<int> PurchaseProductAsync(CustomerPurchaseProductDto request);
    Task<List<PetPurchaseHistoryDto>> GetPetPurchaseHistoryAsync(int petId);
    Task<List<PetMedicalHistoryDto>> GetPetMedicalHistoryAsync(int petId);

    // Doctor APIs
    Task<CreateCheckHealthResponseDto> CreateCheckHealthAsync(CreateCheckHealthDto request);

    // Reports & Analytics
    Task<List<DoctorRevenueDto>> GetDoctorRevenueAsync(DateTime fromDate, DateTime toDate);
    Task<VisitStatisticsDto> GetVisitStatisticsAsync(DateTime fromDate, DateTime toDate);
    Task<SystemRevenueDto> GetSystemRevenueAsync(DateTime fromDate, DateTime toDate);
    Task<List<ProductRevenueDto>> GetProductRevenueAsync(DateTime fromDate, DateTime toDate);
    Task<List<TopSellingProductDto>> GetTopSellingProductsAsync(int top = 10);
    Task<List<DoctorScheduleDto>> GetDoctorScheduleAsync(int doctorId, DateTime date);
    Task<BranchPerformanceDto> GetBranchPerformanceAsync(int branchId, DateTime fromDate, DateTime toDate);
    Task<List<DoctorEfficiencyDto>> GetDoctorEfficiencyAsync(int branchId);
    Task<List<MonthlyDetailedRevenueDto>> GetMonthlyDetailedRevenueAsync(int branchId, int month, int year);
    Task<ReviewSummaryDto> GetReviewSummaryAsync(int branchId);
    Task<List<TopCustomerDto>> GetTopCustomersAsync(int branchId);
    Task<List<BranchRevenueComparisonDto>> GetGlobalRevenueDashboardAsync(int year);
    Task TransferEmployeeAsync(TransferEmployeeDto request);
    Task UpdateMembershipPolicyAsync(UpdateMembershipPolicyDto request);
}

/// <summary>
/// Implementation of stored procedure service
/// </summary>
public class StoredProcedureService : IStoredProcedureService
{
    private readonly ApplicationDbContext _context;

    public StoredProcedureService(ApplicationDbContext context)
    {
        _context = context;
    }

    // ============================================================
    // RECEPTIONIST APIs
    // ============================================================

    public async Task<CreateBookingResponseDto> CreateBookingByStaffAsync(CreateBookingByStaffDto request)
    {
        try
        {
            var parameters = new[]
            {
                new SqlParameter("@CustomerID", request.CustomerId),
                new SqlParameter("@PetID", request.PetId),
                new SqlParameter("@BookingDate", request.BookingDate),
                new SqlParameter("@BookingType", request.BookingType),
                new SqlParameter("@StaffID", request.StaffId),
            };

            var results = await _context.Database.SqlQueryRaw<decimal>(
                "EXEC usp_CreateBookingByStaff @CustomerID, @PetID, @BookingDate, @BookingType, @StaffID",
                parameters
            ).ToListAsync();

            return new CreateBookingResponseDto
            {
                NewBookingId = Convert.ToInt32(results.FirstOrDefault()),
                Message = "Booking created successfully"
            };
        }
        catch (Exception ex)
        {
            throw new Exception($"Error creating booking: {ex.Message}");
        }
    }

    public async Task<List<CustomerPetResultDto>> FindPetByCustomerPhoneAsync(string phone)
    {
        try
        {
            var parameter = new SqlParameter("@Phone", phone);

            var results = await _context.Database.SqlQueryRaw<(int, string, int, string, string, string)>(
                "EXEC usp_FindPetByCustomerPhone @Phone",
                parameter
            ).ToListAsync();

            var grouped = new Dictionary<int, CustomerPetResultDto>();

            foreach (var item in results)
            {
                if (!grouped.TryGetValue(item.Item1, out var customer))
                {
                    customer = new CustomerPetResultDto
                    {
                        CustomerId = item.Item1,
                        FullName = item.Item2,
                        Pets = new List<PetBasicDto>()
                    };
                    grouped[item.Item1] = customer;
                }

                if (item.Item3 > 0) // PetID > 0 (có pet)
                {
                    customer.Pets.Add(new PetBasicDto
                    {
                        PetId = item.Item3,
                        Name = item.Item4,
                        Species = item.Item5,
                        Breed = item.Item6
                    });
                }
            }

            return new List<CustomerPetResultDto>(grouped.Values);
        }
        catch (Exception ex)
        {
            throw new Exception($"Error finding pet by phone: {ex.Message}");
        }
    }

    public async Task<List<AvailableDoctorDto>> FindAvailableDoctorsAsync(FindAvailableDoctorDto request)
    {
        try
        {
            var parameters = new[]
            {
                new SqlParameter("@BranchID", request.BranchId),
                new SqlParameter("@RequestedDateTime", request.RequestedDateTime),
                new SqlParameter("@DurationMinutes", request.DurationMinutes),
            };

            var results = await _context.Database.SqlQueryRaw<(int, string)>(
                "EXEC usp_FindAvailableDoctors @BranchID, @RequestedDateTime, @DurationMinutes",
                parameters
            ).ToListAsync();

            return results.ConvertAll(r => new AvailableDoctorDto
            {
                DoctorId = r.Item1,
                DoctorName = r.Item2
            });
        }
        catch (Exception ex)
        {
            throw new Exception($"Error finding available doctors: {ex.Message}");
        }
    }

    public async Task<List<MedicineDto>> SearchMedicineAsync(string keyword)
    {
        try
        {
            var parameter = new SqlParameter("@Keyword", keyword);

            var results = await _context.Database.SqlQueryRaw<(int, string, decimal, int)>(
                "EXEC usp_SearchMedicine @Keyword",
                parameter
            ).ToListAsync();

            return results.ConvertAll(r => new MedicineDto
            {
                ProductId = r.Item1,
                Name = r.Item2,
                Price = r.Item3,
                StockQty = r.Item4
            });
        }
        catch (Exception ex)
        {
            throw new Exception($"Error searching medicine: {ex.Message}");
        }
    }

    public async Task<PetDto> RegisterNewPetAsync(RegisterNewPetDto request)
    {
        try
        {
            var parameters = new[]
            {
                new SqlParameter("@CustomerID", request.CustomerId),
                new SqlParameter("@PetName", request.PetName),
                new SqlParameter("@Species", request.Species),
                new SqlParameter("@Breed", request.Breed ?? (object)DBNull.Value),
                new SqlParameter("@BirthDate", request.BirthDate.HasValue ? (object)request.BirthDate.Value : DBNull.Value),
                new SqlParameter("@Gender", request.Gender),
                new SqlParameter("@Status", request.Status),
            };

            // Proc returns SCOPE_IDENTITY() - PetID
            var petIds = await _context.Database.SqlQueryRaw<decimal>(
                "EXEC usp_Staff_RegisterNewPet @CustomerID, @PetName, @Species, @Breed, @BirthDate, @Gender, @Status",
                parameters
            ).ToListAsync();
            var petId = Convert.ToInt32(petIds.FirstOrDefault());

            // Fetch created pet
            var pet = await _context.Pets.FindAsync(petId);
            if (pet == null)
                throw new Exception("Pet created but could not be retrieved");

            return new PetDto
            {
                PetId = pet.PetId,
                CustomerId = pet.CustomerId,
                Name = pet.Name,
                Species = pet.Species,
                Breed = pet.Breed,
                BirthDate = pet.BirthDate.HasValue ? pet.BirthDate.Value.ToDateTime(TimeOnly.MinValue) : (DateTime?)null,
                Gender = pet.Gender,
                Status = pet.Status
            };
        }
        catch (Exception ex)
        {
            throw new Exception($"Error registering pet: {ex.Message}");
        }
    }

    // ============================================================
    // STAFF ORDER MANAGEMENT APIs
    // ============================================================

    public async Task<CreateOrderResponseDto> CreateOrderAsync(CreateOrderDto request)
    {
        try
        {
            var parameters = new[]
            {
                new SqlParameter("@BranchID", request.BranchId),
                new SqlParameter("@CustomerID", request.CustomerId),
                new SqlParameter("@EmployeeID", request.EmployeeId),
                new SqlParameter("@PetID", request.PetId ?? (object)DBNull.Value),
                new SqlParameter("@PaymentMethod", request.PaymentMethod),
            };

            var invoiceIds = await _context.Database.SqlQueryRaw<decimal>(
                "EXEC usp_Staff_CreateOrder @BranchID, @CustomerID, @EmployeeID, @PetID, @PaymentMethod",
                parameters
            ).ToListAsync();

            return new CreateOrderResponseDto { InvoiceId = Convert.ToInt32(invoiceIds.FirstOrDefault()) };
        }
        catch (Exception ex)
        {
            throw new Exception($"Error creating order: {ex.Message}");
        }
    }

    public async Task AddItemToOrderAsync(AddItemToOrderDto request)
    {
        try
        {
            var parameters = new[]
            {
                new SqlParameter("@InvoiceID", request.InvoiceId),
                new SqlParameter("@ItemType", request.ItemType),
                new SqlParameter("@ItemID", request.ItemId),
                new SqlParameter("@Quantity", request.Quantity),
            };

            await _context.Database.ExecuteSqlRawAsync(
                "EXEC usp_Staff_AddItemToOrder @InvoiceID, @ItemType, @ItemID, @Quantity",
                parameters
            );
        }
        catch (Exception ex)
        {
            throw new Exception($"Error adding item to order: {ex.Message}");
        }
    }

    public async Task<ConfirmInvoiceResponseDto> ConfirmInvoiceAsync(ConfirmInvoiceDto request)
    {
        try
        {
            var parameters = new[]
            {
                new SqlParameter("@InvoiceID", request.InvoiceId),
                new SqlParameter("@PaymentMethod", request.PaymentMethod ?? (object)DBNull.Value),
            };

            var results = await _context.Database.SqlQueryRaw<(int, string, string, decimal, decimal, decimal, string)>(
                "EXEC usp_Staff_ConfirmInvoice @InvoiceID, @PaymentMethod",
                parameters
            ).ToListAsync();
            var result = results.FirstOrDefault();

            return new ConfirmInvoiceResponseDto
            {
                InvoiceId = result.Item1,
                CustomerName = result.Item2,
                StaffName = result.Item3,
                TotalAmount = result.Item4,
                DiscountAmount = result.Item5,
                FinalAmount = result.Item6,
                PaymentMethod = result.Item7
            };
        }
        catch (Exception ex)
        {
            throw new Exception($"Error confirming invoice: {ex.Message}");
        }
    }

    // ============================================================
    // CUSTOMER APIs
    // ============================================================

    public async Task<List<CustomerInvoiceHistoryDto>> GetCustomerInvoiceHistoryAsync(int customerId)
    {
        try
        {
            var parameter = new SqlParameter("@CustomerID", customerId);

            var results = await _context.Database.SqlQueryRaw<(int, DateTime, string, decimal, decimal, decimal, string)>(
                "EXEC usp_Customer_GetInvoiceHistory @CustomerID",
                parameter
            ).ToListAsync();

            return results.ConvertAll(r => new CustomerInvoiceHistoryDto
            {
                InvoiceId = r.Item1,
                InvoiceDate = r.Item2,
                BranchName = r.Item3,
                TotalAmount = r.Item4,
                DiscountAmount = r.Item5,
                FinalAmount = r.Item6,
                PaymentMethod = r.Item7
            });
        }
        catch (Exception ex)
        {
            throw new Exception($"Error getting invoice history: {ex.Message}");
        }
    }

    public async Task<List<CustomerProductDto>> SearchProductsAsync(CustomerSearchProductDto request)
    {
        try
        {
            var parameters = new[]
            {
                new SqlParameter("@Keyword", request.Keyword ?? (object)DBNull.Value),
                new SqlParameter("@Category", request.Category ?? (object)DBNull.Value),
            };

            var results = await _context.Database.SqlQueryRaw<(int, string, string, decimal, int, string)>(
                "EXEC usp_Customer_SearchProducts @Keyword, @Category",
                parameters
            ).ToListAsync();

            return results.ConvertAll(r => new CustomerProductDto
            {
                ProductId = r.Item1,
                Name = r.Item2,
                Category = r.Item3,
                Price = r.Item4,
                StockQty = r.Item5,
                Description = r.Item6
            });
        }
        catch (Exception ex)
        {
            throw new Exception($"Error searching products: {ex.Message}");
        }
    }

    public async Task<int> PurchaseProductAsync(CustomerPurchaseProductDto request)
    {
        try
        {
            var parameters = new[]
            {
                new SqlParameter("@CustomerID", request.CustomerId),
                new SqlParameter("@BranchID", request.BranchId),
                new SqlParameter("@EmployeeID", request.EmployeeId),
                new SqlParameter("@ProductID", request.ProductId),
                new SqlParameter("@Quantity", request.Quantity),
                new SqlParameter("@PaymentMethod", request.PaymentMethod),
                new SqlParameter("@PetID", request.PetId ?? (object)DBNull.Value),
            };

            var invoiceIds = await _context.Database.SqlQueryRaw<decimal>(
                "EXEC usp_Customer_PurchaseProduct @CustomerID, @BranchID, @EmployeeID, @ProductID, @Quantity, @PaymentMethod, @PetID",
                parameters
            ).ToListAsync();

            return Convert.ToInt32(invoiceIds.FirstOrDefault());
        }
        catch (Exception ex)
        {
            throw new Exception($"Error purchasing product: {ex.Message}");
        }
    }

    public async Task<List<PetPurchaseHistoryDto>> GetPetPurchaseHistoryAsync(int petId)
    {
        try
        {
            var parameter = new SqlParameter("@PetID", petId);

            var results = await _context.Database.SqlQueryRaw<(DateTime, string, string, int, decimal, decimal)>(
                "EXEC usp_Pet_GetPurchaseHistory @PetID",
                parameter
            ).ToListAsync();

            return results.ConvertAll(r => new PetPurchaseHistoryDto
            {
                InvoiceDate = r.Item1,
                ItemType = r.Item2,
                ItemName = r.Item3,
                Quantity = r.Item4,
                UnitPrice = r.Item5,
                TotalPrice = r.Item6
            });
        }
        catch (Exception ex)
        {
            throw new Exception($"Error getting pet purchase history: {ex.Message}");
        }
    }

    public async Task<List<PetMedicalHistoryDto>> GetPetMedicalHistoryAsync(int petId)
    {
        try
        {
            var parameter = new SqlParameter("@PetID", petId);

            var results = await _context.Database.SqlQueryRaw<(string, DateTime, string, string, string, DateTime, string)>(
                "EXEC usp_GetPetMedicalHistory @PetID",
                parameter
            ).ToListAsync();

            return results.ConvertAll(r => new PetMedicalHistoryDto
            {
                RecordType = r.Item1,
                RecordDate = r.Item2,
                Diagnosis = r.Item3,
                Symptoms = r.Item4,
                Prescription = r.Item5,
                FollowUpDate = r.Item6,
                DoctorName = r.Item7
            });
        }
        catch (Exception ex)
        {
            throw new Exception($"Error getting pet medical history: {ex.Message}");
        }
    }

    // ============================================================
    // DOCTOR APIs
    // ============================================================

    public async Task<CreateCheckHealthResponseDto> CreateCheckHealthAsync(CreateCheckHealthDto request)
    {
        try
        {
            var parameters = new[]
            {
                new SqlParameter("@PetID", request.PetId),
                new SqlParameter("@DoctorID", request.DoctorId),
                new SqlParameter("@Symptoms", request.Symptoms),
                new SqlParameter("@Diagnosis", request.Diagnosis ?? (object)DBNull.Value),
                new SqlParameter("@Prescription", request.Prescription ?? (object)DBNull.Value),
                new SqlParameter("@FollowUpDate", request.FollowUpDate ?? (object)DBNull.Value),
                new SqlParameter("@BookingID", request.BookingId ?? (object)DBNull.Value),
            };

            var results = await _context.Database.SqlQueryRaw<decimal>(
                "EXEC usp_CheckHealth_Create @PetID, @DoctorID, @Symptoms, @Diagnosis, @Prescription, @FollowUpDate, @BookingID",
                parameters
            ).ToListAsync();

            var checkId = Convert.ToInt32(results.FirstOrDefault());
            return new CreateCheckHealthResponseDto { NewCheckId = checkId };
        }
        catch (Exception ex)
        {
            throw new Exception($"Error creating check health record: {ex.Message}");
        }
    }

    // ============================================================
    // REPORTS & ANALYTICS APIs
    // ============================================================

    public async Task<List<DoctorRevenueDto>> GetDoctorRevenueAsync(DateTime fromDate, DateTime toDate)
    {
        try
        {
            var parameters = new[]
            {
                new SqlParameter("@FromDate", fromDate.Date),
                new SqlParameter("@ToDate", toDate.Date),
            };

            var results = await _context.Database.SqlQueryRaw<(int, string, int, decimal)>(
                "EXEC usp_GetDoctorRevenue @FromDate, @ToDate",
                parameters
            ).ToListAsync();

            return results.ConvertAll(r => new DoctorRevenueDto
            {
                DoctorId = r.Item1,
                FullName = r.Item2,
                TotalInvoices = r.Item3,
                TotalRevenue = r.Item4
            });
        }
        catch (Exception ex)
        {
            throw new Exception($"Error getting doctor revenue: {ex.Message}");
        }
    }

    public async Task<VisitStatisticsDto> GetVisitStatisticsAsync(DateTime fromDate, DateTime toDate)
    {
        try
        {
            var parameters = new[]
            {
                new SqlParameter("@FromDate", fromDate.Date),
                new SqlParameter("@ToDate", toDate.Date),
            };

            var results = await _context.Database.SqlQueryRaw<int>(
                "EXEC usp_GetVisitStatistics @FromDate, @ToDate",
                parameters
            ).ToListAsync();

            return new VisitStatisticsDto { TotalVisits = results.FirstOrDefault() };
        }
        catch (Exception ex)
        {
            throw new Exception($"Error getting visit statistics: {ex.Message}");
        }
    }

    public async Task<SystemRevenueDto> GetSystemRevenueAsync(DateTime fromDate, DateTime toDate)
    {
        try
        {
            var parameters = new[]
            {
                new SqlParameter("@FromDate", fromDate.Date),
                new SqlParameter("@ToDate", toDate.Date),
            };

            var results = await _context.Database.SqlQueryRaw<decimal?>(
                "EXEC usp_GetSystemRevenue @FromDate, @ToDate",
                parameters
            ).ToListAsync();

            return new SystemRevenueDto { TotalSystemRevenue = results.FirstOrDefault() ?? 0 };
        }
        catch (Exception ex)
        {
            throw new Exception($"Error getting system revenue: {ex.Message}");
        }
    }

    public async Task<List<ProductRevenueDto>> GetProductRevenueAsync(DateTime fromDate, DateTime toDate)
    {
        try
        {
            var parameters = new[]
            {
                new SqlParameter("@FromDate", fromDate.Date),
                new SqlParameter("@ToDate", toDate.Date),
            };

            var results = await _context.Database.SqlQueryRaw<(string, int, decimal)>(
                "EXEC usp_GetProductRevenueByCategory @FromDate, @ToDate",
                parameters
            ).ToListAsync();

            return results.ConvertAll(r => new ProductRevenueDto
            {
                Category = r.Item1,
                TotalSoldQuantity = r.Item2,
                CategoryRevenue = r.Item3
            });
        }
        catch (Exception ex)
        {
            throw new Exception($"Error getting product revenue: {ex.Message}");
        }
    }

    public async Task<List<TopSellingProductDto>> GetTopSellingProductsAsync(int top = 10)
    {
        try
        {
            var parameter = new SqlParameter("@Top", top);

            var results = await _context.Database.SqlQueryRaw<(string, string, int)>(
                "EXEC usp_GetTopSellingProducts @Top",
                parameter
            ).ToListAsync();

            return results.ConvertAll(r => new TopSellingProductDto
            {
                Name = r.Item1,
                Category = r.Item2,
                TotalQuantity = r.Item3
            });
        }
        catch (Exception ex)
        {
            throw new Exception($"Error getting top selling products: {ex.Message}");
        }
    }

    public async Task<List<DoctorScheduleDto>> GetDoctorScheduleAsync(int doctorId, DateTime date)
    {
        try
        {
            var parameters = new[]
            {
                new SqlParameter("@DoctorID", doctorId),
                new SqlParameter("@Date", date.Date),
            };

            var results = await _context.Database.SqlQueryRaw<(DateTime, string, string)>(
                "EXEC usp_GetDoctorScheduleByDate @DoctorID, @Date",
                parameters
            ).ToListAsync();

            return results.ConvertAll(r => new DoctorScheduleDto
            {
                AppointmentTime = r.Item1,
                PetName = r.Item2,
                Activity = r.Item3
            });
        }
        catch (Exception ex)
        {
            throw new Exception($"Error getting doctor schedule: {ex.Message}");
        }
    }

    public async Task<BranchPerformanceDto> GetBranchPerformanceAsync(int branchId, DateTime fromDate, DateTime toDate)
    {
        try
        {
            var parameters = new[]
            {
                new SqlParameter("@BranchID", branchId),
                new SqlParameter("@FromDate", fromDate.Date),
                new SqlParameter("@ToDate", toDate.Date),
            };

            var results = await _context.Database.SqlQueryRaw<(string, decimal, int, int)>(
                "EXEC usp_Manager_GetBranchPerformance @BranchID, @FromDate, @ToDate",
                parameters
            ).ToListAsync();
            var result = results.FirstOrDefault();

            return new BranchPerformanceDto
            {
                ItemType = result.Item1,
                Revenue = result.Item2,
                TotalInvoices = result.Item3,
                TotalVisits = result.Item4
            };
        }
        catch (Exception ex)
        {
            throw new Exception($"Error getting branch performance: {ex.Message}");
        }
    }

    public async Task<List<DoctorEfficiencyDto>> GetDoctorEfficiencyAsync(int branchId)
    {
        try
        {
            var parameter = new SqlParameter("@BranchID", branchId);

            var results = await _context.Database.SqlQueryRaw<(string, int, decimal)>(
                "EXEC usp_Manager_GetDoctorEfficiency @BranchID",
                parameter
            ).ToListAsync();

            return results.ConvertAll(r => new DoctorEfficiencyDto
            {
                DoctorName = r.Item1,
                TotalTreatments = r.Item2,
                TotalRevenueGenerated = r.Item3
            });
        }
        catch (Exception ex)
        {
            throw new Exception($"Error getting doctor efficiency: {ex.Message}");
        }
    }

    public async Task<List<MonthlyDetailedRevenueDto>> GetMonthlyDetailedRevenueAsync(int branchId, int month, int year)
    {
        try
        {
            var parameters = new[]
            {
                new SqlParameter("@BranchID", branchId),
                new SqlParameter("@Month", month),
                new SqlParameter("@Year", year),
            };

            var results = await _context.Database.SqlQueryRaw<(string, decimal, int)>(
                "EXEC usp_BranchManager_MonthlyDetailedRevenue @BranchID, @Month, @Year",
                parameters
            ).ToListAsync();

            return results.ConvertAll(r => new MonthlyDetailedRevenueDto
            {
                LoaiHinh = r.Item1,
                TongDoanhThu = r.Item2,
                SoLuongBanRa = r.Item3
            });
        }
        catch (Exception ex)
        {
            throw new Exception($"Error getting monthly detailed revenue: {ex.Message}");
        }
    }

    public async Task<ReviewSummaryDto> GetReviewSummaryAsync(int branchId)
    {
        try
        {
            var parameter = new SqlParameter("@BranchID", branchId);

            // Thực thi proc (trả về 2 result sets)
            // Đối với EF Core, phải gọi riêng từng query
            var summaryResults = await _context.Database.SqlQueryRaw<(decimal, decimal, decimal, int)>(
                "EXEC usp_BranchManager_ReviewSummary @BranchID",
                parameter
            ).ToListAsync();
            var summaryResult = summaryResults.FirstOrDefault();

            var negativeReviews = await _context.Database.SqlQueryRaw<(int, int, string, DateTime)>(
                "SELECT CustomerID, RatingOverall, Comment, CreatedAt FROM Review WHERE BranchID = @BranchID AND RatingOverall <= 3 ORDER BY CreatedAt DESC",
                parameter
            ).ToListAsync();

            return new ReviewSummaryDto
            {
                DiemDichVuTrungBinh = summaryResult.Item1,
                DiemThaiDotTrungBinh = summaryResult.Item2,
                DiemTongTheTrungBinh = summaryResult.Item3,
                TongSoLuotDanhGia = summaryResult.Item4,
                NegativeReviews = negativeReviews.ConvertAll(r => new NegativeReviewDto
                {
                    CustomerId = r.Item1,
                    RatingOverall = r.Item2,
                    Comment = r.Item3,
                    CreatedAt = r.Item4
                })
            };
        }
        catch (Exception ex)
        {
            throw new Exception($"Error getting review summary: {ex.Message}");
        }
    }

    public async Task<List<TopCustomerDto>> GetTopCustomersAsync(int branchId)
    {
        try
        {
            var parameter = new SqlParameter("@BranchID", branchId);

            var results = await _context.Database.SqlQueryRaw<(string, string, decimal, string)>(
                "EXEC usp_BranchManager_TopCustomers @BranchID",
                parameter
            ).ToListAsync();

            return results.ConvertAll(r => new TopCustomerDto
            {
                TenKhachHang = r.Item1,
                SoDienThoai = r.Item2,
                TongChiTieuTaiChiNhanh = r.Item3,
                HangThanhVien = r.Item4
            });
        }
        catch (Exception ex)
        {
            throw new Exception($"Error getting top customers: {ex.Message}");
        }
    }

    public async Task<List<BranchRevenueComparisonDto>> GetGlobalRevenueDashboardAsync(int year)
    {
        try
        {
            var parameter = new SqlParameter("@Year", year);

            var results = await _context.Database.SqlQueryRaw<(string, decimal, int)>(
                "EXEC usp_Admin_GlobalRevenueDashboard @Year",
                parameter
            ).ToListAsync();

            return results.ConvertAll(r => new BranchRevenueComparisonDto
            {
                BranchName = r.Item1,
                YearlyRevenue = r.Item2,
                TotalTransactions = r.Item3
            });
        }
        catch (Exception ex)
        {
            throw new Exception($"Error getting global revenue dashboard: {ex.Message}");
        }
    }

    public async Task TransferEmployeeAsync(TransferEmployeeDto request)
    {
        try
        {
            var parameters = new[]
            {
                new SqlParameter("@EmployeeID", request.EmployeeId),
                new SqlParameter("@NewBranchID", request.NewBranchId),
            };

            await _context.Database.ExecuteSqlRawAsync(
                "EXEC usp_Admin_TransferEmployee @EmployeeID, @NewBranchID",
                parameters
            );
        }
        catch (Exception ex)
        {
            throw new Exception($"Error transferring employee: {ex.Message}");
        }
    }

    public async Task UpdateMembershipPolicyAsync(UpdateMembershipPolicyDto request)
    {
        try
        {
            var parameters = new[]
            {
                new SqlParameter("@TierID", request.TierId),
                new SqlParameter("@NewMinSpend", request.NewMinSpend),
                new SqlParameter("@NewBenefits", request.NewBenefits),
            };

            await _context.Database.ExecuteSqlRawAsync(
                "EXEC usp_Admin_UpdateMembershipPolicy @TierID, @NewMinSpend, @NewBenefits",
                parameters
            );
        }
        catch (Exception ex)
        {
            throw new Exception($"Error updating membership policy: {ex.Message}");
        }
    }
}
