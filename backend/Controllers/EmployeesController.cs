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
    /// Returns employees, optionally filtered by branch and search term, with pagination.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PaginatedResult<EmployeeDto>>> Get(
        [FromQuery] int? branchId = null,
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var q = _context.Employees
            .Include(e => e.Branch)
            .Include(e => e.Position)
            .AsQueryable();
        
        // Filter by branch if provided
        if (branchId.HasValue)
        {
            q = q.Where(e => e.BranchId == branchId.Value);
        }
        
        // Filter by search term if provided
        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLower();
            q = q.Where(e => 
                e.FullName.ToLower().Contains(searchLower) ||
                e.Gender.ToLower().Contains(searchLower) ||
                e.Position.Name.ToLower().Contains(searchLower)
            );
        }
        
        var totalCount = await q.CountAsync();
        var list = await q
            .OrderBy(e => e.EmployeeId)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
        
        var items = _mapper.Map<List<EmployeeDto>>(list);
        return Ok(new PaginatedResult<EmployeeDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        });
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
        
        try
        {
            _context.Employees.Add(entity);
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex) when (ex.InnerException?.Message.Contains("trigger") == true)
        {
            // SQL Server with triggers cannot use OUTPUT clause
            // Use raw SQL insert and get the identity value back
            _context.ChangeTracker.Clear();
            
            using (var command = _context.Database.GetDbConnection().CreateCommand())
            {
                command.CommandText = @"
                    INSERT INTO [Employee] (BranchID, PositionID, FullName, BirthDate, Gender, HireDate, BaseSalary)
                    VALUES (@BranchId, @PositionId, @FullName, @BirthDate, @Gender, @HireDate, @BaseSalary);
                    SELECT SCOPE_IDENTITY() as NewId";
                
                command.Parameters.Add(new SqlParameter("@BranchId", entity.BranchId));
                command.Parameters.Add(new SqlParameter("@PositionId", entity.PositionId));
                command.Parameters.Add(new SqlParameter("@FullName", entity.FullName));
                command.Parameters.Add(new SqlParameter("@BirthDate", entity.BirthDate));
                command.Parameters.Add(new SqlParameter("@Gender", entity.Gender));
                command.Parameters.Add(new SqlParameter("@HireDate", entity.HireDate));
                command.Parameters.Add(new SqlParameter("@BaseSalary", entity.BaseSalary));
                
                if (command.Connection?.State == System.Data.ConnectionState.Closed)
                    command.Connection?.Open();
                
                var result = await command.ExecuteScalarAsync();
                if (result != null && decimal.TryParse(result.ToString(), out var id))
                {
                    entity.EmployeeId = (int)id;
                }
            }
        }
        
        var result_dto = _mapper.Map<EmployeeDto>(entity);
        return CreatedAtAction(nameof(Get), new { id = entity.EmployeeId }, result_dto);
    }

    /// <summary>
    /// Updates an employee.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, EmployeeDto dto)
    {
        var entity = await _context.Employees.FindAsync(id);
        if (entity == null) return NotFound();
        
        // Update only provided fields
        if (!string.IsNullOrWhiteSpace(dto.FullName))
            entity.FullName = dto.FullName;
        
        if (dto.BirthDate.HasValue)
            entity.BirthDate = dto.BirthDate.Value;
        
        if (!string.IsNullOrWhiteSpace(dto.Gender))
            entity.Gender = dto.Gender;
        
        if (dto.HireDate.HasValue)
            entity.HireDate = dto.HireDate.Value;
        
        if (dto.BaseSalary.HasValue)
            entity.BaseSalary = dto.BaseSalary.Value;
        
        if (dto.BranchId.HasValue)
            entity.BranchId = dto.BranchId.Value;
        
        if (dto.PositionId.HasValue)
            entity.PositionId = dto.PositionId.Value;
        
        try
        {
            await _context.SaveChangesAsync();
        }
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
        
        try
        {
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
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message, innerException = ex.InnerException?.Message });
        }
        
        return results;
    }

    /// <summary>
    /// Debug endpoint to check doctor's all schedule records.
    /// </summary>
    [HttpGet("{id}/schedule-all")]
    public async Task<ActionResult> GetDoctorScheduleAll(int id)
    {
        try
        {
            var checkHealthRecords = await _context.CheckHealths
                .Where(ch => ch.DoctorId == id)
                .Include(ch => ch.Pet)
                .Select(ch => new
                {
                    Type = "Examination",
                    DoctorID = ch.DoctorId,
                    PetName = ch.Pet.Name,
                    CheckDate = ch.CheckDate
                })
                .ToListAsync();

            var vaccineRecords = await _context.VaccineRecords
                .Where(vr => vr.DoctorId == id)
                .Include(vr => vr.Pet)
                .Select(vr => new
                {
                    Type = "Vaccination",
                    DoctorID = vr.DoctorId,
                    PetName = vr.Pet.Name,
                    DateAdministered = vr.DateAdministered
                })
                .ToListAsync();

            return Ok(new
            {
                doctorId = id,
                totalCheckHealth = checkHealthRecords.Count,
                totalVaccineRecords = vaccineRecords.Count,
                checkHealthRecords = checkHealthRecords.Take(10),
                vaccineRecords = vaccineRecords.Take(10)
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
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
