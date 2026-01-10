using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PetCareX.Api.Data;
using PetCareX.Api.Dtos;
using PetCareX.Api.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PetCareX.Api.Controllers;

/// <summary>
/// API endpoints for receptionist dashboard statistics and data.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ReceptionistDashboardController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    /// <summary>
    /// Initializes a new instance of <see cref="ReceptionistDashboardController"/>.
    /// </summary>
    public ReceptionistDashboardController(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Gets dashboard summary statistics for today.
    /// </summary>
    /// <returns>Dashboard summary with booking counts and customer statistics</returns>
    [HttpGet("summary")]
    public async Task<ActionResult<DashboardSummaryDto>> GetDashboardSummary([FromQuery] int branchId, [FromQuery] DateTime? date = null)
    {
        var targetDate = date ?? TimeZoneHelper.GetVietnamToday();
        var startOfDay = targetDate.Date;
        var endOfDay = startOfDay.AddDays(1);

        // Lấy lịch hẹn trong ngày của chi nhánh này - filter by branchId directly
        var todayBookings = await _context.Bookings
            .Include(b => b.Customer)
            .Where(b => b.RequestedDateTime >= startOfDay && 
                       b.RequestedDateTime < endOfDay &&
                       b.BranchId == branchId)
            .ToListAsync();

        // Đếm theo trạng thái
        var totalBookings = todayBookings.Count;
        var pendingBookings = todayBookings.Count(b => b.Status == "Pending");
        var completedBookings = todayBookings.Count(b => b.Status == "Completed");

        // Đếm khách hàng mới của chi nhánh (có invoice tại chi nhánh trong 7 ngày qua)
        var sevenDaysAgo = targetDate.AddDays(-7);
        var newCustomers = await _context.Invoices
            .Where(i => i.BranchId == branchId && 
                       i.InvoiceDate >= sevenDaysAgo)
            .Select(i => i.CustomerId)
            .Distinct()
            .CountAsync();

        return new DashboardSummaryDto
        {
            TotalBookingsToday = totalBookings,
            PendingBookings = pendingBookings,
            CompletedBookings = completedBookings,
            NewCustomers = newCustomers
        };
    }

    /// <summary>
    /// Gets detailed list of today's bookings with customer and pet information.
    /// </summary>
    /// <param name="branchId">Branch ID to filter bookings</param>
    /// <param name="date">Target date (default: today)</param>
    /// <returns>List of bookings with full details</returns>
    [HttpGet("today-bookings")]
    public async Task<ActionResult<List<BookingDetailDto>>> GetTodayBookings([FromQuery] int branchId, [FromQuery] DateTime? date = null)
    {
        var targetDate = date ?? TimeZoneHelper.GetVietnamToday();
        var startOfDay = targetDate.Date;
        var endOfDay = startOfDay.AddDays(1);
        
        Console.WriteLine($"[TODAY-BOOKINGS] Query with branchId={branchId}, startOfDay={startOfDay:yyyy-MM-dd HH:mm:ss}, endOfDay={endOfDay:yyyy-MM-dd HH:mm:ss}");

        // Get all today's bookings for this branch - using raw SQL with CAST for date comparison
        // Note: ORDER BY removed from SQL because subqueries can't have ORDER BY without TOP/OFFSET
        var bookings = await _context.Bookings
            .FromSqlInterpolated($@"
                SELECT b.* FROM [Booking] AS b
                WHERE CAST(b.RequestedDateTime AS DATE) = CAST({startOfDay} AS DATE)
                AND b.BranchId = {branchId}
            ")
            .Include(b => b.Customer)
            .Include(b => b.Pet)
            .Include(b => b.Doctor)
            .OrderByDescending(b => b.CreatedAt)
            .ThenBy(b => b.BookingId)
            .ToListAsync();

        Console.WriteLine($"[TODAY-BOOKINGS] Found {bookings.Count} bookings");

        // Map to DTOs
        var result = bookings.Select(b => new BookingDetailDto
        {
            BookingId = b.BookingId,
            BookingTime = b.RequestedDateTime,
            CustomerName = b.Customer.FullName,
            PetName = b.Pet.Name,
            PetType = b.Pet.Species,
            ServiceType = b.BookingType,
            Status = b.Status,
            DoctorName = b.Doctor?.FullName,
            Notes = b.Notes
        }).ToList();

        return result;
    }

    /// <summary>
    /// Gets list of customers waiting (bookings with pending status).
    /// </summary>
    /// <returns>List of customers waiting</returns>
    [HttpGet("waiting-customers")]
    public async Task<ActionResult<List<WaitingCustomerDto>>> GetWaitingCustomers([FromQuery] int branchId)
    {
        var today = TimeZoneHelper.GetVietnamToday();
        var now = TimeZoneHelper.GetVietnamNow();

        // Filter by branch through customer invoices
        var branchCustomerIds = await _context.Invoices
            .Where(i => i.BranchId == branchId)
            .Select(i => i.CustomerId)
            .Distinct()
            .ToListAsync();

        var waitingCustomers = await _context.Bookings
            .Include(b => b.Customer)
            .Include(b => b.Pet)
            .Where(b => b.RequestedDateTime.Date == today && 
                       b.Status == "Pending" &&
                       b.RequestedDateTime >= now &&
                       b.RequestedDateTime <= now.AddHours(2) && // Trong vòng 2 giờ tới
                       branchCustomerIds.Contains(b.CustomerId))
            .OrderBy(b => b.RequestedDateTime)
            .Select(b => new WaitingCustomerDto
            {
                BookingId = b.BookingId,
                PetId = b.Pet.PetId,
                CustomerId = b.Customer.CustomerId,
                CustomerName = b.Customer.FullName,
                PetName = b.Pet.Name,
                BookingTime = b.RequestedDateTime,
                ServiceType = b.BookingType,
                WaitingDuration = EF.Functions.DateDiffMinute(b.RequestedDateTime, now)
            })
            .Take(10)
            .ToListAsync();

        return waitingCustomers;
    }

    /// <summary>
    /// Gets recent customers (created in the last 30 days).
    /// </summary>
    /// <param name="days">Number of days to look back (default: 30)</param>
    /// <returns>List of recent customers</returns>
    [HttpGet("recent-customers")]
    public async Task<ActionResult<List<RecentCustomerDto>>> GetRecentCustomers([FromQuery] int days = 30)
    {
        var cutoffDate = DateOnly.FromDateTime(TimeZoneHelper.GetVietnamToday().AddDays(-days));

        var recentCustomers = await _context.Customers
            .Include(c => c.MembershipTier)
            .Where(c => c.MemberSince >= cutoffDate)
            .OrderByDescending(c => c.MemberSince)
            .Take(20)
            .Select(c => new RecentCustomerDto
            {
                CustomerId = c.CustomerId,
                FullName = c.FullName,
                Phone = c.Phone,
                Email = c.Email,
                MemberSince = c.MemberSince,
                MembershipTier = c.MembershipTier.Name,
                PointsBalance = c.PointsBalance
            })
            .ToListAsync();

        return recentCustomers;
    }

    /// <summary>
    /// Updates booking status (for check-in, completion, cancellation).
    /// </summary>
    /// <param name="bookingId">Booking ID</param>
    /// <param name="request">Status update request</param>
    /// <returns>Success result</returns>
    [HttpPut("update-booking-status/{bookingId}")]
    public async Task<IActionResult> UpdateBookingStatus(int bookingId, [FromBody] UpdateBookingStatusDto request)
    {
        var booking = await _context.Bookings.FindAsync(bookingId);
        if (booking == null)
        {
            return NotFound(new { message = "Không tìm thấy lịch hẹn" });
        }

        try
        {
            // Use raw SQL to bypass trigger OUTPUT clause issue
            var oldStatus = booking.Status;
            
            // Update Booking
            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                UPDATE Booking 
                SET Status = {request.NewStatus},
                    Notes = {request.Notes}
                WHERE BookingId = {bookingId}
            ");
            
            // Insert BookingHistory
            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                INSERT INTO BookingHistory (BookingId, OldStatus, NewStatus, ActionType, Timestamp, Notes)
                VALUES ({bookingId}, {oldStatus}, {request.NewStatus}, 'StatusChanged', GETDATE(), {request.Reason})
            ");
            
            return Ok(new { message = "Cập nhật trạng thái thành công", bookingId = bookingId });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Lỗi khi cập nhật", error = ex.Message });
        }
    }

    /// <summary>
    /// Quick check-in for a booking.
    /// </summary>
    /// <param name="bookingId">Booking ID</param>
    /// <param name="request">Check-in request containing employee ID</param>
    /// <returns>Success result</returns>
    [HttpPost("check-in/{bookingId}")]
    public async Task<IActionResult> CheckIn(int bookingId, [FromBody] CheckInDto request)
    {
        try
        {
            // Dùng raw SQL để bypass trigger issue với OUTPUT clause
            await _context.Database.ExecuteSqlInterpolatedAsync(
                $"UPDATE [dbo].[Booking] SET [Status] = 'Confirmed' WHERE [BookingID] = {bookingId}"
            );
            
            // Tạo lịch sử check-in
            var history = new Models.BookingHistory
            {
                BookingId = bookingId,
                OldStatus = "Pending",
                NewStatus = "Confirmed",
                ActionType = "CheckIn",
                Timestamp = TimeZoneHelper.GetVietnamNow(),
                Notes = $"Check-in bởi nhân viên ID: {request.EmployeeId}"
            };

            _context.BookingHistories.Add(history);
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Check-in thành công", bookingId = bookingId });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Check-in error: {ex.Message}");
            Console.WriteLine($"Inner exception: {ex.InnerException?.Message}");
            return BadRequest(new { message = "Lỗi khi check-in", error = ex.InnerException?.Message ?? ex.Message });
        }
    }

    /// <summary>
    /// Search customers by name or phone.
    /// </summary>
    /// <param name="query">Search query</param>
    /// <returns>List of matching customers</returns>
    [HttpGet("search-customers")]
    public async Task<ActionResult<List<CustomerSearchResultDto>>> SearchCustomers([FromQuery] string query)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return BadRequest(new { message = "Vui lòng nhập từ khóa tìm kiếm" });
        }

        query = query.Trim().ToLower();

        var customers = await _context.Customers
            .Include(c => c.MembershipTier)
            .Include(c => c.Pets)
            .Where(c => c.FullName.ToLower().Contains(query) || 
                       c.Phone.Contains(query) ||
                       (c.Email != null && c.Email.ToLower().Contains(query)))
            .OrderBy(c => c.FullName)
            .Take(20)
            .Select(c => new CustomerSearchResultDto
            {
                CustomerId = c.CustomerId,
                FullName = c.FullName,
                Phone = c.Phone,
                Email = c.Email,
                MembershipTier = c.MembershipTier.Name,
                TotalPets = c.Pets.Count,
                PointsBalance = c.PointsBalance
            })
            .ToListAsync();

        return customers;
    }

    /// <summary>
    /// Gets hourly booking distribution for today.
    /// </summary>
    /// <returns>Booking count by hour</returns>
    [HttpGet("hourly-bookings")]
    public async Task<ActionResult<List<HourlyBookingDto>>> GetHourlyBookings([FromQuery] DateTime? date = null)
    {
        var targetDate = date ?? TimeZoneHelper.GetVietnamToday();
        var startOfDay = targetDate.Date;
        var endOfDay = startOfDay.AddDays(1);

        var bookings = await _context.Bookings
            .Where(b => b.RequestedDateTime >= startOfDay && b.RequestedDateTime < endOfDay)
            .GroupBy(b => b.RequestedDateTime.Hour)
            .Select(g => new HourlyBookingDto
            {
                Hour = g.Key,
                BookingCount = g.Count(),
                CompletedCount = g.Count(b => b.Status == "Completed")
            })
            .OrderBy(x => x.Hour)
            .ToListAsync();

        return bookings;
    }

    /// <summary>
    /// Gets customers list with statistics for receptionist view.
    /// </summary>
    /// <param name="search">Search query (name, phone, email)</param>
    /// <param name="tier">Filter by membership tier</param>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Page size (default: 50, max: 100)</param>
    /// <returns>Paginated customer list with aggregated statistics</returns>
    [HttpGet("customers")]
    public async Task<ActionResult<ReceptionistCustomersResult>> GetCustomers(
        [FromQuery] string? search = null,
        [FromQuery] string? tier = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 50;
        if (pageSize > 100) pageSize = 100;

        var query = _context.Customers
            .AsNoTracking()
            .Include(c => c.MembershipTier)
            .AsQueryable();

        // Search filter
        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.Trim().ToLower();
            query = query.Where(c => 
                c.FullName.ToLower().Contains(searchLower) ||
                c.Phone.Contains(search) ||
                (c.Email != null && c.Email.ToLower().Contains(searchLower))
            );
        }

        // Tier filter
        if (!string.IsNullOrWhiteSpace(tier) && tier != "all")
        {
            query = query.Where(c => c.MembershipTier.Name == tier);
        }

        var totalCount = await query.CountAsync();

        // Get customers for current page
        var customers = await query
            .OrderBy(c => c.FullName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new
            {
                c.CustomerId,
                c.FullName,
                c.Phone,
                c.Email,
                c.Gender,
                c.MemberSince,
                c.PointsBalance,
                MembershipTier = c.MembershipTier.Name
            })
            .ToListAsync();

        var customerIds = customers.Select(c => c.CustomerId).ToList();

        // Get aggregated pets count in one query
        var petsCount = await _context.Pets
            .AsNoTracking()
            .Where(p => customerIds.Contains(p.CustomerId))
            .GroupBy(p => p.CustomerId)
            .Select(g => new { CustomerId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.CustomerId, x => x.Count);

        // Get aggregated bookings count and last booking in one query
        var bookingsStats = await _context.Bookings
            .AsNoTracking()
            .Where(b => customerIds.Contains(b.CustomerId))
            .GroupBy(b => b.CustomerId)
            .Select(g => new 
            { 
                CustomerId = g.Key, 
                Count = g.Count(),
                LastBooking = g.Max(b => b.RequestedDateTime)
            })
            .ToDictionaryAsync(x => x.CustomerId);

        // Combine results
        var result = customers.Select(c => new CustomerListItemDto
        {
            CustomerId = c.CustomerId,
            FullName = c.FullName,
            Phone = c.Phone,
            Email = c.Email,
            Gender = c.Gender,
            MembershipTier = c.MembershipTier,
            MemberSince = c.MemberSince,
            PointsBalance = c.PointsBalance,
            PetsCount = petsCount.GetValueOrDefault(c.CustomerId, 0),
            TotalBookings = bookingsStats.ContainsKey(c.CustomerId) ? bookingsStats[c.CustomerId].Count : 0,
            LastBooking = bookingsStats.ContainsKey(c.CustomerId) ? bookingsStats[c.CustomerId].LastBooking : null
        }).ToList();

        return new ReceptionistCustomersResult
        {
            Items = result,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
        };
    }

    /// <summary>
    /// Get all bookings with customer and pet details for management
    /// </summary>
    /// <param name="branchId">Branch ID to filter bookings (required)</param>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Items per page (default: 20)</param>
    /// <param name="status">Optional status filter (Pending, Confirmed, Completed, Cancelled)</param>
    /// <param name="date">Optional date filter (yyyy-MM-dd format)</param>
    /// <returns>Paginated list of all bookings with details for the branch</returns>
    [HttpGet("all-bookings")]
    public async Task<ActionResult<object>> GetAllBookings(
        [FromQuery] int branchId, 
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 20,
        [FromQuery] string? status = null,
        [FromQuery] string? date = null,
        [FromQuery] string? search = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;

        Console.WriteLine($"[DEBUG] all-bookings called with branchId={branchId}, page={page}, pageSize={pageSize}, search={search}");

        // Filter by BranchId directly (now that bookings have BranchId)
        var query = _context.Bookings
            .Include(b => b.Customer)
            .Include(b => b.Pet)
            .Where(b => b.BranchId == branchId);

        Console.WriteLine($"[DEBUG] Filtering by branchId={branchId}");

        // Apply search filter if provided
        if (!string.IsNullOrEmpty(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(b => 
                b.Customer.FullName.ToLower().Contains(searchLower) ||
                b.Pet.Name.ToLower().Contains(searchLower));
            Console.WriteLine($"[DEBUG] Filtering by search: {search}");
        }

        // Apply status filter if provided
        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(b => b.Status == status);
            Console.WriteLine($"[DEBUG] Filtering by status: {status}");
        }

        // Apply date filter if provided
        if (!string.IsNullOrEmpty(date) && DateTime.TryParse(date, out var filterDate))
        {
            var nextDay = filterDate.AddDays(1);
            query = query.Where(b => b.RequestedDateTime >= filterDate && b.RequestedDateTime < nextDay);
            Console.WriteLine($"[DEBUG] Filtering by date: {date}");
        }

        var totalCount = await query.CountAsync();

        Console.WriteLine($"[DEBUG] Total bookings after filters: {totalCount}");

        // Optimized: Sort in SQL using CASE statements (translatable to SQL)
        var today = TimeZoneHelper.GetVietnamToday();
        var tomorrow = today.AddDays(1);
        
        var bookings = await query
            .OrderBy(b => 
                b.RequestedDateTime.Date == today ? 0 : // Today = 0
                b.RequestedDateTime.Date >= tomorrow ? 1 : // Future = 1
                2) // Past = 2
            .ThenBy(b => b.RequestedDateTime) // Sort by actual datetime within each group
            .ThenByDescending(b => b.Status == "Pending" ? 1 : 0) // Pending first
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(b => new BookingDetailDto
            {
                BookingId = b.BookingId,
                BookingTime = b.RequestedDateTime,
                CustomerName = b.Customer.FullName,
                PetName = b.Pet.Name,
                PetType = b.Pet.Species,
                ServiceType = b.BookingType,
                Status = b.Status,
                Notes = b.Notes
            })
            .ToListAsync();

        Console.WriteLine($"[DEBUG] Retrieved {bookings.Count} bookings for page {page}");
        if (bookings.Any())
        {
            var dates = bookings.Select(b => b.BookingTime.Date).Distinct().ToList();
            Console.WriteLine($"[DEBUG] Date diversity: {dates.Count} different dates");
            Console.WriteLine($"[DEBUG] Date range: {dates.Min():yyyy-MM-dd} to {dates.Max():yyyy-MM-dd}");
        }

        return Ok(new { 
            items = bookings, 
            totalCount = totalCount, 
            page = page, 
            pageSize = pageSize,
            totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
        });
    }
}

