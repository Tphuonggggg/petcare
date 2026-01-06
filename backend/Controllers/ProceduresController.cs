using Microsoft.AspNetCore.Mvc;
using PetCareX.Api.Dtos;
using PetCareX.Api.Services;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PetCareX.Api.Controllers;

/// <summary>
/// API endpoints for procedures - Receptionist, Staff, Customer, Doctor, Manager
/// </summary>
[ApiController]
[Route("api/procedures")]
public class ProceduresController : ControllerBase
{
    private readonly IStoredProcedureService _service;

    public ProceduresController(IStoredProcedureService service)
    {
        _service = service;
    }

    // ============================================================
    // RECEPTIONIST APIs
    // ============================================================

    /// <summary>
    /// Create booking by receptionist (customer walking in)
    /// </summary>
    [HttpPost("receptionist/create-booking")]
    public async Task<ActionResult<CreateBookingResponseDto>> CreateBookingByStaff([FromBody] Dtos.CreateBookingByStaffDto request)
    {
        try
        {
            var result = await _service.CreateBookingByStaffAsync(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Find customer's pets by phone number
    /// </summary>
    [HttpGet("receptionist/find-pet-by-phone")]
    public async Task<ActionResult<List<CustomerPetResultDto>>> FindPetByCustomerPhone([FromQuery] string phone)
    {
        try
        {
            var result = await _service.FindPetByCustomerPhoneAsync(phone);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Find available doctors for booking
    /// </summary>
    [HttpPost("receptionist/find-available-doctors")]
    public async Task<ActionResult<List<AvailableDoctorDto>>> FindAvailableDoctors([FromBody] FindAvailableDoctorDto request)
    {
        try
        {
            var result = await _service.FindAvailableDoctorsAsync(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Search medicines/products by keyword
    /// </summary>
    [HttpGet("receptionist/search-medicine")]
    public async Task<ActionResult<List<MedicineDto>>> SearchMedicine([FromQuery] string keyword)
    {
        try
        {
            var result = await _service.SearchMedicineAsync(keyword);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Register new pet for customer
    /// </summary>
    [HttpPost("receptionist/register-pet")]
    public async Task<ActionResult<PetDto>> RegisterNewPet([FromBody] RegisterNewPetDto request)
    {
        try
        {
            var result = await _service.RegisterNewPetAsync(request);
            return CreatedAtAction(nameof(RegisterNewPet), new { id = result.PetId }, result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // ============================================================
    // STAFF ORDER MANAGEMENT APIs
    // ============================================================

    /// <summary>
    /// Create a new order (pending status)
    /// </summary>
    [HttpPost("staff/create-order")]
    public async Task<ActionResult<CreateOrderResponseDto>> CreateOrder([FromBody] CreateOrderDto request)
    {
        try
        {
            var result = await _service.CreateOrderAsync(request);
            return CreatedAtAction(nameof(CreateOrder), new { id = result.InvoiceId }, result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Add item to pending order
    /// </summary>
    [HttpPost("staff/add-item-to-order")]
    public async Task<IActionResult> AddItemToOrder([FromBody] AddItemToOrderDto request)
    {
        try
        {
            await _service.AddItemToOrderAsync(request);
            return Ok(new { message = "Item added to order" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Confirm and pay invoice
    /// </summary>
    [HttpPost("staff/confirm-invoice")]
    public async Task<ActionResult<ConfirmInvoiceResponseDto>> ConfirmInvoice([FromBody] ConfirmInvoiceDto request)
    {
        try
        {
            var result = await _service.ConfirmInvoiceAsync(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // ============================================================
    // CUSTOMER APIs
    // ============================================================

    /// <summary>
    /// Get customer's invoice history
    /// </summary>
    [HttpGet("customer/{customerId}/invoice-history")]
    public async Task<ActionResult<List<CustomerInvoiceHistoryDto>>> GetCustomerInvoiceHistory(int customerId)
    {
        try
        {
            var result = await _service.GetCustomerInvoiceHistoryAsync(customerId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Search products available for customer purchase
    /// </summary>
    [HttpPost("customer/search-products")]
    public async Task<ActionResult<List<CustomerProductDto>>> SearchProducts([FromBody] CustomerSearchProductDto request)
    {
        try
        {
            var result = await _service.SearchProductsAsync(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Customer purchase product
    /// </summary>
    [HttpPost("customer/purchase-product")]
    public async Task<ActionResult<int>> PurchaseProduct([FromBody] CustomerPurchaseProductDto request)
    {
        try
        {
            var invoiceId = await _service.PurchaseProductAsync(request);
            return CreatedAtAction(nameof(PurchaseProduct), new { id = invoiceId }, new { invoiceId });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get pet's purchase history
    /// </summary>
    [HttpGet("pet/{petId}/purchase-history")]
    public async Task<ActionResult<List<PetPurchaseHistoryDto>>> GetPetPurchaseHistory(int petId)
    {
        try
        {
            var result = await _service.GetPetPurchaseHistoryAsync(petId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get pet's complete medical history (check-ups + vaccinations)
    /// </summary>
    [HttpGet("pet/{petId}/medical-history")]
    public async Task<ActionResult<List<PetMedicalHistoryDto>>> GetPetMedicalHistory(int petId)
    {
        try
        {
            var result = await _service.GetPetMedicalHistoryAsync(petId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // ============================================================
    // DOCTOR APIs
    // ============================================================

    /// <summary>
    /// Create new health check record (diagnosis and prescription)
    /// </summary>
    [HttpPost("doctor/create-check-health")]
    public async Task<ActionResult<CreateCheckHealthResponseDto>> CreateCheckHealth([FromBody] Dtos.CreateCheckHealthDto request)
    {
        try
        {
            var result = await _service.CreateCheckHealthAsync(request);
            return CreatedAtAction(nameof(CreateCheckHealth), new { id = result.NewCheckId }, result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // ============================================================
    // MANAGER/ADMIN REPORTS & ANALYTICS APIs
    // ============================================================

    /// <summary>
    /// Get doctor revenue report for date range
    /// </summary>
    [HttpGet("reports/doctor-revenue")]
    public async Task<ActionResult<List<DoctorRevenueDto>>> GetDoctorRevenue([FromQuery] DateTime fromDate, [FromQuery] DateTime toDate)
    {
        try
        {
            var result = await _service.GetDoctorRevenueAsync(fromDate, toDate);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get visit statistics for date range
    /// </summary>
    [HttpGet("reports/visit-statistics")]
    public async Task<ActionResult<VisitStatisticsDto>> GetVisitStatistics([FromQuery] DateTime fromDate, [FromQuery] DateTime toDate)
    {
        try
        {
            var result = await _service.GetVisitStatisticsAsync(fromDate, toDate);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get system revenue for date range
    /// </summary>
    [HttpGet("reports/system-revenue")]
    public async Task<ActionResult<SystemRevenueDto>> GetSystemRevenue([FromQuery] DateTime fromDate, [FromQuery] DateTime toDate)
    {
        try
        {
            var result = await _service.GetSystemRevenueAsync(fromDate, toDate);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get product revenue breakdown by category
    /// </summary>
    [HttpGet("reports/product-revenue")]
    public async Task<ActionResult<List<ProductRevenueDto>>> GetProductRevenue([FromQuery] DateTime fromDate, [FromQuery] DateTime toDate)
    {
        try
        {
            var result = await _service.GetProductRevenueAsync(fromDate, toDate);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get top selling products
    /// </summary>
    [HttpGet("reports/top-selling-products")]
    public async Task<ActionResult<List<TopSellingProductDto>>> GetTopSellingProducts([FromQuery] int top = 10)
    {
        try
        {
            var result = await _service.GetTopSellingProductsAsync(top);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get doctor's schedule for a specific date
    /// </summary>
    [HttpGet("reports/doctor-schedule")]
    public async Task<ActionResult<List<DoctorScheduleDto>>> GetDoctorSchedule([FromQuery] int doctorId, [FromQuery] DateTime date)
    {
        try
        {
            var result = await _service.GetDoctorScheduleAsync(doctorId, date);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get branch performance metrics for date range
    /// </summary>
    [HttpGet("reports/branch-performance")]
    public async Task<ActionResult<BranchPerformanceDto>> GetBranchPerformance([FromQuery] int branchId, [FromQuery] DateTime fromDate, [FromQuery] DateTime toDate)
    {
        try
        {
            var result = await _service.GetBranchPerformanceAsync(branchId, fromDate, toDate);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get doctor efficiency metrics for a branch
    /// </summary>
    [HttpGet("reports/doctor-efficiency")]
    public async Task<ActionResult<List<DoctorEfficiencyDto>>> GetDoctorEfficiency([FromQuery] int branchId)
    {
        try
        {
            var result = await _service.GetDoctorEfficiencyAsync(branchId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get detailed revenue for a branch by month
    /// </summary>
    [HttpGet("reports/monthly-detailed-revenue")]
    public async Task<ActionResult<List<MonthlyDetailedRevenueDto>>> GetMonthlyDetailedRevenue([FromQuery] int branchId, [FromQuery] int month, [FromQuery] int year)
    {
        try
        {
            var result = await _service.GetMonthlyDetailedRevenueAsync(branchId, month, year);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get review summary for a branch
    /// </summary>
    [HttpGet("reports/review-summary")]
    public async Task<ActionResult<ReviewSummaryDto>> GetReviewSummary([FromQuery] int branchId)
    {
        try
        {
            var result = await _service.GetReviewSummaryAsync(branchId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get top customers for a branch
    /// </summary>
    [HttpGet("reports/top-customers")]
    public async Task<ActionResult<List<TopCustomerDto>>> GetTopCustomers([FromQuery] int branchId)
    {
        try
        {
            var result = await _service.GetTopCustomersAsync(branchId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get global revenue dashboard - compare branches
    /// </summary>
    [HttpGet("reports/global-revenue-dashboard")]
    public async Task<ActionResult<List<BranchRevenueComparisonDto>>> GetGlobalRevenueDashboard([FromQuery] int year)
    {
        try
        {
            var result = await _service.GetGlobalRevenueDashboardAsync(year);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // ============================================================
    // ADMIN MANAGEMENT APIs
    // ============================================================

    /// <summary>
    /// Transfer employee to a different branch
    /// </summary>
    [HttpPost("admin/transfer-employee")]
    public async Task<IActionResult> TransferEmployee([FromBody] TransferEmployeeDto request)
    {
        try
        {
            await _service.TransferEmployeeAsync(request);
            return Ok(new { message = "Employee transferred successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update membership tier policy
    /// </summary>
    [HttpPost("admin/update-membership-policy")]
    public async Task<IActionResult> UpdateMembershipPolicy([FromBody] UpdateMembershipPolicyDto request)
    {
        try
        {
            await _service.UpdateMembershipPolicyAsync(request);
            return Ok(new { message = "Membership policy updated successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
