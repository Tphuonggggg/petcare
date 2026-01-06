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
/// API endpoints for pet health checks.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class CheckHealthsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    /// <summary>
    /// Initializes a new instance of <see cref="CheckHealthsController"/>.
    /// </summary>
    public CheckHealthsController(ApplicationDbContext context, IMapper mapper) { _context = context; _mapper = mapper; }

    /// <summary>
    /// Returns all health check records.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CheckHealthDto>>> Get()
    {
        var list = await _context.CheckHealths.ToListAsync();
        return _mapper.Map<List<CheckHealthDto>>(list);
    }

    /// <summary>
    /// Gets a health check record by id.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<CheckHealthDto>> Get(int id)
    {
        var e = await _context.CheckHealths.FindAsync(id);
        if (e == null) return NotFound();
        return _mapper.Map<CheckHealthDto>(e);
    }

    /// <summary>
    /// Creates a health check record.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<CheckHealthDto>> Post(CheckHealthDto dto)
    {
        // Validate PetId exists
        if (!await _context.Pets.AnyAsync(p => p.PetId == dto.PetId))
            return BadRequest(new { error = $"Pet with ID {dto.PetId} not found" });

        var entity = _mapper.Map<CheckHealth>(dto);
        _context.CheckHealths.Add(entity);
        await _context.SaveChangesAsync();
        var result = _mapper.Map<CheckHealthDto>(entity);
        return CreatedAtAction(nameof(Get), new { id = entity.CheckId }, result);
    }

    /// <summary>
    /// Updates a health check record.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, CheckHealthDto dto)
    {
        if (id != dto.CheckId) return BadRequest();
        var entity = _mapper.Map<CheckHealth>(dto);
        _context.Entry(entity).State = EntityState.Modified;
        try { await _context.SaveChangesAsync(); }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.CheckHealths.Any(x => x.CheckId == id)) return NotFound();
            throw;
        }
        return NoContent();
    }

    /// <summary>
    /// Deletes a health check record.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var e = await _context.CheckHealths.FindAsync(id);
        if (e == null) return NotFound();
        _context.CheckHealths.Remove(e);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>
    /// Creates a new health check record using stored procedure (for doctors).
    /// </summary>
    /// <param name="request">Health check creation request</param>
    /// <returns>New check ID</returns>
    [HttpPost("create-by-doctor")]
    public async Task<ActionResult<CheckHealthCreateResultDto>> CreateCheckHealthByDoctor([FromBody] CreateCheckHealthDto request)
    {
        try
        {
            var result = new CheckHealthCreateResultDto();
            
            using (var command = _context.Database.GetDbConnection().CreateCommand())
            {
                command.CommandText = "usp_CheckHealth_Create";
                command.CommandType = CommandType.StoredProcedure;
                
                command.Parameters.Add(new SqlParameter("@PetID", request.PetId));
                command.Parameters.Add(new SqlParameter("@DoctorID", request.DoctorId));
                command.Parameters.Add(new SqlParameter("@Symptoms", request.Symptoms));
                command.Parameters.Add(new SqlParameter("@Diagnosis", 
                    (object?)request.Diagnosis ?? DBNull.Value));
                command.Parameters.Add(new SqlParameter("@Prescription", 
                    (object?)request.Prescription ?? DBNull.Value));
                command.Parameters.Add(new SqlParameter("@FollowUpDate", 
                    request.FollowUpDate.HasValue ? (object)request.FollowUpDate.Value : DBNull.Value));
                
                await _context.Database.OpenConnectionAsync();
                
                using (var reader = await command.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        result.NewCheckId = reader.GetInt32(0);
                    }
                }
            }
            
            return CreatedAtAction(nameof(Get), new { id = result.NewCheckId }, result);
        }
        catch (SqlException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}

#region DTOs

/// <summary>
/// Request DTO for creating health check by doctor.
/// </summary>
public class CreateCheckHealthDto
{
    /// <summary>Pet ID</summary>
    public int PetId { get; set; }
    /// <summary>Doctor ID</summary>
    public int DoctorId { get; set; }
    /// <summary>Symptoms observed</summary>
    public string Symptoms { get; set; } = string.Empty;
    /// <summary>Diagnosis</summary>
    public string? Diagnosis { get; set; }
    /// <summary>Prescription</summary>
    public string? Prescription { get; set; }
    /// <summary>Follow-up date</summary>
    public DateTime? FollowUpDate { get; set; }
}

/// <summary>
/// Result DTO for health check creation.
/// </summary>
public class CheckHealthCreateResultDto
{
    /// <summary>ID of the newly created health check</summary>
    public int NewCheckId { get; set; }
}

#endregion
