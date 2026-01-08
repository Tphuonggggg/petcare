using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using PetCareX.Api.Data;
using System;
using System.Data;
using System.Threading.Tasks;

namespace PetCareX.Api.Controllers;

/// <summary>
/// Extended API endpoints for booking operations using stored procedures.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class BookingExtendedController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    /// <summary>
    /// Initializes a new instance of <see cref="BookingExtendedController"/>.
    /// </summary>
    public BookingExtendedController(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Creates a booking by staff member (for walk-in customers).
    /// </summary>
    /// <param name="request">Booking creation request</param>
    /// <returns>New booking ID</returns>
    [HttpPost("create-by-staff")]
    public async Task<ActionResult<BookingCreateResultDto>> CreateBookingByStaff([FromBody] CreateBookingByStaffDto request)
    {
        try
        {
            var result = new BookingCreateResultDto();
            
            using (var command = _context.Database.GetDbConnection().CreateCommand())
            {
                command.CommandText = "usp_CreateBookingByStaff";
                command.CommandType = CommandType.StoredProcedure;
                
                command.Parameters.Add(new SqlParameter("@CustomerID", request.CustomerId));
                command.Parameters.Add(new SqlParameter("@PetID", request.PetId));
                command.Parameters.Add(new SqlParameter("@BookingDate", request.BookingDate));
                command.Parameters.Add(new SqlParameter("@BookingType", request.BookingType));
                command.Parameters.Add(new SqlParameter("@StaffID", request.StaffId));
                
                await _context.Database.OpenConnectionAsync();
                
                using (var reader = await command.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        result.NewBookingId = reader.GetInt32(0);
                    }
                }
            }
            
            return CreatedAtAction(nameof(CreateBookingByStaff), new { id = result.NewBookingId }, result);
        }
        catch (SqlException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Creates a booking by customer (online booking).
    /// </summary>
    /// <param name="request">Booking creation request</param>
    /// <returns>New booking ID</returns>
    [HttpPost("create-by-customer")]
    public async Task<ActionResult<BookingCreateResultDto>> CreateBookingByCustomer([FromBody] CreateBookingByCustomerDto request)
    {
        try
        {
            var result = new BookingCreateResultDto();
            
            using (var command = _context.Database.GetDbConnection().CreateCommand())
            {
                command.CommandText = "usp_CreateBookingByCustomer";
                command.CommandType = CommandType.StoredProcedure;
                
                command.Parameters.Add(new SqlParameter("@CustomerID", request.CustomerId));
                command.Parameters.Add(new SqlParameter("@PetID", request.PetId));
                command.Parameters.Add(new SqlParameter("@BookingDate", request.BookingDate));
                command.Parameters.Add(new SqlParameter("@BookingType", request.BookingType));
                
                // Add optional BranchID parameter
                if (request.BranchId.HasValue)
                {
                    command.Parameters.Add(new SqlParameter("@BranchID", request.BranchId.Value));
                }
                else
                {
                    command.Parameters.Add(new SqlParameter("@BranchID", DBNull.Value));
                }
                
                await _context.Database.OpenConnectionAsync();
                
                using (var reader = await command.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        result.NewBookingId = reader.GetInt32(0);
                    }
                }
            }
            
            return CreatedAtAction(nameof(CreateBookingByCustomer), new { id = result.NewBookingId }, result);
        }
        catch (SqlException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}

#region DTOs

/// <summary>
/// Request DTO for creating booking by staff.
/// </summary>
public class CreateBookingByStaffDto
{
    /// <summary>Customer ID</summary>
    public int CustomerId { get; set; }
    /// <summary>Pet ID</summary>
    public int PetId { get; set; }
    /// <summary>Booking date and time</summary>
    public DateTime BookingDate { get; set; }
    /// <summary>
    /// Booking type: 'CheckHealth' or 'Vaccination'
    /// </summary>
    public string BookingType { get; set; } = string.Empty;
    /// <summary>Staff ID creating the booking</summary>
    public int StaffId { get; set; }
}

/// <summary>
/// Request DTO for creating booking by customer.
/// </summary>
public class CreateBookingByCustomerDto
{
    /// <summary>Customer ID</summary>
    public int CustomerId { get; set; }
    /// <summary>Pet ID</summary>
    public int PetId { get; set; }
    /// <summary>Booking date and time</summary>
    public DateTime BookingDate { get; set; }
    /// <summary>
    /// Booking type: 'CheckHealth' or 'Vaccination'
    /// </summary>
    public string BookingType { get; set; } = string.Empty;
    /// <summary>Optional: Branch ID where booking should be created. If not provided, uses customer's last invoiced branch.</summary>
    public int? BranchId { get; set; }
}

/// <summary>
/// Result DTO for booking creation.
/// </summary>
public class BookingCreateResultDto
{
    /// <summary>ID of the newly created booking</summary>
    public int NewBookingId { get; set; }
}

#endregion