#region DTOs

/// <summary>
/// Dashboard summary statistics.
/// </summary>
public class DashboardSummaryDto
{
    /// <summary>Total bookings for today</summary>
    public int TotalBookingsToday { get; set; }
    /// <summary>Pending bookings</summary>
    public int PendingBookings { get; set; }
    /// <summary>Completed bookings</summary>
    public int CompletedBookings { get; set; }
    /// <summary>New customers (last 7 days)</summary>
    public int NewCustomers { get; set; }
}

/// <summary>
/// Waiting customer information.
/// </summary>
public class WaitingCustomerDto
{
    /// <summary>Booking ID</summary>
    public int BookingId { get; set; }
    /// <summary>Pet ID</summary>
    public int PetId { get; set; }
    /// <summary>Customer ID</summary>
    public int CustomerId { get; set; }
    /// <summary>Customer name</summary>
    public string CustomerName { get; set; } = string.Empty;
    /// <summary>Pet name</summary>
    public string PetName { get; set; } = string.Empty;
    /// <summary>Booking time</summary>
    public DateTime BookingTime { get; set; }
    /// <summary>Service type</summary>
    public string ServiceType { get; set; } = string.Empty;
    /// <summary>Waiting duration in minutes</summary>
    public int? WaitingDuration { get; set; }
}

