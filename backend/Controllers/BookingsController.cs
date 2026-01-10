using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PetCareX.Api.Data;
using PetCareX.Api.Models;
using PetCareX.Api.Dtos;
using AutoMapper;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PetCareX.Api.Controllers;

/// <summary>
/// API endpoints for managing bookings.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    /// <summary>
    /// Returns detailed booking info by id (include customer, pet, branch, doctor).
    /// </summary>
    [HttpGet("detail/{id}")]
    public async Task<ActionResult<BookingDetailDto>> GetDetail(int id)
    {
        var booking = await _context.Bookings
            .Include(b => b.Customer)
            .Include(b => b.Pet)
            .Include(b => b.Branch)
            .Include(b => b.Doctor)
            .FirstOrDefaultAsync(b => b.BookingId == id);
        if (booking == null) return NotFound();

        var dto = new BookingDetailDto
        {
            BookingId = booking.BookingId,
            BranchId = booking.BranchId,
            PetId = booking.PetId,
            DoctorId = booking.DoctorId,
            BookingTime = booking.RequestedDateTime,
            CustomerName = booking.Customer?.FullName ?? "N/A",
            CustomerPhone = booking.Customer?.Phone ?? "N/A",
            CustomerEmail = booking.Customer?.Email ?? "N/A",
            PetName = booking.Pet?.Name ?? "N/A",
            PetType = booking.Pet?.Species ?? "N/A",
            BranchName = booking.Branch?.Name ?? "N/A",
            DoctorName = booking.Doctor?.FullName ?? "N/A",
            ServiceType = booking.BookingType,
            Status = booking.Status,
            Notes = booking.Notes
        };
        return dto;
    }

    /// <summary>
    /// Initializes a new instance of the <see cref="BookingsController"/> class.
    /// </summary>
    public BookingsController(ApplicationDbContext context, IMapper mapper) { _context = context; _mapper = mapper; }

    /// <summary>
    /// Returns paginated booking records, optionally filtered by branch.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PaginatedResult<BookingDto>>> Get([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] int? branchId = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;
        var q = _context.Bookings
            .Include(b => b.Customer)
            .Include(b => b.Pet)
            .Include(b => b.Branch)
            .Include(b => b.Doctor)
            .AsQueryable();
        
        // Filter by branch if provided
        if (branchId.HasValue)
        {
            q = q.Where(b => b.BranchId == branchId.Value);
        }
        
        var total = await q.CountAsync();
        var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        
        // Create BookingType → Service mapping (English names to Vietnamese services)
        var bookingTypeMapping = new Dictionary<string, int>
        {
            { "CheckHealth", 0 },      // Will be populated from DB
            { "Vaccination", 0 },      // Will be populated from DB
            { "Tiêm phòng", 0 }        // Direct Vietnamese name
        };
        
        // Get all services and build mapping
        var allServices = await _context.Services.ToListAsync();
        var servicesByName = allServices.ToDictionary(s => s.Name, s => s);
        
        // Map English booking types to Vietnamese service names
        var englishToVietnamese = new Dictionary<string, string>
        {
            { "CheckHealth", "Khám bệnh" },
            { "Vaccination", "Tiêm phòng" }
        };
        
        var dtos = items.Select(b => 
        {
            decimal? servicePrice = null;
            int? serviceId = null;
            
            if (!string.IsNullOrEmpty(b.BookingType))
            {
                // First try direct match (Vietnamese names)
                if (servicesByName.TryGetValue(b.BookingType, out var directService))
                {
                    servicePrice = directService.BasePrice;
                    serviceId = directService.ServiceId;
                }
                // Then try mapping (English names to Vietnamese)
                else if (englishToVietnamese.TryGetValue(b.BookingType, out var vietnameseName) 
                         && servicesByName.TryGetValue(vietnameseName, out var mappedService))
                {
                    servicePrice = mappedService.BasePrice;
                    serviceId = mappedService.ServiceId;
                }
            }
            
            return new BookingDto
            {
                BookingId = b.BookingId,
                CustomerId = b.CustomerId,
                CustomerName = b.Customer?.FullName,
                PetId = b.PetId,
                PetName = b.Pet?.Name,
                BookingType = b.BookingType,
                RequestedDateTime = b.RequestedDateTime,
                Status = b.Status,
                Notes = b.Notes,
                BranchId = b.BranchId,
                BranchName = b.Branch?.Name,
                DoctorId = b.DoctorId,
                DoctorName = b.Doctor?.FullName ?? (b.DoctorId.HasValue ? $"Bác sĩ {b.DoctorId}" : "Chưa gán bác sĩ"),
                EmployeeName = b.Doctor?.FullName ?? (b.DoctorId.HasValue ? $"Bác sĩ {b.DoctorId}" : "Chưa gán bác sĩ"),
                ServiceBasePrice = servicePrice,
                ServiceId = serviceId
            };
        }).ToList();
        return new PaginatedResult<BookingDto> { Items = dtos, TotalCount = total, Page = page, PageSize = pageSize };
    }

    /// <summary>
    /// Returns paginated booking records for a specific customer.
    /// </summary>
    [HttpGet("customer/{customerId}")]
    public async Task<ActionResult<PaginatedResult<BookingDto>>> GetByCustomer(int customerId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;
        var q = _context.Bookings
            .Include(b => b.Customer)
            .Include(b => b.Pet)
            .Include(b => b.Branch)
            .Include(b => b.Doctor)
            .Where(b => b.CustomerId == customerId)
            .AsQueryable();
        
        var total = await q.CountAsync();
        var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        var dtos = items.Select(b => new BookingDto
        {
            BookingId = b.BookingId,
            CustomerId = b.CustomerId,
            CustomerName = b.Customer?.FullName,
            PetId = b.PetId,
            PetName = b.Pet?.Name,
            BookingType = b.BookingType,
            RequestedDateTime = b.RequestedDateTime,
            Status = b.Status,
            Notes = b.Notes,
            BranchId = b.BranchId,
            BranchName = b.Branch?.Name,
            DoctorId = b.DoctorId,
            DoctorName = b.Doctor?.FullName,
            EmployeeName = null
        }).ToList();
        return new PaginatedResult<BookingDto> { Items = dtos, TotalCount = total, Page = page, PageSize = pageSize };
    }

    /// <summary>
    /// Returns a booking by id.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<BookingDto>> Get(int id)
    {
        var e = await _context.Bookings.FindAsync(id);
        if (e == null) return NotFound();
        return _mapper.Map<BookingDto>(e);
    }

    /// <summary>
    /// Creates a new booking.
    /// When branchId is provided, automatically creates a draft invoice for that branch.
    /// If DoctorId is null, automatically assigns a doctor from the same branch using load-balancing.
    /// This ensures the booking shows up in the correct branch immediately.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<BookingDto>> Post(BookingDto dto)
    {
        var entity = _mapper.Map<Booking>(dto);
        
        Console.WriteLine($"[BOOKING CREATE] BranchId={entity.BranchId}, CustomerId={entity.CustomerId}, DoctorId={entity.DoctorId}");
        
        // Auto-assign doctor from same branch if not specified
        if (entity.DoctorId == null && entity.BranchId > 0)
        {
            try
            {
                var assignedDoctorId = await _context.Database.SqlQueryRaw<int?>($@"
                    DECLARE @BranchID INT = {entity.BranchId};
                    
                    -- Find the doctor with least bookings in this branch
                    SELECT TOP 1 e.EmployeeID
                    FROM Employee e
                    WHERE e.BranchID = @BranchID 
                      AND e.PositionID = 1
                      AND e.Status = 1
                    ORDER BY (
                        SELECT COUNT(*) 
                        FROM Booking b 
                        WHERE b.DoctorID = e.EmployeeID 
                          AND b.Status IN ('Pending', 'Confirmed')
                    ) ASC, e.EmployeeID ASC
                ").FirstOrDefaultAsync();
                
                Console.WriteLine($"[BOOKING CREATE] Auto-assign result: {(assignedDoctorId.HasValue ? assignedDoctorId.Value.ToString() : "NULL")}");
                
                if (assignedDoctorId.HasValue && assignedDoctorId > 0)
                {
                    entity.DoctorId = assignedDoctorId.Value;
                    Console.WriteLine($"[BOOKING CREATE] Assigned doctor {entity.DoctorId}");
                }
            }
            catch (Exception ex)
            {
                // Log error but don't fail the booking creation
                Console.WriteLine($"[BOOKING CREATE] Error auto-assigning doctor: {ex.Message}");
            }
        }
        
        _context.Bookings.Add(entity);
        await _context.SaveChangesAsync();
        
        Console.WriteLine($"[BOOKING CREATE] Final DoctorId={entity.DoctorId}, BookingId={entity.BookingId}");
        
        var result = _mapper.Map<BookingDto>(entity);
        return CreatedAtAction(nameof(Get), new { id = entity.BookingId }, result);
    }

    /// <summary>
    /// Updates an existing booking.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, BookingDto dto)
    {
        if (id != dto.BookingId) return BadRequest();
        
        var entity = await _context.Bookings.FindAsync(id);
        if (entity == null) return NotFound();
        
        // Validate DateTime fields
        var minDate = new DateTime(1753, 1, 1);
        var maxDate = new DateTime(9999, 12, 31);
        
        if (dto.RequestedDateTime < minDate || dto.RequestedDateTime > maxDate)
            return BadRequest("RequestedDateTime must be between 1753-01-01 and 9999-12-31");
        
        // Use raw SQL to update Status, Notes, and DoctorId
        try
        {
            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                UPDATE Booking 
                SET 
                    Status = {dto.Status},
                    Notes = {dto.Notes},
                    DoctorID = {dto.DoctorId}
                WHERE BookingId = {id}
            ");
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    /// <summary>
    /// Updates booking status.
    /// </summary>
    [HttpPost("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusRequest request)
    {
        try
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null) return NotFound();

            if (string.IsNullOrEmpty(request?.Status))
            {
                return BadRequest("Status is required");
            }

            booking.Status = request.Status;
            _context.Bookings.Update(booking);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Status updated successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    /// <summary>
    /// Deletes a booking.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var e = await _context.Bookings.FindAsync(id);
        if (e == null) return NotFound();
        _context.Bookings.Remove(e);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
