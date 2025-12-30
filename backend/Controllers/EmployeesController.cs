using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;
using PetCareX.Api.Data;
using PetCareX.Api.Models;
using PetCareX.Api.Dtos;
using AutoMapper;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace PetCareX.Api.Controllers;

/// <summary>
/// API endpoints for managing employees.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class EmployeesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    /// <summary>
    /// Initializes a new instance of <see cref="EmployeesController"/>.
    /// </summary>
    public EmployeesController(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    /// <summary>
    /// Returns all employees.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<EmployeeDto>>> Get()
    {
        var list = await _context.Employees.ToListAsync();
        return _mapper.Map<List<EmployeeDto>>(list);
    }

    /// <summary>
    /// Gets an employee by id.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<EmployeeDto>> Get(int id)
    {
        var e = await _context.Employees.FindAsync(id);
        if (e == null) return NotFound();
        return _mapper.Map<EmployeeDto>(e);
    }

    /// <summary>
    /// Creates an employee.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<EmployeeDto>> Post(EmployeeDto dto)
    {
        var entity = _mapper.Map<Employee>(dto);
        _context.Employees.Add(entity);
        await _context.SaveChangesAsync();
        var result = _mapper.Map<EmployeeDto>(entity);
        return CreatedAtAction(nameof(Get), new { id = entity.EmployeeId }, result);
    }

    /// <summary>
    /// Updates an employee.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, EmployeeDto dto)
    {
        if (id != dto.EmployeeId) return BadRequest();
        var entity = _mapper.Map<Employee>(dto);
        _context.Entry(entity).State = EntityState.Modified;
        try { await _context.SaveChangesAsync(); }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Employees.Any(x => x.EmployeeId == id)) return NotFound();
            throw;
        }
        return NoContent();
    }

    /// <summary>
    /// Deletes an employee.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var e = await _context.Employees.FindAsync(id);
        if (e == null) return NotFound();
        _context.Employees.Remove(e);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>
    /// Finds available doctors at a branch for a specific time slot.
    /// </summary>
    /// <param name="branchId">Branch ID</param>
    /// <param name="requestedDateTime">Requested date and time</param>
    /// <param name="durationMinutes">Duration in minutes (default: 30)</param>
    /// <returns>List of available doctors</returns>
    [HttpGet("available-doctors")]
    public async Task<ActionResult<List<AvailableDoctorDto>>> FindAvailableDoctors(
        [FromQuery] int branchId,
        [FromQuery] DateTime requestedDateTime,
        [FromQuery] int durationMinutes = 30)
    {
        var results = new List<AvailableDoctorDto>();
        
        using (var command = _context.Database.GetDbConnection().CreateCommand())
        {
            command.CommandText = "usp_FindAvailableDoctors";
            command.CommandType = CommandType.StoredProcedure;
            
            command.Parameters.Add(new SqlParameter("@BranchID", branchId));
            command.Parameters.Add(new SqlParameter("@RequestedDateTime", requestedDateTime));
            command.Parameters.Add(new SqlParameter("@DurationMinutes", durationMinutes));
            
            await _context.Database.OpenConnectionAsync();
            
            using (var reader = await command.ExecuteReaderAsync())
            {
                while (await reader.ReadAsync())
                {
                    results.Add(new AvailableDoctorDto
                    {
                        DoctorId = reader.GetInt32(0),
                        DoctorName = reader.GetString(1)
                    });
                }
            }
        }
        
        return results;
    }

    /// <summary>
    /// Gets a doctor's schedule for a specific date.
    /// </summary>
    /// <param name="id">Doctor ID</param>
    /// <param name="date">Date to check schedule</param>
    /// <returns>Doctor's schedule</returns>
    [HttpGet("{id}/schedule")]
    public async Task<ActionResult<List<DoctorScheduleDto>>> GetDoctorScheduleByDate(int id, [FromQuery] DateTime date)
    {
        var results = new List<DoctorScheduleDto>();
        
        using (var command = _context.Database.GetDbConnection().CreateCommand())
        {
            command.CommandText = "usp_GetDoctorScheduleByDate";
            command.CommandType = CommandType.StoredProcedure;
            
            command.Parameters.Add(new SqlParameter("@DoctorID", id));
            command.Parameters.Add(new SqlParameter("@Date", date.Date));
            
            await _context.Database.OpenConnectionAsync();
            
            using (var reader = await command.ExecuteReaderAsync())
            {
                while (await reader.ReadAsync())
                {
                    results.Add(new DoctorScheduleDto
                    {
                        AppointmentTime = reader.GetDateTime(0),
                        PetName = reader.GetString(1),
                        Activity = reader.GetString(2)
                    });
                }
            }
        }
        
        return results;
    }
}

#region DTOs

/// <summary>
/// Available doctor DTO.
/// </summary>
public class AvailableDoctorDto
{
    /// <summary>Doctor ID</summary>
    public int DoctorId { get; set; }
    /// <summary>Doctor name</summary>
    public string DoctorName { get; set; } = string.Empty;
}

/// <summary>
/// Doctor schedule entry DTO.
/// </summary>
public class DoctorScheduleDto
{
    /// <summary>Appointment time</summary>
    public DateTime AppointmentTime { get; set; }
    /// <summary>Pet name</summary>
    public string PetName { get; set; } = string.Empty;
    /// <summary>Activity type</summary>
    public string Activity { get; set; } = string.Empty;
}

#endregion