/// <summary>
/// Recent customer information.
/// </summary>
public class RecentCustomerDto
{
    /// <summary>Customer ID</summary>
    public int CustomerId { get; set; }
    /// <summary>Full name</summary>
    public string FullName { get; set; } = string.Empty;
    /// <summary>Phone number</summary>
    public string Phone { get; set; } = string.Empty;
    /// <summary>Email address</summary>
    public string? Email { get; set; }
    /// <summary>Member since date</summary>
    public DateOnly MemberSince { get; set; }
    /// <summary>Membership tier name</summary>
    public string MembershipTier { get; set; } = string.Empty;
    /// <summary>Loyalty points balance</summary>
    public int PointsBalance { get; set; }
}

/// <summary>
/// Update booking status request.
/// </summary>
public class UpdateBookingStatusDto
{
    /// <summary>Old status (optional for history)</summary>
    public string? OldStatus { get; set; }
    /// <summary>New status to set</summary>
    public string NewStatus { get; set; } = string.Empty;
    /// <summary>Reason for status change</summary>
    public string? Reason { get; set; }
    /// <summary>Employee ID making the change</summary>
    public int? ChangedBy { get; set; }
    /// <summary>Additional notes</summary>
    public string? Notes { get; set; }
}

/// <summary>
/// Check-in request.
/// </summary>
public class CheckInDto
{
    /// <summary>Employee ID performing check-in</summary>
    public int EmployeeId { get; set; }
}

/// <summary>
/// Customer search result.
/// </summary>
public class CustomerSearchResultDto
{
    /// <summary>Customer ID</summary>
    public int CustomerId { get; set; }
    /// <summary>Full name</summary>
    public string FullName { get; set; } = string.Empty;
    /// <summary>Phone number</summary>
    public string Phone { get; set; } = string.Empty;
    /// <summary>Email address</summary>
    public string? Email { get; set; }
    /// <summary>Membership tier</summary>
    public string MembershipTier { get; set; } = string.Empty;
    /// <summary>Total number of pets</summary>
    public int TotalPets { get; set; }
    /// <summary>Points balance</summary>
    public int PointsBalance { get; set; }
}

/// <summary>
/// Hourly booking statistics.
/// </summary>
public class HourlyBookingDto
{
    /// <summary>Hour of day (0-23)</summary>
    public int Hour { get; set; }
    /// <summary>Number of bookings in this hour</summary>
    public int BookingCount { get; set; }
    /// <summary>Number of completed bookings</summary>
    public int CompletedCount { get; set; }
}

/// <summary>
/// Customer list item with statistics.
/// </summary>
public class CustomerListItemDto
{
    public int CustomerId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Gender { get; set; }
    public string MembershipTier { get; set; } = string.Empty;
    public DateOnly? MemberSince { get; set; }
    public int PointsBalance { get; set; }
    public int PetsCount { get; set; }
    public int TotalBookings { get; set; }
    public DateTime? LastBooking { get; set; }
}

/// <summary>
/// Paginated result for customers list.
/// </summary>
public class ReceptionistCustomersResult
{
    public List<CustomerListItemDto> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
}

#endregion
